from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from datetime import datetime, timedelta
from app.utils.timezone import get_ist_now
from pydantic import BaseModel
from app.core.database import get_db
from app.models.models import AddonBill, Customer, Invoice, Transaction, Settings
from app.utils.pdf_generator import generate_invoice_pdf
from app.utils.email_sender import send_invoice_email

router = APIRouter()

class AddonBillCreate(BaseModel):
    customer_id: int
    description: str
    amount: float
    cgst_percentage: float = 0.0
    sgst_percentage: float = 0.0
    igst_percentage: float = 0.0
    include_previous_balance: bool = False

@router.get("/")
def get_all(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    addon_bills = db.query(AddonBill).offset(skip).limit(limit).all()
    return addon_bills

@router.post("/")
def create_addon_bill(addon_bill: AddonBillCreate, db: Session = Depends(get_db)):
    customer = db.query(Customer).filter(Customer.id == addon_bill.customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    settings = db.query(Settings).filter(Settings.user_id == customer.created_by).first()
    if not settings:
        settings = db.query(Settings).first()
    
    if settings:
        invoice_prefix = settings.invoice_prefix or "INV"
        invoice_counter = settings.invoice_counter or 1000
        invoice_number = f"{invoice_prefix}{invoice_counter}"
        settings.invoice_counter = invoice_counter + 1
    else:
        invoice_number = f"INV{get_ist_now().strftime('%Y%m%d%H%M%S')}"
    
    invoice_date = get_ist_now()
    due_date = invoice_date + timedelta(days=7)
    
    cgst_amount = (addon_bill.amount * addon_bill.cgst_percentage) / 100
    sgst_amount = (addon_bill.amount * addon_bill.sgst_percentage) / 100
    igst_amount = (addon_bill.amount * addon_bill.igst_percentage) / 100
    
    total_amount = addon_bill.amount + cgst_amount + sgst_amount + igst_amount
    
    new_addon_bill = AddonBill(
        customer_id=addon_bill.customer_id,
        invoice_number=invoice_number,
        description=addon_bill.description,
        amount=addon_bill.amount,
        cgst_tax=cgst_amount,
        sgst_tax=sgst_amount,
        igst_tax=igst_amount,
        total_amount=total_amount,
        paid_amount=0.0,
        balance_amount=total_amount,
        invoice_date=invoice_date,
        due_date=due_date,
        status="SENT",
        is_paid=False
    )
    
    db.add(new_addon_bill)
    db.commit()
    db.refresh(new_addon_bill)
    
    current_invoice_balance = db.query(func.sum(Invoice.balance_amount)).filter(
        Invoice.customer_id == customer.id
    ).scalar() or 0.0
    
    current_addon_balance = db.query(func.sum(AddonBill.balance_amount)).filter(
        AddonBill.customer_id == customer.id
    ).scalar() or 0.0
    
    balance_after = current_invoice_balance + current_addon_balance
    
    new_transaction = Transaction(
        customer_id=customer.id,
        transaction_type="DEBIT",
        amount=total_amount,
        balance_after=balance_after,
        description=f"Addon Bill: {addon_bill.description}",
        transaction_date=get_ist_now(),
        transaction_id=invoice_number
    )
    db.add(new_transaction)
    db.commit()
    
    if customer.email:
        try:
            user_settings = db.query(Settings).filter(Settings.user_id == customer.created_by).first()
            if not user_settings:
                user_settings = db.query(Settings).first()
            
            previous_balance = db.query(func.sum(Invoice.balance_amount)).filter(
                Invoice.customer_id == customer.id
            ).scalar() or 0.0
            
            total_due_amount = new_addon_bill.total_amount
            if addon_bill.include_previous_balance:
                total_due_amount += previous_balance
            
            invoice_data = {
                'invoice_number': new_addon_bill.invoice_number,
                'invoice_date': new_addon_bill.invoice_date,
                'due_date': new_addon_bill.due_date,
                'bill_amount': new_addon_bill.amount,
                'cgst_tax': new_addon_bill.cgst_tax,
                'sgst_tax': new_addon_bill.sgst_tax,
                'igst_tax': new_addon_bill.igst_tax,
                'discount': 0.0,
                'total_amount': new_addon_bill.total_amount,
                'paid_amount': new_addon_bill.paid_amount,
                'balance_amount': new_addon_bill.balance_amount,
                'billing_period_start': invoice_date,
                'billing_period_end': due_date,
                'plan_name': 'Addon Service',
                'plan_speed': addon_bill.description,
                'previous_balance': previous_balance if addon_bill.include_previous_balance else 0.0,
                'total_due_amount': total_due_amount
            }
            
            customer_data = {
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
                'gst_invoice_needed': customer.gst_invoice_needed or False
            }
            
            company_data = {
                'name': user_settings.company_name if user_settings else 'ISP Billing Services',
                'address': user_settings.company_address if user_settings else '',
                'phone': user_settings.company_phone if user_settings else '',
                'email': user_settings.company_email if user_settings else 'billing@ispbilling.in',
                'gstin': user_settings.company_gst if user_settings else '',
                'state': user_settings.company_state if user_settings else '',
                'code': user_settings.company_code if user_settings else '',
                'bank_name': user_settings.bank_name if user_settings else '',
                'account_number': user_settings.account_number if user_settings else '',
                'ifsc_code': user_settings.branch_ifsc if user_settings else '',
                'declaration': user_settings.declaration if user_settings else '',
                'terms_and_conditions': user_settings.terms_and_conditions if user_settings else '',
                'logo_path': user_settings.company_logo if user_settings and user_settings.company_logo else ''
            }
            
            pdf_buffer = generate_invoice_pdf(invoice_data, customer_data, company_data)
            
            send_invoice_email(
                to_email=customer.email,
                customer_name=customer.full_name,
                customer_id=customer.customer_id,
                invoice_number=new_addon_bill.invoice_number,
                pdf_buffer=pdf_buffer,
                company_name=company_data['name'],
                company_mobile=company_data['phone'],
                company_address=company_data['address'],
                smtp_host="smtp.hostinger.com",
                smtp_port=465,
                smtp_user="billing@ispbilling.in",
                smtp_password="Login@121212"
            )
            
            return {
                "message": "Addon bill created and invoice sent successfully",
                "addon_bill": new_addon_bill,
                "email_sent": True
            }
        except Exception as e:
            return {
                "message": "Addon bill created but email failed",
                "addon_bill": new_addon_bill,
                "email_sent": False,
                "error": str(e)
            }
    
    return {
        "message": "Addon bill created successfully (no email)",
        "addon_bill": new_addon_bill,
        "email_sent": False
    }

@router.get("/{id}")
def get_one(id: int, db: Session = Depends(get_db)):
    addon_bill = db.query(AddonBill).filter(AddonBill.id == id).first()
    if not addon_bill:
        raise HTTPException(status_code=404, detail="Addon bill not found")
    return addon_bill

@router.put("/{id}")
def update(id: int, db: Session = Depends(get_db)):
    addon_bill = db.query(AddonBill).filter(AddonBill.id == id).first()
    if not addon_bill:
        raise HTTPException(status_code=404, detail="Addon bill not found")
    return {"message": "Updated successfully"}

@router.delete("/{id}")
def delete(id: int, db: Session = Depends(get_db)):
    addon_bill = db.query(AddonBill).filter(AddonBill.id == id).first()
    if not addon_bill:
        raise HTTPException(status_code=404, detail="Addon bill not found")
    db.delete(addon_bill)
    db.commit()
    return {"message": "Deleted successfully"}
