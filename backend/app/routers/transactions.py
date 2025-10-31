from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.models.models import Transaction, Customer, User
from app.schemas.schemas import Transaction as TransactionSchema
from app.routers.auth import get_current_user

router = APIRouter()

@router.get("/")
def get_all(
    skip: int = 0, 
    limit: int = 100, 
    customer_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Transaction).join(Customer).filter(Customer.created_by == current_user.id)
    
    if customer_id:
        query = query.filter(Transaction.customer_id == customer_id)
    
    transactions = query.order_by(Transaction.transaction_date.desc()).offset(skip).limit(limit).all()
    
    result = []
    for transaction in transactions:
        customer = db.query(Customer).filter(Customer.id == transaction.customer_id).first()
        
        transaction_dict = {
            'id': transaction.id,
            'transaction_id': transaction.transaction_id,
            'customer_id': transaction.customer_id,
            'customer_name': customer.full_name if customer else '',
            'customer_phone': customer.mobile if customer else '',
            'collected_by': transaction.collected_by,
            'transaction_type': transaction.transaction_type,
            'amount': transaction.amount,
            'balance_after': transaction.balance_after,
            'description': transaction.description,
            'transaction_date': transaction.transaction_date,
            'created_at': transaction.created_at,
            'collector_name': None
        }
        
        if transaction.collected_by:
            collector = db.query(User).filter(User.id == transaction.collected_by).first()
            if collector:
                transaction_dict['collector_name'] = collector.full_name or collector.username
        
        result.append(transaction_dict)
    
    return result

@router.get("/{id}", response_model=TransactionSchema)
def get_one(
    id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    transaction = db.query(Transaction).join(Customer).filter(
        Transaction.id == id,
        Customer.created_by == current_user.id
    ).first()
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return transaction
