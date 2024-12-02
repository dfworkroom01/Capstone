import logging
import sys
from flask_jwt_extended import create_access_token, JWTManager, jwt_required, get_jwt_identity
from flask import Flask, request, jsonify
from flask_bcrypt import Bcrypt
import pyotp
from flask_cors import CORS
from models import init_db, mysql
from config import Config

# Configure logging to go to stdout
logging.basicConfig(stream=sys.stdout, level=logging.DEBUG)

app = Flask(__name__)
CORS(app)
app.config.from_object(Config)
init_db(app)
bcrypt = Bcrypt(app)

# Initialize JWT Manager
jwt = JWTManager(app)

@jwt.expired_token_loader
def expired_token_callback(jwt_header, jwt_payload):
    return jsonify({"message": "The token has expired"}), 401


# User registration (sign up)
@app.route('/register', methods=['POST'])
def register():
    data = request.json
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')

    if not username or not email or not password:
        return jsonify({"message": "Username, email, and password are required!"}), 400

    cursor = mysql.connection.cursor()
    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
    totp_secret = pyotp.random_base32()

    try:
        cursor.execute('INSERT INTO users (username, email, password, totp_secret) VALUES (%s, %s, %s, %s)',
                       (username, email, hashed_password, totp_secret))
        mysql.connection.commit()
    except Exception as e:
        mysql.connection.rollback()
        return jsonify({"message": f"Error registering user: {str(e)}"}), 500
    finally:
        cursor.close()

    return jsonify({"message": "User registered successfully!"}), 201

# User login (email + password)
@app.route('/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({"message": "Email and password are required!"}), 400

    cursor = mysql.connection.cursor()
    cursor.execute('SELECT * FROM users WHERE email = %s', (email,))
    user = cursor.fetchone()

    if user and bcrypt.check_password_hash(user[3], password):
        user_id = user[0]
        username = user[1]

        # Convert user_id as a string
        token = create_access_token(identity=str(user_id))  # Convert user_id to string
        logging.debug(f"JWT Token generated for User {user_id}: {token}")

        cursor.close()
        return jsonify({'token': token}), 200
        
        
    else:
        cursor.close()
        return jsonify({"message": "Invalid email or password"}), 401

# 2FA verification (TOTP)
@app.route('/verify_2fa', methods=['POST'])
@jwt_required()
def verify_2fa():
    try:
        # Extract TOTP code from the request body
        data = request.json
        totp_code = data.get('totp_code')

        if not totp_code:
            return jsonify({"message": "TOTP code is required!"}), 400

        # Get the user ID from the JWT token
        user_id = get_jwt_identity()
        user_id = int(user_id)  # Ensure it's in integer form

        cursor = mysql.connection.cursor()
        cursor.execute('SELECT totp_secret FROM users WHERE id = %s', (user_id,))
        user = cursor.fetchone()

        if user:
            totp_secret = user[0]  # This index matches the database column for totp_secret select result
            totp = pyotp.TOTP(totp_secret)
            logging.debug(f"Generated TOTP Code for User: {totp_code}")
            

            # Verify the TOTP code
            if totp.verify(totp_code):
                cursor.close()
                return jsonify({"message": "2FA verification successful!"}), 200
            else:
                cursor.close()
                return jsonify({"message": "Invalid 2FA code"}), 401
        else:
            cursor.close()
            return jsonify({"message": "User not found"}), 404
    except Exception as e:
        print(f"Error during 2FA verification: {str(e)}")
        return jsonify({"message": "An error occurred during 2FA verification"}), 500
    finally:
        cursor.close()

# Retrieve the TOTP code for testing (route to generate the 6-digit code)
@app.route('/generate_2fa_code', methods=['GET'])
@jwt_required()
def generate_2fa_code():
    try:
        user_id = get_jwt_identity()
        user_id = int(user_id)
        
        cursor = mysql.connection.cursor()
        cursor.execute('SELECT totp_secret FROM users WHERE id = %s', (user_id,))
        user = cursor.fetchone()

        if user:
            totp_secret = user[0]  # Retrieve the user's TOTP secret
            totp = pyotp.TOTP(totp_secret)  # Create a TOTP object using the secret
            totp_code = totp.now()  # Generate the 6-digit TOTP code
            # Print the generated code to the console
            logging.debug(f"Generated TOTP Code for User: {totp_code}")

            cursor.close()
            return jsonify({"totp_code": totp_code}), 200  # Send back the generated 6-digit code
            
        else:
            cursor.close()
            return jsonify({"message": "User not found"}), 404
    except Exception as e:
        cursor.close()
        return jsonify({"message": f"An error occurred: {str(e)}"}), 500

# Retrieve the TOTP secret (for testing)
@app.route('/get_totp_secret', methods=['GET'])
@jwt_required()
def get_totp_secret():
    try:
        user_id = get_jwt_identity()
        user_id = int(user_id)
        cursor = mysql.connection.cursor()
        cursor.execute('SELECT totp_secret FROM users WHERE id = %s', (user_id,))
        user = cursor.fetchone()
        print(f"Fetched user: {user}")  # Debugging line

        if user:
            totp_secret = user[0]  # Ensure this index is correct and matches the schema
            return jsonify({"totp_secret": totp_secret})
        else:
            return jsonify({"message": "User not found"}), 404
    except Exception as e:
        error_message = f"Error fetching TOTP secret: {str(e)}"
        print(error_message)  # Log the error for debugging
        return jsonify({"message": error_message}), 500

if __name__ == '__main__':
    app.run(debug=True)
