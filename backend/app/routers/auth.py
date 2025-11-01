from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
from app.database import get_db
from app.schemas import Token, LoginRequest, CustomerLoginRequest
from app.auth import (
    authenticate_superadmin,
    authenticate_admin,
    authenticate_employee,
    authenticate_customer,
    create_access_token,
    ACCESS_TOKEN_EXPIRE_MINUTES
)

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/superadmin/login", response_model=Token)
async def superadmin_login(login_data: LoginRequest, db: Session = Depends(get_db)):
    """SuperAdmin login"""
    user = authenticate_superadmin(db, login_data.email, login_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.id, "type": "superadmin"},
        expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_type": "superadmin",
        "user_id": user.id,
        "company_id": None
    }

@router.post("/admin/login", response_model=Token)
async def admin_login(login_data: LoginRequest, db: Session = Depends(get_db)):
    """Admin login"""
    user = authenticate_admin(db, login_data.email, login_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.id, "type": "admin", "company_id": user.company_id},
        expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_type": "admin",
        "user_id": user.id,
        "company_id": user.company_id
    }

@router.post("/employee/login", response_model=Token)
async def employee_login(login_data: LoginRequest, db: Session = Depends(get_db)):
    """Employee login"""
    user = authenticate_employee(db, login_data.email, login_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.id, "type": "employee", "company_id": user.company_id},
        expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_type": "employee",
        "user_id": user.id,
        "company_id": user.company_id
    }

@router.post("/customer/login", response_model=Token)
async def customer_login(login_data: CustomerLoginRequest, db: Session = Depends(get_db)):
    """Customer login (using mobile number)"""
    user = authenticate_customer(db, login_data.mobile, login_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect mobile or password"
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.id, "type": "customer", "company_id": user.company_id},
        expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_type": "customer",
        "user_id": user.id,
        "company_id": user.company_id
    }
