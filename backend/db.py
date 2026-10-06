import sqlite3
import pymysql
import pymysql.cursors
import os
import logging
from datetime import datetime, timedelta
from config import Config

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class Database:
    def __init__(self):
        self.use_sqlite = False
        self.sqlite_file = os.path.join(os.path.dirname(__file__), 'billbuddy.db')

    def get_connection(self):
        """Attempts MySQL connection; falls back to SQLite local database if unavailable."""
        if not self.use_sqlite:
            try:
                connection = pymysql.connect(
                    host=Config.DB_HOST,
                    user=Config.DB_USER,
                    password=Config.DB_PASSWORD,
                    port=Config.DB_PORT,
                    cursorclass=pymysql.cursors.DictCursor,
                    autocommit=True
                )
                with connection.cursor() as cursor:
                    cursor.execute(f"CREATE DATABASE IF NOT EXISTS `{Config.DB_NAME}`")
                connection.close()

                connection = pymysql.connect(
                    host=Config.DB_HOST,
                    user=Config.DB_USER,
                    password=Config.DB_PASSWORD,
                    database=Config.DB_NAME,
                    port=Config.DB_PORT,
                    cursorclass=pymysql.cursors.DictCursor,
                    autocommit=True
                )
                return connection, 'mysql'
            except Exception as e:
                logger.warning(f"MySQL connection failed ({e}). Falling back to SQLite local database.")
                self.use_sqlite = True

        conn = sqlite3.connect(self.sqlite_file)
        conn.row_factory = sqlite3.Row
        return conn, 'sqlite'

    def init_db(self):
        """Initializes users, bills, and payments tables and handles column migrations."""
        conn, db_type = self.get_connection()
        try:
            if db_type == 'mysql':
                with conn.cursor() as cursor:
                    cursor.execute("""
                        CREATE TABLE IF NOT EXISTS users (
                            user_id INT AUTO_INCREMENT PRIMARY KEY,
                            name VARCHAR(100) NOT NULL,
                            email VARCHAR(150) NOT NULL UNIQUE,
                            password VARCHAR(255) NOT NULL,
                            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
                    """)
                    cursor.execute("""
                        CREATE TABLE IF NOT EXISTS bills (
                            bill_id INT AUTO_INCREMENT PRIMARY KEY,
                            user_id INT NOT NULL,
                            bill_name VARCHAR(150) NOT NULL,
                            category VARCHAR(50) NOT NULL,
                            amount DECIMAL(10,2) NOT NULL,
                            due_date DATE NOT NULL,
                            frequency VARCHAR(30) DEFAULT 'Monthly',
                            description TEXT,
                            status VARCHAR(20) DEFAULT 'Pending',
                            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                            FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
                        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
                    """)
                    # Check for legacy title column
                    cursor.execute("SHOW COLUMNS FROM bills LIKE 'title'")
                    if cursor.fetchone():
                        cursor.execute("ALTER TABLE bills CHANGE title bill_name VARCHAR(150) NOT NULL")
                    cursor.execute("SHOW COLUMNS FROM bills LIKE 'frequency'")
                    if not cursor.fetchone():
                        cursor.execute("ALTER TABLE bills ADD COLUMN frequency VARCHAR(30) DEFAULT 'Monthly'")
                    cursor.execute("SHOW COLUMNS FROM bills LIKE 'description'")
                    if not cursor.fetchone():
                        cursor.execute("ALTER TABLE bills ADD COLUMN description TEXT")

                    cursor.execute("""
                        CREATE TABLE IF NOT EXISTS payments (
                            payment_id INT AUTO_INCREMENT PRIMARY KEY,
                            user_id INT NOT NULL,
                            bill_id INT NOT NULL,
                            amount DECIMAL(10,2) NOT NULL,
                            payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                            payment_method VARCHAR(50) DEFAULT 'UPI',
                            status VARCHAR(30) DEFAULT 'Completed',
                            FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
                            FOREIGN KEY (bill_id) REFERENCES bills(bill_id) ON DELETE CASCADE
                        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
                    """)
                conn.close()
                logger.info("MySQL database & tables initialized successfully.")
            else:
                cursor = conn.cursor()
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS users (
                        user_id INTEGER PRIMARY KEY AUTOINCREMENT,
                        name TEXT NOT NULL,
                        email TEXT NOT NULL UNIQUE,
                        password TEXT NOT NULL,
                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                    );
                """)
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS bills (
                        bill_id INTEGER PRIMARY KEY AUTOINCREMENT,
                        user_id INTEGER NOT NULL,
                        bill_name TEXT NOT NULL,
                        category TEXT NOT NULL,
                        amount REAL NOT NULL,
                        due_date DATE NOT NULL,
                        frequency TEXT DEFAULT 'Monthly',
                        description TEXT,
                        status TEXT DEFAULT 'Pending',
                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY (user_id) REFERENCES users(user_id)
                    );
                """)
                
                # Check for legacy title column in SQLite
                cursor.execute("PRAGMA table_info(bills)")
                cols = [row['name'] for row in cursor.fetchall()]
                if 'title' in cols and 'bill_name' not in cols:
                    cursor.execute("ALTER TABLE bills RENAME COLUMN title TO bill_name")
                if 'frequency' not in cols:
                    cursor.execute("ALTER TABLE bills ADD COLUMN frequency TEXT DEFAULT 'Monthly'")
                if 'description' not in cols:
                    cursor.execute("ALTER TABLE bills ADD COLUMN description TEXT")

                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS payments (
                        payment_id INTEGER PRIMARY KEY AUTOINCREMENT,
                        user_id INTEGER NOT NULL,
                        bill_id INTEGER NOT NULL,
                        amount REAL NOT NULL,
                        payment_date DATETIME DEFAULT CURRENT_TIMESTAMP,
                        payment_method TEXT DEFAULT 'UPI',
                        status TEXT DEFAULT 'Completed',
                        FOREIGN KEY (user_id) REFERENCES users(user_id),
                        FOREIGN KEY (bill_id) REFERENCES bills(bill_id)
                    );
                """)
                conn.commit()
                conn.close()
                logger.info("SQLite database & tables initialized successfully.")
        except Exception as e:
            logger.error(f"Error initializing database: {e}")

    def seed_initial_user_data(self, user_id):
        """Seeds sample bills and payments for a user if they have zero bills."""
        conn, db_type = self.get_connection()
        try:
            if db_type == 'mysql':
                with conn.cursor() as cursor:
                    cursor.execute("SELECT COUNT(*) as count FROM bills WHERE user_id = %s", (user_id,))
                    count = cursor.fetchone()['count']
            else:
                cursor = conn.cursor()
                cursor.execute("SELECT COUNT(*) as count FROM bills WHERE user_id = ?", (user_id,))
                count = cursor.fetchone()['count']

            if count > 0:
                conn.close()
                return

            today = datetime.now().date()
            sample_bills = [
                ("Electricity Bill (MSEB)", "Electricity", 2450.00, (today + timedelta(days=5)).strftime("%Y-%m-%d"), "Monthly", "Home electricity bill", "Pending"),
                ("Jio Fiber Broadband", "Internet", 999.00, (today + timedelta(days=9)).strftime("%Y-%m-%d"), "Monthly", "100Mbps unlimited fiber internet", "Pending"),
                ("Airtel Postpaid", "Mobile", 699.00, (today + timedelta(days=12)).strftime("%Y-%m-%d"), "Monthly", "Postpaid family mobile plan", "Pending"),
                ("Netflix Premium Plan", "OTT", 649.00, (today - timedelta(days=2)).strftime("%Y-%m-%d"), "Monthly", "4K Ultra HD subscription", "Overdue"),
                ("House Rent", "Rent", 18000.00, (today - timedelta(days=4)).strftime("%Y-%m-%d"), "Monthly", "Monthly apartment rent", "Overdue"),
                ("HDFC Car Loan EMI", "EMI", 12500.00, (today - timedelta(days=15)).strftime("%Y-%m-%d"), "Monthly", "Automobile loan monthly installment", "Paid"),
                ("Health Insurance (Star)", "Insurance", 4500.00, (today - timedelta(days=20)).strftime("%Y-%m-%d"), "Yearly", "Annual health protection coverage", "Paid")
            ]

            if db_type == 'mysql':
                with conn.cursor() as cursor:
                    for b in sample_bills:
                        cursor.execute(
                            "INSERT INTO bills (user_id, bill_name, category, amount, due_date, frequency, description, status) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)",
                            (user_id, b[0], b[1], b[2], b[3], b[4], b[5], b[6])
                        )
                        bill_id = cursor.lastrowid
                        if b[6] == 'Paid':
                            cursor.execute(
                                "INSERT INTO payments (user_id, bill_id, amount, payment_method, status) VALUES (%s, %s, %s, %s, %s)",
                                (user_id, bill_id, b[2], "UPI", "Completed")
                            )
                conn.close()
            else:
                cursor = conn.cursor()
                for b in sample_bills:
                    cursor.execute(
                        "INSERT INTO bills (user_id, bill_name, category, amount, due_date, frequency, description, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                        (user_id, b[0], b[1], b[2], b[3], b[4], b[5], b[6])
                    )
                    bill_id = cursor.lastrowid
                    if b[6] == 'Paid':
                        cursor.execute(
                            "INSERT INTO payments (user_id, bill_id, amount, payment_method, status) VALUES (?, ?, ?, ?, ?)",
                            (user_id, bill_id, b[2], "UPI", "Completed")
                        )
                conn.commit()
                conn.close()

            logger.info(f"Seeded initial sample bills for user_id={user_id}")
        except Exception as e:
            logger.error(f"Error seeding user data: {e}")

db = Database()
