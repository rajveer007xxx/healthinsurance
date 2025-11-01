from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import verify_password, get_password_hash, create_access_token, decode_token
from app.models.models import User, Customer, Company
from app.schemas.schemas import UserLogin, CustomerLogin, Token, TokenWithUser, UserCreate, User as UserSchema
from app.core.dependencies import get_current_user
from datetime import timedelta, datetime
import random

router = APIRouter()
security = HTTPBearer()

@router.post("/admin/login")
def admin_login(user_data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == user_data.username).first()
    if not user or not verify_password(user_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password"
        )
    if user.role not in ["ADMIN", "EMPLOYEE"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    subscription_expired = False
    expiry_message = None
    if user.role == "ADMIN" and user.subscription_end_date:
        try:
            end_date = datetime.fromisoformat(user.subscription_end_date)
            if datetime.now() > end_date:
                subscription_expired = True
                expiry_message = "Dear Partner, Your subscription has ended. Please pay your package due amount to Auto ISP Billing and renew your subscription to continue."
        except:
            pass
    
    access_token = create_access_token(
        data={"sub": user.username, "role": user.role, "user_id": user.id}
    )
    
    company = db.query(Company).filter(Company.id == user.company_id).first() if user.company_id else None
    greeting_message = company.greeting_message if company and company.greeting_message else None
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "username": user.username,
            "full_name": user.full_name,
            "email": user.email,
            "phone": user.phone,
            "role": user.role,
            "company_id": user.company_id
        },
        "subscription_expired": subscription_expired,
        "expiry_message": expiry_message,
        "greeting_message": greeting_message
    }

@router.post("/customer/login", response_model=Token)
def customer_login(customer_data: CustomerLogin, db: Session = Depends(get_db)):
    customer = db.query(Customer).filter(Customer.username == customer_data.username).first()
    if not customer or not verify_password(customer_data.password, customer.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password"
        )
    
    access_token = create_access_token(
        data={"sub": customer.username, "role": "CUSTOMER", "customer_id": customer.id}
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/admin/register", response_model=UserSchema)
def register_admin(user_data: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.username == user_data.username).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )
    
    company_id = None
    if user_data.role == "ADMIN":
        while True:
            company_code = str(random.randint(10000000, 99999999))
            existing_company = db.query(Company).filter(Company.company_code == company_code).first()
            if not existing_company:
                break
        
        new_company = Company(
            name=f"{user_data.full_name}'s Company",
            address="",
            phone=user_data.phone or "",
            email=user_data.email,
            gst_no="",
            company_code=company_code
        )
        db.add(new_company)
        db.flush()
        company_id = new_company.id
    
    hashed_password = get_password_hash(user_data.password)
    new_user = User(
        email=user_data.email,
        username=user_data.username,
        password_hash=hashed_password,
        full_name=user_data.full_name,
        role=user_data.role,
        phone=user_data.phone,
        company_id=company_id
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.get("/me", response_model=UserSchema)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.get("/subscription-status")
def get_subscription_status(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Check subscription status for current admin"""
    if current_user.role != "ADMIN":
        return {"subscription_expired": False}
    
    subscription_expired = False
    expiry_message = None
    days_remaining = None
    
    if current_user.subscription_end_date:
        try:
            end_date = datetime.fromisoformat(current_user.subscription_end_date)
            now = datetime.now()
            if now > end_date:
                subscription_expired = True
                expiry_message = "Dear Partner, Your subscription has ended. Please pay your package due amount to Auto ISP Billing and renew your subscription to continue."
            else:
                days_remaining = (end_date - now).days
        except:
            pass
    
    company = db.query(Company).filter(Company.id == current_user.company_id).first() if current_user.company_id else None
    greeting_message = company.greeting_message if company and company.greeting_message else None
    
    return {
        "subscription_expired": subscription_expired,
        "expiry_message": expiry_message,
        "days_remaining": days_remaining,
        "greeting_message": greeting_message,
        "subscription_end_date": current_user.subscription_end_date
    }

@router.put("/profile")
def update_profile(
    profile_data: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if profile_data.get('full_name'):
        current_user.full_name = profile_data['full_name']
    if profile_data.get('email'):
        current_user.email = profile_data['email']
    if profile_data.get('phone'):
        current_user.phone = profile_data['phone']
    
    db.commit()
    db.refresh(current_user)
    return {"message": "Profile updated successfully", "user": {
        "id": current_user.id,
        "username": current_user.username,
        "full_name": current_user.full_name,
        "email": current_user.email,
        "phone": current_user.phone,
        "profile_image": current_user.profile_image,
        "role": current_user.role
    }}

@router.put("/change-password")
def change_password(
    password_data: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    current_password = password_data.get('current_password')
    new_password = password_data.get('new_password')
    
    if not current_password or not new_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password and new password are required"
        )
    
    if not verify_password(current_password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect"
        )
    
    current_user.password_hash = get_password_hash(new_password)
    db.commit()
    return {"message": "Password changed successfully"}
