import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from 'react-leaflet'

import L from 'leaflet'
import { useEffect } from 'react'
import 'leaflet/dist/leaflet.css'


/*
|--------------------------------------------------------------------------
| Fix Leaflet marker icons
|--------------------------------------------------------------------------
*/

delete L.Icon.Default.prototype._getIconUrl

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',

  iconUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',

  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})


/*
|--------------------------------------------------------------------------
| Map auto-fit
|--------------------------------------------------------------------------
*/

function MapAutoFit({ positions }) {
  const map = useMap()

  useEffect(() => {
    if (!positions.length) {
      return
    }

    if (positions.length === 1) {
      map.setView(
        positions[0],
        15
      )

      return
    }

    const bounds = L.latLngBounds(
      positions
    )

    map.fitBounds(
      bounds,
      {
        padding: [40, 40],
      }
    )
  }, [positions, map])

  return null
}


/*
|--------------------------------------------------------------------------
| Vehicle Movement Map
|--------------------------------------------------------------------------
*/

export default function VehicleMovementMap({
  history = [],
}) {

  const positions = history
    .filter(
      (item) =>
        typeof item.latitude === 'number' &&
        typeof item.longitude === 'number'
    )
    .map(
      (item) => [
        item.latitude,
        item.longitude,
      ]
    )

  if (!positions.length) {
    return (
      <div className="vehicle-map-empty">
        <div className="vehicle-map-empty-icon">
          ◉
        </div>

        <strong>
          No location data available
        </strong>

        <p>
          Camera coordinates will appear
          here when vehicle detections
          contain valid locations.
        </p>
      </div>
    )
  }


  return (
    <div className="vehicle-movement-map">

      <MapContainer
        center={positions[0]}
        zoom={13}
        scrollWheelZoom={true}
        style={{
          width: '100%',
          height: '100%',
        }}
      >

        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />


        <MapAutoFit
          positions={positions}
        />


        {/* Movement route */}

        {positions.length > 1 && (
          <Polyline
            positions={positions}
            pathOptions={{
              color: '#2563eb',
              weight: 5,
              opacity: 0.85,
            }}
          />
        )}


        {/* Camera detection markers */}

        {history.map(
          (item, index) => {

            if (
              typeof item.latitude !== 'number' ||
              typeof item.longitude !== 'number'
            ) {
              return null
            }

            return (
              <Marker
                key={`${item.detection_id}-${index}`}
                position={[
                  item.latitude,
                  item.longitude,
                ]}
              >

                <Popup>

                  <div
                    style={{
                      minWidth: '190px',
                      fontFamily:
                        'Arial, sans-serif',
                    }}
                  >

                    <strong>
                      {item.camera_name}
                    </strong>

                    <div
                      style={{
                        marginTop: '7px',
                        fontSize: '12px',
                      }}
                    >
                      Vehicle:{' '}
                      <strong>
                        {item.vehicle_number}
                      </strong>
                    </div>

                    <div
                      style={{
                        marginTop: '4px',
                        fontSize: '12px',
                      }}
                    >
                      Zone:{' '}
                      {item.zone ||
                        'Unknown'}
                    </div>

                    <div
                      style={{
                        marginTop: '4px',
                        fontSize: '12px',
                      }}
                    >
                      Detection:{' '}
                      {new Date(
                        item.detected_at
                      ).toLocaleString(
                        'en-IN'
                      )}
                    </div>

                    <div
                      style={{
                        marginTop: '4px',
                        fontSize: '12px',
                      }}
                    >
                      Confidence:{' '}
                      {item.confidence != null
                        ? `${(
                            item.confidence *
                            100
                          ).toFixed(0)}%`
                        : 'N/A'}
                    </div>

                  </div>

                </Popup>

              </Marker>
            )
          }
        )}

      </MapContainer>


      {/* Map overlay */}

      <div className="vehicle-map-overlay">

        <div className="vehicle-map-title">
          VEHICLE MOVEMENT
        </div>

        <div className="vehicle-map-subtitle">
          {history.length}{' '}
          detections plotted
        </div>

      </div>

    </div>
  )
}