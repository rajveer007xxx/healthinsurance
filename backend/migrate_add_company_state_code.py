import sqlite3

conn = sqlite3.connect('ispbilling.db')
cursor = conn.cursor()

try:
    cursor.execute("ALTER TABLE settings ADD COLUMN company_state TEXT DEFAULT ''")
    print("Added company_state column to settings table")
except sqlite3.OperationalError as e:
    print(f"company_state column might already exist: {e}")

try:
    cursor.execute("ALTER TABLE settings ADD COLUMN company_code TEXT DEFAULT ''")
    print("Added company_code column to settings table")
except sqlite3.OperationalError as e:
    print(f"company_code column might already exist: {e}")

conn.commit()
conn.close()

print("Migration completed successfully!")
