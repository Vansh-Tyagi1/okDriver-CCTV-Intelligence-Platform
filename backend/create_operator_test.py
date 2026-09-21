from app.core.security import hash_password
from app.db.database import SessionLocal
from app.models.user import User


db = SessionLocal()

try:
    existing_user = (
        db.query(User)
        .filter(User.username == "operator_test")
        .first()
    )

    if existing_user:
        print("operator_test user already exists.")
    else:
        operator = User(
            username="operator_test",
            email="operator_test@okdriver.local",
            password_hash=hash_password("Operator@12345"),
            role="OPERATOR",
            is_active=True,
        )

        db.add(operator)
        db.commit()
        db.refresh(operator)

        print(
            f"Operator user created successfully. "
            f"ID: {operator.id}"
        )

finally:
    db.close()