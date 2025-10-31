from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import User, Settings
from app.routers.auth import get_current_user
import os
import shutil
from pathlib import Path
import uuid

router = APIRouter(tags=["uploads"])

UPLOAD_DIR = Path("/var/www/isp-manager-v2/uploads")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

@router.post("/upload/profile-image")
async def upload_profile_image(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Upload profile image for current user"""
    if not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    file_extension = file.filename.split('.')[-1]
    unique_filename = f"profile_{current_user.id}_{uuid.uuid4().hex[:8]}.{file_extension}"
    file_path = UPLOAD_DIR / unique_filename
    
    with file_path.open("wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    current_user.profile_image = f"/uploads/{unique_filename}"
    db.commit()
    db.refresh(current_user)
    
    return {
        "message": "Profile image uploaded successfully",
        "image_url": current_user.profile_image
    }

@router.post("/upload/company-logo")
async def upload_company_logo(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Upload company logo"""
    if not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    file_extension = file.filename.split('.')[-1]
    unique_filename = f"logo_{uuid.uuid4().hex[:8]}.{file_extension}"
    file_path = UPLOAD_DIR / unique_filename
    
    with file_path.open("wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    settings = db.query(Settings).filter(Settings.user_id == current_user.id).first()
    if not settings:
        settings = Settings(user_id=current_user.id)
        db.add(settings)
    
    settings.company_logo = f"/uploads/{unique_filename}"
    db.commit()
    db.refresh(settings)
    
    return {
        "message": "Company logo uploaded successfully",
        "logo_url": settings.company_logo
    }
