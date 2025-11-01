#!/usr/bin/env python3
"""
Script to create a superadmin user in the ISP Management System database.
This script should be run on the VPS where the backend is deployed.

Usage:
    cd /var/www/isp-manager-v2/backend
    python3 /path/to/create_superadmin.py

Or with custom credentials:
    python3 /path/to/create_superadmin.py --username mysuper --password MyPass123
"""

import sys
import os
import argparse
from datetime import datetime

# Add the backend directory to the Python path
sys.path.insert(0, '/var/www/isp-manager-v2/backend')
os.chdir('/var/www/isp-manager-v2/backend')

try:
    from app.core.database import SessionLocal
    from app.models.models import User, UserRole
    from passlib.context import CryptContext
except ImportError as e:
    print(f"Error importing required modules: {e}")
    print("\nPlease ensure you're running this script from the backend directory:")
    print("  cd /var/www/isp-manager-v2/backend")
    print("  python3 /path/to/create_superadmin.py")
    sys.exit(1)

def create_superadmin(username, password, email=None, full_name=None):
    """Create a superadmin user in the database."""
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    db = SessionLocal()
    
    try:
        # Check if superadmin already exists
        existing = db.query(User).filter(User.username == username).first()
        if existing:
            print(f"❌ User '{username}' already exists!")
            print(f"   Role: {existing.role.value}")
            print(f"   Email: {existing.email}")
            return False
        
        # Create superadmin user
        password_hash = pwd_context.hash(password)
        superadmin = User(
            username=username,
            email=email or f"{username}@ispbilling.in",
            password_hash=password_hash,
            full_name=full_name or "Super Administrator",
            phone="+91 9999999999",
            role=UserRole.SUPERADMIN,
            is_active=True
        )
        db.add(superadmin)
        db.commit()
        db.refresh(superadmin)
        
        print(f"✅ Superadmin user created successfully!")
        print(f"   Username: {superadmin.username}")
        print(f"   Email: {superadmin.email}")
        print(f"   Full Name: {superadmin.full_name}")
        print(f"   Role: {superadmin.role.value}")
        print(f"\n🔐 Login credentials:")
        print(f"   Username: {username}")
        print(f"   Password: {password}")
        print(f"\n🌐 Access the superadmin panel at:")
        print(f"   http://82.29.162.153/superadmin/")
        
        return True
    except Exception as e:
        print(f"❌ Error creating superadmin user: {e}")
        db.rollback()
        return False
    finally:
        db.close()

def main():
    parser = argparse.ArgumentParser(
        description='Create a superadmin user for the ISP Management System'
    )
    parser.add_argument(
        '--username',
        default='rajveersuper',
        help='Superadmin username (default: rajveersuper)'
    )
    parser.add_argument(
        '--password',
        default='Pa$$word@123#',
        help='Superadmin password (default: Pa$$word@123#)'
    )
    parser.add_argument(
        '--email',
        help='Superadmin email (default: <username>@ispbilling.in)'
    )
    parser.add_argument(
        '--full-name',
        help='Superadmin full name (default: Super Administrator)'
    )
    
    args = parser.parse_args()
    
    print("=" * 60)
    print("ISP Management System - Create Superadmin User")
    print("=" * 60)
    print()
    
    success = create_superadmin(
        username=args.username,
        password=args.password,
        email=args.email,
        full_name=args.full_name
    )
    
    sys.exit(0 if success else 1)

if __name__ == '__main__':
    main()
