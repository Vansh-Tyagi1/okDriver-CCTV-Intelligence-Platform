from app.core.security import hash_password
from app.db.database import SessionLocal
from app.models.user import User


def create_admin():
    db = SessionLocal()

    try:
        existing_user = (
            db.query(User)
            .filter(User.username == "admin")
            .first()
        )

        if existing_user:
            print("Admin user already exists.")
            return

        admin = User(
            username="admin",
            email="admin@okdriver.local",
            password_hash=hash_password("Admin@12345"),
            role="ADMIN",
            is_active=True,
        )

        db.add(admin)
        db.commit()

        print("Admin user created successfully.")

    finally:
        db.close()


if __name__ == "__main__":
    create_admin()