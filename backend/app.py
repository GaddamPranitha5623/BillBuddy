from flask import Flask, jsonify
from flask_cors import CORS
from config import Config
from db import db
from routes.auth import auth_bp
from routes.dashboard import dashboard_bp

app = Flask(__name__)
app.config.from_object(Config)

# Enable CORS for React frontend
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Initialize Database Schema
with app.app_context():
    db.init_db()

# Register Blueprints
app.register_blueprint(auth_bp)
app.register_blueprint(dashboard_bp)

@app.route('/')
def home():
    return jsonify({
        'status': 'online',
        'service': 'BillBuddy API',
        'version': '1.0.0'
    })

if __name__ == '__main__':
    print("Starting BillBuddy Flask Backend on http://127.0.0.1:5001")
    app.run(host='0.0.0.0', port=5001, debug=True)
