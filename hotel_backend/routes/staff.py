from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required
import mysql.connector
from config import DB_CONFIG

bp = Blueprint('staff', __name__)

# 1. Staff Overview - ENSURE CORRECT STATUS VALUES
@bp.route("/overview", methods=["GET"])
@jwt_required()
def overview():
    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        cursor = conn.cursor(dictionary=True)
        
        # Total rooms
        cursor.execute("SELECT COUNT(*) as total FROM Rooms")
        total_rooms = cursor.fetchone()['total']
        
        # Occupied rooms - using 'Booked' status from your schema
        cursor.execute("SELECT COUNT(*) as occupied FROM Rooms WHERE Status='Booked'")
        occupied_rooms = cursor.fetchone()['occupied']
        
        # Pending orders - using 'Pending' status from your schema
        cursor.execute("SELECT COUNT(*) as pending FROM FoodOrders WHERE Status='Pending'")
        pending_orders = cursor.fetchone()['pending']
        
        conn.close()
        
        return jsonify({
            "totalRooms": total_rooms,
            "occupiedRooms": occupied_rooms,
            "pendingOrders": pending_orders
        })
        
    except Exception as e:
        print(f"Overview error: {str(e)}")
        return jsonify({"msg": f"Database error: {str(e)}"}), 500
# 2. View all bookings
@bp.route("/bookings", methods=["GET"])
@jwt_required()
def bookings():
    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT b.BookingID, g.Name AS guestName, r.RoomNumber as roomNumber, 
                   b.CheckIn as checkIn, b.CheckOut as checkOut, b.Status as status
            FROM Bookings b
            JOIN Guests g ON b.GuestID = g.GuestID
            JOIN Rooms r ON b.RoomID = r.RoomID
            ORDER BY b.CheckIn DESC
        """)
        result = cursor.fetchall()
        conn.close()
        
        return jsonify(result)
    except Exception as e:
        print(f"Bookings error: {str(e)}")
        return jsonify({"msg": f"Database error: {str(e)}"}), 500

# 3. View all rooms
@bp.route("/rooms", methods=["GET"])
@jwt_required()
def rooms():
    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT RoomID, RoomNumber as number, Type, Status as status, Price
            FROM Rooms 
            ORDER BY RoomNumber
        """)
        result = cursor.fetchall()
        conn.close()
        
        return jsonify(result)
    except Exception as e:
        print(f"Rooms error: {str(e)}")
        return jsonify({"msg": f"Database error: {str(e)}"}), 500

# 4. Add or update room
@bp.route("/rooms", methods=["POST"])
@jwt_required()
def add_room():
    data = request.json
    room_number = data.get("number")
    status = data.get("status")
    
    if not room_number:
        return jsonify({"msg": "Room number is required"}), 400

    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        cursor = conn.cursor(dictionary=True)
        
        # Check if room exists
        cursor.execute("SELECT RoomID FROM Rooms WHERE RoomNumber=%s", (room_number,))
        existing_room = cursor.fetchone()
        
        if existing_room:
            # Update existing room
            cursor.execute(
                "UPDATE Rooms SET Status=%s WHERE RoomNumber=%s",
                (status, room_number)
            )
            message = "Room status updated successfully"
        else:
            # Add new room (default to 'Single' type and 2000 price)
            cursor.execute(
                "INSERT INTO Rooms (RoomNumber, Type, Status, Price) VALUES (%s, 'Single', %s, 2000)",
                (room_number, status)
            )
            message = "Room added successfully"
        
        conn.commit()
        conn.close()
        
        return jsonify({"msg": message})
        
    except Exception as e:
        print(f"Add room error: {str(e)}")
        return jsonify({"msg": f"Database error: {str(e)}"}), 500

# 5. View all food orders - FIXED VERSION
@bp.route("/food-orders", methods=["GET"])
@jwt_required()
def food_orders():
    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT 
                f.OrderID as id, 
                g.Name AS guestName, 
                f.Item, 
                f.Quantity, 
                f.Status, 
                f.OrderTime
            FROM FoodOrders f
            JOIN Guests g ON f.GuestID = g.GuestID
            ORDER BY f.OrderTime DESC
        """)
        result = cursor.fetchall()
        conn.close()
        
        print(f"🍕 Food orders found: {len(result)}")  # Debug log
        for order in result:
            print(f"   Order: {order}")  # Debug each order
        
        return jsonify(result)
    except Exception as e:
        print(f"Food orders error: {str(e)}")
        return jsonify({"msg": f"Database error: {str(e)}"}), 500

# 6. Update food order status
@bp.route("/food-orders/<int:order_id>", methods=["PUT"])
@jwt_required()
def update_food_order(order_id):
    data = request.json
    status = data.get("status")

    if not status:
        return jsonify({"msg": "Status is required"}), 400

    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        cursor = conn.cursor()
        cursor.execute(
            "UPDATE FoodOrders SET Status=%s WHERE OrderID=%s",
            (status, order_id)
        )
        conn.commit()
        conn.close()
        
        return jsonify({"msg": "Food order status updated"})
        
    except Exception as e:
        print(f"Update food order error: {str(e)}")
        return jsonify({"msg": f"Database error: {str(e)}"}), 500

# 7. Activity logs - FIXED VERSION
@bp.route("/activity-logs", methods=["GET"])
@jwt_required()
def activity_logs():
    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        cursor = conn.cursor(dictionary=True)
        
        # Get recent bookings as activity - using booking creation logic
        cursor.execute("""
            SELECT 
                CONCAT('Booking #', b.BookingID, ' - Room ', r.RoomNumber) as action,
                NOW() as time,  -- Using current time since we don't have created_at in bookings
                g.Name as user
            FROM Bookings b
            JOIN Guests g ON b.GuestID = g.GuestID
            JOIN Rooms r ON b.RoomID = r.RoomID
            ORDER BY b.BookingID DESC
            LIMIT 10
        """)
        bookings_logs = cursor.fetchall()
        
        # Get recent food orders as activity - using actual OrderTime
        cursor.execute("""
            SELECT 
                CONCAT('Food Order #', f.OrderID, ' - ', f.Item) as action,
                f.OrderTime as time,
                g.Name as user
            FROM FoodOrders f
            JOIN Guests g ON f.GuestID = g.GuestID
            ORDER BY f.OrderTime DESC
            LIMIT 10
        """)
        orders_logs = cursor.fetchall()
        
        print(f"📋 Booking logs: {len(bookings_logs)}")  # Debug
        print(f"📋 Order logs: {len(orders_logs)}")     # Debug
        
        # Combine and format logs
        all_logs = []
        for log in bookings_logs + orders_logs:
            # Format timestamp properly
            if log['time']:
                if hasattr(log['time'], 'strftime'):
                    # It's a datetime object
                    formatted_time = log['time'].strftime("%Y-%m-%d %H:%M")
                else:
                    # It's already a string or other type
                    formatted_time = str(log['time'])
            else:
                formatted_time = "Unknown"
                
            all_logs.append({
                "action": log['action'],
                "time": formatted_time,
                "user": log['user']
            })
        
        # Sort by time (newest first) - using string comparison since we have mixed types
        all_logs.sort(key=lambda x: x['time'], reverse=True)
        
        conn.close()
        
        print(f"📋 Total logs: {len(all_logs)}")  # Debug
        return jsonify(all_logs[:10])  # Return top 10 most recent
        
    except Exception as e:
        print(f"Activity logs error: {str(e)}")
        return jsonify({"msg": f"Database error: {str(e)}"}), 500