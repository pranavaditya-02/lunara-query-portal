"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import { login } from "../../services/api"
import Footer from "../../components/Footer/Footer"
import "./LoginPage.css"

function LoginPage({ onLogin }) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!username.trim() || !password.trim()) {
      setError("Username and password are required")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const result = await login({ username, password })

      if (result.status === "success") {
        toast.success("Login successful")
        onLogin(true)
        navigate("/dashboard")
      } else {
        setError(result.message || "Invalid username or password")
        toast.error(result.message || "Invalid username or password")
      }
    } catch (error) {
      setError("An unexpected error occurred. Please try again.")
      toast.error("Login failed")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="login-page">
      <header className="login-header">
        <div className="container">
          <Link to="/" className="logo">
            <h1>Lunara Query Portal</h1>
          </Link>
        </div>
      </header>

      <main className="container login-content">
        <div className="login-card">
          <div className="card-header">
            <h2 className="card-title">Coordinator Login</h2>
            <p className="card-description">Login to access the coordinator dashboard and respond to queries.</p>
          </div>
          <div className="card-content">
            <form onSubmit={handleSubmit} className="login-form">
              {error && <div className="error-message">{error}</div>}

              <div className="form-group">
                <label className="form-label" htmlFor="username">
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  className="form-input"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="password">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  className="form-input"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary btn-block" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <span className="spinner"></span>
                    Logging in...
                  </>
                ) : (
                  "Login"
                )}
              </button>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default LoginPage

