from datetime import datetime

from pydantic import BaseModel, Field, field_validator


class AlertResponse(BaseModel):
    id: int
    detection_id: int
    watchlist_id: int
    camera_id: int

    matched_identifier: str
    confidence: float | None

    latitude: float | None
    longitude: float | None

    severity: str
    status: str

    message: str | None

    created_at: datetime
    acknowledged_at: datetime | None
    resolved_at: datetime | None

    model_config = {
        "from_attributes": True
    }


class AlertStatusUpdate(BaseModel):
    status: str = Field(
        min_length=1,
        max_length=20,
    )

    @field_validator("status")
    @classmethod
    def validate_status(cls, value: str) -> str:
        value = value.strip()

        if not value:
            raise ValueError(
                "Status cannot be empty or whitespace"
            )

        return value