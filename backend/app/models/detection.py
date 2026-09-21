from datetime import datetime

from sqlalchemy import DateTime, Float, ForeignKey, Index, JSON, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.database import Base


class Detection(Base):
    __tablename__ = "detections"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True,
    )

    camera_id: Mapped[int] = mapped_column(
        ForeignKey("cameras.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    event_type: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        index=True,
    )

    vehicle_number: Mapped[str | None] = mapped_column(
        String(30),
        nullable=True,
        index=True,
    )

    confidence: Mapped[float | None] = mapped_column(
        Float,
        nullable=True,
    )

    vehicle_type: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True,
    )

    bounding_box: Mapped[dict | None] = mapped_column(
        JSON,
        nullable=True,
    )

    detected_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
        index=True,
    )

    event_metadata: Mapped[dict | None] = mapped_column(
    JSON,
    nullable=True,
)

    __table_args__ = (
        Index(
            "ix_detections_camera_detected_at",
            "camera_id",
            "detected_at",
        ),
        Index(
            "ix_detections_vehicle_detected_at",
            "vehicle_number",
            "detected_at",
        ),
    )