"use client";

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import QueryList from "../../components/QueryList/QueryList";
import QueryFormModal from "../../components/QueryFormModal/QueryFormModal";
import { fetchQueries } from "../../services/api";
import "./HomePage.css";

function HomePage() {
  const [queries, setQueries] = useState([]);
  const [filteredQueries, setFilteredQueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const getQueries = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchQueries();
        const resolvedQueries = data.filter(
          (query) => query.status === "resolved"
        );
        setQueries(resolvedQueries);
        setFilteredQueries(resolvedQueries);
      } catch (error) {
        console.error("Failed to fetch queries:", error);
        setError("Failed to load queries. Please refresh the page.");
        toast.error("Failed to load queries");
      } finally {
        setLoading(false);
      }
    };

    getQueries();
  }, []);

  useEffect(() => {
    // Filter queries based on search term
    if (searchTerm.trim() === "") {
      setFilteredQueries(queries);
    } else {
      const term = searchTerm.toLowerCase();
      const filtered = queries.filter(
        (query) =>
          (query.name && query.name.toLowerCase().includes(term)) ||
          (query.query && query.query.toLowerCase().includes(term))
      );
      setFilteredQueries(filtered);
    }
  }, [searchTerm, queries]);

  const handleQuerySubmitted = async () => {
    setShowModal(false);
    try {
      setLoading(true);
      setError(null);
      const data = await fetchQueries();
      const resolvedQueries = data.filter(
        (query) => query.status === "resolved"
      );
      setQueries(resolvedQueries);
      setFilteredQueries(resolvedQueries);
      toast.success("Query submitted successfully!");
    } catch (error) {
      console.error("Failed to refresh queries:", error);
      setError("Failed to refresh queries. Please try again.");
      toast.error("Failed to refresh queries");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

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
            <p className="card-description">
              View recent queries and their responses
            </p>
            <div className="search-container">
              <input
                type="text"
                className="search-input"
                placeholder="Search by name or query content..."
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>
          </div>
          <div className="card-content">
            {error ? (
              <div className="error-message">{error}</div>
            ) : (
              <QueryList queries={filteredQueries} loading={loading} />
            )}
          </div>
        </div>
      </main>

      <Footer />

      {showModal && (
        <QueryFormModal
          onClose={() => setShowModal(false)}
          onSuccess={handleQuerySubmitted}
        />
      )}
    </div>
  );
}

export default HomePage;