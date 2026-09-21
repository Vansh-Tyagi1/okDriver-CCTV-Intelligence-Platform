from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.security import (
    get_current_user,
    require_admin,
)
from app.db.database import get_db
from app.models.camera import Camera
from app.models.user import User
from app.schemas.camera import (
    CameraCreate,
    CameraResponse,
    CameraUpdate,
)
from app.services.audit import create_audit_log


router = APIRouter(
    prefix="/api/cameras",
    tags=["Cameras"],
)


@router.post(
    "",
    response_model=CameraResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_camera(
    camera_data: CameraCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    existing_camera = (
        db.query(Camera)
        .filter(Camera.camera_id == camera_data.camera_id)
        .first()
    )

    if existing_camera:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Camera ID already exists",
        )

    camera = Camera(
        **camera_data.model_dump()
    )

    db.add(camera)
    db.flush()

    create_audit_log(
        db=db,
        user=current_user,
        action="CAMERA_CREATED",
        resource_type="CAMERA",
        resource_id=str(camera.id),
        description=(
            f"Camera {camera.camera_id} "
            f"({camera.name}) was created."
        ),
    )

    db.commit()
    db.refresh(camera)

    return camera


@router.get(
    "",
    response_model=list[CameraResponse],
)
def list_cameras(
    search: str | None = Query(default=None),
    status_filter: str | None = Query(default=None),
    department: str | None = Query(default=None),
    zone: str | None = Query(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Camera)

    if search:
        search_pattern = f"%{search}%"

        query = query.filter(
            (Camera.camera_id.ilike(search_pattern))
            | (Camera.name.ilike(search_pattern))
        )

    if status_filter:
        query = query.filter(
            Camera.status == status_filter.upper()
        )

    if department:
        query = query.filter(
            Camera.department == department
        )

    if zone:
        query = query.filter(
            Camera.zone == zone
        )

    return (
        query
        .order_by(Camera.created_at.desc())
        .all()
    )


@router.get(
    "/{camera_id}",
    response_model=CameraResponse,
)
def get_camera(
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
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Camera not found",
        )

    return camera


@router.put(
    "/{camera_id}",
    response_model=CameraResponse,
)
def update_camera(
    camera_id: int,
    camera_data: CameraUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    camera = (
        db.query(Camera)
        .filter(Camera.id == camera_id)
        .first()
    )

    if not camera:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Camera not found",
        )

    update_data = camera_data.model_dump(
        exclude_unset=True
    )

    for field, value in update_data.items():
        setattr(camera, field, value)

    create_audit_log(
        db=db,
        user=current_user,
        action="CAMERA_UPDATED",
        resource_type="CAMERA",
        resource_id=str(camera.id),
        description=(
            f"Camera {camera.camera_id} "
            f"({camera.name}) was updated. "
            f"Changed fields: "
            f"{', '.join(update_data.keys())}."
        ),
    )

    db.commit()
    db.refresh(camera)

    return camera


@router.patch(
    "/{camera_id}/disable",
    response_model=CameraResponse,
)
def disable_camera(
    camera_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    camera = (
        db.query(Camera)
        .filter(Camera.id == camera_id)
        .first()
    )

    if not camera:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Camera not found",
        )

    camera.is_active = False
    camera.status = "OFFLINE"

    create_audit_log(
        db=db,
        user=current_user,
        action="CAMERA_DISABLED",
        resource_type="CAMERA",
        resource_id=str(camera.id),
        description=(
            f"Camera {camera.camera_id} "
            f"({camera.name}) was disabled."
        ),
    )

    db.commit()
    db.refresh(camera)

    return camera