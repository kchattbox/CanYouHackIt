import sqlite3

conn = sqlite3.connect('database.db')
c = conn.cursor()

c.execute("INSERT INTO boxes (box_id, fingerprint) VALUES (1, 'DUMMY')")

conn.commit()










