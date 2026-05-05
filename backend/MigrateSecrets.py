"""
One-time script to encrypt all existing plain text TOTP secrets in the database.
Run ONCE after updating auth.py and adding TOTP_ENCRYPTION_KEY to .env.

Usage:
    cd quick-MFA/backend
    venv\Scripts\activate
    python migrate_secrets.py
"""

import os
from db import get_db
from auth import encrypt_secret
from dotenv import load_dotenv

load_dotenv()


def migrate():
    conn = get_db()
    cur = conn.cursor()

    cur.execute("SELECT id, username, totp_secret FROM users")
    users = cur.fetchall()

    migrated = 0
    skipped = 0

    for user_id, username, secret in users:
        # Fernet-encrypted secrets always start with "gAAAAA"
        # Skip any already encrypted rows (safe to re-run)
        if secret.startswith("gAAAAA"):
            print(f"  SKIP     {username} (already encrypted)")
            skipped += 1
            continue

        encrypted = encrypt_secret(secret)
        cur.execute(
            "UPDATE users SET totp_secret = %s WHERE id = %s",
            (encrypted, user_id)
        )
        print(f"  MIGRATED {username}")
        migrated += 1

    conn.commit()
    cur.close()
    conn.close()

    print(f"\nDone. {migrated} migrated, {skipped} skipped.")


if __name__ == "__main__":
    migrate()