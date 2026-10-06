import unittest
import json
from app import app
from routes.auth import generate_token
from db import db

class DashboardAPITestCase(unittest.TestCase):
    def setUp(self):
        self.app = app.test_client()
        self.app.testing = True

        # Ensure test user exists
        conn, db_type = db.get_connection()
        if db_type == 'mysql':
            with conn.cursor() as cursor:
                cursor.execute("SELECT user_id FROM users WHERE email = %s", ('dashuser@example.com',))
                row = cursor.fetchone()
                if not row:
                    cursor.execute("INSERT INTO users (name, email, password) VALUES (%s, %s, %s)",
                                   ('Pranitha', 'dashuser@example.com', 'hashedpass'))
                    self.user_id = cursor.lastrowid
                else:
                    self.user_id = row['user_id']
            conn.close()
        else:
            cursor = conn.cursor()
            cursor.execute("SELECT user_id FROM users WHERE email = ?", ('dashuser@example.com',))
            row = cursor.fetchone()
            if not row:
                cursor.execute("INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
                               ('Pranitha', 'dashuser@example.com', 'hashedpass'))
                conn.commit()
                self.user_id = cursor.lastrowid
            else:
                self.user_id = row['user_id']
            conn.close()

        self.token = generate_token(self.user_id, 'dashuser@example.com', 'Pranitha')

    def test_dashboard_endpoint(self):
        print("\n--- Testing GET /api/dashboard ---")
        res = self.app.get('/api/dashboard', headers={'Authorization': f'Bearer {self.token}'})
        data = res.get_json()
        print("Dashboard API Response:", res.status_code)
        self.assertEqual(res.status_code, 200)
        self.assertIn('summary', data)
        self.assertIn('upcoming_bills', data)
        self.assertIn('overdue_bills', data)
        self.assertIn('recent_payments', data)
        self.assertIn('monthly_spending', data)
        self.assertIn('category_spending', data)

    def test_bills_endpoint(self):
        print("\n--- Testing GET /api/bills ---")
        res = self.app.get('/api/bills', headers={'Authorization': f'Bearer {self.token}'})
        data = res.get_json()
        print("Bills API Response Status:", res.status_code, "Count:", len(data.get('bills', [])))
        self.assertEqual(res.status_code, 200)

    def test_payments_endpoint(self):
        print("\n--- Testing GET /api/payments ---")
        res = self.app.get('/api/payments', headers={'Authorization': f'Bearer {self.token}'})
        data = res.get_json()
        print("Payments API Response Status:", res.status_code, "Count:", len(data.get('payments', [])))
        self.assertEqual(res.status_code, 200)

if __name__ == '__main__':
    unittest.main()
