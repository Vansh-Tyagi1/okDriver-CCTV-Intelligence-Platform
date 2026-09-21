import { useEffect, useState } from 'react'

const API_BASE = 'http://127.0.0.1:8000'

function Cameras() {
  const [cameras, setCameras] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [healthData, setHealthData] = useState([])
  const [healthLoading, setHealthLoading] = useState(false)

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('')
  const [zoneFilter, setZoneFilter] = useState('')

  const [showAddForm, setShowAddForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)

  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const [editingCamera, setEditingCamera] = useState(null)

  const [formData, setFormData] = useState({
    camera_id: '',
    name: '',
    department: '',
    latitude: '',
    longitude: '',
    camera_type: 'FIXED',
    source_protocol: 'SIMULATOR',
    stream_endpoint: '',
    status: 'ONLINE',
    zone: '',
    storage_metadata: '',
  })

  useEffect(() => {
    loadCameras()
    loadCameraHealth()

    const interval = setInterval(() => {
      loadCameraHealth()
    }, 10000)

    return () => clearInterval(interval)
  }, [])

  async function loadCameras() {
    try {
      setLoading(true)
      setError('')

      const token = localStorage.getItem('access_token')

      if (!token) {
        throw new Error('Authentication token not found.')
      }

      const response = await fetch(`${API_BASE}/api/cameras`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.detail || 'Unable to load cameras.'
        )
      }

      setCameras(data)
    } catch (err) {
      setError(err.message || 'Unable to load cameras.')
    } finally {
      setLoading(false)
    }
  }

  async function loadCameraHealth() {
    try {
      setHealthLoading(true)

      const token = localStorage.getItem('access_token')

      if (!token) {
        throw new Error('Authentication token not found.')
      }

      const response = await fetch(
        `${API_BASE}/api/camera-health`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          cache: 'no-store',
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.detail || 'Unable to load camera health.'
        )
      }

      setHealthData(data)
    } catch (err) {
      console.error('Camera health error:', err)
    } finally {
      setHealthLoading(false)
    }
  }

  function handleFormChange(event) {
    const { name, value } = event.target

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }))
  }

  function resetForm() {
    setFormData({
      camera_id: '',
      name: '',
      department: '',
      latitude: '',
      longitude: '',
      camera_type: 'FIXED',
      source_protocol: 'SIMULATOR',
      stream_endpoint: '',
      status: 'ONLINE',
      zone: '',
      storage_metadata: '',
    })

    setFormError('')
  }

  function closeAddForm() {
    if (saving) return

    setShowAddForm(false)
    resetForm()
  }

  function openAddForm() {
    resetForm()
    setSuccessMessage('')
    setShowAddForm(true)
  }

  function openEditForm(camera) {
    setEditingCamera(camera)

    setFormData({
      camera_id: camera.camera_id || '',
      name: camera.name || '',
      department: camera.department || '',
      latitude: camera.latitude ?? '',
      longitude: camera.longitude ?? '',
      camera_type: camera.camera_type || 'FIXED',
      source_protocol: camera.source_protocol || 'SIMULATOR',
      stream_endpoint: camera.stream_endpoint || '',
      status: camera.status || 'ONLINE',
      zone: camera.zone || '',
      storage_metadata: camera.storage_metadata || '',
    })

    setFormError('')
    setSuccessMessage('')
    setShowEditForm(true)
  }

  function closeEditForm() {
    if (saving) return

    setShowEditForm(false)
    setEditingCamera(null)
    resetForm()
  }

  async function handleAddCamera(event) {
    event.preventDefault()

    setSaving(true)
    setFormError('')
    setSuccessMessage('')

    try {
      const token = localStorage.getItem('access_token')

      if (!token) {
        throw new Error(
          'Authentication token not found. Please login again.'
        )
      }

      const payload = {
        camera_id: formData.camera_id.trim(),
        name: formData.name.trim(),
        department: formData.department.trim() || null,
        latitude: Number(formData.latitude),
        longitude: Number(formData.longitude),
        camera_type: formData.camera_type,
        source_protocol: formData.source_protocol,
        stream_endpoint:
          formData.stream_endpoint.trim() || null,
        status: formData.status,
        zone: formData.zone.trim() || null,
        storage_metadata:
          formData.storage_metadata.trim() || null,
      }

      validateCameraData(payload)

      const response = await fetch(`${API_BASE}/api/cameras`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.detail || 'Unable to create camera.'
        )
      }

      setCameras((previous) => [data, ...previous])

      setSuccessMessage(
        `Camera ${data.camera_id} added successfully.`
      )

      setShowAddForm(false)
      resetForm()
    } catch (err) {
      setFormError(
        err.message || 'Unable to create camera.'
      )
    } finally {
      setSaving(false)
    }
  }

  async function handleEditCamera(event) {
    event.preventDefault()

    if (!editingCamera) return

    setSaving(true)
    setFormError('')
    setSuccessMessage('')

    try {
      const token = localStorage.getItem('access_token')

      if (!token) {
        throw new Error(
          'Authentication token not found. Please login again.'
        )
      }

      const payload = {
        name: formData.name.trim(),
        department: formData.department.trim() || null,
        latitude: Number(formData.latitude),
        longitude: Number(formData.longitude),
        camera_type: formData.camera_type,
        source_protocol: formData.source_protocol,
        stream_endpoint:
          formData.stream_endpoint.trim() || null,
        status: formData.status,
        zone: formData.zone.trim() || null,
        storage_metadata:
          formData.storage_metadata.trim() || null,
      }

      if (!payload.name) {
        throw new Error('Camera name is required.')
      }

      if (
        Number.isNaN(payload.latitude) ||
        payload.latitude < -90 ||
        payload.latitude > 90
      ) {
        throw new Error(
          'Latitude must be between -90 and 90.'
        )
      }

      if (
        Number.isNaN(payload.longitude) ||
        payload.longitude < -180 ||
        payload.longitude > 180
      ) {
        throw new Error(
          'Longitude must be between -180 and 180.'
        )
      }

      const response = await fetch(
        `${API_BASE}/api/cameras/${editingCamera.id}`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.detail || 'Unable to update camera.'
        )
      }

      setCameras((previous) =>
        previous.map((camera) =>
          camera.id === data.id ? data : camera
        )
      )

      setSuccessMessage(
        `Camera ${data.camera_id} updated successfully.`
      )

      setShowEditForm(false)
      setEditingCamera(null)
      resetForm()
    } catch (err) {
      setFormError(
        err.message || 'Unable to update camera.'
      )
    } finally {
      setSaving(false)
    }
  }

  async function handleDisableCamera(camera) {
    const confirmed = window.confirm(
      `Are you sure you want to disable ${camera.name} (${camera.camera_id})?`
    )

    if (!confirmed) {
      return
    }

    try {
      const token = localStorage.getItem('access_token')

      if (!token) {
        throw new Error(
          'Authentication token not found. Please login again.'
        )
      }

      setError('')

      const response = await fetch(
        `${API_BASE}/api/cameras/${camera.id}/disable`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.detail || 'Unable to disable camera.'
        )
      }

      setCameras((previous) =>
        previous.map((item) =>
          item.id === data.id ? data : item
        )
      )

      setSuccessMessage(
        `Camera ${data.camera_id} disabled successfully.`
      )
    } catch (err) {
      setError(
        err.message || 'Unable to disable camera.'
      )
    }
  }

  function validateCameraData(payload) {
    if (!payload.camera_id) {
      throw new Error('Camera ID is required.')
    }

    if (!payload.name) {
      throw new Error('Camera name is required.')
    }

    if (
      Number.isNaN(payload.latitude) ||
      payload.latitude < -90 ||
      payload.latitude > 90
    ) {
      throw new Error(
        'Latitude must be between -90 and 90.'
      )
    }

    if (
      Number.isNaN(payload.longitude) ||
      payload.longitude < -180 ||
      payload.longitude > 180
    ) {
      throw new Error(
        'Longitude must be between -180 and 180.'
      )
    }
  }

  const camerasWithHealth = cameras.map((camera) => {
    const health = healthData.find(
      (item) => item.camera_id === camera.id
    )

    return {
      ...camera,
      status: health?.status || camera.status,
      last_heartbeat:
        health?.last_heartbeat || camera.last_heartbeat,
      is_active:
        health?.is_active ?? camera.is_active,
    }
  })

  const filteredCameras = camerasWithHealth.filter((camera) => {
    const searchText = search.toLowerCase()

    const matchesSearch =
      !search ||
      camera.camera_id
        .toLowerCase()
        .includes(searchText) ||
      camera.name
        .toLowerCase()
        .includes(searchText)

    const matchesStatus =
      !statusFilter ||
      camera.status === statusFilter

    const matchesDepartment =
      !departmentFilter ||
      camera.department === departmentFilter

    const matchesZone =
      !zoneFilter ||
      camera.zone === zoneFilter

    return (
      matchesSearch &&
      matchesStatus &&
      matchesDepartment &&
      matchesZone
    )
  })

  const departments = [
    ...new Set(
      cameras
        .map((camera) => camera.department)
        .filter(Boolean)
    ),
  ]

  const zones = [
    ...new Set(
      cameras
        .map((camera) => camera.zone)
        .filter(Boolean)
    ),
  ]

  return (
    <div
      style={{
        padding: '30px',
        color: '#f8fafc',
      }}
    >
      {/* ================= HEADER ================= */}

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '25px',
          gap: '20px',
        }}
      >
        <div>
          <div
            style={{
              color: '#64748b',
              fontSize: '10px',
              fontWeight: '700',
              letterSpacing: '1.5px',
              marginBottom: '6px',
            }}
          >
            CAMERA MANAGEMENT
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: '28px',
              color: '#f8fafc',
            }}
          >
            Camera Registry
          </h1>

          <p
            style={{
              color: '#64748b',
              fontSize: '12px',
              marginTop: '7px',
            }}
          >
            Manage and monitor registered CCTV sources.
          </p>
        </div>

        <div
          style={{
            display: 'flex',
            gap: '10px',
            alignItems: 'center',
          }}
        >
          <button
            type="button"
            onClick={() => {
              loadCameras()
              loadCameraHealth()
            }}
            style={{
              ...secondaryButtonStyle,
              opacity: healthLoading ? 0.65 : 1,
            }}
            disabled={healthLoading}
          >
            {healthLoading ? '↻ Syncing...' : '↻ Refresh'}
          </button>

          <button
            type="button"
            onClick={openAddForm}
            style={primaryButtonStyle}
          >
            + Add Camera
          </button>
        </div>
      </div>

      {/* ================= SUCCESS ================= */}

      {successMessage && (
        <div
          style={{
            background: 'rgba(34, 197, 94, 0.1)',
            border:
              '1px solid rgba(34, 197, 94, 0.3)',
            color: '#86efac',
            padding: '12px 15px',
            borderRadius: '8px',
            marginBottom: '20px',
            fontSize: '12px',
          }}
        >
          ✓ {successMessage}
        </div>
      )}

      {/* ================= FILTERS ================= */}

      <div
        style={{
          background: '#172033',
          border: '1px solid #243047',
          borderRadius: '10px',
          padding: '18px',
          display: 'grid',
          gridTemplateColumns:
            'minmax(220px, 2fr) repeat(3, minmax(140px, 1fr))',
          gap: '12px',
          marginBottom: '20px',
        }}
      >
        <input
          type="text"
          placeholder="Search camera ID or name..."
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
          style={inputStyle}
        />

        <select
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(event.target.value)
          }
          style={inputStyle}
        >
          <option value="">All Status</option>
          <option value="ONLINE">Online</option>
          <option value="OFFLINE">Offline</option>
          <option value="DEGRADED">Degraded</option>
        </select>

        <select
          value={departmentFilter}
          onChange={(event) =>
            setDepartmentFilter(event.target.value)
          }
          style={inputStyle}
        >
          <option value="">All Departments</option>

          {departments.map((department) => (
            <option
              key={department}
              value={department}
            >
              {department}
            </option>
          ))}
        </select>

        <select
          value={zoneFilter}
          onChange={(event) =>
            setZoneFilter(event.target.value)
          }
          style={inputStyle}
        >
          <option value="">All Zones</option>

          {zones.map((zone) => (
            <option key={zone} value={zone}>
              {zone}
            </option>
          ))}
        </select>
      </div>

      {/* ================= ERROR ================= */}

      {error && (
        <div
          style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border:
              '1px solid rgba(239, 68, 68, 0.3)',
            color: '#fca5a5',
            padding: '12px 15px',
            borderRadius: '8px',
            marginBottom: '20px',
            fontSize: '12px',
          }}
        >
          {error}
        </div>
      )}

      {/* ================= TABLE ================= */}

      <div
        style={{
          background: '#172033',
          border: '1px solid #243047',
          borderRadius: '10px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            padding: '18px 20px',
            borderBottom: '1px solid #243047',
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <span
              style={{
                color: '#64748b',
                fontSize: '10px',
                letterSpacing: '1.3px',
                fontWeight: '700',
              }}
            >
              REGISTERED SOURCES
            </span>

            <h2
              style={{
                margin: '5px 0 0',
                fontSize: '17px',
              }}
            >
              Cameras
            </h2>
          </div>

          <div
            style={{
              color: '#94a3b8',
              fontSize: '12px',
              alignSelf: 'center',
            }}
          >
            {filteredCameras.length} of {cameras.length}
          </div>
        </div>

        {loading ? (
          <div
            style={{
              padding: '40px',
              textAlign: 'center',
              color: '#64748b',
            }}
          >
            Loading cameras...
          </div>
        ) : filteredCameras.length === 0 ? (
          <div
            style={{
              padding: '40px',
              textAlign: 'center',
              color: '#64748b',
            }}
          >
            No cameras match the selected filters.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '12px',
              }}
            >
              <thead>
                <tr>
                  <th style={thStyle}>Camera</th>
                  <th style={thStyle}>Department</th>
                  <th style={thStyle}>Location</th>
                  <th style={thStyle}>Type</th>
                  <th style={thStyle}>Protocol</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Last Heartbeat</th>
                  <th style={thStyle}>Zone</th>
                  <th style={thStyle}>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredCameras.map((camera) => (
                  <tr key={camera.id}>
                    <td style={tdStyle}>
                      <div
                        style={{
                          color: '#f8fafc',
                          fontWeight: '600',
                        }}
                      >
                        {camera.name}
                      </div>

                      <div
                        style={{
                          color: '#64748b',
                          fontSize: '10px',
                          marginTop: '4px',
                        }}
                      >
                        {camera.camera_id}
                      </div>
                    </td>

                    <td style={tdStyle}>
                      {camera.department || '—'}
                    </td>

                    <td style={tdStyle}>
                      <div>
                        {Number(camera.latitude).toFixed(4)}
                      </div>

                      <div
                        style={{
                          color: '#64748b',
                          fontSize: '10px',
                        }}
                      >
                        {Number(camera.longitude).toFixed(4)}
                      </div>
                    </td>

                    <td style={tdStyle}>
                      {camera.camera_type}
                    </td>

                    <td style={tdStyle}>
                      <span
                        style={{
                          background: '#0f172a',
                          border: '1px solid #334155',
                          padding: '4px 7px',
                          borderRadius: '5px',
                          fontSize: '10px',
                        }}
                      >
                        {camera.source_protocol}
                      </span>
                    </td>

                    <td style={tdStyle}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          color:
                            camera.status === 'ONLINE'
                              ? '#4ade80'
                              : camera.status ===
                                  'DEGRADED'
                                ? '#fbbf24'
                                : '#94a3b8',
                        }}
                      >
                        <span
                          style={{
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            background:
                              camera.status === 'ONLINE'
                                ? '#4ade80'
                                : camera.status ===
                                    'DEGRADED'
                                  ? '#fbbf24'
                                  : '#64748b',
                          }}
                        ></span>

                        {camera.status}
                      </span>
                    </td>

                    <td style={tdStyle}>
                      {camera.last_heartbeat
                        ? new Date(
                            camera.last_heartbeat
                          ).toLocaleString('en-IN')
                        : 'No heartbeat'}
                    </td>

                    <td style={tdStyle}>
                      {camera.zone || '—'}
                    </td>

                    <td style={tdStyle}>
                      <div
                        style={{
                          display: 'flex',
                          gap: '7px',
                        }}
                      >
                        <button
                          type="button"
                          onClick={() =>
                            openEditForm(camera)
                          }
                          style={editButtonStyle}
                        >
                          Edit
                        </button>

                        {camera.is_active ? (
                          <button
                            type="button"
                            onClick={() =>
                              handleDisableCamera(camera)
                            }
                            style={disableButtonStyle}
                          >
                            Disable
                          </button>
                        ) : (
                          <span
                            style={{
                              color: '#64748b',
                              fontSize: '10px',
                              padding: '7px',
                            }}
                          >
                            Disabled
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ================= ADD CAMERA MODAL ================= */}

      {showAddForm && (
        <div style={modalOverlayStyle}>
          <div style={modalStyle}>
            <ModalHeader
              title="Add New Camera"
              subtitle="Register a new CCTV source."
              onClose={closeAddForm}
            />

            {formError && (
              <FormError message={formError} />
            )}

            <form onSubmit={handleAddCamera}>
              <CameraForm
                formData={formData}
                onChange={handleFormChange}
                includeCameraId={true}
              />

              <ModalButtons
                saving={saving}
                onCancel={closeAddForm}
                submitText="Add Camera"
              />
            </form>
          </div>
        </div>
      )}

      {/* ================= EDIT CAMERA MODAL ================= */}

      {showEditForm && (
        <div style={modalOverlayStyle}>
          <div style={modalStyle}>
            <ModalHeader
              title="Edit Camera"
              subtitle={
                editingCamera
                  ? `Update ${editingCamera.camera_id}`
                  : 'Update camera details.'
              }
              onClose={closeEditForm}
            />

            {formError && (
              <FormError message={formError} />
            )}

            <form onSubmit={handleEditCamera}>
              <CameraForm
                formData={formData}
                onChange={handleFormChange}
                includeCameraId={false}
              />

              <ModalButtons
                saving={saving}
                onCancel={closeEditForm}
                submitText="Save Changes"
              />
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

/* ================= CAMERA FORM ================= */

function CameraForm({
  formData,
  onChange,
  includeCameraId,
}) {
  return (
    <div style={formGridStyle}>
      {includeCameraId && (
        <FormField
          label="Camera ID *"
          name="camera_id"
          value={formData.camera_id}
          onChange={onChange}
          placeholder="CAM-003"
          required
        />
      )}

      <FormField
        label="Camera Name *"
        name="name"
        value={formData.name}
        onChange={onChange}
        placeholder="North Gate Camera"
        required
      />

      <FormField
        label="Department"
        name="department"
        value={formData.department}
        onChange={onChange}
        placeholder="Security"
      />

      <FormField
        label="Zone"
        name="zone"
        value={formData.zone}
        onChange={onChange}
        placeholder="North Gate"
      />

      <FormField
        label="Latitude *"
        name="latitude"
        type="number"
        step="any"
        value={formData.latitude}
        onChange={onChange}
        placeholder="28.6469"
        required
      />

      <FormField
        label="Longitude *"
        name="longitude"
        type="number"
        step="any"
        value={formData.longitude}
        onChange={onChange}
        placeholder="77.3150"
        required
      />

      <FormSelect
        label="Camera Type"
        name="camera_type"
        value={formData.camera_type}
        onChange={onChange}
        options={[
          ['FIXED', 'Fixed'],
          ['PTZ', 'PTZ'],
        ]}
      />

      <FormSelect
        label="Source Protocol"
        name="source_protocol"
        value={formData.source_protocol}
        onChange={onChange}
        options={[
          ['SIMULATOR', 'Simulator'],
          ['RTSP', 'RTSP'],
          ['ONVIF', 'ONVIF'],
          ['HLS', 'HLS'],
          ['WEBRTC', 'WebRTC'],
          ['API', 'Vendor API'],
        ]}
      />

      <FormSelect
        label="Status"
        name="status"
        value={formData.status}
        onChange={onChange}
        options={[
          ['ONLINE', 'Online'],
          ['OFFLINE', 'Offline'],
          ['DEGRADED', 'Degraded'],
        ]}
      />

      <FormField
        label="Stream Endpoint"
        name="stream_endpoint"
        value={formData.stream_endpoint}
        onChange={onChange}
        placeholder="demo://camera-003"
      />

      <FormField
        label="Storage Metadata"
        name="storage_metadata"
        value={formData.storage_metadata}
        onChange={onChange}
        placeholder="Local demo storage"
      />
    </div>
  )
}

/* ================= FORM FIELD ================= */

function FormField({
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  step,
}) {
  return (
    <div>
      <label style={labelStyle}>
        {label}
      </label>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        step={step}
        style={formInputStyle}
      />
    </div>
  )
}

/* ================= FORM SELECT ================= */

function FormSelect({
  label,
  name,
  value,
  onChange,
  options,
}) {
  return (
    <div>
      <label style={labelStyle}>
        {label}
      </label>

      <select
        name={name}
        value={value}
        onChange={onChange}
        style={formInputStyle}
      >
        {options.map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
    </div>
  )
}

/* ================= MODAL HEADER ================= */

function ModalHeader({
  title,
  subtitle,
  onClose,
}) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '22px',
      }}
    >
      <div>
        <span
          style={{
            color: '#64748b',
            fontSize: '10px',
            fontWeight: '700',
            letterSpacing: '1.3px',
          }}
        >
          CAMERA MANAGEMENT
        </span>

        <h2
          style={{
            margin: '5px 0 0',
            color: '#f8fafc',
            fontSize: '21px',
          }}
        >
          {title}
        </h2>

        <p
          style={{
            margin: '6px 0 0',
            color: '#64748b',
            fontSize: '11px',
          }}
        >
          {subtitle}
        </p>
      </div>

      <button
        type="button"
        onClick={onClose}
        style={closeButtonStyle}
      >
        ×
      </button>
    </div>
  )
}

/* ================= FORM ERROR ================= */

function FormError({ message }) {
  return (
    <div
      style={{
        background: 'rgba(239, 68, 68, 0.1)',
        border:
          '1px solid rgba(239, 68, 68, 0.3)',
        color: '#fca5a5',
        padding: '11px 13px',
        borderRadius: '7px',
        marginBottom: '18px',
        fontSize: '11px',
      }}
    >
      {message}
    </div>
  )
}

/* ================= MODAL BUTTONS ================= */

function ModalButtons({
  saving,
  onCancel,
  submitText,
}) {
  return (
    <div
      style={{
        marginTop: '24px',
        paddingTop: '18px',
        borderTop: '1px solid #243047',
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '10px',
      }}
    >
      <button
        type="button"
        onClick={onCancel}
        disabled={saving}
        style={cancelButtonStyle}
      >
        Cancel
      </button>

      <button
        type="submit"
        disabled={saving}
        style={{
          ...primaryButtonStyle,
          opacity: saving ? 0.6 : 1,
          cursor: saving
            ? 'not-allowed'
            : 'pointer',
        }}
      >
        {saving ? 'Saving...' : submitText}
      </button>
    </div>
  )
}

/* ================= STYLES ================= */

const inputStyle = {
  width: '100%',
  height: '40px',
  boxSizing: 'border-box',
  background: '#0f172a',
  border: '1px solid #334155',
  borderRadius: '6px',
  color: '#f8fafc',
  padding: '0 11px',
  fontSize: '11px',
  outline: 'none',
}

const formInputStyle = {
  width: '100%',
  height: '40px',
  boxSizing: 'border-box',
  background: '#0f172a',
  border: '1px solid #334155',
  borderRadius: '6px',
  color: '#f8fafc',
  padding: '0 11px',
  fontSize: '11px',
  outline: 'none',
}

const labelStyle = {
  display: 'block',
  color: '#94a3b8',
  fontSize: '10px',
  fontWeight: '600',
  marginBottom: '7px',
}

const thStyle = {
  textAlign: 'left',
  padding: '13px 20px',
  color: '#64748b',
  fontSize: '9px',
  letterSpacing: '1px',
  fontWeight: '700',
  borderBottom: '1px solid #243047',
  whiteSpace: 'nowrap',
}

const tdStyle = {
  padding: '15px 20px',
  color: '#94a3b8',
  borderBottom: '1px solid #202b40',
  whiteSpace: 'nowrap',
}

const primaryButtonStyle = {
  background: '#2563eb',
  border: 'none',
  color: '#fff',
  borderRadius: '7px',
  padding: '10px 16px',
  cursor: 'pointer',
  fontSize: '12px',
  fontWeight: '600',
}

const secondaryButtonStyle = {
  background: '#172033',
  border: '1px solid #334155',
  color: '#cbd5e1',
  borderRadius: '7px',
  padding: '10px 16px',
  cursor: 'pointer',
  fontSize: '12px',
  fontWeight: '600',
}

const editButtonStyle = {
  background: 'rgba(37, 99, 235, 0.12)',
  border: '1px solid rgba(37, 99, 235, 0.4)',
  color: '#60a5fa',
  borderRadius: '5px',
  padding: '6px 9px',
  cursor: 'pointer',
  fontSize: '10px',
}

const disableButtonStyle = {
  background: 'rgba(239, 68, 68, 0.08)',
  border: '1px solid rgba(239, 68, 68, 0.35)',
  color: '#f87171',
  borderRadius: '5px',
  padding: '6px 9px',
  cursor: 'pointer',
  fontSize: '10px',
}

const cancelButtonStyle = {
  background: 'transparent',
  border: '1px solid #334155',
  color: '#94a3b8',
  borderRadius: '7px',
  padding: '10px 16px',
  cursor: 'pointer',
  fontSize: '12px',
  fontWeight: '600',
}

const closeButtonStyle = {
  width: '30px',
  height: '30px',
  borderRadius: '6px',
  border: '1px solid #334155',
  background: '#0f172a',
  color: '#94a3b8',
  fontSize: '20px',
  cursor: 'pointer',
  lineHeight: '1',
}

const formGridStyle = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '15px',
}

const modalOverlayStyle = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(2, 6, 23, 0.78)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '20px',
  zIndex: 1000,
}

const modalStyle = {
  width: '100%',
  maxWidth: '720px',
  maxHeight: '90vh',
  overflowY: 'auto',
  background: '#172033',
  border: '1px solid #334155',
  borderRadius: '12px',
  padding: '25px',
  boxSizing: 'border-box',
  boxShadow:
    '0 25px 70px rgba(0, 0, 0, 0.45)',
}

export default Cameras