"use client"

import { useState } from "react"
import { toast } from "react-toastify"
import { ChevronDown } from "lucide-react"
import { updateQuery } from "../../services/api"
import "./DashboardQueries.css"

function DashboardQueries({ queries, loading, onQueryUpdated }) {
  const [responses, setResponses] = useState({})
  const [statuses, setStatuses] = useState({})
  const [submitting, setSubmitting] = useState({})
  const [expandedQueries, setExpandedQueries] = useState({})
  const [openDropdowns, setOpenDropdowns] = useState({})

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
    // Close the dropdown after selection
    toggleDropdown(id)
  }

  const toggleDropdown = (id) => {
    setOpenDropdowns((prev) => ({
      ...prev,
      [id]: !prev[id],
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
        answer: responses[queryId] || query.answer,
        status: statuses[queryId] || query.status,
      })

      if (onQueryUpdated) {
        onQueryUpdated()
      }
    } catch (error) {
      toast.error("Failed to update query. Please try again.")
    } finally {
      setSubmitting((prev) => ({
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

  return (
    <div className="dashboard-queries">
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Manage Queries</h2>
          <p className="card-description">Respond to user queries and update their status</p>
        </div>
        <div className="card-content">
          <div className="query-grid">
            {queries.map((query) => (
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

                    <div className="response-actions">
                      <div className="form-group status-select">
                        <label className="form-label">Status</label>
                        <div className="custom-select-wrapper">
                          <button
                            type="button"
                            className="custom-select-button"
                            onClick={() => toggleDropdown(query.id)}
                            disabled={submitting[query.id]}
                          >
                            {statuses[query.id] || query.status}
                            <ChevronDown
                              size={16}
                              className={`dropdown-icon ${openDropdowns[query.id] ? "open" : ""}`}
                            />
                          </button>
                          {openDropdowns[query.id] && (
                            <div className="custom-select-dropdown">
                              <div
                                className="custom-select-option"
                                onClick={() => handleStatusChange(query.id, "pending")}
                              >
                                pending
                              </div>
                              <div
                                className="custom-select-option"
                                onClick={() => handleStatusChange(query.id, "resolved")}
                              >
                                resolved
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <button
                        className="btn btn-primary"
                        onClick={() => handleSubmit(query)}
                        disabled={submitting[query.id] || (!responses[query.id] && !query.answer)}
                      >
                        {submitting[query.id] ? (
                          <>
                            <span className="spinner"></span>
                            Submitting...
                          </>
                        ) : (
                          "Submit Response"
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardQueries

