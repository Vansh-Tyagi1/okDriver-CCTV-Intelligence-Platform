from app.core.security import hash_password
from app.db.database import SessionLocal
from app.models.user import User


def reset_admin():
    db = SessionLocal()

    try:
        admin = (
            db.query(User)
            .filter(User.username == "admin")
            .first()
        )

        if not admin:
            print("Admin user not found.")
            return

        admin.password_hash = hash_password("Admin@12345")
        admin.role = "ADMIN"
        admin.is_active = True

        db.commit()

        print("Admin password reset successfully.")

    finally:
        db.close()


if __name__ == "__main__":
    reset_admin()