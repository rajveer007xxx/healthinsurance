from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import Settings, User
from app.routers.auth import get_current_user
from typing import Dict

router = APIRouter(tags=["settings"])

@router.get("/")
def get_settings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get application settings for current user"""
    settings = db.query(Settings).filter(Settings.user_id == current_user.id).first()
    if not settings:
        settings = Settings(user_id=current_user.id)
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return settings

@router.put("/")
def update_settings(
    settings_data: Dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update application settings for current user"""
    settings = db.query(Settings).filter(Settings.user_id == current_user.id).first()
    if not settings:
        settings = Settings(user_id=current_user.id)
        db.add(settings)
    
    if 'company_name' in settings_data:
        settings.company_name = settings_data['company_name']
    if 'company_address' in settings_data:
        settings.company_address = settings_data['company_address']
    if 'company_phone' in settings_data:
        settings.company_phone = settings_data['company_phone']
    if 'company_email' in settings_data:
        settings.company_email = settings_data['company_email']
    if 'company_gst' in settings_data:
        settings.company_gst = settings_data['company_gst']
    if 'company_state' in settings_data:
        settings.company_state = settings_data['company_state']
    if 'company_code' in settings_data:
        settings.company_code = settings_data['company_code']
    if 'invoice_prefix' in settings_data:
        settings.invoice_prefix = settings_data['invoice_prefix']
    if 'enable_sms' in settings_data:
        settings.enable_sms = settings_data['enable_sms']
    if 'enable_email' in settings_data:
        settings.enable_email = settings_data['enable_email']
    if 'enable_whatsapp' in settings_data:
        settings.enable_whatsapp = settings_data['enable_whatsapp']
    if 'declaration' in settings_data:
        settings.declaration = settings_data['declaration']
    if 'terms_and_conditions' in settings_data:
        settings.terms_and_conditions = settings_data['terms_and_conditions']
    if 'bank_name' in settings_data:
        settings.bank_name = settings_data['bank_name']
    if 'account_number' in settings_data:
        settings.account_number = settings_data['account_number']
    if 'branch_ifsc' in settings_data:
        settings.branch_ifsc = settings_data['branch_ifsc']
    
    db.commit()
    db.refresh(settings)
    
    return {
        "message": "Settings updated successfully",
        "settings": {
            "id": settings.id,
            "company_name": settings.company_name,
            "company_logo": settings.company_logo,
            "company_address": settings.company_address,
            "company_phone": settings.company_phone,
            "company_email": settings.company_email,
            "company_gst": settings.company_gst,
            "company_state": settings.company_state,
            "company_code": settings.company_code,
            "invoice_prefix": settings.invoice_prefix,
            "enable_sms": settings.enable_sms,
            "enable_email": settings.enable_email,
            "enable_whatsapp": settings.enable_whatsapp,
            "declaration": settings.declaration,
            "terms_and_conditions": settings.terms_and_conditions,
            "bank_name": settings.bank_name,
            "account_number": settings.account_number,
            "branch_ifsc": settings.branch_ifsc
        }
    }
