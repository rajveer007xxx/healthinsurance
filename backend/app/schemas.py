from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

class Token(BaseModel):
    access_token: str
    token_type: str
    user_type: str
    user_id: int
    company_id: Optional[int] = None

class LoginRequest(BaseModel):
    email: str
    password: str

class CustomerLoginRequest(BaseModel):
    mobile: str
    password: str

class CompanyCreate(BaseModel):
    company_name: str
    contact_email: EmailStr
    contact_mobile: str
    address: Optional[str] = None
    city: Optional[str] = None
    pincode: Optional[str] = None
    gst_number: Optional[str] = None

class CompanyResponse(BaseModel):
    id: int
    company_name: str
    contact_email: str
    contact_mobile: str
    status: str
    created_date: datetime
    
    class Config:
        from_attributes = True

class AdminCreate(BaseModel):
    company_id: int
    name: str
    email: EmailStr
    mobile: str
    password: str
    network_name: Optional[str] = None

class AdminUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    mobile: Optional[str] = None
    network_name: Optional[str] = None
    network_address: Optional[str] = None
    city: Optional[str] = None
    pincode: Optional[str] = None
    bank_name: Optional[str] = None
    account_no: Optional[str] = None
    ifsc_code: Optional[str] = None
    branch_code: Optional[str] = None
    branch_location: Optional[str] = None

class AdminResponse(BaseModel):
    id: int
    company_id: int
    name: str
    email: str
    mobile: str
    status: str
    
    class Config:
        from_attributes = True

class EmployeeCreate(BaseModel):
    name: str
    email: EmailStr
    mobile: str
    password: str
    role: str
    permissions: Optional[dict] = None
    assigned_areas: Optional[List[int]] = None

class EmployeeResponse(BaseModel):
    id: int
    company_id: int
    name: str
    email: str
    mobile: str
    role: str
    status: str
    
    class Config:
        from_attributes = True

class CustomerCreate(BaseModel):
    service_type: str  # Broadband or Cable TV
    name: str
    email: Optional[EmailStr] = None
    mobile: str
    password: Optional[str] = None  # Password for customer portal login (auto-generated if not provided)
    alternate_mobile: Optional[str] = None
    address: str
    locality: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None
    plan_id: Optional[int] = None
    installation_amount: float = 0
    security_amount: float = 0
    start_date: Optional[datetime] = None
    billing_amount: Optional[float] = None
    auto_renewal: bool = False
    gst_invoice_needed: bool = False  # NEW: GST Invoice feature
    mac_address: Optional[str] = None
    ip_address: Optional[str] = None
    connections: Optional[List[dict]] = None  # For Cable TV
    assigned_employee_id: Optional[int] = None

class CustomerUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    mobile: Optional[str] = None
    alternate_mobile: Optional[str] = None
    address: Optional[str] = None
    locality: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None
    plan_id: Optional[int] = None
    installation_amount: Optional[float] = None
    security_amount: Optional[float] = None
    start_date: Optional[datetime] = None
    billing_amount: Optional[float] = None
    auto_renewal: Optional[bool] = None
    gst_invoice_needed: Optional[bool] = None  # NEW: GST Invoice feature
    mac_address: Optional[str] = None
    ip_address: Optional[str] = None
    connections: Optional[List[dict]] = None
    status: Optional[str] = None
    assigned_employee_id: Optional[int] = None

class CustomerResponse(BaseModel):
    id: int
    company_id: int
    service_type: str
    name: str
    mobile: str
    address: str
    status: str
    gst_invoice_needed: bool  # NEW: GST Invoice feature
    created_date: datetime
    
    class Config:
        from_attributes = True

class PlanCreate(BaseModel):
    service_type: str
    plan_name: str
    price: float
    validity_days: int
    features: Optional[str] = None

class PlanResponse(BaseModel):
    id: int
    company_id: int
    service_type: str
    plan_name: str
    price: float
    validity_days: int
    status: str
    
    class Config:
        from_attributes = True

class PaymentCreate(BaseModel):
    customer_id: int
    amount: float
    payment_mode: str
    transaction_id: Optional[str] = None
    notes: Optional[str] = None

class PaymentResponse(BaseModel):
    id: int
    company_id: int
    customer_id: int
    amount: float
    payment_mode: str
    payment_date: datetime
    receipt_number: Optional[str] = None
    
    class Config:
        from_attributes = True

class InvoiceCreate(BaseModel):
    customer_id: int
    amount: float
    due_date: Optional[datetime] = None

class InvoiceResponse(BaseModel):
    id: int
    company_id: int
    customer_id: int
    invoice_number: str
    amount: float
    status: str
    created_date: datetime
    
    class Config:
        from_attributes = True

class ComplaintCreate(BaseModel):
    customer_id: int
    complaint_type: str
    description: str
    priority: str = "medium"

class ComplaintResponse(BaseModel):
    id: int
    company_id: int
    customer_id: int
    complaint_type: str
    description: str
    priority: str
    status: str
    created_date: datetime
    
    class Config:
        from_attributes = True

class EmployeeLocationCreate(BaseModel):
    latitude: float
    longitude: float
    accuracy: Optional[float] = None
    battery_level: Optional[int] = None

class EmployeeLocationResponse(BaseModel):
    id: int
    employee_id: int
    latitude: float
    longitude: float
    timestamp: datetime
    
    class Config:
        from_attributes = True
