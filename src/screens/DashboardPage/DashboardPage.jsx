"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { toast } from "react-toastify"
import DashboardHeader from "../../components/DashboardHeader/DashboardHeader"
import Footer from "../../components/Footer/Footer"
import DashboardQueries from "../../components/DashboardQueries/DashboardQueries"
import { fetchQueries } from "../../services/api"
import "./DashboardPage.css"

function DashboardPage({ onLogout }) {
  const [queries, setQueries] = useState([])
  const [filteredQueries, setFilteredQueries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    const getQueries = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await fetchQueries()
        setQueries(data)
        setFilteredQueries(data)
      } catch (error) {
        console.error("Failed to fetch queries:", error)
        setError("Failed to load queries. Please refresh the page.")
        toast.error("Failed to load queries")
      } finally {
        setLoading(false)
      }
    }

    getQueries()
  }, [])

  useEffect(() => {
    // Filter queries based on search term
    if (searchTerm.trim() === "") {
      setFilteredQueries(queries)
    } else {
      const term = searchTerm.toLowerCase()
      const filtered = queries.filter(
        (query) =>
          (query.name && query.name.toLowerCase().includes(term)) ||
          (query.query && query.query.toLowerCase().includes(term))
      )
      setFilteredQueries(filtered)
    }
  }, [searchTerm, queries])

  const handleQueryUpdated = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await fetchQueries()
      setQueries(data)
      setFilteredQueries(data)
      toast.success("Query updated successfully")
    } catch (error) {
      console.error("Failed to refresh queries:", error)
      setError("Failed to refresh queries after update.")
      toast.error("Failed to refresh queries")
    } finally {
      setLoading(false)
    }
  }

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value)
  }

  return (
    <div className="dashboard-page">
      <DashboardHeader onLogout={onLogout} />

      <main className="container dashboard-content">
        <div className="dashboard-header">
          <h1 className="dashboard-title">Coordinator Dashboard</h1>
          <Link to="/" className="btn btn-outline">
            View Public Portal
          </Link>
        </div>

        <div className="search-container">
          <input
            type="text"
            className="search-input"
            placeholder="Search by name or query content..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>

        {error ? (
          <div className="error-message">{error}</div>
        ) : (
          <DashboardQueries 
            queries={filteredQueries} 
            loading={loading} 
            onQueryUpdated={handleQueryUpdated} 
          />
        )}
      </main>

      <Footer />
    </div>
  )
}

export default DashboardPage