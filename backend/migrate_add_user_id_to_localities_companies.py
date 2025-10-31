import sqlite3
from datetime import datetime

conn = sqlite3.connect('ispbilling.db')
cursor = conn.cursor()

try:
    try:
        cursor.execute("ALTER TABLE localities ADD COLUMN user_id INTEGER")
        print("Added user_id column to localities table")
    except sqlite3.OperationalError as e:
        if "duplicate column name" in str(e).lower():
            print("user_id column already exists in localities table")
        else:
            raise
    
    try:
        cursor.execute("ALTER TABLE companies ADD COLUMN user_id INTEGER")
        print("Added user_id column to companies table")
    except sqlite3.OperationalError as e:
        if "duplicate column name" in str(e).lower():
            print("user_id column already exists in companies table")
        else:
            raise
    
    conn.commit()
    print("Migration completed successfully!")
    
except Exception as e:
    print(f"Error during migration: {e}")
    conn.rollback()
finally:
    conn.close()
