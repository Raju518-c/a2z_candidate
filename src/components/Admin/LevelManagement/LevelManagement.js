import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../Layout/Sidebar";
import Header from "../Layout/Header";
import "./LevelManagement.css";
import { FaEdit, FaPlus, FaTrash } from "react-icons/fa";
import Swal from "sweetalert2";
import { BASE_URL } from "../../../ApiUrl";

const LevelsManagement = () => {
  const navigate = useNavigate();
  const [levels, setLevels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    fetchLevels();
  }, []);

  const fetchLevels = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BASE_URL}/api/admin/levels/`);
      const data = await response.json();
      
      if (data.status) {
        setLevels(data.data);
        setError(null);
      } else {
        setError(data.message || 'Failed to fetch levels');
      }
    } catch (err) {
      setError('Error connecting to server');
      console.error('Error fetching levels:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddLevel = () => {
    navigate('/level/add');
  };

  const handleEditLevel = (levelId) => {
    navigate(`/level/edit/${levelId}`);
  };

  const handleDeleteLevel = async (levelId, levelName) => {
    // Show confirmation dialog
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `You are about to delete "${levelName}". This action cannot be undone!`,
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
      const response = await fetch(`${BASE_URL}/api/admin/levels/${levelId}/`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to delete level');
      }
      
      // Remove the deleted level from state
      setLevels(prev => prev.filter(level => level.id !== levelId));
      
      await Swal.fire({
        icon: 'success',
        title: 'Deleted!',
        text: 'Level has been deleted successfully.',
        timer: 2000,
        showConfirmButton: false
      });
    } catch (err) {
      console.error('Error deleting level:', err);
      
      Swal.fire({
        icon: 'error',
        title: 'Delete Failed',
        text: err.message || 'Failed to delete level. Please try again.',
        timer: 3000,
        showConfirmButton: true
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  // Helper function to check if value is placeholder
  const isPlaceholder = (value) => {
    return value === "string" || value === 2147483647;
  };

  // Helper function to parse requirements/rules from string
  const parseRequirements = (requirementsString) => {
    if (!requirementsString || isPlaceholder(requirementsString)) {
      return ["Not specified"];
    }
    
    // Try to parse as JSON first
    try {
      const parsed = JSON.parse(requirementsString);
      if (Array.isArray(parsed)) {
        return parsed;
      }
      return [requirementsString];
    } catch (e) {
      // If not JSON, split by new lines or commas
      if (requirementsString.includes('\n')) {
        return requirementsString.split('\n').filter(item => item.trim());
      } else if (requirementsString.includes(',')) {
        return requirementsString.split(',').map(item => item.trim());
      }
      return [requirementsString];
    }
  };

  // Format level number with leading zero
  const formatLevelNumber = (number) => {
    if (isPlaceholder(number)) return "?";
    return number.toString();
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
            <div className="lm-wrapper text-center">
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
            <div className="lm-wrapper">
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
          <div className="lm-wrapper">
            {/* Page Header */}
            <div className="lm-header">
              <div>
                <h2>Levels Management</h2>
                <p>Configure training levels and progression requirements</p>
              </div>

              <button 
                className="btn btn-primary lm-add-btn"
                onClick={handleAddLevel}
                disabled={deleteLoading}
              >
                <FaPlus /> Add New Level
              </button>
            </div>

            {/* Stats Summary */}
            <div className="row g-4 mb-4">
              <div className="col-md-4">
                <div className="lm-stat-card">
                  <p>Total Levels</p>
                  <h3>{levels.length}</h3>
                </div>
              </div>
              <div className="col-md-4">
                <div className="lm-stat-card">
                  <p>Active Levels</p>
                  <h3>{levels.filter(l => l.is_active).length}</h3>
                </div>
              </div>
              <div className="col-md-4">
                <div className="lm-stat-card">
                  <p>Total Candidates</p>
                  <h3>0</h3>
                </div>
              </div>
            </div>

            {/* Level Cards */}
            {levels.length === 0 ? (
              <div className="alert alert-info text-center py-4">
                <p className="mb-0">No levels found. Click "Add New Level" to create one.</p>
              </div>
            ) : (
              levels
                .sort((a, b) => {
                  // Handle placeholder numbers in sorting
                  const numA = isPlaceholder(a.number) ? 999 : a.number;
                  const numB = isPlaceholder(b.number) ? 999 : b.number;
                  return numA - numB;
                })
                .map((level) => (
                  <LevelCard
                    key={level.id}
                    levelId={level.id}
                    level={formatLevelNumber(level.number)}
                    title={formatText(level.name)}
                    code={formatText(level.code)}
                    desc={formatText(level.description)}
                    candidates="0"
                    minScore={!isPlaceholder(level.min_score_required) ? level.min_score_required : null}
                    maxScore={!isPlaceholder(level.max_score) ? level.max_score : null}
                    mandatory={parseRequirements(level.mandatory_requirements)}
                    promotion={parseRequirements(level.promotion_rules)}
                    authority={parseRequirements(level.authority_limits)}
                    isActive={level.is_active}
                    isPlaceholder={isPlaceholder(level.name) || isPlaceholder(level.code)}
                    onEdit={handleEditLevel}
                    onDelete={handleDeleteLevel}
                    deleteLoading={deleteLoading}
                  />
                ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ---------------- Components ---------------- */

const LevelCard = ({
  levelId,
  level,
  title,
  code,
  desc,
  candidates,
  minScore,
  maxScore,
  mandatory,
  promotion,
  authority,
  isActive,
  isPlaceholder,
  onEdit,
  onDelete,
  deleteLoading
}) => (
  <div className={`lm-card ${isPlaceholder ? 'lm-card-placeholder' : ''}`}>
    {/* Header */}
    <div className="lm-card-header">
      <div className="lm-title-wrap">
        <div className="lm-level-badge">{level}</div>
        <div>
          <h5>
            {title}
            {code && code !== "Not specified" && <span className="lm-code"> ({code})</span>}
          </h5>
          <p>{desc}</p>
        </div>
      </div>

      <div className="lm-card-actions">
        {isActive && (
          <span className="lm-status-badge">
            Active
          </span>
        )}
        <span className="lm-candidate-pill">
          {candidates} candidates
        </span>
        <div className="lm-action-buttons">
          <button 
            className="lm-edit-btn"
            onClick={() => onEdit(levelId)}
            title="Edit Level"
            disabled={deleteLoading}
          >
            <FaEdit />
          </button>
          <button 
            className="lm-delete-btn"
            onClick={() => onDelete(levelId, title)}
            title="Delete Level"
            disabled={deleteLoading}
          >
            <FaTrash />
          </button>
        </div>
      </div>
    </div>

    {/* Content */}
    <div className="row mt-3">
      {/* Minimum Score */}
      <div className="col-lg-3">
        <h6 className="lm-section-title">
          Minimum Score
          {maxScore && <span className="text-muted"> (Max: {maxScore})</span>}
        </h6>
        <div className="lm-exposure">
          {minScore ? `${minScore} points` : 'Not specified'}
        </div>
      </div>

      {/* Mandatory Requirements */}
      <div className="col-lg-3">
        <h6 className="lm-section-title">Mandatory Requirements</h6>
        <ul className="lm-list blue">
          {mandatory.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      </div>

      {/* Promotion Rules */}
      <div className="col-lg-3">
        <h6 className="lm-section-title">Promotion Rules</h6>
        <ul className="lm-list green">
          {promotion.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      </div>

      {/* Authority Limits */}
      <div className="col-lg-3">
        <h6 className="lm-section-title">Authority Limits</h6>
        <ul className="lm-list orange">
          {authority.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      </div>
    </div>

    {/* Footer with badges */}
    <div className="lm-footer mt-3">
      {/* Placeholder Warning */}
      {isPlaceholder && (
        <span className="badge bg-warning text-dark me-2">
          ⚠️ Incomplete Data
        </span>
      )}
    </div>
  </div>
);

export default LevelsManagement;