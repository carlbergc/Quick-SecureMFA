from flask import Flask, request, jsonify   # handles http requests
from flask_cors import CORS
from db import get_db, init_db
from auth import generate_totp_secret, verify_totp, encrypt_secret, decrypt_secret
import redis
import bcrypt
import os
import uuid
import requests as req
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app, origins=["http://localhost:5173", "http://localhost:8081"])

# makes connection to redis in docker
r = redis.Redis(
    host=os.getenv("REDIS_HOST"),
    port=os.getenv("REDIS_PORT"),
    decode_responses=True
)


# sends push notifications to QuickMFA through user click
def send_push_notification(push_token, code):
    message = {
        "to": push_token,
        "sound": "default",
        "title": "QuickMFA Verification",
        "body": f"Your code is ready. Open QuickMFA to view it.",
        "data": {"code": code},
    }
    req.post(
        "https://exp.host/--/api/v2/push/send",
        json=message,
        headers={"Content-Type": "application/json"}
    )


# registers user into db and encrypts info
@app.route("/register", methods=["POST"])
def register():
    data = request.json
    username = data.get("username", "").strip()
    password = data.get("password", "")
 
    if not username or not password:
        return jsonify({"error": "Username and password are required"}), 400
 
    hashed = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
    raw_secret = generate_totp_secret()
    encrypted_secret = encrypt_secret(raw_secret)  # Encrypt before storing
 
    try:
        conn = get_db()
        cur = conn.cursor()
        cur.execute(
            "INSERT INTO users (username, password, totp_secret) VALUES (%s, %s, %s)",
            (username, hashed, encrypted_secret)
        )
        conn.commit()
        cur.close()
        conn.close()
        return jsonify({"message": "User registered"})
    except Exception as e:
        return jsonify({"error": str(e)}), 400


# saves token for user when generating a code
@app.route("/save-token", methods=["POST"])
def save_token():
    data = request.json
    username = data["username"]
    push_token = data["push_token"]
    conn = get_db()
    cur = conn.cursor()
    cur.execute("UPDATE users SET push_token = %s WHERE username = %s", (push_token, username))
    conn.commit()
    cur.close()
    conn.close()
    return jsonify({"message": "Token saved"})


# confirms user info with db and decrypts with utf-8
@app.route("/login", methods=["POST"])
def login():
    data = request.json
    username = data["username"]
    password = data["password"].encode("utf-8")
    conn = get_db()
    cur = conn.cursor()
    cur.execute("SELECT password, totp_secret FROM users WHERE username = %s", (username,))
    user = cur.fetchone()
    cur.close()
    conn.close()
    if not user or not bcrypt.checkpw(password, user[0].encode("utf-8")):
        return jsonify({"error": "Invalid credentials"}), 401
    temp_token = str(uuid.uuid4())
    r.setex(f"pending:{temp_token}", 120, username)
    return jsonify({"message": "Password verified", "temp_token": temp_token})


# generates code after button press to send to QuickMFA for logged in user
@app.route("/generate-code", methods=["POST"])
def generate_code():
    data = request.json
    temp_token = data["temp_token"]
    username = r.get(f"pending:{temp_token}")
    if not username:
        return jsonify({"error": "Session expired"}), 401
    conn = get_db()
    cur = conn.cursor()
    cur.execute("SELECT totp_secret, push_token FROM users WHERE username = %s", (username,))
    user = cur.fetchone()
    cur.close()
    conn.close()
    if not user:
        return jsonify({"error": "User not found"}), 404
    secret, push_token = user
    import pyotp
    decrypted_secret = decrypt_secret(secret)
    totp = pyotp.TOTP(decrypted_secret)
    code = totp.now()
    r.setex(f"code:{temp_token}", 120, code)
    r.setex(f"display:{username}", 120, code)
    if push_token:
        send_push_notification(push_token, code)
    return jsonify({"message": "Code sent to your authenticator app"})


# verifies TOTP request when user inputs the MFA code
@app.route("/verify-totp", methods=["POST"])
def verify_totp_route():
    data = request.json
    temp_token = data["temp_token"]
    token = data["totp_token"]
    username = r.get(f"pending:{temp_token}")
    if not username:
        return jsonify({"error": "Session expired"}), 401
    stored_code = r.get(f"code:{temp_token}")
    if not stored_code or stored_code != token:
        return jsonify({"error": "Invalid or expired code"}), 401
    r.delete(f"pending:{temp_token}")
    r.delete(f"code:{temp_token}")
    session_token = str(uuid.uuid4())
    r.setex(f"session:{session_token}", 3600, username)
    return jsonify({"message": "Authentication successful", "session_token": session_token})


# gets the code for specific username
@app.route("/get-code/<username>", methods=["GET"])
def get_code(username):
    code = r.get(f"display:{username}")
    if not code:
        return jsonify({"code": None})
    return jsonify({"code": code})


# login for QuickMFA accessing the db for real user
@app.route("/authenticator-login", methods=["POST"])
def authenticator_login():
    data = request.json
    username = data["username"]
    password = data["password"].encode("utf-8")
    conn = get_db()
    cur = conn.cursor()
    cur.execute("SELECT password FROM users WHERE username = %s", (username,))
    user = cur.fetchone()
    cur.close()
    conn.close()
    if not user or not bcrypt.checkpw(password, user[0].encode("utf-8")):
        return jsonify({"error": "Invalid credentials"}), 401
    return jsonify({"message": "Authenticated"})


if __name__ == "__main__":
    init_db()
    app.run(debug=True)

