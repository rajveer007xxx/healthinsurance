from app.core.database import SessionLocal, engine
from app.models.models import Base, User, Company, Locality, Plan, Customer
from app.core.security import get_password_hash
from datetime import datetime, timedelta

# Create tables
Base.metadata.create_all(bind=engine)

db = SessionLocal()

# Create admin user
admin = User(
    email="admin@ispbilling.in",
    username="admin",
    password_hash=get_password_hash("admin123"),
    full_name="System Administrator",
    role="ADMIN",
    phone="9999999999"
)
db.add(admin)

# Create company
company = Company(
    name="ISP Billing Services",
    address="123 Main Street, City",
    phone="1234567890",
    email="info@ispbilling.in",
    gst_no="GST123456"
)
db.add(company)
db.commit()
db.refresh(company)

# Create localities
localities = [
    Locality(name="Sector 1", city="Mumbai", state="Maharashtra", pincode="400001"),
    Locality(name="Sector 2", city="Mumbai", state="Maharashtra", pincode="400002"),
    Locality(name="Sector 3", city="Delhi", state="Delhi", pincode="110001"),
]
for locality in localities:
    db.add(locality)
db.commit()

# Create plans
plans = [
    Plan(name="Basic 50 Mbps", description="50 Mbps Unlimited", service_type="BROADBAND", 
         speed="50 Mbps", data_limit="Unlimited", price=499.0, validity_days=30, company_id=company.id),
    Plan(name="Standard 100 Mbps", description="100 Mbps Unlimited", service_type="BROADBAND",
         speed="100 Mbps", data_limit="Unlimited", price=699.0, validity_days=30, company_id=company.id),
    Plan(name="Premium 200 Mbps", description="200 Mbps Unlimited", service_type="BROADBAND",
         speed="200 Mbps", data_limit="Unlimited", price=999.0, validity_days=30, company_id=company.id),
]
for plan in plans:
    db.add(plan)
db.commit()
db.refresh(plans[0])

# Create sample customer
customer = Customer(
    customer_id="1000000001",
    username="customer1",
    password_hash=get_password_hash("customer123"),
    full_name="John Doe",
    email="john@example.com",
    mobile="9876543210",
    address="123 Test Street",
    city="Mumbai",
    state="Maharashtra",
    pincode="400001",
    service_type="BROADBAND",
    company_id=company.id,
    plan_id=plans[0].id,
    start_date=datetime.now(),
    end_date=datetime.now() + timedelta(days=30),
    billing_type="PREPAID",
    status="ACTIVE"
)
db.add(customer)

db.commit()
print("Database seeded successfully!")
print("Admin login: admin / admin123")
print("Customer login: customer1 / customer123")
