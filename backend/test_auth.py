import unittest
import json
from app import app
from db import db

class AuthTestCase(unittest.TestCase):
    def setUp(self):
        self.app = app.test_client()
        self.app.testing = True

        # Clear test database record if needed
        conn, db_type = db.get_connection()
        if db_type == 'mysql':
            with conn.cursor() as cursor:
                cursor.execute("DELETE FROM users WHERE email = %s", ('teststudent@example.com',))
            conn.close()
        else:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM users WHERE email = ?", ('teststudent@example.com',))
            conn.commit()
            conn.close()

    def test_full_auth_flow(self):
        print("\n--- Testing 1: User Registration ---")
        reg_payload = {
            "name": "Test Student",
            "email": "teststudent@example.com",
            "password": "Password123",
            "confirmPassword": "Password123"
        }
        res = self.app.post('/api/auth/register', data=json.dumps(reg_payload), content_type='application/json')
        data = res.get_json()
        print("Register Response:", res.status_code, data)
        self.assertEqual(res.status_code, 201)
        self.assertIn('token', data)
        self.assertEqual(data['user']['email'], 'teststudent@example.com')

        print("\n--- Testing 2: Duplicate Registration Prevention ---")
        res_dup = self.app.post('/api/auth/register', data=json.dumps(reg_payload), content_type='application/json')
        dup_data = res_dup.get_json()
        print("Duplicate Register Response:", res_dup.status_code, dup_data)
        self.assertEqual(res_dup.status_code, 400)
        self.assertIn('already exists', dup_data['error'])

        print("\n--- Testing 3: Failed Login (Wrong Password) ---")
        bad_login = {
            "email": "teststudent@example.com",
            "password": "WrongPassword"
        }
        res_bad = self.app.post('/api/auth/login', data=json.dumps(bad_login), content_type='application/json')
        print("Bad Login Response:", res_bad.status_code, res_bad.get_json())
        self.assertEqual(res_bad.status_code, 401)

        print("\n--- Testing 4: Successful Login ---")
        good_login = {
            "email": "teststudent@example.com",
            "password": "Password123"
        }
        res_login = self.app.post('/api/auth/login', data=json.dumps(good_login), content_type='application/json')
        login_data = res_login.get_json()
        print("Successful Login Response:", res_login.status_code, login_data)
        self.assertEqual(res_login.status_code, 200)
        token = login_data['token']

        print("\n--- Testing 5: Protected /api/auth/me Endpoint ---")
        res_me = self.app.get('/api/auth/me', headers={'Authorization': f'Bearer {token}'})
        me_data = res_me.get_json()
        print("Me Endpoint Response:", res_me.status_code, me_data)
        self.assertEqual(res_me.status_code, 200)
        self.assertEqual(me_data['user']['email'], 'teststudent@example.com')

if __name__ == '__main__':
    unittest.main()
