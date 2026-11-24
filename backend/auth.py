
from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from db import get_db_connection

auth = Blueprint("auth", __name__)


# REGISTER
@auth.route("/api/register", methods=["POST"])
def register():

    data = request.get_json(silent=True) or {}

    username = data.get("username", "").strip()
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not username or not email or not password:
        return jsonify({"error": "All fields are required"}), 400

    if len(password) < 8:
        return jsonify({"error": "Password must contain at least 8 characters"}), 400

    connection = None
    cursor = None

    try:
        connection = get_db_connection()
        cursor = connection.cursor()

        password_hash = generate_password_hash(password)

        cursor.execute(
            """
            INSERT INTO users (username, email, password_hash)
            VALUES (%s, %s, %s)
            """,
            (username, email, password_hash)
        )

        connection.commit()

        return jsonify({"message": "Registration successful!"}), 201

    except Exception as error:
        if connection and connection.is_connected():
            connection.rollback()

        if "1062" in str(error):
            return jsonify({"error": "Email already registered"}), 409

        return jsonify({"error": str(error)}), 500

    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()


# LOGIN
@auth.route("/api/login", methods=["POST"])
def login():

    data = request.get_json(silent=True) or {}

    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    connection = None
    cursor = None

    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        cursor.execute(
            "SELECT id, username, email, password_hash FROM users WHERE email = %s",
            (email,)
        )

        user = cursor.fetchone()

        if not user or not check_password_hash(
            user["password_hash"], password
        ):
            return jsonify({"error": "Invalid email or password"}), 401

        return jsonify({
            "message": "Login successful!",
            "user": {
                "id": user["id"],
                "username": user["username"],
                "email": user["email"]
            }
        }), 200

    except Exception as error:
        return jsonify({"error": str(error)}), 500

    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()

