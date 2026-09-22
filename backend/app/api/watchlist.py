from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.security import get_current_user, require_admin
from app.db.database import get_db
from app.models.user import User
from app.models.watchlist import Watchlist
from app.schemas.watchlist import (
    WatchlistCreate,
    WatchlistResponse,
    WatchlistUpdate,
)


router = APIRouter(
    prefix="/api/watchlist",
    tags=["Watchlist"],
)


@router.post(
    "",
    response_model=WatchlistResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_watchlist_entry(
    watchlist_data: WatchlistCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    identifier = watchlist_data.identifier.strip()

    existing_entry = (
        db.query(Watchlist)
        .filter(
            Watchlist.identifier == identifier,
            Watchlist.is_active.is_(True),
        )
        .first()
    )

    if existing_entry:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                "Active watchlist entry already exists "
                "for this identifier"
            ),
        )

    data = watchlist_data.model_dump()
    data["identifier"] = identifier

    watchlist_entry = Watchlist(**data)

    try:
        db.add(watchlist_entry)
        db.commit()
        db.refresh(watchlist_entry)
    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create watchlist entry",
        )

    return watchlist_entry


@router.get(
    "",
    response_model=list[WatchlistResponse],
)
def list_watchlist(
    search: str | None = Query(default=None),
    category: str | None = Query(default=None),
    entity_type: str | None = Query(default=None),
    active_only: bool = Query(default=True),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Watchlist)

    if search:
        search_pattern = f"%{search.strip()}%"

        query = query.filter(
            (Watchlist.identifier.ilike(search_pattern))
            | (Watchlist.name.ilike(search_pattern))
        )

    if category:
        query = query.filter(
            Watchlist.category == category.strip()
        )

    if entity_type:
        query = query.filter(
            Watchlist.entity_type == entity_type.strip()
        )

    if active_only:
        query = query.filter(
            Watchlist.is_active.is_(True)
        )

    return (
        query
        .order_by(Watchlist.created_at.desc())
        .all()
    )


@router.get(
    "/{watchlist_id}",
    response_model=WatchlistResponse,
)
def get_watchlist_entry(
    watchlist_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    watchlist_entry = (
        db.query(Watchlist)
        .filter(Watchlist.id == watchlist_id)
        .first()
    )

    if not watchlist_entry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Watchlist entry not found",
        )

    return watchlist_entry


@router.put(
    "/{watchlist_id}",
    response_model=WatchlistResponse,
)
def update_watchlist_entry(
    watchlist_id: int,
    watchlist_data: WatchlistUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    watchlist_entry = (
        db.query(Watchlist)
        .filter(Watchlist.id == watchlist_id)
        .first()
    )

    if not watchlist_entry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Watchlist entry not found",
        )

    update_data = watchlist_data.model_dump(
        exclude_unset=True
    )

    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields provided for update",
        )

    if "identifier" in update_data:
        identifier = update_data["identifier"].strip()

        duplicate_entry = (
            db.query(Watchlist)
            .filter(
                Watchlist.identifier == identifier,
                Watchlist.is_active.is_(True),
                Watchlist.id != watchlist_entry.id,
            )
            .first()
        )

        if duplicate_entry:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=(
                    "Active watchlist entry already exists "
                    "for this identifier"
                ),
            )

        update_data["identifier"] = identifier

    for field, value in update_data.items():
        setattr(watchlist_entry, field, value)

    try:
        db.commit()
        db.refresh(watchlist_entry)
    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update watchlist entry",
        )

    return watchlist_entry


@router.patch(
    "/{watchlist_id}/disable",
    response_model=WatchlistResponse,
)
def disable_watchlist_entry(
    watchlist_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    watchlist_entry = (
        db.query(Watchlist)
        .filter(Watchlist.id == watchlist_id)
        .first()
    )

    if not watchlist_entry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Watchlist entry not found",
        )

    if not watchlist_entry.is_active:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Watchlist entry is already disabled",
        )

    watchlist_entry.is_active = False

    try:
        db.commit()
        db.refresh(watchlist_entry)
    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to disable watchlist entry",
        )

    return watchlist_entry