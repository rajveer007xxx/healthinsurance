import sqlite3
import os

db_path = os.path.join(os.path.dirname(__file__), 'ispbilling.db')

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

try:
    cursor.execute("ALTER TABLE plans ADD COLUMN cgst_percentage REAL DEFAULT 0.0")
    print("Added cgst_percentage column")
except sqlite3.OperationalError as e:
    print(f"cgst_percentage column might already exist: {e}")

try:
    cursor.execute("ALTER TABLE plans ADD COLUMN sgst_percentage REAL DEFAULT 0.0")
    print("Added sgst_percentage column")
except sqlite3.OperationalError as e:
    print(f"sgst_percentage column might already exist: {e}")

try:
    cursor.execute("ALTER TABLE plans ADD COLUMN igst_percentage REAL DEFAULT 0.0")
    print("Added igst_percentage column")
except sqlite3.OperationalError as e:
    print(f"igst_percentage column might already exist: {e}")

try:
    cursor.execute("ALTER TABLE plans ADD COLUMN total_amount REAL")
    print("Added total_amount column")
except sqlite3.OperationalError as e:
    print(f"total_amount column might already exist: {e}")

try:
    cursor.execute("ALTER TABLE plans ADD COLUMN validity_months INTEGER DEFAULT 1")
    print("Added validity_months column")
except sqlite3.OperationalError as e:
    print(f"validity_months column might already exist: {e}")

cursor.execute("SELECT id, price, cgst_percentage, sgst_percentage, igst_percentage FROM plans")
plans = cursor.fetchall()

for plan_id, price, cgst, sgst, igst in plans:
    if price:
        cgst_amount = (price * (cgst or 0)) / 100
        sgst_amount = (price * (sgst or 0)) / 100
        igst_amount = (price * (igst or 0)) / 100
        total = price + cgst_amount + sgst_amount + igst_amount
        
        cursor.execute("UPDATE plans SET total_amount = ? WHERE id = ?", (total, plan_id))
        print(f"Updated total_amount for plan {plan_id}: {total}")

cursor.execute("SELECT id FROM plans WHERE validity_months IS NULL OR validity_months = 0")
plans_without_months = cursor.fetchall()

for (plan_id,) in plans_without_months:
    cursor.execute("UPDATE plans SET validity_months = 1 WHERE id = ?", (plan_id,))
    print(f"Set validity_months to 1 for plan {plan_id}")

conn.commit()
print("\nMigration completed successfully!")

cursor.execute("PRAGMA table_info(plans)")
columns = cursor.fetchall()
print("\nCurrent plans table structure:")
for col in columns:
    print(f"  {col[1]} ({col[2]})")

conn.close()
