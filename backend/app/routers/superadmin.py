from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import Company, Admin, SuperAdmin
from app.schemas import CompanyCreate, CompanyResponse, AdminCreate, AdminResponse
from app.auth import get_current_user, get_password_hash

router = APIRouter(prefix="/superadmin", tags=["SuperAdmin"])

async def verify_superadmin(current_user: dict = Depends(get_current_user)):
    """Verify user is superadmin"""
    if current_user["type"] != "superadmin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized. SuperAdmin access required."
        )
    return current_user

@router.get("/companies", response_model=List[CompanyResponse])
async def get_all_companies(
    db: Session = Depends(get_db),
    current_user: dict = Depends(verify_superadmin)
):
    """Get all companies"""
    companies = db.query(Company).all()
    return companies

@router.post("/companies", response_model=CompanyResponse)
async def create_company(
    company: CompanyCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(verify_superadmin)
):
    """Create new company"""
    db_company = Company(**company.dict())
    db.add(db_company)
    db.commit()
    db.refresh(db_company)
    return db_company

@router.get("/companies/{company_id}", response_model=CompanyResponse)
async def get_company(
    company_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(verify_superadmin)
):
    """Get company by ID"""
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    return company

@router.put("/companies/{company_id}", response_model=CompanyResponse)
async def update_company(
    company_id: int,
    company_update: CompanyCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(verify_superadmin)
):
    """Update company"""
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    
    for key, value in company_update.dict(exclude_unset=True).items():
        setattr(company, key, value)
    
    db.commit()
    db.refresh(company)
    return company

@router.delete("/companies/{company_id}")
async def delete_company(
    company_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(verify_superadmin)
):
    """Delete company"""
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    
    db.delete(company)
    db.commit()
    return {"message": "Company deleted successfully"}

@router.post("/companies/{company_id}/admins", response_model=AdminResponse)
async def create_admin_for_company(
    company_id: int,
    admin: AdminCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(verify_superadmin)
):
    """Create admin for a company"""
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    
    existing_admin = db.query(Admin).filter(Admin.email == admin.email).first()
    if existing_admin:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    admin_data = admin.dict()
    password = admin_data.pop("password")
    admin_data["password_hash"] = get_password_hash(password)
    admin_data["company_id"] = company_id
    
    db_admin = Admin(**admin_data)
    db.add(db_admin)
    db.commit()
    db.refresh(db_admin)
    return db_admin

@router.get("/companies/{company_id}/admins", response_model=List[AdminResponse])
async def get_company_admins(
    company_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(verify_superadmin)
):
    """Get all admins for a company"""
    admins = db.query(Admin).filter(Admin.company_id == company_id).all()
    return admins

@router.get("/stats")
async def get_platform_stats(
    db: Session = Depends(get_db),
    current_user: dict = Depends(verify_superadmin)
):
    """Get platform-wide statistics"""
    total_companies = db.query(Company).count()
    active_companies = db.query(Company).filter(Company.status == "active").count()
    total_admins = db.query(Admin).count()
    
    return {
        "total_companies": total_companies,
        "active_companies": active_companies,
        "inactive_companies": total_companies - active_companies,
        "total_admins": total_admins
    }
