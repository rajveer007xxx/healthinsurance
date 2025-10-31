import sqlite3

conn = sqlite3.connect('ispbilling.db')
cursor = conn.cursor()

try:
    cursor.execute('ALTER TABLE transactions ADD COLUMN balance_after REAL DEFAULT 0.0')
    print("Added balance_after column to transactions table")
except sqlite3.OperationalError as e:
    if "duplicate column name" in str(e):
        print("Column balance_after already exists")
    else:
        raise e

conn.commit()
conn.close()

print("Migration completed successfully!")
