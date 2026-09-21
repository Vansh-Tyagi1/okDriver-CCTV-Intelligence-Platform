from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field, field_validator


class CameraBase(BaseModel):
    camera_id: str = Field(
        min_length=1,
        max_length=50,
    )

    name: str = Field(
        min_length=1,
        max_length=150,
    )

    department: str | None = Field(
        default=None,
        max_length=100,
    )

    latitude: float = Field(
        ge=-90,
        le=90,
    )

    longitude: float = Field(
        ge=-180,
        le=180,
    )

    camera_type: str = Field(
        min_length=1,
        max_length=50,
    )

    source_protocol: str = Field(
        min_length=1,
        max_length=50,
    )

    stream_endpoint: str | None = Field(
        default=None,
        max_length=2048,
    )

    status: Literal[
        "ONLINE",
        "OFFLINE",
        "DEGRADED",
    ] = "OFFLINE"

    zone: str | None = Field(
        default=None,
        max_length=100,
    )

    storage_metadata: str | None = Field(
        default=None,
        max_length=5000,
    )

    @field_validator(
        "camera_id",
        "name",
        "camera_type",
        "source_protocol",
    )
    @classmethod
    def validate_required_strings(cls, value: str) -> str:
        value = value.strip()

        if not value:
            raise ValueError(
                "Value cannot be empty or whitespace"
            )

        return value


class CameraCreate(CameraBase):
    pass


class CameraUpdate(BaseModel):
    name: str | None = Field(
        default=None,
        min_length=1,
        max_length=150,
    )

    department: str | None = Field(
        default=None,
        max_length=100,
    )

    latitude: float | None = Field(
        default=None,
        ge=-90,
        le=90,
    )

    longitude: float | None = Field(
        default=None,
        ge=-180,
        le=180,
    )

    camera_type: str | None = Field(
        default=None,
        min_length=1,
        max_length=50,
    )

    source_protocol: str | None = Field(
        default=None,
        min_length=1,
        max_length=50,
    )

    stream_endpoint: str | None = Field(
        default=None,
        max_length=2048,
    )

    status: Literal[
        "ONLINE",
        "OFFLINE",
        "DEGRADED",
    ] | None = None

    zone: str | None = Field(
        default=None,
        max_length=100,
    )

    storage_metadata: str | None = Field(
        default=None,
        max_length=5000,
    )

    is_active: bool | None = None

    @field_validator(
        "name",
        "camera_type",
        "source_protocol",
    )
    @classmethod
    def validate_optional_strings(
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


class CameraResponse(CameraBase):
    id: int
    last_heartbeat: datetime | None
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = {
        "from_attributes": True
    }