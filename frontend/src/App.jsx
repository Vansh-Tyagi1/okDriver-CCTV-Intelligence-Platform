import React, { useEffect, useState } from 'react'
import './App.css'

import Cameras from './cameras'
import VehicleSearch from './VehicleSearch'
import Alerts from './alerts'
import EventHistory from './EventHistory'
import Watchlist from './watchlist'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const API_BASE = 'http://127.0.0.1:8000'


/* =========================================================
   NAVIGATION
========================================================= */

function Navigation({ activePage, setActivePage }) {
  const items = [
    ['dashboard', '▣', 'Dashboard'],
    ['cameras', '◉', 'Cameras'],
    ['live', '⌁', 'Live Monitoring'],
    ['alerts', '⚠', 'Alerts'],
    ['vehicle', '⌕', 'Vehicle Search'],
    ['watchlist', '◇', 'Watchlist'],
    ['events', '◷', 'Event History'],
    ['health', '♥', 'Camera Health'],
    ['settings', '⚙', 'Settings'],
  ]

  return (
    <nav className="sidebar-nav">
      {items.map(([id, icon, label]) => (
        <button
          key={id}
          className={`nav-item ${
            activePage === id ? 'active' : ''
          }`}
          onClick={() => setActivePage(id)}
        >
          <span>{icon}</span>
          {label}
        </button>
      ))}
    </nav>
  )
}


/* =========================================================
   BRAND
========================================================= */

function Brand() {
  return (
    <div className="brand">
      <div className="brand-mark">
        OD
      </div>

      <div className="brand-text">
        <h2>okDriver</h2>
        <span>Intelligence Platform</span>
      </div>
    </div>
  )
}


/* =========================================================
   SIDEBAR
========================================================= */

function Sidebar({
  activePage,
  setActivePage,
}) {
  return (
    <aside className="sidebar">

      <Brand />

      <Navigation
        activePage={activePage}
        setActivePage={setActivePage}
      />

      <div className="sidebar-footer">
        okDriver CCTV Intelligence Platform
        <br />
        Security Operations Center
      </div>

    </aside>
  )
}


/* =========================================================
   TOP BAR
========================================================= */

function TopBar({ user, onLogout }) {
  return (
    <div className="topbar">

      <div>
        <div className="eyebrow">
          SECURITY OPERATIONS CENTER
        </div>

        <h1>
          Command Dashboard
        </h1>
      </div>


      <div className="topbar-actions">

        <div className="live-indicator">
          <span>●</span>
          LIVE
        </div>


        <div className="user-profile">

          <div className="avatar">
            {user?.username
              ?.charAt(0)
              ?.toUpperCase() || 'A'}
          </div>

          <div>
            <strong>
              {user?.username || 'Admin'}
            </strong>

            <small>
              {user?.role || 'Administrator'}
            </small>
          </div>

        </div>


        <button
          className="logout-button"
          onClick={onLogout}
        >
          Logout
        </button>

      </div>

    </div>
  )
}


/* =========================================================
   SYSTEM STATUS
========================================================= */

function SystemStatus({
  websocketConnected,
  alertCount,
}) {
  return (
    <div className="system-status">

      <span>
        Real-time alert channel:{' '}
        <strong
          style={{
            color: websocketConnected
              ? '#4ade80'
              : '#fbbf24',
          }}
        >
          {websocketConnected
            ? 'CONNECTED'
            : 'CONNECTING...'}
        </strong>
      </span>

      <span>
        {alertCount} alerts loaded
      </span>

    </div>
  )
}


/* =========================================================
   CAMERA SCENE
========================================================= */

function CameraScene({ camera }) {
  const isOnline =
    camera.status === 'ONLINE' &&
    camera.is_active !== false

  return (
    <div className="camera-card">

      <div className="camera-preview">

        <div className="simulated-scene">

          <div className="road-line" />

          <div className="parking-lines" />

          {isOnline && (
            <>
              <div className="vehicle-shape" />
              <div className="vehicle-shape second" />
            </>
          )}

          <div className="scene-label">
            {camera.camera_id}
          </div>

        </div>


        {isOnline && (
          <div className="feed-live">
            ● LIVE
          </div>
        )}

      </div>


      <div className="camera-info">

        <strong>
          {camera.name}
        </strong>

        <small>
          {camera.camera_id}
          {' · '}
          {camera.zone || 'Unassigned'}
        </small>

        <div style={{ marginTop: '7px' }}>

          <span
            className="status-dot"
            style={{
              color: isOnline
                ? '#4ade80'
                : '#60a5fa',
            }}
          >
            ● {isOnline
              ? 'Online'
              : 'Offline'}
          </span>

        </div>

      </div>

    </div>
  )
}


/* =========================================================
   DASHBOARD
========================================================= */

function Dashboard({
  cameras,
  cameraHealth,
  alerts,
  setActivePage,
}) {
  const totalCameras = cameras.length

  const healthMap = new Map(
    cameraHealth.map((camera) => [camera.camera_id, camera])
  )

  const dashboardCameras = cameras.map((camera) => {
    const health = healthMap.get(camera.id)

    return {
      ...camera,
      status: health?.status || camera.status,
      is_active:
        health?.is_active ?? camera.is_active,
      last_heartbeat:
        health?.last_heartbeat || camera.last_heartbeat,
    }
  })

  const healthSource =
    cameraHealth.length > 0
      ? cameraHealth
      : dashboardCameras

  const onlineCameras =
    healthSource.filter(
      (camera) =>
        camera.status === 'ONLINE' &&
        camera.is_active !== false
    ).length

  const degradedCameras =
    healthSource.filter(
      (camera) =>
        camera.status === 'DEGRADED' &&
        camera.is_active !== false
    ).length

  const offlineCameras =
    healthSource.filter(
      (camera) =>
        camera.status === 'OFFLINE' ||
        camera.is_active === false
    ).length

  const activeAlerts =
    alerts.filter(
      (alert) =>
        alert.status === 'ACTIVE'
    ).length


  return (
    <>

      {/* STATS */}

      <div className="stats-grid">

        <div className="stat-card">

          <div className="stat-icon">
            ◉
          </div>

          <div>
            <span>Total Cameras</span>

            <strong>
              {totalCameras}
            </strong>

            <small>
              Registered sources
            </small>
          </div>

        </div>


        <div className="stat-card">

          <div className="stat-icon online-icon">
            ✓
          </div>

          <div>
            <span>Online Cameras</span>

            <strong>
              {onlineCameras}
            </strong>

            <small>
              Currently operational
            </small>
          </div>

        </div>


        <div className="stat-card">

          <div className="stat-icon offline-icon">
            ○
          </div>

          <div>
            <span>Offline Cameras</span>

            <strong>
              {offlineCameras}
            </strong>

            <small>
              Require attention
            </small>
          </div>

        </div>


        <div className="stat-card">

          <div className="stat-icon alert-icon">
            !
          </div>

          <div>
            <span>Active Alerts</span>

            <strong>
              {activeAlerts}
            </strong>

            <small>
              Watchlist and AI alerts
            </small>
          </div>

        </div>

      </div>


      {/* MAIN DASHBOARD */}

      <div className="dashboard-grid">

        {/* CAMERA FEEDS */}

        <div className="panel">

          <div className="panel-header">

            <div>
              <div className="panel-label">
                LIVE MONITORING
              </div>

              <h2>
                Camera Feeds
              </h2>
            </div>

            <button
              className="view-button"
              onClick={() =>
                setActivePage('live')
              }
            >
              View All →
            </button>

          </div>


          <div className="camera-grid">

            {cameras.length === 0 ? (
              <div className="camera-loading">
                No cameras registered.
              </div>
            ) : (
              dashboardCameras
                .slice(0, 4)
                .map((camera) => (
                  <CameraScene
                    key={camera.id}
                    camera={camera}
                  />
                ))
            )}

          </div>

        </div>


        {/* RECENT ALERTS */}

        <div className="panel">

          <div className="panel-header">

            <div>
              <div className="panel-label">
                REAL-TIME
              </div>

              <h2>
                Recent Alerts
              </h2>
            </div>

            <div className="alert-count">
              {alerts.length}
            </div>

          </div>


          <div className="health-list">

            {alerts.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">
                  ✓
                </div>

                <strong>
                  No active alerts
                </strong>

                <p>
                  The system is currently
                  operating normally.
                </p>
              </div>
            ) : (
              alerts
                .slice(0, 5)
                .map((alert) => (

                  <div
                    className="health-row"
                    key={alert.id}
                    style={{
                      display: 'block',
                    }}
                  >

                    <div
                      style={{
                        display: 'flex',
                        justifyContent:
                          'space-between',
                        gap: '10px',
                      }}
                    >

                      <strong>
                        {alert.matched_identifier}
                      </strong>

                      <span
                        style={{
                          color:
                            alert.severity ===
                            'HIGH'
                              ? '#fb7185'
                              : '#fbbf24',
                          fontWeight: 800,
                        }}
                      >
                        {alert.severity}
                      </span>

                    </div>


                    <div
                      style={{
                        marginTop: '6px',
                        color: '#8ea0bd',
                        fontSize: '9px',
                        lineHeight: 1.5,
                      }}
                    >
                      {alert.message}
                    </div>


                    <div
                      style={{
                        marginTop: '5px',
                        color: '#607493',
                        fontSize: '8px',
                      }}
                    >
                      {alert.status}
                    </div>

                  </div>

                ))
            )}

          </div>

        </div>

      </div>


      {/* BOTTOM */}

      <div className="bottom-grid">

        <div className="panel">

          <div className="panel-header">

            <div>
              <div className="panel-label">
                SYSTEM HEALTH
              </div>

              <h2>
                Camera Network
              </h2>
            </div>

          </div>


          <div className="health-list">

            <div className="health-row">
              <span>
                Camera Sources
              </span>

              <strong>
                {totalCameras}
              </strong>
            </div>


            <div className="health-row">
              <span>
                Operational
              </span>

              <strong
                style={{
                  color: '#4ade80',
                }}
              >
                {onlineCameras}
              </strong>
            </div>


            <div className="health-row">
              <span>
                Offline
              </span>

              <strong
                style={{
                  color: '#fbbf24',
                }}
              >
                {offlineCameras}
              </strong>
            </div>

          </div>

        </div>


        <div className="panel">

          <div className="panel-header">

            <div>
              <div className="panel-label">
                ALERT PIPELINE
              </div>

              <h2>
                Security Events
              </h2>
            </div>

          </div>


          <div className="health-list">

            <div className="health-row">
              <span>
                Total Alerts
              </span>

              <strong>
                {alerts.length}
              </strong>
            </div>


            <div className="health-row">
              <span>
                Active
              </span>

              <strong
                style={{
                  color: '#fb7185',
                }}
              >
                {
                  alerts.filter(
                    (a) =>
                      a.status ===
                      'ACTIVE'
                  ).length
                }
              </strong>
            </div>


            <div className="health-row">
              <span>
                Resolved
              </span>

              <strong
                style={{
                  color: '#4ade80',
                }}
              >
                {
                  alerts.filter(
                    (a) =>
                      a.status ===
                      'RESOLVED'
                  ).length
                }
              </strong>
            </div>

          </div>

        </div>

      </div>

    </>
  )
}


/* =========================================================
   GIS CAMERA MAP
========================================================= */

function CameraMap({ cameras }) {
  const mapRef = React.useRef(null)
  const mapInstanceRef = React.useRef(null)

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    const map = L.map(mapRef.current, {
      zoomControl: true,
      scrollWheelZoom: true,
    }).setView([28.6469, 77.3150], 12)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map)

    mapInstanceRef.current = map

    return () => {
      map.remove()
      mapInstanceRef.current = null
    }
  }, [])

  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map) return

    if (map._okdriverLayers) {
      map._okdriverLayers.forEach((layer) => layer.remove())
    }

    const layers = []
    const valid = cameras.filter(
      (camera) =>
        Number.isFinite(Number(camera.latitude)) &&
        Number.isFinite(Number(camera.longitude))
    )

    valid.forEach((camera) => {
      const online = camera.status === 'ONLINE' && camera.is_active !== false
      const alerting = camera.has_active_alert === true

      const marker = L.circleMarker(
        [Number(camera.latitude), Number(camera.longitude)],
        {
          radius: 9,
          color: alerting ? '#ef4444' : online ? '#22c55e' : '#60a5fa',
          weight: 3,
          fillColor: alerting ? '#ef4444' : online ? '#22c55e' : '#60a5fa',
          fillOpacity: 0.85,
        }
      ).addTo(map)

      marker.bindPopup(`
        <div style="min-width:180px;font-family:Inter,Arial,sans-serif">
          <strong>${camera.name || camera.camera_id}</strong><br/>
          <span>${camera.camera_id}</span><br/>
          <span>Status: ${online ? 'ONLINE' : 'OFFLINE'}</span><br/>
          <span>Zone: ${camera.zone || 'Unassigned'}</span>
        </div>
      `)

      layers.push(marker)
    })

    if (valid.length > 1) {
      const route = L.polyline(
        valid.map((camera) => [
          Number(camera.latitude),
          Number(camera.longitude),
        ]),
        {
          color: '#2563eb',
          weight: 3,
          opacity: 0.7,
          dashArray: '7 7',
        }
      ).addTo(map)

      layers.push(route)
    }

    map._okdriverLayers = layers

    if (valid.length > 0) {
      const bounds = L.latLngBounds(
        valid.map((camera) => [
          Number(camera.latitude),
          Number(camera.longitude),
        ])
      )
      map.fitBounds(bounds.pad(0.25), { maxZoom: 13 })
    }
  }, [cameras])

  return (
    <div className="panel" style={{ marginTop: 18, overflow: 'hidden' }}>
      <div className="panel-header">
        <div>
          <div className="panel-label">GIS MONITORING</div>
          <h2>Camera Locations & Movement</h2>
        </div>
        <span className="alert-count">{cameras.length}</span>
      </div>

      <div
        ref={mapRef}
        style={{
          width: '100%',
          height: '390px',
          background: '#0d1626',
        }}
      />
    </div>
  )
}


/* =========================================================
   CAMERA HEALTH
========================================================= */

function CameraHealth() {
  const [health, setHealth] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [lastUpdated, setLastUpdated] = useState(null)

  async function loadHealth(showLoader = true) {
    const authToken = localStorage.getItem('access_token')
    if (!authToken) {
      setHealth([])
      setError('Session expired. Please login again.')
      setLoading(false)
      return
    }

    if (showLoader) setLoading(true)
    setError('')

    try {
      // Use the real camera registry as the source of truth.
      // Do not call a non-existent /api/camera-health endpoint.
      const response = await fetch(`${API_BASE}/api/cameras`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('access_token')
          throw new Error('Session expired. Please login again.')
        }
        throw new Error(data.detail || `Unable to load camera health (${response.status})`)
      }

      // Preserve the status already stored by the Camera Registry.
      // Disabled cameras are always shown as OFFLINE.
      const normalized = data.map((camera) => ({
        ...camera,
        status: camera.is_active === false ? 'OFFLINE' : (camera.status || 'OFFLINE').toUpperCase(),
      }))

      setHealth(normalized)
      setLastUpdated(new Date())
    } catch (err) {
      setError(err.message || 'Unable to load camera health.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadHealth(true)

    const interval = setInterval(() => {
      loadHealth(false)
    }, 10000)

    return () => clearInterval(interval)
  }, [])

  const online = health.filter((c) => c.status === 'ONLINE' && c.is_active !== false).length
  const degraded = health.filter((c) => c.status === 'DEGRADED' && c.is_active !== false).length
  const offline = health.filter((c) => c.status === 'OFFLINE' || c.is_active === false).length

  const statusStyle = (status) => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '7px 10px',
    borderRadius: 20,
    fontSize: 9,
    fontWeight: 800,
    background:
      status === 'ONLINE'
        ? 'rgba(34,197,94,.10)'
        : status === 'DEGRADED'
          ? 'rgba(251,191,36,.10)'
          : 'rgba(96,165,250,.10)',
    color:
      status === 'ONLINE'
        ? '#4ade80'
        : status === 'DEGRADED'
          ? '#fbbf24'
          : '#60a5fa',
  })

  return (
    <div>
      <div className="topbar" style={{ position: 'relative', overflow: 'hidden' }}>
        {loading && (
          <div aria-hidden="true" style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 2, background: 'linear-gradient(90deg, transparent, #3b82f6, #60a5fa, transparent)', backgroundSize: '200% 100%', animation: 'healthRefreshProgress 1s linear infinite' }} />
        )}
        <div>
          <div className="eyebrow">CAMERA OPERATIONS</div>
          <h1>Camera Health</h1>
          {lastUpdated && (
            <small style={{ color: '#607493', fontSize: 10 }}>
              Last updated: {lastUpdated.toLocaleTimeString('en-IN')}
            </small>
          )}
        </div>
        <button
          className="view-button"
          type="button"
          onClick={() => loadHealth(true)}
          disabled={loading}
          style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, minWidth: 92, transition: 'all .2s ease', opacity: loading ? 0.85 : 1 }}
        >
          <span style={{ display: 'inline-block', fontSize: 14, lineHeight: 1, animation: loading ? 'healthRefreshSpin .75s linear infinite' : 'none' }}>↻</span>
          {loading ? 'Refreshing' : 'Refresh'}
        </button>
      </div>

      {error && (
        <div className="alerts-error" style={{ marginBottom: 16 }}>
          {error}
        </div>
      )}

      <div className="stats-grid">
        {[
          ['Total Cameras', health.length, ''],
          ['Online', online, '#4ade80'],
          ['Degraded', degraded, '#fbbf24'],
          ['Offline', offline, '#60a5fa'],
        ].map(([label, value, color]) => (
          <div className="stat-card" key={label}>
            <div>
              <span>{label}</span>
              <strong style={color ? { color } : undefined}>{value}</strong>
            </div>
          </div>
        ))}
      </div>

      <div className="panel" style={{ marginTop: 18 }}>
        <div className="panel-header">
          <div>
            <div className="panel-label">HEALTH MONITOR</div>
            <h2>Camera Network Status</h2>
          </div>
          <span className="online-badge"><i></i>AUTO REFRESH · 10s</span>
        </div>

        {loading && health.length === 0 ? (
          <div className="camera-loading">Loading camera health...</div>
        ) : health.length === 0 ? (
          <div className="camera-loading">No cameras registered.</div>
        ) : (
          <div className="health-list">
            {health.map((camera) => (
              <div className="health-row" key={camera.id || camera.camera_id} style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1.2fr 1.4fr auto', gap: 18, alignItems: 'center' }}>
                <div>
                  <strong style={{ display: 'block', color: '#f8fafc' }}>
                    {camera.name || camera.camera_id}
                  </strong>
                  <small style={{ color: '#607493' }}>
                    {camera.camera_id}
                  </small>
                </div>

                <div>
                  <small style={{ display: 'block', color: '#607493' }}>ZONE</small>
                  <span>{camera.zone || 'Unassigned'}</span>
                </div>

                <div>
                  <small style={{ display: 'block', color: '#607493' }}>LOCATION</small>
                  <span>
                    {camera.latitude != null ? Number(camera.latitude).toFixed(4) : '—'}, {' '}
                    {camera.longitude != null ? Number(camera.longitude).toFixed(4) : '—'}
                  </span>
                </div>

                <div>
                  <small style={{ display: 'block', color: '#607493' }}>LAST HEARTBEAT</small>
                  <span style={{ color: '#b8c7da', fontSize: 10 }}>
                    {camera.last_heartbeat
                      ? new Date(camera.last_heartbeat).toLocaleString('en-IN')
                      : 'No heartbeat received'}
                  </span>
                </div>

                <span style={statusStyle(camera.status)}>
                  ● {camera.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}


/* =========================================================
   LIVE MONITORING
========================================================= */

function LiveMonitoring({ cameras }) {
  return (
    <div>

      <div className="topbar">

        <div>
          <div className="eyebrow">
            LIVE VIDEO OPERATIONS
          </div>

          <h1>
            Live Monitoring
          </h1>
        </div>

      </div>


      <div className="panel">

        <div className="panel-header">

          <div>
            <div className="panel-label">
              CAMERA NETWORK
            </div>

            <h2>
              Live Camera Feeds
            </h2>
          </div>

        </div>


        <div
          className="camera-grid"
          style={{
            gridTemplateColumns:
              'repeat(2, minmax(0, 1fr))',
          }}
        >

          {cameras.map((camera) => (
            <CameraScene
              key={camera.id}
              camera={camera}
            />
          ))}

        </div>

      </div>

      <CameraMap cameras={cameras} />

    </div>
  )
}


/* =========================================================
   FEATURE PAGE
========================================================= */

function FeaturePage({
  title,
  label,
  description,
}) {
  return (
    <div>

      <div className="topbar">

        <div>

          <div className="eyebrow">
            {label}
          </div>

          <h1>
            {title}
          </h1>

        </div>

      </div>


      <div className="panel">

        <div className="empty-state">

          <div className="empty-icon">
            ◇
          </div>

          <strong>
            {title}
          </strong>

          <p>
            {description}
          </p>

        </div>

      </div>

    </div>
  )
}


/* =========================================================
   SETTINGS PAGE
========================================================= */

function SettingsPage({
  user,
  token,
  websocketConnected,
}) {
  const [backendStatus, setBackendStatus] = useState('CHECKING')

  useEffect(() => {
    let mounted = true

    async function checkBackend() {
      try {
        const response = await fetch(`${API_BASE}/api/health`, {
          method: 'GET',
          cache: 'no-store',
        })

        if (!mounted) return
        setBackendStatus(response.ok ? 'ONLINE' : 'ERROR')
      } catch {
        if (mounted) setBackendStatus('OFFLINE')
      }
    }

    checkBackend()

    const interval = setInterval(checkBackend, 10000)

    return () => {
      mounted = false
      clearInterval(interval)
    }
  }, [])

  const backendOnline = backendStatus === 'ONLINE'
  const alertsConnected = websocketConnected
  const authActive = Boolean(token)
  const accountActive = user?.is_active !== false

  const settingsStyle = `
    .settings-page {
      width: 100%;
      padding-bottom: 34px;
      animation: settingsPageEnter .28s ease both;
    }

    @keyframes settingsPageEnter {
      from { opacity: 0; transform: translateY(5px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .settings-header {
      min-height: 82px;
      padding: 18px 4px 17px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 18px;
      border-bottom: 1px solid #1d2d46;
    }

    .settings-header h1 {
      margin: 5px 0 6px;
      color: #f8fafc;
      font-size: 28px;
      line-height: 1.05;
      font-weight: 700;
      letter-spacing: -0.7px;
    }

    .settings-header p {
      margin: 0;
      color: #607493;
      font-size: 10px;
    }

    .settings-system-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 8px 10px;
      border: 1px solid rgba(74,222,128,.15);
      border-radius: 7px;
      background: rgba(74,222,128,.04);
      color: #7187a5;
      font-size: 8px;
      font-weight: 800;
      letter-spacing: .8px;
      white-space: nowrap;
    }

    .settings-system-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #4ade80;
      box-shadow: 0 0 9px rgba(74,222,128,.38);
    }

    .settings-status-grid {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 12px;
      margin-top: 16px;
    }

    .settings-status-card {
      min-height: 128px;
      padding: 16px 17px;
      position: relative;
      overflow: hidden;
      border: 1px solid #263a58;
      border-radius: 9px;
      background: linear-gradient(145deg, #121e32, #101a2c);
      box-shadow: 0 8px 24px rgba(0,0,0,.09);
      transition: transform .18s ease, border-color .18s ease, box-shadow .18s ease;
    }

    .settings-status-card:hover {
      transform: translateY(-2px);
      border-color: #385274;
      box-shadow: 0 12px 28px rgba(0,0,0,.15);
    }

    .settings-status-card::after {
      content: "";
      position: absolute;
      width: 120px;
      height: 120px;
      right: -48px;
      bottom: -62px;
      border-radius: 50%;
      background: rgba(59,130,246,.035);
      pointer-events: none;
    }

    .settings-card-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
    }

    .settings-card-label {
      color: #7891b1;
      font-size: 8px;
      line-height: 1.3;
      font-weight: 800;
      letter-spacing: .85px;
    }

    .settings-card-dot {
      width: 6px;
      height: 6px;
      flex: 0 0 6px;
      border-radius: 50%;
    }

    .settings-card-value {
      display: block;
      margin-top: 17px;
      color: #f8fafc;
      font-size: 23px;
      line-height: 1;
      font-weight: 800;
      letter-spacing: -.45px;
    }

    .settings-card-description {
      display: block;
      margin-top: 10px;
      max-width: 180px;
      color: #536986;
      font-size: 9px;
      line-height: 1.4;
    }

    .settings-green { color: #4ade80 !important; }
    .settings-yellow { color: #fbbf24 !important; }
    .settings-red { color: #fb7185 !important; }

    .settings-dot-green {
      background: #4ade80;
      box-shadow: 0 0 8px rgba(74,222,128,.35);
    }

    .settings-dot-yellow {
      background: #fbbf24;
      box-shadow: 0 0 8px rgba(251,191,36,.3);
    }

    .settings-dot-red {
      background: #fb7185;
      box-shadow: 0 0 8px rgba(251,113,133,.3);
    }

    .settings-version {
      color: #60a5fa;
      font-size: 9px;
      font-weight: 800;
    }

    .settings-panel {
      margin-top: 14px;
      overflow: hidden;
      border: 1px solid #263a58;
      border-radius: 9px;
      background: #111c2f;
      box-shadow: 0 8px 25px rgba(0,0,0,.08);
    }

    .settings-panel-header {
      min-height: 72px;
      padding: 15px 17px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 15px;
      border-bottom: 1px solid #243650;
      background: linear-gradient(90deg, rgba(18,31,50,.96), rgba(15,26,43,.78));
    }

    .settings-section-label {
      display: block;
      margin-bottom: 5px;
      color: #5d8bc8;
      font-size: 8px;
      font-weight: 800;
      letter-spacing: 1px;
    }

    .settings-panel-header h2 {
      margin: 0;
      color: #f8fafc;
      font-size: 15px;
      font-weight: 700;
    }

    .settings-panel-header p {
      margin: 5px 0 0;
      color: #536986;
      font-size: 9px;
    }

    .settings-secure-badge {
      padding: 6px 9px;
      border: 1px solid rgba(74,222,128,.15);
      border-radius: 5px;
      background: rgba(74,222,128,.05);
      color: #4ade80;
      font-size: 8px;
      font-weight: 800;
      letter-spacing: .7px;
      white-space: nowrap;
    }

    .settings-info-list {
      padding: 0 17px;
    }

    .settings-info-row {
      min-height: 60px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 20px;
      border-bottom: 1px solid #202f47;
    }

    .settings-info-row:last-child {
      border-bottom: 0;
    }

    .settings-info-label {
      min-width: 0;
    }

    .settings-info-label strong {
      display: block;
      color: #aebdd1;
      font-size: 10px;
      font-weight: 600;
    }

    .settings-info-label small {
      display: block;
      margin-top: 4px;
      color: #506783;
      font-size: 8px;
    }

    .settings-info-value {
      color: #e7eef8;
      font-size: 10px;
      font-weight: 700;
      text-align: right;
      word-break: break-word;
    }

    .settings-blue { color: #60a5fa !important; }

    .settings-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 9px;
      border-radius: 20px;
      font-size: 8px;
      font-weight: 800;
      letter-spacing: .4px;
      white-space: nowrap;
    }

    .settings-pill-green {
      color: #4ade80;
      border: 1px solid rgba(74,222,128,.16);
      background: rgba(74,222,128,.07);
    }

    .settings-pill-red {
      color: #fb7185;
      border: 1px solid rgba(251,113,133,.16);
      background: rgba(251,113,133,.07);
    }

    .settings-security-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 1px;
      background: #202f47;
    }

    .settings-security-item {
      min-height: 74px;
      padding: 14px 16px;
      display: grid;
      grid-template-columns: 29px minmax(0,1fr) auto;
      align-items: center;
      gap: 10px;
      background: #111c2f;
    }

    .settings-security-icon {
      width: 28px;
      height: 28px;
      display: grid;
      place-items: center;
      border: 1px solid rgba(74,222,128,.14);
      border-radius: 7px;
      background: rgba(74,222,128,.05);
      color: #4ade80;
      font-size: 10px;
      font-weight: 800;
    }

    .settings-security-copy strong {
      display: block;
      color: #dce6f4;
      font-size: 10px;
    }

    .settings-security-copy span {
      display: block;
      margin-top: 4px;
      color: #536986;
      font-size: 8px;
    }

    .settings-security-state {
      color: #4ade80;
      font-size: 8px;
      font-weight: 800;
      letter-spacing: .4px;
      white-space: nowrap;
    }

    .settings-security-warning {
      color: #fbbf24 !important;
    }

    @media (max-width: 1050px) {
      .settings-status-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
    }

    @media (max-width: 700px) {
      .settings-header {
        align-items: flex-start;
        flex-direction: column;
      }

      .settings-status-grid {
        grid-template-columns: 1fr;
      }

      .settings-security-grid {
        grid-template-columns: 1fr;
      }

      .settings-info-row {
        align-items: flex-start;
        flex-direction: column;
        justify-content: center;
        gap: 7px;
        padding: 12px 0;
      }

      .settings-info-value {
        text-align: left;
      }
    }
  `

  useEffect(() => {
    const styleId = 'okdriver-settings-style'

    if (!document.getElementById(styleId)) {
      const styleTag = document.createElement('style')
      styleTag.id = styleId
      styleTag.textContent = settingsStyle
      document.head.appendChild(styleTag)
    }
  }, [])

  return (
    <div className="settings-page">

      <div className="settings-header">
        <div>
          <div className="eyebrow">SYSTEM CONFIGURATION</div>
          <h1>Settings</h1>
          <p>
            Platform configuration, account and security information.
          </p>
        </div>

        <div className="settings-system-badge">
          <span className="settings-system-dot" />
          SYSTEM STATUS
        </div>
      </div>

      <section className="settings-status-grid">

        <div className="settings-status-card">
          <div className="settings-card-top">
            <span className="settings-card-label">BACKEND API</span>
            <span
              className={`settings-card-dot ${
                backendOnline
                  ? 'settings-dot-green'
                  : backendStatus === 'CHECKING'
                    ? 'settings-dot-yellow'
                    : 'settings-dot-red'
              }`}
            />
          </div>

          <strong
            className={`settings-card-value ${
              backendOnline
                ? 'settings-green'
                : backendStatus === 'CHECKING'
                  ? 'settings-yellow'
                  : 'settings-red'
            }`}
          >
            {backendStatus}
          </strong>

          <span className="settings-card-description">
            FastAPI service
          </span>
        </div>

        <div className="settings-status-card">
          <div className="settings-card-top">
            <span className="settings-card-label">REAL-TIME ALERTS</span>
            <span
              className={`settings-card-dot ${
                alertsConnected
                  ? 'settings-dot-green'
                  : 'settings-dot-yellow'
              }`}
            />
          </div>

          <strong
            className={`settings-card-value ${
              alertsConnected
                ? 'settings-green'
                : 'settings-yellow'
            }`}
          >
            {alertsConnected ? 'CONNECTED' : 'CONNECTING'}
          </strong>

          <span className="settings-card-description">
            WebSocket channel
          </span>
        </div>

        <div className="settings-status-card">
          <div className="settings-card-top">
            <span className="settings-card-label">AUTHENTICATION</span>
            <span
              className={`settings-card-dot ${
                authActive
                  ? 'settings-dot-green'
                  : 'settings-dot-red'
              }`}
            />
          </div>

          <strong
            className={`settings-card-value ${
              authActive
                ? 'settings-green'
                : 'settings-red'
            }`}
          >
            {authActive ? 'ACTIVE' : 'EXPIRED'}
          </strong>

          <span className="settings-card-description">
            JWT session
          </span>
        </div>

        <div className="settings-status-card">
          <div className="settings-card-top">
            <span className="settings-card-label">PLATFORM</span>
            <span className="settings-version">v1.0</span>
          </div>

          <strong className="settings-card-value">
            okDriver
          </strong>

          <span className="settings-card-description">
            CCTV Intelligence Platform
          </span>
        </div>

      </section>

      <section className="settings-panel">
        <div className="settings-panel-header">
          <div>
            <span className="settings-section-label">ACCOUNT</span>
            <h2>Current User</h2>
            <p>Authenticated account information.</p>
          </div>
        </div>

        <div className="settings-info-list">

          <div className="settings-info-row">
            <div className="settings-info-label">
              <strong>Username</strong>
              <small>Account identifier</small>
            </div>
            <strong className="settings-info-value">
              {user?.username || '—'}
            </strong>
          </div>

          <div className="settings-info-row">
            <div className="settings-info-label">
              <strong>Email</strong>
              <small>Registered account email</small>
            </div>
            <strong className="settings-info-value">
              {user?.email || '—'}
            </strong>
          </div>

          <div className="settings-info-row">
            <div className="settings-info-label">
              <strong>Role</strong>
              <small>Access permission level</small>
            </div>
            <strong className="settings-info-value settings-blue">
              {user?.role || '—'}
            </strong>
          </div>

          <div className="settings-info-row">
            <div className="settings-info-label">
              <strong>Account Status</strong>
              <small>Current account availability</small>
            </div>

            <span
              className={`settings-pill ${
                accountActive
                  ? 'settings-pill-green'
                  : 'settings-pill-red'
              }`}
            >
              <span>●</span>
              {accountActive ? 'ACTIVE' : 'INACTIVE'}
            </span>
          </div>

        </div>
      </section>

      <section className="settings-panel">
        <div className="settings-panel-header">
          <div>
            <span className="settings-section-label">SECURITY</span>
            <h2>Security Configuration</h2>
            <p>Authentication and platform security controls.</p>
          </div>

          <span className="settings-secure-badge">SECURE</span>
        </div>

        <div className="settings-security-grid">

          <div className="settings-security-item">
            <div className="settings-security-icon">✓</div>
            <div className="settings-security-copy">
              <strong>Authentication</strong>
              <span>JWT Bearer</span>
            </div>
            <b className="settings-security-state">ENABLED</b>
          </div>

          <div className="settings-security-item">
            <div className="settings-security-icon">✓</div>
            <div className="settings-security-copy">
              <strong>Role Based Access</strong>
              <span>Permission control</span>
            </div>
            <b className="settings-security-state">ENABLED</b>
          </div>

          <div className="settings-security-item">
            <div className="settings-security-icon">✓</div>
            <div className="settings-security-copy">
              <strong>Audit Logging</strong>
              <span>Activity tracking</span>
            </div>
            <b className="settings-security-state">ENABLED</b>
          </div>

          <div className="settings-security-item">
            <div className="settings-security-icon">●</div>
            <div className="settings-security-copy">
              <strong>API Session</strong>
              <span>Current authentication</span>
            </div>
            <b
              className={`settings-security-state ${
                authActive ? '' : 'settings-security-warning'
              }`}
            >
              {authActive ? 'AUTHENTICATED' : 'UNAUTHENTICATED'}
            </b>
          </div>

        </div>
      </section>

      <section className="settings-panel">
        <div className="settings-panel-header">
          <div>
            <span className="settings-section-label">PLATFORM</span>
            <h2>System Information</h2>
            <p>Current application architecture and services.</p>
          </div>
        </div>

        <div className="settings-info-list">

          <div className="settings-info-row">
            <div className="settings-info-label">
              <strong>Application</strong>
              <small>Platform name</small>
            </div>
            <strong className="settings-info-value">
              okDriver CCTV Intelligence Platform
            </strong>
          </div>

          <div className="settings-info-row">
            <div className="settings-info-label">
              <strong>Backend</strong>
              <small>Application framework</small>
            </div>
            <strong className="settings-info-value">
              FastAPI + Python
            </strong>
          </div>

          <div className="settings-info-row">
            <div className="settings-info-label">
              <strong>Database</strong>
              <small>Primary data store</small>
            </div>
            <strong className="settings-info-value">
              PostgreSQL
            </strong>
          </div>

          <div className="settings-info-row">
            <div className="settings-info-label">
              <strong>Real-time Transport</strong>
              <small>Live event communication</small>
            </div>
            <strong className="settings-info-value">
              WebSocket
            </strong>
          </div>

        </div>
      </section>

    </div>
  )
}


/* =========================================================
   MAIN APP
========================================================= */


const healthRefreshStyle = `
@keyframes healthRefreshSpin { to { transform: rotate(360deg); } }
@keyframes healthRefreshProgress {
  0% { background-position: 100% 0; opacity: .25; }
  50% { opacity: 1; }
  100% { background-position: -100% 0; opacity: .25; }
}`
if (typeof document !== 'undefined' && !document.getElementById('okdriver-health-refresh-style')) {
  const styleTag = document.createElement('style')
  styleTag.id = 'okdriver-health-refresh-style'
  styleTag.textContent = healthRefreshStyle
  document.head.appendChild(styleTag)
}

export default function App() {

  const [token, setToken] = useState(
    localStorage.getItem(
      'access_token'
    )
  )

  const [user, setUser] = useState(null)

  const [activePage, setActivePage] =
    useState('dashboard')

  const [cameras, setCameras] =
    useState([])

  const [cameraHealth, setCameraHealth] =
    useState([])

  const [alerts, setAlerts] =
    useState([])

  const [websocketConnected, setWebsocketConnected] =
    useState(false)

  const [loginData, setLoginData] =
    useState({
      username: 'admin',
      password: '',
    })

  const [loginError, setLoginError] =
    useState('')

  const [loginLoading, setLoginLoading] =
    useState(false)


  /* =======================================================
     USER
  ======================================================= */

  useEffect(() => {

    if (!token) {
      return
    }

    fetch(
      `${API_BASE}/api/auth/me`,
      {
        headers: {
          Authorization:
            `Bearer ${token}`,
        },
      }
    )
      .then(async (response) => {

        if (!response.ok) {
          throw new Error(
            'Session expired'
          )
        }

        return response.json()
      })
      .then((data) => {
        setUser(data)
      })
      .catch(() => {

        localStorage.removeItem(
          'access_token'
        )

        setToken(null)
        setUser(null)

      })

  }, [token])


  /* =======================================================
     CAMERAS
  ======================================================= */

  useEffect(() => {

    if (!token) {
      return
    }

    async function loadCameras() {

      try {

        const response =
          await fetch(
            `${API_BASE}/api/cameras`,
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          )

        if (!response.ok) {
          return
        }

        const data =
          await response.json()

        setCameras(data)

      } catch {
        // Keep dashboard running.
      }
    }

    loadCameras()

    const interval =
      setInterval(
        loadCameras,
        10000
      )

    return () =>
      clearInterval(interval)

  }, [token])


  /* =======================================================
     CAMERA HEALTH
  ======================================================= */

  useEffect(() => {

    if (!token) {
      return
    }

    async function loadCameraHealth() {

      try {

        const response =
          await fetch(
            `${API_BASE}/api/camera-health`,
            {
              method: 'GET',
              headers: {
                Authorization:
                  `Bearer ${token}`,
                'Content-Type':
                  'application/json',
              },
              cache: 'no-store',
            }
          )

        if (!response.ok) {
          return
        }

        const data =
          await response.json()

        setCameraHealth(data)

      } catch {
        // Keep existing dashboard data.
      }
    }

    loadCameraHealth()

    const interval =
      setInterval(
        loadCameraHealth,
        10000
      )

    return () =>
      clearInterval(interval)

  }, [token])


  /* =======================================================
     ALERTS
  ======================================================= */

  useEffect(() => {

    if (!token) {
      return
    }

    async function loadAlerts() {

      try {

        const response =
          await fetch(
            `${API_BASE}/api/alerts`,
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          )

        if (!response.ok) {
          return
        }

        const data =
          await response.json()

        setAlerts(data)

      } catch {
        // Keep existing alerts.
      }
    }

    loadAlerts()

    const interval =
      setInterval(
        loadAlerts,
        5000
      )

    return () =>
      clearInterval(interval)

  }, [token])


  /* =======================================================
     WEBSOCKET
  ======================================================= */

  useEffect(() => {

    if (!token) {
      return
    }

    let socket
    let reconnectTimer

    function connectWebSocket() {

      try {

        socket =
          new WebSocket(
            'ws://127.0.0.1:8000/ws/alerts'
          )


        socket.onopen = () => {
          setWebsocketConnected(true)
        }


        socket.onmessage = (event) => {

          try {

            const incoming =
              JSON.parse(event.data)

            if (
              incoming.type ===
              'alert'
            ) {

              setAlerts(
                (currentAlerts) => [
                  incoming.alert ||
                    incoming,
                  ...currentAlerts,
                ]
              )

            }

          } catch {
            // Ignore invalid messages.
          }

        }


        socket.onclose = () => {

          setWebsocketConnected(false)

          reconnectTimer =
            setTimeout(
              connectWebSocket,
              3000
            )

        }


        socket.onerror = () => {
          setWebsocketConnected(false)
        }

      } catch {
        setWebsocketConnected(false)
      }

    }

    connectWebSocket()

    return () => {

      clearTimeout(
        reconnectTimer
      )

      if (socket) {
        socket.close()
      }

    }

  }, [token])


  /* =======================================================
     LOGIN
  ======================================================= */

  async function handleLogin(event) {

    event.preventDefault()

    setLoginLoading(true)
    setLoginError('')

    try {

      const response =
        await fetch(
          `${API_BASE}/api/auth/login`,
          {
            method: 'POST',

            headers: {
              'Content-Type':
                'application/json',
            },

            body: JSON.stringify(
              loginData
            ),
          }
        )

      const data =
        await response.json()

      if (!response.ok) {
        throw new Error(
          data.detail ||
          'Invalid username or password.'
        )
      }

      localStorage.setItem(
        'access_token',
        data.access_token
      )

      setToken(
        data.access_token
      )

    } catch (error) {

      setLoginError(
        error.message
      )

    } finally {

      setLoginLoading(false)

    }

  }


  /* =======================================================
     LOGOUT
  ======================================================= */

  function handleLogout() {

    localStorage.removeItem(
      'access_token'
    )

    setToken(null)
    setUser(null)
    setAlerts([])
    setCameras([])
    setActivePage('dashboard')

  }


  /* =======================================================
     LOGIN SCREEN
  ======================================================= */

  if (!token) {

    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0b1220',
          padding: '20px',
        }}
      >

        <form
          onSubmit={handleLogin}
          style={{
            width: '100%',
            maxWidth: '390px',
            padding: '30px',
            borderRadius: '12px',
            background: '#121c2e',
            border:
              '1px solid #263650',
          }}
        >

          <div
            style={{
              width: '42px',
              height: '42px',
              display: 'grid',
              placeItems: 'center',
              borderRadius: '10px',
              background: '#2563eb',
              color: '#fff',
              fontWeight: 800,
              marginBottom: '18px',
            }}
          >
            OD
          </div>


          <div className="eyebrow">
            SECURITY OPERATIONS CENTER
          </div>

          <h1
            style={{
              color: '#f8fafc',
              margin:
                '7px 0 5px',
            }}
          >
            okDriver
          </h1>

          <p
            style={{
              color: '#8293ad',
              fontSize: '11px',
              marginBottom:
                '24px',
            }}
          >
            CCTV Intelligence Platform
          </p>


          {loginError && (
            <div className="alerts-error">
              {loginError}
            </div>
          )}


          <label
            style={{
              display: 'block',
              color: '#8ea0bd',
              fontSize: '10px',
              marginBottom: '7px',
            }}
          >
            Username
          </label>

          <input
            value={loginData.username}
            onChange={(event) =>
              setLoginData({
                ...loginData,
                username:
                  event.target.value,
              })
            }
            style={{
              width: '100%',
              height: '42px',
              padding: '0 12px',
              marginBottom: '14px',
              borderRadius: '7px',
              border:
                '1px solid #30415e',
              background: '#0d1626',
              color: '#f8fafc',
              outline: 'none',
            }}
          />


          <label
            style={{
              display: 'block',
              color: '#8ea0bd',
              fontSize: '10px',
              marginBottom: '7px',
            }}
          >
            Password
          </label>

          <input
            type="password"
            value={loginData.password}
            onChange={(event) =>
              setLoginData({
                ...loginData,
                password:
                  event.target.value,
              })
            }
            style={{
              width: '100%',
              height: '42px',
              padding: '0 12px',
              marginBottom: '18px',
              borderRadius: '7px',
              border:
                '1px solid #30415e',
              background: '#0d1626',
              color: '#f8fafc',
              outline: 'none',
            }}
          />


          <button
            type="submit"
            disabled={loginLoading}
            style={{
              width: '100%',
              height: '42px',
              border: 0,
              borderRadius: '7px',
              background: '#2563eb',
              color: '#fff',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            {loginLoading
              ? 'Signing in...'
              : 'Sign In'}
          </button>

        </form>

      </div>
    )
  }


  /* =======================================================
     PAGE ROUTING
  ======================================================= */

  function renderPage() {

    if (activePage === 'cameras') {
      return <Cameras />
    }


    if (activePage === 'live') {
      return (
        <LiveMonitoring
          cameras={cameras}
        />
      )
    }


    if (activePage === 'alerts') {
      return <Alerts />
    }


    if (activePage === 'vehicle') {
      return <VehicleSearch />
    }


    if (activePage === 'events') {
      return <EventHistory />
    }


    if (activePage === 'health') {
      return <CameraHealth />
    }


    if (activePage === 'watchlist') {
      return <Watchlist />
    }


    if (activePage === 'settings') {
      return (
        <SettingsPage
          user={user}
          token={token}
          websocketConnected={websocketConnected}
        />
      )
    }


    return (
      <Dashboard
        cameras={cameras}
        cameraHealth={cameraHealth}
        alerts={alerts}
        setActivePage={
          setActivePage
        }
      />
    )
  }


  /* =======================================================
     APP LAYOUT
  ======================================================= */

  return (
    <div className="app-shell">

      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
      />


      <main className="main-content">

        <TopBar
          user={user}
          onLogout={handleLogout}
        />


        <SystemStatus
          websocketConnected={
            websocketConnected
          }
          alertCount={
            alerts.length
          }
        />


        {renderPage()}

      </main>

    </div>
  )
}