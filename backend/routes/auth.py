from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
import datetime
import re

from config import Config
from db import db

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")

EMAIL_REGEX = r"^[\w\.-]+@[\w\.-]+\.\w+$"


def generate_token(user_id, email, name):
    payload = {
        "user_id": user_id,
        "email": email,
        "name": name,
        "exp": datetime.datetime.now(datetime.timezone.utc)
        + datetime.timedelta(hours=Config.JWT_EXPIRATION_HOURS)
    }

    return jwt.encode(
        payload,
        Config.SECRET_KEY,
        algorithm="HS256"
    )


def verify_token(token):
    try:
        return jwt.decode(
            token,
            Config.SECRET_KEY,
            algorithms=["HS256"]
        )
    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError):
        return None


@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json() or {}

    name = data.get("name", "").strip()
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")
    confirm_password = data.get("confirmPassword", "")

    # Validate input
    if not name or not email or not password:
        return jsonify({
            "error": "Please fill in all required fields."
        }), 400

    if not re.match(EMAIL_REGEX, email):
        return jsonify({
            "error": "Please enter a valid email address."
        }), 400

    if len(password) < 6:
        return jsonify({
            "error": "Password must be at least 6 characters long."
        }), 400

    if password != confirm_password:
        return jsonify({
            "error": "Password and Confirm Password do not match."
        }), 400

    conn, db_type = db.get_connection()

    try:
        # Check whether the email already exists
        if db_type == "mysql":
            with conn.cursor() as cursor:
                cursor.execute(
                    "SELECT user_id FROM users WHERE email = %s",
                    (email,)
                )
                existing = cursor.fetchone()
        else:
            cursor = conn.cursor()
            cursor.execute(
                "SELECT user_id FROM users WHERE email = ?",
                (email,)
            )
            existing = cursor.fetchone()

        if existing:
            return jsonify({
                "error": (
                    "An account with this email already exists. "
                    "Please login."
                )
            }), 400

        # Hash password
        hashed_password = generate_password_hash(
            password,
            method="pbkdf2:sha256"
        )

        # Create user directly without email verification
        if db_type == "mysql":
            with conn.cursor() as cursor:
                cursor.execute(
                    """
                    INSERT INTO users (name, email, password)
                    VALUES (%s, %s, %s)
                    """,
                    (name, email, hashed_password)
                )
                user_id = cursor.lastrowid

            conn.commit()

        else:
            cursor = conn.cursor()
            cursor.execute(
                """
                INSERT INTO users (name, email, password)
                VALUES (?, ?, ?)
                """,
                (name, email, hashed_password)
            )
            user_id = cursor.lastrowid
            conn.commit()

        # Close database connection
        conn.close()

        # Generate token and return user details
        token = generate_token(user_id, email, name)

        user_data = {
            "user_id": user_id,
            "name": name,
            "email": email
        }

        return jsonify({
            "message": "Registration successful!",
            "token": token,
            "user": user_data
        }), 201

    except Exception as e:
        print("Registration error:", e)

        try:
            conn.rollback()
            conn.close()
        except Exception:
            pass

        return jsonify({
            "error": "Registration failed due to a database error."
        }), 500


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json() or {}

    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not email or not password:
        return jsonify({
            "error": "Please provide both email and password."
        }), 400

    if not re.match(EMAIL_REGEX, email):
        return jsonify({
            "error": "Please enter a valid email address."
        }), 400

    conn, db_type = db.get_connection()

    try:
        # Fetch user details
        if db_type == "mysql":
            with conn.cursor() as cursor:
                cursor.execute(
                    """
                    SELECT user_id, name, email, password
                    FROM users
                    WHERE email = %s
                    """,
                    (email,)
                )
                user = cursor.fetchone()

            conn.close()

        else:
            cursor = conn.cursor()
            cursor.execute(
                """
                SELECT user_id, name, email, password
                FROM users
                WHERE email = ?
                """,
                (email,)
            )
            row = cursor.fetchone()
            user = dict(row) if row else None
            conn.close()

        # Validate credentials
        if not user or not check_password_hash(
            user["password"], password
        ):
            return jsonify({
                "error": "Invalid email or password. Please try again."
            }), 401

        # Generate JWT directly without checking email verification
        token = generate_token(
            user["user_id"],
            user["email"],
            user["name"]
        )

        user_data = {
            "user_id": user["user_id"],
            "name": user["name"],
            "email": user["email"]
        }

        return jsonify({
            "message": "Login successful!",
            "token": token,
            "user": user_data
        }), 200

    except Exception as e:
        print("Login error:", e)

        try:
            conn.close()
        except Exception:
            pass

        return jsonify({
            "error": "Login failed due to a server error."
        }), 500


@auth_bp.route("/me", methods=["GET"])
def get_current_user():
    auth_header = request.headers.get("Authorization", "")

    if not auth_header.startswith("Bearer "):
        return jsonify({
            "error": "Authorization header missing or invalid format."
        }), 401

    token = auth_header.split(" ", 1)[1]
    payload = verify_token(token)

    if not payload:
        return jsonify({
            "error": "Token expired or invalid."
        }), 401

    return jsonify({
        "user": {
            "user_id": payload["user_id"],
            "email": payload["email"],
            "name": payload["name"]
        }
    }), 200