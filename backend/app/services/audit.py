from sqlalchemy.orm import Session

from app.models.audit_log import AuditLog
from app.models.user import User


def create_audit_log(
    db: Session,
    user: User | None,
    action: str,
    resource_type: str | None = None,
    resource_id: str | None = None,
    description: str | None = None,
    ip_address: str | None = None,
):
    normalized_action = action.strip().upper()

    if not normalized_action:
        raise ValueError("Audit action cannot be empty")

    normalized_resource_type = (
        resource_type.strip().upper()
        if resource_type
        else None
    )

    normalized_resource_id = (
        resource_id.strip()
        if resource_id
        else None
    )

    normalized_description = (
        description.strip()
        if description
        else None
    )

    normalized_ip_address = (
        ip_address.strip()
        if ip_address
        else None
    )

    audit_log = AuditLog(
        user_id=user.id if user else None,
        action=normalized_action,
        resource_type=normalized_resource_type,
        resource_id=normalized_resource_id,
        description=normalized_description,
        ip_address=normalized_ip_address,
    )

    db.add(audit_log)
    db.flush()

    return audit_log