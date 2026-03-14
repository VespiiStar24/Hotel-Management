from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager

app = Flask(__name__)

# More permissive CORS for development
CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:8000", "http://127.0.0.1:8000"],
        "methods": ["GET", "POST", "PUT", "DELETE"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

app.config["JWT_SECRET_KEY"] = "your-super-secret-key-change-in-production"
jwt = JWTManager(app)

# Import and register routes
from routes.auth import bp as auth_bp
from routes.guest import bp as guest_bp
from routes.staff import bp as staff_bp

app.register_blueprint(auth_bp, url_prefix="/api")
app.register_blueprint(guest_bp, url_prefix="/api/guest")
app.register_blueprint(staff_bp, url_prefix="/api/staff")

@app.route('/')
def home():
    return jsonify({"message": "Hotel Management API is running!"})

@app.route('/api/health')
def health_check():
    return jsonify({"status": "healthy", "service": "Hotel Management API"})

if __name__ == "__main__":
    app.run(debug=True, port=5000, host='0.0.0.0')
