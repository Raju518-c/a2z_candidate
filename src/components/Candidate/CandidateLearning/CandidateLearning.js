import React, { useState, useEffect } from "react";
import CandidateSidebar from "../Layout/CandidateSidebar";
import Header from "../Layout/CandidateHeader";
import {
  FaFilter,
  FaPlay,
  FaCheckCircle,
  FaClock,
  FaBook,
  FaAward,
  FaHourglassHalf,
  FaBuilding,
  FaLayerGroup
} from "react-icons/fa";
import "./CandidateLearning.css";
import Swal from 'sweetalert2';
import { BASE_URL } from "../../../ApiUrl";

const CandidateLearningDashboard = () => {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filteredModules, setFilteredModules] = useState([]);
  const [selectedType, setSelectedType] = useState("All");
  const [showFilters, setShowFilters] = useState(false);

  // Fetch learning modules
  useEffect(() => {
    fetchLearningModules();
  }, []);

  useEffect(() => {
    // Apply filters whenever modules or selectedType changes
    filterModules();
  }, [modules, selectedType]);

  const fetchLearningModules = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BASE_URL}/api/candidate/learning-modules/`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('API Response:', result);
      
      if (result.status && result.data) {
        setModules(result.data);
        setFilteredModules(result.data);
      } else {
        throw new Error(result.message || 'Failed to fetch learning modules');
      }
      
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching learning modules:', err);
      
      Swal.fire({
        icon: 'error',
        title: 'Failed to Load Learning Modules',
        text: err.message || 'An error occurred while fetching learning modules',
        timer: 3000,
        showConfirmButton: true
      });
    } finally {
      setLoading(false);
    }
  };

  const filterModules = () => {
    if (selectedType === "All") {
      setFilteredModules(modules);
    } else {
      const filtered = modules.filter(module => module.module_type === selectedType);
      setFilteredModules(filtered);
    }
  };

  // Helper function to get module type display name
  const getModuleTypeDisplay = (type) => {
    const types = {
      'orientation': 'Orientation',
      'safety': 'Safety',
      'technical': 'Technical',
      'standard': 'Standards & Codes',
      'casestudy': 'Case Study',
      'assessment': 'Assessment'
    };
    return types[type] || type || 'General';
  };

  // Helper function to get module type color
  const getModuleTypeColor = (type) => {
    const colors = {
      'orientation': '#4299e1',
      'safety': '#f56565',
      'technical': '#9f7aea',
      'standard': '#48bb78',
      'casestudy': '#ed8936',
      'assessment': '#667eea'
    };
    return colors[type] || '#718096';
  };

  // Calculate stats
  const calculateStats = () => {
    // For demo purposes - in a real app, you would track user progress
    // Here we're just simulating stats based on modules data
    const totalModules = modules.length;
    const completedModules = modules.filter(m => m.id % 2 === 0).length; // Simulate completed
    const inProgressModules = modules.filter(m => m.id % 3 === 0).length; // Simulate in progress
    
    // Calculate total hours
    const totalHours = modules.reduce((acc, module) => {
      return acc + (parseFloat(module.duration_hours) || 0);
    }, 0);
    
    // Simulate completed hours (about 30% of total)
    const completedHours = Math.round(totalHours * 0.3);
    
    return {
      total: totalModules,
      completed: completedModules,
      inProgress: inProgressModules,
      totalHours: totalHours.toFixed(1),
      completedHours: completedHours
    };
  };

  const stats = calculateStats();

  // Get unique module types for filter
  const moduleTypes = ["All", ...new Set(modules.map(m => m.module_type).filter(Boolean))];

  // Get continue learning modules (simulate in-progress modules)
  const continueModules = modules.filter((m, index) => index % 3 === 0).slice(0, 2);

  if (loading) {
    return (
      <div className="cld-layout-wrapper">
        <CandidateSidebar />
        <div className="cld-main-wrapper">
          <Header />
          <div className="cld-content-area">
            <div className="text-center p-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-2">Loading learning modules...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="cld-layout-wrapper">
        <CandidateSidebar />
        <div className="cld-main-wrapper">
          <Header />
          <div className="cld-content-area">
            <div className="text-center p-5">
              <div className="alert alert-danger">
                <h5>Error Loading Modules</h5>
                <p>{error}</p>
                <button 
                  className="btn btn-primary mt-3"
                  onClick={fetchLearningModules}
                >
                  Retry
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cld-layout-wrapper">
      {/* Sidebar */}
      <CandidateSidebar />

      {/* Main Content */}
      <div className="cld-main-wrapper">
        <Header />

        <div className="cld-content-area">
          <div className="container-fluid">
            {/* ================= PAGE HEADER ================= */}
            <div className="cld-header">
              <div>
                <h2>Learning & Upskilling</h2>
                <p className="cld-muted">
                  {modules.length} modules available • Develop your competencies with structured training
                </p>
              </div>

              <button 
                className="btn cld-filter-btn"
                onClick={() => setShowFilters(!showFilters)}
              >
                <FaFilter /> Filter Modules
              </button>
            </div>

            {/* Filter Bar */}
            {showFilters && (
              <div className="cld-filter-bar mb-4">
                <div className="d-flex gap-2 flex-wrap">
                  {moduleTypes.map(type => (
                    <button
                      key={type}
                      className={`cld-type-filter ${selectedType === type ? 'active' : ''}`}
                      onClick={() => setSelectedType(type)}
                    >
                      {type === 'All' ? 'All Types' : getModuleTypeDisplay(type)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ================= STATS ================= */}
            <div className="row g-4 mb-4">
              <StatCard 
                icon={<FaCheckCircle />} 
                value={stats.completed.toString()} 
                label="Completed" 
                color="#2d8b85"
              />
              <StatCard 
                icon={<FaClock />} 
                value={stats.inProgress.toString()} 
                label="In Progress" 
                color="#1f3a5f"
              />
              <StatCard 
                icon={<FaHourglassHalf />} 
                value={`${stats.completedHours}h`} 
                label="Hours Completed" 
                color="#9f7aea"
              />
              <StatCard 
                icon={<FaBook />} 
                value={`${stats.totalHours}h`} 
                label="Total Available" 
                color="#ed8936"
              />
            </div>

            {/* ================= CONTINUE LEARNING SECTION ================= */}
            {continueModules.length > 0 && (
              <div className="cld-card mb-4">
                <div className="mb-3">
                  <h4>Continue Learning</h4>
                  <p className="cld-muted">Pick up where you left off</p>
                </div>

                <div className="row g-4">
                  {continueModules.map((module, index) => (
                    <ContinueCard
                      key={module.id}
                      title={module.title}
                      desc={module.description}
                      hours={`${module.duration_hours} hours`}
                      type={module.module_type}
                      typeDisplay={getModuleTypeDisplay(module.module_type)}
                      typeColor={getModuleTypeColor(module.module_type)}
                      progress={30 + (index * 15)} // Simulate different progress
                    />
                  ))}
                </div>
              </div>
            )}

            {/* ================= ALL LEARNING MODULES ================= */}
            <div className="cld-card mb-4">
              <div className="mb-3">
                <h4>All Learning Modules</h4>
                <p className="cld-muted">
                  {filteredModules.length} modules available • Browse available training content
                </p>
              </div>

              {filteredModules.length > 0 ? (
                filteredModules.map((module, index) => (
                  <ModuleRow
                    key={module.id}
                    id={module.id}
                    title={module.title}
                    type={module.module_type}
                    typeDisplay={getModuleTypeDisplay(module.module_type)}
                    typeColor={getModuleTypeColor(module.module_type)}
                    hours={`${module.duration_hours} hours`}
                    description={module.description}
                    hasAssessment={module.has_assessment}
                    isMandatory={module.is_mandatory}
                    passingScore={module.passing_score}
                    completed={index % 4 === 0}
                    // progress={index % 3 === 0 ? 75 : index % 3 === 1 ? 30 : null}
                    start={index % 5 === 0}
                  />
                ))
              ) : (
                <div className="text-center py-4">
                  <p className="cld-muted">No modules found matching your filter.</p>
                </div>
              )}
            </div>

            {/* ================= SKILL MATRIX ================= */}
            {/* <div className="cld-card">
              <div className="mb-3">
                <h4>Your Skill Matrix</h4>
                <p className="cld-muted">Competency levels by module type</p>
              </div>

              <div className="row g-4">
                {moduleTypes.filter(t => t !== 'All').map(type => (
                  <SkillBar 
                    key={type}
                    title={getModuleTypeDisplay(type)}
                    value={30 + Math.floor(Math.random() * 50)} // Simulate skill levels
                    color={getModuleTypeColor(type)}
                  />
                ))}
              </div>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ================= SUB COMPONENTS ================= */

const StatCard = ({ icon, value, label, color }) => (
  <div className="col-lg-3 col-md-6">
    <div className="cld-stat-card">
      <div className="cld-stat-icon" style={{ color: color }}>{icon}</div>
      <h3 style={{ color: color }}>{value}</h3>
      <p>{label}</p>
    </div>
  </div>
);

const ContinueCard = ({ title, desc, hours, type, typeDisplay, typeColor, progress }) => (
  <div className="col-lg-6">
    <div className="cld-continue-card">
      <div className="d-flex justify-content-between align-items-center mb-3">
        {/* <span className="cld-badge" style={{ 
          backgroundColor: `${typeColor}20`, 
          color: typeColor,
          border: `1px solid ${typeColor}40`
        }}>
          {typeDisplay}
        </span> */}
        <span style={{ color: '#6c7a89', fontWeight: '500' }}>{hours}</span>
      </div>

      <h5>{title}</h5>
      <p>{desc && desc.length > 100 ? desc.substring(0, 100) + '...' : desc || 'No description available'}</p>

      <div className="cld-progress">
        <div style={{ width: `${progress}%`, backgroundColor: typeColor }} />
      </div>

      <button className="btn cld-primary-btn" style={{ backgroundColor: typeColor }}>
        <FaPlay /> Continue
      </button>
    </div>
  </div>
);

const ModuleRow = ({ 
  title, 
  type, 
  typeDisplay, 
  typeColor, 
  hours, 
  description, 
  hasAssessment, 
  isMandatory, 
  passingScore,
  completed, 
  progress, 
  start 
}) => (
  <div className="cld-module-row">
    <div className="cld-module-left">
      {completed ? (
        <FaCheckCircle className="cld-green" style={{ color: '#2d8b85' }} />
      ) : progress ? (
        <FaClock style={{ color: typeColor }} />
      ) : (
        <FaClock style={{ color: '#a0aec0' }} />
      )}

      <div>
        <div className="d-flex align-items-center gap-2 mb-1">
          <h6 className="mb-0">{title}</h6>
          {isMandatory && (
            <span className="cld-badge mandatory" style={{ fontSize: '10px' }}>Required</span>
          )}
          {hasAssessment && (
            <span className="cld-badge assessment" style={{ fontSize: '10px' }}>
              Assessment {passingScore && `(${passingScore}%)`}
            </span>
          )}
        </div>
        <div className="d-flex align-items-center gap-2">
          <span className="cld-badge small" style={{ 
            backgroundColor: `${typeColor}20`, 
            color: typeColor,
            border: `1px solid ${typeColor}40`
          }}>
            {typeDisplay}
          </span>
          {description && (
            <small className="text-muted" style={{ fontSize: '12px' }}>
              {description.length > 50 ? description.substring(0, 50) + '...' : description}
            </small>
          )}
        </div>
      </div>
    </div>

    <div className="cld-module-right">
      {progress && (
        <div className="cld-mini-progress">
          <div style={{ width: `${progress}%`, backgroundColor: typeColor }} />
          <span style={{ color: typeColor }}>{progress}%</span>
        </div>
      )}

      <span style={{ color: '#6c7a89', minWidth: '60px' }}>{hours}</span>

      {completed ? (
        <button className="btn btn-light" style={{ minWidth: '90px' }}>
          Review
        </button>
      ) : progress ? (
        <button className="btn cld-primary-btn" style={{ minWidth: '90px', backgroundColor: typeColor }}>
          <FaPlay style={{ fontSize: '12px' }} /> Continue
        </button>
      ) : (
        <button className="btn cld-primary-btn" style={{ minWidth: '90px', backgroundColor: typeColor }}>
          Start
        </button>
      )}
    </div>
  </div>
);

// const SkillBar = ({ title, value, color }) => (
//   <div className="col-lg-4 col-md-6">
//     <div className="cld-skill-box">
//       <div className="d-flex justify-content-between align-items-center mb-2">
//         <span>{title}</span>
//         <strong style={{ color: color }}>{value}%</strong>
//       </div>
//       <div className="cld-progress">
//         <div style={{ width: `${value}%`, backgroundColor: color }} />
//       </div>
//     </div>
//   </div>
// );

export default CandidateLearningDashboard;