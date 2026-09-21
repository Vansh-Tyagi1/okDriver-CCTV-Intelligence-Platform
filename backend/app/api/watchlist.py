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
    existing_entry = (
        db.query(Watchlist)
        .filter(
            Watchlist.identifier == watchlist_data.identifier,
            Watchlist.is_active == True,
        )
        .first()
    )

    if existing_entry:
        raise HTTPException(
            status_code=409,
            detail="Active watchlist entry already exists for this identifier",
        )

    watchlist_entry = Watchlist(
        **watchlist_data.model_dump()
    )

    db.add(watchlist_entry)
    db.commit()
    db.refresh(watchlist_entry)

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
        search_pattern = f"%{search}%"

        query = query.filter(
            (Watchlist.identifier.ilike(search_pattern))
            | (Watchlist.name.ilike(search_pattern))
        )

    if category:
        query = query.filter(
            Watchlist.category == category
        )

    if entity_type:
        query = query.filter(
            Watchlist.entity_type == entity_type
        )

    if active_only:
        query = query.filter(
            Watchlist.is_active == True
        )

    return query.order_by(
        Watchlist.created_at.desc()
    ).all()


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
            status_code=404,
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
            status_code=404,
            detail="Watchlist entry not found",
        )

    update_data = watchlist_data.model_dump(
        exclude_unset=True
    )

    for field, value in update_data.items():
        setattr(watchlist_entry, field, value)

    db.commit()
    db.refresh(watchlist_entry)

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
            status_code=404,
            detail="Watchlist entry not found",
        )

    watchlist_entry.is_active = False

    db.commit()
    db.refresh(watchlist_entry)

    return watchlist_entry