"use client"

import { useState, useEffect } from "react"
import { toast } from "react-toastify"
import { updateQuery, deleteQuery } from "../../services/api"
import "./DashboardQueries.css"

function DashboardQueries({ queries, loading, onQueryUpdated }) {
  const [responses, setResponses] = useState({})
  const [statuses, setStatuses] = useState({})
  const [submitting, setSubmitting] = useState({})
  const [expandedQueries, setExpandedQueries] = useState({})
  const [deleting, setDeleting] = useState({})
  const [activeFilter, setActiveFilter] = useState("all") // 'all', 'pending', or 'resolved'
  const [filteredQueries, setFilteredQueries] = useState([])

  // Apply filtering whenever queries or activeFilter changes
  useEffect(() => {
    if (!queries) return
    
    if (activeFilter === "all") {
      setFilteredQueries(queries)
    } else {
      setFilteredQueries(queries.filter(query => query.status === activeFilter))
    }
  }, [queries, activeFilter])

  const handleResponseChange = (id, value) => {
    setResponses((prev) => ({
      ...prev,
      [id]: value,
    }))
  }

  const handleStatusChange = (id, value) => {
    setStatuses((prev) => ({
      ...prev,
      [id]: value,
    }))
  }

  const toggleExpand = (id) => {
    setExpandedQueries((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  const handleSubmit = async (query) => {
    const queryId = query.id

    setSubmitting((prev) => ({
      ...prev,
      [queryId]: true,
    }))

    try {
      await updateQuery({
        id: queryId,
        answer: responses[queryId] !== undefined ? responses[queryId] : query.answer || "",
        status: statuses[queryId] || query.status,
      })

      if (onQueryUpdated) {
        onQueryUpdated()
      }
      
      toast.success("Query updated successfully")
    } catch (error) {
      toast.error("Failed to update query. Please try again.")
    } finally {
      setSubmitting((prev) => ({
        ...prev,
        [queryId]: false,
      }))
    }
  }

  const handleDelete = async (query) => {
    const queryId = query.id

    setDeleting((prev) => ({
      ...prev,
      [queryId]: true,
    }))

    try {
      // Now using the actual deleteQuery API function
      await deleteQuery(queryId)
      
      if (onQueryUpdated) {
        onQueryUpdated()
      }
      
      toast.success("Query deleted successfully")
    } catch (error) {
      toast.error("Failed to delete query. Please try again.")
    } finally {
      setDeleting((prev) => ({
        ...prev,
        [queryId]: false,
      }))
    }
  }

  if (loading) {
    return (
      <div className="dashboard-queries-loading">
        <div className="spinner"></div>
        <p>Loading queries...</p>
      </div>
    )
  }

  if (!queries || queries.length === 0) {
    return (
      <div className="dashboard-queries-empty">
        <p>No queries have been submitted yet.</p>
      </div>
    )
  }

  // Calculate counts for each status
  const pendingCount = queries ? queries.filter(q => q.status === "pending").length : 0
  const resolvedCount = queries ? queries.filter(q => q.status === "resolved").length : 0
  const totalCount = queries ? queries.length : 0

  return (
    <div className="dashboard-queries">
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Manage Queries</h2>
          <p className="card-description">Respond to user queries and update their status</p>
          
          {/* Filter Chips */}
          <div className="filter-chips">
            <button 
              className={`filter-chip ${activeFilter === "all" ? "active" : ""}`}
              onClick={() => setActiveFilter("all")}
            >
              All ({totalCount})
            </button>
            <button 
              className={`filter-chip ${activeFilter === "pending" ? "active" : ""}`}
              onClick={() => setActiveFilter("pending")}
            >
              Pending ({pendingCount})
            </button>
            <button 
              className={`filter-chip ${activeFilter === "resolved" ? "active" : ""}`}
              onClick={() => setActiveFilter("resolved")}
            >
              Resolved ({resolvedCount})
            </button>
          </div>
        </div>

        <div className="card-content">
          {filteredQueries.length === 0 ? (
            <div className="dashboard-queries-empty">
              <p>No {activeFilter !== "all" ? activeFilter : ""} queries found.</p>
            </div>
          ) : (
            <div className="query-grid">
              {filteredQueries.map((query) => (
                <div key={query.id} className="query-response-card">
                  <div className="query-response-header">
                    <div className="query-user-info">
                      <h3 className="query-user-name">{query.name}</h3>
                      <p className="query-timestamp">{new Date(query.timestamp).toLocaleString()}</p>
                    </div>
                    <span className={`badge ${query.status === "resolved" ? "badge-resolved" : "badge-pending"}`}>
                      {query.status}
                    </span>
                  </div>

                  <div className="query-response-content">
                    <div className="query-text">
                      <p className="query-label">Query:</p>
                      <p className={`query-content ${!expandedQueries[query.id] && "collapsed"}`}>{query.query}</p>
                      {query.query.length > 100 && (
                        <button className="expand-btn" onClick={() => toggleExpand(query.id)}>
                          {expandedQueries[query.id] ? "Show less" : "Show more"}
                        </button>
                      )}
                    </div>

                    <div className="response-form">
                      <div className="form-group">
                        <label className="form-label">Your Response</label>
                        <textarea
                          className="form-textarea"
                          placeholder="Type your response here..."
                          value={responses[query.id] !== undefined ? responses[query.id] : query.answer || ""}
                          onChange={(e) => handleResponseChange(query.id, e.target.value)}
                          disabled={submitting[query.id]}
                        ></textarea>
                      </div>

                      <div className="status-row">
                        <label className="form-label">Status</label>
                        <select
                          className="form-select"
                          value={statuses[query.id] || query.status}
                          onChange={(e) => handleStatusChange(query.id, e.target.value)}
                          disabled={submitting[query.id]}
                        >
                          <option value="pending">pending</option>
                          <option value="resolved">resolved</option>
                        </select>
                      </div>

                      <div className="buttons-row">
                        <button
                          className="query-btn query-btn-danger"
                          onClick={() => handleDelete(query)}
                          disabled={deleting[query.id]}
                        >
                          {deleting[query.id] ? (
                            <>
                              <span className="spinner"></span>
                              Deleting...
                            </>
                          ) : (
                            "Delete Query"
                          )}
                        </button>
                        
                        <button
                          className="query-btn query-btn-primary"
                          onClick={() => handleSubmit(query)}
                          disabled={submitting[query.id] || (!responses[query.id] && !query.answer)}
                        >
                          {submitting[query.id] ? (
                            <>
                              <span className="spinner"></span>
                              Submitting...
                            </>
                          ) : (
                            "Submit"
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default DashboardQueries