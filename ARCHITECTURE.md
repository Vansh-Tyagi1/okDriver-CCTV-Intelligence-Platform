# okDriver CCTV Intelligence Platform — Architecture

## 1. System Overview

okDriver is a full-stack CCTV intelligence prototype designed around centralized camera management, analytics event ingestion, watchlist correlation, real-time alerting, GIS visualization, vehicle movement analysis, camera health monitoring, and auditability.

The current prototype uses simulated camera sources and simulated analytics events while keeping the backend interfaces extensible toward RTSP, ONVIF, vendor APIs, and production analytics services.

---

## 2. High-Level Architecture

```text
                         CAMERA SOURCES
              ┌─────────────────────────────────┐
              │                                 │
              │ Simulator   RTSP   ONVIF       │
              │ Test Feed   Vendor APIs        │
              │                                 │
              └───────────────┬─────────────────┘
                              │
                              ▼
                  ┌─────────────────────────┐
                  │     FASTAPI BACKEND     │
                  │                         │
                  │ Authentication / RBAC   │
                  │ Camera Registry          │
                  │ Detection API            │
                  │ Watchlist Matching       │
                  │ Alert Management         │
                  │ Vehicle Search           │
                  │ Camera Health            │
                  │ Audit Logging            │
                  └────────────┬────────────┘
                               │
             ┌─────────────────┼──────────────────┐
             │                 │                  │
             ▼                 ▼                  ▼
      ┌─────────────┐   ┌──────────────┐   ┌──────────────┐
      │ PostgreSQL  │   │  WebSocket   │   │ OpenAPI /    │
      │             │   │              │   │ Swagger      │
      │ Users       │   │ Real-time    │   │              │
      │ Cameras     │   │ alerts/events│   │ API Testing  │
      │ Detections  │   │              │   │              │
      │ Watchlist   │   └──────┬───────┘   └──────────────┘
      │ Alerts      │          │
      │ Audit Logs  │          ▼
      └─────────────┘   ┌─────────────────────┐
                        │   REACT DASHBOARD   │
                        │                     │
                        │ Camera Monitoring   │
                        │ GIS Map              │
                        │ Alerts               │
                        │ Vehicle Search       │
                        │ Event History        │
                        │ Watchlist             │
                        │ Camera Health         │
                        │ Settings              │
                        └─────────────────────┘
```

---

## 3. Application Layers

### Frontend Layer

**Technology**

- React
- Vite
- Leaflet
- Axios

**Responsibilities**

- Authentication UI
- Camera registry
- Live monitoring
- GIS visualization
- Alert management
- Watchlist management
- Vehicle search
- Event history
- Camera health dashboard
- Settings and system status
- WebSocket alert updates

### API / Application Layer

**Technology**

- Python
- FastAPI
- SQLAlchemy
- SlowAPI

**Responsibilities**

- REST API endpoints
- Authentication
- Authorization
- Camera management
- Detection ingestion
- Watchlist correlation
- Alert generation
- Vehicle search
- Camera health
- Audit logging
- Rate limiting

### Persistence Layer

**Technology**

- PostgreSQL
- SQLAlchemy ORM

**Responsibilities**

- User persistence
- Camera metadata
- Detection events
- Watchlist records
- Alerts
- Audit logs
- Operational history

### Real-Time Layer

**Technology**

- WebSocket

**Responsibilities**

- Push new alerts to connected dashboards
- Deliver watchlist-match notifications
- Reduce dependency on dashboard polling for alert delivery

The current prototype uses WebSocket directly. A larger deployment can introduce Redis Pub/Sub or another event broker to distribute events between backend instances.

---

## 4. Core Data Flow

```text
Camera Source
     │
     ▼
Detection / Analytics Event
     │
     ▼
POST /api/detections
     │
     ▼
Validate Event
     │
     ▼
Persist Detection
     │
     ▼
Watchlist Identifier Correlation
     │
     ├──────────────► No Match
     │                    │
     │                    ▼
     │                 Persist
     │
     └──────────────► Match
                          │
                          ▼
                    Create Alert
                          │
                          ▼
                     WebSocket
                          │
                          ▼
                  React Dashboard
                          │
                   ┌──────┴──────┐
                   ▼             ▼
              Acknowledge     Resolve
                   │             │
                   └──────┬──────┘
                          ▼
                      Audit Log
```

> **Relationship note:** Detection-to-watchlist matching is an application-level identifier correlation. The current SQLAlchemy models do not define a foreign key from `detections` to `watchlist`.

---

## 5. Camera Lifecycle

```text
                    Add Camera
                        │
                        ▼
                 Camera Registry
                        │
                        ▼
                   Active Camera
                        │
                        ▼
                Heartbeat Updates
                        │
              ┌─────────┼─────────┐
              │         │         │
              ▼         ▼         ▼
           ONLINE    DEGRADED   OFFLINE
              │         │         │
              └─────────┴─────────┘
                        │
                        ▼
                Dashboard Health
```

### Current Health Rules

| Condition | Status |
|---|---|
| Heartbeat ≤ 30 seconds | ONLINE |
| Heartbeat 31–90 seconds | DEGRADED |
| Heartbeat > 90 seconds | OFFLINE |
| Missing heartbeat | OFFLINE |
| Inactive camera | OFFLINE |

Active simulator cameras receive heartbeat updates every 10 seconds.

---

## 6. Authentication and Authorization Flow

```text
User
 │
 ▼
Login Form
 │
 ▼
POST /api/auth/login
 │
 ▼
Validate Credentials
 │
 ▼
Verify Password Hash
 │
 ▼
Generate JWT
 │
 ▼
Frontend Session
 │
 ▼
Authorization: Bearer <token>
 │
 ▼
FastAPI Authentication
 │
 ▼
Load Current User
 │
 ▼
RBAC / Role Check
 │
 ├──────────────► Allowed
 │
 └──────────────► 403 Forbidden
```

Security controls include:

- JWT authentication
- Password hashing
- RBAC
- Input validation
- Admin authorization
- Environment-based secrets
- CORS configuration
- API rate limiting
- Audit logging

---

## 7. Alert Lifecycle

```text
Detection Event
      │
      ▼
Watchlist Identifier Match
      │
      ├── No Match ──► Normal Event
      │
      └── Match
           │
           ▼
       Create Alert
           │
           ▼
         ACTIVE
           │
      ┌────┴────┐
      ▼         ▼
ACKNOWLEDGED  RESOLVED
      │
      ▼
  RESOLVED
```

An alert stores direct foreign-key references to:

- `detections.id`
- `watchlist.id`
- `cameras.id`

Important alert actions are recorded in the audit log.

---

## 8. Vehicle Intelligence Flow

```text
Vehicle Identifier
       │
       ▼
GET /api/vehicles/search
       │
       ▼
Search Detection History
       │
       ▼
Chronological Events
       │
       ▼
Camera Locations
       │
       ▼
Movement History
       │
       ▼
GIS Route Visualization
```

Vehicle investigation is based on timestamped detection events. The detection model indexes `(vehicle_number, detected_at)` for this query pattern.

---

# 9. Entity Relationship Diagram

The following diagram reflects the **actual ForeignKey definitions present in the current SQLAlchemy models**.

```text
┌──────────────────────┐
│        USERS         │
├──────────────────────┤
│ PK id                │
│ username UNIQUE      │
│ email UNIQUE         │
│ password_hash        │
│ role                 │
│ is_active            │
│ created_at           │
│ updated_at           │
└──────────────────────┘
          │
          │ logical/application association
          │ (AuditLog.user_id)
          ▼
┌──────────────────────┐
│     AUDIT_LOGS       │
├──────────────────────┤
│ PK id                │
│ user_id              │
│ action               │
│ resource_type        │
│ resource_id          │
│ description          │
│ ip_address           │
│ created_at            │
└──────────────────────┘


┌──────────────────────┐
│       CAMERAS        │
├──────────────────────┤
│ PK id                │
│ camera_id UNIQUE     │
│ name                 │
│ department           │
│ latitude             │
│ longitude            │
│ camera_type          │
│ source_protocol      │
│ stream_endpoint      │
│ status               │
│ last_heartbeat       │
│ zone                 │
│ storage_metadata     │
│ is_active             │
│ created_at            │
│ updated_at            │
└──────────┬───────────┘
           │
           │ 1:N
           │ FK detections.camera_id
           ▼
┌──────────────────────┐
│     DETECTIONS       │
├──────────────────────┤
│ PK id                │
│ FK camera_id         │
│ event_type           │
│ vehicle_number       │
│ confidence            │
│ vehicle_type          │
│ bounding_box (JSON)  │
│ detected_at           │
│ event_metadata(JSON) │
└──────────┬───────────┘
           │
           │ 1:N
           │ FK alerts.detection_id
           ▼
┌──────────────────────┐
│       ALERTS         │
├──────────────────────┤
│ PK id                │
│ FK detection_id      │
│ FK watchlist_id      │◄──────────────┐
│ FK camera_id         │               │
│ matched_identifier   │               │
│ confidence           │               │
│ latitude             │               │
│ longitude            │               │
│ severity             │               │
│ status               │               │
│ message              │               │
│ created_at            │               │
│ acknowledged_at       │               │
│ resolved_at           │               │
└──────────────────────┘               │
                                       │
                                       │ 1:N
                                       │ FK alerts.watchlist_id
                                       │
                              ┌────────┴─────────────┐
                              │      WATCHLIST       │
                              ├─────────────────────┤
                              │ PK id                │
                              │ entity_type           │
                              │ identifier            │
                              │ name                  │
                              │ category              │
                              │ description           │
                              │ is_active             │
                              │ created_at            │
                              │ updated_at            │
                              └──────────────────────┘

CAMERAS
   │
   │ 1:N
   │ FK alerts.camera_id
   ▼
ALERTS
```

### Relationship Summary

| Parent | Child | Relationship | Database FK |
|---|---|---|---|
| Cameras | Detections | 1:N | `detections.camera_id → cameras.id` |
| Cameras | Alerts | 1:N | `alerts.camera_id → cameras.id` |
| Detections | Alerts | 1:N | `alerts.detection_id → detections.id` |
| Watchlist | Alerts | 1:N | `alerts.watchlist_id → watchlist.id` |
| Users | Audit Logs | Logical association | No FK currently defined |
| Detections | Watchlist | Identifier correlation | No FK currently defined |

### Cascade Behavior

The current foreign keys for:

- `detections.camera_id`
- `alerts.detection_id`
- `alerts.watchlist_id`
- `alerts.camera_id`

use:

```text
ON DELETE CASCADE
```

---

## 10. Database Indexing Strategy

### Users

- `id`
- `username`
- `email`
- `role`
- `(role, is_active)`

### Cameras

- `id`
- `camera_id`
- `department`
- `status`
- `zone`
- `(latitude, longitude)`

### Detections

- `id`
- `camera_id`
- `event_type`
- `vehicle_number`
- `detected_at`
- `(camera_id, detected_at)`
- `(vehicle_number, detected_at)`

### Watchlist

- `id`
- `entity_type`
- `identifier`
- `category`
- `(identifier, is_active)`

### Alerts

- `id`
- `detection_id`
- `watchlist_id`
- `camera_id`
- `matched_identifier`
- `severity`
- `status`
- `created_at`
- `(status, created_at)`
- `(camera_id, created_at)`

### Audit Logs

- `id`
- `user_id`
- `action`
- `created_at`
- `(action, created_at)`
- `(resource_type, resource_id)`

These indexes support common operational queries including camera monitoring, event history, vehicle search, watchlist matching, alert management, and audit investigation.

---

## 11. API Boundary

The backend exposes separate API modules:

```text
/api/auth
/api/cameras
/api/detections
/api/watchlist
/api/alerts
/api/vehicles
/api/camera-health
/api/audit-logs
/ws/alerts
```

This modular boundary allows individual domains to evolve independently.

---

## 12. Real-Time Architecture

### Current Prototype

```text
Detection API
     │
     ▼
Alert Creation
     │
     ▼
WebSocket Manager
     │
     ▼
Connected React Clients
```

### Production-Oriented Extension

```text
Detection Gateway
       │
       ▼
 Redis / Kafka / Event Bus
       │
 ┌─────┼──────────┬─────────────┐
 ▼     ▼          ▼             ▼
Alert  Analytics  Storage     Reporting
Engine Workers    Workers      Workers
 │
 ▼
WebSocket Gateway
 │
 ▼
Operators
```

The current prototype does not require Redis or Kafka for local operation. These components are documented as scaling extensions.

---

## 13. Deployment Architecture

### Current Local Architecture

```text
┌───────────────────────────────┐
│        Developer PC           │
│                               │
│  ┌──────────┐  ┌───────────┐ │
│  │ React    │  │ FastAPI   │ │
│  │ Vite     │──│ Backend   │ │
│  │ :5173    │  │ :8000     │ │
│  └──────────┘  └─────┬─────┘ │
│                      │       │
│                ┌─────▼─────┐ │
│                │PostgreSQL │ │
│                │ :5432     │ │
│                └───────────┘ │
└───────────────────────────────┘
```

### Container Architecture

```text
Docker Compose
│
├── PostgreSQL
├── FastAPI Backend
└── React / Nginx Frontend
```

### Production Extension

```text
                         Internet / Private Network
                                   │
                                   ▼
                          Load Balancer / Gateway
                                   │
             ┌─────────────────────┼─────────────────────┐
             ▼                     ▼                     ▼
        API Cluster           WebSocket Cluster      GIS/API Layer
             │                     │
             └──────────────┬──────┘
                            ▼
                     Event / Queue Layer
                            │
             ┌──────────────┼──────────────┐
             ▼              ▼              ▼
        Analytics       Alert Engine    Storage
        Workers         Workers         Workers
             │              │              │
             └──────────────┼──────────────┘
                            ▼
                     Database / Object
                         Storage
```

---

## 14. Scalability Direction

The prototype is designed so that the following components can scale independently:

- Camera ingestion
- Video/analytics processing
- Detection workers
- Watchlist matching
- Alert processing
- WebSocket delivery
- API servers
- Database read/write workloads
- Evidence/object storage

For a large deployment, the architecture can use:

- Regional edge gateways
- GPU analytics workers
- Redis/Kafka/event buses
- PostgreSQL read replicas
- Time/region partitioning
- Object storage
- Hot/warm/cold retention
- Centralized monitoring
- High availability and disaster recovery

Detailed scalability planning is documented separately in `SCALABILITY.md`.

---

## 15. Security Architecture

```text
Client
  │
  ▼
HTTPS / TLS
  │
  ▼
Authentication
  │
  ▼
JWT Validation
  │
  ▼
RBAC
  │
  ▼
Input Validation
  │
  ▼
Rate Limiting
  │
  ▼
Application APIs
  │
  ├── PostgreSQL
  ├── WebSocket
  └── Audit Logs
```

Security principles:

- Never commit secrets
- Store credentials through environment configuration or secret management
- Restrict privileged operations through RBAC
- Validate external input
- Protect APIs with authentication
- Apply rate limits to sensitive endpoints
- Use HTTPS/TLS in production
- Keep camera credentials outside source code
- Maintain auditable operational actions

---

## 16. Design Principles

### Modular Domains

Authentication, cameras, detections, watchlists, alerts, vehicle search, health, and audit logs are separated into dedicated modules.

### Stateless APIs

The FastAPI layer is designed to remain stateless wherever possible, supporting horizontal scaling.

### Event-Driven Extension

The current synchronous detection workflow can evolve toward queue-based processing without changing the core business workflow.

### Security by Design

Authentication, authorization, validation, rate limiting, environment-based secrets, and audit logging are integrated into the application architecture.

### Prototype-to-Production Path

The prototype intentionally uses simulators while preserving interfaces that can later connect to:

- RTSP
- ONVIF
- Vendor camera APIs
- AI inference services
- Message brokers
- Distributed storage

---

## 17. Architecture Summary

```text
                 CAMERA SOURCES
                       │
                       ▼
              CAMERA / EDGE LAYER
                       │
                       ▼
               ANALYTICS EVENTS
                       │
                       ▼
                 FASTAPI APIs
                       │
          ┌────────────┼────────────┐
          ▼            ▼            ▼
      PostgreSQL    Watchlist    WebSocket
          │            │            │
          │            ▼            │
          │       Alert Engine      │
          │            │            │
          └────────────┼────────────┘
                       ▼
                REACT DASHBOARD
                       │
        ┌──────────────┼──────────────┐
        ▼              ▼              ▼
       GIS        Investigation      Alerts
        │              │              │
        └──────────────┼──────────────┘
                       ▼
                  AUDIT LOGS
```

This architecture provides the functional foundation for a centralized CCTV intelligence platform while leaving clear extension points for production camera integrations, AI inference, distributed event processing, GPU acceleration, regional processing, and large-scale deployment.
