from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models.models import Locality, User
from app.core.dependencies import get_current_user
from pydantic import BaseModel

router = APIRouter()

class LocalityCreate(BaseModel):
    name: str
    city: str
    state: str
    pincode: str

class LocalityUpdate(BaseModel):
    name: str
    city: str
    state: str
    pincode: str

class LocalityResponse(BaseModel):
    id: int
    name: str
    city: str
    state: str
    pincode: str
    
    class Config:
        from_attributes = True

@router.get("/", response_model=List[LocalityResponse])
def get_all(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    localities = db.query(Locality).filter(Locality.user_id == current_user.id).all()
    return localities

@router.post("/", response_model=LocalityResponse)
def create(
    locality: LocalityCreate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_locality = Locality(**locality.dict(), user_id=current_user.id)
    db.add(db_locality)
    db.commit()
    db.refresh(db_locality)
    return db_locality

@router.get("/{id}", response_model=LocalityResponse)
def get_one(id: int, db: Session = Depends(get_db)):
    locality = db.query(Locality).filter(Locality.id == id).first()
    if not locality:
        raise HTTPException(status_code=404, detail="Locality not found")
    return locality

@router.put("/{id}", response_model=LocalityResponse)
def update(id: int, locality: LocalityUpdate, db: Session = Depends(get_db)):
    db_locality = db.query(Locality).filter(Locality.id == id).first()
    if not db_locality:
        raise HTTPException(status_code=404, detail="Locality not found")
    
    for key, value in locality.dict().items():
        setattr(db_locality, key, value)
    
    db.commit()
    db.refresh(db_locality)
    return db_locality

@router.delete("/{id}")
def delete(id: int, db: Session = Depends(get_db)):
    db_locality = db.query(Locality).filter(Locality.id == id).first()
    if not db_locality:
        raise HTTPException(status_code=404, detail="Locality not found")
    
    db.delete(db_locality)
    db.commit()
    return {"message": "Locality deleted successfully"}
