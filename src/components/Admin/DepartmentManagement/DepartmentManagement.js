import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../Layout/Sidebar";
import Header from "../Layout/Header";
import "./DepartmentManagement.css";
import { FaPlus, FaEdit, FaClock, FaUsers, FaTrash } from "react-icons/fa";
import Swal from "sweetalert2";
import { BASE_URL } from "../../../ApiUrl";

const DepartmentManagement = () => {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BASE_URL}/api/admin/departments/`);
      const data = await response.json();
      
      if (data.status) {
        setDepartments(data.data);
        setError(null);
      } else {
        setError(data.message || 'Failed to fetch departments');
      }
    } catch (err) {
      setError('Error connecting to server');
      console.error('Error fetching departments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddDepartment = () => {
    navigate('/department/add');
  };

  const handleEditDepartment = (id) => {
    navigate(`/department/edit/${id}`);
  };

  const handleDeleteDepartment = async (id, departmentName) => {
    // Show confirmation dialog
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `You are about to delete "${departmentName}". This action cannot be undone!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    });

    if (!result.isConfirmed) return;

    setDeleteLoading(true);

    try {
      const response = await fetch(`${BASE_URL}/api/admin/departments/${id}/`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to delete department');
      }
      
      // Remove the deleted department from state - FIXED: using id instead of department_id
      setDepartments(prev => prev.filter(dept => dept.id !== id));
      
      await Swal.fire({
        icon: 'success',
        title: 'Deleted!',
        text: 'Department has been deleted successfully.',
        timer: 2000,
        showConfirmButton: false
      });
    } catch (err) {
      console.error('Error deleting department:', err);
      
      Swal.fire({
        icon: 'error',
        title: 'Delete Failed',
        text: err.message || 'Failed to delete department. Please try again.',
        timer: 3000,
        showConfirmButton: true
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  // Calculate stats from actual data
  const totalDepartments = departments.length;
  const totalDuration = departments.reduce((sum, dept) => sum + (dept.duration_months || 0), 0);
  const activeDepartments = departments.filter(dept => dept.is_active).length;

  // Helper function to check if value is placeholder
  const isPlaceholder = (value) => {
    return value === "string" || value === 2147483647;
  };

  // Format text to handle placeholders
  const formatText = (text) => {
    if (isPlaceholder(text)) return "Not specified";
    return text;
  };

  if (loading) {
    return (
      <div className="ta-layout-wrapper">
        <Sidebar />
        <div className="ta-main-wrapper">
          <Header />
          <div className="ta-content-area">
            <div className="dm-wrapper text-center">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ta-layout-wrapper">
        <Sidebar />
        <div className="ta-main-wrapper">
          <Header />
          <div className="ta-content-area">
            <div className="dm-wrapper">
              <div className="alert alert-danger" role="alert">
                Error: {error}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ta-layout-wrapper">
      <Sidebar />

      <div className="ta-main-wrapper">
        <Header />

        <div className="ta-content-area">
          <div className="dm-wrapper">

            {/* Header */}
            <div className="dm-header">
              <div>
                <h2>Department Management</h2>
                <p>Configure department rotation requirements and settings</p>
              </div>

              <button 
                className="btn btn-primary dm-add-btn"
                onClick={handleAddDepartment}
                disabled={deleteLoading}
              >
                <FaPlus /> Add Department
              </button>
            </div>

            {/* Stats */}
            <div className="row g-4 mb-4">
              <StatBox title="Total Departments" value={totalDepartments} />
              <StatBox title="Active Departments" value={activeDepartments} />
              <StatBox title="Total Duration (Months)" value={totalDuration} />
              <StatBox title="Candidates in Rotation" value="0" />
            </div>

            {/* Department Cards */}
            {departments.length === 0 ? (
              <div className="alert alert-info text-center py-4">
                <p className="mb-0">No departments found. Click "Add Department" to create one.</p>
              </div>
            ) : (
              <div className="row g-4">
                {departments.map((dept) => (
                  <DeptCard
                    key={dept.id} // FIXED: using id instead of department_id
                    id={dept.id} // FIXED: using id instead of department_id
                    title={formatText(dept.name)}
                    desc={formatText(dept.description)}
                    min={!isPlaceholder(dept.duration_months) ? `${dept.duration_months} months` : 'Not specified'}
                    hours={!isPlaceholder(dept.duration_months) ? `${dept.duration_months * 4 * 40}h` : 'N/A'}
                    rotations="0"
                    candidates="0"
                    requiredCertifications={formatText(dept.required_certifications)}
                    isActive={dept.is_active}
                    code={formatText(dept.code)}
                    isPlaceholder={isPlaceholder(dept.name) || isPlaceholder(dept.code)}
                    onEdit={handleEditDepartment}
                    onDelete={handleDeleteDepartment}
                    deleteLoading={deleteLoading}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ---------- Components ---------- */

const StatBox = ({ title, value }) => (
  <div className="col-lg-3 col-md-6">
    <div className="dm-stat-card">
      <p>{title}</p>
      <h3>{value}</h3>
    </div>
  </div>
);

const DeptCard = ({ 
  id, 
  title, 
  desc, 
  min, 
  hours, 
  rotations, 
  candidates, 
  requiredCertifications, 
  isActive, 
  code, 
  isPlaceholder,
  onEdit, 
  onDelete,
  deleteLoading 
}) => (
  <div className={`col-lg-4 col-md-6`}>
    <div className={`dm-card ${isPlaceholder ? 'dm-card-placeholder' : ''}`}>
        <div className="dm-card-header">
          <div className="dm-header-left">
            <div className="dm-icon">🏢</div>
            <h5 className="dm-title">
              {title} {code && code !== "Not specified" && `(${code})`}
            </h5>
          </div>

          <div className="dm-actions">
            <FaEdit
              className="dm-edit me-1"
              onClick={() => onEdit(id)}
              title="Edit Department"
            />
            <FaTrash
              className="dm-delete-btn"
              onClick={() => onDelete(id, title)}
              title="Delete Department"
            />
          </div>
        </div>

      <p className="dm-desc">{desc || 'No description provided'}</p>

      {requiredCertifications && requiredCertifications !== 'Not specified' && (
        <div className="dm-certifications mb-2">
          <small className="text-muted">
            <strong>Certifications:</strong> {requiredCertifications}
          </small>
        </div>
      )}

      <div className="dm-info">
        <div className="dm-item">
          <div className="dm-label">
            <FaClock />
            <span>Duration</span>
          </div>
           <strong>{min}</strong>
        </div>

        <div className="dm-item">
          <div className="dm-label">
            <FaClock />
            <span>Est. Hours</span>
          </div>
          <strong>{hours}</strong>
        </div>
      </div>

      <div className="dm-info">
        <div className="dm-item">
          <div className="dm-label">
            <FaUsers />
            <span>Active Rotations</span>
          </div>
          <strong>{rotations}</strong>
        </div>

        <div className="dm-item">
          <div className="dm-label">
            <FaUsers />
            <span>Total Candidates</span>
          </div>
          <strong>{candidates}</strong>
        </div>
      </div>

      <div className="dm-footer mt-3">
        <span className={`badge ${isActive ? 'bg-success' : 'bg-secondary'}`}>
          {isActive ? 'Active' : 'Inactive'}
        </span>
        
        {isPlaceholder && (
          <span className="badge bg-warning text-dark ms-2">
            ⚠️ Incomplete Data
          </span>
        )}
      </div>
    </div>
  </div>
);

export default DepartmentManagement;