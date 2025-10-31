#!/usr/bin/env python3
"""
Migration script to add bank details and declaration fields to settings table
"""

import sqlite3
import os

db_path = os.path.join(os.path.dirname(__file__), 'ispbilling.db')

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

try:
    cursor.execute("ALTER TABLE settings ADD COLUMN declaration TEXT DEFAULT ''")
    print("✓ Added declaration column")
except sqlite3.OperationalError as e:
    if "duplicate column name" in str(e):
        print("✓ declaration column already exists")
    else:
        print(f"✗ Error adding declaration column: {e}")

try:
    cursor.execute("ALTER TABLE settings ADD COLUMN terms_and_conditions TEXT DEFAULT ''")
    print("✓ Added terms_and_conditions column")
except sqlite3.OperationalError as e:
    if "duplicate column name" in str(e):
        print("✓ terms_and_conditions column already exists")
    else:
        print(f"✗ Error adding terms_and_conditions column: {e}")

try:
    cursor.execute("ALTER TABLE settings ADD COLUMN bank_name TEXT DEFAULT ''")
    print("✓ Added bank_name column")
except sqlite3.OperationalError as e:
    if "duplicate column name" in str(e):
        print("✓ bank_name column already exists")
    else:
        print(f"✗ Error adding bank_name column: {e}")

try:
    cursor.execute("ALTER TABLE settings ADD COLUMN account_number TEXT DEFAULT ''")
    print("✓ Added account_number column")
except sqlite3.OperationalError as e:
    if "duplicate column name" in str(e):
        print("✓ account_number column already exists")
    else:
        print(f"✗ Error adding account_number column: {e}")

try:
    cursor.execute("ALTER TABLE settings ADD COLUMN branch_ifsc TEXT DEFAULT ''")
    print("✓ Added branch_ifsc column")
except sqlite3.OperationalError as e:
    if "duplicate column name" in str(e):
        print("✓ branch_ifsc column already exists")
    else:
        print(f"✗ Error adding branch_ifsc column: {e}")

try:
    cursor.execute("ALTER TABLE settings DROP COLUMN auto_invoice")
    print("✓ Removed auto_invoice column")
except sqlite3.OperationalError as e:
    if "no such column" in str(e):
        print("✓ auto_invoice column already removed")
    else:
        print(f"✗ Error removing auto_invoice column: {e}")

try:
    cursor.execute("ALTER TABLE settings DROP COLUMN payment_reminder_days")
    print("✓ Removed payment_reminder_days column")
except sqlite3.OperationalError as e:
    if "no such column" in str(e):
        print("✓ payment_reminder_days column already removed")
    else:
        print(f"✗ Error removing payment_reminder_days column: {e}")

conn.commit()
conn.close()

print("\n✅ Migration completed successfully!")
