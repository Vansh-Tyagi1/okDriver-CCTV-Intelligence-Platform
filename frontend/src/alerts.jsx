import { useEffect, useMemo, useState } from 'react'

const API_BASE = 'http://127.0.0.1:8000'
const WS_BASE = API_BASE.replace(/^http/, 'ws')

export default function Alerts() {
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(null)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('ALL')
  const [wsConnected, setWsConnected] = useState(false)

  async function loadAlerts() {
    const token = localStorage.getItem('access_token')

    if (!token) {
      setError('Authentication session not found.')
      setLoading(false)
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch(
        `${API_BASE}/api/alerts`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.detail || 'Unable to load alerts.'
        )
      }

      setAlerts(data)
    } catch (err) {
      setError(err.message || 'Unable to load alerts.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAlerts()

    // --------------------------------------------------
    // FALLBACK POLLING
    // --------------------------------------------------

    const interval = setInterval(() => {
      loadAlerts()
    }, 5000)

    // --------------------------------------------------
    // REAL-TIME WEBSOCKET
    // --------------------------------------------------

    let websocket = null
    let reconnectTimer = null
    let isUnmounted = false

    function connectWebSocket() {
      if (isUnmounted) {
        return
      }

      try {
        websocket = new WebSocket(
          `${WS_BASE}/ws/alerts`
        )

        websocket.onopen = () => {
          console.log(
            '[WebSocket] Connected to alert stream'
          )

          setWsConnected(true)
        }

        websocket.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data)

            console.log(
              '[WebSocket] Message received:',
              message
            )

            if (
              message.type === 'WATCHLIST_ALERT' &&
              message.alert
            ) {
              const incomingAlert = message.alert

              setAlerts((currentAlerts) => {
                const existingAlertIndex =
                  currentAlerts.findIndex(
                    (alert) =>
                      alert.id === incomingAlert.id
                  )

                // --------------------------------------------------
                // DUPLICATE PROTECTION
                // --------------------------------------------------

                if (existingAlertIndex !== -1) {
                  return currentAlerts.map(
                    (alert, index) =>
                      index === existingAlertIndex
                        ? incomingAlert
                        : alert
                  )
                }

                // --------------------------------------------------
                // NEW REAL-TIME ALERT
                // --------------------------------------------------

                return [
                  incomingAlert,
                  ...currentAlerts,
                ]
              })
            }
          } catch (err) {
            console.error(
              '[WebSocket] Invalid message:',
              err
            )
          }
        }

        websocket.onerror = (error) => {
          console.error(
            '[WebSocket] Connection error:',
            error
          )

          setWsConnected(false)
        }

        websocket.onclose = () => {
          console.log(
            '[WebSocket] Alert stream disconnected'
          )

          setWsConnected(false)

          // --------------------------------------------------
          // AUTOMATIC RECONNECT
          // --------------------------------------------------

          if (!isUnmounted) {
            reconnectTimer = setTimeout(() => {
              console.log(
                '[WebSocket] Attempting reconnect...'
              )

              connectWebSocket()
            }, 3000)
          }
        }
      } catch (err) {
        console.error(
          '[WebSocket] Unable to connect:',
          err
        )

        setWsConnected(false)
      }
    }

    connectWebSocket()

    return () => {
      isUnmounted = true

      clearInterval(interval)

      if (reconnectTimer) {
        clearTimeout(reconnectTimer)
      }

      if (websocket) {
        websocket.close()
      }
    }
  }, [])

  async function updateAlert(alertId, action) {
    const token = localStorage.getItem('access_token')

    if (!token) {
      setError('Authentication session not found.')
      return
    }

    setActionLoading(`${alertId}-${action}`)
    setError('')

    try {
      const response = await fetch(
        `${API_BASE}/api/alerts/${alertId}/${action}`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.detail || 'Unable to update alert.'
        )
      }

      setAlerts((currentAlerts) =>
        currentAlerts.map((alert) =>
          alert.id === alertId
            ? data
            : alert
        )
      )
    } catch (err) {
      setError(
        err.message || 'Unable to update alert.'
      )
    } finally {
      setActionLoading(null)
    }
  }

  function formatDateTime(value) {
    if (!value) {
      return 'Unknown time'
    }

    return new Date(value).toLocaleString(
      'en-IN',
      {
        dateStyle: 'medium',
        timeStyle: 'short',
      }
    )
  }

  const filteredAlerts = useMemo(() => {
    if (filter === 'ALL') {
      return alerts
    }

    return alerts.filter(
      (alert) => alert.status === filter
    )
  }, [alerts, filter])

  const activeCount = alerts.filter(
    (alert) => alert.status === 'ACTIVE'
  ).length

  const acknowledgedCount = alerts.filter(
    (alert) => alert.status === 'ACKNOWLEDGED'
  ).length

  const resolvedCount = alerts.filter(
    (alert) => alert.status === 'RESOLVED'
  ).length

  return (
    <div className="alerts-page">

      {/* HEADER */}

      <div className="alerts-page-header">

        <div>
          <div className="alerts-page-label">
            SECURITY OPERATIONS
          </div>

          <h1>
            Alert Management
          </h1>

          <p>
            Monitor, acknowledge and resolve
            real-time security alerts.
          </p>
        </div>

        <button
          className="alerts-refresh-button"
          onClick={loadAlerts}
          disabled={loading}
        >
          ↻ Refresh
        </button>

      </div>


      {/* ERROR */}

      {error && (
        <div className="alerts-error">
          <strong>!</strong>
          {error}
        </div>
      )}


      {/* STATISTICS */}

      <div className="alerts-stats">

        <button
          className={`alert-stat ${
            filter === 'ALL'
              ? 'active'
              : ''
          }`}
          onClick={() => setFilter('ALL')}
        >
          <span>
            Total Alerts
          </span>

          <strong>
            {alerts.length}
          </strong>
        </button>


        <button
          className={`alert-stat active-stat ${
            filter === 'ACTIVE'
              ? 'active'
              : ''
          }`}
          onClick={() => setFilter('ACTIVE')}
        >
          <span>
            Active
          </span>

          <strong>
            {activeCount}
          </strong>
        </button>


        <button
          className={`alert-stat acknowledged-stat ${
            filter === 'ACKNOWLEDGED'
              ? 'active'
              : ''
          }`}
          onClick={() =>
            setFilter('ACKNOWLEDGED')
          }
        >
          <span>
            Acknowledged
          </span>

          <strong>
            {acknowledgedCount}
          </strong>
        </button>


        <button
          className={`alert-stat resolved-stat ${
            filter === 'RESOLVED'
              ? 'active'
              : ''
          }`}
          onClick={() =>
            setFilter('RESOLVED')
          }
        >
          <span>
            Resolved
          </span>

          <strong>
            {resolvedCount}
          </strong>
        </button>

      </div>


      {/* ALERT LIST */}

      <div className="alerts-panel">

        <div className="alerts-panel-header">

          <div>
            <div className="alerts-section-label">
              REAL-TIME ALERTS
            </div>

            <h2>
              Security Events
            </h2>
          </div>

          <div className="alerts-live-status">
            <span
              className={
                wsConnected
                  ? 'ws-connected'
                  : 'ws-disconnected'
              }
            />

            {wsConnected
              ? 'LIVE'
              : 'RECONNECTING'}
          </div>

        </div>


        {loading && alerts.length === 0 ? (
          <div className="alerts-loading">
            Loading alerts...
          </div>
        ) : filteredAlerts.length === 0 ? (
          <div className="alerts-empty">

            <div className="alerts-empty-icon">
              ✓
            </div>

            <h3>
              No alerts found
            </h3>

            <p>
              There are no alerts matching
              the selected status.
            </p>

          </div>
        ) : (

          <div className="alerts-list">

            {filteredAlerts.map((alert) => (

              <div
                className={`alert-item ${
                  alert.status.toLowerCase()
                }`}
                key={alert.id}
              >

                {/* ALERT ICON */}

                <div
                  className={`alert-severity-icon ${
                    alert.severity.toLowerCase()
                  }`}
                >
                  !
                </div>


                {/* CONTENT */}

                <div className="alert-content">

                  <div className="alert-top-row">

                    <div>

                      <div className="alert-vehicle">
                        {alert.matched_identifier}
                      </div>

                      <div className="alert-meta">
                        Alert #{alert.id}
                        {' · '}
                        Camera #{alert.camera_id}
                      </div>

                    </div>


                    <div className="alert-badges">

                      <span
                        className={`alert-severity-badge ${
                          alert.severity.toLowerCase()
                        }`}
                      >
                        {alert.severity}
                      </span>

                      <span
                        className={`alert-status-badge ${
                          alert.status.toLowerCase()
                        }`}
                      >
                        {alert.status}
                      </span>

                    </div>

                  </div>


                  {/* MESSAGE */}

                  <div className="alert-message">
                    {alert.message ||
                      'Security event detected.'}
                  </div>


                  {/* DETAILS */}

                  <div className="alert-details">

                    <div className="alert-detail">

                      <span>
                        CAMERA
                      </span>

                      <strong>
                        Camera #{alert.camera_id}
                      </strong>

                    </div>


                    <div className="alert-detail">

                      <span>
                        LOCATION
                      </span>

                      <strong>
                        {alert.latitude != null &&
                        alert.longitude != null
                          ? `${alert.latitude.toFixed(
                              4
                            )}, ${alert.longitude.toFixed(
                              4
                            )}`
                          : 'Unknown'}
                      </strong>

                    </div>


                    <div className="alert-detail">

                      <span>
                        CONFIDENCE
                      </span>

                      <strong className="confidence">
                        {alert.confidence != null
                          ? `${(
                              alert.confidence *
                              100
                            ).toFixed(0)}%`
                          : 'N/A'}
                      </strong>

                    </div>


                    <div className="alert-detail">

                      <span>
                        DETECTED
                      </span>

                      <strong>
                        {formatDateTime(
                          alert.created_at
                        )}
                      </strong>

                    </div>

                  </div>


                  {/* ACTIONS */}

                  <div className="alert-actions">

                    {alert.status === 'ACTIVE' && (
                      <button
                        className="alert-action acknowledge"
                        disabled={
                          actionLoading ===
                          `${alert.id}-acknowledge`
                        }
                        onClick={() =>
                          updateAlert(
                            alert.id,
                            'acknowledge'
                          )
                        }
                      >
                        {actionLoading ===
                        `${alert.id}-acknowledge`
                          ? 'Updating...'
                          : '✓ Acknowledge'}
                      </button>
                    )}


                    {alert.status !== 'RESOLVED' && (
                      <button
                        className="alert-action resolve"
                        disabled={
                          actionLoading ===
                          `${alert.id}-resolve`
                        }
                        onClick={() =>
                          updateAlert(
                            alert.id,
                            'resolve'
                          )
                        }
                      >
                        {actionLoading ===
                        `${alert.id}-resolve`
                          ? 'Resolving...'
                          : '✓ Resolve'}
                      </button>
                    )}


                    {alert.status === 'RESOLVED' && (
                      <span className="alert-resolved-text">
                        ✓ Resolved
                      </span>
                    )}

                  </div>

                </div>

              </div>

            ))}

          </div>

        )}

      </div>

    </div>
  )
}