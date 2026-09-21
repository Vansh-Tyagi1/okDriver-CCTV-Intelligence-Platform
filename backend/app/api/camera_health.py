from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.db.database import get_db
from app.models.camera import Camera
from app.models.user import User


router = APIRouter(
    prefix="/api/camera-health",
    tags=["Camera Health"],
)


# =========================================================
# HEALTH STATUS
# =========================================================

def calculate_health_status(camera: Camera) -> str:
    """
    Calculate camera health from active state and heartbeat.

    ONLINE   -> heartbeat within last 30 seconds
    DEGRADED -> heartbeat between 30 and 90 seconds
    OFFLINE  -> heartbeat older than 90 seconds or missing
    """

    if not camera.is_active:
        return "OFFLINE"

    if not camera.last_heartbeat:
        return "OFFLINE"

    now = datetime.utcnow()
    heartbeat_age = now - camera.last_heartbeat

    if heartbeat_age <= timedelta(seconds=30):
        return "ONLINE"

    if heartbeat_age <= timedelta(seconds=90):
        return "DEGRADED"

    return "OFFLINE"


# =========================================================
# ALL CAMERA HEALTH
# =========================================================

@router.get("")
def get_camera_health(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    cameras = (
        db.query(Camera)
        .order_by(Camera.id.asc())
        .all()
    )

    result = []

    for camera in cameras:

        health_status = calculate_health_status(
            camera
        )

        result.append(
            {
                "camera_id": camera.id,
                "camera_code": camera.camera_id,
                "camera_name": camera.name,
                "department": camera.department,
                "zone": camera.zone,
                "latitude": camera.latitude,
                "longitude": camera.longitude,
                "status": health_status,
                "last_heartbeat": camera.last_heartbeat,
                "is_active": camera.is_active,
            }
        )

    return result


# =========================================================
# SINGLE CAMERA HEALTH
# =========================================================

@router.get("/{camera_id}")
def get_single_camera_health(
    camera_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    camera = (
        db.query(Camera)
        .filter(Camera.id == camera_id)
        .first()
    )

    if not camera:
        raise HTTPException(
            status_code=404,
            detail="Camera not found",
        )

    health_status = calculate_health_status(
        camera
    )

    return {
        "camera_id": camera.id,
        "camera_code": camera.camera_id,
        "camera_name": camera.name,
        "department": camera.department,
        "zone": camera.zone,
        "latitude": camera.latitude,
        "longitude": camera.longitude,
        "status": health_status,
        "last_heartbeat": camera.last_heartbeat,
        "is_active": camera.is_active,
    }


# =========================================================
# CAMERA HEARTBEAT
# =========================================================

@router.post("/{camera_id}/heartbeat")
def camera_heartbeat(
    camera_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    camera = (
        db.query(Camera)
        .filter(Camera.id == camera_id)
        .first()
    )

    if not camera:
        raise HTTPException(
            status_code=404,
            detail="Camera not found",
        )

    if not camera.is_active:
        raise HTTPException(
            status_code=400,
            detail="Camera is disabled",
        )

    now = datetime.utcnow()

    camera.last_heartbeat = now
    camera.status = "ONLINE"

    db.commit()
    db.refresh(camera)

    return {
        "success": True,
        "camera_id": camera.id,
        "camera_code": camera.camera_id,
        "status": "ONLINE",
        "last_heartbeat": camera.last_heartbeat,
        "message": "Camera heartbeat received",
    }