from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from app.utils.timezone import get_ist_now
from app.core.database import get_db
from app.models.models import Complaint
from app.schemas.schemas import ComplaintCreate, ComplaintUpdate, Complaint as ComplaintSchema
import random
import string

router = APIRouter()

def generate_complaint_id() -> str:
    return 'CMP' + ''.join(random.choices(string.digits, k=10))

@router.post("/", response_model=ComplaintSchema)
def create_complaint(complaint_data: ComplaintCreate, db: Session = Depends(get_db)):
    complaint_id = generate_complaint_id()
    
    new_complaint = Complaint(
        complaint_id=complaint_id,
        customer_id=complaint_data.customer_id,
        title=complaint_data.title,
        description=complaint_data.description,
        category=complaint_data.category,
        priority=complaint_data.priority,
        status="OPEN"
    )
    
    db.add(new_complaint)
    db.commit()
    db.refresh(new_complaint)
    return new_complaint

@router.get("/", response_model=List[ComplaintSchema])
def get_complaints(
    skip: int = 0,
    limit: int = 100,
    customer_id: Optional[int] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Complaint)
    
    if customer_id:
        query = query.filter(Complaint.customer_id == customer_id)
    if status:
        query = query.filter(Complaint.status == status)
    
    complaints = query.offset(skip).limit(limit).all()
    return complaints

@router.get("/{complaint_id}", response_model=ComplaintSchema)
def get_complaint(complaint_id: int, db: Session = Depends(get_db)):
    complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Complaint not found"
        )
    return complaint

@router.put("/{complaint_id}", response_model=ComplaintSchema)
def update_complaint(complaint_id: int, complaint_data: ComplaintUpdate, db: Session = Depends(get_db)):
    complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Complaint not found"
        )
    
    update_data = complaint_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(complaint, field, value)
    
    if complaint_data.status == "RESOLVED":
        complaint.resolved_at = get_ist_now()
    
    db.commit()
    db.refresh(complaint)
    return complaint

@router.delete("/{complaint_id}")
def delete_complaint(complaint_id: int, db: Session = Depends(get_db)):
    complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Complaint not found"
        )
    
    db.delete(complaint)
    db.commit()
    return {"message": "Complaint deleted successfully"}
