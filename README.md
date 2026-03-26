# Quick-SecureMFA
This is a project I made to work on my security hardening skills along with attempting to make a fast multifactor authenticator login process

# My project has 3 endpoints: Frontend, Backend, and Mobile Authenticator. #
Frontend - localhost:5173 - this is the web interaction
Backend - localhost:5000 - handler for connecting logic and SQL db
Authenticator app - localhost:8080 - simulates mobile authenticator for testing

The process when logging in is: 
User enters login info -> The backend checks the PostgreSQL -> 
Redis stores temporary session -> User generates verification code with button ->
Authenticator app waits for request and displays code ->
User types code -> Backend verifies code -> Access granted

Now, this is only the service of an authenticator app and website login. The main point of this project is to use secure methods to prevent the data from being accessed easily. So I have some goals to learn: 
- Ensure the code generated cannot be accessed through inspect element looking at the plaintext
- Ensure connection is HTTPS to securely hide info
- Prevent brute force attacks by lowering login attempts for a specific user
