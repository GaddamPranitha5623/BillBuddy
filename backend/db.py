import os
import sqlite3
import logging
from datetime import datetime, timedelta

import pymysql
import pymysql.cursors

from config import Config

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class Database:
    def __init__(self):
        self.use_sqlite = False
        self.sqlite_file = os.path.join(
            os.path.dirname(os.path.abspath(__file__)),
            "billbuddy.db"
        )

    def get_connection(self):
        """Connect to MySQL; use SQLite if MySQL is unavailable."""
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
                    cursor.execute(
                        f"CREATE DATABASE IF NOT EXISTS `{Config.DB_NAME}`"
                    )

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

                return connection, "mysql"

            except Exception as error:
                logger.warning(
                    "MySQL connection failed (%s). "
                    "Falling back to SQLite.",
                    error
                )
                self.use_sqlite = True

        conn = sqlite3.connect(self.sqlite_file)
        conn.row_factory = sqlite3.Row

        return conn, "sqlite"

    def init_db(self):
        """Create tables and safely migrate existing database columns."""
        conn, db_type = self.get_connection()

        try:
            if db_type == "mysql":
                with conn.cursor() as cursor:
                    cursor.execute("""
                        CREATE TABLE IF NOT EXISTS users (
                            user_id INT AUTO_INCREMENT PRIMARY KEY,
                            name VARCHAR(100) NOT NULL,
                            email VARCHAR(150) NOT NULL UNIQUE,
                            password VARCHAR(255) NOT NULL,
                            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
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
                            FOREIGN KEY (user_id)
                                REFERENCES users(user_id)
                                ON DELETE CASCADE
                        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
                    """)

                    # Support an older bills table using the title column.
                    cursor.execute(
                        "SHOW COLUMNS FROM bills LIKE 'title'"
                    )

                    if cursor.fetchone():
                        cursor.execute("""
                            ALTER TABLE bills
                            CHANGE title bill_name VARCHAR(150) NOT NULL
                        """)

                    cursor.execute(
                        "SHOW COLUMNS FROM bills LIKE 'frequency'"
                    )

                    if not cursor.fetchone():
                        cursor.execute("""
                            ALTER TABLE bills
                            ADD COLUMN frequency VARCHAR(30)
                            DEFAULT 'Monthly'
                        """)

                    cursor.execute(
                        "SHOW COLUMNS FROM bills LIKE 'description'"
                    )

                    if not cursor.fetchone():
                        cursor.execute("""
                            ALTER TABLE bills
                            ADD COLUMN description TEXT
                        """)

                    cursor.execute("""
                        CREATE TABLE IF NOT EXISTS payments (
                            payment_id INT AUTO_INCREMENT PRIMARY KEY,
                            user_id INT NOT NULL,
                            bill_id INT NOT NULL,
                            amount DECIMAL(10,2) NOT NULL,
                            payment_date TIMESTAMP
                                DEFAULT CURRENT_TIMESTAMP,
                            payment_method VARCHAR(50) DEFAULT 'UPI',
                            status VARCHAR(30) DEFAULT 'Completed',
                            FOREIGN KEY (user_id)
                                REFERENCES users(user_id)
                                ON DELETE CASCADE,
                            FOREIGN KEY (bill_id)
                                REFERENCES bills(bill_id)
                                ON DELETE CASCADE
                        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
                    """)

            else:
                cursor = conn.cursor()

                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS users (
                        user_id INTEGER PRIMARY KEY AUTOINCREMENT,
                        name TEXT NOT NULL,
                        email TEXT NOT NULL UNIQUE,
                        password TEXT NOT NULL,
                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                    )
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
                        FOREIGN KEY (user_id)
                            REFERENCES users(user_id)
                    )
                """)

                cursor.execute("PRAGMA table_info(bills)")

                bill_columns = {
                    row["name"] for row in cursor.fetchall()
                }

                if (
                    "title" in bill_columns
                    and "bill_name" not in bill_columns
                ):
                    cursor.execute(
                        "ALTER TABLE bills "
                        "RENAME COLUMN title TO bill_name"
                    )

                    bill_columns.remove("title")
                    bill_columns.add("bill_name")

                if "frequency" not in bill_columns:
                    cursor.execute("""
                        ALTER TABLE bills
                        ADD COLUMN frequency TEXT DEFAULT 'Monthly'
                    """)

                if "description" not in bill_columns:
                    cursor.execute("""
                        ALTER TABLE bills
                        ADD COLUMN description TEXT
                    """)

                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS payments (
                        payment_id INTEGER PRIMARY KEY AUTOINCREMENT,
                        user_id INTEGER NOT NULL,
                        bill_id INTEGER NOT NULL,
                        amount REAL NOT NULL,
                        payment_date DATETIME
                            DEFAULT CURRENT_TIMESTAMP,
                        payment_method TEXT DEFAULT 'UPI',
                        status TEXT DEFAULT 'Completed',
                        FOREIGN KEY (user_id)
                            REFERENCES users(user_id),
                        FOREIGN KEY (bill_id)
                            REFERENCES bills(bill_id)
                    )
                """)

                conn.commit()

            logger.info(
                "%s database and tables initialized successfully.",
                db_type.upper()
            )

        except Exception:
            conn.rollback()
            logger.exception("Error initializing database")
            raise

        finally:
            conn.close()

    def seed_initial_user_data(self, user_id):
        """Add example bills and payments if this user has no bills."""
        conn, db_type = self.get_connection()

        try:
            if db_type == "mysql":
                with conn.cursor() as cursor:
                    cursor.execute(
                        """
                        SELECT COUNT(*) AS count
                        FROM bills
                        WHERE user_id = %s
                        """,
                        (user_id,)
                    )
                    count = cursor.fetchone()["count"]

            else:
                cursor = conn.cursor()

                cursor.execute(
                    """
                    SELECT COUNT(*) AS count
                    FROM bills
                    WHERE user_id = ?
                    """,
                    (user_id,)
                )

                count = cursor.fetchone()["count"]

            if count > 0:
                return

            today = datetime.now().date()

            sample_bills = [
                (
                    "Electricity Bill (MSEB)", "Electricity", 2450.00,
                    (today + timedelta(days=5)).isoformat(),
                    "Monthly", "Home electricity bill", "Pending"
                ),
                (
                    "Jio Fiber Broadband", "Internet", 999.00,
                    (today + timedelta(days=9)).isoformat(),
                    "Monthly", "100Mbps unlimited fiber internet",
                    "Pending"
                ),
                (
                    "Airtel Postpaid", "Mobile", 699.00,
                    (today + timedelta(days=12)).isoformat(),
                    "Monthly", "Postpaid family mobile plan", "Pending"
                ),
                (
                    "Netflix Premium Plan", "OTT", 649.00,
                    (today - timedelta(days=2)).isoformat(),
                    "Monthly", "4K Ultra HD subscription", "Overdue"
                ),
                (
                    "House Rent", "Rent", 18000.00,
                    (today - timedelta(days=4)).isoformat(),
                    "Monthly", "Monthly apartment rent", "Overdue"
                ),
                (
                    "HDFC Car Loan EMI", "EMI", 12500.00,
                    (today - timedelta(days=15)).isoformat(),
                    "Monthly", "Automobile loan monthly installment",
                    "Paid"
                ),
                (
                    "Health Insurance (Star)", "Insurance", 4500.00,
                    (today - timedelta(days=20)).isoformat(),
                    "Yearly", "Annual health protection coverage", "Paid"
                )
            ]

            for bill in sample_bills:
                if db_type == "mysql":
                    with conn.cursor() as cursor:
                        cursor.execute(
                            """
                            INSERT INTO bills
                            (
                                user_id, bill_name, category, amount,
                                due_date, frequency, description, status
                            )
                            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                            """,
                            (
                                user_id, bill[0], bill[1], bill[2],
                                bill[3], bill[4], bill[5], bill[6]
                            )
                        )

                        bill_id = cursor.lastrowid

                        if bill[6] == "Paid":
                            cursor.execute(
                                """
                                INSERT INTO payments
                                (
                                    user_id, bill_id, amount,
                                    payment_method, status
                                )
                                VALUES (%s, %s, %s, %s, %s)
                                """,
                                (
                                    user_id, bill_id, bill[2],
                                    "UPI", "Completed"
                                )
                            )

                else:
                    cursor = conn.cursor()

                    cursor.execute(
                        """
                        INSERT INTO bills
                        (
                            user_id, bill_name, category, amount,
                            due_date, frequency, description, status
                        )
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                        """,
                        (
                            user_id, bill[0], bill[1], bill[2],
                            bill[3], bill[4], bill[5], bill[6]
                        )
                    )

                    bill_id = cursor.lastrowid

                    if bill[6] == "Paid":
                        cursor.execute(
                            """
                            INSERT INTO payments
                            (
                                user_id, bill_id, amount,
                                payment_method, status
                            )
                            VALUES (?, ?, ?, ?, ?)
                            """,
                            (
                                user_id, bill_id, bill[2],
                                "UPI", "Completed"
                            )
                        )

            if db_type == "sqlite":
                conn.commit()

            logger.info(
                "Sample data created for user_id=%s",
                user_id
            )

        except Exception:
            conn.rollback()
            logger.exception("Error seeding initial user data")
            raise

        finally:
            conn.close()


db = Database()