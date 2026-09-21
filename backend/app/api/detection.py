from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.db.database import get_db
from app.models.alert import Alert
from app.models.camera import Camera
from app.models.detection import Detection
from app.models.user import User
from app.models.watchlist import Watchlist
from app.schemas.detection import DetectionCreate, DetectionResponse
from app.api.websocket import manager


router = APIRouter(
    prefix="/api/detections",
    tags=["Detections"],
)


@router.post(
    "",
    response_model=DetectionResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_detection(
    detection_data: DetectionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # --------------------------------------------------
    # CHECK CAMERA
    # --------------------------------------------------

    camera = (
        db.query(Camera)
        .filter(Camera.id == detection_data.camera_id)
        .first()
    )

    if not camera:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Camera not found",
        )

    # --------------------------------------------------
    # CREATE DETECTION
    # --------------------------------------------------

    detected_at = (
        detection_data.detected_at
        or datetime.utcnow()
    )

    detection = Detection(
        camera_id=detection_data.camera_id,
        event_type=detection_data.event_type,
        vehicle_number=detection_data.vehicle_number,
        confidence=detection_data.confidence,
        vehicle_type=detection_data.vehicle_type,
        bounding_box=detection_data.bounding_box,
        detected_at=detected_at,
        event_metadata=detection_data.event_metadata,
    )

    db.add(detection)
    db.commit()
    db.refresh(detection)

    # --------------------------------------------------
    # WATCHLIST MATCHING
    # --------------------------------------------------

    if detection.vehicle_number:

        watchlist_entry = (
            db.query(Watchlist)
            .filter(
                Watchlist.identifier
                == detection.vehicle_number,
                Watchlist.is_active == True,
            )
            .first()
        )

        # --------------------------------------------------
        # WATCHLIST MATCH FOUND
        # --------------------------------------------------

        if watchlist_entry:

            alert = Alert(
                detection_id=detection.id,
                watchlist_id=watchlist_entry.id,
                camera_id=camera.id,
                matched_identifier=detection.vehicle_number,
                confidence=detection.confidence,
                latitude=camera.latitude,
                longitude=camera.longitude,
                severity="HIGH",
                status="ACTIVE",
                message=(
                    f"Watchlist match detected for "
                    f"{detection.vehicle_number}"
                ),
            )

            db.add(alert)
            db.commit()
            db.refresh(alert)

            # --------------------------------------------------
            # REAL-TIME WEBSOCKET ALERT
            # --------------------------------------------------

            await manager.broadcast(
                {
                    "type": "WATCHLIST_ALERT",
                    "alert": {
                        "id": alert.id,
                        "detection_id": alert.detection_id,
                        "watchlist_id": alert.watchlist_id,
                        "camera_id": alert.camera_id,
                        "matched_identifier": (
                            alert.matched_identifier
                        ),
                        "confidence": alert.confidence,
                        "latitude": alert.latitude,
                        "longitude": alert.longitude,
                        "severity": alert.severity,
                        "status": alert.status,
                        "message": alert.message,
                        "created_at": (
                            alert.created_at.isoformat()
                        ),
                    },
                }
            )

    return detection


@router.get(
    "",
    response_model=list[DetectionResponse],
)
def list_detections(
    camera_id: int | None = None,
    vehicle_number: str | None = None,
    event_type: str | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Detection)

    if camera_id:
        query = query.filter(
            Detection.camera_id == camera_id
        )

    if vehicle_number:
        query = query.filter(
            Detection.vehicle_number.ilike(
                f"%{vehicle_number}%"
            )
        )

    if event_type:
        query = query.filter(
            Detection.event_type == event_type
        )

    return (
        query
        .order_by(
            Detection.detected_at.desc()
        )
        .limit(100)
        .all()
    )


@router.get(
    "/{detection_id}",
    response_model=DetectionResponse,
)
def get_detection(
    detection_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    detection = (
        db.query(Detection)
        .filter(Detection.id == detection_id)
        .first()
    )

    if not detection:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Detection not found",
        )

    return detection