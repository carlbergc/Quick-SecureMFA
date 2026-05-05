import pyotp    # lib used for TOTP
import os
from cryptography.fernet import Fernet
from dotenv import load_dotenv

load_dotenv()

# Load encryption key from environment
_fernet = Fernet(os.getenv("TOTP_ENCRYPTION_KEY").encode())


def generate_totp_secret():
    """Generates a random base32 TOTP secret."""
    return pyotp.random_base32()


def encrypt_secret(secret: str) -> str:
    """Encrypts a plain text TOTP secret for storage in the database."""
    return _fernet.encrypt(secret.encode()).decode()


def decrypt_secret(encrypted_secret: str) -> str:
    """Decrypts a TOTP secret retrieved from the database."""
    return _fernet.decrypt(encrypted_secret.encode()).decode()


def verify_totp(secret: str, token: str) -> bool:
    """Verifies a TOTP token against a plain text secret (decrypt before calling this)."""
    totp = pyotp.TOTP(secret)
    return totp.verify(token, valid_window=1)