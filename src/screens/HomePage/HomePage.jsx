"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { toast } from "react-toastify"
import Navbar from "../../components/Navbar/Navbar"
import Footer from "../../components/Footer/Footer"
import QueryList from "../../components/QueryList/QueryList"
import QueryFormModal from "../../components/QueryFormModal/QueryFormModal"
import { fetchQueries } from "../../services/api"
import "./HomePage.css"

function HomePage() {
  const [queries, setQueries] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const getQueries = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await fetchQueries()
        setQueries(data)
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

  const handleQuerySubmitted = async () => {
    setShowModal(false)
    try {
      setLoading(true)
      setError(null)
      const data = await fetchQueries()
      setQueries(data)
      toast.success("Query submitted successfully!")
    } catch (error) {
      console.error("Failed to refresh queries:", error)
      setError("Failed to refresh queries. Please try again.")
      toast.error("Failed to refresh queries")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="home-page">
      <Navbar>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          Add Query
        </button>
        <Link to="/login" className="btn btn-outline">
          Coordinator Login
        </Link>
      </Navbar>

      <main className="container main-content">
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Recent Queries</h2>
            <p className="card-description">View recent queries and their responses</p>
          </div>
          <div className="card-content">
            {error ? <div className="error-message">{error}</div> : <QueryList queries={queries} loading={loading} />}
          </div>
        </div>
      </main>

      <Footer />

      {showModal && <QueryFormModal onClose={() => setShowModal(false)} onSuccess={handleQuerySubmitted} />}
    </div>
  )
}

export default HomePage

