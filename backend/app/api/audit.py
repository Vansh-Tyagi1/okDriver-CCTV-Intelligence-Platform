from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.db.database import get_db
from app.models.audit_log import AuditLog
from app.models.user import User


router = APIRouter(
    prefix="/api/audit-logs",
    tags=["Audit Logs"],
)


# =========================================================
# LIST AUDIT LOGS
# =========================================================

@router.get("")
def list_audit_logs(
    action: str | None = Query(default=None),
    resource_type: str | None = Query(default=None),
    resource_id: str | None = Query(default=None),
    user_id: int | None = Query(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(AuditLog)

    if action:
        query = query.filter(
            AuditLog.action == action.upper()
        )

    if resource_type:
        query = query.filter(
            AuditLog.resource_type == resource_type.upper()
        )

    if resource_id:
        query = query.filter(
            AuditLog.resource_id == resource_id
        )

    if user_id:
        query = query.filter(
            AuditLog.user_id == user_id
        )

    audit_logs = (
        query
        .order_by(AuditLog.created_at.desc())
        .limit(200)
        .all()
    )

    return [
        {
            "id": log.id,
            "user_id": log.user_id,
            "action": log.action,
            "resource_type": log.resource_type,
            "resource_id": log.resource_id,
            "description": log.description,
            "ip_address": log.ip_address,
            "created_at": log.created_at,
        }
        for log in audit_logs
    ]


# =========================================================
# GET SINGLE AUDIT LOG
# =========================================================

@router.get("/{audit_log_id}")
def get_audit_log(
    audit_log_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    audit_log = (
        db.query(AuditLog)
        .filter(AuditLog.id == audit_log_id)
        .first()
    )

    if not audit_log:
        from fastapi import HTTPException, status

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Audit log not found",
        )

    return {
        "id": audit_log.id,
        "user_id": audit_log.user_id,
        "action": audit_log.action,
        "resource_type": audit_log.resource_type,
        "resource_id": audit_log.resource_id,
        "description": audit_log.description,
        "ip_address": audit_log.ip_address,
        "created_at": audit_log.created_at,
    }