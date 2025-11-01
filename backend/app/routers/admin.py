from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta
from app.database import get_db
from app.models import Customer, Employee, Plan, Payment, Invoice, Complaint, ServiceArea, Locality, Expense
from app.schemas import (
    CustomerCreate, CustomerUpdate, CustomerResponse,
    EmployeeCreate, EmployeeResponse,
    PlanCreate, PlanResponse,
    PaymentCreate, PaymentResponse,
    InvoiceCreate, InvoiceResponse,
    ComplaintCreate, ComplaintResponse
)
from app.auth import get_current_user, get_password_hash
import random
import string

router = APIRouter(prefix="/admin", tags=["Admin"])

async def verify_admin(current_user: dict = Depends(get_current_user)):
    """Verify user is admin"""
    if current_user["type"] != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized. Admin access required."
        )
    return current_user

def generate_invoice_number():
    """Generate 10-11 digit invoice number"""
    timestamp = datetime.now().strftime("%y%m%d")
    random_part = ''.join(random.choices(string.digits, k=5))
    return f"{timestamp}{random_part}"

@router.get("/customers", response_model=List[CustomerResponse])
async def get_customers(
    service_type: Optional[str] = None,
    status: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: dict = Depends(verify_admin)
):
    """Get all customers for admin's company"""
    company_id = current_user["user"].company_id
    query = db.query(Customer).filter(Customer.company_id == company_id)
    
    if service_type:
        query = query.filter(Customer.service_type == service_type)
    if status:
        query = query.filter(Customer.status == status)
    
    customers = query.offset(skip).limit(limit).all()
    return customers

@router.post("/customers", response_model=CustomerResponse)
async def create_customer(
    customer: CustomerCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(verify_admin)
):
    """Create new customer"""
    company_id = current_user["user"].company_id
    
    existing = db.query(Customer).filter(
        Customer.company_id == company_id,
        Customer.mobile == customer.mobile
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Customer with this mobile already exists")
    
    customer_data = customer.dict()
    customer_data["company_id"] = company_id
    
    if customer_data.get("start_date") and customer_data.get("plan_id"):
        plan = db.query(Plan).filter(Plan.id == customer_data["plan_id"]).first()
        if plan:
            customer_data["end_date"] = customer_data["start_date"] + timedelta(days=plan.validity_days)
    
    db_customer = Customer(**customer_data)
    db.add(db_customer)
    db.commit()
    db.refresh(db_customer)
    return db_customer

@router.get("/customers/{customer_id}", response_model=CustomerResponse)
async def get_customer(
    customer_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(verify_admin)
):
    """Get customer by ID"""
    company_id = current_user["user"].company_id
    customer = db.query(Customer).filter(
        Customer.id == customer_id,
        Customer.company_id == company_id
    ).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    return customer

@router.put("/customers/{customer_id}", response_model=CustomerResponse)
async def update_customer(
    customer_id: int,
    customer_update: CustomerUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(verify_admin)
):
    """Update customer"""
    company_id = current_user["user"].company_id
    customer = db.query(Customer).filter(
        Customer.id == customer_id,
        Customer.company_id == company_id
    ).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    for key, value in customer_update.dict(exclude_unset=True).items():
        setattr(customer, key, value)
    
    if customer_update.plan_id and customer.start_date:
        plan = db.query(Plan).filter(Plan.id == customer_update.plan_id).first()
        if plan:
            customer.end_date = customer.start_date + timedelta(days=plan.validity_days)
    
    customer.updated_date = datetime.utcnow()
    db.commit()
    db.refresh(customer)
    return customer

@router.delete("/customers/{customer_id}")
async def delete_customer(
    customer_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(verify_admin)
):
    """Delete customer"""
    company_id = current_user["user"].company_id
    customer = db.query(Customer).filter(
        Customer.id == customer_id,
        Customer.company_id == company_id
    ).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    db.delete(customer)
    db.commit()
    return {"message": "Customer deleted successfully"}

@router.post("/customers/{customer_id}/renew")
async def renew_customer(
    customer_id: int,
    plan_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: dict = Depends(verify_admin)
):
    """Renew customer subscription"""
    company_id = current_user["user"].company_id
    customer = db.query(Customer).filter(
        Customer.id == customer_id,
        Customer.company_id == company_id
    ).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    renewal_plan_id = plan_id or customer.plan_id
    if not renewal_plan_id:
        raise HTTPException(status_code=400, detail="No plan specified for renewal")
    
    plan = db.query(Plan).filter(Plan.id == renewal_plan_id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    
    customer.plan_id = renewal_plan_id
    customer.start_date = datetime.utcnow()
    customer.end_date = customer.start_date + timedelta(days=plan.validity_days)
    customer.billing_amount = plan.price
    customer.status = "active"
    customer.updated_date = datetime.utcnow()
    
    db.commit()
    db.refresh(customer)
    
    invoice_number = generate_invoice_number()
    invoice = Invoice(
        company_id=company_id,
        customer_id=customer_id,
        invoice_number=invoice_number,
        amount=plan.price,
        due_date=customer.end_date,
        status="pending"
    )
    db.add(invoice)
    db.commit()
    
    return {"message": "Customer renewed successfully", "invoice_number": invoice_number}

@router.get("/employees", response_model=List[EmployeeResponse])
async def get_employees(
    db: Session = Depends(get_db),
    current_user: dict = Depends(verify_admin)
):
    """Get all employees for admin's company"""
    company_id = current_user["user"].company_id
    employees = db.query(Employee).filter(Employee.company_id == company_id).all()
    return employees

@router.post("/employees", response_model=EmployeeResponse)
async def create_employee(
    employee: EmployeeCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(verify_admin)
):
    """Create new employee"""
    company_id = current_user["user"].company_id
    
    existing = db.query(Employee).filter(
        Employee.company_id == company_id,
        Employee.email == employee.email
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Employee with this email already exists")
    
    employee_data = employee.dict()
    password = employee_data.pop("password")
    employee_data["password_hash"] = get_password_hash(password)
    employee_data["company_id"] = company_id
    
    db_employee = Employee(**employee_data)
    db.add(db_employee)
    db.commit()
    db.refresh(db_employee)
    return db_employee

@router.get("/employees/{employee_id}", response_model=EmployeeResponse)
async def get_employee(
    employee_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(verify_admin)
):
    """Get employee by ID"""
    company_id = current_user["user"].company_id
    employee = db.query(Employee).filter(
        Employee.id == employee_id,
        Employee.company_id == company_id
    ).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    return employee

@router.put("/employees/{employee_id}")
async def update_employee(
    employee_id: int,
    employee_update: dict,
    db: Session = Depends(get_db),
    current_user: dict = Depends(verify_admin)
):
    """Update employee"""
    company_id = current_user["user"].company_id
    employee = db.query(Employee).filter(
        Employee.id == employee_id,
        Employee.company_id == company_id
    ).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    
    for key, value in employee_update.items():
        if key == "password" and value:
            setattr(employee, "password_hash", get_password_hash(value))
        elif hasattr(employee, key):
            setattr(employee, key, value)
    
    db.commit()
    db.refresh(employee)
    return employee

@router.delete("/employees/{employee_id}")
async def delete_employee(
    employee_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(verify_admin)
):
    """Delete employee"""
    company_id = current_user["user"].company_id
    employee = db.query(Employee).filter(
        Employee.id == employee_id,
        Employee.company_id == company_id
    ).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    
    db.delete(employee)
    db.commit()
    return {"message": "Employee deleted successfully"}

@router.get("/plans", response_model=List[PlanResponse])
async def get_plans(
    service_type: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: dict = Depends(verify_admin)
):
    """Get all plans for admin's company"""
    company_id = current_user["user"].company_id
    query = db.query(Plan).filter(Plan.company_id == company_id)
    
    if service_type:
        query = query.filter(Plan.service_type == service_type)
    
    plans = query.all()
    return plans

@router.post("/plans", response_model=PlanResponse)
async def create_plan(
    plan: PlanCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(verify_admin)
):
    """Create new plan"""
    company_id = current_user["user"].company_id
    
    plan_data = plan.dict()
    plan_data["company_id"] = company_id
    
    db_plan = Plan(**plan_data)
    db.add(db_plan)
    db.commit()
    db.refresh(db_plan)
    return db_plan

@router.put("/plans/{plan_id}", response_model=PlanResponse)
async def update_plan(
    plan_id: int,
    plan_update: PlanCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(verify_admin)
):
    """Update plan"""
    company_id = current_user["user"].company_id
    plan = db.query(Plan).filter(
        Plan.id == plan_id,
        Plan.company_id == company_id
    ).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    
    for key, value in plan_update.dict(exclude_unset=True).items():
        setattr(plan, key, value)
    
    db.commit()
    db.refresh(plan)
    return plan

@router.delete("/plans/{plan_id}")
async def delete_plan(
    plan_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(verify_admin)
):
    """Delete plan"""
    company_id = current_user["user"].company_id
    plan = db.query(Plan).filter(
        Plan.id == plan_id,
        Plan.company_id == company_id
    ).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    
    db.delete(plan)
    db.commit()
    return {"message": "Plan deleted successfully"}

@router.get("/payments", response_model=List[PaymentResponse])
async def get_payments(
    customer_id: Optional[int] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: dict = Depends(verify_admin)
):
    """Get all payments for admin's company"""
    company_id = current_user["user"].company_id
    query = db.query(Payment).filter(Payment.company_id == company_id)
    
    if customer_id:
        query = query.filter(Payment.customer_id == customer_id)
    
    payments = query.order_by(Payment.payment_date.desc()).offset(skip).limit(limit).all()
    return payments

@router.post("/payments", response_model=PaymentResponse)
async def create_payment(
    payment: PaymentCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(verify_admin)
):
    """Record new payment"""
    company_id = current_user["user"].company_id
    
    customer = db.query(Customer).filter(
        Customer.id == payment.customer_id,
        Customer.company_id == company_id
    ).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    receipt_number = f"RCP{datetime.now().strftime('%y%m%d')}{random.randint(1000, 9999)}"
    
    payment_data = payment.dict()
    payment_data["company_id"] = company_id
    payment_data["receipt_number"] = receipt_number
    payment_data["collected_by"] = current_user["user"].id
    
    db_payment = Payment(**payment_data)
    db.add(db_payment)
    db.commit()
    db.refresh(db_payment)
    return db_payment

@router.get("/invoices", response_model=List[InvoiceResponse])
async def get_invoices(
    customer_id: Optional[int] = None,
    status: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: dict = Depends(verify_admin)
):
    """Get all invoices for admin's company"""
    company_id = current_user["user"].company_id
    query = db.query(Invoice).filter(Invoice.company_id == company_id)
    
    if customer_id:
        query = query.filter(Invoice.customer_id == customer_id)
    if status:
        query = query.filter(Invoice.status == status)
    
    invoices = query.order_by(Invoice.created_date.desc()).offset(skip).limit(limit).all()
    return invoices

@router.post("/invoices", response_model=InvoiceResponse)
async def create_invoice(
    invoice: InvoiceCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(verify_admin)
):
    """Create new invoice"""
    company_id = current_user["user"].company_id
    
    customer = db.query(Customer).filter(
        Customer.id == invoice.customer_id,
        Customer.company_id == company_id
    ).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    invoice_number = generate_invoice_number()
    
    invoice_data = invoice.dict()
    invoice_data["company_id"] = company_id
    invoice_data["invoice_number"] = invoice_number
    
    db_invoice = Invoice(**invoice_data)
    db.add(db_invoice)
    db.commit()
    db.refresh(db_invoice)
    return db_invoice

@router.get("/complaints", response_model=List[ComplaintResponse])
async def get_complaints(
    status: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: dict = Depends(verify_admin)
):
    """Get all complaints for admin's company"""
    company_id = current_user["user"].company_id
    query = db.query(Complaint).filter(Complaint.company_id == company_id)
    
    if status:
        query = query.filter(Complaint.status == status)
    
    complaints = query.order_by(Complaint.created_date.desc()).offset(skip).limit(limit).all()
    return complaints

@router.post("/complaints", response_model=ComplaintResponse)
async def create_complaint(
    complaint: ComplaintCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(verify_admin)
):
    """Create new complaint"""
    company_id = current_user["user"].company_id
    
    complaint_data = complaint.dict()
    complaint_data["company_id"] = company_id
    
    db_complaint = Complaint(**complaint_data)
    db.add(db_complaint)
    db.commit()
    db.refresh(db_complaint)
    return db_complaint

@router.put("/complaints/{complaint_id}")
async def update_complaint(
    complaint_id: int,
    complaint_update: dict,
    db: Session = Depends(get_db),
    current_user: dict = Depends(verify_admin)
):
    """Update complaint"""
    company_id = current_user["user"].company_id
    complaint = db.query(Complaint).filter(
        Complaint.id == complaint_id,
        Complaint.company_id == company_id
    ).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
    
    for key, value in complaint_update.items():
        if hasattr(complaint, key):
            setattr(complaint, key, value)
    
    if complaint_update.get("status") == "resolved":
        complaint.resolved_date = datetime.utcnow()
    
    db.commit()
    db.refresh(complaint)
    return complaint

@router.get("/stats")
async def get_admin_stats(
    db: Session = Depends(get_db),
    current_user: dict = Depends(verify_admin)
):
    """Get dashboard statistics"""
    company_id = current_user["user"].company_id
    
    total_customers = db.query(Customer).filter(Customer.company_id == company_id).count()
    active_customers = db.query(Customer).filter(
        Customer.company_id == company_id,
        Customer.status == "active"
    ).count()
    total_employees = db.query(Employee).filter(Employee.company_id == company_id).count()
    total_plans = db.query(Plan).filter(Plan.company_id == company_id).count()
    
    from sqlalchemy import func, extract
    current_month = datetime.now().month
    current_year = datetime.now().year
    monthly_revenue = db.query(func.sum(Payment.amount)).filter(
        Payment.company_id == company_id,
        extract('month', Payment.payment_date) == current_month,
        extract('year', Payment.payment_date) == current_year
    ).scalar() or 0
    
    return {
        "total_customers": total_customers,
        "active_customers": active_customers,
        "inactive_customers": total_customers - active_customers,
        "total_employees": total_employees,
        "total_plans": total_plans,
        "monthly_revenue": monthly_revenue
    }
