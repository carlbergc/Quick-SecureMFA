# Quick-SecureMFA
A personal project built to develop hands-on security hardening skills while building a fast, functional multi-factor authentication system from scratch.
It's a full-stack MFA system built with React, Flask, PostgreSQL, and Redis — including a separate web-based authenticator app that simulates a mobile authenticator for local testing.

My project has 3 endpoints: Frontend, Backend, and Mobile Authenticator.

Frontend - localhost:5173 - this is the web interaction
Backend - localhost:5000 - handler for connecting logic and SQL db
Authenticator app - localhost:8080 - simulates mobile authenticator for testing

## Login Flow ##
1. User enters username & password on the frontend
2. Backend verifies against bcrypt hash in PostgreSQL
3. Redis stores a temporary session token (expires within 120 seconds)
4. User clicks "Send Code to App" to generate a code
5. Backend generates a TOTP code -> stores in Redis
6. Authenticator app polls every 2 seconds and displays the code
7. User types the code into the frontend
8. Backend verifies the code -> creates a session token (expires in 1 hour)
9. Login is verified

## Tools Used ##
Layer           |   Technology
FrontendReact   |   Vite
BackendPython   |   Flask
Authenticator   |   AppExpo (React Native Web)
Database        |   PostgreSQL (pgAdmin4) / SessionsRedis (Docker)

Now, this is only the service of an authenticator app and website login. The main point of this project is to use secure methods to prevent the data from being accessed easily. So I have some goals to learn: 
- Ensure the code generated cannot be accessed through inspect element looking at the plaintext
- Ensure connection is HTTPS to securely hide info
- Prevent brute force attacks by lowering login attempts for a specific user
