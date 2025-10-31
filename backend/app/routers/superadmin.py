from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from datetime import datetime, timedelta
from app.utils.timezone import get_ist_now
import random
from app.core.database import get_db
from app.models.models import User, UserRole, Customer, Invoice, Payment, Settings, Company
from app.routers.auth import get_current_user, get_password_hash, verify_password, create_access_token
from passlib.context import CryptContext

router = APIRouter()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def generate_company_code(db: Session) -> str:
    """Generate a unique 8-digit company code"""
    while True:
        code = ''.join([str(random.randint(0, 9)) for _ in range(8)])
        existing = db.query(Company).filter(Company.company_code == code).first()
        if not existing:
            return code

def get_current_superadmin(current_user: User = Depends(get_current_user)):
    """Verify that the current user is a superadmin"""
    if current_user.role != UserRole.SUPERADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized. Superadmin access required."
        )
    return current_user

@router.post("/login")
def superadmin_login(login_data: dict, db: Session = Depends(get_db)):
    """Superadmin login endpoint"""
    username = login_data.get('username')
    password = login_data.get('password')
    
    if not username or not password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username and password are required"
        )
    
    user = db.query(User).filter(
        User.username == username,
        User.role == UserRole.SUPERADMIN
    ).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    
    if not pwd_context.verify(password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is deactivated"
        )
    
    access_token = create_access_token(data={"sub": user.username})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role.value
        }
    }

@router.get("/dashboard/stats")
def get_superadmin_dashboard_stats(
    db: Session = Depends(get_db),
    current_superadmin: User = Depends(get_current_superadmin)
):
    """Get dashboard statistics for superadmin"""
    
    total_admins = db.query(User).filter(User.role == UserRole.ADMIN).count()
    active_admins = db.query(User).filter(
        User.role == UserRole.ADMIN,
        User.is_active == True
    ).count()
    
    total_customers = db.query(Customer).count()
    active_customers = db.query(Customer).filter(Customer.status == "ACTIVE").count()
    
    total_revenue = db.query(func.sum(Payment.amount)).filter(
        Payment.status == "COMPLETED"
    ).scalar() or 0.0
    
    total_invoices = db.query(Invoice).count()
    pending_invoices = db.query(Invoice).filter(Invoice.balance_amount > 0).count()
    
    seven_days_ago = get_ist_now() - timedelta(days=7)
    recent_admins = db.query(User).filter(
        User.role == UserRole.ADMIN,
        User.created_at >= seven_days_ago
    ).count()
    
    return {
        "total_admins": total_admins,
        "active_admins": active_admins,
        "inactive_admins": total_admins - active_admins,
        "recent_admins": recent_admins,
        "total_customers": total_customers,
        "active_customers": active_customers,
        "total_revenue": round(total_revenue, 2),
        "total_invoices": total_invoices,
        "pending_invoices": pending_invoices
    }

@router.get("/admins")
def get_all_admins(
    db: Session = Depends(get_db),
    current_superadmin: User = Depends(get_current_superadmin),
    skip: int = 0,
    limit: int = 100,
    search: str = None,
    status_filter: str = None
):
    """Get all admin users"""
    query = db.query(User).filter(User.role == UserRole.ADMIN)
    
    if search:
        query = query.filter(
            (User.username.contains(search)) |
            (User.email.contains(search)) |
            (User.full_name.contains(search))
        )
    
    if status_filter == "active":
        query = query.filter(User.is_active == True)
    elif status_filter == "inactive":
        query = query.filter(User.is_active == False)
    
    total = query.count()
    admins = query.offset(skip).limit(limit).all()
    
    admin_list = []
    for admin in admins:
        customer_count = db.query(Customer).filter(Customer.created_by == admin.id).count()
        
        company_name = None
        company_code = None
        if admin.company_id:
            company = db.query(Company).filter(Company.id == admin.company_id).first()
            if company:
                company_name = company.name
                company_code = company.company_code
        
        settings = db.query(Settings).filter(Settings.user_id == admin.id).first()
        plain_password = settings.plain_password if settings and hasattr(settings, 'plain_password') else None
        
        admin_list.append({
            "id": admin.id,
            "username": admin.username,
            "email": admin.email,
            "full_name": admin.full_name,
            "phone": admin.phone,
            "is_active": admin.is_active,
            "created_at": admin.created_at,
            "customer_count": customer_count,
            "company_name": company_name,
            "company_code": company_code,
            "password": plain_password
        })
    
    return {
        "total": total,
        "admins": admin_list
    }

@router.get("/admins/{admin_id}")
def get_admin_details(
    admin_id: int,
    db: Session = Depends(get_db),
    current_superadmin: User = Depends(get_current_superadmin)
):
    """Get detailed information about a specific admin"""
    admin = db.query(User).filter(
        User.id == admin_id,
        User.role == UserRole.ADMIN
    ).first()
    
    if not admin:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Admin not found"
        )
    
    customers = db.query(Customer).filter(Customer.created_by == admin.id).all()
    customer_count = len(customers)
    active_customer_count = sum(1 for c in customers if c.status == "ACTIVE")
    
    admin_revenue = db.query(func.sum(Payment.amount)).join(Customer).filter(
        Customer.created_by == admin.id,
        Payment.status == "COMPLETED"
    ).scalar() or 0.0
    
    invoice_count = db.query(Invoice).join(Customer).filter(
        Customer.created_by == admin.id
    ).count()
    
    settings = db.query(Settings).filter(Settings.user_id == admin.id).first()
    
    return {
        "id": admin.id,
        "username": admin.username,
        "email": admin.email,
        "full_name": admin.full_name,
        "phone": admin.phone,
        "is_active": admin.is_active,
        "created_at": admin.created_at,
        "updated_at": admin.updated_at,
        "stats": {
            "customer_count": customer_count,
            "active_customers": active_customer_count,
            "total_revenue": round(admin_revenue, 2),
            "invoice_count": invoice_count
        },
        "settings": {
            "company_name": settings.company_name if settings else None,
            "company_email": settings.company_email if settings else None,
            "company_phone": settings.company_phone if settings else None
        } if settings else None
    }

@router.post("/admins")
def create_admin(
    admin_data: dict,
    db: Session = Depends(get_db),
    current_superadmin: User = Depends(get_current_superadmin)
):
    """Create a new admin user with company settings"""
    
    existing_user = db.query(User).filter(User.username == admin_data.get('username')).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already exists"
        )
    
    existing_email = db.query(User).filter(User.email == admin_data.get('email')).first()
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already exists"
        )
    
    plain_password = admin_data.get('password')
    password_hash = pwd_context.hash(plain_password)
    
    company_code = generate_company_code(db)
    company_name = admin_data.get('company_name') or f"{admin_data.get('full_name')} Company"
    
    company = Company(
        company_code=company_code,
        name=company_name,
        address=admin_data.get('company_address', ''),
        phone=admin_data.get('company_phone', ''),
        email=admin_data.get('company_email', ''),
        gst_no=admin_data.get('company_gst', '')
    )
    db.add(company)
    db.flush()
    company_id = company.id
    
    new_admin = User(
        username=admin_data.get('username'),
        email=admin_data.get('email'),
        password_hash=password_hash,
        full_name=admin_data.get('full_name'),
        phone=admin_data.get('phone', ''),
        role=UserRole.ADMIN,
        is_active=True,
        company_id=company_id
    )
    
    db.add(new_admin)
    db.flush()
    
    settings = Settings(
        user_id=new_admin.id,
        plain_password=plain_password,
        company_name=company_name,
        company_address=admin_data.get('company_address', ''),
        company_phone=admin_data.get('company_phone', ''),
        company_email=admin_data.get('company_email', ''),
        company_gst=admin_data.get('company_gst', ''),
        company_state=admin_data.get('company_state', ''),
        company_code=company_code,
        bank_name=admin_data.get('bank_name', ''),
        account_number=admin_data.get('account_number', ''),
        branch_ifsc=admin_data.get('branch_ifsc', ''),
        declaration=admin_data.get('declaration', ''),
        terms_and_conditions=admin_data.get('terms_and_conditions', '')
    )
    db.add(settings)
    
    db.commit()
    db.refresh(new_admin)
    
    return {
        "message": "Admin created successfully",
        "admin": {
            "id": new_admin.id,
            "username": new_admin.username,
            "email": new_admin.email,
            "full_name": new_admin.full_name,
            "company_id": company_id
        }
    }

@router.put("/admins/{admin_id}")
def update_admin(
    admin_id: int,
    admin_data: dict,
    db: Session = Depends(get_db),
    current_superadmin: User = Depends(get_current_superadmin)
):
    """Update an admin user"""
    admin = db.query(User).filter(
        User.id == admin_id,
        User.role == UserRole.ADMIN
    ).first()
    
    if not admin:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Admin not found"
        )
    
    if 'email' in admin_data and admin_data['email'] != admin.email:
        existing_email = db.query(User).filter(
            User.email == admin_data['email'],
            User.id != admin_id
        ).first()
        if existing_email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already exists"
            )
        admin.email = admin_data['email']
    
    if 'full_name' in admin_data:
        admin.full_name = admin_data['full_name']
    
    if 'phone' in admin_data:
        admin.phone = admin_data['phone']
    
    if 'is_active' in admin_data:
        admin.is_active = admin_data['is_active']
    
    if 'password' in admin_data and admin_data['password']:
        admin.password_hash = pwd_context.hash(admin_data['password'])
    
    admin.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(admin)
    
    return {
        "message": "Admin updated successfully",
        "admin": {
            "id": admin.id,
            "username": admin.username,
            "email": admin.email,
            "full_name": admin.full_name,
            "is_active": admin.is_active
        }
    }

@router.delete("/admins/{admin_id}")
def delete_admin(
    admin_id: int,
    db: Session = Depends(get_db),
    current_superadmin: User = Depends(get_current_superadmin)
):
    """Delete an admin user"""
    admin = db.query(User).filter(
        User.id == admin_id,
        User.role == UserRole.ADMIN
    ).first()
    
    if not admin:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Admin not found"
        )
    
    customer_count = db.query(Customer).filter(Customer.created_by == admin.id).count()
    if customer_count > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot delete admin with {customer_count} customers. Please reassign or delete customers first."
        )
    
    db.delete(admin)
    db.commit()
    
    return {"message": "Admin deleted successfully"}

@router.post("/admins/{admin_id}/toggle-status")
def toggle_admin_status(
    admin_id: int,
    db: Session = Depends(get_db),
    current_superadmin: User = Depends(get_current_superadmin)
):
    """Toggle admin active/inactive status"""
    admin = db.query(User).filter(
        User.id == admin_id,
        User.role == UserRole.ADMIN
    ).first()
    
    if not admin:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Admin not found"
        )
    
    admin.is_active = not admin.is_active
    admin.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(admin)
    
    return {
        "message": f"Admin {'activated' if admin.is_active else 'deactivated'} successfully",
        "is_active": admin.is_active
    }

@router.get("/system/stats")
def get_system_stats(
    db: Session = Depends(get_db),
    current_superadmin: User = Depends(get_current_superadmin)
):
    """Get overall system statistics"""
    
    total_users = db.query(User).count()
    admin_count = db.query(User).filter(User.role == UserRole.ADMIN).count()
    employee_count = db.query(User).filter(User.role == UserRole.EMPLOYEE).count()
    
    total_customers = db.query(Customer).count()
    active_customers = db.query(Customer).filter(Customer.status == "ACTIVE").count()
    suspended_customers = db.query(Customer).filter(Customer.status == "SUSPENDED").count()
    
    total_revenue = db.query(func.sum(Payment.amount)).filter(
        Payment.status == "COMPLETED"
    ).scalar() or 0.0
    
    total_pending = db.query(func.sum(Invoice.balance_amount)).filter(
        Invoice.balance_amount > 0
    ).scalar() or 0.0
    
    total_invoices = db.query(Invoice).count()
    sent_invoices = db.query(Invoice).filter(Invoice.status == "SENT").count()
    paid_invoices = db.query(Invoice).filter(Invoice.status == "PAID").count()
    
    return {
        "users": {
            "total": total_users,
            "admins": admin_count,
            "employees": employee_count
        },
        "customers": {
            "total": total_customers,
            "active": active_customers,
            "suspended": suspended_customers
        },
        "financial": {
            "total_revenue": round(total_revenue, 2),
            "total_pending": round(total_pending, 2)
        },
        "invoices": {
            "total": total_invoices,
            "sent": sent_invoices,
            "paid": paid_invoices
        }
    }
