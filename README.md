# okDriver CCTV Intelligence Platform

A full-stack prototype for centralized CCTV monitoring,
vehicle/ANPR-style analytics, watchlist correlation, real-time alerting,
GIS visualization, camera health monitoring, vehicle movement search,
and auditable security operations.

> **Prototype status:** The application is operational locally with
> FastAPI, PostgreSQL, React/Vite, simulated camera sources, simulated
> detection events, WebSocket alerts, Leaflet GIS, JWT authentication,
> RBAC, audit logging, and camera health monitoring.

------------------------------------------------------------------------

## 1. Project Overview

The platform demonstrates an end-to-end CCTV intelligence workflow:

1.  Administrators onboard camera sources.
2.  Camera metadata is available in a central registry and GIS map.
3.  Simulated camera sources provide representative monitoring feeds.
4.  Analytics events can be submitted through the detection API.
5.  Detection events are validated and persisted in PostgreSQL.
6.  Detected identifiers are checked against the watchlist.
7.  A matching watchlist record creates an alert.
8.  Alerts are pushed to connected operators through WebSocket.
9.  Operators can acknowledge or resolve alerts.
10. Vehicles/entities can be searched and their movement history
    reviewed.
11. Camera heartbeat and health status are continuously evaluated.
12. Important operational actions are written to audit logs.

This implements the core prototype flow requested in the hiring
assignment.

------------------------------------------------------------------------

## 2. Main Features

### Camera Registry

-   Add cameras
-   Edit camera metadata
-   Disable cameras
-   Search and filter cameras
-   Department and zone metadata
-   Latitude/longitude support
-   Source protocol and stream endpoint reference
-   Camera status
-   Last heartbeat
-   Storage metadata
-   Camera audit history

### Live / Near-Live Monitoring

-   Multiple logical camera sources
-   Simulated camera scenes for development/demo
-   Camera status indicators
-   Unified monitoring interface
-   Architecture prepared for RTSP/ONVIF/vendor adapters

### Video Analytics / Detection

-   Detection event API
-   ANPR/vehicle-style detection events
-   Vehicle identifier
-   Confidence score
-   Vehicle type
-   Bounding box
-   Event type
-   Event timestamp
-   JSON metadata
-   Persistent event history

### Watchlist

-   Add watchlist records
-   Edit records
-   Disable records
-   Search/filter
-   Entity type
-   Identifier
-   Category
-   Description
-   Synthetic testing records

### Real-Time Alerting

-   Automatic watchlist correlation
-   Active alert creation
-   Severity/status
-   Alert acknowledgement
-   Alert resolution
-   WebSocket alert delivery
-   Persistent alert history

### GIS / Vehicle Intelligence

-   Leaflet camera map
-   Camera status visualization
-   Alert-aware markers
-   Vehicle/entity search
-   Chronological movement history
-   Cross-camera route visualization

### Camera Health

-   Heartbeat processing
-   ONLINE status
-   DEGRADED status
-   OFFLINE status
-   Automatic simulator heartbeat
-   Dashboard health refresh

### Security

-   JWT authentication
-   Role-based authorization
-   Admin protection for privileged operations
-   Password hashing
-   Input validation
-   Environment-based secrets
-   Audit logs
-   API rate limiting
-   CORS configuration

------------------------------------------------------------------------

## 3. Technology Stack

  Layer               Technology
  ------------------- --------------------------------------------------
  Frontend            React + Vite
  Backend             FastAPI + Python
  Database            PostgreSQL
  ORM                 SQLAlchemy
  Authentication      JWT
  Real-time           WebSocket
  GIS                 Leaflet
  API Documentation   FastAPI OpenAPI / Swagger
  Video Prototype     Simulated camera sources
  Containerization    Docker + Docker Compose
  Future Messaging    Redis / Kafka / RabbitMQ compatible architecture

------------------------------------------------------------------------

## 4. Project Structure

``` text
okDrivers/
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── alert.py
│   │   │   ├── audit.py
│   │   │   ├── camera_health.py
│   │   │   ├── cameras.py
│   │   │   ├── detection.py
│   │   │   ├── vehicle.py
│   │   │   ├── watchlist.py
│   │   │   ├── websocket.py
│   │   │   └── auth.py
│   │   │
│   │   ├── core/
│   │   │   └── security.py
│   │   │
│   │   ├── db/
│   │   │   └── database.py
│   │   │
│   │   ├── models/
│   │   │   ├── user.py
│   │   │   ├── camera.py
│   │   │   ├── detection.py
│   │   │   ├── watchlist.py
│   │   │   ├── alert.py
│   │   │   └── audit_log.py
│   │   │
│   │   └── main.py
│   │
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── requirements.txt
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── Cameras.jsx
│   │   ├── Watchlist.jsx
│   │   ├── Alerts.jsx
│   │   ├── EventHistory.jsx
│   │   ├── VehicleSearch.jsx
│   │   └── ...
│   │
│   ├── Dockerfile
│   ├── .dockerignore
│   └── package.json
│
├── docker-compose.yml
└── README.md
```

------------------------------------------------------------------------

## 5. Prerequisites

For local development:

-   Python 3.12+
-   Node.js 22+
-   npm
-   PostgreSQL 18+
-   Git

For container deployment:

-   Docker Desktop / Docker Engine
-   Docker Compose

------------------------------------------------------------------------

## 6. Backend Setup

Open a terminal in:

``` text
okDrivers/backend
```

Create/activate the virtual environment:

### Windows PowerShell

``` powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
```

Install dependencies:

``` powershell
pip install -r requirements.txt
```

------------------------------------------------------------------------

## 7. Environment Variables

The backend uses environment-based configuration.

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

Do **not** commit real passwords, JWT secrets, API keys, private keys,
or production credentials.

The repository `.gitignore` excludes local environment files and virtual
environments.

------------------------------------------------------------------------

## 8. PostgreSQL Setup

Create a PostgreSQL database named:

``` text
okdriver
```

Example:

``` sql
CREATE DATABASE okdriver;
```

Update `backend/.env` with the correct connection string.

The application uses SQLAlchemy with PostgreSQL.

The current schema contains the core entities for:

-   Users
-   Cameras
-   Detections
-   Watchlist
-   Alerts
-   Audit Logs

Supporting health and operational entities can be extended as the
platform moves toward production deployment.

------------------------------------------------------------------------

## 9. Start Backend

From:

``` text
okDrivers/backend
```

run:

``` powershell
.\venv\Scripts\Activate.ps1
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

Expected response:

``` json
{
  "status": "ok",
  "service": "okDriver CCTV Platform"
}
```

------------------------------------------------------------------------

## 10. API Documentation

FastAPI automatically exposes OpenAPI documentation.

Swagger UI:

``` text
http://127.0.0.1:8000/docs
```

ReDoc:

``` text
http://127.0.0.1:8000/redoc
```

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

Supported camera filters include search, status, department and zone.

### Detection / Analytics

``` text
POST /api/detections
GET  /api/detections
GET  /api/detections/{id}
```

A detection can contain:

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

The vehicle workflow returns matching detection history and movement
information.

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

The WebSocket is used for real-time alert delivery without requiring a
dashboard refresh.

------------------------------------------------------------------------

## 12. Start Frontend

Open another terminal in:

``` text
okDrivers/frontend
```

Install packages:

``` powershell
npm install
```

Start development server:

``` powershell
npm run dev
```

Frontend:

``` text
http://localhost:5173
```

Build production assets:

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
      ┌─────┴─────┐
      │           │
    No Match    Match
      │           │
      ▼           ▼
   Persist     Create Alert
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

Simulator cameras send/update heartbeat information.

Current health rules:

``` text
<= 30 seconds    ONLINE
31–90 seconds    DEGRADED
> 90 seconds     OFFLINE
Missing heartbeat OFFLINE
Inactive camera  OFFLINE
```

The simulator heartbeat loop updates active simulator cameras every 10
seconds.

The frontend refreshes camera health periodically so the operational
dashboard reflects current state.

------------------------------------------------------------------------

## 16. Audit Logging

Important actions generate audit records.

Examples include:

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

The repository contains:

``` text
backend/Dockerfile
frontend/Dockerfile
docker-compose.yml
```

The Compose architecture contains:

``` text
PostgreSQL
    │
    ▼
FastAPI Backend
    │
    ▼
React/Nginx Frontend
```

The PostgreSQL data is stored in the named volume:

``` text
okdriver_postgres_data
```

### Compose configuration

From the project root:

``` powershell
docker compose config
```

To start the stack when Docker Engine is available:

``` powershell
docker compose up --build
```

### Current local environment note

Docker Desktop is installed and the Compose configuration validates
successfully. The current development machine has a Docker Desktop
startup dependency on hardware virtualization/WSL2 configuration.
Therefore local development currently uses the native PostgreSQL +
Python + Vite workflow.

This does not change the container deployment architecture.

------------------------------------------------------------------------

# 19. Production / 80,000-Camera Scalability Plan

The prototype is intentionally small, but the architecture is designed
so that video ingestion, analytics, APIs and storage can be separated as
the deployment grows.

## Target Architecture

``` text
                         ┌─────────────────────┐
                         │   Global / Central   │
                         │  Control Plane       │
                         └──────────┬──────────┘
                                    │
                         Load Balancer / API Gateway
                                    │
             ┌──────────────────────┼──────────────────────┐
             │                      │                      │
             ▼                      ▼                      ▼
       Region North           Region West            Region South
             │                      │                      │
        Edge Gateways          Edge Gateways          Edge Gateways
             │                      │                      │
       Camera Clusters        Camera Clusters        Camera Clusters
             │                      │                      │
             ▼                      ▼                      ▼
       GPU Analytics           GPU Analytics           GPU Analytics
             │                      │                      │
             └──────────────────────┼──────────────────────┘
                                    ▼
                          Central Event Platform
                                    │
                  ┌─────────────────┼─────────────────┐
                  ▼                 ▼                 ▼
             PostgreSQL          Redis/Queue      Object Storage
             / Read Replicas     Event Bus        Hot/Warm/Cold
```

## Central, Regional and Edge Processing

### Edge

Place lightweight gateways close to camera clusters.

Responsibilities:

-   Camera connectivity
-   Protocol adaptation
-   RTSP/ONVIF handling
-   Stream health
-   Frame sampling
-   Bandwidth optimization
-   Local buffering
-   Basic event filtering

### Regional

Regional processing clusters handle:

-   Video analytics
-   GPU inference
-   ANPR
-   Vehicle/object detection
-   Regional event processing
-   Regional caching
-   Temporary evidence storage

### Central

The central control plane handles:

-   User management
-   Camera registry
-   Watchlists
-   Cross-region search
-   Alert correlation
-   Audit logs
-   Reporting
-   Configuration
-   Global dashboards

------------------------------------------------------------------------

## Horizontal Scaling

The FastAPI application should remain stateless wherever possible.

Multiple backend instances can run behind a load balancer:

``` text
                    Load Balancer
                         │
          ┌──────────────┼──────────────┐
          ▼              ▼              ▼
       API-01          API-02         API-N
          │              │              │
          └──────────────┼──────────────┘
                         ▼
                  PostgreSQL / Redis
```

WebSocket connections can be distributed across instances using a shared
real-time broker such as Redis Pub/Sub.

------------------------------------------------------------------------

## Message Queue / Event Bus

At larger scale, detection events should not depend on synchronous API
processing.

Recommended flow:

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

------------------------------------------------------------------------

## Database Scaling

The current PostgreSQL design already uses indexes for operational
queries.

At production scale:

-   Add read replicas
-   Partition high-volume detection tables by time/region
-   Use composite indexes based on query patterns
-   Separate hot operational data from historical data
-   Use connection pooling
-   Archive older events
-   Use regional databases where appropriate
-   Keep the central database focused on metadata and cross-region
    indexes

Potential high-volume partitioning strategy:

``` text
detections_2026_09
detections_2026_10
detections_2026_11
...
```

------------------------------------------------------------------------

## Video Bandwidth Strategy

Streaming every camera continuously to a central data center is
expensive.

Recommended approach:

-   Process video near the source.
-   Send metadata/events centrally.
-   Use adaptive bitrate streams.
-   Use lower-resolution streams for monitoring.
-   Request high-resolution footage only when required.
-   Keep evidence clips near the region where they were generated.
-   Use object storage for longer retention.

This separates continuous analytics traffic from occasional
investigation traffic.

------------------------------------------------------------------------

## GPU / Accelerator Strategy

GPU resources should be concentrated in analytics workers rather than
API servers.

Potential GPU workloads:

-   ANPR
-   Object detection
-   Person detection
-   Vehicle classification
-   Re-identification

Use worker pools so GPU capacity can scale independently from:

-   API servers
-   WebSocket servers
-   Database servers
-   Frontend servers

------------------------------------------------------------------------

## Storage Strategy

### Hot Storage

Recent operational data:

-   Active alerts
-   Recent detections
-   Current camera state
-   Recent metadata

### Warm Storage

Investigation data:

-   Recent video clips
-   Evidence snapshots
-   Historical detections

### Cold Storage

Long-term retention:

-   Archived footage
-   Historical evidence
-   Compliance records

Object storage such as S3-compatible storage can be used for large video
objects.

------------------------------------------------------------------------

## Monitoring and Observability

Production deployment should monitor:

-   Camera heartbeat
-   Camera connectivity
-   Detection throughput
-   Queue depth
-   API latency
-   WebSocket connections
-   Database latency
-   GPU utilization
-   Storage utilization
-   Error rate
-   Alert delivery latency

Recommended future stack:

``` text
Prometheus
    +
Grafana
    +
Centralized Logs
    +
Distributed Tracing
```

------------------------------------------------------------------------

## High Availability and Disaster Recovery

Recommended production design:

-   Multiple backend instances
-   Load balancers
-   PostgreSQL primary + replicas
-   Automated database backups
-   Multi-zone deployment
-   Regional failover
-   Queue replication
-   Object storage replication
-   Recovery Point Objective (RPO) and Recovery Time Objective (RTO)
    defined by business requirements

------------------------------------------------------------------------

## Cybersecurity

Production deployment should use:

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
-   Camera credentials stored outside application source code

------------------------------------------------------------------------

# 20. Known Prototype Limitations

This is a prototype and intentionally does not attempt to reproduce a
full production VMS.

Current limitations include:

1.  Camera feeds are represented with simulator/representative sources
    rather than a production fleet of RTSP cameras.
2.  AI analytics are represented through an event interface/simulator;
    no model training pipeline is included.
3.  Docker deployment files are present, but the current development
    machine requires hardware virtualization/WSL2 configuration before
    Docker Desktop can start normally.
4.  Redis/Kafka is designed as a future scaling component rather than
    required for the current local prototype.
5.  Production-grade multi-region deployment is documented
    architecturally but not operated in this prototype.
6.  Long-term video retention/object storage is a production extension.
7.  High-availability and disaster-recovery infrastructure is documented
    but not provisioned locally.

These limitations are deliberate and keep the prototype focused on
demonstrating the end-to-end application architecture and workflow.

------------------------------------------------------------------------

# 21. Demo Flow

A recommended 3--5 minute demonstration:

### 1. Login

Show JWT authentication and the operational dashboard.

### 2. Camera Registry

Show:

-   Multiple cameras
-   Camera metadata
-   Status
-   GIS location

### 3. Live Monitoring

Show the representative camera feeds.

### 4. Detection

Submit or generate a detection event.

### 5. Watchlist Match

Use the synthetic watchlist identifier and generate a matching
detection.

### 6. Real-Time Alert

Show the alert appearing through WebSocket without a page refresh.

### 7. Alert Management

Acknowledge and resolve the alert.

### 8. Vehicle Search

Search the detected identifier and show movement history.

### 9. Event History

Show the persisted detection history.

### 10. Audit Logs

Show auditable operator actions.

### 11. Architecture

Briefly explain:

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
.\venv\Scripts\Activate.ps1
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

### Frontend

``` powershell
cd frontend
npm install
npm run dev
```

### Frontend production build

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

This allows the current prototype to evolve into independently scalable
services without requiring a complete rewrite of the operational
workflow.

------------------------------------------------------------------------

# 24. Assignment Alignment

The implementation covers the major requested prototype areas:

  Requirement                        Prototype
  ---------------------------------- ------------------------------------
  Multiple camera sources            Implemented with simulator sources
  Camera registry                    Implemented
  Search/filter                      Implemented
  GIS map                            Implemented with Leaflet
  Camera health                      Implemented
  Detection event API                Implemented
  Detection persistence              Implemented
  Watchlist                          Implemented
  Watchlist matching                 Implemented
  Real-time alerts                   Implemented with WebSocket
  Alert acknowledgement/resolution   Implemented
  Vehicle/entity search              Implemented
  Movement history                   Implemented
  Event history                      Implemented
  Audit logs                         Implemented
  JWT authentication                 Implemented
  RBAC                               Implemented
  Rate limiting                      Implemented
  Docker configuration               Prepared
  Architecture diagram               Prepared
  ER diagram                         Prepared
  Scalability plan                   Documented

------------------------------------------------------------------------

## 25. Final Note

The purpose of this prototype is to demonstrate a functional foundation
for a centralized CCTV intelligence platform rather than a superficial
CRUD dashboard.

The architecture intentionally separates:

**video sources → analytics → event ingestion → persistence → watchlist
correlation → real-time alerting → operational dashboard**

so that the prototype can evolve toward regional/edge processing, GPU
analytics, distributed event processing, scalable storage, and large
camera fleets.
