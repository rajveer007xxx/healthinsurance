from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from datetime import datetime, timedelta
from app.utils.timezone import get_ist_now
import io
import zipfile
import random
from app.core.database import get_db
from app.models.models import Invoice, Customer, User, Settings
from app.schemas.schemas import InvoiceCreate, Invoice as InvoiceSchema
from app.routers.auth import get_current_user

router = APIRouter()

try:
    from app.utils.pdf_generator import generate_invoice_pdf
    from app.utils.email_sender import send_invoice_email
    PDF_AVAILABLE = True
except ImportError:
    PDF_AVAILABLE = False
    print("Warning: PDF generation not available. Install reportlab to enable.")

@router.post("/", response_model=InvoiceSchema)
def create_invoice(invoice_data: InvoiceCreate, db: Session = Depends(get_db)):
    # Calculate total amount
    total_amount = (
        invoice_data.bill_amount +
        invoice_data.cgst_tax +
        invoice_data.sgst_tax +
        invoice_data.igst_tax +
        invoice_data.installation_charges -
        invoice_data.discount
    )
    
    # Generate invoice number
    from app.utils.invoice_utils import generate_invoice_number
    invoice_number = generate_invoice_number(db, prefix="ADB", digits=8)
    
    new_invoice = Invoice(
        invoice_number=invoice_number,
        customer_id=invoice_data.customer_id,
        bill_amount=invoice_data.bill_amount,
        cgst_tax=invoice_data.cgst_tax,
        sgst_tax=invoice_data.sgst_tax,
        igst_tax=invoice_data.igst_tax,
        installation_charges=invoice_data.installation_charges,
        discount=invoice_data.discount,
        total_amount=total_amount,
        paid_amount=0.0,
        balance_amount=total_amount,
        billing_period_start=invoice_data.billing_period_start,
        billing_period_end=invoice_data.billing_period_end,
        due_date=invoice_data.due_date,
        status="DRAFT"
    )
    
    db.add(new_invoice)
    db.commit()
    db.refresh(new_invoice)
    return new_invoice

@router.get("/", response_model=List[InvoiceSchema])
def get_invoices(
    skip: int = 0,
    limit: int = 100,
    customer_id: Optional[int] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Invoice).join(Customer)
    
    if current_user.role == "SUPERADMIN":
        pass
    elif current_user.role == "ADMIN":
        if current_user.company_id:
            query = query.filter(Customer.company_id == current_user.company_id)
        else:
            query = query.filter(Customer.created_by == current_user.id)
    elif current_user.role == "EMPLOYEE":
        if current_user.company_id:
            query = query.filter(Customer.company_id == current_user.company_id)
        else:
            query = query.filter(Customer.created_by == current_user.id)
    
    if customer_id:
        query = query.filter(Invoice.customer_id == customer_id)
    if status:
        query = query.filter(Invoice.status == status)
    
    invoices = query.offset(skip).limit(limit).all()
    return invoices

@router.get("/sent-list")
def get_sent_invoices(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all sent invoices with customer details"""
    query = db.query(Invoice).join(Customer)
    
    if current_user.role == "SUPERADMIN":
        pass
    elif current_user.role == "ADMIN":
        if current_user.company_id:
            query = query.filter(Customer.company_id == current_user.company_id)
        else:
            query = query.filter(Customer.created_by == current_user.id)
    elif current_user.role == "EMPLOYEE":
        if current_user.company_id:
            query = query.filter(Customer.company_id == current_user.company_id)
        else:
            query = query.filter(Customer.created_by == current_user.id)
    
    invoices = query.order_by(Invoice.created_at.desc()).all()
    
    result = []
    for invoice in invoices:
        service_type = None
        if invoice.customer.service_type:
            service_type = invoice.customer.service_type.value if hasattr(invoice.customer.service_type, 'value') else invoice.customer.service_type
        
        status = invoice.status.value if hasattr(invoice.status, 'value') else invoice.status
        
        locality_name = None
        locality_id = None
        if invoice.customer.locality:
            locality_name = invoice.customer.locality.name
            locality_id = invoice.customer.locality.id
        
        result.append({
            "id": invoice.id,
            "invoice_number": invoice.invoice_number,
            "customer_id": invoice.customer_id,
            "customer": {
                "customer_id": invoice.customer.customer_id,
                "full_name": invoice.customer.full_name,
                "service_type": service_type,
                "locality_id": locality_id,
                "locality_name": locality_name
            },
            "invoice_date": invoice.invoice_date.isoformat(),
            "total_amount": invoice.total_amount,
            "balance_amount": invoice.balance_amount,
            "status": status,
            "sent_type": invoice.sent_type or "MANUAL",
            "remarks": invoice.remarks,
            "created_at": invoice.created_at.isoformat()
        })
    
    return result

@router.get("/{invoice_id}", response_model=InvoiceSchema)
def get_invoice(
    invoice_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    invoice = db.query(Invoice).join(Customer).filter(
        Invoice.id == invoice_id,
        Customer.created_by == current_user.id
    ).first()
    if not invoice:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invoice not found"
        )
    return invoice

@router.put("/{invoice_id}/status")
def update_invoice_status(invoice_id: int, status: str, db: Session = Depends(get_db)):
    invoice = db.query(Invoice).filter(Invoice.id == invoice_id).first()
    if not invoice:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invoice not found"
        )
    
    invoice.status = status
    if status == "SENT":
        invoice.sent_at = get_ist_now()
    
    db.commit()
    db.refresh(invoice)
    return invoice

@router.delete("/{invoice_id}")
def delete_invoice(invoice_id: int, db: Session = Depends(get_db)):
    invoice = db.query(Invoice).filter(Invoice.id == invoice_id).first()
    if not invoice:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invoice not found"
        )
    
    db.delete(invoice)
    db.commit()
    return {"message": "Invoice deleted successfully"}

@router.post("/renew")
def renew_subscription(renewal_data: dict, db: Session = Depends(get_db)):
    customer_id = renewal_data.get('customer_id')
    renewal_period = renewal_data.get('renewal_period', 1)
    amount = renewal_data.get('amount')
    start_date_str = renewal_data.get('start_date')
    send_invoice = renewal_data.get('send_invoice', True)
    
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Customer not found"
        )
    
    old_start_date = customer.start_date
    old_end_date = customer.end_date
    
    print(f"DEBUG: Customer {customer.customer_id} renewal")
    print(f"DEBUG: renewal_period = {renewal_period}")
    print(f"DEBUG: old_start_date = {old_start_date}")
    print(f"DEBUG: old_end_date = {old_end_date}")
    print(f"DEBUG: billing_type = {customer.billing_type.value if customer.billing_type else 'None'}")
    
    if start_date_str:
        start_date = datetime.fromisoformat(start_date_str.replace('Z', '+00:00'))
        customer.start_date = start_date
    else:
        start_date = get_ist_now()
        customer.start_date = start_date
    
    import calendar
    if start_date.day == 1:
        year = start_date.year
        month = start_date.month + renewal_period
        while month > 12:
            month -= 12
            year += 1
        last_day = calendar.monthrange(year, month)[1]
        new_end_date = start_date.replace(year=year, month=month, day=last_day)
    else:
        year = start_date.year
        month = start_date.month + renewal_period
        while month > 12:
            month -= 12
            year += 1
        target_day = start_date.day - 1
        if target_day == 0:
            if month == 1:
                month = 12
                year -= 1
            else:
                month -= 1
            target_day = calendar.monthrange(year, month)[1]
        else:
            max_day = calendar.monthrange(year, month)[1]
            if target_day > max_day:
                target_day = max_day
        new_end_date = start_date.replace(year=year, month=month, day=target_day)
    
    print(f"DEBUG: new_start_date (for customer) = {start_date}")
    print(f"DEBUG: new_end_date (for customer) = {new_end_date}")
    
    settings = db.query(Settings).filter(Settings.user_id == customer.created_by).first()
    if not settings:
        settings = db.query(Settings).first()
    
    # Generate unique 8-digit invoice number with ADB prefix
    from app.utils.invoice_utils import generate_invoice_number
    invoice_number = generate_invoice_number(db, prefix="ADB", digits=8)
    
    if customer.billing_type and customer.billing_type.value == "POSTPAID":
        if old_end_date:
            # For postpaid, calculate the PAST period based on renewal_period
            billing_period_end = old_end_date
            # Calculate start date by going back renewal_period months from end date
            year = old_end_date.year
            month = old_end_date.month - renewal_period
            while month <= 0:
                month += 12
                year -= 1
            billing_period_start = old_end_date.replace(year=year, month=month) + timedelta(days=1)
        else:
            billing_period_start = start_date
            billing_period_end = new_end_date
        
        print(f"DEBUG: POSTPAID billing period: {billing_period_start} to {billing_period_end}")
    else:
        billing_period_start = start_date
        billing_period_end = new_end_date
        print(f"DEBUG: PREPAID billing period: {billing_period_start} to {billing_period_end}")
    
    # Calculate previous balance BEFORE making any changes (for invoice display)
    previous_balance_for_invoice = db.query(func.sum(Invoice.balance_amount)).filter(
        Invoice.customer_id == customer_id
    ).scalar() or 0.0
    
    unpaid_invoices = db.query(Invoice).filter(
        Invoice.customer_id == customer_id,
        Invoice.balance_amount > 0
    ).order_by(Invoice.invoice_date.asc()).all()
    
    unpaid_invoice_numbers = [inv.invoice_number for inv in unpaid_invoices]
    
    existing_credit = db.query(func.sum(Invoice.balance_amount)).filter(
        Invoice.customer_id == customer_id,
        Invoice.balance_amount < 0
    ).scalar() or 0.0
    
    if existing_credit < 0:
        credit_invoices = db.query(Invoice).filter(
            Invoice.customer_id == customer_id,
            Invoice.balance_amount < 0
        ).all()
        for inv in credit_invoices:
            inv.balance_amount = 0
            inv.status = "PAID"
    
    from app.models.models import Plan
    plan = db.query(Plan).filter(Plan.id == customer.plan_id).first()
    plan_amount = 0
    cgst_tax = 0
    sgst_tax = 0
    igst_tax = 0
    if plan:
        plan_amount = round(plan.price * renewal_period)
        cgst_tax = round(plan_amount * (plan.cgst_percentage / 100)) if plan.cgst_percentage else 0
        sgst_tax = round(plan_amount * (plan.sgst_percentage / 100)) if plan.sgst_percentage else 0
        igst_tax = round(plan_amount * (plan.igst_percentage / 100)) if plan.igst_percentage else 0
    
    total_with_tax = round(plan_amount + cgst_tax + sgst_tax + igst_tax)
    
    # Calculate adjusted amount using the correct total_with_tax (not the amount parameter)
    adjusted_amount = round(total_with_tax + existing_credit, 2)
    
    new_invoice = Invoice(
        invoice_number=invoice_number,
        customer_id=customer_id,
        bill_amount=plan_amount,
        cgst_tax=cgst_tax,
        sgst_tax=sgst_tax,
        igst_tax=igst_tax,
        installation_charges=0,
        discount=0,
        total_amount=total_with_tax,
        paid_amount=0 if adjusted_amount > 0 else round(abs(adjusted_amount)),
        balance_amount=round(max(adjusted_amount, 0)),
        billing_period_start=billing_period_start,
        billing_period_end=billing_period_end,
        due_date=new_end_date,
        status="SENT",
        sent_at=get_ist_now()
    )
    
    db.add(new_invoice)
    
    customer.end_date = new_end_date
    
    db.commit()
    db.refresh(new_invoice)
    db.refresh(customer)
    
    from app.models.models import Transaction, AddonBill
    
    invoice_balance = db.query(func.sum(Invoice.balance_amount)).filter(
        Invoice.customer_id == customer_id
    ).scalar() or 0.0
    
    addon_balance = db.query(func.sum(AddonBill.balance_amount)).filter(
        AddonBill.customer_id == customer_id
    ).scalar() or 0.0
    
    total_customer_balance_after = round(invoice_balance + addon_balance, 2)
    
    renewal_type = "Manual renewal" if send_invoice else "Renewal without invoice"
    description = f"{renewal_type} for {renewal_period} month(s)"
    
    transaction_id = f"TXN{int(get_ist_now().timestamp() * 1000)}"
    
    new_transaction = Transaction(
        transaction_id=transaction_id,
        customer_id=customer_id,
        collected_by=customer.created_by,
        transaction_type="RENEWAL",
        amount=total_with_tax,
        balance_after=total_customer_balance_after,
        description=description,
        transaction_date=get_ist_now()
    )
    db.add(new_transaction)
    db.commit()
    db.refresh(new_transaction)
    
    # Calculate total balance from all invoices for this customer (including negative balances)
    total_customer_balance = db.query(func.sum(Invoice.balance_amount)).filter(
        Invoice.customer_id == customer_id
    ).scalar() or 0.0
    
    pdf_generated = False
    email_sent = False
    
    if send_invoice and PDF_AVAILABLE and customer.email:
        try:
            previous_balance = previous_balance_for_invoice
            
            # Calculate total due amount: new invoice total + previous balance
            total_due_amount = new_invoice.total_amount + previous_balance
            
            invoice_dict = {
                'invoice_number': new_invoice.invoice_number,
                'invoice_date': new_invoice.invoice_date,
                'bill_amount': new_invoice.bill_amount,
                'cgst_tax': new_invoice.cgst_tax,
                'sgst_tax': new_invoice.sgst_tax,
                'igst_tax': new_invoice.igst_tax,
                'discount': new_invoice.discount,
                'total_amount': new_invoice.total_amount,
                'paid_amount': new_invoice.paid_amount,
                'balance_amount': total_due_amount,
                'previous_balance': previous_balance,
                'billing_period_start': new_invoice.billing_period_start,
                'billing_period_end': new_invoice.billing_period_end,
                'due_date': new_invoice.due_date,
                'plan_name': plan.name if plan else 'Broadband Service',
                'unpaid_invoice_numbers': unpaid_invoice_numbers
            }
            
            customer_dict = {
                'full_name': customer.full_name,
                'customer_id': customer.customer_id,
                'mobile': customer.mobile,
                'address': customer.address,
                'email': customer.email,
                'customer_gst_no': customer.customer_gst_no or '',
                'state': customer.state or '',
                'customer_state_code': customer.customer_state_code or '',
                'gst_invoice_needed': customer.gst_invoice_needed or False,
                'billing_type': customer.billing_type.value if customer.billing_type else 'PREPAID'
            }
            
            user_settings = db.query(Settings).filter(Settings.user_id == customer.created_by).first()
            
            if user_settings:
                company_dict = {
                    'name': user_settings.company_name or 'ISP Billing Services',
                    'address': user_settings.company_address or 'India',
                    'phone': user_settings.company_phone or '+91-XXXXXXXXXX',
                    'email': user_settings.company_email or 'support@ispbilling.in',
                    'gstin': user_settings.company_gst or 'N/A',
                    'state': user_settings.company_state or '',
                    'code': user_settings.company_code or '',
                    'bank_name': user_settings.bank_name or 'N/A',
                    'account_number': user_settings.account_number or 'N/A',
                    'ifsc_code': user_settings.branch_ifsc or 'N/A',
                    'declaration': user_settings.declaration or 'Thanks for your business. Hope you are enjoying our services.',
                    'terms_and_conditions': user_settings.terms_and_conditions or '1. Kindly Pay Your Total Due Amount Before/Till Due Date to Avoid Late Payment Charges.<br/>2. Cheque Bounce Penalty will be 500 Rupees Per Cheque.<br/>3. No Refund will be made after Payment Submission.<br/>4. No Refund will be made if User Paid Annual subscription.'
                }
            else:
                company_dict = {
                    'name': 'ISP Billing Services',
                    'address': 'India',
                    'phone': '+91-XXXXXXXXXX',
                    'email': 'support@ispbilling.in',
                    'gstin': 'N/A',
                    'state': '',
                    'code': '',
                    'bank_name': 'N/A',
                    'account_number': 'N/A',
                    'ifsc_code': 'N/A',
                    'declaration': 'Thanks for your business. Hope you are enjoying our services.',
                    'terms_and_conditions': '1. Kindly Pay Your Total Due Amount Before/Till Due Date to Avoid Late Payment Charges.<br/>2. Cheque Bounce Penalty will be 500 Rupees Per Cheque.<br/>3. No Refund will be made after Payment Submission.<br/>4. No Refund will be made if User Paid Annual subscription.'
                }
            
            pdf_buffer = generate_invoice_pdf(invoice_dict, customer_dict, company_dict)
            pdf_generated = True
            
            email_sent = send_invoice_email(
                to_email=customer.email,
                customer_name=customer.full_name,
                customer_id=customer.customer_id,
                invoice_number=new_invoice.invoice_number,
                pdf_buffer=pdf_buffer,
                company_name=company_dict['name'],
                company_mobile=company_dict['phone'],
                company_address=company_dict['address'],
                smtp_host='smtp.hostinger.com',
                smtp_port=465,
                smtp_user='billing@ispbilling.in',
                smtp_password='Login@121212'
            )
        except Exception as e:
            print(f"Error generating/sending invoice: {str(e)}")
    
    return {
        "message": "Subscription renewed successfully",
        "invoice": new_invoice,
        "customer": customer,
        "pdf_generated": pdf_generated,
        "email_sent": email_sent
    }

@router.get("/{invoice_id}/download")
def download_invoice_pdf(
    invoice_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Download invoice as PDF"""
    invoice = db.query(Invoice).join(Customer).filter(
        Invoice.id == invoice_id,
        Customer.created_by == current_user.id
    ).first()
    
    if not invoice:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invoice not found"
        )
    
    if not PDF_AVAILABLE:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="PDF generation not available"
        )
    
    customer = invoice.customer
    from app.models.models import Plan, Settings
    plan = db.query(Plan).filter(Plan.id == customer.plan_id).first()
    
    # Calculate previous balance (sum of all invoices before this one)
    previous_invoices = db.query(Invoice).filter(
        Invoice.customer_id == customer.id,
        Invoice.id < invoice.id
    ).all()
    previous_balance = sum(inv.balance_amount for inv in previous_invoices)
    
    # Calculate total due amount (current invoice + previous balance)
    total_due_amount = invoice.total_amount + previous_balance
    
    invoice_dict = {
        'invoice_number': invoice.invoice_number,
        'invoice_date': invoice.invoice_date,
        'due_date': invoice.due_date,
        'bill_amount': invoice.bill_amount,
        'cgst_tax': invoice.cgst_tax,
        'sgst_tax': invoice.sgst_tax,
        'igst_tax': invoice.igst_tax,
        'discount': invoice.discount,
        'total_amount': invoice.total_amount,
        'paid_amount': invoice.paid_amount,
        'balance_amount': invoice.balance_amount,
        'previous_balance': previous_balance,
        'total_due_amount': total_due_amount,
        'billing_period_start': invoice.billing_period_start,
        'billing_period_end': invoice.billing_period_end,
        'plan_name': plan.name if plan else 'N/A',
        'plan_speed': plan.speed if plan else 'N/A'
    }
    
    customer_dict = {
        'customer_id': customer.customer_id,
        'full_name': customer.full_name,
        'email': customer.email,
        'mobile': customer.mobile,
        'address': customer.address or '',
        'city': customer.city or '',
        'state': customer.state or '',
        'pincode': customer.pincode or '',
        'customer_gst_no': customer.customer_gst_no or '',
        'customer_state_code': customer.customer_state_code or '',
        'gst_invoice_needed': customer.gst_invoice_needed or False,
        'billing_type': customer.billing_type.value if customer.billing_type else 'PREPAID'
    }
    
    user_settings = db.query(Settings).filter(Settings.user_id == customer.created_by).first()
    
    if user_settings:
        company_dict = {
            'name': user_settings.company_name or 'ISP Billing Services',
            'address': user_settings.company_address or '',
            'phone': user_settings.company_phone or '',
            'email': user_settings.company_email or 'billing@ispbilling.in',
            'gstin': user_settings.company_gst or '',
            'state': user_settings.company_state or '',
            'code': user_settings.company_code or '',
            'bank_name': user_settings.bank_name or 'N/A',
            'account_number': user_settings.account_number or 'N/A',
            'ifsc_code': user_settings.branch_ifsc or 'N/A',
            'logo_path': user_settings.company_logo if user_settings.company_logo else '',
            'declaration': user_settings.declaration or 'Thanks for your business. Hope you are enjoying our services.',
            'terms_and_conditions': user_settings.terms_and_conditions or '1. Kindly Pay Your Total Due Amount Before/Till Due Date to Avoid Late Payment Charges.<br/>2. Cheque Bounce Penalty will be 500 Rupees Per Cheque.<br/>3. No Refund will be made after Payment Submission.<br/>4. No Refund will be made if User Paid Annual subscription.'
        }
    else:
        company_dict = {
            'name': 'ISP Billing Services',
            'address': '',
            'phone': '',
            'email': 'billing@ispbilling.in',
            'gstin': '',
            'state': '',
            'code': '',
            'bank_name': 'N/A',
            'account_number': 'N/A',
            'ifsc_code': 'N/A',
            'logo_path': '',
            'declaration': 'Thanks for your business. Hope you are enjoying our services.',
            'terms_and_conditions': '1. Kindly Pay Your Total Due Amount Before/Till Due Date to Avoid Late Payment Charges.<br/>2. Cheque Bounce Penalty will be 500 Rupees Per Cheque.<br/>3. No Refund will be made after Payment Submission.<br/>4. No Refund will be made if User Paid Annual subscription.'
        }
    
    pdf_buffer = generate_invoice_pdf(invoice_dict, customer_dict, company_dict)
    pdf_buffer.seek(0)
    
    return StreamingResponse(
        pdf_buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=invoice_{invoice.invoice_number}.pdf"}
    )

@router.post("/{invoice_id}/resend")
def resend_invoice(
    invoice_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Resend invoice email"""
    invoice = db.query(Invoice).join(Customer).filter(
        Invoice.id == invoice_id,
        Customer.created_by == current_user.id
    ).first()
    
    if not invoice:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invoice not found"
        )
    
    customer = invoice.customer
    
    if not customer.email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Customer has no email address"
        )
    
    if not PDF_AVAILABLE:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="PDF generation not available"
        )
    
    from app.models.models import Plan, Settings
    plan = db.query(Plan).filter(Plan.id == customer.plan_id).first()
    
    # Calculate previous balance (sum of all invoices before this one)
    previous_invoices = db.query(Invoice).filter(
        Invoice.customer_id == customer.id,
        Invoice.id < invoice.id
    ).all()
    previous_balance = sum(inv.balance_amount for inv in previous_invoices)
    
    # Calculate total due amount (current invoice + previous balance)
    total_due_amount = invoice.total_amount + previous_balance
    
    invoice_dict = {
        'invoice_number': invoice.invoice_number,
        'invoice_date': invoice.invoice_date,
        'due_date': invoice.due_date,
        'bill_amount': invoice.bill_amount,
        'cgst_tax': invoice.cgst_tax,
        'sgst_tax': invoice.sgst_tax,
        'igst_tax': invoice.igst_tax,
        'discount': invoice.discount,
        'total_amount': invoice.total_amount,
        'paid_amount': invoice.paid_amount,
        'balance_amount': invoice.balance_amount,
        'previous_balance': previous_balance,
        'total_due_amount': total_due_amount,
        'billing_period_start': invoice.billing_period_start,
        'billing_period_end': invoice.billing_period_end,
        'plan_name': plan.name if plan else 'N/A',
        'plan_speed': plan.speed if plan else 'N/A'
    }
    
    customer_dict = {
        'customer_id': customer.customer_id,
        'full_name': customer.full_name,
        'email': customer.email,
        'mobile': customer.mobile,
        'address': customer.address or '',
        'city': customer.city or '',
        'state': customer.state or '',
        'pincode': customer.pincode or '',
        'customer_gst_no': customer.customer_gst_no or '',
        'customer_state_code': customer.customer_state_code or '',
        'gst_invoice_needed': customer.gst_invoice_needed or False,
        'billing_type': customer.billing_type.value if customer.billing_type else 'PREPAID'
    }
    
    user_settings = db.query(Settings).filter(Settings.user_id == customer.created_by).first()
    
    if user_settings:
        company_dict = {
            'name': user_settings.company_name or 'ISP Billing Services',
            'address': user_settings.company_address or '',
            'phone': user_settings.company_phone or '',
            'email': user_settings.company_email or 'billing@ispbilling.in',
            'gstin': user_settings.company_gst or '',
            'state': user_settings.company_state or '',
            'code': user_settings.company_code or '',
            'bank_name': user_settings.bank_name or 'N/A',
            'account_number': user_settings.account_number or 'N/A',
            'ifsc_code': user_settings.branch_ifsc or 'N/A',
            'logo_path': user_settings.company_logo if user_settings.company_logo else '',
            'declaration': user_settings.declaration or 'Thanks for your business. Hope you are enjoying our services.',
            'terms_and_conditions': user_settings.terms_and_conditions or '1. Kindly Pay Your Total Due Amount Before/Till Due Date to Avoid Late Payment Charges.<br/>2. Cheque Bounce Penalty will be 500 Rupees Per Cheque.<br/>3. No Refund will be made after Payment Submission.<br/>4. No Refund will be made if User Paid Annual subscription.'
        }
    else:
        company_dict = {
            'name': 'ISP Billing Services',
            'address': '',
            'phone': '',
            'email': 'billing@ispbilling.in',
            'gstin': '',
            'state': '',
            'code': '',
            'bank_name': 'N/A',
            'account_number': 'N/A',
            'ifsc_code': 'N/A',
            'logo_path': '',
            'declaration': 'Thanks for your business. Hope you are enjoying our services.',
            'terms_and_conditions': '1. Kindly Pay Your Total Due Amount Before/Till Due Date to Avoid Late Payment Charges.<br/>2. Cheque Bounce Penalty will be 500 Rupees Per Cheque.<br/>3. No Refund will be made after Payment Submission.<br/>4. No Refund will be made if User Paid Annual subscription.'
        }
    
    try:
        pdf_buffer = generate_invoice_pdf(invoice_dict, customer_dict, company_dict)
        
        email_sent = send_invoice_email(
            to_email=customer.email,
            customer_name=customer.full_name,
            customer_id=customer.customer_id,
            invoice_number=invoice.invoice_number,
            pdf_buffer=pdf_buffer,
            company_name=company_dict['name'],
            company_mobile=company_dict['phone'],
            company_address=company_dict['address'],
            smtp_host='smtp.hostinger.com',
            smtp_port=465,
            smtp_user='billing@ispbilling.in',
            smtp_password='Login@121212'
        )
        
        if email_sent:
            return {"message": "Invoice resent successfully"}
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to send email"
            )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error sending invoice: {str(e)}"
        )

@router.get("/download-month/{month}")
def download_month_invoices(
    month: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Download all invoices for a specific month as a zip file"""
    try:
        year, month_num = month.split('-')
        start_date = datetime(int(year), int(month_num), 1)
        
        if int(month_num) == 12:
            end_date = datetime(int(year) + 1, 1, 1)
        else:
            end_date = datetime(int(year), int(month_num) + 1, 1)
        
        invoices = db.query(Invoice).join(Customer).filter(
            Customer.created_by == current_user.id,
            Invoice.status == "SENT",
            Invoice.invoice_date >= start_date,
            Invoice.invoice_date < end_date
        ).all()
        
        if not invoices:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No invoices found for the selected month"
            )
        
        if not PDF_AVAILABLE:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="PDF generation not available"
            )
        
        zip_buffer = io.BytesIO()
        
        with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
            from app.models.models import Plan, Settings
            
            for invoice in invoices:
                customer = invoice.customer
                plan = db.query(Plan).filter(Plan.id == customer.plan_id).first()
                
                # Calculate previous balance (sum of all invoices before this one)
                previous_invoices = db.query(Invoice).filter(
                    Invoice.customer_id == customer.id,
                    Invoice.id < invoice.id
                ).all()
                previous_balance = sum(inv.balance_amount for inv in previous_invoices)
                
                # Calculate total due amount (current invoice + previous balance)
                total_due_amount = invoice.total_amount + previous_balance
                
                invoice_dict = {
                    'invoice_number': invoice.invoice_number,
                    'invoice_date': invoice.invoice_date,
                    'due_date': invoice.due_date,
                    'bill_amount': invoice.bill_amount,
                    'cgst_tax': invoice.cgst_tax,
                    'sgst_tax': invoice.sgst_tax,
                    'igst_tax': invoice.igst_tax,
                    'discount': invoice.discount,
                    'total_amount': invoice.total_amount,
                    'paid_amount': invoice.paid_amount,
                    'balance_amount': invoice.balance_amount,
                    'previous_balance': previous_balance,
                    'total_due_amount': total_due_amount,
                    'billing_period_start': invoice.billing_period_start,
                    'billing_period_end': invoice.billing_period_end,
                    'plan_name': plan.name if plan else 'N/A',
                    'plan_speed': plan.speed if plan else 'N/A'
                }
                
                customer_dict = {
                    'customer_id': customer.customer_id,
                    'full_name': customer.full_name,
                    'email': customer.email,
                    'mobile': customer.mobile,
                    'address': customer.address or '',
                    'city': customer.city or '',
                    'state': customer.state or '',
                    'pincode': customer.pincode or '',
                    'customer_gst_no': customer.customer_gst_no or '',
                    'customer_state_code': customer.customer_state_code or '',
                    'gst_invoice_needed': customer.gst_invoice_needed or False,
                    'billing_type': customer.billing_type.value if customer.billing_type else 'PREPAID'
                }
                
                user_settings = db.query(Settings).filter(Settings.user_id == customer.created_by).first()
                
                if user_settings:
                    company_dict = {
                        'name': user_settings.company_name or 'ISP Billing Services',
                        'address': user_settings.company_address or '',
                        'phone': user_settings.company_phone or '',
                        'email': user_settings.company_email or 'billing@ispbilling.in',
                        'gstin': user_settings.company_gst or '',
                        'state': user_settings.company_state or '',
                        'code': user_settings.company_code or '',
                        'bank_name': user_settings.bank_name or 'N/A',
                        'account_number': user_settings.account_number or 'N/A',
                        'ifsc_code': user_settings.branch_ifsc or 'N/A',
                        'logo_path': user_settings.company_logo if user_settings.company_logo else '',
                        'declaration': user_settings.declaration or 'Thanks for your business. Hope you are enjoying our services.',
                        'terms_and_conditions': user_settings.terms_and_conditions or '1. Kindly Pay Your Total Due Amount Before/Till Due Date to Avoid Late Payment Charges.<br/>2. Cheque Bounce Penalty will be 500 Rupees Per Cheque.<br/>3. No Refund will be made after Payment Submission.<br/>4. No Refund will be made if User Paid Annual subscription.'
                    }
                else:
                    company_dict = {
                        'name': 'ISP Billing Services',
                        'address': '',
                        'phone': '',
                        'email': 'billing@ispbilling.in',
                        'gstin': '',
                        'state': '',
                        'code': '',
                        'bank_name': 'N/A',
                        'account_number': 'N/A',
                        'ifsc_code': 'N/A',
                        'logo_path': '',
                        'declaration': 'Thanks for your business. Hope you are enjoying our services.',
                        'terms_and_conditions': '1. Kindly Pay Your Total Due Amount Before/Till Due Date to Avoid Late Payment Charges.<br/>2. Cheque Bounce Penalty will be 500 Rupees Per Cheque.<br/>3. No Refund will be made after Payment Submission.<br/>4. No Refund will be made if User Paid Annual subscription.'
                    }
                
                try:
                    pdf_buffer = generate_invoice_pdf(invoice_dict, customer_dict, company_dict)
                    pdf_buffer.seek(0)
                    
                    filename = f"{customer.customer_id}_{invoice.invoice_number}.pdf"
                    zip_file.writestr(filename, pdf_buffer.read())
                except Exception as pdf_error:
                    print(f"Error generating PDF for invoice {invoice.invoice_number}: {str(pdf_error)}")
                    continue
        
        zip_buffer.seek(0)
        
        return StreamingResponse(
            zip_buffer,
            media_type="application/zip",
            headers={"Content-Disposition": f"attachment; filename=invoices_{month}.zip"}
        )
        
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid month format. Use YYYY-MM"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating zip file: {str(e)}"
        )

@router.post("/revert-last-renew/{customer_id}")
def revert_last_renewal(
    customer_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Customer not found"
        )
    
    last_invoice = db.query(Invoice).filter(
        Invoice.customer_id == customer_id
    ).order_by(Invoice.created_at.desc()).first()
    
    if not last_invoice:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No invoice found to revert"
        )
    
    if last_invoice.paid_amount > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot revert invoice with payments. Please refund payments first."
        )
    
    previous_invoice = db.query(Invoice).filter(
        Invoice.customer_id == customer_id,
        Invoice.id < last_invoice.id
    ).order_by(Invoice.created_at.desc()).first()
    
    if previous_invoice:
        customer.end_date = previous_invoice.billing_period_end
    else:
        customer.end_date = customer.start_date
    
    db.delete(last_invoice)
    db.commit()
    
    return {
        "message": "Last renewal reverted successfully",
        "deleted_invoice_id": last_invoice.id,
        "new_end_date": customer.end_date.isoformat() if customer.end_date else None
    }
