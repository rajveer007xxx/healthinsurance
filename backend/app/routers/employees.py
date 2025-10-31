from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.models import User, UserRole
from app.core.security import get_password_hash, verify_password
import json
import os
import uuid
from pathlib import Path

router = APIRouter()

@router.get("/")
def get_all_employees(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
    status_filter: Optional[str] = None
):
    """Get all employee users"""
    query = db.query(User).filter(User.role == UserRole.EMPLOYEE)
    
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
    
    employees = query.offset(skip).limit(limit).all()
    
    return {
        "employees": [
            {
                "id": emp.id,
                "username": emp.username,
                "email": emp.email,
                "full_name": emp.full_name,
                "phone": emp.phone,
                "is_active": emp.is_active,
                "created_at": emp.created_at.isoformat() if emp.created_at else None,
                "permissions": json.loads(emp.profile_image) if emp.profile_image else [],
                "employee_image": emp.employee_image
            }
            for emp in employees
        ]
    }

@router.get("/{employee_id}")
def get_employee_details(
    employee_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get detailed information about a specific employee"""
    employee = db.query(User).filter(
        User.id == employee_id,
        User.role == UserRole.EMPLOYEE
    ).first()
    
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee not found"
        )
    
    return {
        "id": employee.id,
        "username": employee.username,
        "email": employee.email,
        "full_name": employee.full_name,
        "phone": employee.phone,
        "address": "",
        "is_active": employee.is_active,
        "created_at": employee.created_at.isoformat() if employee.created_at else None,
        "permissions": json.loads(employee.profile_image) if employee.profile_image else [],
        "employee_image": employee.employee_image
    }

@router.post("/")
def create_employee(
    employee_data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new employee user"""
    
    existing_user = db.query(User).filter(User.username == employee_data.get('username')).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already exists"
        )
    
    existing_email = db.query(User).filter(User.email == employee_data.get('email')).first()
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already exists"
        )
    
    permissions = employee_data.get('permissions', [])
    permissions_json = json.dumps(permissions)
    
    new_employee = User(
        username=employee_data.get('username'),
        email=employee_data.get('email'),
        full_name=employee_data.get('full_name'),
        phone=employee_data.get('phone'),
        password_hash=get_password_hash(employee_data.get('password')),
        role=UserRole.EMPLOYEE,
        is_active=True,
        profile_image=permissions_json,
        company_id=current_user.company_id
    )
    
    db.add(new_employee)
    db.commit()
    db.refresh(new_employee)
    
    return {
        "message": "Employee created successfully",
        "employee_id": new_employee.id
    }

@router.put("/{employee_id}")
def update_employee(
    employee_id: int,
    employee_data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update an employee user"""
    employee = db.query(User).filter(
        User.id == employee_id,
        User.role == UserRole.EMPLOYEE
    ).first()
    
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee not found"
        )
    
    if 'username' in employee_data and employee_data['username'] != employee.username:
        existing = db.query(User).filter(User.username == employee_data['username']).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already exists"
            )
        employee.username = employee_data['username']
    
    if 'email' in employee_data and employee_data['email'] != employee.email:
        existing = db.query(User).filter(User.email == employee_data['email']).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already exists"
            )
        employee.email = employee_data['email']
    
    if 'full_name' in employee_data:
        employee.full_name = employee_data['full_name']
    
    if 'phone' in employee_data:
        employee.phone = employee_data['phone']
    
    if 'password' in employee_data and employee_data['password']:
        employee.password_hash = get_password_hash(employee_data['password'])
    
    if 'permissions' in employee_data:
        permissions_json = json.dumps(employee_data['permissions'])
        employee.profile_image = permissions_json
    
    db.commit()
    db.refresh(employee)
    
    return {"message": "Employee updated successfully"}

@router.post("/{employee_id}/image")
async def upload_employee_image(
    employee_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Upload employee profile image"""
    employee = db.query(User).filter(
        User.id == employee_id,
        User.role == UserRole.EMPLOYEE
    ).first()
    
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee not found"
        )
    
    # Validate file type
    allowed_types = ["image/jpeg", "image/jpg", "image/png", "image/gif"]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only image files (JPEG, PNG, GIF) are allowed"
        )
    
    # Validate file size (max 5MB)
    contents = await file.read()
    if len(contents) > 5 * 1024 * 1024:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File size must be less than 5MB"
        )
    
    # Create uploads/employees directory if it doesn't exist
    upload_dir = Path("/var/www/isp-manager-v2/uploads/employees")
    upload_dir.mkdir(parents=True, exist_ok=True)
    
    # Generate unique filename
    file_extension = file.filename.split(".")[-1] if "." in file.filename else "jpg"
    unique_filename = f"{uuid.uuid4()}.{file_extension}"
    file_path = upload_dir / unique_filename
    
    # Delete old image if exists
    if employee.employee_image:
        old_file_path = Path(f"/var/www/isp-manager-v2/uploads/{employee.employee_image}")
        if old_file_path.exists():
            old_file_path.unlink()
    
    # Save new image
    with open(file_path, "wb") as f:
        f.write(contents)
    
    # Update database with relative path
    employee.employee_image = f"employees/{unique_filename}"
    db.commit()
    
    return {
        "message": "Image uploaded successfully",
        "image_url": f"http://82.29.162.153/uploads/employees/{unique_filename}"
    }

@router.delete("/{employee_id}")
def delete_employee(
    employee_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete an employee user"""
    employee = db.query(User).filter(
        User.id == employee_id,
        User.role == UserRole.EMPLOYEE
    ).first()
    
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee not found"
        )
    
    # Delete employee image if exists
    if employee.employee_image:
        file_path = Path(f"/var/www/isp-manager-v2/uploads/{employee.employee_image}")
        if file_path.exists():
            file_path.unlink()
    
    db.delete(employee)
    db.commit()
    
    return {"message": "Employee deleted successfully"}

@router.post("/{employee_id}/toggle-status")
def toggle_employee_status(
    employee_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Toggle employee active status"""
    employee = db.query(User).filter(
        User.id == employee_id,
        User.role == UserRole.EMPLOYEE
    ).first()
    
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee not found"
        )
    
    employee.is_active = not employee.is_active
    db.commit()
    
    return {
        "message": f"Employee {'activated' if employee.is_active else 'deactivated'} successfully",
        "is_active": employee.is_active
    }
