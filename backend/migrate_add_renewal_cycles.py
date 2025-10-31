"""
Migration: Add renewal_cycles table and cycle_id to payments
This enables tracking which payments belong to which renewal period
"""

import sys
import os
sys.path.insert(0, '/var/www/isp-manager-v2/backend')

from sqlalchemy import create_engine, Column, Integer, String, DateTime, ForeignKey, Float
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime

DATABASE_URL = "sqlite:///./ispbilling.db"
engine = create_engine(DATABASE_URL)
Base = declarative_base()

def migrate():
    """Add renewal_cycles table and cycle_id column to payments"""
    
    # Create renewal_cycles table
    create_renewal_cycles_sql = """
    CREATE TABLE IF NOT EXISTS renewal_cycles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        customer_id INTEGER NOT NULL,
        cycle_start DATETIME NOT NULL,
        cycle_end DATETIME,
        invoice_id INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (customer_id) REFERENCES customers(id),
        FOREIGN KEY (invoice_id) REFERENCES invoices(id)
    );
    """
    
    # Add cycle_id to payments table
    add_cycle_id_sql = """
    ALTER TABLE payments ADD COLUMN cycle_id INTEGER REFERENCES renewal_cycles(id);
    """
    
    # Add cycle_id to transactions table for tracking
    add_cycle_id_transactions_sql = """
    ALTER TABLE transactions ADD COLUMN cycle_id INTEGER REFERENCES renewal_cycles(id);
    """
    
    try:
        conn = engine.raw_connection()
        cursor = conn.cursor()
        
        # Check if renewal_cycles table exists
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='renewal_cycles'")
        if not cursor.fetchone():
            print("Creating renewal_cycles table...")
            cursor.execute(create_renewal_cycles_sql)
            print("✓ renewal_cycles table created")
        else:
            print("✓ renewal_cycles table already exists")
        
        # Check if cycle_id column exists in payments
        cursor.execute("PRAGMA table_info(payments)")
        columns = [col[1] for col in cursor.fetchall()]
        if 'cycle_id' not in columns:
            print("Adding cycle_id to payments table...")
            cursor.execute(add_cycle_id_sql)
            print("✓ cycle_id added to payments")
        else:
            print("✓ cycle_id already exists in payments")
        
        # Check if cycle_id column exists in transactions
        cursor.execute("PRAGMA table_info(transactions)")
        columns = [col[1] for col in cursor.fetchall()]
        if 'cycle_id' not in columns:
            print("Adding cycle_id to transactions table...")
            cursor.execute(add_cycle_id_transactions_sql)
            print("✓ cycle_id added to transactions")
        else:
            print("✓ cycle_id already exists in transactions")
        
        conn.commit()
        conn.close()
        
        print("\n✅ Migration completed successfully!")
        
    except Exception as e:
        print(f"\n❌ Migration failed: {str(e)}")
        raise

if __name__ == "__main__":
    print("Starting migration: Add renewal_cycles table and cycle_id columns\n")
    migrate()
