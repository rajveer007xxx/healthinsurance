from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, ForeignKey, Text, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime

Base = declarative_base()


class Company(Base):
    """SuperAdmin manages companies - each company is a separate ISP"""
    __tablename__ = "companies"
    
    id = Column(Integer, primary_key=True, index=True)
    company_name = Column(String, nullable=False)
    company_logo = Column(String, nullable=True)
    contact_email = Column(String, nullable=False)
    contact_mobile = Column(String, nullable=False)
    address = Column(String, nullable=True)
    city = Column(String, nullable=True)
    pincode = Column(String, nullable=True)
    gst_number = Column(String, nullable=True)  # Company GST number
    status = Column(String, default="active")  # active/inactive
    created_date = Column(DateTime, default=datetime.utcnow)
    
    admins = relationship("Admin", back_populates="company")
    customers = relationship("Customer", back_populates="company")
    employees = relationship("Employee", back_populates="company")
    plans = relationship("Plan", back_populates="company")


class SuperAdmin(Base):
    """SuperAdmin - manages all companies"""
    __tablename__ = "superadmins"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False, index=True)
    mobile = Column(String, nullable=False)
    password_hash = Column(String, nullable=False)
    status = Column(String, default="active")
    created_date = Column(DateTime, default=datetime.utcnow)


class Admin(Base):
    """Admin - one per company, manages their company"""
    __tablename__ = "admins"
    
    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False, index=True)
    mobile = Column(String, nullable=False)
    password_hash = Column(String, nullable=False)
    network_name = Column(String, nullable=True)
    network_address = Column(String, nullable=True)
    city = Column(String, nullable=True)
    pincode = Column(String, nullable=True)
    bank_name = Column(String, nullable=True)
    account_no = Column(String, nullable=True)
    ifsc_code = Column(String, nullable=True)
    branch_code = Column(String, nullable=True)
    branch_location = Column(String, nullable=True)
    qr_code = Column(String, nullable=True)
    partner_logo = Column(String, nullable=True)
    status = Column(String, default="active")
    created_date = Column(DateTime, default=datetime.utcnow)
    
    company = relationship("Company", back_populates="admins")


class Employee(Base):
    """Employee - field staff, support staff, managers"""
    __tablename__ = "employees"
    
    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False, index=True)
    name = Column(String, nullable=False)
    email = Column(String, nullable=False, index=True)
    mobile = Column(String, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(String, nullable=False)  # Field Executive, Support Staff, Manager
    permissions = Column(JSON, nullable=True)  # JSON object with permissions
    assigned_areas = Column(JSON, nullable=True)  # JSON array of area IDs
    status = Column(String, default="active")
    created_date = Column(DateTime, default=datetime.utcnow)
    
    company = relationship("Company", back_populates="employees")
    locations = relationship("EmployeeLocation", back_populates="employee")


class EmployeeLocation(Base):
    """Track employee GPS locations in real-time"""
    __tablename__ = "employee_locations"
    
    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id"), nullable=False, index=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    accuracy = Column(Float, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    battery_level = Column(Integer, nullable=True)
    
    employee = relationship("Employee", back_populates="locations")


class Customer(Base):
    """Customer - ISP subscribers"""
    __tablename__ = "customers"
    
    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False, index=True)
    
    service_type = Column(String, nullable=False)  # Broadband or Cable TV
    
    name = Column(String, nullable=False)
    email = Column(String, nullable=True)
    mobile = Column(String, nullable=False)
    password_hash = Column(String, nullable=False)  # Password for customer portal login
    alternate_mobile = Column(String, nullable=True)
    
    address = Column(String, nullable=False)
    locality = Column(String, nullable=True)
    city = Column(String, nullable=True)
    state = Column(String, nullable=True)
    pincode = Column(String, nullable=True)
    
    plan_id = Column(Integer, ForeignKey("plans.id"), nullable=True)
    installation_amount = Column(Float, default=0)
    security_amount = Column(Float, default=0)
    start_date = Column(DateTime, nullable=True)
    end_date = Column(DateTime, nullable=True)
    billing_amount = Column(Float, nullable=True)
    auto_renewal = Column(Boolean, default=False)
    gst_invoice_needed = Column(Boolean, default=False)  # NEW: GST Invoice feature
    
    mac_address = Column(String, nullable=True, unique=True)
    ip_address = Column(String, nullable=True)
    
    connections = Column(JSON, nullable=True)  # Array of {stb_number, vc_number, plan_id, amount}
    
    status = Column(String, default="active")  # active, inactive, deactive, suspended
    assigned_employee_id = Column(Integer, ForeignKey("employees.id"), nullable=True)
    
    created_date = Column(DateTime, default=datetime.utcnow)
    updated_date = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    company = relationship("Company", back_populates="customers")
    plan = relationship("Plan")
    payments = relationship("Payment", back_populates="customer")
    invoices = relationship("Invoice", back_populates="customer")
    complaints = relationship("Complaint", back_populates="customer")


class Plan(Base):
    """Service plans - Broadband and Cable TV"""
    __tablename__ = "plans"
    
    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False, index=True)
    service_type = Column(String, nullable=False)  # Broadband or Cable TV
    plan_name = Column(String, nullable=False)
    price = Column(Float, nullable=False)
    validity_days = Column(Integer, nullable=False)  # 30, 90, 180, 360
    features = Column(Text, nullable=True)
    status = Column(String, default="active")
    created_date = Column(DateTime, default=datetime.utcnow)
    
    company = relationship("Company", back_populates="plans")


class Payment(Base):
    """Payment records"""
    __tablename__ = "payments"
    
    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=False, index=True)
    amount = Column(Float, nullable=False)
    payment_mode = Column(String, nullable=False)  # Cash, Online, UPI, Card, etc.
    payment_date = Column(DateTime, default=datetime.utcnow, index=True)
    collected_by = Column(Integer, ForeignKey("employees.id"), nullable=True)
    receipt_number = Column(String, nullable=True)
    transaction_id = Column(String, nullable=True)
    notes = Column(Text, nullable=True)
    created_date = Column(DateTime, default=datetime.utcnow)
    
    customer = relationship("Customer", back_populates="payments")


class Invoice(Base):
    """Invoice records"""
    __tablename__ = "invoices"
    
    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=False, index=True)
    invoice_number = Column(String, nullable=False, unique=True, index=True)  # 10-11 digits
    amount = Column(Float, nullable=False)
    due_date = Column(DateTime, nullable=True)
    status = Column(String, default="pending")  # pending, paid, overdue
    sent_via = Column(String, nullable=True)  # Email, SMS, WhatsApp
    sent_date = Column(DateTime, nullable=True)
    paid_date = Column(DateTime, nullable=True)
    created_date = Column(DateTime, default=datetime.utcnow, index=True)
    
    customer = relationship("Customer", back_populates="invoices")


class Complaint(Base):
    """Customer complaints"""
    __tablename__ = "complaints"
    
    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=False, index=True)
    complaint_type = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    priority = Column(String, default="medium")  # low, medium, high
    status = Column(String, default="open")  # open, in_progress, resolved, closed
    assigned_to = Column(Integer, ForeignKey("employees.id"), nullable=True)
    created_date = Column(DateTime, default=datetime.utcnow, index=True)
    resolved_date = Column(DateTime, nullable=True)
    
    customer = relationship("Customer", back_populates="complaints")


class ServiceArea(Base):
    """Service areas where ISP provides services"""
    __tablename__ = "service_areas"
    
    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False, index=True)
    state = Column(String, nullable=False)
    city = Column(String, nullable=False)
    area = Column(String, nullable=False)
    pin_code = Column(String, nullable=False)
    created_date = Column(DateTime, default=datetime.utcnow)


class Locality(Base):
    """Localities within service areas with household data"""
    __tablename__ = "localities"
    
    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False, index=True)
    area_id = Column(Integer, ForeignKey("service_areas.id"), nullable=True)
    locality_name = Column(String, nullable=False)
    household_count = Column(Integer, default=0)
    created_date = Column(DateTime, default=datetime.utcnow)


class Expense(Base):
    """Expense tracking"""
    __tablename__ = "expenses"
    
    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False, index=True)
    expense_type = Column(String, nullable=False)
    amount = Column(Float, nullable=False)
    description = Column(Text, nullable=True)
    expense_date = Column(DateTime, default=datetime.utcnow, index=True)
    created_by = Column(Integer, nullable=True)
    created_date = Column(DateTime, default=datetime.utcnow)


class Notification(Base):
    """System notifications"""
    __tablename__ = "notifications"
    
    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False, index=True)
    notification_type = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    target_user_id = Column(Integer, nullable=True)
    target_user_type = Column(String, nullable=True)  # admin, employee, customer
    is_read = Column(Boolean, default=False)
    created_date = Column(DateTime, default=datetime.utcnow, index=True)


class WhatsAppTemplate(Base):
    """WhatsApp message templates"""
    __tablename__ = "whatsapp_templates"
    
    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False, index=True)
    template_name = Column(String, nullable=False)
    template_content = Column(Text, nullable=False)
    variables = Column(JSON, nullable=True)  # Array of variable names
    status = Column(String, default="active")
    created_date = Column(DateTime, default=datetime.utcnow)


class SMSLog(Base):
    """SMS delivery logs"""
    __tablename__ = "sms_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False, index=True)
    mobile = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    status = Column(String, nullable=False)  # sent, failed, delivered
    sent_date = Column(DateTime, default=datetime.utcnow, index=True)
    delivery_date = Column(DateTime, nullable=True)
