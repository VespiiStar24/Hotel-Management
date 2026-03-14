from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
import mysql.connector
from config import DB_CONFIG

bp = Blueprint('auth', __name__)

@bp.route("/login", methods=["POST"])
def login():
    data = request.json
    username = data.get("username")
    password = data.get("password")
    role = data.get("role")

    if not username or not password or not role:
        return jsonify({"msg": "Username, password and role are required"}), 400

    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        cursor = conn.cursor(dictionary=True)
        
        cursor.execute(
            "SELECT * FROM Users WHERE Username=%s AND PasswordHash=%s AND Role=%s", 
            (username, password, role)
        )
        user = cursor.fetchone()
        conn.close()

        if user:
            # Create token with username as identity
            access_token = create_access_token(identity=username)
            return jsonify({
                "token": access_token,
                "role": user["Role"],
                "username": user["Username"]
            })
        else:
            return jsonify({"msg": "Invalid credentials"}), 401
            
    except Exception as e:
        print(f"Login error: {str(e)}")
        return jsonify({"msg": f"Database error: {str(e)}"}), 500

@bp.route("/signup", methods=["POST"])
def signup():
    data = request.json
    username = data.get("username")
    email = data.get("email")
    password = data.get("password")
    phone = data.get("phone", "")
    role = "guest"

    if not username or not email or not password:
        return jsonify({"msg": "Username, email and password are required"}), 400

    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        cursor = conn.cursor(dictionary=True)
        
        cursor.execute("SELECT * FROM Users WHERE Username=%s", (username,))
        if cursor.fetchone():
            conn.close()
            return jsonify({"msg": "Username already exists"}), 400

        cursor.execute(
            "INSERT INTO Users (Username, Email, PasswordHash, Phone, Role) VALUES (%s, %s, %s, %s, %s)",
            (username, email, password, phone, role)
        )
        conn.commit()
        
        user_id = cursor.lastrowid
        
        cursor.execute(
            "INSERT INTO Guests (UserID, Name, Email, Phone) VALUES (%s, %s, %s, %s)",
            (user_id, username, email, phone)
        )
        conn.commit()
        conn.close()

        return jsonify({"msg": "Account created successfully"})
        
    except Exception as e:
        print(f"Signup error: {str(e)}")
        return jsonify({"msg": f"Database error: {str(e)}"}), 500

# Test protected route
@bp.route("/protected", methods=["GET"])
@jwt_required()
def protected():
    current_user = get_jwt_identity()
    return jsonify(logged_in_as=current_user), 200