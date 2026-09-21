from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.db.database import get_db
from app.models.alert import Alert
from app.models.camera import Camera
from app.models.user import User
from app.schemas.alert import AlertResponse, AlertStatusUpdate
from app.services.audit import create_audit_log


router = APIRouter(
    prefix="/api/alerts",
    tags=["Alerts"],
)


# =========================================================
# LIST ALERTS
# =========================================================

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
            Alert.status == alert_status.upper()
        )

    if severity:
        query = query.filter(
            Alert.severity == severity.upper()
        )

    if camera_id:
        query = query.filter(
            Alert.camera_id == camera_id
        )

    if matched_identifier:
        query = query.filter(
            Alert.matched_identifier.ilike(
                f"%{matched_identifier}%"
            )
        )

    return (
        query
        .order_by(Alert.created_at.desc())
        .limit(100)
        .all()
    )


# =========================================================
# GET SINGLE ALERT
# =========================================================

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


# =========================================================
# ACKNOWLEDGE ALERT
# =========================================================

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

    alert.status = "ACKNOWLEDGED"

    if alert.acknowledged_at is None:
        alert.acknowledged_at = datetime.utcnow()

    # Audit log
    create_audit_log(
        db=db,
        user=current_user,
        action="ALERT_ACKNOWLEDGED",
        resource_type="ALERT",
        resource_id=str(alert.id),
        description=(
            f"Alert {alert.id} acknowledged"
        ),
    )

    db.commit()
    db.refresh(alert)

    return alert


# =========================================================
# RESOLVE ALERT
# =========================================================

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

    alert.status = "RESOLVED"

    if alert.acknowledged_at is None:
        alert.acknowledged_at = datetime.utcnow()

    alert.resolved_at = datetime.utcnow()

    # Audit log
    create_audit_log(
        db=db,
        user=current_user,
        action="ALERT_RESOLVED",
        resource_type="ALERT",
        resource_id=str(alert.id),
        description=(
            f"Alert {alert.id} resolved"
        ),
    )

    db.commit()
    db.refresh(alert)

    return alert


# =========================================================
# UPDATE ALERT STATUS
# =========================================================

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

    new_status = status_data.status.upper()

    allowed_statuses = {
        "ACTIVE",
        "ACKNOWLEDGED",
        "RESOLVED",
    }

    if new_status not in allowed_statuses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Invalid status. "
                "Allowed values: ACTIVE, "
                "ACKNOWLEDGED, RESOLVED"
            ),
        )

    old_status = alert.status

    alert.status = new_status

    if new_status == "ACKNOWLEDGED":
        if alert.acknowledged_at is None:
            alert.acknowledged_at = datetime.utcnow()

    if new_status == "RESOLVED":
        if alert.acknowledged_at is None:
            alert.acknowledged_at = datetime.utcnow()

        alert.resolved_at = datetime.utcnow()

    # Audit log
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

    return alert