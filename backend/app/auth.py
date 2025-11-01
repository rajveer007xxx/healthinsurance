from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import SuperAdmin, Admin, Employee, Customer

SECRET_KEY = "your-secret-key-change-in-production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password against hash"""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """Hash password"""
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Create JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def decode_token(token: str):
    """Decode JWT token"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    """Get current authenticated user"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    payload = decode_token(token)
    if payload is None:
        raise credentials_exception
    
    user_id: int = payload.get("sub")
    user_type: str = payload.get("type")
    
    if user_id is None or user_type is None:
        raise credentials_exception
    
    if user_type == "superadmin":
        user = db.query(SuperAdmin).filter(SuperAdmin.id == user_id).first()
    elif user_type == "admin":
        user = db.query(Admin).filter(Admin.id == user_id).first()
    elif user_type == "employee":
        user = db.query(Employee).filter(Employee.id == user_id).first()
    elif user_type == "customer":
        user = db.query(Customer).filter(Customer.id == user_id).first()
    else:
        raise credentials_exception
    
    if user is None:
        raise credentials_exception
    
    return {"user": user, "type": user_type}

def authenticate_superadmin(db: Session, email: str, password: str):
    """Authenticate superadmin"""
    user = db.query(SuperAdmin).filter(SuperAdmin.email == email).first()
    if not user:
        return None
    if not verify_password(password, user.password_hash):
        return None
    return user

def authenticate_admin(db: Session, email: str, password: str):
    """Authenticate admin"""
    user = db.query(Admin).filter(Admin.email == email).first()
    if not user:
        return None
    if not verify_password(password, user.password_hash):
        return None
    return user

def authenticate_employee(db: Session, email: str, password: str):
    """Authenticate employee"""
    user = db.query(Employee).filter(Employee.email == email).first()
    if not user:
        return None
    if not verify_password(password, user.password_hash):
        return None
    return user

def authenticate_customer(db: Session, mobile: str, password: str):
    """Authenticate customer (using mobile as username)"""
    user = db.query(Customer).filter(Customer.mobile == mobile).first()
    if not user:
        return None
    if not verify_password(password, user.password_hash):
        return None
    return user
