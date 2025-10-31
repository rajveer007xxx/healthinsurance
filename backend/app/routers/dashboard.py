from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from datetime import datetime, timedelta
from app.utils.timezone import get_ist_now
from app.core.database import get_db
from app.models.models import Customer, Payment, Invoice, Complaint, User
from app.schemas.schemas import DashboardStats
from app.routers.auth import get_current_user

router = APIRouter()

@router.get("/stats", response_model=DashboardStats)
def get_dashboard_stats(
    service_type: str = "BROADBAND", 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    today = get_ist_now().date()
    month_start = datetime(today.year, today.month, 1)
    last_month_start = (month_start - timedelta(days=1)).replace(day=1)
    last_month_end = month_start - timedelta(days=1)
    
    # Total customers (all service types)
    total_customers = db.query(func.count(Customer.id)).filter(
        Customer.created_by == current_user.id
    ).scalar()
    
    # Active customers (all service types)
    active_customers = db.query(func.count(Customer.id)).filter(
        and_(
            Customer.status == "ACTIVE",
            Customer.created_by == current_user.id
        )
    ).scalar()
    
    # Deactive customers (all service types)
    deactive_customers = db.query(func.count(Customer.id)).filter(
        and_(
            Customer.status == "DEACTIVE",
            Customer.created_by == current_user.id
        )
    ).scalar()
    
    # Suspended customers (all service types)
    suspended_customers = db.query(func.count(Customer.id)).filter(
        and_(
            Customer.status == "SUSPENDED",
            Customer.created_by == current_user.id
        )
    ).scalar()
    
    # Today's collection (all service types)
    today_payments = db.query(
        func.sum(Payment.amount),
        func.count(Payment.id)
    ).join(Customer).filter(
        and_(
            func.date(Payment.payment_date) == today,
            Customer.created_by == current_user.id
        )
    ).first()
    
    today_collection = today_payments[0] or 0.0
    today_collection_count = today_payments[1] or 0
    
    # Month's collection (all service types)
    month_payments = db.query(
        func.sum(Payment.amount),
        func.count(Payment.id)
    ).join(Customer).filter(
        and_(
            Payment.payment_date >= month_start,
            Customer.created_by == current_user.id
        )
    ).first()
    
    month_collection = month_payments[0] or 0.0
    month_collection_count = month_payments[1] or 0
    
    # Total dues (all service types)
    total_dues = db.query(func.sum(Invoice.balance_amount)).join(Customer).filter(
        and_(
            Invoice.status.in_(["SENT", "OVERDUE"]),
            Customer.created_by == current_user.id
        )
    ).scalar() or 0.0
    
    # Today's expiry (all service types)
    today_expiry = db.query(func.count(Customer.id)).filter(
        and_(
            func.date(Customer.end_date) == today,
            Customer.status == "ACTIVE",
            Customer.created_by == current_user.id
        )
    ).scalar()
    
    # Next 3 days expiry (all service types)
    next_3_days = today + timedelta(days=3)
    next_3days_expiry = db.query(func.count(Customer.id)).filter(
        and_(
            Customer.end_date >= datetime.combine(today, datetime.min.time()),
            Customer.end_date < datetime.combine(next_3_days, datetime.min.time()),
            Customer.status == "ACTIVE",
            Customer.created_by == current_user.id
        )
    ).scalar()
    
    # Today's recharged (all service types)
    today_recharged = db.query(func.count(Payment.id)).join(Customer).filter(
        and_(
            func.date(Payment.payment_date) == today,
            Customer.created_by == current_user.id
        )
    ).scalar()
    
    # Month's complaints (all service types)
    month_complaints = db.query(func.count(Complaint.id)).join(Customer).filter(
        and_(
            Complaint.created_at >= month_start,
            Customer.created_by == current_user.id
        )
    ).scalar()
    
    # Month's enrollments (all service types)
    month_enrollments = db.query(func.count(Customer.id)).filter(
        and_(
            Customer.created_at >= month_start,
            Customer.created_by == current_user.id
        )
    ).scalar()
    
    # Inactive customers (all service types)
    inactive_customers = db.query(func.count(Customer.id)).filter(
        and_(
            Customer.status == "DEACTIVE",
            Customer.created_by == current_user.id
        )
    ).scalar()
    
    # Online payments (this month, all service types)
    online_payments = db.query(func.count(Payment.id)).join(Customer).filter(
        and_(
            Payment.payment_date >= month_start,
            Payment.payment_method.in_(["PAYTM", "PHONEPE", "GOOGLEPAY", "NET_BANKING"]),
            Customer.created_by == current_user.id
        )
    ).scalar()
    
    broadband_customers = db.query(func.count(Customer.id)).filter(
        and_(
            Customer.service_type == "BROADBAND",
            Customer.created_by == current_user.id
        )
    ).scalar()
    
    cable_tv_customers = db.query(func.count(Customer.id)).filter(
        and_(
            Customer.service_type == "CABLE_TV",
            Customer.created_by == current_user.id
        )
    ).scalar()
    
    return DashboardStats(
        total_customers=total_customers,
        active_customers=active_customers,
        deactive_customers=deactive_customers,
        suspended_customers=suspended_customers,
        today_collection=today_collection,
        today_collection_count=today_collection_count,
        month_collection=month_collection,
        month_collection_count=month_collection_count,
        total_dues=total_dues,
        today_expiry=today_expiry,
        next_3days_expiry=next_3days_expiry,
        today_recharged=today_recharged,
        month_complaints=month_complaints,
        month_enrollments=month_enrollments,
        inactive_customers=inactive_customers,
        online_payments=online_payments,
        broadband_customers=broadband_customers,
        cable_tv_customers=cable_tv_customers
    )

@router.get("/revenue")
def get_revenue_data(
    service_type: str = "BROADBAND", 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get monthly revenue data for the last 12 months"""
    today = get_ist_now().date()
    revenue_data = []
    
    for i in range(11, -1, -1):
        month_date = today - timedelta(days=30 * i)
        month_start = datetime(month_date.year, month_date.month, 1)
        
        if i == 0:
            month_end = get_ist_now()
        else:
            next_month = month_start.replace(day=28) + timedelta(days=4)
            month_end = next_month.replace(day=1) - timedelta(days=1)
        
        month_revenue = db.query(func.sum(Payment.amount)).join(Customer).filter(
            and_(
                Payment.payment_date >= month_start,
                Payment.payment_date <= month_end,
                Customer.created_by == current_user.id
            )
        ).scalar() or 0.0
        
        revenue_data.append({
            "month": month_start.strftime("%b %Y"),
            "revenue": float(month_revenue)
        })
    
    return revenue_data
