import asyncio
from contextlib import asynccontextmanager
from datetime import datetime

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from app.api.auth import router as auth_router, limiter
from app.api.cameras import router as cameras_router
from app.api.detection import router as detection_router
from app.api.watchlist import router as watchlist_router
from app.api.alert import router as alert_router
from app.api.websocket import router as websocket_router
from app.api.vehicle import router as vehicle_router
from app.api.camera_health import router as camera_health_router
from app.api.audit import router as audit_router

from app.db.database import Base, SessionLocal, engine
import app.db.base

from app.models.camera import Camera


async def simulator_heartbeat_loop():
    """
    Send automatic heartbeat updates for active simulator cameras.

    Simulator cameras receive a heartbeat every 10 seconds.
    Disabled cameras are never updated.
    """

    while True:
        db = SessionLocal()

        try:
            cameras = (
                db.query(Camera)
                .filter(
                    Camera.is_active == True,
                    Camera.source_protocol == "SIMULATOR",
                )
                .all()
            )

            now = datetime.utcnow()

            for camera in cameras:
                camera.last_heartbeat = now
                camera.status = "ONLINE"

            if cameras:
                db.commit()

        except Exception as error:
            db.rollback()
            print(
                f"[Heartbeat Simulator] Error: {error}"
            )

        finally:
            db.close()

        await asyncio.sleep(10)


@asynccontextmanager
async def lifespan(app: FastAPI):

    # Initialize database tables for a fresh environment.
    Base.metadata.create_all(bind=engine)

    print(
        "[Database] Tables initialized"
    )

    heartbeat_task = asyncio.create_task(
        simulator_heartbeat_loop()
    )

    print(
        "[Heartbeat Simulator] Started"
    )

    try:
        yield
    finally:
        heartbeat_task.cancel()

        try:
            await heartbeat_task
        except asyncio.CancelledError:
            pass

        print(
            "[Heartbeat Simulator] Stopped"
        )


app = FastAPI(
    title="okDriver CCTV Intelligence Platform",
    version="1.0.0",
    lifespan=lifespan,
)


# =========================================================
# RATE LIMITING
# =========================================================

app.state.limiter = limiter

app.add_exception_handler(
    RateLimitExceeded,
    _rate_limit_exceeded_handler,
)


# =========================================================
# CORS
# =========================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================================================
# API ROUTERS
# =========================================================

app.include_router(auth_router)
app.include_router(cameras_router)
app.include_router(detection_router)
app.include_router(watchlist_router)
app.include_router(alert_router)
app.include_router(websocket_router)
app.include_router(vehicle_router)
app.include_router(camera_health_router)
app.include_router(audit_router)


# =========================================================
# HEALTH CHECK
# =========================================================

@app.get("/api/health")
def health_check():
    return {
        "status": "ok",
        "service": "okDriver CCTV Platform",
    }