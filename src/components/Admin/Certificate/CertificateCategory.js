// CertificationCategories.js
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Sidebar from "../Layout/Sidebar";
import Header from "../Layout/Header";
import "./Certificate.css";
import { FaArrowLeft } from "react-icons/fa";
import { BASE_URL } from "../../../ApiUrl";

const CertificationCategories = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: ""
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [categoryId, setCategoryId] = useState(null);

  // API Base URL
  const API_URL = `${BASE_URL}/api/admin/certification-categories/`;

  // Check if we're in edit mode when component mounts
  useEffect(() => {
    const state = location.state;
    if (state && state.isEditing && state.categoryToEdit) {
      setIsEditing(true);
      setCategoryId(state.categoryToEdit.id);
      setFormData({
        name: state.categoryToEdit.name,
        description: state.categoryToEdit.description || ""
      });
    }
  }, [location]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const url = isEditing ? `${API_URL}${categoryId}/` : API_URL;
      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to ${isEditing ? 'update' : 'create'} category`);
      }

      const savedCategory = await response.json();
      setSuccess(`Category ${isEditing ? 'updated' : 'created'} successfully!`);
      
      // Navigate back to certifications page after 2 seconds
      setTimeout(() => {
        navigate('/certificate');
      }, 2000);
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(""), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ta-layout-wrapper">
      <Sidebar />

      <div className="ta-main-wrapper">
        <Header />

        <div className="ta-content-area">
          <div className="cert-wrapper">
            {/* Page Header */}
            <div className="cert-header d-flex justify-content-between align-items-center">
              <div>
                <div className="d-flex align-items-center gap-3">
                  <button 
                    className="btn btn-back"
                    onClick={() => navigate('/certificate')}
                  >
                    <FaArrowLeft /> Back
                  </button>
                  <div>
                    <h2>{isEditing ? 'Edit' : 'Add'} Certification Category</h2>
                    <p>{isEditing ? 'Update' : 'Create a new'} certification category</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Success/Error Messages */}
            {success && (
              <div className="alert alert-success alert-dismissible fade show mt-3" role="alert">
                {success}
                <button type="button" className="btn-close" onClick={() => setSuccess("")}></button>
              </div>
            )}
            {error && (
              <div className="alert alert-danger alert-dismissible fade show mt-3" role="alert">
                {error}
                <button type="button" className="btn-close" onClick={() => setError("")}></button>
              </div>
            )}

            {/* Category Form Section */}
            <div className="category-form-section mt-4">
              <div className="cert-card">
                <div className="form-header">
                  <h5>{isEditing ? 'Edit' : 'Create New'} Certification Category</h5>
                </div>
                
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="name" className="form-label">Category Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter category name"
                      autoFocus
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="description" className="form-label">Description</label>
                    <textarea
                      className="form-control"
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows="4"
                      placeholder="Enter category description"
                    />
                  </div>
                  <div className="d-flex justify-content-end gap-2">
                    <button 
                      type="button" 
                      className="btn btn-secondary" 
                      onClick={() => navigate('/certificate')}
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="btn btn-primary"
                      disabled={loading}
                    >
                      {loading ? (isEditing ? "Updating..." : "Creating...") : (isEditing ? "Update Category" : "Create Category")}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CertificationCategories;