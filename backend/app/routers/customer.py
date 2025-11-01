from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import Customer, Payment, Invoice, Complaint
from app.schemas import PaymentResponse, InvoiceResponse, ComplaintCreate, ComplaintResponse
from app.auth import get_current_user

router = APIRouter(prefix="/customer", tags=["Customer"])

async def verify_customer(current_user: dict = Depends(get_current_user)):
    """Verify user is customer"""
    if current_user["type"] != "customer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized. Customer access required."
        )
    return current_user

@router.get("/profile")
async def get_profile(
    db: Session = Depends(get_db),
    current_user: dict = Depends(verify_customer)
):
    """Get customer profile"""
    customer_id = current_user["user"].id
    company_id = current_user["user"].company_id
    
    customer = db.query(Customer).filter(
        Customer.id == customer_id,
        Customer.company_id == company_id
    ).first()
    
    if not customer:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    return {
        "id": customer.id,
        "name": customer.name,
        "email": customer.email,
        "mobile": customer.mobile,
        "address": customer.address,
        "service_type": customer.service_type,
        "status": customer.status,
        "start_date": customer.start_date,
        "end_date": customer.end_date,
        "billing_amount": customer.billing_amount
    }

@router.get("/invoices", response_model=List[InvoiceResponse])
async def get_my_invoices(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: dict = Depends(verify_customer)
):
    """Get customer's invoices"""
    customer_id = current_user["user"].id
    company_id = current_user["user"].company_id
    
    invoices = db.query(Invoice).filter(
        Invoice.company_id == company_id,
        Invoice.customer_id == customer_id
    ).order_by(Invoice.created_date.desc()).offset(skip).limit(limit).all()
    
    return invoices

@router.get("/invoices/{invoice_id}", response_model=InvoiceResponse)
async def get_invoice(
    invoice_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(verify_customer)
):
    """Get specific invoice"""
    customer_id = current_user["user"].id
    company_id = current_user["user"].company_id
    
    invoice = db.query(Invoice).filter(
        Invoice.id == invoice_id,
        Invoice.company_id == company_id,
        Invoice.customer_id == customer_id
    ).first()
    
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    
    return invoice

@router.get("/payments", response_model=List[PaymentResponse])
async def get_my_payments(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: dict = Depends(verify_customer)
):
    """Get customer's payment history"""
    customer_id = current_user["user"].id
    company_id = current_user["user"].company_id
    
    payments = db.query(Payment).filter(
        Payment.company_id == company_id,
        Payment.customer_id == customer_id
    ).order_by(Payment.payment_date.desc()).offset(skip).limit(limit).all()
    
    return payments

@router.get("/payments/{payment_id}", response_model=PaymentResponse)
async def get_payment(
    payment_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(verify_customer)
):
    """Get specific payment"""
    customer_id = current_user["user"].id
    company_id = current_user["user"].company_id
    
    payment = db.query(Payment).filter(
        Payment.id == payment_id,
        Payment.company_id == company_id,
        Payment.customer_id == customer_id
    ).first()
    
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    
    return payment

@router.get("/complaints", response_model=List[ComplaintResponse])
async def get_my_complaints(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: dict = Depends(verify_customer)
):
    """Get customer's complaints"""
    customer_id = current_user["user"].id
    company_id = current_user["user"].company_id
    
    complaints = db.query(Complaint).filter(
        Complaint.company_id == company_id,
        Complaint.customer_id == customer_id
    ).order_by(Complaint.created_date.desc()).offset(skip).limit(limit).all()
    
    return complaints

@router.post("/complaints", response_model=ComplaintResponse)
async def create_complaint(
    complaint: ComplaintCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(verify_customer)
):
    """Create new complaint"""
    customer_id = current_user["user"].id
    company_id = current_user["user"].company_id
    
    complaint_data = complaint.dict()
    complaint_data["company_id"] = company_id
    complaint_data["customer_id"] = customer_id
    
    db_complaint = Complaint(**complaint_data)
    db.add(db_complaint)
    db.commit()
    db.refresh(db_complaint)
    return db_complaint

@router.get("/complaints/{complaint_id}", response_model=ComplaintResponse)
async def get_complaint(
    complaint_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(verify_customer)
):
    """Get specific complaint"""
    customer_id = current_user["user"].id
    company_id = current_user["user"].company_id
    
    complaint = db.query(Complaint).filter(
        Complaint.id == complaint_id,
        Complaint.company_id == company_id,
        Complaint.customer_id == customer_id
    ).first()
    
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
    
    return complaint

@router.get("/stats")
async def get_customer_stats(
    db: Session = Depends(get_db),
    current_user: dict = Depends(verify_customer)
):
    """Get customer dashboard statistics"""
    customer_id = current_user["user"].id
    company_id = current_user["user"].company_id
    
    customer = db.query(Customer).filter(
        Customer.id == customer_id,
        Customer.company_id == company_id
    ).first()
    
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    from sqlalchemy import func
    total_paid = db.query(func.sum(Payment.amount)).filter(
        Payment.company_id == company_id,
        Payment.customer_id == customer_id
    ).scalar() or 0
    
    pending_invoices = db.query(Invoice).filter(
        Invoice.company_id == company_id,
        Invoice.customer_id == customer_id,
        Invoice.status == "pending"
    ).count()
    
    open_complaints = db.query(Complaint).filter(
        Complaint.company_id == company_id,
        Complaint.customer_id == customer_id,
        Complaint.status.in_(["open", "in_progress"])
    ).count()
    
    return {
        "service_type": customer.service_type,
        "status": customer.status,
        "end_date": customer.end_date,
        "billing_amount": customer.billing_amount,
        "total_paid": total_paid,
        "pending_invoices": pending_invoices,
        "open_complaints": open_complaints
    }
