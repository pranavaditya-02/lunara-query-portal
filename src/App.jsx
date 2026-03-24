"use client"

import { HashRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { useState, useEffect } from "react"
import HomePage from "./screens/HomePage/HomePage"
import LoginPage from "./screens/LoginPage/LoginPage"
import DashboardPage from "./screens/DashboardPage/DashboardPage"
import { checkAuthSession, logout as logoutApi } from "./services/api"
import "./App.css"

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authChecked, setAuthChecked] = useState(false) // Add this state
  
  useEffect(() => {
    const checkAuth = async () => {
      const authenticated = await checkAuthSession()
      setIsAuthenticated(authenticated)
      setAuthChecked(true)
    }
    
    checkAuth()
  }, [])
  
  // Protected route component with loading state
  const ProtectedRoute = ({ children }) => {
    // Return null or a loading indicator while checking auth status
    if (!authChecked) {
      return <div className="loading">Loading...</div>
    }
    
    if (!isAuthenticated) {
      return <Navigate to="/login" />
    }
    
    return children
  }
  
  const handleLogin = (status) => {
    setIsAuthenticated(status)
  }
  
  const handleLogout = async () => {
    await logoutApi()
    setIsAuthenticated(false)
  }
  
  return (
    <Router>
      <div className="app">
        <ToastContainer position="top-right" autoClose={3000} />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route 
            path="/login" 
            element={
              isAuthenticated ? 
                <Navigate to="/dashboard" /> : 
                <LoginPage onLogin={handleLogin} />
            } 
          />
          <Route 
            path="/dashboard/*" 
            element={
              <ProtectedRoute>
                <DashboardPage onLogout={handleLogout} />
              </ProtectedRoute>
            } 
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App