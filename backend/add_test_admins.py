import sys
sys.path.append('/var/www/isp-manager-v2/backend')

from app.core.database import SessionLocal
from app.models.models import User, UserRole, Company
from passlib.context import CryptContext
from datetime import datetime

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

db = SessionLocal()

# Check if companies exist, if not create some
companies = db.query(Company).all()
if len(companies) == 0:
    print("Creating test companies...")
    company1 = Company(
        name="ISP Billing Services",
        address="123 Main St, City, State 12345",
        phone="1234567890",
        email="info@ispbilling.in",
        gst_no="GST123456789"
    )
    company2 = Company(
        name="FastNet Broadband",
        address="456 Network Ave, City, State 12345",
        phone="9876543210",
        email="info@fastnet.com",
        gst_no="GST987654321"
    )
    db.add(company1)
    db.add(company2)
    db.commit()
    db.refresh(company1)
    db.refresh(company2)
    print(f"Created companies: {company1.name} (ID: {company1.id}), {company2.name} (ID: {company2.id})")
else:
    company1 = companies[0]
    company2 = companies[1] if len(companies) > 1 else companies[0]
    print(f"Using existing companies: {company1.name} (ID: {company1.id}), {company2.name} (ID: {company2.id})")

# Check if admin users already exist
existing_admins = db.query(User).filter(User.role == UserRole.ADMIN).all()
if len(existing_admins) > 0:
    print(f"Found {len(existing_admins)} existing admin users. Skipping creation.")
    db.close()
    sys.exit(0)

# Create test admin users
print("Creating test admin users...")

admins_data = [
    {
        "username": "admin1",
        "email": "admin1@ispbilling.in",
        "full_name": "John Smith",
        "phone": "9876543210",
        "password": "admin123",
        "company_id": company1.id
    },
    {
        "username": "admin2",
        "email": "admin2@ispbilling.in",
        "full_name": "Jane Doe",
        "phone": "9876543211",
        "password": "admin123",
        "company_id": company1.id
    },
    {
        "username": "admin3",
        "email": "admin3@fastnet.com",
        "full_name": "Robert Johnson",
        "phone": "9876543212",
        "password": "admin123",
        "company_id": company2.id
    },
    {
        "username": "admin4",
        "email": "admin4@fastnet.com",
        "full_name": "Sarah Williams",
        "phone": "9876543213",
        "password": "admin123",
        "company_id": company2.id
    },
    {
        "username": "admin5",
        "email": "admin5@ispbilling.in",
        "full_name": "Michael Brown",
        "phone": "9876543214",
        "password": "admin123",
        "company_id": company1.id
    }
]

for admin_data in admins_data:
    password_hash = pwd_context.hash(admin_data["password"])
    
    new_admin = User(
        username=admin_data["username"],
        email=admin_data["email"],
        password_hash=password_hash,
        full_name=admin_data["full_name"],
        phone=admin_data["phone"],
        role=UserRole.ADMIN,
        company_id=admin_data["company_id"],
        is_active=True,
        created_at=datetime.utcnow()
    )
    
    db.add(new_admin)
    print(f"Created admin: {admin_data['username']} - {admin_data['full_name']} (Company ID: {admin_data['company_id']})")

db.commit()
db.close()

print("\nSuccessfully created 5 test admin users!")
print("All admins have password: admin123")
