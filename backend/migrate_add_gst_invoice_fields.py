import sqlite3

conn = sqlite3.connect('ispbilling.db')
cursor = conn.cursor()

try:
    cursor.execute("ALTER TABLE customers ADD COLUMN customer_state_code TEXT DEFAULT ''")
    print("Added customer_state_code column to customers table")
except sqlite3.OperationalError as e:
    print(f"customer_state_code column might already exist: {e}")

try:
    cursor.execute("ALTER TABLE customers ADD COLUMN gst_invoice_needed INTEGER DEFAULT 0")
    print("Added gst_invoice_needed column to customers table")
except sqlite3.OperationalError as e:
    print(f"gst_invoice_needed column might already exist: {e}")

conn.commit()
conn.close()

print("Migration completed successfully!")
