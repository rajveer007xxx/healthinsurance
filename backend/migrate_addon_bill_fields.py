#!/usr/bin/env python3
"""
Migration script to add invoice fields to addon_bills table
"""

import sys
sys.path.insert(0, '/var/www/isp-manager-v2/backend')

from sqlalchemy import text
from app.core.database import engine

def migrate():
    with engine.connect() as conn:
        try:
            columns_to_add = [
                ("invoice_number", "VARCHAR"),
                ("invoice_date", "TIMESTAMP"),
                ("due_date", "TIMESTAMP"),
                ("cgst_tax", "FLOAT DEFAULT 0.0"),
                ("sgst_tax", "FLOAT DEFAULT 0.0"),
                ("igst_tax", "FLOAT DEFAULT 0.0"),
                ("total_amount", "FLOAT DEFAULT 0.0"),
                ("paid_amount", "FLOAT DEFAULT 0.0"),
                ("balance_amount", "FLOAT DEFAULT 0.0"),
                ("status", "VARCHAR DEFAULT 'PENDING'")
            ]
            
            for column_name, column_type in columns_to_add:
                try:
                    conn.execute(text(f"ALTER TABLE addon_bills ADD COLUMN {column_name} {column_type};"))
                    print(f"✅ Added column: {column_name}")
                except Exception as e:
                    if "duplicate column name" in str(e).lower():
                        print(f"⚠️  Column {column_name} already exists, skipping")
                    else:
                        print(f"❌ Error adding column {column_name}: {e}")
            
            conn.commit()
            print("✅ Migration completed successfully!")
        except Exception as e:
            print(f"❌ Migration failed: {e}")
            conn.rollback()

if __name__ == "__main__":
    migrate()
