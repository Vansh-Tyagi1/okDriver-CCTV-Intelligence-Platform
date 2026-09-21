import React, { useEffect, useState } from 'react'

const API_BASE = 'http://127.0.0.1:8000'

export default function Watchlist() {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [entityType, setEntityType] = useState('')

  const [showModal, setShowModal] = useState(false)
  const [editingEntry, setEditingEntry] = useState(null)

  const [formData, setFormData] = useState({
    entity_type: 'VEHICLE',
    identifier: '',
    name: '',
    category: 'SECURITY',
    description: '',
  })

  const token = localStorage.getItem('access_token')

  async function loadWatchlist() {
    if (!token) return

    setLoading(true)
    setError('')

    try {
      const params = new URLSearchParams()

      if (search.trim()) {
        params.append('search', search.trim())
      }

      if (category) {
        params.append('category', category)
      }

      if (entityType) {
        params.append('entity_type', entityType)
      }

      params.append('active_only', 'false')

      const response = await fetch(
        `${API_BASE}/api/watchlist?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: 'no-store',
        }
      )

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Session expired. Please login again.')
        }

        throw new Error(
          data.detail || 'Unable to load watchlist.'
        )
      }

      setEntries(data)
    } catch (err) {
      setError(
        err.message || 'Unable to load watchlist.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadWatchlist()
  }, [search, category, entityType])

  function openAddModal() {
    setEditingEntry(null)

    setFormData({
      entity_type: 'VEHICLE',
      identifier: '',
      name: '',
      category: 'SECURITY',
      description: '',
    })

    setError('')
    setSuccess('')
    setShowModal(true)
  }

  function openEditModal(entry) {
    setEditingEntry(entry)

    setFormData({
      entity_type: entry.entity_type || 'VEHICLE',
      identifier: entry.identifier || '',
      name: entry.name || '',
      category: entry.category || 'SECURITY',
      description: entry.description || '',
    })

    setError('')
    setSuccess('')
    setShowModal(true)
  }

  function closeModal() {
    if (saving) return

    setShowModal(false)
    setEditingEntry(null)
  }

  function handleChange(event) {
    const { name, value } = event.target

    setFormData((current) => ({
      ...current,
      [name]: value,
    }))
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (!formData.identifier.trim()) {
      setError('Identifier is required.')
      return
    }

    if (!formData.name.trim()) {
      setError('Name is required.')
      return
    }

    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const url = editingEntry
        ? `${API_BASE}/api/watchlist/${editingEntry.id}`
        : `${API_BASE}/api/watchlist`

      const method = editingEntry ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          entity_type: formData.entity_type.trim(),
          identifier: formData.identifier.trim().toUpperCase(),
          name: formData.name.trim(),
          category: formData.category.trim(),
          description:
            formData.description.trim() || null,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.detail ||
            `Unable to ${
              editingEntry ? 'update' : 'create'
            } watchlist entry.`
        )
      }

      setSuccess(
        editingEntry
          ? 'Watchlist entry updated successfully.'
          : 'Watchlist entry added successfully.'
      )

      setShowModal(false)
      setEditingEntry(null)

      await loadWatchlist()
    } catch (err) {
      setError(
        err.message ||
          'Unable to save watchlist entry.'
      )
    } finally {
      setSaving(false)
    }
  }

  async function disableEntry(entry) {
    const confirmed = window.confirm(
      `Disable watchlist entry "${entry.identifier}"?`
    )

    if (!confirmed) return

    setError('')
    setSuccess('')

    try {
      const response = await fetch(
        `${API_BASE}/api/watchlist/${entry.id}/disable`,
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
          data.detail ||
            'Unable to disable watchlist entry.'
        )
      }

      setSuccess(
        'Watchlist entry disabled successfully.'
      )

      await loadWatchlist()
    } catch (err) {
      setError(
        err.message ||
          'Unable to disable watchlist entry.'
      )
    }
  }

  const activeCount = entries.filter(
    (entry) => entry.is_active !== false
  ).length

  const disabledCount = entries.filter(
    (entry) => entry.is_active === false
  ).length

  return (
    <div className="watchlist-page">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div
        className="topbar watchlist-page-header"
        style={{
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div>
          <div className="eyebrow">
            SECURITY INTELLIGENCE
          </div>

          <h1>Watchlist</h1>

          <small
            style={{
              color: '#607493',
              fontSize: 10,
            }}
          >
            Manage vehicle and entity identifiers used
            for real-time security matching.
          </small>
        </div>

        <button
          className="view-button"
          type="button"
          onClick={openAddModal}
        >
          + Add Watchlist
        </button>
      </div>

      {/* =====================================================
          MESSAGES
      ===================================================== */}

      {error && (
        <div
          className="alerts-error"
          style={{ marginBottom: 16 }}
        >
          {error}
        </div>
      )}

      {success && (
        <div
          className="watchlist-success"
          style={{
            marginBottom: 16,
            padding: '12px 14px',
            borderRadius: 8,
            border:
              '1px solid rgba(74,222,128,.25)',
            background:
              'rgba(74,222,128,.08)',
            color: '#4ade80',
            fontSize: 11,
          }}
        >
          {success}
        </div>
      )}

      {/* =====================================================
          STATS
      ===================================================== */}

      <div className="stats-grid watchlist-stats-grid">

        <div className="stat-card watchlist-stat-card">
          <div>
            <span>Total Entries</span>

            <strong>
              {entries.length}
            </strong>

            <small>
              Watchlist records
            </small>
          </div>
        </div>

        <div className="stat-card watchlist-stat-card">
          <div>
            <span>Active</span>

            <strong
              style={{
                color: '#4ade80',
              }}
            >
              {activeCount}
            </strong>

            <small>
              Currently monitored
            </small>
          </div>
        </div>

        <div className="stat-card watchlist-stat-card">
          <div>
            <span>Disabled</span>

            <strong
              style={{
                color: '#60a5fa',
              }}
            >
              {disabledCount}
            </strong>

            <small>
              Inactive records
            </small>
          </div>
        </div>

      </div>

      {/* =====================================================
          FILTERS
      ===================================================== */}

      <div
        className="panel watchlist-filter-panel"
        style={{ marginTop: 18 }}
      >
        <div className="panel-header">

          <div>
            <div className="panel-label">
              WATCHLIST CONTROL
            </div>

            <h2>
              Search & Filters
            </h2>
          </div>

          <button
            className="view-button"
            type="button"
            onClick={loadWatchlist}
            disabled={loading}
          >
            {loading
              ? 'Refreshing...'
              : '↻ Refresh'}
          </button>

        </div>

        <div
          className="watchlist-filter-grid"
          style={{
            display: 'grid',
            gridTemplateColumns:
              'minmax(220px, 2fr) repeat(2, minmax(160px, 1fr))',
            gap: 12,
          }}
        >

          <input
            className="watchlist-filter-input"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search identifier or name..."
            style={inputStyle}
          />

          <select
            className="watchlist-filter-input"
            value={entityType}
            onChange={(event) =>
              setEntityType(event.target.value)
            }
            style={inputStyle}
          >
            <option value="">
              All Entity Types
            </option>

            <option value="VEHICLE">
              Vehicle
            </option>

            <option value="PERSON">
              Person
            </option>

            <option value="OBJECT">
              Object
            </option>
          </select>

          <select
            className="watchlist-filter-input"
            value={category}
            onChange={(event) =>
              setCategory(event.target.value)
            }
            style={inputStyle}
          >
            <option value="">
              All Categories
            </option>

            <option value="SECURITY">
              Security
            </option>

            <option value="STOLEN">
              Stolen
            </option>

            <option value="SUSPICIOUS">
              Suspicious
            </option>

            <option value="VIP">
              VIP
            </option>

            <option value="OTHER">
              Other
            </option>
          </select>

        </div>
      </div>

      {/* =====================================================
          WATCHLIST TABLE
      ===================================================== */}

      <div
        className="panel watchlist-records-panel"
        style={{ marginTop: 18 }}
      >

        <div className="panel-header">

          <div>
            <div className="panel-label">
              REGISTERED IDENTIFIERS
            </div>

            <h2>
              Watchlist Records
            </h2>
          </div>

          <span className="alert-count">
            {entries.length}
          </span>

        </div>

        {loading && entries.length === 0 ? (
          <div className="camera-loading">
            Loading watchlist...
          </div>
        ) : entries.length === 0 ? (

          <div className="empty-state">
            <div className="empty-icon">
              ◇
            </div>

            <strong>
              No watchlist records
            </strong>

            <p>
              Add a vehicle or entity identifier to
              start monitoring matches.
            </p>
          </div>

        ) : (

          <div
            style={{
              overflowX: 'auto',
            }}
          >

            <table
              className="watchlist-table"
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                minWidth: 850,
              }}
            >

              <thead>
                <tr>

                  <th style={thStyle}>
                    Identifier
                  </th>

                  <th style={thStyle}>
                    Entity
                  </th>

                  <th style={thStyle}>
                    Category
                  </th>

                  <th style={thStyle}>
                    Description
                  </th>

                  <th style={thStyle}>
                    Status
                  </th>

                  <th
                    style={{
                      ...thStyle,
                      textAlign: 'right',
                    }}
                  >
                    Actions
                  </th>

                </tr>
              </thead>

              <tbody>

                {entries.map((entry) => (

                  <tr
                    key={entry.id}
                    className="watchlist-row"
                  >

                    {/* Identifier */}
                    <td style={tdStyle}>

                      <strong
                        style={{
                          color: '#f8fafc',
                          letterSpacing: '.4px',
                        }}
                      >
                        {entry.identifier}
                      </strong>

                      <small
                        style={{
                          display: 'block',
                          color: '#607493',
                          marginTop: 4,
                        }}
                      >
                        ID #{entry.id}
                      </small>

                    </td>

                    {/* Entity */}
                    <td style={tdStyle}>

                      <strong>
                        {entry.name}
                      </strong>

                      <small
                        style={{
                          display: 'block',
                          color: '#607493',
                          marginTop: 4,
                        }}
                      >
                        {entry.entity_type}
                      </small>

                    </td>

                    {/* Category */}
                    <td style={tdStyle}>

                      <span
                        className="watchlist-category-badge"
                        style={{
                          display:
                            'inline-flex',
                          padding: '6px 9px',
                          borderRadius: 14,
                          background:
                            'rgba(96,165,250,.10)',
                          color: '#60a5fa',
                          fontSize: 9,
                          fontWeight: 800,
                        }}
                      >
                        {entry.category ||
                          'OTHER'}
                      </span>

                    </td>

                    {/* Description */}
                    <td style={tdStyle}>

                      <span
                        style={{
                          color: '#8ea0bd',
                          fontSize: 10,
                        }}
                      >
                        {entry.description ||
                          'No description'}
                      </span>

                    </td>

                    {/* Status */}
                    <td style={tdStyle}>

                      <span
                        className="watchlist-status-badge"
                        style={{
                          display:
                            'inline-flex',
                          alignItems:
                            'center',
                          gap: 6,
                          padding: '6px 9px',
                          borderRadius: 14,
                          background:
                            entry.is_active !==
                            false
                              ? 'rgba(74,222,128,.10)'
                              : 'rgba(96,165,250,.10)',
                          color:
                            entry.is_active !==
                            false
                              ? '#4ade80'
                              : '#60a5fa',
                          fontSize: 9,
                          fontWeight: 800,
                        }}
                      >
                        ●{' '}
                        {entry.is_active !==
                        false
                          ? 'ACTIVE'
                          : 'DISABLED'}
                      </span>

                    </td>

                    {/* Actions */}
                    <td
                      style={{
                        ...tdStyle,
                        textAlign: 'right',
                        whiteSpace:
                          'nowrap',
                      }}
                    >

                      <button
                        type="button"
                        onClick={() =>
                          openEditModal(entry)
                        }
                        className="watchlist-action-button"
                        style={
                          actionButtonStyle
                        }
                      >
                        Edit
                      </button>

                      {entry.is_active !==
                        false && (
                        <button
                          type="button"
                          onClick={() =>
                            disableEntry(
                              entry
                            )
                          }
                          className="watchlist-action-button watchlist-disable-button"
                          style={{
                            ...actionButtonStyle,
                            color: '#fb7185',
                            borderColor:
                              'rgba(251,113,133,.25)',
                          }}
                        >
                          Disable
                        </button>
                      )}

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

      </div>

      {/* =====================================================
          ADD / EDIT MODAL
      ===================================================== */}

      {showModal && (

        <div
          className="watchlist-modal-overlay"
          style={modalOverlayStyle}
        >

          <div
            className="watchlist-modal"
            style={modalStyle}
          >

            <div
              style={{
                display: 'flex',
                justifyContent:
                  'space-between',
                alignItems:
                  'flex-start',
                gap: 20,
                marginBottom: 20,
              }}
            >

              <div>

                <div className="eyebrow">
                  SECURITY INTELLIGENCE
                </div>

                <h2
                  style={{
                    margin:
                      '6px 0 0',
                    color: '#f8fafc',
                  }}
                >
                  {editingEntry
                    ? 'Edit Watchlist Entry'
                    : 'Add Watchlist Entry'}
                </h2>

              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                className="watchlist-close-button"
                style={closeButtonStyle}
              >
                ×
              </button>

            </div>

            <form onSubmit={handleSubmit}>

              <div
                className="watchlist-form-grid"
                style={formGridStyle}
              >

                <div>
                  <label style={labelStyle}>
                    Entity Type
                  </label>

                  <select
                    name="entity_type"
                    value={
                      formData.entity_type
                    }
                    onChange={handleChange}
                    style={inputStyle}
                  >
                    <option value="VEHICLE">
                      VEHICLE
                    </option>

                    <option value="PERSON">
                      PERSON
                    </option>

                    <option value="OBJECT">
                      OBJECT
                    </option>
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>
                    Identifier
                  </label>

                  <input
                    name="identifier"
                    value={
                      formData.identifier
                    }
                    onChange={handleChange}
                    placeholder="DL01AB1234"
                    style={inputStyle}
                    required
                  />
                </div>

                <div>
                  <label style={labelStyle}>
                    Name
                  </label>

                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Suspicious Vehicle"
                    style={inputStyle}
                    required
                  />
                </div>

                <div>
                  <label style={labelStyle}>
                    Category
                  </label>

                  <select
                    name="category"
                    value={
                      formData.category
                    }
                    onChange={handleChange}
                    style={inputStyle}
                  >
                    <option value="SECURITY">
                      SECURITY
                    </option>

                    <option value="STOLEN">
                      STOLEN
                    </option>

                    <option value="SUSPICIOUS">
                      SUSPICIOUS
                    </option>

                    <option value="VIP">
                      VIP
                    </option>

                    <option value="OTHER">
                      OTHER
                    </option>
                  </select>
                </div>

              </div>

              <div
                style={{
                  marginTop: 14,
                }}
              >

                <label style={labelStyle}>
                  Description
                </label>

                <textarea
                  name="description"
                  value={
                    formData.description
                  }
                  onChange={handleChange}
                  placeholder="Optional notes about this watchlist entry..."
                  rows={4}
                  style={{
                    ...inputStyle,
                    height: 'auto',
                    padding: '11px 12px',
                    resize: 'vertical',
                  }}
                />

              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent:
                    'flex-end',
                  gap: 10,
                  marginTop: 20,
                }}
              >

                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="watchlist-modal-secondary"
                  style={
                    secondaryButtonStyle
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="watchlist-modal-primary"
                  style={
                    primaryButtonStyle
                  }
                >
                  {saving
                    ? 'Saving...'
                    : editingEntry
                      ? 'Update Entry'
                      : 'Add Entry'}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  )
}

/* =========================================================
   STYLES
========================================================= */

const inputStyle = {
  width: '100%',
  height: 40,
  padding: '0 11px',
  borderRadius: 7,
  border: '1px solid #30415e',
  background: '#0d1626',
  color: '#f8fafc',
  outline: 'none',
  fontSize: 11,
  boxSizing: 'border-box',
}

const thStyle = {
  padding: '12px 10px',
  textAlign: 'left',
  color: '#607493',
  fontSize: 9,
  fontWeight: 800,
  letterSpacing: '.8px',
  textTransform: 'uppercase',
  borderBottom: '1px solid #24344f',
}

const tdStyle = {
  padding: '15px 10px',
  borderBottom:
    '1px solid rgba(48,65,94,.55)',
  color: '#b8c7da',
  fontSize: 10,
  verticalAlign: 'middle',
}

const actionButtonStyle = {
  height: 30,
  padding: '0 10px',
  marginLeft: 6,
  borderRadius: 6,
  border: '1px solid #30415e',
  background: '#101c30',
  color: '#60a5fa',
  fontSize: 9,
  fontWeight: 700,
  cursor: 'pointer',
}

const modalOverlayStyle = {
  position: 'fixed',
  inset: 0,
  zIndex: 9999,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 20,
  background: 'rgba(2,8,20,.78)',
  backdropFilter: 'blur(5px)',
}

const modalStyle = {
  width: '100%',
  maxWidth: 650,
  maxHeight: '90vh',
  overflowY: 'auto',
  padding: 24,
  borderRadius: 12,
  border: '1px solid #30415e',
  background: '#101b2d',
  boxShadow:
    '0 25px 80px rgba(0,0,0,.45)',
}

const formGridStyle = {
  display: 'grid',
  gridTemplateColumns:
    'repeat(2, minmax(0, 1fr))',
  gap: 14,
}

const labelStyle = {
  display: 'block',
  marginBottom: 7,
  color: '#8ea0bd',
  fontSize: 9,
  fontWeight: 700,
  letterSpacing: '.4px',
  textTransform: 'uppercase',
}

const primaryButtonStyle = {
  height: 40,
  padding: '0 18px',
  border: 0,
  borderRadius: 7,
  background: '#2563eb',
  color: '#fff',
  fontWeight: 700,
  fontSize: 10,
  cursor: 'pointer',
}

const secondaryButtonStyle = {
  height: 40,
  padding: '0 18px',
  border: '1px solid #30415e',
  borderRadius: 7,
  background: '#101c30',
  color: '#b8c7da',
  fontWeight: 700,
  fontSize: 10,
  cursor: 'pointer',
}

const closeButtonStyle = {
  width: 32,
  height: 32,
  borderRadius: 7,
  border: '1px solid #30415e',
  background: '#0d1626',
  color: '#8ea0bd',
  fontSize: 20,
  cursor: 'pointer',
}