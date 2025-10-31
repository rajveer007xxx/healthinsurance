from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, func
from typing import List, Optional
from datetime import datetime, timedelta
from app.utils.timezone import get_ist_now
from app.core.database import get_db
from app.core.security import get_password_hash
from app.models.models import Customer, Plan, Invoice, Payment as PaymentModel, User, AddonBill
from app.schemas.schemas import CustomerCreate, CustomerUpdate, Customer as CustomerSchema
from app.routers.auth import get_current_user
from pydantic import BaseModel
import random
import string

router = APIRouter()

class CustomerResponse(BaseModel):
    id: int
    customer_id: str
    caf_no: Optional[str] = None
    full_name: str
    username: str
    email: Optional[str] = None
    phone: Optional[str] = None
    mobile: str
    address: Optional[str] = None
    billing_type: str
    status: str
    plan_amount: float = 0.0
    cgst_tax: float = 0.0
    sgst_tax: float = 0.0
    igst_tax: float = 0.0
    amount_paid: float = 0.0
    balance: float = 0.0
    expiry_date: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    service_type: str
    locality_id: Optional[int] = None
    company_id: Optional[int] = None
    auto_renew: bool = False
    plan_name: Optional[str] = None
    plan_id: Optional[int] = None
    
    class Config:
        from_attributes = True

def generate_customer_id(db: Session) -> str:
    """Generate unique customer ID"""
    while True:
        customer_id = ''.join(random.choices(string.digits, k=10))
        existing = db.query(Customer).filter(Customer.customer_id == customer_id).first()
        if not existing:
            return customer_id

@router.post("/", response_model=CustomerSchema)
def create_customer(
    customer_data: CustomerCreate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    existing = db.query(Customer).filter(Customer.username == customer_data.username).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already exists"
        )
    
    customer_id = generate_customer_id(db)
    
    end_date = customer_data.start_date + timedelta(days=customer_data.period_months * 30)
    
    hashed_password = get_password_hash(customer_data.password)
    
    company_id = customer_data.company_id
    if company_id is None and current_user.company_id:
        company_id = current_user.company_id
    
    new_customer = Customer(
        customer_id=customer_id,
        username=customer_data.username,
        password_hash=hashed_password,
        full_name=customer_data.full_name,
        nickname=customer_data.nickname,
        email=customer_data.email,
        mobile=customer_data.mobile,
        alternate_mobile=customer_data.alternate_mobile,
        customer_gst_no=customer_data.customer_gst_no,
        id_proof_type=customer_data.id_proof_type,
        id_proof_no=customer_data.id_proof_no,
        house_number=customer_data.house_number,
        address=customer_data.address,
        locality_id=customer_data.locality_id,
        city=customer_data.city,
        state=customer_data.state,
        pincode=customer_data.pincode,
        service_type=customer_data.service_type,
        no_of_connections=customer_data.no_of_connections,
        company_id=company_id,
        auto_renew=customer_data.auto_renew,
        caf_no=customer_data.caf_no,
        mac_address=customer_data.mac_address,
        mac_address_detail=customer_data.mac_address_detail,
        ip_address=customer_data.ip_address,
        vendor=customer_data.vendor,
        modem_no=customer_data.modem_no,
        modem_no_detail=customer_data.modem_no_detail,
        stb_modem_security_amount=customer_data.stb_modem_security_amount,
        plan_id=customer_data.plan_id,
        period_months=customer_data.period_months,
        start_date=customer_data.start_date,
        end_date=end_date,
        billing_type=customer_data.billing_type,
        assigned_employee_id=customer_data.assigned_employee_id,
        created_by=current_user.id,
        status="ACTIVE"
    )
    
    db.add(new_customer)
    db.commit()
    db.refresh(new_customer)
    
    plan = db.query(Plan).filter(Plan.id == customer_data.plan_id).first()
    if plan:
        invoice_number = f"INV{customer_id}{get_ist_now().strftime('%Y%m%d%H%M%S')}"
        
        if customer_data.billing_type == "PREPAID":
            invoice_date = customer_data.start_date
            due_date = customer_data.start_date + timedelta(days=7)
        else:
            invoice_date = end_date
            due_date = end_date + timedelta(days=7)
        
        cgst_tax = customer_data.cgst_tax or 0.0
        sgst_tax = customer_data.sgst_tax or 0.0
        igst_tax = customer_data.igst_tax or 0.0
        installation_charges = customer_data.installation_charges or 0.0
        discount = customer_data.discount or 0.0
        amount_paid = customer_data.amount_paid or 0.0
        period_months = customer_data.period_months or 1
        
        plan_amount_total = plan.price * period_months
        cgst_tax_total = cgst_tax * period_months
        sgst_tax_total = sgst_tax * period_months
        igst_tax_total = igst_tax * period_months
        
        total_amount = plan_amount_total + cgst_tax_total + sgst_tax_total + igst_tax_total + installation_charges + customer_data.stb_modem_security_amount - discount
        balance_amount = total_amount - amount_paid
        
        new_invoice = Invoice(
            invoice_number=invoice_number,
            customer_id=new_customer.id,
            bill_amount=plan_amount_total,
            cgst_tax=cgst_tax_total,
            sgst_tax=sgst_tax_total,
            igst_tax=igst_tax_total,
            installation_charges=installation_charges,
            discount=discount,
            total_amount=total_amount,
            paid_amount=amount_paid,
            balance_amount=balance_amount,
            invoice_date=invoice_date,
            due_date=due_date,
            billing_period_start=customer_data.start_date,
            billing_period_end=end_date,
            status="SENT" if amount_paid > 0 else "DRAFT"
        )
        db.add(new_invoice)
        db.commit()
        db.refresh(new_invoice)
        
        if amount_paid > 0 and customer_data.payment_method:
            import random
            transaction_id = customer_data.payment_id or ('TXN' + str(random.randint(10000000, 99999999)))
            new_payment = PaymentModel(
                customer_id=new_customer.id,
                invoice_id=new_invoice.id,
                amount=amount_paid,
                payment_method=customer_data.payment_method,
                transaction_id=transaction_id,
                payment_date=get_ist_now(),
                status="COMPLETED"
            )
            db.add(new_payment)
            db.commit()
    
    return new_customer

@router.get("/", response_model=List[CustomerResponse])
def get_customers(
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = None,
    service_type: Optional[str] = None,
    search: Optional[str] = None,
    locality_id: Optional[int] = None,
    company_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Customer)
    
    if current_user.role == "SUPERADMIN":
        pass
    elif current_user.role == "ADMIN":
        if current_user.company_id:
            query = query.filter(Customer.company_id == current_user.company_id)
    elif current_user.role == "EMPLOYEE":
        if current_user.company_id:
            query = query.filter(Customer.company_id == current_user.company_id)
        else:
            query = query.filter(Customer.created_by == current_user.id)
    
    if status:
        query = query.filter(Customer.status == status)
    if service_type:
        query = query.filter(Customer.service_type == service_type)
    if locality_id:
        query = query.filter(Customer.locality_id == locality_id)
    if company_id:
        query = query.filter(Customer.company_id == company_id)
    if search:
        query = query.filter(
            or_(
                Customer.full_name.ilike(f"%{search}%"),
                Customer.customer_id.ilike(f"%{search}%"),
                Customer.mobile.ilike(f"%{search}%")
            )
        )
    
    customers = query.offset(skip).limit(limit).all()
    
    enhanced_customers = []
    for customer in customers:
        plan_amount = 0.0
        cgst_tax = 0.0
        sgst_tax = 0.0
        igst_tax = 0.0
        plan_name = None
        if customer.plan_id:
            plan = db.query(Plan).filter(Plan.id == customer.plan_id).first()
            if plan:
                plan_amount = plan.price
                plan_name = plan.name
                cgst_tax = plan.price * (plan.cgst_percentage / 100) if plan.cgst_percentage else 0.0
                sgst_tax = plan.price * (plan.sgst_percentage / 100) if plan.sgst_percentage else 0.0
                igst_tax = plan.price * (plan.igst_percentage / 100) if plan.igst_percentage else 0.0
        
        from app.models.models import Transaction, RenewalCycle
        from datetime import datetime
        
        current_date = datetime.now()
        current_cycle = db.query(RenewalCycle).filter(
            RenewalCycle.customer_id == customer.id,
            RenewalCycle.cycle_start <= current_date,
            (RenewalCycle.cycle_end.is_(None)) | (RenewalCycle.cycle_end >= current_date)
        ).first()
        
        if current_cycle:
            amount_paid = db.query(func.sum(PaymentModel.amount)).filter(
                PaymentModel.customer_id == customer.id,
                PaymentModel.status == "COMPLETED",
                PaymentModel.cycle_id == current_cycle.id
            ).scalar() or 0
        else:
            amount_paid = db.query(func.sum(PaymentModel.amount)).filter(
                PaymentModel.customer_id == customer.id,
                PaymentModel.status == "COMPLETED"
            ).scalar() or 0.0
        
        invoice_balance = db.query(func.sum(Invoice.balance_amount)).filter(
            Invoice.customer_id == customer.id
        ).scalar() or 0
        
        addon_balance = db.query(func.sum(AddonBill.balance_amount)).filter(
            AddonBill.customer_id == customer.id
        ).scalar() or 0
        
        balance = round(invoice_balance + addon_balance)
        
        expiry_date = customer.end_date.strftime('%Y-%m-%d') if customer.end_date else None
        
        total_amount_with_tax = plan_amount + cgst_tax + sgst_tax + igst_tax
        
        enhanced_customer = CustomerResponse(
            id=customer.id,
            customer_id=customer.customer_id,
            caf_no=customer.caf_no,
            full_name=customer.full_name,
            username=customer.username,
            email=customer.email,
            phone=customer.mobile,
            mobile=customer.mobile,
            address=customer.address,
            billing_type=customer.billing_type.value if customer.billing_type else "PREPAID",
            status=customer.status.value if customer.status else "ACTIVE",
            plan_amount=int(round(total_amount_with_tax)),
            cgst_tax=int(round(cgst_tax)),
            sgst_tax=int(round(sgst_tax)),
            igst_tax=int(round(igst_tax)),
            amount_paid=int(round(amount_paid)),
            balance=int(round(balance)),
            expiry_date=expiry_date,
            start_date=customer.start_date,
            end_date=customer.end_date,
            service_type=customer.service_type.value if customer.service_type else "BROADBAND",
            locality_id=customer.locality_id,
            company_id=customer.company_id,
            auto_renew=customer.auto_renew,
            plan_name=plan_name,
            plan_id=customer.plan_id
        )
        enhanced_customers.append(enhanced_customer)
    
    return enhanced_customers

@router.get("/{customer_id}")
def get_customer(
    customer_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    customer = db.query(Customer).filter(
        Customer.id == customer_id,
        Customer.created_by == current_user.id
    ).first()
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Customer not found"
        )
    
    plan_amount = 0.0
    cgst_tax = 0.0
    sgst_tax = 0.0
    igst_tax = 0.0
    if customer.plan_id:
        plan = db.query(Plan).filter(Plan.id == customer.plan_id).first()
        if plan:
            plan_amount = plan.price
            cgst_tax = plan.price * (plan.cgst_percentage / 100) if plan.cgst_percentage else 0.0
            sgst_tax = plan.price * (plan.sgst_percentage / 100) if plan.sgst_percentage else 0.0
            igst_tax = plan.price * (plan.igst_percentage / 100) if plan.igst_percentage else 0.0
    
    from app.models.models import Transaction
    latest_renewal = db.query(Transaction).filter(
        Transaction.customer_id == customer.id,
        Transaction.transaction_type == "RENEWAL"
    ).order_by(Transaction.transaction_date.desc()).first()
    
    if latest_renewal:
        renewal_datetime = latest_renewal.transaction_date
        amount_paid = db.query(func.sum(PaymentModel.amount)).filter(
            PaymentModel.customer_id == customer.id,
            PaymentModel.status == "COMPLETED",
            PaymentModel.payment_date >= renewal_datetime
        ).scalar() or 0
    else:
        amount_paid = db.query(func.sum(PaymentModel.amount)).filter(
            PaymentModel.customer_id == customer.id,
            PaymentModel.status == "COMPLETED"
        ).scalar() or 0.0
    
    invoice_balance = db.query(func.sum(Invoice.balance_amount)).filter(
        Invoice.customer_id == customer.id
    ).scalar() or 0.0
    
    addon_balance = db.query(func.sum(AddonBill.balance_amount)).filter(
        AddonBill.customer_id == customer.id
    ).scalar() or 0.0
    
    balance = invoice_balance + addon_balance
    
    customer_dict = {
        "id": customer.id,
        "customer_id": customer.customer_id,
        "username": customer.username,
        "full_name": customer.full_name,
        "nickname": customer.nickname,
        "email": customer.email,
        "phone": customer.mobile,
        "mobile": customer.mobile,
        "alternate_mobile": customer.alternate_mobile,
        "customer_gst_no": customer.customer_gst_no,
        "customer_state_code": customer.customer_state_code,
        "gst_invoice_needed": customer.gst_invoice_needed,
        "id_proof_type": customer.id_proof_type.value if customer.id_proof_type else None,
        "id_proof_no": customer.id_proof_no,
        "house_number": customer.house_number,
        "address": customer.address,
        "locality_id": customer.locality_id,
        "city": customer.city,
        "state": customer.state,
        "pincode": customer.pincode,
        "service_type": customer.service_type.value if customer.service_type else "BROADBAND",
        "billing_type": customer.billing_type.value if customer.billing_type else "PREPAID",
        "no_of_connections": customer.no_of_connections,
        "auto_renew": customer.auto_renew,
        "caf_no": customer.caf_no,
        "mac_address": customer.mac_address,
        "mac_address_detail": customer.mac_address_detail,
        "ip_address": customer.ip_address,
        "vendor": customer.vendor,
        "modem_no": customer.modem_no,
        "modem_no_detail": customer.modem_no_detail,
        "stb_security_amount": customer.stb_modem_security_amount,
        "plan_id": customer.plan_id,
        "period_months": customer.period_months,
        "start_date": customer.start_date.strftime('%Y-%m-%d') if customer.start_date else None,
        "end_date": customer.end_date.strftime('%Y-%m-%d') if customer.end_date else None,
        "status": customer.status.value if customer.status else "ACTIVE",
        "plan_amount": plan_amount,
        "cgst_tax": cgst_tax,
        "sgst_tax": sgst_tax,
        "igst_tax": igst_tax,
        "installation_charges": customer.stb_modem_security_amount or 0.0,
        "discount": 0.0,
        "total_bill_amount": plan_amount + cgst_tax + sgst_tax + igst_tax + (customer.stb_modem_security_amount or 0.0),
        "amount_paid": 0.0,
        "balance": balance,
        "opening_balance": balance,
        "payment_method": "cash",
        "payment_id": "",
        "remarks": ""
    }
    
    return customer_dict

@router.put("/{customer_id}")
def update_customer(
    customer_id: int, 
    customer_data: dict, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Customer).filter(Customer.id == customer_id)
    
    if current_user.role == "SUPERADMIN":
        pass
    elif current_user.role == "ADMIN":
        if current_user.company_id:
            query = query.filter(Customer.company_id == current_user.company_id)
        else:
            query = query.filter(Customer.created_by == current_user.id)
    elif current_user.role == "EMPLOYEE":
        if current_user.company_id:
            query = query.filter(Customer.company_id == current_user.company_id)
        else:
            query = query.filter(Customer.created_by == current_user.id)
    
    customer = query.first()
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Customer not found or you don't have permission to update this customer"
        )
    
    customer_fields = [
        'username', 'full_name', 'nickname', 'email', 'mobile', 'alternate_mobile',
        'customer_gst_no', 'customer_state_code', 'gst_invoice_needed', 'id_proof_type', 'id_proof_no', 'house_number', 'address',
        'locality_id', 'city', 'state', 'pincode', 'service_type', 'no_of_connections',
        'company_id', 'auto_renew', 'caf_no', 'mac_address', 'mac_address_detail',
        'ip_address', 'vendor', 'modem_no', 'modem_no_detail', 'stb_modem_security_amount',
        'plan_id', 'period_months', 'start_date', 'billing_type', 'assigned_employee_id',
        'status'
    ]
    
    for field in customer_fields:
        if field in customer_data and customer_data[field] is not None:
            if field == 'stb_modem_security_amount' and 'stb_security_amount' in customer_data:
                setattr(customer, field, customer_data['stb_security_amount'])
            elif field == 'start_date':
                if isinstance(customer_data[field], str):
                    setattr(customer, field, datetime.strptime(customer_data[field], '%Y-%m-%d'))
                else:
                    setattr(customer, field, customer_data[field])
            else:
                setattr(customer, field, customer_data[field])
    
    if 'balance' in customer_data and customer_data['balance'] is not None:
        total_balance = float(customer_data['balance'])
        
        existing_invoice = db.query(Invoice).filter(
            Invoice.customer_id == customer.id
        ).order_by(Invoice.created_at.desc()).first()
        
        if existing_invoice:
            existing_invoice.balance_amount = total_balance
        else:
            invoice_number = f"INV{customer.customer_id}{get_ist_now().strftime('%Y%m%d%H%M%S')}"
            period_months = customer_data.get('period_months', 1)
            plan_amount = customer_data.get('plan_amount', 0) * period_months
            cgst_tax = customer_data.get('cgst_tax', 0) * period_months
            sgst_tax = customer_data.get('sgst_tax', 0) * period_months
            igst_tax = customer_data.get('igst_tax', 0) * period_months
            installation_charges = customer_data.get('installation_charges', 0)
            discount = customer_data.get('discount', 0)
            total_bill_amount = plan_amount + cgst_tax + sgst_tax + igst_tax + installation_charges - discount
            
            new_invoice = Invoice(
                invoice_number=invoice_number,
                customer_id=customer.id,
                bill_amount=plan_amount,
                cgst_tax=cgst_tax,
                sgst_tax=sgst_tax,
                igst_tax=igst_tax,
                installation_charges=installation_charges,
                discount=discount,
                total_amount=total_bill_amount,
                paid_amount=0.0,
                balance_amount=total_balance,
                invoice_date=get_ist_now(),
                due_date=get_ist_now() + timedelta(days=7),
                billing_period_start=customer.start_date if customer.start_date else get_ist_now(),
                billing_period_end=customer.end_date if customer.end_date else get_ist_now() + timedelta(days=30),
                status="DRAFT"
            )
            db.add(new_invoice)
    
    db.commit()
    db.refresh(customer)
    
    return {"message": "Customer updated successfully", "customer_id": customer.id}

@router.delete("/{customer_id}")
def delete_customer(
    customer_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Customer).filter(Customer.id == customer_id)
    
    if current_user.role == "SUPERADMIN":
        pass  # Superadmin can delete any customer
    elif current_user.role == "ADMIN":
        if current_user.company_id:
            query = query.filter(Customer.company_id == current_user.company_id)
        else:
            query = query.filter(Customer.created_by == current_user.id)
    elif current_user.role == "EMPLOYEE":
        if current_user.company_id:
            query = query.filter(Customer.company_id == current_user.company_id)
        else:
            query = query.filter(Customer.created_by == current_user.id)
    
    customer = query.first()
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Customer not found or you don't have permission to delete this customer"
        )
    
    db.delete(customer)
    db.commit()
    return {"message": "Customer deleted successfully"}

@router.put("/{customer_id}/change-period")
def change_connection_period(
    customer_id: int,
    period_data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Customer).filter(Customer.id == customer_id)
    
    if current_user.role == "SUPERADMIN":
        pass
    elif current_user.role == "ADMIN":
        if current_user.company_id:
            query = query.filter(Customer.company_id == current_user.company_id)
        else:
            query = query.filter(Customer.created_by == current_user.id)
    elif current_user.role == "EMPLOYEE":
        if current_user.company_id:
            query = query.filter(Customer.company_id == current_user.company_id)
        else:
            query = query.filter(Customer.created_by == current_user.id)
    
    customer = query.first()
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Customer not found or you don't have permission to update this customer"
        )
    
    start_date_str = period_data.get('start_date')
    end_date_str = period_data.get('end_date')
    
    if start_date_str:
        customer.start_date = datetime.fromisoformat(start_date_str)
    if end_date_str:
        customer.end_date = datetime.fromisoformat(end_date_str)
    
    db.commit()
    db.refresh(customer)
    return {"message": "Connection period updated successfully", "customer": customer}

@router.put("/{customer_id}/update-balance")
def update_customer_balance(
    customer_id: int,
    balance_data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    from app.models.models import Transaction
    
    query = db.query(Customer).filter(Customer.id == customer_id)
    
    if current_user.role == "SUPERADMIN":
        pass
    elif current_user.role == "ADMIN":
        if current_user.company_id:
            query = query.filter(Customer.company_id == current_user.company_id)
        else:
            query = query.filter(Customer.created_by == current_user.id)
    elif current_user.role == "EMPLOYEE":
        if current_user.company_id:
            query = query.filter(Customer.company_id == current_user.company_id)
        else:
            query = query.filter(Customer.created_by == current_user.id)
    
    customer = query.first()
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Customer not found or you don't have permission to update this customer"
        )
    
    amount = balance_data.get('amount', 0)
    
    latest_invoice = db.query(Invoice).filter(
        Invoice.customer_id == customer.id
    ).order_by(Invoice.due_date.desc()).first()
    
    if latest_invoice:
        latest_invoice.balance_amount += amount
        latest_invoice.total_amount += amount
    
    db.flush()
    
    invoice_balance = db.query(func.sum(Invoice.balance_amount)).filter(
        Invoice.customer_id == customer.id
    ).scalar() or 0.0
    
    addon_balance = db.query(func.sum(AddonBill.balance_amount)).filter(
        AddonBill.customer_id == customer.id
    ).scalar() or 0.0
    
    balance_after = invoice_balance + addon_balance
    
    import random
    transaction_id = 'TXN' + str(random.randint(10000000, 99999999))
    new_transaction = Transaction(
        transaction_id=transaction_id,
        customer_id=customer.id,
        transaction_type="DEBIT",
        amount=amount,
        balance_after=balance_after,
        description=f"Manual due/extra amount added",
        transaction_date=get_ist_now(),
        collected_by=current_user.id
    )
    db.add(new_transaction)
    
    db.commit()
    
    return {"message": "Balance amount updated successfully"}

@router.post("/{customer_id}/renew")
def renew_customer(
    customer_id: int, 
    period_months: int, 
    renew_from_date: Optional[str] = None,
    db: Session = Depends(get_db)
):
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Customer not found"
        )
    
    if renew_from_date:
        start_date = datetime.fromisoformat(renew_from_date).date()
    else:
        today = get_ist_now().date()
        if customer.end_date and customer.end_date.date() > today:
            start_date = customer.end_date.date() + timedelta(days=1)
        else:
            start_date = today
    
    new_end_date = datetime.combine(start_date, datetime.min.time()) + timedelta(days=period_months * 30)
    old_end_date = customer.end_date
    customer.end_date = new_end_date
    customer.status = "ACTIVE"
    
    plan = db.query(Plan).filter(Plan.id == customer.plan_id).first()
    if plan:
        invoice_number = f"INV{customer.customer_id}{get_ist_now().strftime('%Y%m%d%H%M%S')}"
        
        if customer.billing_type == "PREPAID":
            invoice_date = get_ist_now()
            due_date = get_ist_now() + timedelta(days=7)
        else:
            invoice_date = new_end_date
            due_date = new_end_date + timedelta(days=7)
        
        total_amount = plan.price * period_months
        
        if customer.billing_type == "PREPAID":
            billing_period_start = datetime.combine(start_date, datetime.min.time())
            billing_period_end = new_end_date
        else:
            billing_period_end = datetime.combine(start_date, datetime.min.time()) - timedelta(days=1)
            billing_period_start = billing_period_end - timedelta(days=period_months * 30) + timedelta(days=1)
        
        new_invoice = Invoice(
            invoice_number=invoice_number,
            customer_id=customer.id,
            bill_amount=plan.price * period_months,
            cgst_tax=0.0,
            sgst_tax=0.0,
            igst_tax=0.0,
            installation_charges=0.0,
            discount=0.0,
            total_amount=total_amount,
            paid_amount=0.0,
            balance_amount=total_amount,
            invoice_date=invoice_date,
            due_date=due_date,
            billing_period_start=billing_period_start,
            billing_period_end=billing_period_end,
            status="DRAFT"
        )
        db.add(new_invoice)
    
    db.commit()
    db.refresh(customer)
    return {"message": "Customer renewed successfully", "new_end_date": new_end_date}

@router.get("/generate-id/new")
def generate_new_customer_id(db: Session = Depends(get_db)):
    """Generate a new unique customer ID"""
    customer_id = generate_customer_id(db)
    return {"customer_id": customer_id}

@router.get("/expiring/today")
def get_expiring_today(db: Session = Depends(get_db)):
    """Get customers expiring today"""
    today = get_ist_now().date()
    customers = db.query(Customer).filter(
        and_(
            Customer.end_date >= datetime.combine(today, datetime.min.time()),
            Customer.end_date < datetime.combine(today + timedelta(days=1), datetime.min.time()),
            Customer.status == "ACTIVE"
        )
    ).all()
    return customers

@router.get("/expiring/next-3-days")
def get_expiring_next_3_days(db: Session = Depends(get_db)):
    """Get customers expiring in next 3 days"""
    today = get_ist_now().date()
    next_3_days = today + timedelta(days=3)
    customers = db.query(Customer).filter(
        and_(
            Customer.end_date >= datetime.combine(today, datetime.min.time()),
            Customer.end_date < datetime.combine(next_3_days, datetime.min.time()),
            Customer.status == "ACTIVE"
        )
    ).all()
    return customers

@router.post("/{customer_id}/send-payment-link")
def send_payment_link(customer_id: int, db: Session = Depends(get_db)):
    """Send payment reminder email to customer"""
    from app.utils.email_sender import send_payment_reminder_email
    from sqlalchemy import func
    
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    if not customer.email:
        raise HTTPException(status_code=400, detail="Customer has no email address")
    
    from app.models.models import Invoice
    balance = db.query(func.sum(Invoice.balance_amount)).filter(
        Invoice.customer_id == customer_id,
        Invoice.balance_amount > 0
    ).scalar() or 0.0
    
    if balance <= 0:
        raise HTTPException(status_code=400, detail="Customer has no pending balance")
    
    payment_link = f"http://82.29.162.153/customer/payment/{customer.customer_id}"
    
    try:
        success = send_payment_reminder_email(
            to_email=customer.email,
            customer_name=customer.full_name,
            balance_amount=balance,
            payment_link=payment_link
        )
        
        if success:
            return {"message": "Payment reminder sent successfully", "email": customer.email}
        else:
            raise HTTPException(status_code=500, detail="Failed to send email")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error sending email: {str(e)}")
