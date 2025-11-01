from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.models import User, Company

router = APIRouter()

@router.get("/")
async def get_settings(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get company settings for the current admin"""
    if not current_user.company_id:
        return {
            "company_name": "",
            "address": "",
            "phone": "",
            "email": current_user.email,
            "gst_no": "",
            "terms_and_conditions": "",
            "declaration": "",
            "greeting_message": ""
        }
    
    company = db.query(Company).filter(Company.id == current_user.company_id).first()
    if not company:
        return {
            "company_name": "",
            "address": "",
            "phone": "",
            "email": current_user.email,
            "gst_no": "",
            "terms_and_conditions": "",
            "declaration": "",
            "greeting_message": ""
        }
    
    return {
        "company_name": company.name,
        "company_code": company.company_code,
        "address": company.address,
        "phone": company.phone,
        "email": company.email,
        "gst_no": company.gst_no,
        "state": company.state if hasattr(company, 'state') else "",
        "state_code": company.state_code if hasattr(company, 'state_code') else "",
        "terms_and_conditions": company.terms_and_conditions if hasattr(company, 'terms_and_conditions') else "",
        "declaration": company.declaration if hasattr(company, 'declaration') else "",
        "company_logo": company.company_logo if hasattr(company, 'company_logo') else "",
        "greeting_message": company.greeting_message if hasattr(company, 'greeting_message') else ""
    }

@router.put("/")
async def update_settings(settings_data: dict, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Update company settings"""
    if not current_user.company_id:
        raise HTTPException(status_code=404, detail="Company not found")
    
    company = db.query(Company).filter(Company.id == current_user.company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    
    if 'company_name' in settings_data:
        company.name = settings_data['company_name']
    if 'address' in settings_data:
        company.address = settings_data['address']
    if 'phone' in settings_data:
        company.phone = settings_data['phone']
    if 'email' in settings_data:
        company.email = settings_data['email']
    if 'gst_no' in settings_data:
        company.gst_no = settings_data['gst_no']
    if 'terms_and_conditions' in settings_data:
        company.terms_and_conditions = settings_data['terms_and_conditions']
    if 'declaration' in settings_data:
        company.declaration = settings_data['declaration']
    if 'greeting_message' in settings_data:
        company.greeting_message = settings_data['greeting_message']
    if 'company_logo' in settings_data:
        company.company_logo = settings_data['company_logo']
    
    db.commit()
    db.refresh(company)
    
    return {"message": "Settings updated successfully"}
