import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CandidateSidebar from "../Layout/CandidateSidebar";
import Header from "../Layout/CandidateHeader";
import {
  FaCheckCircle,
  FaLock,
  FaChevronRight,
  FaChevronDown,
  FaExclamationCircle,
  FaUpload,
  FaUserFriends,
  FaBookOpen,
  FaPlusCircle,
  FaSpinner,
  FaStar,
  FaChartBar,
  FaFileAlt,
  FaCloudUploadAlt,
  FaLink,
  FaFilePdf,
  FaFileImage,
  FaFileWord,
  FaFileExcel,
  FaFilePowerpoint,
  FaFile,
  FaDownload,
  FaExternalLinkAlt,
  FaEye,
  FaEdit,
  FaTrash
} from "react-icons/fa";
import { BASE_URL } from "../../../ApiUrl";
import Swal from "sweetalert2";
import "./CandidateCompetency.css";

const CandidateCompetencyProgression = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [competencies, setCompetencies] = useState([]);
  const [levels, setLevels] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [evidenceMap, setEvidenceMap] = useState({});
  const [loadingEvidence, setLoadingEvidence] = useState({});
  const [selectedCompetencyId, setSelectedCompetencyId] = useState(null);
  const [currentCompetency, setCurrentCompetency] = useState(null);
  const [currentLevelData, setCurrentLevelData] = useState(null);
  const [currentDepartmentData, setCurrentDepartmentData] = useState(null);
  const [error, setError] = useState(null);
  const [expandedLevels, setExpandedLevels] = useState({});

  // Get candidate user_id from localStorage
  const getCandidateId = () => {
    try {
      const candidateUser = localStorage.getItem('candidate_user');
      if (candidateUser) {
        const parsed = JSON.parse(candidateUser);
        return parsed.user_id || '';
      }
    } catch (error) {
      console.error('Error parsing candidate_user from localStorage:', error);
    }
    return '';
  };

  const candidateId = getCandidateId();

  // Fetch evidence for a specific competency
  const fetchEvidenceForCompetency = async (competencyId) => {
    if (!competencyId) return;
    
    try {
      setLoadingEvidence(prev => ({ ...prev, [competencyId]: true }));
      
      const response = await fetch(`${BASE_URL}/api/candidate/competency-evidence/?competency=${competencyId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      
      if (result.status && result.data) {
        setEvidenceMap(prev => ({
          ...prev,
          [competencyId]: result.data
        }));
      }
    } catch (err) {
      console.error(`Error fetching evidence for competency ${competencyId}:`, err);
    } finally {
      setLoadingEvidence(prev => ({ ...prev, [competencyId]: false }));
    }
  };

  // Fetch all competencies
  // Fetch all competencies
const fetchAllCompetencies = async () => {
  try {
    const response = await fetch(`${BASE_URL}/api/candidate/competencies/`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const result = await response.json();
    
    if (result.status && result.data) {
      // ✅ FILTER: Only keep competencies with status === "validated"
      const validatedCompetencies = result.data.filter(
        comp => comp.status === "validated"
      );
      
      setCompetencies(validatedCompetencies);
      
      // Fetch evidence for all validated competencies
      for (const comp of validatedCompetencies) {
        await fetchEvidenceForCompetency(comp.id);
      }
      
      // Set default selected competency (first one or based on candidate)
      if (validatedCompetencies.length > 0) {
        // Try to find a competency with the current candidate ID
        const userCompetency = validatedCompetencies.find(
          comp => comp.candidate === parseInt(candidateId) || comp.candidate === candidateId
        );
        
        const defaultCompetency = userCompetency || validatedCompetencies[0];
        setSelectedCompetencyId(defaultCompetency.id);
        setCurrentCompetency(defaultCompetency);
      }
    }
  } catch (err) {
    console.error('Error fetching competencies:', err);
    throw err;
  }
};


  // Handle competency selection change
  const handleCompetencyChange = (e) => {
    const competencyId = parseInt(e.target.value);
    const selectedComp = competencies.find(comp => comp.id === competencyId);
    if (selectedComp) {
      setSelectedCompetencyId(competencyId);
      setCurrentCompetency(selectedComp);
      // Reset expanded levels when changing competency
      setExpandedLevels({});
    }
  };

  // Handle edit competency
  const handleEditCompetency = (competencyData) => {
    navigate(`/add-competence?mode=edit&competencyId=${competencyData.id}&levelId=${competencyData.level}&departmentId=${competencyData.department}`);
  };

  // Handle delete competency
  const handleDeleteCompetency = async (competencyData) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `Delete competency "${competencyData.competency_name}"? This will also delete all associated evidence. This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(`${BASE_URL}/api/candidate/competencies/${competencyData.id}/`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          }
        });

        if (response.ok) {
          Swal.fire({
            icon: 'success',
            title: 'Deleted!',
            text: 'Competency has been deleted successfully.',
            timer: 2000,
            showConfirmButton: false
          });
          
          // Refresh all data
          await fetchAllCompetencies();
        } else {
          throw new Error('Failed to delete competency');
        }
      } catch (error) {
        console.error('Error deleting competency:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: 'Failed to delete competency. Please try again.',
        });
      }
    }
  };

  // Fetch competencies, levels, and departments on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch levels
        const levelsResponse = await fetch(`${BASE_URL}/api/admin/levels/`);
        if (!levelsResponse.ok) {
          throw new Error(`HTTP error! status: ${levelsResponse.status}`);
        }
        const levelsResult = await levelsResponse.json();

        // Fetch departments
        const departmentsResponse = await fetch(`${BASE_URL}/api/admin/departments/`);
        if (!departmentsResponse.ok) {
          throw new Error(`HTTP error! status: ${departmentsResponse.status}`);
        }
        const departmentsResult = await departmentsResponse.json();

        if (levelsResult.status && levelsResult.data) {
          setLevels(levelsResult.data);
        }

        if (departmentsResult.status && departmentsResult.data) {
          setDepartments(departmentsResult.data);
        }

        // Fetch competencies
        await fetchAllCompetencies();

      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (candidateId) {
      fetchData();
    }
  }, [candidateId]);

  // Update current level data when competency or levels change
  useEffect(() => {
    if (currentCompetency && levels.length > 0) {
      const levelInfo = levels.find(level => level.id === currentCompetency.level);
      if (levelInfo) {
        setCurrentLevelData(levelInfo);
      }
    }
  }, [currentCompetency, levels]);

  // Update current department data when competency or departments change
  useEffect(() => {
    if (currentCompetency && departments.length > 0) {
      const deptInfo = departments.find(dept => dept.id === currentCompetency.department);
      if (deptInfo) {
        setCurrentDepartmentData(deptInfo);
      }
    }
  }, [currentCompetency, departments]);

  const handleAddCompetence = () => {
    navigate('/add-competence');
  };

  const toggleLevelExpand = (levelNumber) => {
    setExpandedLevels(prev => ({
      ...prev,
      [levelNumber]: !prev[levelNumber]
    }));
  };

  // Updated handleAddEvidence function - passes competency data as query parameters
  const handleAddEvidence = (levelNum, competencyData) => {
    const levelInfo = getLevelDisplay(levelNum);
    
    const compId = competencyData?.id || '';
    
    console.log('Navigating to add-evidence with:', {
      levelNum,
      compId,
      levelInfo
    });
    
    navigate(`/add-evidence?level=${levelNum}&competencyId=${compId}&levelName=${encodeURIComponent(levelInfo.display)}`);
  };

  // Handle edit evidence
  const handleEditEvidence = (evidence, levelNum, competencyData) => {
    const levelInfo = getLevelDisplay(levelNum);
    
    navigate(`/add-evidence?mode=edit&evidenceId=${evidence.id}&level=${levelNum}&competencyId=${competencyData.id}&levelName=${encodeURIComponent(levelInfo.display)}`);
  };

  // Handle delete evidence
  const handleDeleteEvidence = async (evidence, competencyId) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `Delete "${evidence.title}"? This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(`${BASE_URL}/api/candidate/competency-evidence/${evidence.id}/`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          }
        });

        if (response.ok) {
          Swal.fire({
            icon: 'success',
            title: 'Deleted!',
            text: 'Evidence has been deleted successfully.',
            timer: 2000,
            showConfirmButton: false
          });
          
          // Refresh evidence for this competency
          await fetchEvidenceForCompetency(competencyId);
        } else {
          throw new Error('Failed to delete evidence');
        }
      } catch (error) {
        console.error('Error deleting evidence:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: 'Failed to delete evidence. Please try again.',
        });
      }
    }
  };

  // Get competency data for a specific level
  const getCompetencyForLevel = (levelNumber) => {
    // Find level ID from level number
    const level = levels.find(l => l.number === levelNumber);
    if (!level) return null;
    
    // Find competency with this level ID - but only for current selected competency
    // We need to check if this level matches the current competency's level
    if (currentCompetency && currentCompetency.level === level.id) {
      return currentCompetency;
    }
    return null;
  };

  // Get level display name based on level number from the levels API
  const getLevelDisplay = (levelNumber) => {
    // Find the level with this number from the levels data
    const levelFromData = levels.find(l => l.number === levelNumber);
    if (levelFromData) {
      return {
        name: levelFromData.name,
        display: `Level ${levelNumber} - ${levelFromData.name}`
      };
    }
    
    // Fallback mapping if not found in API data
    const levelMap = {
      0: { name: "Trainee", display: "Level 0 - Trainee" },
      1: { name: "Junior Surveyor", display: "Level 1 - Junior Surveyor" },
      2: { name: "Associate Surveyor", display: "Level 2 - Associate Surveyor" },
      3: { name: "Surveyor", display: "Level 3 - Surveyor" },
      4: { name: "Senior Surveyor", display: "Level 4 - Senior Surveyor" },
      5: { name: "Principal Surveyor", display: "Level 5 - Principal Surveyor" }
    };
    return levelMap[levelNumber] || { name: "Unknown", display: `Level ${levelNumber}` };
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get file icon based on file extension
  const getFileIcon = (filename) => {
    if (!filename) return <FaFile />;
    
    const ext = filename.split('.').pop().toLowerCase();
    
    switch(ext) {
      case 'pdf':
        return <FaFilePdf style={{ color: '#e74c3c' }} />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'svg':
        return <FaFileImage style={{ color: '#2ecc71' }} />;
      case 'doc':
      case 'docx':
        return <FaFileWord style={{ color: '#2980b9' }} />;
      case 'xls':
      case 'xlsx':
        return <FaFileExcel style={{ color: '#27ae60' }} />;
      case 'ppt':
      case 'pptx':
        return <FaFilePowerpoint style={{ color: '#e67e22' }} />;
      default:
        return <FaFile />;
    }
  };

  // Get verification status badge
  const getVerificationBadge = (status) => {
    switch(status) {
      case 'verified':
      case 'approved':
        return <span className="cp-evidence-verified-badge"><FaCheckCircle /> Verified</span>;
      case 'rejected':
        return <span className="cp-evidence-rejected-badge">Rejected</span>;
      default:
        return <span className="cp-evidence-pending-badge">Pending</span>;
    }
  };

  // Get evidence type icon
  const getEvidenceTypeIcon = (type) => {
    switch(type) {
      case 'certificate':
        return <FaFileAlt className="cp-evidence-type-icon certificate" />;
      case 'work_sample':
        return <FaFileImage className="cp-evidence-type-icon work-sample" />;
      case 'reference':
        return <FaUserFriends className="cp-evidence-type-icon reference" />;
      case 'training':
        return <FaBookOpen className="cp-evidence-type-icon training" />;
      default:
        return <FaFileAlt className="cp-evidence-type-icon" />;
    }
  };

  // Get full document URL
  const getDocumentUrl = (documentName) => {
    if (!documentName) return '#';
    return `${BASE_URL}/media/evidence/${documentName}`;
  };

  if (loading) {
    return (
      <div className="ta-layout-wrapper">
        <CandidateSidebar />
        <div className="ta-main-wrapper">
          <Header />
          <div className="ta-content-area">
            <div className="cp-loading-container">
              <FaSpinner className="cp-spinner" />
              <p>Loading your competency data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ta-layout-wrapper">
        <CandidateSidebar />
        <div className="ta-main-wrapper">
          <Header />
          <div className="ta-content-area">
            <div className="cp-error-container">
              <FaExclamationCircle className="cp-error-icon" />
              <h3>Error Loading Data</h3>
              <p>{error}</p>
              <button onClick={() => window.location.reload()} className="cp-retry-btn">
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const levelDisplay = currentLevelData 
    ? getLevelDisplay(currentLevelData.number)
    : { name: "Not Started", display: "No Competency Found" };

  const currentLevelNumber = currentLevelData?.number ?? 0;

  // Define all journey levels
  const journeyLevels = [0, 1, 2, 3, 4, 5];

  return (
    <div className="ta-layout-wrapper">
      <CandidateSidebar />

      <div className="ta-main-wrapper">
        <Header />

        <div className="ta-content-area">
          <div className="container-fluid cp-wrapper">

            {/* Page Header with Add Competence Button */}
            <div className="cp-page-header">
              <div>
                <h3 className="cp-page-title">Competency Progression</h3>
                <p className="cp-page-subtitle">
                  Track your journey through different competency levels
                </p>
              </div>
              <button 
                className="cp-add-competence-btn"
                onClick={handleAddCompetence}
              >
                <FaPlusCircle className="cp-add-competence-icon" />
                Add Competence
              </button>
            </div>

            {/* Competency Selector Dropdown */}
            {/* Competency Selector Dropdown - Right Aligned */}

            {/* Competency Selector Dropdown with Heading */}
{competencies.length > 0 && (
  <div className="cp-competency-selector-section">
    <div className="cp-competency-selector-container">
      <label className="cp-competency-selector-heading">
        Choose Competency
      </label>
      <div className="cp-competency-selector-wrapper">
        <select 
          className="cp-competency-selector"
          value={selectedCompetencyId || ''}
          onChange={handleCompetencyChange}
        >
          {competencies.map((comp) => (
            <option key={comp.id} value={comp.id}>
              {comp.competency_name} {comp.status === 'draft' ? '(Draft)' : ''}
            </option>
          ))}
        </select>
      </div>
    </div>
  </div>
)}

            {/* ================================================= */}
            {/* CURRENT LEVEL SECTION */}
            {/* ================================================= */}
            <div className="cp-section">
              <div className="cp-current-card">
                <div className="cp-current-left">
                  <span className="cp-label">Current Level</span>
                  <h2>
                    {currentCompetency 
                      ? levelDisplay.display
                      : "No Competency Found"}
                  </h2>
                  <p>
                    {currentCompetency 
                      ? `${currentDepartmentData ? currentDepartmentData.name : ''}`
                      : "Add your first competency to get started"}
                  </p>
                </div>

                <div className="cp-current-level">
                  {currentLevelNumber}
                </div>
              </div>

              {currentCompetency && (
                <div className="cp-unlock-box">
                  <h6>Current Level Unlocks</h6>
                  <div className="cp-unlocks">
                    {currentLevelNumber >= 0 && (
                      <span className="cp-pill">
                        <FaCheckCircle /> Basic training completion
                      </span>
                    )}
                    {currentLevelNumber >= 1 && (
                      <span className="cp-pill">
                        <FaCheckCircle /> Independent inspection work
                      </span>
                    )}
                    {currentLevelNumber >= 2 && (
                      <span className="cp-pill">
                        <FaCheckCircle /> Certification sponsorship
                      </span>
                    )}
                    {currentLevelNumber >= 3 && (
                      <span className="cp-pill">
                        <FaCheckCircle /> Lead inspector role
                      </span>
                    )}
                    {currentLevelNumber >= 4 && (
                      <span className="cp-pill">
                        <FaCheckCircle /> Team leadership
                      </span>
                    )}
                    {currentLevelNumber >= 5 && (
                      <span className="cp-pill">
                        <FaCheckCircle /> Full authority & governance
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* ================================================= */}
            {/* COMPLETE JOURNEY OVERVIEW */}
            {/* ================================================= */}
            <div className="cp-section">
              <h4>Complete Journey Overview</h4>
              <p className="cp-muted">
                All levels from Trainee to Principal Surveyor
              </p>

              {journeyLevels.map((levelNum) => {
                const levelInfo = getLevelDisplay(levelNum);
                const competencyData = getCompetencyForLevel(levelNum);
                const isExpanded = expandedLevels[levelNum] || false;
                const isCurrent = currentLevelNumber === levelNum;
                const isDone = currentLevelNumber > levelNum;
                const isLocked = currentLevelNumber < levelNum;
                
                // Get evidence for this competency
                const evidence = competencyData ? evidenceMap[competencyData.id] || [] : [];
                const isLoadingEvidence = competencyData ? loadingEvidence[competencyData.id] : false;
                
                return (
                  <div key={levelNum} className="cp-journey-container">
                    <div 
                      className={`cp-journey ${isDone ? "done" : isCurrent ? "current" : isLocked ? "locked" : ""}`}
                      onClick={() => competencyData && toggleLevelExpand(levelNum)}
                      style={{ cursor: competencyData ? 'pointer' : 'default' }}
                    >
                      <div className="cp-journey-left">
                        <div className="cp-journey-badge">
                          {isDone ? <FaCheckCircle /> : isLocked ? <FaLock /> : levelNum}
                        </div>
                        <div>
                          <strong>{levelInfo.display}</strong>
                          <p className="cp-muted mb-0">{levelInfo.name}</p>
                        </div>
                      </div>

                      <div className="cp-journey-right">
                        {isCurrent && <span className="cp-current-tag">Current</span>}
                        {competencyData && !isLocked && (
                          isExpanded ? <FaChevronDown /> : <FaChevronRight />
                        )}
                      </div>
                    </div>

                    {/* Expanded Details Section */}
                    {isExpanded && competencyData && (
                      <div className="cp-journey-details">
                        <div className="cp-details-header">
                          <h5>Competency Details - {levelInfo.name}</h5>
                          <div className="cp-details-actions">
                            <button 
                              className="cp-edit-competency-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditCompetency(competencyData);
                              }}
                              title="Edit Competency"
                            >
                              <FaEdit /> Edit
                            </button>
                            <button 
                              className="cp-delete-competency-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteCompetency(competencyData);
                              }}
                              title="Delete Competency"
                            >
                              <FaTrash /> Delete
                            </button>
                            <span className={`cp-status-badge ${competencyData.status || 'draft'}`}>
                              {competencyData.status || 'Draft'}
                            </span>
                          </div>
                        </div>
                        
                        <div className="cp-journey-details-content">
                          {/* Competency Scores Section - Removed as requested */}

                          {/* Competency Scores Section */}
{competencyData && competencyData.overall_score !== undefined && (
  <div className="cp-scores-section">
    <h6 className="cp-section-subtitle">
      <FaChartBar className="cp-section-icon" /> Competency Scores
    </h6>
    <div className="cp-scores-grid">
      <div className="cp-score-card">
        <span className="cp-score-label">Overall Score</span>
        <span className="cp-score-value overall">{competencyData.overall_score}</span>
      </div>
      {competencyData.technical_knowledge !== undefined && (
        <div className="cp-score-card">
          <span className="cp-score-label">Technical Knowledge</span>
          <span className="cp-score-value">{competencyData.technical_knowledge}</span>
        </div>
      )}
      {competencyData.field_execution !== undefined && (
        <div className="cp-score-card">
          <span className="cp-score-label">Field Execution</span>
          <span className="cp-score-value">{competencyData.field_execution}</span>
        </div>
      )}
      {competencyData.documentation_quality !== undefined && (
        <div className="cp-score-card">
          <span className="cp-score-label">Documentation Quality</span>
          <span className="cp-score-value">{competencyData.documentation_quality}</span>
        </div>
      )}
      {competencyData.ethics_independence !== undefined && (
        <div className="cp-score-card">
          <span className="cp-score-label">Ethics & Independence</span>
          <span className="cp-score-value">{competencyData.ethics_independence}</span>
        </div>
      )}
      {competencyData.communication !== undefined && (
        <div className="cp-score-card">
          <span className="cp-score-label">Communication</span>
          <span className="cp-score-value">{competencyData.communication}</span>
        </div>
      )}
    </div>
  </div>
)}

                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* ================================================= */}
            {/* ACTION CARDS */}
            {/* ================================================= */}
            <div className="cp-section">
              <div className="cp-action-cards-wrapper">
                <div className="cp-action-card">
                  <div className="cp-action-icon">
                    <FaBookOpen className="cp-action-icon-inner" />
                  </div>
                  <div className="cp-action-content">
                    <h5 className="cp-action-title">Complete Training</h5>
                    <p className="cp-action-subtitle">3 modules pending</p>
                  </div>
                  <div className="cp-action-badge">
                    <span className="cp-action-badge-text">Resume</span>
                    <FaChevronRight className="cp-action-badge-arrow" />
                  </div>
                </div>

                <div className="cp-action-card">
                  <div className="cp-action-icon">
                    <FaUpload className="cp-action-icon-inner" />
                  </div>
                  <div className="cp-action-content">
                    <h5 className="cp-action-title">Add Certification</h5>
                    <p className="cp-action-subtitle">Upload credentials</p>
                  </div>
                  <div className="cp-action-badge">
                    <span className="cp-action-badge-text">Upload</span>
                    <FaChevronRight className="cp-action-badge-arrow" />
                  </div>
                </div>

                <div className="cp-action-card">
                  <div className="cp-action-icon">
                    <FaUserFriends className="cp-action-icon-inner" />
                  </div>
                  <div className="cp-action-content">
                    <h5 className="cp-action-title">Find a Mentor</h5>
                    <p className="cp-action-subtitle">Connect with seniors</p>
                  </div>
                  <div className="cp-action-badge">
                    <span className="cp-action-badge-text">Connect</span>
                    <FaChevronRight className="cp-action-badge-arrow" />
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateCompetencyProgression;