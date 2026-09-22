from datetime import datetime

from pydantic import BaseModel, Field, field_validator


class DetectionCreate(BaseModel):
    camera_id: int = Field(gt=0)

    event_type: str = Field(
        min_length=1,
        max_length=50,
    )

    vehicle_number: str | None = Field(
        default=None,
        max_length=30,
    )

    confidence: float | None = Field(
        default=None,
        ge=0,
        le=1,
    )

    vehicle_type: str | None = Field(
        default=None,
        max_length=50,
    )

    bounding_box: dict | None = None

    detected_at: datetime | None = None

    event_metadata: dict | None = None

    @field_validator(
        "event_type",
        "vehicle_number",
        "vehicle_type",
    )
    @classmethod
    def validate_strings(
        cls,
        value: str | None,
    ) -> str | None:
        if value is None:
            return None

        value = value.strip()

        if not value:
            raise ValueError(
                "Value cannot be empty or whitespace"
            )

        return value


class DetectionResponse(BaseModel):
    id: int
    camera_id: int
    event_type: str
    vehicle_number: str | None
    confidence: float | None
    vehicle_type: str | None
    bounding_box: dict | None
    detected_at: datetime
    event_metadata: dict | None

    model_config = {
        "from_attributes": True
    }