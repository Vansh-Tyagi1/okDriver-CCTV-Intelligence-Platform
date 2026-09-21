from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.db.database import get_db
from app.models.camera import Camera
from app.models.detection import Detection
from app.models.user import User


router = APIRouter(
    prefix="/api/vehicles",
    tags=["Vehicle Search"],
)


@router.get("/{vehicle_number}")
def get_vehicle_history(
    vehicle_number: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    detections = (
        db.query(Detection, Camera)
        .join(
            Camera,
            Camera.id == Detection.camera_id,
        )
        .filter(
            Detection.vehicle_number.ilike(
                vehicle_number
            )
        )
        .order_by(
            Detection.detected_at.asc()
        )
        .all()
    )

    if not detections:
        raise HTTPException(
            status_code=404,
            detail="No vehicle history found",
        )

    history = []

    for detection, camera in detections:
        history.append(
            {
                "detection_id": detection.id,
                "camera_id": camera.id,
                "camera_code": camera.camera_id,
                "camera_name": camera.name,
                "latitude": camera.latitude,
                "longitude": camera.longitude,
                "zone": camera.zone,
                "event_type": detection.event_type,
                "vehicle_number": detection.vehicle_number,
                "vehicle_type": detection.vehicle_type,
                "confidence": detection.confidence,
                "detected_at": detection.detected_at,
            }
        )

    return {
        "vehicle_number": vehicle_number,
        "total_detections": len(history),
        "history": history,
    }