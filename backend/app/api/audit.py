from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.db.database import get_db
from app.models.audit_log import AuditLog
from app.models.user import User


router = APIRouter(
    prefix="/api/audit-logs",
    tags=["Audit Logs"],
)


def serialize_audit_log(log: AuditLog) -> dict:
    return {
        "id": log.id,
        "user_id": log.user_id,
        "action": log.action,
        "resource_type": log.resource_type,
        "resource_id": log.resource_id,
        "description": log.description,
        "ip_address": log.ip_address,
        "created_at": log.created_at,
    }


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
        normalized_action = action.strip().upper()

        if normalized_action:
            query = query.filter(
                AuditLog.action == normalized_action
            )

    if resource_type:
        normalized_resource_type = resource_type.strip().upper()

        if normalized_resource_type:
            query = query.filter(
                AuditLog.resource_type == normalized_resource_type
            )

    if resource_id:
        normalized_resource_id = resource_id.strip()

        if normalized_resource_id:
            query = query.filter(
                AuditLog.resource_id == normalized_resource_id
            )

    if user_id is not None:
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
        serialize_audit_log(log)
        for log in audit_logs
    ]


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
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Audit log not found",
        )

    return serialize_audit_log(audit_log)