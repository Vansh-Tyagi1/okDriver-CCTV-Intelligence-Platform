from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.db.database import get_db
from app.models.alert import Alert
from app.models.user import User
from app.schemas.alert import AlertResponse, AlertStatusUpdate
from app.services.audit import create_audit_log


router = APIRouter(
    prefix="/api/alerts",
    tags=["Alerts"],
)


ALLOWED_ALERT_STATUSES = {
    "ACTIVE",
    "ACKNOWLEDGED",
    "RESOLVED",
}


@router.get(
    "",
    response_model=list[AlertResponse],
)
def list_alerts(
    alert_status: str | None = Query(
        default=None,
        alias="status",
    ),
    severity: str | None = None,
    camera_id: int | None = None,
    matched_identifier: str | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Alert)

    if alert_status:
        query = query.filter(
            Alert.status == alert_status.strip().upper()
        )

    if severity:
        query = query.filter(
            Alert.severity == severity.strip().upper()
        )

    if camera_id is not None:
        query = query.filter(
            Alert.camera_id == camera_id
        )

    if matched_identifier:
        query = query.filter(
            Alert.matched_identifier.ilike(
                f"%{matched_identifier.strip()}%"
            )
        )

    return (
        query
        .order_by(Alert.created_at.desc())
        .limit(100)
        .all()
    )


@router.get(
    "/{alert_id}",
    response_model=AlertResponse,
)
def get_alert(
    alert_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    alert = (
        db.query(Alert)
        .filter(Alert.id == alert_id)
        .first()
    )

    if not alert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Alert not found",
        )

    return alert


@router.patch(
    "/{alert_id}/acknowledge",
    response_model=AlertResponse,
)
def acknowledge_alert(
    alert_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    alert = (
        db.query(Alert)
        .filter(Alert.id == alert_id)
        .first()
    )

    if not alert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Alert not found",
        )

    if alert.status == "RESOLVED":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Resolved alert cannot be acknowledged",
        )

    if alert.status == "ACKNOWLEDGED":
        return alert

    alert.status = "ACKNOWLEDGED"

    if alert.acknowledged_at is None:
        alert.acknowledged_at = datetime.utcnow()

    try:
        create_audit_log(
            db=db,
            user=current_user,
            action="ALERT_ACKNOWLEDGED",
            resource_type="ALERT",
            resource_id=str(alert.id),
            description=f"Alert {alert.id} acknowledged",
        )

        db.commit()
        db.refresh(alert)

    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to acknowledge alert",
        )

    return alert


@router.patch(
    "/{alert_id}/resolve",
    response_model=AlertResponse,
)
def resolve_alert(
    alert_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    alert = (
        db.query(Alert)
        .filter(Alert.id == alert_id)
        .first()
    )

    if not alert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Alert not found",
        )

    if alert.status == "RESOLVED":
        return alert

    now = datetime.utcnow()

    alert.status = "RESOLVED"

    if alert.acknowledged_at is None:
        alert.acknowledged_at = now

    alert.resolved_at = now

    try:
        create_audit_log(
            db=db,
            user=current_user,
            action="ALERT_RESOLVED",
            resource_type="ALERT",
            resource_id=str(alert.id),
            description=f"Alert {alert.id} resolved",
        )

        db.commit()
        db.refresh(alert)

    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to resolve alert",
        )

    return alert


@router.patch(
    "/{alert_id}/status",
    response_model=AlertResponse,
)
def update_alert_status(
    alert_id: int,
    status_data: AlertStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    alert = (
        db.query(Alert)
        .filter(Alert.id == alert_id)
        .first()
    )

    if not alert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Alert not found",
        )

    new_status = status_data.status.strip().upper()

    if new_status not in ALLOWED_ALERT_STATUSES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Invalid status. Allowed values: "
                "ACTIVE, ACKNOWLEDGED, RESOLVED"
            ),
        )

    old_status = alert.status

    if old_status == new_status:
        return alert

    now = datetime.utcnow()

    if old_status == "RESOLVED" and new_status != "RESOLVED":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Resolved alerts cannot be reopened",
        )

    alert.status = new_status

    if new_status == "ACKNOWLEDGED":
        if alert.acknowledged_at is None:
            alert.acknowledged_at = now

    elif new_status == "RESOLVED":
        if alert.acknowledged_at is None:
            alert.acknowledged_at = now

        if alert.resolved_at is None:
            alert.resolved_at = now

    try:
        create_audit_log(
            db=db,
            user=current_user,
            action="ALERT_STATUS_UPDATED",
            resource_type="ALERT",
            resource_id=str(alert.id),
            description=(
                f"Alert {alert.id} status changed "
                f"from {old_status} to {new_status}"
            ),
        )

        db.commit()
        db.refresh(alert)

    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update alert status",
        )

    return alert