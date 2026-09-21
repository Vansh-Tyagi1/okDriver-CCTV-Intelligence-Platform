import { useState } from 'react'
import VehicleMovementMap from './VehicleMovementMap'

const API_BASE = 'http://127.0.0.1:8000'

export default function VehicleSearch() {
  const [vehicleNumber, setVehicleNumber] = useState('')
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function searchVehicle() {
    const token = localStorage.getItem('access_token')

    if (!vehicleNumber.trim()) {
      setError('Please enter a vehicle number.')
      setHistory([])
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch(
        `${API_BASE}/api/vehicles/${encodeURIComponent(
          vehicleNumber.trim().toUpperCase()
        )}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.detail || 'Unable to fetch vehicle history.'
        )
      }

      setHistory(data.history || [])
    } catch (err) {
      setHistory([])
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function formatDateTime(value) {
    if (!value) {
      return 'Unknown time'
    }

    return new Date(value).toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
    })
  }

  return (
    <div className="vehicle-search-page">

      {/* PAGE HEADER */}
      <div className="vehicle-page-header">
        <div className="vehicle-page-label">
          VEHICLE INTELLIGENCE
        </div>

        <h1>
          Search Vehicle History
        </h1>

        <p>
          Track vehicle detections and movement across
          registered camera locations.
        </p>
      </div>


      {/* SEARCH CARD */}
      <div className="vehicle-search-card">

        <div className="vehicle-search-card-header">

          <div className="vehicle-section-label">
            VEHICLE SEARCH
          </div>

          <h2>
            Search by vehicle number
          </h2>

          <p>
            Enter a registered vehicle number to view
            its detection history.
          </p>

        </div>


        <div className="vehicle-search-form">

          <div className="vehicle-input-wrapper">

            <span className="vehicle-input-icon">
              ⌕
            </span>

            <input
              type="text"
              value={vehicleNumber}
              onChange={(event) =>
                setVehicleNumber(
                  event.target.value.toUpperCase()
                )
              }
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  searchVehicle()
                }
              }}
              placeholder="Enter vehicle number e.g. DL01AB1234"
            />

          </div>


          <button
            className="vehicle-search-button"
            onClick={searchVehicle}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="vehicle-spinner" />
                Searching...
              </>
            ) : (
              <>
                Search Vehicle
                <span>→</span>
              </>
            )}
          </button>

        </div>


        {error && (
          <div className="vehicle-error">
            <span>!</span>
            {error}
          </div>
        )}

      </div>


      {/* RESULTS */}
      {history.length > 0 && (
        <>

          {/* SUMMARY */}
          <div className="vehicle-result-summary">

            <div className="vehicle-result-title">

              <div className="vehicle-section-label">
                SEARCH RESULTS
              </div>

              <h2>
                {vehicleNumber}
              </h2>

              <p>
                Vehicle movement and detection history
              </p>

            </div>


            <div className="vehicle-stat-card">
              <span>
                Total Detections
              </span>

              <strong>
                {history.length}
              </strong>
            </div>


            <div className="vehicle-stat-card">
              <span>
                Cameras Detected
              </span>

              <strong>
                {
                  new Set(
                    history.map(
                      (item) => item.camera_id
                    )
                  ).size
                }
              </strong>
            </div>

          </div>


          {/* MAP */}
          <div className="vehicle-map-card">

            <div className="vehicle-map-card-header">

              <div>
                <div className="vehicle-section-label">
                  GIS INTELLIGENCE
                </div>

                <h2>
                  Vehicle Movement Map
                </h2>

                <p>
                  Chronological camera detections
                  plotted on the map.
                </p>
              </div>


              <div className="vehicle-map-route-badge">
                <span />
                ROUTE TRACKING
              </div>

            </div>


            <VehicleMovementMap
              history={history}
            />

          </div>


          {/* TIMELINE */}
          <div className="vehicle-history-card">

            <div className="vehicle-history-header">

              <div>

                <div className="vehicle-section-label">
                  MOVEMENT HISTORY
                </div>

                <h2>
                  Detection Timeline
                </h2>

              </div>

              <span className="vehicle-live-badge">
                ● LIVE DATA
              </span>

            </div>


            <div className="vehicle-timeline">

              {history.map(
                (item, index) => (

                  <div
                    className="vehicle-timeline-item"
                    key={`${item.detection_id}-${index}`}
                  >

                    <div className="vehicle-timeline-line">
                      {index < history.length - 1 && (
                        <span />
                      )}
                    </div>


                    <div className="vehicle-timeline-dot">
                      {index + 1}
                    </div>


                    <div className="vehicle-detection-card">

                      <div className="vehicle-detection-top">

                        <div>

                          <span className="vehicle-detection-label">
                            DETECTION #{index + 1}
                          </span>

                          <h3>
                            {item.vehicle_number}
                          </h3>

                        </div>


                        <span className="vehicle-anpr-badge">
                          {item.event_type}
                        </span>

                      </div>


                      <div className="vehicle-detection-grid">

                        <div className="vehicle-info-item">

                          <span>
                            Camera
                          </span>

                          <strong>
                            {item.camera_code}
                          </strong>

                          <small>
                            {item.camera_name}
                          </small>

                        </div>


                        <div className="vehicle-info-item">

                          <span>
                            Zone
                          </span>

                          <strong>
                            {item.zone || 'Unknown'}
                          </strong>

                        </div>


                        <div className="vehicle-info-item">

                          <span>
                            Vehicle Type
                          </span>

                          <strong>
                            {item.vehicle_type || 'Unknown'}
                          </strong>

                        </div>


                        <div className="vehicle-info-item">

                          <span>
                            Confidence
                          </span>

                          <strong className="vehicle-confidence">
                            {item.confidence != null
                              ? `${(
                                  item.confidence * 100
                                ).toFixed(0)}%`
                              : 'N/A'}
                          </strong>

                        </div>

                      </div>


                      <div className="vehicle-detection-footer">

                        <span>
                          📍{' '}
                          {typeof item.latitude === 'number'
                            ? item.latitude.toFixed(4)
                            : 'N/A'}
                          ,{' '}
                          {typeof item.longitude === 'number'
                            ? item.longitude.toFixed(4)
                            : 'N/A'}
                        </span>


                        <span>
                          🕒{' '}
                          {formatDateTime(
                            item.detected_at
                          )}
                        </span>

                      </div>

                    </div>

                  </div>

                )
              )}

            </div>

          </div>

        </>
      )}


      {/* EMPTY STATE */}
      {!loading &&
        !error &&
        history.length === 0 && (
          <div className="vehicle-empty-state">

            <div className="vehicle-empty-icon">
              ◉
            </div>

            <h3>
              Search for a vehicle
            </h3>

            <p>
              Enter a vehicle registration number above
              to view its complete detection history.
            </p>

          </div>
        )}

    </div>
  )
}