"use client"

import { useState } from "react"
import "./LoginForm.css"

function LoginForm({ onLogin }) {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validate = () => {
    const newErrors = {}

    if (!formData.username.trim()) {
      newErrors.username = "Username is required"
    }

    if (!formData.password) {
      newErrors.password = "Password is required"
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
      const success = await onLogin(formData)

      if (!success) {
        setIsSubmitting(false)
      }
    } catch (error) {
      setIsSubmitting(false)
    }
  }

  return (
    <form className="login-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label className="form-label" htmlFor="username">
          Username
        </label>
        <input
          type="text"
          id="username"
          name="username"
          className={`form-input ${errors.username ? "form-input-error" : ""}`}
          placeholder="Enter your username"
          value={formData.username}
          onChange={handleChange}
          disabled={isSubmitting}
        />
        {errors.username && <p className="form-error">{errors.username}</p>}
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="password">
          Password
        </label>
        <input
          type="password"
          id="password"
          name="password"
          className={`form-input ${errors.password ? "form-input-error" : ""}`}
          placeholder="Enter your password"
          value={formData.password}
          onChange={handleChange}
          disabled={isSubmitting}
        />
        {errors.password && <p className="form-error">{errors.password}</p>}
      </div>

      <button type="submit" className="btn btn-primary btn-block" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <span className="spinner"></span>
            Logging in...
          </>
        ) : (
          "Login"
        )}
      </button>
    </form>
  )
}

export default LoginForm

