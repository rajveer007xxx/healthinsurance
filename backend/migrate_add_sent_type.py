#!/usr/bin/env python3
"""Add sent_type field to invoices table"""

from sqlalchemy import create_engine, Column, String
from sqlalchemy.orm import sessionmaker
from app.core.database import SQLALCHEMY_DATABASE_URL
from app.models.models import Base, Invoice

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)

def migrate():
    db = SessionLocal()
    try:
        from sqlalchemy import text
        db.execute(text("ALTER TABLE invoices ADD COLUMN sent_type VARCHAR DEFAULT 'MANUAL'"))
        db.commit()
        print("✅ Added sent_type column to invoices table")
    except Exception as e:
        print(f"Migration error (may already exist): {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    migrate()
