"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import { Menu, X } from "lucide-react"
import "./Navbar.css"

function Navbar({ children }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  return (
    <header className="navbar">
      <div className="container navbar-container">
        <div className="navbar-logo">
          <Link to="/">
            <h1>Lunara Query Portal</h1>
          </Link>
        </div>

        {/* Mobile menu button */}
        <button className="navbar-toggle" onClick={toggleMenu} aria-label="Toggle menu">
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Navigation items */}
        <nav className={`navbar-actions ${isMenuOpen ? "navbar-actions-open" : ""}`}>{children}</nav>
      </div>
    </header>
  )
}

export default Navbar

