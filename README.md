# Quick-SecureMFA
A personal project built to develop hands-on security hardening skills while building a fast, functional multi-factor authentication system from scratch.
It's a full-stack MFA system built with React, Flask, PostgreSQL, and Redis — including a separate web-based authenticator app that simulates a mobile authenticator for local testing.

## This project has 3 endpoints: Frontend, Backend, and Mobile Authenticator.
**Frontend** - localhost:5173 -> Web interaction layer  
**Backend** - localhost:5000 -> Handles connection logic and SQL database  
**Authenticator App** - localhost:8080 -> Simulates mobile authentication for testing

## Login Flow
1. User enters username & password on the frontend
2. Backend verifies against bcrypt hash in PostgreSQL
3. Redis stores a temporary session token (expires within 120 seconds)
4. User clicks "Send Code to App" to generate a code
5. Backend generates a TOTP code -> stores in Redis
6. Authenticator app polls every 2 seconds and displays the code
7. User types the code into the frontend
8. Backend verifies the code -> creates a session token (expires in 1 hour)
9. Login is verified

## Tools Used
| Layer         | Technology                                    |
|---------------|-----------------------------------------------|
| Frontend      | React (Vite)                                  |
| Backend       | Python (Flask)                                |
| Authenticator | AppExpo (React Native Web)                    |
| Database      | PostgreSQL (pgAdmin4) / SessionsRedis (Docker)|

## Installation
Terminal 1 - Backend:  
python app.py

Terminal 2 - Frontend:  
npm run dev

Terminal 3 - Authenticator App:  
npx expo start

### This is only the service of an authenticator app and website login. The main goal of this project  
### is to use secure methods to prevent the data from being accessed easily. 
So I have some goals to learn: 
- Ensure the code generated cannot be accessed through inspect element looking at the plaintext
- Ensure connection is HTTPS to securely hide info
- Prevent brute force attacks by lowering login attempts for a specific user

## Security Progress

**Completed:**
- Passwords protected — bcrypt hashing
- TOTP secrets encrypted at rest — Fernet encryption in PostgreSQL
- Session expiry — Redis TTL (120s temp, 1hr session)

**Planned:**
- Rate limiting — Flask-Limiter
- Account lockout — Redis failed attempt counter
- Logout / session revocation — Redis key deletion route
- Input validation — Server-side sanitization
- HTTPS — SSL cert + domain (production only)
- CSRF protection — Flask-WTF tokens

## API Routes
| Method | Route | Description |
|--------|--------|------------|
| POST | `/register` | Register a new user |
| POST | `/login` | Verify password, returns temporary token |
| POST | `/generate-code` | Generate and store a TOTP code |
| POST | `/verify-totp` | Verify entered code, returns session token |
| GET | `/get-code/<username>` | Authenticator app polls for display code |
| POST | `/authenticator-login` | Login for the authenticator app |
| POST | `/save-token` | Save Expo push token for a user |
