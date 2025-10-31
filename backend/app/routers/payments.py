from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from datetime import datetime
from app.utils.timezone import get_ist_now
from app.core.database import get_db
from app.models.models import Payment, Invoice, Transaction, Customer, User, AddonBill, Settings, RenewalCycle
from app.schemas.schemas import PaymentCreate, Payment as PaymentSchema
from app.routers.auth import get_current_user
import random
import string
import io

router = APIRouter()

def generate_payment_id() -> str:
    return 'PAY' + ''.join(random.choices(string.digits, k=12))

@router.post("/", response_model=PaymentSchema)
def create_payment(
    payment_data: dict, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    payment_id = generate_payment_id()
    
    payment_reference = payment_data.get('transaction_id') or payment_data.get('payment_reference')
    
    payment_date = get_ist_now()
    
    customer = db.query(Customer).filter(Customer.id == payment_data['customer_id']).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    current_cycle = db.query(RenewalCycle).filter(
        RenewalCycle.customer_id == customer.id,
        RenewalCycle.cycle_start <= payment_date,
        (RenewalCycle.cycle_end.is_(None)) | (RenewalCycle.cycle_end >= payment_date)
    ).first()
    
    if not current_cycle:
        current_cycle = RenewalCycle(
            customer_id=customer.id,
            cycle_start=customer.start_date or payment_date,
            cycle_end=customer.end_date
        )
        db.add(current_cycle)
        db.flush()
    
    new_payment = Payment(
        payment_id=payment_id,
        customer_id=payment_data['customer_id'],
        invoice_id=payment_data.get('invoice_id'),
        cycle_id=current_cycle.id,
        amount=payment_data['amount'],
        payment_method=payment_data['payment_method'],
        payment_reference=payment_reference,
        payment_date=payment_date,
        remarks=payment_data.get('remarks'),
        status="COMPLETED"
    )
    
    db.add(new_payment)
    
    customer_id = payment_data['customer_id']
    payment_amount = round(payment_data['amount'], 2)
    discount_amount = round(payment_data.get('discount', 0), 2)
    
    total_credit = round(payment_amount + discount_amount, 2)
    remaining_amount = total_credit
    
    unpaid_invoices = db.query(Invoice).filter(
        Invoice.customer_id == customer_id,
        Invoice.balance_amount > 0
    ).order_by(Invoice.due_date.asc()).all()
    
    for invoice in unpaid_invoices:
        if remaining_amount <= 0:
            break
        
        if remaining_amount >= invoice.balance_amount:
            remaining_amount = round(remaining_amount - invoice.balance_amount, 2)
            invoice.paid_amount = round(invoice.paid_amount + invoice.balance_amount, 2)
            invoice.balance_amount = 0
            invoice.status = "PAID"
        else:
            invoice.paid_amount = round(invoice.paid_amount + remaining_amount, 2)
            invoice.balance_amount = round(invoice.balance_amount - remaining_amount, 2)
            remaining_amount = 0
    
    if remaining_amount > 0:
        latest_invoice = db.query(Invoice).filter(
            Invoice.customer_id == customer_id
        ).order_by(Invoice.due_date.desc()).first()
        
        if latest_invoice:
            latest_invoice.balance_amount = round(latest_invoice.balance_amount - remaining_amount, 2)
            latest_invoice.paid_amount = round(latest_invoice.paid_amount + remaining_amount, 2)
    
    db.flush()
    
    invoice_balance = db.query(func.sum(Invoice.balance_amount)).filter(
        Invoice.customer_id == customer_id
    ).scalar() or 0.0
    
    addon_balance = db.query(func.sum(AddonBill.balance_amount)).filter(
        AddonBill.customer_id == customer_id
    ).scalar() or 0.0
    
    balance_after = round(invoice_balance + addon_balance, 2)
    
    transaction_id = 'TXN' + str(random.randint(10000000, 99999999))
    
    description = f"Payment via {payment_data['payment_method']}"
    if discount_amount > 0:
        description += f" (Discount: ₹{discount_amount})"
    
    new_transaction = Transaction(
        transaction_id=transaction_id,
        customer_id=payment_data['customer_id'],
        collected_by=current_user.id,
        cycle_id=current_cycle.id,
        transaction_type="PAYMENT",
        amount=-total_credit,
        balance_after=balance_after,
        description=description
    )
    db.add(new_transaction)
    
    db.commit()
    db.refresh(new_payment)
    return new_payment

@router.get("/")
def get_payments(
    skip: int = 0,
    limit: int = 100,
    customer_id: Optional[int] = None,
    received_by: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Payment).join(Customer)
    
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
        query = query.filter(Payment.customer_id == customer_id)
    
    if received_by:
        query = query.filter(Payment.received_by == received_by)
    
    payments = query.offset(skip).limit(limit).all()
    
    result = []
    for payment in payments:
        customer = db.query(Customer).filter(Customer.id == payment.customer_id).first()
        
        customer_balance = db.query(func.sum(Invoice.balance_amount)).filter(
            Invoice.customer_id == payment.customer_id
        ).scalar() or 0
        
        payment_dict = {
            'id': payment.id,
            'payment_id': payment.payment_id,
            'customer_id': payment.customer_id,
            'amount': payment.amount,
            'payment_method': payment.payment_method,
            'payment_reference': payment.payment_reference,
            'payment_date': payment.payment_date,
            'remarks': payment.remarks,
            'status': payment.status,
            'invoice_id': payment.invoice_id,
            'created_at': payment.created_at,
            'received_by': payment.received_by,
            'customer': {
                'customer_id': customer.customer_id if customer else '',
                'full_name': customer.full_name if customer else '',
                'address': customer.address if customer else '',
                'service_type': customer.service_type if customer else 'BROADBAND',
                'auto_renew': customer.auto_renew if customer else False,
                'balance': customer_balance
            }
        }
        result.append(payment_dict)
    
    return result

@router.get("/{payment_id}", response_model=PaymentSchema)
def get_payment(
    payment_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Payment).join(Customer).filter(Payment.id == payment_id)
    
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
    
    payment = query.first()
    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment not found or you don't have permission to view this payment"
        )
    return payment

@router.get("/{payment_id}/receipt")
def download_payment_receipt(
    payment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Download payment receipt as PDF with company logo"""
    from app.utils.pdf_generator import generate_receipt_pdf
    from app.utils.formatters import format_currency
    
    payment = db.query(Payment).filter(Payment.id == payment_id).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    
    customer = db.query(Customer).filter(Customer.id == payment.customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    settings = db.query(Settings).filter(Settings.user_id == customer.created_by).first()
    if not settings:
        settings = db.query(Settings).first()
    
    payment_data = {
        'payment_id': payment.payment_id,
        'amount': format_currency(payment.amount),
        'payment_method': payment.payment_method,
        'payment_reference': payment.payment_reference or 'N/A',
        'payment_date': payment.payment_date,
        'remarks': payment.remarks or ''
    }
    
    customer_data = {
        'full_name': customer.full_name,
        'customer_id': customer.customer_id,
        'mobile': customer.mobile,
        'address': customer.address or ''
    }
    
    company_data = {
        'name': settings.company_name if settings else 'ISP BILLING',
        'address': settings.company_address if settings else '',
        'phone': settings.company_phone if settings else '',
        'email': settings.company_email if settings else '',
        'logo_path': settings.company_logo if settings and settings.company_logo else ''
    }
    
    try:
        pdf_buffer = generate_receipt_pdf(payment_data, customer_data, company_data)
        
        return StreamingResponse(
            pdf_buffer,
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename=receipt_{payment.payment_id}.pdf"}
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error generating receipt PDF: {str(e)}"
        )

@router.post("/{payment_id}/resend-receipt")
def resend_payment_receipt(
    payment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Resend payment receipt to customer email"""
    from app.utils.pdf_generator import generate_receipt_pdf
    from app.utils.formatters import format_currency
    from app.utils.email_sender import send_invoice_email
    
    payment = db.query(Payment).filter(Payment.id == payment_id).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    
    customer = db.query(Customer).filter(Customer.id == payment.customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    if not customer.email:
        raise HTTPException(status_code=400, detail="Customer email not found")
    
    settings = db.query(Settings).filter(Settings.user_id == customer.created_by).first()
    if not settings:
        settings = db.query(Settings).first()
    
    payment_data = {
        'payment_id': payment.payment_id,
        'amount': format_currency(payment.amount),
        'payment_method': payment.payment_method,
        'payment_reference': payment.payment_reference or 'N/A',
        'payment_date': payment.payment_date,
        'remarks': payment.remarks or ''
    }
    
    customer_data = {
        'full_name': customer.full_name,
        'customer_id': customer.customer_id,
        'mobile': customer.mobile,
        'address': customer.address or ''
    }
    
    company_data = {
        'name': settings.company_name if settings else 'ISP BILLING',
        'address': settings.company_address if settings else '',
        'phone': settings.company_phone if settings else '',
        'email': settings.company_email if settings else '',
        'logo_path': settings.company_logo if settings and settings.company_logo else ''
    }
    
    try:
        pdf_buffer = generate_receipt_pdf(payment_data, customer_data, company_data)
        
        success = send_invoice_email(
            to_email=customer.email,
            customer_name=customer.full_name,
            customer_id=customer.customer_id,
            invoice_number=payment.payment_id,
            pdf_buffer=pdf_buffer,
            company_name=company_data['name'],
            company_mobile=company_data['phone'],
            company_address=company_data['address'],
            smtp_host="smtp.hostinger.com",
            smtp_port=465,
            smtp_user="no-reply@autoispbilling.com",
            smtp_password="Login@121212"
        )
        
        if success:
            return {"message": "Receipt sent successfully", "email": customer.email}
        else:
            raise HTTPException(status_code=500, detail="Failed to send receipt email")
            
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error sending receipt: {str(e)}"
        )
