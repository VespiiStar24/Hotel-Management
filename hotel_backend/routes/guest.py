from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
import mysql.connector
from config import DB_CONFIG

bp = Blueprint('guest', __name__)

# 1. Get guest dashboard data
@bp.route("/dashboard", methods=["GET"])
@jwt_required()
def dashboard():
    username = get_jwt_identity()

    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        cursor = conn.cursor(dictionary=True)
        
        # Get user ID and guest ID from username
        cursor.execute("""
            SELECT u.UserID, g.GuestID 
            FROM Users u 
            LEFT JOIN Guests g ON u.UserID = g.UserID 
            WHERE u.Username=%s
        """, (username,))
        user_data = cursor.fetchone()
        
        if not user_data or not user_data.get("GuestID"):
            conn.close()
            return jsonify({"msg": "Guest profile not found"}), 404
            
        guest_id = user_data["GuestID"]
        
        # Get bookings for this guest
        cursor.execute("""
            SELECT b.BookingID, r.RoomNumber, r.Type, b.CheckIn, b.CheckOut, b.Status
            FROM Bookings b
            JOIN Rooms r ON b.RoomID = r.RoomID
            WHERE b.GuestID = %s
        """, (guest_id,))
        bookings = cursor.fetchall()
        
        # Get food orders for this guest
        cursor.execute("""
            SELECT OrderID, Item, Quantity, Status, OrderTime
            FROM FoodOrders 
            WHERE GuestID = %s
        """, (guest_id,))
        orders = cursor.fetchall()
        
        conn.close()
        
        return jsonify({
            "bookings": bookings,
            "orders": orders
        })
        
    except Exception as e:
        print(f"Dashboard error: {str(e)}")
        return jsonify({"msg": f"Database error: {str(e)}"}), 500

# 2. Get available rooms
@bp.route("/rooms", methods=["GET"])
@jwt_required()
def get_rooms():
    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT RoomID, RoomNumber, Type, Price FROM Rooms WHERE Status='Available'")
        rooms = cursor.fetchall()
        conn.close()
        return jsonify(rooms)
    except Exception as e:
        print(f"Rooms error: {str(e)}")
        return jsonify({"msg": f"Error fetching rooms: {str(e)}"}), 500

# 3. Book a room
@bp.route("/book", methods=["POST"])
@jwt_required()
def book_room():
    username = get_jwt_identity()
    data = request.json
    
    room_id = data.get("room_id")
    check_in = data.get("check_in_date")
    check_out = data.get("check_out_date")

    if not room_id or not check_in or not check_out:
        return jsonify({"msg": "Room ID, check-in and check-out dates are required"}), 400

    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        cursor = conn.cursor(dictionary=True)
        
        # Get guest ID from username
        cursor.execute("""
            SELECT g.GuestID 
            FROM Guests g 
            JOIN Users u ON g.UserID = u.UserID 
            WHERE u.Username=%s
        """, (username,))
        guest = cursor.fetchone()
        
        if not guest:
            conn.close()
            return jsonify({"msg": "Guest profile not found"}), 404
            
        guest_id = guest["GuestID"]
        
        # Check if room is available
        cursor.execute("SELECT Status FROM Rooms WHERE RoomID=%s", (room_id,))
        room = cursor.fetchone()
        
        if not room or room["Status"] != "Available":
            conn.close()
            return jsonify({"msg": "Room is not available"}), 400

        # Create booking - Use CORRECT status value 'Confirmed'
        cursor.execute(
            "INSERT INTO Bookings (GuestID, RoomID, CheckIn, CheckOut, Status) VALUES (%s, %s, %s, %s, 'Confirmed')",
            (guest_id, room_id, check_in, check_out)
        )
        
        # Update room status - Use CORRECT status value 'Booked' (not 'Occupied')
        cursor.execute(
            "UPDATE Rooms SET Status='Booked' WHERE RoomID=%s",
            (room_id,)
        )
        
        conn.commit()
        conn.close()
        
        return jsonify({"msg": "Room booked successfully"})
        
    except Exception as e:
        print(f"Book room error: {str(e)}")
        return jsonify({"msg": f"Database error: {str(e)}"}), 500

# 4. Order food
@bp.route("/order-food", methods=["POST"])
@jwt_required()
def order_food():
    username = get_jwt_identity()
    data = request.json
    
    food_item = data.get("food_item")
    quantity = data.get("quantity")
    special_instructions = data.get("special_instructions", "")

    if not food_item or not quantity:
        return jsonify({"msg": "Food item and quantity are required"}), 400

    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        cursor = conn.cursor(dictionary=True)
        
        # Get guest ID from username
        cursor.execute("""
            SELECT g.GuestID 
            FROM Guests g 
            JOIN Users u ON g.UserID = u.UserID 
            WHERE u.Username=%s
        """, (username,))
        guest = cursor.fetchone()
        
        if not guest:
            conn.close()
            return jsonify({"msg": "Guest profile not found"}), 404
            
        guest_id = guest["GuestID"]
        
        # Create food order - Use CORRECT status value 'Pending'
        cursor.execute(
            "INSERT INTO FoodOrders (GuestID, Item, Quantity, Status) VALUES (%s, %s, %s, 'Pending')",
            (guest_id, food_item, quantity)
        )
        conn.commit()
        conn.close()
        
        return jsonify({"msg": "Food order placed successfully"})
        
    except Exception as e:
        print(f"Order food error: {str(e)}")
        return jsonify({"msg": f"Database error: {str(e)}"}), 500

# 5. Get food orders
@bp.route("/orders", methods=["GET"])
@jwt_required()
def food_orders():
    username = get_jwt_identity()

    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        cursor = conn.cursor(dictionary=True)
        
        # Get guest ID from username
        cursor.execute("""
            SELECT g.GuestID 
            FROM Guests g 
            JOIN Users u ON g.UserID = u.UserID 
            WHERE u.Username=%s
        """, (username,))
        guest = cursor.fetchone()
        
        if not guest:
            conn.close()
            return jsonify({"msg": "Guest profile not found"}), 404
            
        guest_id = guest["GuestID"]
        
        # Get food orders
        cursor.execute("""
            SELECT OrderID, Item, Quantity, Status, OrderTime
            FROM FoodOrders 
            WHERE GuestID = %s
            ORDER BY OrderTime DESC
        """, (guest_id,))
        orders = cursor.fetchall()
        
        conn.close()
        
        return jsonify(orders)
        
    except Exception as e:
        print(f"Food orders error: {str(e)}")
        return jsonify({"msg": f"Database error: {str(e)}"}), 500