"use client"

import { useState } from "react"
import { toast } from "react-toastify"
import { submitQuery } from "../../services/api"
import "./QueryFormModal.css"

function QueryFormModal({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: "",
    query: "",
  })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validate = () => {
    const newErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = "Name is required"
    }

    if (!formData.query.trim()) {
      newErrors.query = "Query is required"
    } else if (formData.query.trim().length < 10) {
      newErrors.query = "Query must be at least 10 characters"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validate()) return

    setIsSubmitting(true)

    try {
      await submitQuery({
        ...formData,
        status: "pending",
        timestamp: new Date().toISOString(),
      })

      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      toast.error("Failed to submit query. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClickOutside = (e) => {
    if (e.target.className === "modal-overlay") {
      onClose()
    }
  }

  return (
    <div className="modal-overlay" onClick={handleClickOutside}>
      <div className="modal-content">
        <div className="modal-header">
          <h2 className="modal-title">Submit a Query</h2>
          <p className="modal-description">
            Have a question about the Lunara event? Submit your query here and our coordinators will respond shortly.
          </p>
        </div>
        <div className="modal-body">
          <form className="query-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="name">
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                className={`form-input ${errors.name ? "form-input-error" : ""}`}
                placeholder="Your name"
                value={formData.name}
                onChange={handleChange}
                disabled={isSubmitting}
              />
              {errors.name && <p className="form-error">{errors.name}</p>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="query">
                Query
              </label>
              <textarea
                id="query"
                name="query"
                className={`form-textarea ${errors.query ? "form-textarea-error" : ""}`}
                placeholder="Type your question here..."
                value={formData.query}
                onChange={handleChange}
                disabled={isSubmitting}
              ></textarea>
              {errors.query && <p className="form-error">{errors.query}</p>}
            </div>
            
            <div className="form-note glass-effect">
              <p>Note: Your query has been submitted and will appear on the coordinators' dashboard for review. A response will be provided shortly. Please check back in 10–20 minutes for an update.</p>
            </div>

            <div className="form-actions">
              <button type="button" className="btn btn-outline" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <span className="spinner"></span>
                    Submitting...
                  </>
                ) : (
                  "Submit Query"
                )}
              </button>
            </div>
          </form>
        </div>
        <button className="modal-close" onClick={onClose}>
          ×
        </button>
      </div>
    </div>
  )
}

export default QueryFormModal