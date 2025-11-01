from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from app.database import get_db
from app.models import Customer, Payment, Complaint, EmployeeLocation
from app.schemas import (
    CustomerResponse,
    PaymentCreate, PaymentResponse,
    ComplaintResponse,
    EmployeeLocationCreate, EmployeeLocationResponse
)
from app.auth import get_current_user
import random

router = APIRouter(prefix="/employee", tags=["Employee"])

async def verify_employee(current_user: dict = Depends(get_current_user)):
    """Verify user is employee"""
    if current_user["type"] != "employee":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized. Employee access required."
        )
    return current_user

@router.get("/customers", response_model=List[CustomerResponse])
async def get_assigned_customers(
    status: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: dict = Depends(verify_employee)
):
    """Get customers assigned to this employee"""
    employee_id = current_user["user"].id
    company_id = current_user["user"].company_id
    
    query = db.query(Customer).filter(
        Customer.company_id == company_id,
        Customer.assigned_employee_id == employee_id
    )
    
    if status:
        query = query.filter(Customer.status == status)
    
    customers = query.offset(skip).limit(limit).all()
    return customers

@router.get("/customers/{customer_id}", response_model=CustomerResponse)
async def get_customer(
    customer_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(verify_employee)
):
    """Get customer details"""
    employee_id = current_user["user"].id
    company_id = current_user["user"].company_id
    
    customer = db.query(Customer).filter(
        Customer.id == customer_id,
        Customer.company_id == company_id,
        Customer.assigned_employee_id == employee_id
    ).first()
    
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found or not assigned to you")
    
    return customer

@router.post("/payments", response_model=PaymentResponse)
async def collect_payment(
    payment: PaymentCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(verify_employee)
):
    """Collect payment from customer"""
    employee_id = current_user["user"].id
    company_id = current_user["user"].company_id
    
    customer = db.query(Customer).filter(
        Customer.id == payment.customer_id,
        Customer.company_id == company_id,
        Customer.assigned_employee_id == employee_id
    ).first()
    
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found or not assigned to you")
    
    receipt_number = f"RCP{datetime.now().strftime('%y%m%d')}{random.randint(1000, 9999)}"
    
    payment_data = payment.dict()
    payment_data["company_id"] = company_id
    payment_data["receipt_number"] = receipt_number
    payment_data["collected_by"] = employee_id
    
    db_payment = Payment(**payment_data)
    db.add(db_payment)
    db.commit()
    db.refresh(db_payment)
    return db_payment

@router.get("/payments", response_model=List[PaymentResponse])
async def get_my_collections(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: dict = Depends(verify_employee)
):
    """Get payments collected by this employee"""
    employee_id = current_user["user"].id
    company_id = current_user["user"].company_id
    
    payments = db.query(Payment).filter(
        Payment.company_id == company_id,
        Payment.collected_by == employee_id
    ).order_by(Payment.payment_date.desc()).offset(skip).limit(limit).all()
    
    return payments

@router.get("/complaints", response_model=List[ComplaintResponse])
async def get_assigned_complaints(
    status: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: dict = Depends(verify_employee)
):
    """Get complaints assigned to this employee"""
    employee_id = current_user["user"].id
    company_id = current_user["user"].company_id
    
    query = db.query(Complaint).filter(
        Complaint.company_id == company_id,
        Complaint.assigned_to == employee_id
    )
    
    if status:
        query = query.filter(Complaint.status == status)
    
    complaints = query.order_by(Complaint.created_date.desc()).offset(skip).limit(limit).all()
    return complaints

@router.put("/complaints/{complaint_id}")
async def update_complaint_status(
    complaint_id: int,
    status: str,
    notes: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: dict = Depends(verify_employee)
):
    """Update complaint status"""
    employee_id = current_user["user"].id
    company_id = current_user["user"].company_id
    
    complaint = db.query(Complaint).filter(
        Complaint.id == complaint_id,
        Complaint.company_id == company_id,
        Complaint.assigned_to == employee_id
    ).first()
    
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found or not assigned to you")
    
    complaint.status = status
    if status == "resolved":
        complaint.resolved_date = datetime.utcnow()
    
    db.commit()
    db.refresh(complaint)
    return complaint

@router.post("/location", response_model=EmployeeLocationResponse)
async def update_location(
    location: EmployeeLocationCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(verify_employee)
):
    """Update employee's current location"""
    employee_id = current_user["user"].id
    company_id = current_user["user"].company_id
    
    location_data = location.dict()
    location_data["employee_id"] = employee_id
    location_data["company_id"] = company_id
    
    db_location = EmployeeLocation(**location_data)
    db.add(db_location)
    db.commit()
    db.refresh(db_location)
    return db_location

@router.get("/location/history", response_model=List[EmployeeLocationResponse])
async def get_location_history(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: dict = Depends(verify_employee)
):
    """Get employee's location history"""
    employee_id = current_user["user"].id
    company_id = current_user["user"].company_id
    
    locations = db.query(EmployeeLocation).filter(
        EmployeeLocation.company_id == company_id,
        EmployeeLocation.employee_id == employee_id
    ).order_by(EmployeeLocation.timestamp.desc()).offset(skip).limit(limit).all()
    
    return locations

@router.get("/stats")
async def get_employee_stats(
    db: Session = Depends(get_db),
    current_user: dict = Depends(verify_employee)
):
    """Get employee dashboard statistics"""
    employee_id = current_user["user"].id
    company_id = current_user["user"].company_id
    
    assigned_customers = db.query(Customer).filter(
        Customer.company_id == company_id,
        Customer.assigned_employee_id == employee_id
    ).count()
    
    active_customers = db.query(Customer).filter(
        Customer.company_id == company_id,
        Customer.assigned_employee_id == employee_id,
        Customer.status == "active"
    ).count()
    
    from sqlalchemy import func, cast, Date
    today = datetime.now().date()
    today_collections = db.query(func.sum(Payment.amount)).filter(
        Payment.company_id == company_id,
        Payment.collected_by == employee_id,
        cast(Payment.payment_date, Date) == today
    ).scalar() or 0
    
    pending_complaints = db.query(Complaint).filter(
        Complaint.company_id == company_id,
        Complaint.assigned_to == employee_id,
        Complaint.status.in_(["open", "in_progress"])
    ).count()
    
    return {
        "assigned_customers": assigned_customers,
        "active_customers": active_customers,
        "today_collections": today_collections,
        "pending_complaints": pending_complaints
    }
