from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.models.models import Plan, User
from app.schemas.schemas import PlanCreate, PlanUpdate, Plan as PlanSchema
from app.core.dependencies import get_current_user

router = APIRouter()

@router.post("/", response_model=PlanSchema)
def create_plan(
    plan_data: PlanCreate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    plan_dict = plan_data.dict()
    plan_dict['user_id'] = current_user.id  # Set the creator
    
    price = plan_dict.get('price', 0)
    cgst = plan_dict.get('cgst_percentage', 0)
    sgst = plan_dict.get('sgst_percentage', 0)
    igst = plan_dict.get('igst_percentage', 0)
    
    cgst_amount = (price * cgst) / 100
    sgst_amount = (price * sgst) / 100
    igst_amount = (price * igst) / 100
    
    plan_dict['total_amount'] = price + cgst_amount + sgst_amount + igst_amount
    
    new_plan = Plan(**plan_dict)
    db.add(new_plan)
    db.commit()
    db.refresh(new_plan)
    return new_plan

@router.get("/", response_model=List[PlanSchema])
def get_plans(
    skip: int = 0,
    limit: int = 100,
    service_type: Optional[str] = None,
    company_id: Optional[int] = None,
    is_active: Optional[bool] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Plan)
    
    query = query.filter(Plan.user_id == current_user.id)
    
    if service_type:
        query = query.filter(Plan.service_type == service_type)
    if company_id:
        query = query.filter(Plan.company_id == company_id)
    if is_active is not None:
        query = query.filter(Plan.is_active == is_active)
    
    plans = query.offset(skip).limit(limit).all()
    return plans

@router.get("/{plan_id}", response_model=PlanSchema)
def get_plan(
    plan_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    plan = db.query(Plan).filter(
        Plan.id == plan_id,
        Plan.user_id == current_user.id
    ).first()
    if not plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Plan not found"
        )
    return plan

@router.put("/{plan_id}", response_model=PlanSchema)
def update_plan(
    plan_id: int, 
    plan_data: PlanUpdate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    plan = db.query(Plan).filter(
        Plan.id == plan_id,
        Plan.user_id == current_user.id
    ).first()
    if not plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Plan not found"
        )
    
    update_data = plan_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(plan, field, value)
    
    if any(key in update_data for key in ['price', 'cgst_percentage', 'sgst_percentage', 'igst_percentage']):
        price = plan.price
        cgst = plan.cgst_percentage
        sgst = plan.sgst_percentage
        igst = plan.igst_percentage
        
        cgst_amount = (price * cgst) / 100
        sgst_amount = (price * sgst) / 100
        igst_amount = (price * igst) / 100
        
        plan.total_amount = price + cgst_amount + sgst_amount + igst_amount
    
    db.commit()
    db.refresh(plan)
    return plan

@router.delete("/{plan_id}")
def delete_plan(
    plan_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    plan = db.query(Plan).filter(
        Plan.id == plan_id,
        Plan.user_id == current_user.id
    ).first()
    if not plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Plan not found"
        )
    
    db.delete(plan)
    db.commit()
    return {"message": "Plan deleted successfully"}
