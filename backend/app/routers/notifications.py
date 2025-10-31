from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db

router = APIRouter()

@router.get("/")
def get_all(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return []

@router.post("/")
def create(db: Session = Depends(get_db)):
    return {"message": "Created successfully"}

@router.get("/{id}")
def get_one(id: int, db: Session = Depends(get_db)):
    return {"id": id}

@router.put("/{id}")
def update(id: int, db: Session = Depends(get_db)):
    return {"message": "Updated successfully"}

@router.delete("/{id}")
def delete(id: int, db: Session = Depends(get_db)):
    return {"message": "Deleted successfully"}
