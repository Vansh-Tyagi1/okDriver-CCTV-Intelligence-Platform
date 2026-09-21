import { useEffect, useMemo, useState } from 'react'

const API_BASE = 'http://127.0.0.1:8000'

export default function EventHistory() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [eventType, setEventType] = useState('ALL')
  const [cameraId, setCameraId] = useState('ALL')

  async function loadEvents() {
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
        `${API_BASE}/api/detections`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.detail || 'Unable to load event history.'
        )
      }

      setEvents(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadEvents()

    const interval = setInterval(() => {
      loadEvents()
    }, 10000)

    return () => clearInterval(interval)
  }, [])

  const cameraOptions = useMemo(() => {
    const ids = [
      ...new Set(
        events.map((event) => event.camera_id)
      ),
    ]

    return ids.sort((a, b) => a - b)
  }, [events])

  const eventTypes = useMemo(() => {
    return [
      ...new Set(
        events
          .map((event) => event.event_type)
          .filter(Boolean)
      ),
    ]
  }, [events])

  const filteredEvents = useMemo(() => {
    const searchValue = search
      .trim()
      .toLowerCase()

    return events.filter((event) => {
      const matchesSearch =
        !searchValue ||
        String(event.vehicle_number || '')
          .toLowerCase()
          .includes(searchValue) ||
        String(event.event_type || '')
          .toLowerCase()
          .includes(searchValue)

      const matchesType =
        eventType === 'ALL' ||
        event.event_type === eventType

      const matchesCamera =
        cameraId === 'ALL' ||
        String(event.camera_id) ===
          String(cameraId)

      return (
        matchesSearch &&
        matchesType &&
        matchesCamera
      )
    })
  }, [
    events,
    search,
    eventType,
    cameraId,
  ])

  function formatDateTime(value) {
    if (!value) {
      return 'Unknown time'
    }

    return new Date(value).toLocaleString(
      'en-IN',
      {
        dateStyle: 'medium',
        timeStyle: 'medium',
      }
    )
  }

  function formatConfidence(value) {
    if (
      value === null ||
      value === undefined
    ) {
      return 'N/A'
    }

    return `${(
      Number(value) * 100
    ).toFixed(0)}%`
  }

  return (
    <div className="event-history-page">

      {/* HEADER */}

      <div className="event-history-page-header">

        <div>
          <div className="event-history-label">
            AUDIT & EVENT INTELLIGENCE
          </div>

          <h1>
            Event History
          </h1>

          <p>
            Review timestamped AI detections
            and vehicle recognition events.
          </p>
        </div>


        <button
          className="event-refresh-button"
          onClick={loadEvents}
          disabled={loading}
        >
          ↻ Refresh
        </button>

      </div>


      {/* SEARCH / FILTERS */}

      <div className="event-filter-card">

        <div className="event-filter-header">

          <div>
            <div className="event-section-label">
              DETECTION SEARCH
            </div>

            <h2>
              Search Event History
            </h2>

            <p>
              Search vehicle numbers and filter
              recorded detection events.
            </p>
          </div>

        </div>


        <div className="event-filter-row">

          <div className="event-search-wrapper">

            <span className="event-search-icon">
              ⌕
            </span>

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search vehicle number..."
            />

          </div>


          <select
            value={eventType}
            onChange={(event) =>
              setEventType(event.target.value)
            }
            className="event-select"
          >
            <option value="ALL">
              All Event Types
            </option>

            {eventTypes.map((type) => (
              <option
                key={type}
                value={type}
              >
                {type}
              </option>
            ))}
          </select>


          <select
            value={cameraId}
            onChange={(event) =>
              setCameraId(event.target.value)
            }
            className="event-select"
          >
            <option value="ALL">
              All Cameras
            </option>

            {cameraOptions.map((id) => (
              <option
                key={id}
                value={id}
              >
                Camera #{id}
              </option>
            ))}
          </select>

        </div>

      </div>


      {/* ERROR */}

      {error && (
        <div className="event-error">
          <strong>!</strong>
          {error}
        </div>
      )}


      {/* SUMMARY */}

      <div className="event-summary">

        <div className="event-summary-card">

          <span>
            TOTAL EVENTS
          </span>

          <strong>
            {events.length}
          </strong>

        </div>


        <div className="event-summary-card">

          <span>
            MATCHED EVENTS
          </span>

          <strong>
            {filteredEvents.length}
          </strong>

        </div>


        <div className="event-summary-card">

          <span>
            ANPR EVENTS
          </span>

          <strong>
            {
              events.filter(
                (event) =>
                  event.event_type === 'ANPR'
              ).length
            }
          </strong>

        </div>

      </div>


      {/* EVENT TABLE */}

      <div className="event-history-card">

        <div className="event-history-card-header">

          <div>
            <div className="event-section-label">
              DETECTION LOG
            </div>

            <h2>
              Recorded Events
            </h2>
          </div>

          <div className="event-live-badge">
            ● LIVE DATA
          </div>

        </div>


        {loading && events.length === 0 ? (

          <div className="event-loading">
            Loading detection history...
          </div>

        ) : filteredEvents.length === 0 ? (

          <div className="event-empty">

            <div className="event-empty-icon">
              ◉
            </div>

            <h3>
              No events found
            </h3>

            <p>
              Try changing the search or
              filter criteria.
            </p>

          </div>

        ) : (

          <div className="event-table-wrapper">

            <table className="event-table">

              <thead>

                <tr>
                  <th>
                    VEHICLE
                  </th>

                  <th>
                    EVENT
                  </th>

                  <th>
                    CAMERA
                  </th>

                  <th>
                    VEHICLE TYPE
                  </th>

                  <th>
                    CONFIDENCE
                  </th>

                  <th>
                    DETECTED AT
                  </th>
                </tr>

              </thead>


              <tbody>

                {filteredEvents.map(
                  (event) => (

                    <tr key={event.id}>

                      <td>

                        <div className="event-vehicle">

                          {event.vehicle_number ||
                            'Unknown'}

                        </div>

                        <small>
                          Event #{event.id}
                        </small>

                      </td>


                      <td>

                        <span className="event-type-badge">
                          {event.event_type}
                        </span>

                      </td>


                      <td>

                        <strong>
                          Camera #{event.camera_id}
                        </strong>

                      </td>


                      <td>

                        {event.vehicle_type ||
                          'N/A'}

                      </td>


                      <td>

                        <span className="event-confidence">
                          {formatConfidence(
                            event.confidence
                          )}
                        </span>

                      </td>


                      <td>

                        <span className="event-date">
                          {formatDateTime(
                            event.detected_at
                          )}
                        </span>

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}

      </div>

    </div>
  )
}