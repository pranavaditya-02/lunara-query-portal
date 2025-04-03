"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import { Menu, X } from "lucide-react"
import "./DashboardHeader.css"

function DashboardHeader({ onLogout }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  return (
    <header className="dashboard-header">
      <div className="container dashboard-header-container">
        <div className="dashboard-logo">
          <Link to="/dashboard">
            <h1>Lunara Dashboard</h1>
          </Link>
        </div>

        {/* Mobile menu button */}
        <button className="dashboard-toggle" onClick={toggleMenu} aria-label="Toggle menu">
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <nav className={`dashboard-actions ${isMenuOpen ? "dashboard-actions-open" : ""}`}>
          <button className="btn btn-logout" onClick={onLogout}>
            Logout
          </button>
        </nav>
      </div>
    </header>
  )
}

export default DashboardHeader

