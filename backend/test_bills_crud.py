import unittest
import json
from app import app
from routes.auth import generate_token
from db import db

class BillManagementTestCase(unittest.TestCase):
    def setUp(self):
        self.app = app.test_client()
        self.app.testing = True

        # Setup User A
        conn, db_type = db.get_connection()
        if db_type == 'mysql':
            with conn.cursor() as cursor:
                cursor.execute("SELECT user_id FROM users WHERE email = %s", ('usera@example.com',))
                row = cursor.fetchone()
                if not row:
                    cursor.execute("INSERT INTO users (name, email, password) VALUES ('User A', 'usera@example.com', 'hashA')")
                    self.user_a_id = cursor.lastrowid
                else:
                    self.user_a_id = row['user_id']

                cursor.execute("SELECT user_id FROM users WHERE email = %s", ('userb@example.com',))
                row_b = cursor.fetchone()
                if not row_b:
                    cursor.execute("INSERT INTO users (name, email, password) VALUES ('User B', 'userb@example.com', 'hashB')")
                    self.user_b_id = cursor.lastrowid
                else:
                    self.user_b_id = row_b['user_id']
            conn.close()
        else:
            cursor = conn.cursor()
            cursor.execute("SELECT user_id FROM users WHERE email = ?", ('usera@example.com',))
            row = cursor.fetchone()
            if not row:
                cursor.execute("INSERT INTO users (name, email, password) VALUES ('User A', 'usera@example.com', 'hashA')")
                conn.commit()
                self.user_a_id = cursor.lastrowid
            else:
                self.user_a_id = row['user_id']

            cursor.execute("SELECT user_id FROM users WHERE email = ?", ('userb@example.com',))
            row_b = cursor.fetchone()
            if not row_b:
                cursor.execute("INSERT INTO users (name, email, password) VALUES ('User B', 'userb@example.com', 'hashB')")
                conn.commit()
                self.user_b_id = cursor.lastrowid
            else:
                self.user_b_id = row_b['user_id']
            conn.close()

        self.token_a = generate_token(self.user_a_id, 'usera@example.com', 'User A')
        self.token_b = generate_token(self.user_b_id, 'userb@example.com', 'User B')

    def test_full_bill_crud_and_security(self):
        print("\n--- 1. Add Bill (User A) ---")
        new_bill = {
            "bill_name": "Airtel Wi-Fi broadband",
            "category": "Internet",
            "amount": 1499.00,
            "due_date": "2026-10-25",
            "frequency": "Monthly",
            "description": "Office fiber connection"
        }
        res_add = self.app.post('/api/bills', data=json.dumps(new_bill),
                                headers={'Authorization': f'Bearer {self.token_a}'},
                                content_type='application/json')
        add_data = res_add.get_json()
        print("Add Bill Response:", res_add.status_code, add_data)
        self.assertEqual(res_add.status_code, 201)
        bill_id = add_data['bill_id']

        print("\n--- 2. Get Bills (User A vs User B Security Check) ---")
        res_get_a = self.app.get('/api/bills', headers={'Authorization': f'Bearer {self.token_a}'})
        bills_a = res_get_a.get_json()['bills']
        self.assertTrue(any(b['bill_id'] == bill_id for b in bills_a))

        res_get_b = self.app.get('/api/bills', headers={'Authorization': f'Bearer {self.token_b}'})
        bills_b = res_get_b.get_json()['bills']
        self.assertFalse(any(b['bill_id'] == bill_id for b in bills_b))

        print("\n--- 3. Edit Bill (User A) ---")
        updated_bill = {
            "bill_name": "Airtel Wi-Fi 200Mbps",
            "category": "Internet",
            "amount": 1799.00,
            "due_date": "2026-10-28",
            "frequency": "Monthly",
            "description": "Upgraded fiber plan"
        }
        res_put = self.app.put(f'/api/bills/{bill_id}', data=json.dumps(updated_bill),
                              headers={'Authorization': f'Bearer {self.token_a}'},
                              content_type='application/json')
        print("Update Bill Response:", res_put.status_code, res_put.get_json())
        self.assertEqual(res_put.status_code, 200)

        # User B trying to edit User A's bill -> Expects 403 Forbidden
        res_put_unauth = self.app.put(f'/api/bills/{bill_id}', data=json.dumps(updated_bill),
                                     headers={'Authorization': f'Bearer {self.token_b}'},
                                     content_type='application/json')
        self.assertEqual(res_put_unauth.status_code, 403)

        print("\n--- 4. Mark Bill as Paid ---")
        res_pay = self.app.post(f'/api/bills/{bill_id}/pay', headers={'Authorization': f'Bearer {self.token_a}'})
        print("Pay Bill Response:", res_pay.status_code, res_pay.get_json())
        self.assertEqual(res_pay.status_code, 200)

        print("\n--- 5. Delete Bill ---")
        res_del = self.app.delete(f'/api/bills/{bill_id}', headers={'Authorization': f'Bearer {self.token_a}'})
        print("Delete Bill Response:", res_del.status_code, res_del.get_json())
        self.assertEqual(res_del.status_code, 200)

if __name__ == '__main__':
    unittest.main()
