"""
Migration script to add password_hash to existing customers
"""
import sys
import secrets
import string
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from app.database import SessionLocal
from app.models import Customer
from app.auth import get_password_hash

def generate_secure_password(length=8):
    """Generate a secure random password"""
    alphabet = string.ascii_letters + string.digits
    return ''.join(secrets.choice(alphabet) for _ in range(length))

def migrate_customer_passwords():
    """Add password_hash to customers that don't have one"""
    db = SessionLocal()
    try:
        customers = db.query(Customer).filter(
            (Customer.password_hash == None) | (Customer.password_hash == '')
        ).all()
        
        if not customers:
            print("✅ No customers need password migration")
            return
        
        print(f"Found {len(customers)} customers without password_hash")
        
        for customer in customers:
            default_password = generate_secure_password(8)
            customer.password_hash = get_password_hash(default_password)
            print(f"  - Set password_hash for customer: {customer.name} (ID: {customer.id})")
        
        db.commit()
        print(f"✅ Successfully migrated {len(customers)} customers")
        
    except Exception as e:
        db.rollback()
        print(f"❌ Migration failed: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    migrate_customer_passwords()
