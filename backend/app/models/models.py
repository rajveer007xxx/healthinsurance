from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, ForeignKey, Text, Enum as SQLEnum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.core.database import Base
from app.utils.timezone import get_ist_now

class UserRole(str, enum.Enum):
    SUPERADMIN = "SUPERADMIN"
    ADMIN = "ADMIN"
    EMPLOYEE = "EMPLOYEE"
    CUSTOMER = "CUSTOMER"

class CustomerStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    DEACTIVE = "DEACTIVE"
    SUSPENDED = "SUSPENDED"

class BillingType(str, enum.Enum):
    PREPAID = "PREPAID"
    POSTPAID = "POSTPAID"

class ServiceType(str, enum.Enum):
    BROADBAND = "BROADBAND"
    CABLE_TV = "CABLE_TV"

class PaymentMethod(str, enum.Enum):
    CASH = "CASH"
    PAYTM = "PAYTM"
    PHONEPE = "PHONEPE"
    GOOGLEPAY = "GOOGLEPAY"
    CHEQUE = "CHEQUE"
    NET_BANKING = "NET_BANKING"
    EXCITEL = "EXCITEL"
    WIOM = "WIOM"

class PaymentStatus(str, enum.Enum):
    PENDING = "PENDING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"

class ComplaintStatus(str, enum.Enum):
    OPEN = "OPEN"
    IN_PROGRESS = "IN_PROGRESS"
    RESOLVED = "RESOLVED"
    CLOSED = "CLOSED"

class InvoiceStatus(str, enum.Enum):
    DRAFT = "DRAFT"
    SENT = "SENT"
    PAID = "PAID"
    OVERDUE = "OVERDUE"
    CANCELLED = "CANCELLED"

class IDProofType(str, enum.Enum):
    VOTER_ID = "VOTER_ID"
    PASSPORT = "PASSPORT"
    DRIVING_LICENSE = "DRIVING_LICENSE"
    SERVICE_ID_CARD = "SERVICE_ID_CARD"
    AADHAR_CARD = "AADHAR_CARD"
    PASSBOOK = "PASSBOOK"
    OTHER = "OTHER"

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    username = Column(String, unique=True, index=True)
    password_hash = Column(String)
    full_name = Column(String)
    role = Column(SQLEnum(UserRole))
    phone = Column(String)
    profile_image = Column(String, nullable=True)
    employee_image = Column(String, nullable=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=get_ist_now)
    updated_at = Column(DateTime, default=get_ist_now, onupdate=get_ist_now)
    
    company = relationship("Company", back_populates="users", foreign_keys=[company_id])
    customers_managed = relationship("Customer", back_populates="assigned_employee", foreign_keys="Customer.assigned_employee_id")

class Company(Base):
    __tablename__ = "companies"
    
    id = Column(Integer, primary_key=True, index=True)
    company_code = Column(String, unique=True, index=True)  # 8-digit unique code
    name = Column(String, unique=True)
    address = Column(Text)
    phone = Column(String)
    email = Column(String)
    gst_no = Column(String)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=get_ist_now)
    
    users = relationship("User", back_populates="company", foreign_keys="User.company_id")
    plans = relationship("Plan", back_populates="company")
    customers = relationship("Customer", back_populates="company")

class Locality(Base):
    __tablename__ = "localities"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    city = Column(String)
    state = Column(String)
    pincode = Column(String)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=get_ist_now)
    
    customers = relationship("Customer", back_populates="locality")

class Plan(Base):
    __tablename__ = "plans"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    description = Column(Text)
    service_type = Column(SQLEnum(ServiceType))
    speed = Column(String)  # e.g., "50 Mbps"
    data_limit = Column(String)  # e.g., "Unlimited"
    price = Column(Float)
    cgst_percentage = Column(Float, default=0.0)  # CGST %
    sgst_percentage = Column(Float, default=0.0)  # SGST %
    igst_percentage = Column(Float, default=0.0)  # IGST %
    total_amount = Column(Float, nullable=True)  # Auto-calculated total with taxes
    validity_months = Column(Integer, default=1)  # Changed from validity_days to validity_months
    company_id = Column(Integer, ForeignKey("companies.id"))
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)  # Admin who created the plan
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=get_ist_now)
    updated_at = Column(DateTime, default=get_ist_now, onupdate=get_ist_now)
    
    company = relationship("Company", back_populates="plans")
    customers = relationship("Customer", back_populates="plan")
    creator = relationship("User", foreign_keys=[user_id])

class Customer(Base):
    __tablename__ = "customers"
    
    id = Column(Integer, primary_key=True, index=True)
    
    customer_id = Column(String, unique=True, index=True)
    username = Column(String, unique=True, index=True)
    password_hash = Column(String)
    full_name = Column(String, index=True)
    nickname = Column(String)
    email = Column(String, index=True)
    mobile = Column(String, index=True)
    alternate_mobile = Column(String)
    customer_gst_no = Column(String)
    customer_state_code = Column(String)
    gst_invoice_needed = Column(Boolean, default=False)
    id_proof_type = Column(SQLEnum(IDProofType))
    id_proof_no = Column(String)
    
    house_number = Column(String)
    address = Column(Text)
    locality_id = Column(Integer, ForeignKey("localities.id"))
    city = Column(String)
    state = Column(String)
    pincode = Column(String)
    
    service_type = Column(SQLEnum(ServiceType))
    no_of_connections = Column(Integer, default=1)
    company_id = Column(Integer, ForeignKey("companies.id"))
    auto_renew = Column(Boolean, default=False)
    caf_no = Column(String)  # Customer Application Form Number
    mac_address = Column(String)
    mac_address_detail = Column(Text)
    ip_address = Column(String)
    vendor = Column(String)
    modem_no = Column(String)
    modem_no_detail = Column(Text)
    stb_modem_security_amount = Column(Float, default=0.0)
    plan_id = Column(Integer, ForeignKey("plans.id"))
    period_months = Column(Integer, default=1)
    start_date = Column(DateTime)
    end_date = Column(DateTime)
    
    status = Column(SQLEnum(CustomerStatus), default=CustomerStatus.ACTIVE)
    billing_type = Column(SQLEnum(BillingType), default=BillingType.PREPAID)
    
    assigned_employee_id = Column(Integer, ForeignKey("users.id"))
    created_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    created_at = Column(DateTime, default=get_ist_now)
    updated_at = Column(DateTime, default=get_ist_now, onupdate=get_ist_now)
    
    locality = relationship("Locality", back_populates="customers")
    company = relationship("Company", back_populates="customers")
    plan = relationship("Plan", back_populates="customers")
    assigned_employee = relationship("User", back_populates="customers_managed", foreign_keys=[assigned_employee_id])
    creator = relationship("User", foreign_keys=[created_by])
    invoices = relationship("Invoice", back_populates="customer")
    payments = relationship("Payment", back_populates="customer")
    complaints = relationship("Complaint", back_populates="customer")
    transactions = relationship("Transaction", back_populates="customer")
    addon_bills = relationship("AddonBill", back_populates="customer")

class Invoice(Base):
    __tablename__ = "invoices"
    
    id = Column(Integer, primary_key=True, index=True)
    invoice_number = Column(String, unique=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"))
    
    bill_amount = Column(Float)
    cgst_tax = Column(Float, default=0.0)
    sgst_tax = Column(Float, default=0.0)
    igst_tax = Column(Float, default=0.0)
    installation_charges = Column(Float, default=0.0)
    discount = Column(Float, default=0.0)
    total_amount = Column(Float)
    paid_amount = Column(Float, default=0.0)
    balance_amount = Column(Float)
    
    invoice_date = Column(DateTime, default=get_ist_now)
    due_date = Column(DateTime)
    billing_period_start = Column(DateTime)
    billing_period_end = Column(DateTime)
    
    status = Column(SQLEnum(InvoiceStatus), default=InvoiceStatus.DRAFT)
    
    remarks = Column(Text)
    sent_at = Column(DateTime)
    sent_type = Column(String, default="MANUAL")
    
    created_at = Column(DateTime, default=get_ist_now)
    updated_at = Column(DateTime, default=get_ist_now, onupdate=get_ist_now)
    
    customer = relationship("Customer", back_populates="invoices")
    payments = relationship("Payment", back_populates="invoice")

class Payment(Base):
    __tablename__ = "payments"
    
    id = Column(Integer, primary_key=True, index=True)
    payment_id = Column(String, unique=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"))
    invoice_id = Column(Integer, ForeignKey("invoices.id"), nullable=True)
    
    amount = Column(Float)
    payment_method = Column(SQLEnum(PaymentMethod))
    payment_reference = Column(String)  # Transaction ID, Cheque No, etc.
    payment_date = Column(DateTime, default=get_ist_now)
    
    status = Column(SQLEnum(PaymentStatus), default=PaymentStatus.COMPLETED)
    
    remarks = Column(Text)
    received_by = Column(Integer, ForeignKey("users.id"))
    
    created_at = Column(DateTime, default=get_ist_now)
    updated_at = Column(DateTime, default=get_ist_now, onupdate=get_ist_now)
    
    customer = relationship("Customer", back_populates="payments")
    invoice = relationship("Invoice", back_populates="payments")

class Transaction(Base):
    __tablename__ = "transactions"
    
    id = Column(Integer, primary_key=True, index=True)
    transaction_id = Column(String, unique=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"))
    collected_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    transaction_type = Column(String)  # PAYMENT, REFUND, ADJUSTMENT
    amount = Column(Float)
    balance_after = Column(Float, default=0.0)
    description = Column(Text)
    transaction_date = Column(DateTime, default=get_ist_now)
    
    created_at = Column(DateTime, default=get_ist_now)
    
    customer = relationship("Customer", back_populates="transactions")
    collector = relationship("User", foreign_keys=[collected_by])

class Complaint(Base):
    __tablename__ = "complaints"
    
    id = Column(Integer, primary_key=True, index=True)
    complaint_id = Column(String, unique=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"))
    
    title = Column(String)
    description = Column(Text)
    category = Column(String)  # Technical, Billing, Service, Other
    priority = Column(String)  # Low, Medium, High, Critical
    status = Column(SQLEnum(ComplaintStatus), default=ComplaintStatus.OPEN)
    
    assigned_to = Column(Integer, ForeignKey("users.id"))
    
    resolution = Column(Text)
    resolved_at = Column(DateTime)
    
    created_at = Column(DateTime, default=get_ist_now)
    updated_at = Column(DateTime, default=get_ist_now, onupdate=get_ist_now)
    
    customer = relationship("Customer", back_populates="complaints")

class AddonBill(Base):
    __tablename__ = "addon_bills"
    
    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"))
    
    invoice_number = Column(String)
    description = Column(String)
    amount = Column(Float)
    cgst_tax = Column(Float, default=0.0)
    sgst_tax = Column(Float, default=0.0)
    igst_tax = Column(Float, default=0.0)
    total_amount = Column(Float, default=0.0)
    paid_amount = Column(Float, default=0.0)
    balance_amount = Column(Float, default=0.0)
    
    invoice_date = Column(DateTime, default=get_ist_now)
    due_date = Column(DateTime)
    bill_date = Column(DateTime, default=get_ist_now)
    
    status = Column(String, default="PENDING")
    is_paid = Column(Boolean, default=False)
    
    created_at = Column(DateTime, default=get_ist_now)
    
    customer = relationship("Customer", back_populates="addon_bills")

class Expense(Base):
    __tablename__ = "expenses"
    
    id = Column(Integer, primary_key=True, index=True)
    
    category = Column(String)
    description = Column(Text)
    amount = Column(Float)
    expense_date = Column(DateTime)
    
    vendor = Column(String)
    payment_method = Column(String)
    receipt_no = Column(String)
    
    created_at = Column(DateTime, default=get_ist_now)
    updated_at = Column(DateTime, default=get_ist_now, onupdate=get_ist_now)

class Refund(Base):
    __tablename__ = "refunds"
    
    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"))
    
    amount = Column(Float)
    reason = Column(Text)
    refund_date = Column(DateTime)
    status = Column(String)  # PENDING, APPROVED, REJECTED, COMPLETED
    
    created_at = Column(DateTime, default=get_ist_now)
    updated_at = Column(DateTime, default=get_ist_now, onupdate=get_ist_now)

class ConnectionRequest(Base):
    __tablename__ = "connection_requests"
    
    id = Column(Integer, primary_key=True, index=True)
    
    full_name = Column(String)
    email = Column(String)
    mobile = Column(String)
    address = Column(Text)
    city = Column(String)
    state = Column(String)
    pincode = Column(String)
    
    service_type = Column(SQLEnum(ServiceType))
    preferred_plan_id = Column(Integer, ForeignKey("plans.id"))
    status = Column(String)  # PENDING, APPROVED, REJECTED
    
    created_at = Column(DateTime, default=get_ist_now)
    updated_at = Column(DateTime, default=get_ist_now, onupdate=get_ist_now)

class PaymentGateway(Base):
    __tablename__ = "payment_gateways"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)  # Razorpay, PayU, Cashfree, Paytm
    api_key = Column(String)
    api_secret = Column(String)
    merchant_id = Column(String)
    is_active = Column(Boolean, default=False)
    is_test_mode = Column(Boolean, default=True)
    created_at = Column(DateTime, default=get_ist_now)
    updated_at = Column(DateTime, default=get_ist_now, onupdate=get_ist_now)

class SMSLog(Base):
    __tablename__ = "sms_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"))
    mobile = Column(String)
    message = Column(Text)
    status = Column(String)  # SENT, FAILED, PENDING
    sent_at = Column(DateTime, default=get_ist_now)
    delivery_status = Column(String)
    created_at = Column(DateTime, default=get_ist_now)

class WhatsAppCampaign(Base):
    __tablename__ = "whatsapp_campaigns"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    message = Column(Text)
    target_customers = Column(Text)  # JSON array of customer IDs
    status = Column(String)  # DRAFT, SCHEDULED, SENT
    scheduled_at = Column(DateTime)
    sent_at = Column(DateTime)
    created_at = Column(DateTime, default=get_ist_now)
    updated_at = Column(DateTime, default=get_ist_now, onupdate=get_ist_now)

class Notification(Base):
    __tablename__ = "notifications"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String)
    message = Column(Text)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=get_ist_now)

class Settings(Base):
    __tablename__ = "settings"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    plain_password = Column(String, nullable=True)
    company_name = Column(String, default='ispbilling.in')
    company_id = Column(String, nullable=True)
    company_logo = Column(String, nullable=True)
    company_address = Column(Text, default='')
    company_phone = Column(String, default='')
    company_email = Column(String, default='')
    company_gst = Column(String, default='')
    company_state = Column(String, default='')
    company_code = Column(String, default='')
    invoice_prefix = Column(String, default='INV')
    invoice_counter = Column(Integer, default=1000)
    enable_sms = Column(Boolean, default=True)
    enable_email = Column(Boolean, default=True)
    enable_whatsapp = Column(Boolean, default=True)
    declaration = Column(Text, default='')
    terms_and_conditions = Column(Text, default='')
    bank_name = Column(String, default='')
    account_number = Column(String, default='')
    branch_ifsc = Column(String, default='')
    created_at = Column(DateTime, default=get_ist_now)
    updated_at = Column(DateTime, default=get_ist_now, onupdate=get_ist_now)
    
    user = relationship("User", foreign_keys=[user_id])

class ManualInvoice(Base):
    __tablename__ = "manual_invoices"
    
    id = Column(Integer, primary_key=True, index=True)
    invoice_number = Column(String, unique=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    
    buyer_name = Column(String)
    buyer_company = Column(String)
    buyer_contact = Column(String)
    buyer_email = Column(String)
    buyer_address = Column(Text)
    buyer_city = Column(String)
    buyer_state = Column(String)
    buyer_gst = Column(String)
    
    invoice_date = Column(DateTime, default=get_ist_now)
    due_date = Column(DateTime)
    
    items = Column(Text)  # JSON string of items array
    
    subtotal = Column(Float)
    cgst = Column(Float, default=0.0)
    sgst = Column(Float, default=0.0)
    igst = Column(Float, default=0.0)
    total_amount = Column(Float)
    
    status = Column(String, default="SENT")  # SENT, PAID, CANCELLED
    sent_date = Column(DateTime, default=get_ist_now)
    
    pdf_path = Column(String, nullable=True)
    
    created_at = Column(DateTime, default=get_ist_now)
    updated_at = Column(DateTime, default=get_ist_now, onupdate=get_ist_now)
    
    user = relationship("User", foreign_keys=[user_id])
