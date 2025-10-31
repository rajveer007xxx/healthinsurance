#!/usr/bin/env python3
"""
Migration script to add invoice_counter column to settings table
"""

import sqlite3
import os

db_path = os.path.join(os.path.dirname(__file__), 'ispbilling.db')

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

try:
    cursor.execute("ALTER TABLE settings ADD COLUMN invoice_counter INTEGER DEFAULT 1000")
    print("✓ Added invoice_counter column")
except sqlite3.OperationalError as e:
    if "duplicate column name" in str(e):
        print("✓ invoice_counter column already exists")
    else:
        print(f"✗ Error adding invoice_counter column: {e}")

conn.commit()
conn.close()

print("\n✅ Migration completed successfully!")
