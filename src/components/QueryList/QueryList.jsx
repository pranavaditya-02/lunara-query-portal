"use client"

import { useState } from "react"
import "./QueryList.css"

function QueryList({ queries, loading }) {
  const [expandedQueries, setExpandedQueries] = useState({})

  const toggleExpand = (id) => {
    setExpandedQueries((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  if (loading) {
    return (
      <div className="query-list-loading">
        <div className="spinner"></div>
        <p>Loading queries...</p>
      </div>
    )
  }

  if (!queries || queries.length === 0) {
    return (
      <div className="query-list-empty">
        <p>No queries have been submitted yet.</p>
      </div>
    )
  }

  return (
    <div className="query-list">
      {queries.map((query, index) => (
        <div key={query.id || index} className="query-card">
          <div className="query-card-header">
            <div className="query-user-info">
              <h3 className="query-user-name">{query.name}</h3>
              <p className="query-timestamp">{new Date(query.timestamp).toLocaleString()}</p>
            </div>
            <span className={`badge ${query.status === "resolved" ? "badge-resolved" : "badge-pending"}`}>
              {query.status}
            </span>
          </div>

          <div className="query-card-content">
            <div className="query-text">
              <p className="query-label">Query:</p>
              <p className={`query-content ${!expandedQueries[query.id] && "collapsed"}`}>{query.query}</p>
              {query.query.length > 100 && (
                <button className="expand-btn" onClick={() => toggleExpand(query.id)}>
                  {expandedQueries[query.id] ? "Show less" : "Show more"}
                </button>
              )}
            </div>

            {query.answer && (
              <div className="query-answer">
                <p className="query-label">Response:</p>
                <p className={`query-content ${!expandedQueries[query.id] && "collapsed"}`}>{query.answer}</p>
                {query.answer.length > 100 && !expandedQueries[query.id] && (
                  <button className="expand-btn" onClick={() => toggleExpand(query.id)}>
                    Show more
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="query-card-footer">{query.status === "pending" ? "Awaiting response" : "Query resolved"}</div>
        </div>
      ))}
    </div>
  )
}

export default QueryList

