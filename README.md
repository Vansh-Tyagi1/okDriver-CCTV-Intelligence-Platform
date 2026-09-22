# okDriver CCTV Intelligence Platform

A full-stack prototype for centralized CCTV monitoring,
vehicle/ANPR-style analytics, watchlist correlation, real-time alerting,
GIS visualization, camera health monitoring, vehicle movement tracking,
and auditable security operations.

> **Prototype Status:** Operational locally with FastAPI, PostgreSQL,
> React/Vite, simulated camera sources, simulated detection events,
> WebSocket alerts, Leaflet GIS, JWT authentication, RBAC, audit
> logging, and camera health monitoring.

------------------------------------------------------------------------

## 1. Project Overview

The platform demonstrates an end-to-end CCTV intelligence workflow from
camera onboarding to detection processing, watchlist correlation,
real-time alerting, investigation, and auditability.

### End-to-End Workflow

1.  **Camera Onboarding** --- Administrators onboard camera sources
    through the central camera registry.
2.  **Camera Registry & GIS** --- Camera metadata is maintained
    centrally and visualized on the GIS map.
3.  **Live Monitoring** --- Simulated camera sources provide
    representative monitoring feeds.
4.  **Detection Ingestion** --- Analytics events are submitted through
    the detection API.
5.  **Event Persistence** --- Detection events are validated and
    persisted in PostgreSQL.
6.  **Watchlist Correlation** --- Detected identifiers are checked
    against active watchlist records.
7.  **Alert Generation** --- A matching watchlist record automatically
    creates a security alert.
8.  **Real-Time Delivery** --- Alerts are pushed to connected operators
    through WebSocket.
9.  **Alert Management** --- Operators can acknowledge or resolve
    alerts.
10. **Vehicle Intelligence** --- Vehicles/entities can be searched and
    their movement history reviewed.
11. **Camera Health** --- Camera heartbeat and health status are
    continuously evaluated.
12. **Auditability** --- Important operational actions are recorded in
    audit logs.

### Core Flow

``` text
Camera Sources
      ↓
Camera Registry + GIS
      ↓
Monitoring / Detection Events
      ↓
Detection API
      ↓
PostgreSQL
      ↓
Watchlist Matching
      ↓
Alert Generation
      ↓
WebSocket
      ↓
Operator Dashboard
      ↓
Acknowledge / Resolve
      ↓
Audit Logs
```

------------------------------------------------------------------------

## 2. Main Features

### Camera Registry

Centralized camera onboarding and lifecycle management.

-   Add, edit, and disable cameras
-   Search and filtering
-   Department and zone metadata
-   Latitude/longitude support
-   Source protocol and stream endpoint reference
-   Camera status and last heartbeat
-   Storage metadata
-   Auditable camera operations

### Live / Near-Live Monitoring

-   Multiple logical camera sources
-   Simulated camera scenes for development and demonstration
-   Camera status indicators
-   Centralized monitoring interface
-   Architecture prepared for RTSP, ONVIF, and vendor-specific adapters
-   Persistent event history

### Video Analytics / Detection

-   Detection event API
-   ANPR / vehicle-style detection events
-   Vehicle identifier
-   Confidence score
-   Vehicle type
-   Bounding box
-   Event type and timestamp
-   JSON event metadata
-   PostgreSQL persistence

### Watchlist

-   Add, edit, and disable watchlist records
-   Search and filtering
-   Entity type
-   Identifier
-   Category
-   Description
-   Synthetic records for testing
-   Automatic correlation with detection events

### Real-Time Alerting

-   Automatic watchlist correlation
-   Active alert creation
-   Severity and status management
-   Alert acknowledgement
-   Alert resolution
-   WebSocket alert delivery
-   Persistent alert history

### GIS & Vehicle Intelligence

-   Leaflet-based camera map
-   Camera status visualization
-   Alert-aware markers
-   Vehicle/entity search
-   Chronological movement history
-   Cross-camera route visualization

### Camera Health

-   Heartbeat processing
-   `ONLINE`, `DEGRADED`, and `OFFLINE` states
-   Automatic simulator heartbeat
-   Dashboard health refresh

### Security

-   JWT authentication
-   Role-based authorization
-   Admin protection for privileged operations
-   Password hashing
-   Input validation
-   Environment-based secrets
-   Audit logging
-   API rate limiting
-   CORS configuration

------------------------------------------------------------------------

## 3. Technology Stack

  -----------------------------------------------------------------------
  Layer                   Technology              Purpose
  ----------------------- ----------------------- -----------------------
  Frontend                React + Vite            Operations dashboard
                                                  and monitoring UI

  Backend                 FastAPI + Python        REST APIs,
                                                  authentication,
                                                  analytics and alert
                                                  workflows

  Database                PostgreSQL              Persistent operational
                                                  data storage

  ORM                     SQLAlchemy              Database models and
                                                  query layer

  Authentication          JWT                     Secure API
                                                  authentication and
                                                  session handling

  Authorization           RBAC                    Role-based access
                                                  control

  Real-time               WebSocket               Real-time alerts and
                                                  event updates

  GIS                     Leaflet                 Camera locations and
                                                  vehicle movement
                                                  visualization

  API Documentation       FastAPI OpenAPI /       Interactive API
                          Swagger                 documentation

  Video Prototype         Simulated Camera        Representative camera
                          Sources                 feeds

  Containerization        Docker + Docker Compose Containerized
                                                  deployment architecture

  Rate Limiting           SlowAPI                 API abuse protection

  Future Messaging        Redis / Kafka /         Scalable event/message
                          RabbitMQ-compatible     processing
                          architecture
  -----------------------------------------------------------------------

### Core Stack

``` text
React + Vite
      ↓
FastAPI + Python
      ↓
SQLAlchemy
      ↓
PostgreSQL
```

------------------------------------------------------------------------

## 4. Project Structure

``` text
okDrivers/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── alert.py
│   │   │   ├── audit.py
│   │   │   ├── auth.py
│   │   │   ├── camera_health.py
│   │   │   ├── cameras.py
│   │   │   ├── detection.py
│   │   │   ├── vehicle.py
│   │   │   ├── watchlist.py
│   │   │   └── websocket.py
│   │   ├── core/security.py
│   │   ├── db/
│   │   │   ├── base.py
│   │   │   └── database.py
│   │   ├── models/
│   │   │   ├── alert.py
│   │   │   ├── audit_log.py
│   │   │   ├── camera.py
│   │   │   ├── detection.py
│   │   │   ├── user.py
│   │   │   └── watchlist.py
│   │   └── main.py
│   ├── .dockerignore
│   ├── .env.example
│   ├── Dockerfile
│   ├── requirements.txt
│   └── admin.py
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── App.jsx
│   │   └── App.css
│   ├── Dockerfile
│   ├── package.json
│   └── vite.config.js
├── docker-compose.yml
├── README.md
├── SCALABILITY.md
└── .gitignore
```

> **Security note:** `backend/.env` is intentionally excluded from
> source control. Use `backend/.env.example` as the configuration
> template.

------------------------------------------------------------------------

## 5. Prerequisites

### Local Development

-   Python 3.12+
-   Node.js 22+
-   npm
-   PostgreSQL 18+
-   Git

### Container Deployment

-   Docker Desktop / Docker Engine
-   Docker Compose

------------------------------------------------------------------------

## 6. Backend Setup

Open a terminal in:

``` text
okDrivers/backend
```

### Windows PowerShell

``` powershell
python -m venv venv
.env\Scripts\Activate.ps1
pip install -r requirements.txt
```

------------------------------------------------------------------------

## 7. Environment Variables

Create:

``` text
backend/.env
```

Example:

``` env
DATABASE_URL=postgresql://postgres:<PASSWORD>@localhost:5432/okdriver
JWT_SECRET=<LONG_RANDOM_SECRET>
JWT_ALGORITHM=HS256
```

Do **not** commit passwords, JWT secrets, API keys, private keys, or
production credentials.

------------------------------------------------------------------------

## 8. PostgreSQL Setup

Create the database:

``` sql
CREATE DATABASE okdriver;
```

Update `backend/.env` with the correct connection string.

Core entities:

-   Users
-   Cameras
-   Detections
-   Watchlist
-   Alerts
-   Audit Logs

------------------------------------------------------------------------

## 9. Start Backend

``` powershell
cd backend
.env\Scripts\Activate.ps1
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Backend:

``` text
http://127.0.0.1:8000
```

Health check:

``` text
http://127.0.0.1:8000/api/health
```

Expected:

``` json
{
  "status": "ok",
  "service": "okDriver CCTV Platform"
}
```

------------------------------------------------------------------------

## 10. API Documentation

Swagger UI:

``` text
http://127.0.0.1:8000/docs
```

ReDoc:

``` text
http://127.0.0.1:8000/redoc
```

FastAPI OpenAPI documentation can be used to authenticate, inspect
schemas, and test the backend APIs.

------------------------------------------------------------------------

## 11. Main API Endpoints

### Authentication

``` text
POST /api/auth/login
GET  /api/auth/me
```

### Cameras

``` text
POST   /api/cameras
GET    /api/cameras
GET    /api/cameras/{id}
PUT    /api/cameras/{id}
PATCH  /api/cameras/{id}/disable
```

Filters include search, status, department, and zone.

### Detection / Analytics

``` text
POST /api/detections
GET  /api/detections
GET  /api/detections/{id}
```

Example:

``` json
{
  "camera_id": 1,
  "event_type": "ANPR",
  "vehicle_number": "DL01AB1234",
  "confidence": 0.96,
  "vehicle_type": "CAR",
  "bounding_box": {
    "x": 120,
    "y": 90,
    "width": 220,
    "height": 140
  }
}
```

### Watchlist

``` text
POST   /api/watchlist
GET    /api/watchlist
PUT    /api/watchlist/{id}
PATCH  /api/watchlist/{id}/disable
```

### Alerts

``` text
GET   /api/alerts
GET   /api/alerts/{id}
PATCH /api/alerts/{id}/acknowledge
PATCH /api/alerts/{id}/resolve
PATCH /api/alerts/{id}/status
```

### Vehicle Search

``` text
GET /api/vehicles/search
```

### Camera Health

``` text
GET  /api/camera-health
GET  /api/camera-health/{camera_id}
POST /api/camera-health/{camera_id}/heartbeat
```

### Audit Logs

``` text
GET /api/audit-logs
```

### WebSocket

``` text
ws://127.0.0.1:8000/ws/alerts
```

WebSocket provides real-time alert delivery without requiring a
dashboard refresh.

------------------------------------------------------------------------

## 12. Start Frontend

``` powershell
cd frontend
npm install
npm run dev
```

Frontend:

``` text
http://localhost:5173
```

Production build:

``` powershell
npm run build
```

------------------------------------------------------------------------

## 13. Authentication Flow

1.  User submits username/password.
2.  FastAPI validates credentials.
3.  Password hash is verified using bcrypt.
4.  Backend creates a signed JWT.
5.  Frontend stores the access token for the current session.
6.  Protected requests send:

``` text
Authorization: Bearer <token>
```

7.  Backend validates the token and loads the current user.
8.  Role checks protect privileged operations.

------------------------------------------------------------------------

## 14. Detection → Watchlist → Alert Flow

``` text
Camera / Analytics Simulator
            │
            ▼
       Detection API
            │
            ▼
     Validate Detection
            │
            ▼
        PostgreSQL
            │
            ▼
      Watchlist Matching
            │
       ┌────┴────┐
       │         │
    No Match   Match
       │         │
       ▼         ▼
    Persist   Create Alert
                  │
                  ▼
              WebSocket
                  │
                  ▼
           Operator Dashboard
```

This is the core real-time intelligence workflow demonstrated by the
prototype.

------------------------------------------------------------------------

## 15. Camera Health Flow

Simulator cameras update heartbeat information.

``` text
≤ 30 seconds      ONLINE
31–90 seconds     DEGRADED
> 90 seconds      OFFLINE
Missing heartbeat OFFLINE
Inactive camera   OFFLINE
```

The simulator heartbeat loop updates active simulator cameras every 10
seconds. The frontend periodically refreshes camera health so the
dashboard reflects the current state.

------------------------------------------------------------------------

## 16. Audit Logging

Important operational actions generate audit records.

``` text
CAMERA_CREATED
CAMERA_UPDATED
CAMERA_DISABLED
ALERT_ACKNOWLEDGED
ALERT_RESOLVED
ALERT_STATUS_UPDATED
```

Audit records include:

-   User
-   Action
-   Resource type
-   Resource ID
-   Description
-   IP address where available
-   Timestamp

------------------------------------------------------------------------

## 17. GIS and Movement History

Leaflet is used for the operational map.

The map represents:

-   Camera locations
-   Camera status
-   Alert-related camera state
-   Vehicle movement history

Vehicle movement history is reconstructed from timestamped detection
events and plotted chronologically across cameras.

------------------------------------------------------------------------

## 18. Docker Deployment

Included:

``` text
backend/Dockerfile
frontend/Dockerfile
docker-compose.yml
```

Architecture:

``` text
PostgreSQL
     │
     ▼
FastAPI Backend
     │
     ▼
React / Nginx Frontend
```

PostgreSQL data uses:

``` text
okdriver_postgres_data
```

Validate:

``` powershell
docker compose config
```

Start when Docker Engine is available:

``` powershell
docker compose up --build
```

> **Local environment note:** Docker Desktop and Compose configuration
> are included. The current development machine requires hardware
> virtualization / WSL2 configuration before Docker Desktop can start
> normally. Native PostgreSQL + Python/FastAPI + React/Vite remains the
> current local development workflow.

------------------------------------------------------------------------

# 19. Production / 80,000-Camera Scalability Plan

The prototype is intentionally small, while the architecture separates
video ingestion, analytics, APIs, real-time processing, and storage for
future scale.

### Target Architecture

``` text
                    ┌─────────────────────┐
                    │ Global / Central    │
                    │ Control Plane       │
                    └──────────┬──────────┘
                               │
                    Load Balancer / API Gateway
                               │
          ┌────────────────────┼────────────────────┐
          ▼                    ▼                    ▼
     Region North         Region West         Region South
          │                    │                    │
     Edge Gateways        Edge Gateways        Edge Gateways
          │                    │                    │
     Camera Clusters      Camera Clusters      Camera Clusters
          │                    │                    │
          ▼                    ▼                    ▼
     GPU Analytics        GPU Analytics        GPU Analytics
          │                    │                    │
          └────────────────────┼────────────────────┘
                               ▼
                    Central Event Platform
                               │
               ┌───────────────┼───────────────┐
               ▼               ▼               ▼
          PostgreSQL       Redis / Queue    Object Storage
          / Read Replicas  Event Bus        Hot/Warm/Cold
```

### Edge Processing

-   Camera connectivity
-   Protocol adaptation
-   RTSP/ONVIF handling
-   Stream health
-   Frame sampling
-   Bandwidth optimization
-   Local buffering
-   Basic event filtering

### Regional Processing

-   Video analytics
-   GPU inference
-   ANPR
-   Vehicle/object detection
-   Regional event processing
-   Regional caching
-   Temporary evidence storage

### Central Processing

-   User management
-   Camera registry
-   Watchlists
-   Cross-region search
-   Alert correlation
-   Audit logs
-   Reporting
-   Configuration
-   Global dashboards

### Horizontal Scaling

FastAPI should remain stateless wherever possible.

``` text
                 Load Balancer
                      │
          ┌───────────┼───────────┐
          ▼           ▼           ▼
       API-01       API-02       API-N
          │           │           │
          └───────────┼───────────┘
                      ▼
                 PostgreSQL / Redis
```

Shared Redis Pub/Sub can support distributed WebSocket/event delivery.

### Event Bus

``` text
Camera / Edge
     │
     ▼
Event Gateway
     │
     ▼
Message Queue / Kafka / Redis Streams
     │
     ├──► ANPR / Detection Workers
     ├──► Watchlist Matching
     ├──► Alert Engine
     ├──► Storage Worker
     └──► Analytics / Reporting
```

Benefits:

-   Backpressure
-   Retry handling
-   Burst absorption
-   Worker scaling
-   Event durability
-   Decoupled services

### Database Scaling

At production scale:

-   Read replicas
-   Time/region partitioning
-   Composite indexes
-   Hot vs historical data separation
-   Connection pooling
-   Event archival
-   Regional databases where appropriate

Example:

``` text
detections_2026_09
detections_2026_10
detections_2026_11
...
```

### Video Bandwidth

-   Process video near the source
-   Send metadata/events centrally
-   Use adaptive bitrate streams
-   Use lower-resolution monitoring streams
-   Request high-resolution footage when required
-   Keep evidence clips near their source region
-   Use object storage for longer retention

### GPU Strategy

GPU resources should be concentrated in analytics workers for:

-   ANPR
-   Object detection
-   Person detection
-   Vehicle classification
-   Re-identification

GPU workers can scale independently from API, WebSocket, database, and
frontend servers.

### Storage Tiers

**Hot** - Active alerts - Recent detections - Current camera state -
Recent metadata

**Warm** - Recent video clips - Evidence snapshots - Historical
detections

**Cold** - Archived footage - Historical evidence - Compliance records

### Observability

Monitor:

-   Camera heartbeat/connectivity
-   Detection throughput
-   Queue depth
-   API latency
-   WebSocket connections
-   Database latency
-   GPU utilization
-   Storage utilization
-   Error rate
-   Alert delivery latency

Future stack:

``` text
Prometheus + Grafana + Centralized Logs + Distributed Tracing
```

### High Availability / Disaster Recovery

-   Multiple backend instances
-   Load balancers
-   PostgreSQL primary + replicas
-   Automated backups
-   Multi-zone deployment
-   Regional failover
-   Queue replication
-   Object storage replication
-   Business-defined RPO/RTO

### Cybersecurity

-   HTTPS/TLS
-   Private camera networks
-   Network segmentation
-   VPN/private connectivity where appropriate
-   RBAC
-   Strong credential policies
-   Secret management
-   API rate limiting
-   Input validation
-   Audit logging
-   Encrypted storage where required
-   No credentials in source control
-   Restricted database access
-   Camera credentials outside application source code

------------------------------------------------------------------------

# 20. Known Prototype Limitations

This is a prototype and intentionally does not attempt to reproduce a
full production VMS.

1.  Camera feeds use simulator/representative sources rather than a
    production fleet of RTSP cameras.
2.  AI analytics are represented through an event interface/simulator;
    no model training pipeline is included.
3.  Docker files are included, but the current development machine
    requires hardware virtualization/WSL2 configuration before Docker
    Desktop can start normally.
4.  Redis/Kafka is a future scaling component rather than a requirement
    for the current local prototype.
5.  Production-grade multi-region deployment is documented
    architecturally but not operated locally.
6.  Long-term video retention/object storage is a production extension.
7.  High-availability and disaster-recovery infrastructure is documented
    but not provisioned locally.

These limitations keep the prototype focused on demonstrating the
end-to-end application architecture and workflow.

------------------------------------------------------------------------

# 21. Demo Flow

Recommended 3--5 minute demonstration:

1.  **Login** --- Show JWT authentication and the operational dashboard.
2.  **Camera Registry** --- Show multiple cameras, metadata, status, and
    GIS location.
3.  **Live Monitoring** --- Show representative camera feeds.
4.  **Detection** --- Submit or generate a detection event.
5.  **Watchlist Match** --- Generate a detection matching the synthetic
    watchlist identifier.
6.  **Real-Time Alert** --- Show the WebSocket alert without refreshing
    the page.
7.  **Alert Management** --- Acknowledge and resolve the alert.
8.  **Vehicle Search** --- Search the identifier and show movement
    history.
9.  **Event History** --- Show persisted detection history.
10. **Audit Logs** --- Show auditable operator actions.
11. **Architecture** --- Explain the main processing pipeline.

``` text
Camera
  ↓
Analytics
  ↓
FastAPI
  ↓
PostgreSQL
  ↓
Watchlist
  ↓
Alert
  ↓
WebSocket
  ↓
React Dashboard
```

------------------------------------------------------------------------

# 22. Development Commands

### Backend

``` powershell
cd backend
.env\Scripts\Activate.ps1
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

### Frontend

``` powershell
cd frontend
npm install
npm run dev
```

### Production Build

``` powershell
npm run build
```

### Docker

``` powershell
docker compose config
docker compose up --build
```

------------------------------------------------------------------------

# 23. Engineering Notes

The prototype favors modular separation between:

-   Authentication
-   Camera registry
-   Detection ingestion
-   Watchlist correlation
-   Alert management
-   Vehicle search
-   Camera health
-   Audit logging
-   Real-time communication

This allows the prototype to evolve into independently scalable services
without requiring a complete rewrite of the operational workflow.

------------------------------------------------------------------------

# 24. Assignment Alignment

  Requirement                          Prototype Status
  ------------------------------------ ------------------------------------
  Multiple camera sources              Implemented with simulator sources
  Camera registry                      Implemented
  Search / filtering                   Implemented
  GIS map                              Implemented with Leaflet
  Camera health                        Implemented
  Detection event API                  Implemented
  Detection persistence                Implemented
  Watchlist                            Implemented
  Watchlist matching                   Implemented
  Real-time alerts                     Implemented with WebSocket
  Alert acknowledgement / resolution   Implemented
  Vehicle/entity search                Implemented
  Movement history                     Implemented
  Event history                        Implemented
  Audit logs                           Implemented
  JWT authentication                   Implemented
  RBAC                                 Implemented
  Rate limiting                        Implemented
  Docker configuration                 Prepared
  Scalability plan                     Documented
  Architecture / ER documentation      Documentation item

------------------------------------------------------------------------

# 25. Final Note

The purpose of this prototype is to demonstrate a functional foundation
for a centralized CCTV intelligence platform rather than a superficial
CRUD dashboard.

The architecture intentionally separates:

``` text
Video Sources
      ↓
Analytics
      ↓
Event Ingestion
      ↓
Persistence
      ↓
Watchlist Correlation
      ↓
Real-Time Alerting
      ↓
Operational Dashboard
```

This foundation can evolve toward regional/edge processing, GPU
analytics, distributed event processing, scalable storage, and large
camera fleets while preserving the core operational workflow.
