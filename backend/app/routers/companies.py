from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models.models import Company, User
from app.core.dependencies import get_current_user
from pydantic import BaseModel

router = APIRouter()

class CompanyCreate(BaseModel):
    name: str
    address: str
    phone: str
    email: str
    gst_no: str

class CompanyUpdate(BaseModel):
    name: str
    address: str
    phone: str
    email: str
    gst_no: str

class CompanyResponse(BaseModel):
    id: int
    name: str
    address: str
    phone: str
    email: str
    gst_no: str
    
    class Config:
        from_attributes = True

@router.get("/", response_model=List[CompanyResponse])
def get_all(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    companies = db.query(Company).filter(Company.user_id == current_user.id).all()
    return companies

@router.post("/", response_model=CompanyResponse)
def create(
    company: CompanyCreate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_company = Company(**company.dict(), user_id=current_user.id)
    db.add(db_company)
    db.commit()
    db.refresh(db_company)
    return db_company

@router.get("/{id}", response_model=CompanyResponse)
def get_one(id: int, db: Session = Depends(get_db)):
    company = db.query(Company).filter(Company.id == id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    return company

@router.put("/{id}", response_model=CompanyResponse)
def update(id: int, company: CompanyUpdate, db: Session = Depends(get_db)):
    db_company = db.query(Company).filter(Company.id == id).first()
    if not db_company:
        raise HTTPException(status_code=404, detail="Company not found")
    
    for key, value in company.dict().items():
        setattr(db_company, key, value)
    
    db.commit()
    db.refresh(db_company)
    return db_company

@router.delete("/{id}")
def delete(id: int, db: Session = Depends(get_db)):
    db_company = db.query(Company).filter(Company.id == id).first()
    if not db_company:
        raise HTTPException(status_code=404, detail="Company not found")
    
    db.delete(db_company)
    db.commit()
    return {"message": "Company deleted successfully"}
