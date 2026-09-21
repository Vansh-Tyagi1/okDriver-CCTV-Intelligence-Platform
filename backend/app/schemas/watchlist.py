from datetime import datetime

from pydantic import BaseModel, Field


class WatchlistCreate(BaseModel):
    entity_type: str = Field(
        min_length=1,
        max_length=50,
    )

    identifier: str = Field(
        min_length=1,
        max_length=100,
    )

    name: str | None = Field(
        default=None,
        max_length=150,
    )

    category: str = Field(
        min_length=1,
        max_length=50,
    )

    description: str | None = None


class WatchlistUpdate(BaseModel):
    entity_type: str | None = Field(
        default=None,
        min_length=1,
        max_length=50,
    )

    identifier: str | None = Field(
        default=None,
        min_length=1,
        max_length=100,
    )

    name: str | None = Field(
        default=None,
        max_length=150,
    )

    category: str | None = Field(
        default=None,
        min_length=1,
        max_length=50,
    )

    description: str | None = None

    is_active: bool | None = None


class WatchlistResponse(BaseModel):
    id: int
    entity_type: str
    identifier: str
    name: str | None
    category: str
    description: str | None
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = {
        "from_attributes": True
    }