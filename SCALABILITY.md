**# okDriver --- Scalability & Deployment Architecture**

**## 1. Purpose**

This document describes how the current okDriver CCTV Intelligence

prototype can evolve from a local demonstration into a distributed

platform capable of supporting a very large camera fleet, including the

assignment's ~80,000-camera target.

The current prototype demonstrates the functional workflow:

\`\`\` text

Camera Source

     ↓

Detection / Analytics Event

     ↓

FastAPI API

     ↓

PostgreSQL

     ↓

Watchlist Matching

     ↓

Alert Creation

     ↓

WebSocket

     ↓

React Operations Dashboard

\`\`\`

The production architecture separates video ingestion, analytics, event

processing, operational APIs, storage, and real-time delivery so each

layer can scale independently.

**------------------------------------------------------------------------**

**# 2. Current Prototype vs Production Target**

**  -----------------------------------------------------------------------**

  Area                    Current Prototype       Production Direction

**  ----------------------- ----------------------- -----------------------**

  Camera sources          Simulated /             RTSP, ONVIF, vendor

                          representative feeds    SDK/API adapters

  Analytics               Detection event         Distributed GPU

                          interface / simulator   inference workers

  Backend                 FastAPI application     Horizontally scaled

                                                  stateless services

  Database                PostgreSQL              Partitioned

                                                  PostgreSQL + replicas /

                                                  regional data

  Real-time               WebSocket               WebSocket + shared

                                                  event broker

  Queue                   Direct application flow Kafka / Redis Streams /

                                                  RabbitMQ

  GIS                     Leaflet                 Regional/global GIS

                                                  service as required

  Video storage           Prototype/local         Object storage +

                                                  hot/warm/cold tiers

  Deployment              Local / Docker-ready    Regional, multi-zone

                                                  infrastructure

  Monitoring              Application-level       Metrics, logs, traces,

                          health                  alerting

  High availability       Not provisioned locally Multi-instance,

                                                  multi-zone, backup/DR

  -----------------------------------------------------------------------

**------------------------------------------------------------------------**

**# 3. Target Architecture for ~80,000 Cameras**

\`\`\` text

                         ┌───────────────────────────┐

                         │      Central Control      │

                         │                           │

                         │ Users / RBAC / Watchlist  │

                         │ Camera Registry / Config   │

                         │ Global Search / Reporting │

                         └─────────────┬─────────────┘

                                       │

                              API Gateway / LB

                                       │

             ┌─────────────────────────┼─────────────────────────┐

             │                         │                         │

             ▼                         ▼                         ▼

       ┌────────────┐            ┌────────────┐            ┌────────────┐

       │  Region A  │            │  Region B  │            │  Region N  │

       └─────┬──────┘            └─────┬──────┘            └─────┬──────┘

             │                         │                         │

       Edge Gateways             Edge Gateways             Edge Gateways

             │                         │                         │

       Camera Clusters           Camera Clusters           Camera Clusters

             │                         │                         │

       ┌─────┴─────┐             ┌─────┴─────┐             ┌─────┴─────┐

       │ RTSP/ONVIF│             │ RTSP/ONVIF│             │ RTSP/ONVIF│

       │ Adapters  │             │ Adapters  │             │ Adapters  │

       └─────┬─────┘             └─────┬─────┘             └─────┬─────┘

             │                         │                         │

             ▼                         ▼                         ▼

       GPU Analytics             GPU Analytics             GPU Analytics

             │                         │                         │

             └─────────────────────────┼─────────────────────────┘

                                       │

                                       ▼

                              Event / Message Bus

                                       │

             ┌─────────────────────────┼─────────────────────────┐

             │                         │                         │

             ▼                         ▼                         ▼

       Detection Workers        Watchlist / Alert          Storage Workers

                                       │

                                       ▼

                              Real-Time Event Bus

                                       │

                                       ▼

                              WebSocket Gateways

                                       │

                                       ▼

                              Operator Dashboard

\`\`\`

**------------------------------------------------------------------------**

**# 4. Camera Ingestion Layer**

A central system should not require every camera stream to travel

continuously to one central server.

**## Edge Gateway Responsibilities**

Each edge or regional gateway can manage a group of cameras.

Responsibilities:

\-   Maintain camera connections

\-   RTSP ingestion

\-   ONVIF discovery/control where supported

\-   Vendor API/SDK adapters

\-   Camera authentication

\-   Stream health checks

\-   Heartbeats

\-   Local buffering

\-   Frame sampling

\-   Bandwidth optimization

\-   Secure forwarding of analytics metadata

The central platform receives camera metadata and events rather than

unnecessarily transporting every raw frame over the WAN.

**------------------------------------------------------------------------**

**# 5. Protocol Adapter Layer**

The prototype currently uses simulator sources. Production adapters can

be added without changing the dashboard's core data model.

Recommended adapter boundary:

\`\`\` text

Camera

  │

  ├── RTSP Adapter

  ├── ONVIF Adapter

  ├── Vendor SDK Adapter

  └── Vendor REST/API Adapter

          │

          ▼

    Normalized Camera Event

\`\`\`

A normalized internal event format keeps vendor-specific implementations

isolated.

**------------------------------------------------------------------------**

**# 6. Analytics Processing**

Analytics should run independently from the API layer.

Example:

\`\`\` text

Video Stream

     ↓

Frame Sampling

     ↓

GPU Inference Worker

     ↓

Detection

     ↓

Metadata Event

\`\`\`

Possible analytics workloads:

\-   ANPR

\-   Vehicle detection

\-   Vehicle classification

\-   Person detection

\-   Object detection

\-   Re-identification

GPU workers should be independently scalable.

For example, a spike in camera activity should cause analytics workers

to scale without unnecessarily scaling the user-facing API tier.

**------------------------------------------------------------------------**

**# 7. Event Bus**

At large scale, detection processing should become asynchronous.

Recommended pattern:

\`\`\` text

Camera / Edge

      ↓

Event Gateway

      ↓

Kafka / Redis Streams / RabbitMQ

      ↓

 ┌────┼───────────────┬───────────────┐

 ↓    ↓               ↓               ↓

ANPR  Watchlist     Alert          Storage

Jobs  Matching       Engine          Worker

\`\`\`

Benefits:

\-   Handles traffic bursts

\-   Provides backpressure

\-   Enables retries

\-   Decouples services

\-   Allows independent worker scaling

\-   Prevents a temporary downstream failure from immediately taking down

    ingestion

Kafka is particularly suitable for very high event throughput; Redis

Streams or RabbitMQ can be appropriate for smaller deployments or

specific workload requirements.

**------------------------------------------------------------------------**

**# 8. Alert Processing**

The alert engine should remain separate from raw detection ingestion.

\`\`\` text

Detection Event

      ↓

Normalize / Validate

      ↓

Persist Detection

      ↓

Watchlist Lookup

      ↓

Match?

  ┌───┴───┐

  │       │

 No      Yes

  │       │

  ▼       ▼

Done   Create Alert

          ↓

       Deduplicate

          ↓

       Persist Alert

          ↓

      Event Broker

          ↓

    WebSocket Gateway

          ↓

     Operator UI

\`\`\`

**## Alert Deduplication**

At large scale, repeated detections of the same vehicle across

consecutive frames can create excessive alerts.

A production alert engine should support:

\-   Event fingerprints

\-   Time-window deduplication

\-   Camera + identifier + event-type keys

\-   Cooldown windows

\-   Configurable severity rules

\-   Correlation across nearby cameras

This prevents uncontrolled alert generation.

**------------------------------------------------------------------------**

**# 9. Database Architecture**

The current prototype uses PostgreSQL.

At large scale, the database should be divided conceptually into:

**### Operational Metadata**

Examples:

\-   Users

\-   Cameras

\-   Departments

\-   Zones

\-   Watchlists

\-   Current camera health

\-   Alert state

**### High-Volume Event Data**

Examples:

\-   Detections

\-   Analytics events

\-   Vehicle movement events

\-   Historical camera events

High-volume tables should use time-based partitioning and appropriate

composite indexes.

Example:

\`\`\` text

detections

├── detections_2026_09

├── detections_2026_10

├── detections_2026_11

└── ...

\`\`\`

The exact partition strategy should be validated against real event

volume and query patterns.

**------------------------------------------------------------------------**

**# 10. Database Scaling**

Recommended production measures:

\-   Connection pooling

\-   Read replicas

\-   Time-based partitioning

\-   Region-aware data placement

\-   Composite indexes

\-   Query optimization

\-   Archival jobs

\-   Separate analytical workloads from transactional workloads

\-   Backups and point-in-time recovery

Example:

\`\`\` text

                 Application

                      │

                Connection Pool

                      │

              ┌───────┴────────┐

              ▼                ▼

        Primary DB         Read Replicas

              │                │

       Writes / State       Search / Reads

\`\`\`

**------------------------------------------------------------------------**

**# 11. Caching**

Redis can be used for short-lived operational data such as:

\-   Camera status

\-   Active alert counters

\-   Session-related state where appropriate

\-   Frequently requested metadata

\-   Rate limiting

\-   WebSocket fan-out

\-   Temporary correlation state

Caching should not become the authoritative source for permanent

evidence.

PostgreSQL and durable storage remain the source of record.

**------------------------------------------------------------------------**

**# 12. Real-Time WebSocket Scaling**

The current prototype uses a WebSocket endpoint directly from FastAPI.

At scale:

\`\`\` text

             Load Balancer

                  │

        ┌─────────┼─────────┐

        ▼         ▼         ▼

      WS-01     WS-02     WS-N

        │         │         │

        └─────────┼─────────┘

                  ▼

          Shared Event Broker

                  ▲

                  │

            Alert Services

\`\`\`

A shared broker prevents an alert generated on one backend instance from

being invisible to clients connected to another instance.

**------------------------------------------------------------------------**

**# 13. Video Streaming Strategy**

Raw video is the largest bandwidth concern.

A scalable design should distinguish between:

**### Continuous Monitoring**

Use:

\-   Lower-resolution stream

\-   Adaptive bitrate

\-   Near-live stream

\-   Region-local delivery

**### Investigation**

Only when an operator requests evidence:

\-   Retrieve high-resolution stream/clip

\-   Fetch relevant time window

\-   Retrieve from regional/object storage

This avoids centralizing unnecessary high-resolution traffic.

**------------------------------------------------------------------------**

**# 14. Storage Tiers**

**## Hot**

Recent data required for active operations:

\-   Current camera state

\-   Active alerts

\-   Recent detections

\-   Recent evidence

**## Warm**

Investigation history:

\-   Recent video clips

\-   Evidence snapshots

\-   Historical detections

**## Cold**

Long-term retention:

\-   Archived footage

\-   Historical evidence

\-   Compliance records

Object storage is appropriate for large video objects.

**------------------------------------------------------------------------**

**# 15. Camera Health at Scale**

The current prototype evaluates:

\`\`\` text

<= 30 sec       ONLINE

31–90 sec       DEGRADED

\> 90 sec        OFFLINE

Missing         OFFLINE

Inactive        OFFLINE

\`\`\`

At 80,000 cameras, health evaluation should be distributed.

Recommended:

\`\`\` text

Camera

  ↓

Regional Health Gateway

  ↓

Heartbeat Stream

  ↓

Health Workers

  ↓

Regional State Cache

  ↓

Central Health Summary

\`\`\`

This avoids a single central process repeatedly polling every camera.

**------------------------------------------------------------------------**

**# 16. Geographic Distribution**

For a large deployment, cameras should be grouped by:

\-   Region

\-   City

\-   Department

\-   Zone

\-   Network segment

\-   Edge gateway

Example:

\`\`\` text

Central Control

│

├── North Region

│   ├── Gateway 01

│   ├── Gateway 02

│   └── Gateway N

│

├── West Region

│   ├── Gateway 01

│   └── Gateway N

│

└── South Region

    ├── Gateway 01

    └── Gateway N

\`\`\`

Regional isolation also limits the blast radius of a network or

infrastructure failure.

**------------------------------------------------------------------------**

**# 17. High Availability**

Production deployment should avoid single points of failure.

Recommended:

\-   Multiple API instances

\-   Multiple WebSocket instances

\-   Multiple analytics workers

\-   Load balancers

\-   PostgreSQL primary/replica strategy

\-   Multi-zone deployment

\-   Replicated message broker

\-   Replicated object storage

\-   Automated backups

**------------------------------------------------------------------------**

**# 18. Disaster Recovery**

Define business requirements for:

\-   RPO --- acceptable data loss window

\-   RTO --- acceptable recovery time

Recommended controls:

\-   Automated PostgreSQL backups

\-   Point-in-time recovery

\-   Cross-zone or cross-region backups

\-   Object storage replication

\-   Infrastructure-as-code

\-   Tested recovery procedures

\-   Periodic restore drills

**------------------------------------------------------------------------**

**# 19. Security Architecture**

Production traffic should follow:

\`\`\` text

Camera Network

      │

 Private / Segmented Network

      │

 Edge Gateway

      │

 TLS

      │

 API Gateway

      │

 Authentication / RBAC

      │

 Internal Services

\`\`\`

Security controls:

\-   HTTPS/TLS

\-   Network segmentation

\-   Private camera networks

\-   Strong camera credentials

\-   Secret manager

\-   JWT authentication

\-   RBAC

\-   Input validation

\-   API rate limiting

\-   Audit logging

\-   Database access restrictions

\-   Encryption at rest where required

\-   No secrets in Git

Camera stream URLs and credentials should not be exposed to the browser

when they contain sensitive information.

**------------------------------------------------------------------------**

**# 20. Observability**

A production system should expose metrics for:

**### Cameras**

\-   Online/offline/degraded count

\-   Heartbeat delay

\-   Stream failures

**### Analytics**

\-   Frames processed

\-   Events per second

\-   Inference latency

\-   GPU utilization

\-   Worker queue depth

**### API**

\-   Requests per second

\-   P95/P99 latency

\-   Error rate

\-   Authentication failures

**### Alerts**

\-   Alert generation rate

\-   Alert delivery latency

\-   WebSocket connections

\-   Queue lag

**### Infrastructure**

\-   CPU

\-   Memory

\-   Disk

\-   Network

\-   Database connections

\-   Storage growth

Recommended tooling:

\`\`\` text

Prometheus → Metrics

Grafana    → Dashboards

Central Log Platform → Logs

Tracing Platform → Distributed Traces

\`\`\`

**------------------------------------------------------------------------**

**# 21. Cost Controls**

The largest production cost drivers are expected to be:

1.  Video bandwidth

2.  GPU inference

3.  Storage

4.  Network infrastructure

5.  Database/event processing

Cost optimization should therefore focus on:

\-   Edge processing

\-   Metadata-first centralization

\-   Selective high-resolution retrieval

\-   Adaptive bitrate

\-   Efficient frame sampling

\-   GPU worker autoscaling

\-   Storage lifecycle policies

\-   Data retention policies

\-   Regional processing

**------------------------------------------------------------------------**

**# 22. Deployment Model**

**## Development**

\`\`\` text

Developer Machine

├── PostgreSQL

├── FastAPI

└── React/Vite

\`\`\`

**## Containerized Development**

\`\`\` text

Docker Compose

├── PostgreSQL

├── FastAPI

└── React/Nginx

\`\`\`

**## Production**

\`\`\` text

Cloud / Data Center

│

├── Load Balancer

├── API Cluster

├── WebSocket Cluster

├── Event Bus

├── Analytics Worker Cluster

├── PostgreSQL Cluster

├── Redis

├── Object Storage

└── Monitoring

\`\`\`

**------------------------------------------------------------------------**

**# 23. Migration Path from Prototype**

The prototype can evolve incrementally.

**### Phase 1 --- Current**

\-   FastAPI

\-   PostgreSQL

\-   React

\-   WebSocket

\-   Simulator cameras

\-   Detection API

\-   Watchlist

\-   Alerts

**### Phase 2**

\-   RTSP/ONVIF adapters

\-   Redis

\-   Real analytics model

\-   Object storage

\-   Background workers

\-   Centralized monitoring

**### Phase 3**

\-   Regional edge gateways

\-   Kafka / durable event bus

\-   GPU worker pools

\-   Database partitioning

\-   Read replicas

\-   Multi-instance WebSockets

**### Phase 4**

\-   Large regional deployments

\-   Multi-zone HA

\-   Disaster recovery

\-   Cross-region operations

\-   Fleet management

\-   Advanced cross-camera analytics

**------------------------------------------------------------------------**

**# 24. Key Design Principles**

1.  **Do not send every raw video stream to the central control plane.****

2.  ****Process video as close to the source as practical.****

3.  ****Centralize metadata, events, alerts and operational state.****

4.  ****Keep API services stateless for horizontal scaling.****

5.  ****Use asynchronous event processing for high-volume analytics.****

6.  ****Partition high-volume detection data.****

7.  ****Use shared infrastructure for real-time fan-out.****

8.  ****Separate hot operational data from long-term evidence.****

9.  ****Scale GPU analytics independently from API services.****

10.  ****Design regional failure isolation into the platform.****

11. **Treat security, auditability and observability as platform

    requirements.**

12. **Validate capacity assumptions with production telemetry before

    final sizing.**

**------------------------------------------------------------------------**

**# 25. Important Sizing Note**

An 80,000-camera deployment should not be sized only by camera count.

Capacity planning must also consider:

\-   Average and peak FPS

\-   Resolution

\-   Codec

\-   Bitrate

\-   Percentage of streams requiring AI processing

\-   Detection events per second

\-   Retention duration

\-   Number of concurrent operators

\-   Search/query patterns

\-   Regional network capacity

\-   GPU model and inference throughput

Therefore, final production infrastructure numbers should be determined

from measured workload characteristics and load testing rather than

assuming one fixed server count for 80,000 cameras.