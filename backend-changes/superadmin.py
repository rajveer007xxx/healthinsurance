from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from sqlalchemy import func, text
from app.core.database import get_db
from app.core.security import verify_password, get_password_hash
from app.models.models import User, Company, Customer, Invoice
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime, date
import secrets
import os
import shutil
import random

router = APIRouter()
security = HTTPBearer()
active_tokens = {}

class SuperAdminLogin(BaseModel):
    username: str
    password: str

class AdminCreate(BaseModel):
    admin_name: str
    username: str
    password: str
    company_name: str
    address: str
    email: EmailStr
    mobile: str
    state: str
    gst_number: str
    start_date: date
    end_date: date
    terms_and_conditions: str
    declaration: str
    bank_account_name: str
    bank_account_number: str
    bank_branch: str
    bank_ifsc: str
    admin_image: Optional[str] = None
    company_logo: Optional[str] = None

class AdminUpdate(BaseModel):
    admin_name: Optional[str] = None
    username: Optional[str] = None
    password: Optional[str] = None
    company_name: Optional[str] = None
    address: Optional[str] = None
    email: Optional[EmailStr] = None
    mobile: Optional[str] = None
    state: Optional[str] = None
    gst_number: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    terms_and_conditions: Optional[str] = None
    declaration: Optional[str] = None
    bank_account_name: Optional[str] = None
    bank_account_number: Optional[str] = None
    bank_branch: Optional[str] = None
    bank_ifsc: Optional[str] = None
    admin_image: Optional[str] = None
    company_logo: Optional[str] = None
    status: Optional[str] = None

class PackageCreate(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    validity_months: int
    features: Optional[str] = None

class PackageUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    validity_months: Optional[int] = None
    features: Optional[str] = None
    is_active: Optional[bool] = None

class InvoiceCreate(BaseModel):
    admin_id: int
    amount: float
    due_date: Optional[str] = None
    notes: Optional[str] = None

STATE_CODES = {
    "Andhra Pradesh": "37", "Arunachal Pradesh": "12", "Assam": "18",
    "Bihar": "10", "Chhattisgarh": "22", "Goa": "30", "Gujarat": "24",
    "Haryana": "06", "Himachal Pradesh": "02", "Jharkhand": "20",
    "Karnataka": "29", "Kerala": "32", "Madhya Pradesh": "23",
    "Maharashtra": "27", "Manipur": "14", "Meghalaya": "17",
    "Mizoram": "15", "Nagaland": "13", "Odisha": "21", "Punjab": "03",
    "Rajasthan": "08", "Sikkim": "11", "Tamil Nadu": "33",
    "Telangana": "36", "Tripura": "16", "Uttar Pradesh": "09",
    "Uttarakhand": "05", "West Bengal": "19", "Delhi": "07"
}

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    if token not in active_tokens:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    return active_tokens[token]

def generate_company_code():
    return str(random.randint(10000000, 99999999))

@router.post("/login")
async def superadmin_login(credentials: SuperAdminLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == credentials.username).first()
    if not user or not verify_password(credentials.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    if user.role != "ADMIN" and user.username != "rajveersuper":
        raise HTTPException(status_code=403, detail="Access denied")
    token = secrets.token_urlsafe(32)
    active_tokens[token] = {"username": credentials.username, "role": "superadmin"}
    return {"token": token, "user": {"username": credentials.username, "role": "superadmin"}}

@router.get("/dashboard/stats")
async def get_dashboard_stats(user=Depends(verify_token), db: Session = Depends(get_db)):
    total_admins = db.query(User).filter(User.role == "ADMIN").count()
    active_admins = db.query(User).filter(User.role == "ADMIN", User.is_active == True).count()
    total_customers = db.query(Customer).count()
    active_customers = db.query(Customer).filter(Customer.status == "ACTIVE").count()
    total_revenue = db.query(func.sum(Invoice.total_amount)).scalar() or 0
    total_invoices = db.query(Invoice).count()
    return {"total_admins": total_admins, "active_admins": active_admins, "inactive_admins": total_admins - active_admins,
            "recent_admins": 0, "total_customers": total_customers, "active_customers": active_customers,
            "total_revenue": float(total_revenue), "total_invoices": total_invoices, "pending_invoices": 0}

@router.get("/admins")
async def get_admins(user=Depends(verify_token), db: Session = Depends(get_db)):
    admins = db.query(User).filter(User.role == "ADMIN").all()
    result = []
    for admin in admins:
        company = db.query(Company).filter(Company.id == admin.company_id).first()
        customer_count = db.query(Customer).filter(Customer.company_id == admin.company_id).count() if admin.company_id else 0
        result.append({
            "id": admin.id, "admin_name": admin.full_name, "username": admin.username, "password": "********",
            "company_id": company.company_code if company else "", "company_name": company.name if company else "",
            "address": company.address if company else "", "email": admin.email, "mobile": admin.phone,
            "state": admin.state or (company.state if company else ""), "state_code": company.state_code if company else "",
            "gst_number": company.gst_no if company else "", "start_date": admin.subscription_start_date or "",
            "end_date": admin.subscription_end_date or "", "role": "Admin",
            "terms_and_conditions": company.terms_and_conditions if company else "",
            "declaration": company.declaration if company else "", "bank_account_name": admin.bank_account_name or "",
            "bank_account_number": admin.bank_account_number or "", "bank_branch": admin.bank_branch or "",
            "bank_ifsc": admin.bank_ifsc or "", "admin_image": admin.profile_image or "",
            "company_logo": company.company_logo if company else "", "status": "active" if admin.is_active else "deactivated",
            "created_at": admin.created_at.isoformat() if admin.created_at else "",
            "updated_at": admin.updated_at.isoformat() if admin.updated_at else "", "customer_count": customer_count
        })
    return result

@router.post("/admins")
async def create_admin(admin: AdminCreate, user=Depends(verify_token), db: Session = Depends(get_db)):
    if db.query(User).filter(User.username == admin.username).first():
        raise HTTPException(status_code=400, detail="Username already exists")
    company_code = generate_company_code()
    state_code = STATE_CODES.get(admin.state, "00")
    new_company = Company(name=admin.company_name, address=admin.address, phone=admin.mobile, email=admin.email,
                          gst_no=admin.gst_number, company_code=company_code, state=admin.state, state_code=state_code,
                          terms_and_conditions=admin.terms_and_conditions, declaration=admin.declaration, company_logo=admin.company_logo)
    db.add(new_company)
    db.flush()
    new_admin = User(username=admin.username, email=admin.email, password_hash=get_password_hash(admin.password),
                    full_name=admin.admin_name, phone=admin.mobile, role="ADMIN", is_active=True, company_id=new_company.id,
                    profile_image=admin.admin_image, state=admin.state, subscription_start_date=admin.start_date.isoformat(),
                    subscription_end_date=admin.end_date.isoformat(), bank_account_name=admin.bank_account_name,
                    bank_account_number=admin.bank_account_number, bank_branch=admin.bank_branch, bank_ifsc=admin.bank_ifsc)
    db.add(new_admin)
    db.commit()
    db.refresh(new_admin)
    return {"id": new_admin.id, "admin_name": new_admin.full_name, "username": new_admin.username,
            "company_id": company_code, "company_name": admin.company_name, "email": new_admin.email,
            "mobile": new_admin.phone, "status": "active", "created_at": new_admin.created_at.isoformat()}

@router.put("/admins/{admin_id}")
async def update_admin(admin_id: int, admin_update: AdminUpdate, user=Depends(verify_token), db: Session = Depends(get_db)):
    admin = db.query(User).filter(User.id == admin_id, User.role == "ADMIN").first()
    if not admin:
        raise HTTPException(status_code=404, detail="Admin not found")
    if admin_update.admin_name:
        admin.full_name = admin_update.admin_name
    if admin_update.email:
        admin.email = admin_update.email
    if admin_update.mobile:
        admin.phone = admin_update.mobile
    if admin_update.password:
        admin.password_hash = get_password_hash(admin_update.password)
    if admin_update.admin_image:
        admin.profile_image = admin_update.admin_image
    if admin_update.status:
        admin.is_active = (admin_update.status == "active")
    if admin_update.state:
        admin.state = admin_update.state
    if admin_update.start_date:
        admin.subscription_start_date = admin_update.start_date.isoformat()
    if admin_update.end_date:
        admin.subscription_end_date = admin_update.end_date.isoformat()
    if admin_update.bank_account_name:
        admin.bank_account_name = admin_update.bank_account_name
    if admin_update.bank_account_number:
        admin.bank_account_number = admin_update.bank_account_number
    if admin_update.bank_branch:
        admin.bank_branch = admin_update.bank_branch
    if admin_update.bank_ifsc:
        admin.bank_ifsc = admin_update.bank_ifsc
    if admin.company_id:
        company = db.query(Company).filter(Company.id == admin.company_id).first()
        if company:
            if admin_update.company_name:
                company.name = admin_update.company_name
            if admin_update.address:
                company.address = admin_update.address
            if admin_update.gst_number:
                company.gst_no = admin_update.gst_number
            if admin_update.state:
                company.state = admin_update.state
                company.state_code = STATE_CODES.get(admin_update.state, "00")
            if admin_update.terms_and_conditions:
                company.terms_and_conditions = admin_update.terms_and_conditions
            if admin_update.declaration:
                company.declaration = admin_update.declaration
            if admin_update.company_logo:
                company.company_logo = admin_update.company_logo
    admin.updated_at = datetime.utcnow()
    db.commit()
    return {"message": "Admin updated successfully"}

@router.post("/admins/{admin_id}/deactivate")
async def deactivate_admin(admin_id: int, user=Depends(verify_token), db: Session = Depends(get_db)):
    admin = db.query(User).filter(User.id == admin_id, User.role == "ADMIN").first()
    if not admin:
        raise HTTPException(status_code=404, detail="Admin not found")
    admin.is_active = False
    admin.updated_at = datetime.utcnow()
    db.commit()
    return {"message": "Admin deactivated successfully"}

@router.post("/admins/{admin_id}/activate")
async def activate_admin(admin_id: int, user=Depends(verify_token), db: Session = Depends(get_db)):
    admin = db.query(User).filter(User.id == admin_id, User.role == "ADMIN").first()
    if not admin:
        raise HTTPException(status_code=404, detail="Admin not found")
    admin.is_active = True
    admin.updated_at = datetime.utcnow()
    db.commit()
    return {"message": "Admin activated successfully"}

@router.delete("/admins/{admin_id}")
async def delete_admin(admin_id: int, user=Depends(verify_token), db: Session = Depends(get_db)):
    admin = db.query(User).filter(User.id == admin_id, User.role == "ADMIN").first()
    if not admin:
        raise HTTPException(status_code=404, detail="Admin not found")
    db.delete(admin)
    db.commit()
    return {"message": "Admin deleted successfully"}

@router.get("/states")
async def get_states():
    return [{"name": state, "code": code} for state, code in STATE_CODES.items()]

@router.post("/upload/admin-image")
async def upload_admin_image(file: UploadFile = File(...), user=Depends(verify_token)):
    upload_dir = "/var/www/uploads/admins"
    os.makedirs(upload_dir, exist_ok=True)
    file_extension = os.path.splitext(file.filename)[1]
    unique_filename = f"{secrets.token_urlsafe(16)}{file_extension}"
    file_path = os.path.join(upload_dir, unique_filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    return {"file_path": f"/uploads/admins/{unique_filename}"}

@router.post("/upload/company-logo")
async def upload_company_logo(file: UploadFile = File(...), user=Depends(verify_token)):
    upload_dir = "/var/www/uploads/companies"
    os.makedirs(upload_dir, exist_ok=True)
    file_extension = os.path.splitext(file.filename)[1]
    unique_filename = f"{secrets.token_urlsafe(16)}{file_extension}"
    file_path = os.path.join(upload_dir, unique_filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    return {"file_path": f"/uploads/companies/{unique_filename}"}

@router.get("/greeting-message")
async def get_greeting_message(user=Depends(verify_token), db: Session = Depends(get_db)):
    company = db.query(Company).first()
    return {"message": company.greeting_message if company and company.greeting_message else ""}

@router.post("/greeting-message")
async def set_greeting_message(data: dict, user=Depends(verify_token), db: Session = Depends(get_db)):
    message = data.get("message", "")
    for company in db.query(Company).all():
        company.greeting_message = message
    db.commit()
    return {"message": "Greeting message updated successfully"}

@router.get("/packages")
async def get_packages(user=Depends(verify_token), db: Session = Depends(get_db)):
    result = db.execute(text("SELECT * FROM packages ORDER BY created_at DESC"))
    return [{"id": r[0], "name": r[1], "description": r[2], "price": r[3], "validity_months": r[4],
             "features": r[5], "is_active": bool(r[6]), "created_at": r[7], "updated_at": r[8]} for r in result]

@router.post("/packages")
async def create_package(package: PackageCreate, user=Depends(verify_token), db: Session = Depends(get_db)):
    result = db.execute(text("""INSERT INTO packages (name, description, price, validity_months, features, is_active, created_at, updated_at)
           VALUES (:name, :description, :price, :validity_months, :features, 1, datetime('now'), datetime('now'))"""),
        {"name": package.name, "description": package.description, "price": package.price,
         "validity_months": package.validity_months, "features": package.features})
    db.commit()
    return {"message": "Package created successfully", "id": result.lastrowid}

@router.put("/packages/{package_id}")
async def update_package(package_id: int, package: PackageUpdate, user=Depends(verify_token), db: Session = Depends(get_db)):
    updates, params = [], {"package_id": package_id}
    if package.name is not None:
        updates.append("name = :name")
        params["name"] = package.name
    if package.description is not None:
        updates.append("description = :description")
        params["description"] = package.description
    if package.price is not None:
        updates.append("price = :price")
        params["price"] = package.price
    if package.validity_months is not None:
        updates.append("validity_months = :validity_months")
        params["validity_months"] = package.validity_months
    if package.features is not None:
        updates.append("features = :features")
        params["features"] = package.features
    if package.is_active is not None:
        updates.append("is_active = :is_active")
        params["is_active"] = 1 if package.is_active else 0
    if updates:
        updates.append("updated_at = datetime('now')")
        db.execute(text(f"UPDATE packages SET {', '.join(updates)} WHERE id = :package_id"), params)
        db.commit()
    return {"message": "Package updated successfully"}

@router.delete("/packages/{package_id}")
async def delete_package(package_id: int, user=Depends(verify_token), db: Session = Depends(get_db)):
    db.execute(text("DELETE FROM packages WHERE id = :package_id"), {"package_id": package_id})
    db.commit()
    return {"message": "Package deleted successfully"}

@router.get("/invoices")
async def get_invoices(user=Depends(verify_token), db: Session = Depends(get_db)):
    result = db.execute(text("""SELECT si.*, u.full_name as admin_name, u.username, c.name as company_name
        FROM superadmin_invoices si JOIN users u ON si.admin_id = u.id
        LEFT JOIN companies c ON u.company_id = c.id ORDER BY si.created_at DESC"""))
    return [{"id": r[0], "admin_id": r[1], "invoice_number": r[2], "amount": r[3], "due_date": r[4],
             "status": r[5], "notes": r[6], "created_at": r[7], "updated_at": r[8],
             "admin_name": r[9], "username": r[10], "company_name": r[11]} for r in result]

@router.post("/invoices")
async def create_invoice(invoice: InvoiceCreate, user=Depends(verify_token), db: Session = Depends(get_db)):
    invoice_number = f"INV-{random.randint(100000, 999999)}"
    result = db.execute(text("""INSERT INTO superadmin_invoices (admin_id, invoice_number, amount, due_date, status, notes, created_at, updated_at)
           VALUES (:admin_id, :invoice_number, :amount, :due_date, 'pending', :notes, datetime('now'), datetime('now'))"""),
        {"admin_id": invoice.admin_id, "invoice_number": invoice_number, "amount": invoice.amount,
         "due_date": invoice.due_date, "notes": invoice.notes})
    db.commit()
    return {"message": "Invoice created successfully", "id": result.lastrowid, "invoice_number": invoice_number}

@router.put("/invoices/{invoice_id}/status")
async def update_invoice_status(invoice_id: int, data: dict, user=Depends(verify_token), db: Session = Depends(get_db)):
    db.execute(text("UPDATE superadmin_invoices SET status = :status, updated_at = datetime('now') WHERE id = :invoice_id"),
        {"status": data.get("status", "pending"), "invoice_id": invoice_id})
    db.commit()
    return {"message": "Invoice status updated successfully"}
