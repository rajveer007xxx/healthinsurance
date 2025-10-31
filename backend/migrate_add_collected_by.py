import sqlite3

conn = sqlite3.connect('ispbilling.db')
cursor = conn.cursor()

try:
    cursor.execute('ALTER TABLE transactions ADD COLUMN collected_by INTEGER')
    print("Added collected_by column to transactions table")
except sqlite3.OperationalError as e:
    if "duplicate column name" in str(e):
        print("Column collected_by already exists")
    else:
        raise e

conn.commit()
conn.close()

print("Migration completed successfully!")
