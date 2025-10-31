from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
from enum import Enum

class UserRole(str, Enum):
    SUPERADMIN = "SUPERADMIN"
    ADMIN = "ADMIN"
    EMPLOYEE = "EMPLOYEE"
    CUSTOMER = "CUSTOMER"

class CustomerStatus(str, Enum):
    ACTIVE = "ACTIVE"
    DEACTIVE = "DEACTIVE"
    SUSPENDED = "SUSPENDED"

class BillingType(str, Enum):
    PREPAID = "PREPAID"
    POSTPAID = "POSTPAID"

class ServiceType(str, Enum):
    BROADBAND = "BROADBAND"
    CABLE_TV = "CABLE_TV"

class PaymentMethod(str, Enum):
    CASH = "CASH"
    PAYTM = "PAYTM"
    PHONEPE = "PHONEPE"
    GOOGLEPAY = "GOOGLEPAY"
    CHEQUE = "CHEQUE"
    NET_BANKING = "NET_BANKING"
    EXCITEL = "EXCITEL"
    WIOM = "WIOM"

class PaymentStatus(str, Enum):
    PENDING = "PENDING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"

class ComplaintStatus(str, Enum):
    OPEN = "OPEN"
    IN_PROGRESS = "IN_PROGRESS"
    RESOLVED = "RESOLVED"
    CLOSED = "CLOSED"

class InvoiceStatus(str, Enum):
    DRAFT = "DRAFT"
    SENT = "SENT"
    PAID = "PAID"
    OVERDUE = "OVERDUE"
    CANCELLED = "CANCELLED"

class IDProofType(str, Enum):
    VOTER_ID = "VOTER_ID"
    PASSPORT = "PASSPORT"
    DRIVING_LICENSE = "DRIVING_LICENSE"
    SERVICE_ID_CARD = "SERVICE_ID_CARD"
    AADHAR_CARD = "AADHAR_CARD"
    PASSBOOK = "PASSBOOK"
    OTHER = "OTHER"

class UserBase(BaseModel):
    email: EmailStr
    username: str
    full_name: str
    role: UserRole
    phone: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class User(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class CompanyBase(BaseModel):
    name: str
    address: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    gst_no: Optional[str] = None

class CompanyCreate(CompanyBase):
    pass

class Company(CompanyBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class LocalityBase(BaseModel):
    name: str
    city: str
    state: str
    pincode: str

class LocalityCreate(LocalityBase):
    pass

class Locality(LocalityBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class PlanBase(BaseModel):
    name: str
    description: Optional[str] = None
    service_type: ServiceType
    speed: Optional[str] = None
    data_limit: Optional[str] = None
    price: float
    cgst_percentage: float = 0.0
    sgst_percentage: float = 0.0
    igst_percentage: float = 0.0
    validity_months: int = 1
    company_id: Optional[int] = None

class PlanCreate(PlanBase):
    pass

class PlanUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    speed: Optional[str] = None
    data_limit: Optional[str] = None
    price: Optional[float] = None
    cgst_percentage: Optional[float] = None
    sgst_percentage: Optional[float] = None
    igst_percentage: Optional[float] = None
    validity_months: Optional[int] = None
    is_active: Optional[bool] = None

class Plan(PlanBase):
    id: int
    user_id: Optional[int] = None
    total_amount: Optional[float] = None
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class CustomerBase(BaseModel):
    username: str
    full_name: str
    nickname: Optional[str] = None
    email: Optional[str] = None
    mobile: str
    alternate_mobile: Optional[str] = None
    customer_gst_no: Optional[str] = None
    id_proof_type: Optional[IDProofType] = None
    id_proof_no: Optional[str] = None
    
    house_number: Optional[str] = None
    address: Optional[str] = None
    locality_id: Optional[int] = None
    city: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None
    
    service_type: ServiceType
    no_of_connections: int = 1
    company_id: Optional[int] = None
    auto_renew: bool = False
    caf_no: Optional[str] = None
    mac_address: Optional[str] = None
    mac_address_detail: Optional[str] = None
    ip_address: Optional[str] = None
    vendor: Optional[str] = None
    modem_no: Optional[str] = None
    modem_no_detail: Optional[str] = None
    stb_modem_security_amount: float = 0.0
    plan_id: int
    period_months: int = 1
    start_date: datetime
    
    billing_type: BillingType = BillingType.PREPAID
    assigned_employee_id: Optional[int] = None

class CustomerCreate(CustomerBase):
    password: str
    cgst_tax: Optional[float] = 0.0
    sgst_tax: Optional[float] = 0.0
    igst_tax: Optional[float] = 0.0
    installation_charges: Optional[float] = 0.0
    discount: Optional[float] = 0.0
    amount_paid: Optional[float] = 0.0
    payment_method: Optional[PaymentMethod] = None
    payment_id: Optional[str] = None

class CustomerUpdate(BaseModel):
    username: Optional[str] = None
    full_name: Optional[str] = None
    nickname: Optional[str] = None
    email: Optional[str] = None
    mobile: Optional[str] = None
    alternate_mobile: Optional[str] = None
    customer_gst_no: Optional[str] = None
    id_proof_type: Optional[IDProofType] = None
    id_proof_no: Optional[str] = None
    house_number: Optional[str] = None
    address: Optional[str] = None
    locality_id: Optional[int] = None
    city: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None
    service_type: Optional[ServiceType] = None
    no_of_connections: Optional[int] = None
    company_id: Optional[int] = None
    auto_renew: Optional[bool] = None
    caf_no: Optional[str] = None
    mac_address: Optional[str] = None
    mac_address_detail: Optional[str] = None
    ip_address: Optional[str] = None
    vendor: Optional[str] = None
    modem_no: Optional[str] = None
    modem_no_detail: Optional[str] = None
    stb_modem_security_amount: Optional[float] = None
    plan_id: Optional[int] = None
    period_months: Optional[int] = None
    start_date: Optional[datetime] = None
    billing_type: Optional[BillingType] = None
    assigned_employee_id: Optional[int] = None
    status: Optional[CustomerStatus] = None

class CustomerLogin(BaseModel):
    username: str
    password: str

class Customer(CustomerBase):
    id: int
    customer_id: str
    status: CustomerStatus
    end_date: Optional[datetime] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

class InvoiceBase(BaseModel):
    customer_id: int
    bill_amount: float
    cgst_tax: float = 0.0
    sgst_tax: float = 0.0
    igst_tax: float = 0.0
    installation_charges: float = 0.0
    discount: float = 0.0
    billing_period_start: datetime
    billing_period_end: datetime
    due_date: datetime

class InvoiceCreate(InvoiceBase):
    pass

class Invoice(InvoiceBase):
    id: int
    invoice_number: str
    total_amount: float
    paid_amount: float
    balance_amount: float
    invoice_date: datetime
    status: InvoiceStatus
    created_at: datetime
    
    class Config:
        from_attributes = True

class PaymentBase(BaseModel):
    customer_id: int
    amount: float
    payment_method: PaymentMethod
    payment_reference: Optional[str] = None
    remarks: Optional[str] = None
    invoice_id: Optional[int] = None

class PaymentCreate(PaymentBase):
    pass

class Payment(PaymentBase):
    id: int
    payment_id: str
    payment_date: datetime
    status: PaymentStatus
    created_at: datetime
    
    class Config:
        from_attributes = True

class ComplaintBase(BaseModel):
    customer_id: int
    title: str
    description: str
    category: str
    priority: str = "Medium"

class ComplaintCreate(ComplaintBase):
    pass

class ComplaintUpdate(BaseModel):
    status: Optional[ComplaintStatus] = None
    assigned_to: Optional[int] = None
    resolution: Optional[str] = None

class Complaint(ComplaintBase):
    id: int
    complaint_id: str
    status: ComplaintStatus
    assigned_to: Optional[int] = None
    resolution: Optional[str] = None
    resolved_at: Optional[datetime] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

class Transaction(BaseModel):
    id: int
    transaction_id: str
    customer_id: int
    collected_by: Optional[int] = None
    transaction_type: str
    amount: float
    balance_after: float = 0.0
    description: Optional[str] = None
    transaction_date: datetime
    created_at: datetime
    collector_name: Optional[str] = None
    
    class Config:
        from_attributes = True

class AddonBillBase(BaseModel):
    customer_id: int
    description: str
    amount: float

class AddonBillCreate(AddonBillBase):
    pass

class AddonBill(AddonBillBase):
    id: int
    bill_date: datetime
    is_paid: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class ExpenseBase(BaseModel):
    category: str
    description: str
    amount: float
    expense_date: datetime
    vendor: Optional[str] = None
    payment_method: Optional[str] = None
    receipt_no: Optional[str] = None

class ExpenseCreate(ExpenseBase):
    pass

class Expense(ExpenseBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class RefundBase(BaseModel):
    customer_id: int
    amount: float
    reason: str

class RefundCreate(RefundBase):
    pass

class Refund(RefundBase):
    id: int
    refund_date: Optional[datetime] = None
    status: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class ConnectionRequestBase(BaseModel):
    full_name: str
    email: str
    mobile: str
    address: str
    city: str
    state: str
    pincode: str
    service_type: ServiceType
    preferred_plan_id: Optional[int] = None

class ConnectionRequestCreate(ConnectionRequestBase):
    pass

class ConnectionRequest(ConnectionRequestBase):
    id: int
    status: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class PaymentGatewayBase(BaseModel):
    name: str
    api_key: str
    api_secret: str
    merchant_id: Optional[str] = None
    is_active: bool = False
    is_test_mode: bool = True

class PaymentGatewayCreate(PaymentGatewayBase):
    pass

class PaymentGatewayUpdate(BaseModel):
    api_key: Optional[str] = None
    api_secret: Optional[str] = None
    merchant_id: Optional[str] = None
    is_active: Optional[bool] = None
    is_test_mode: Optional[bool] = None

class PaymentGateway(PaymentGatewayBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class DashboardStats(BaseModel):
    total_customers: int
    active_customers: int
    deactive_customers: int
    suspended_customers: int
    today_collection: float
    today_collection_count: int
    month_collection: float
    month_collection_count: int
    total_dues: float
    today_expiry: int
    next_3days_expiry: int
    today_recharged: int
    month_complaints: int
    month_enrollments: int
    inactive_customers: int
    online_payments: int
    broadband_customers: int
    cable_tv_customers: int

class Token(BaseModel):
    access_token: str
    token_type: str

class ReportFilter(BaseModel):
    service_type: Optional[ServiceType] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    employee_id: Optional[int] = None
    status: Optional[str] = None
