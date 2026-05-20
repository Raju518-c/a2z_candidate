import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import MentorSidebar from "../Layout/MentorSidebar";
import Header from "../Layout/MentorHeader";
import {
  FaCheckCircle,
  FaExclamationCircle,
  FaSpinner,
  FaStar,
  FaChartBar,
  FaFileAlt,
  FaCloudUploadAlt,
  FaClipboardList,
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
  FaArrowLeft,
  FaUserGraduate,
  FaBuilding,
  FaLevelUpAlt,
  FaUserFriends,
  FaBookOpen,
  FaCheck,
  FaTimes,
  FaEdit,
  FaClock,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaShip,
  FaHardHat
} from "react-icons/fa";
import { BASE_URL } from "../../../ApiUrl";
import "./MentorCandidateCompetency.css";

const MentorCandidateCompetency = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [competencies, setCompetencies] = useState([]);
  const [filteredCompetencies, setFilteredCompetencies] = useState([]);
  const [levels, setLevels] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [mentorAssignments, setMentorAssignments] = useState([]);
  const [evidenceMap, setEvidenceMap] = useState({});
  const [loadingEvidence, setLoadingEvidence] = useState({});
  const [currentCompetency, setCurrentCompetency] = useState(null);
  const [currentLevelData, setCurrentLevelData] = useState(null);
  const [currentDepartmentData, setCurrentDepartmentData] = useState(null);
  const [error, setError] = useState(null);
  const [candidateInfo, setCandidateInfo] = useState(null);
  const [mentorInfo, setMentorInfo] = useState(null);
  const [digitalLogbookData, setDigitalLogbookData] = useState([]);
  const [selectedLogbook, setSelectedLogbook] = useState(null);
  const [showLogbookModal, setShowLogbookModal] = useState(false);
  const [currentMentorAssignments, setCurrentMentorAssignments] = useState([]);
  
  // Get current mentor from localStorage
  useEffect(() => {
    try {
      const mentorUser = localStorage.getItem('mentor_user');
      if (mentorUser) {
        const parsed = JSON.parse(mentorUser);
        console.log('Mentor user from localStorage:', parsed);
        setMentorInfo(parsed);
      }
    } catch (error) {
      console.error('Error parsing mentor_user from localStorage:', error);
    }
  }, []);

  // Get candidate details from location state
  useEffect(() => {
    if (location.state) {
      setCandidateInfo({
        id: location.state.candidateId,
        name: location.state.candidateName,
        department: location.state.departmentName,
        level: location.state.levelName,
        assignmentId: location.state.assignmentId
      });
    }
  }, [location.state]);

  // Fetch digital logbook data
  const fetchDigitalLogbook = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/candidate/digital-logbook/`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      if (result.status && result.data) {
        // Filter logbook entries for this candidate AND specific department
        const candidateLogbooks = result.data.filter(entry => 
          entry.candidate_name === candidateInfo?.name &&
          entry.department_name === candidateInfo?.department
        );
        setDigitalLogbookData(candidateLogbooks);
        console.log('Digital logbook data fetched for department:', candidateInfo?.department, candidateLogbooks);
      }
    } catch (err) {
      console.error('Error fetching digital logbook:', err);
    }
  };

  // Fetch digital logbook when candidate info is available
  useEffect(() => {
    if (candidateInfo?.name && candidateInfo?.department) {
      fetchDigitalLogbook();
    }
  }, [candidateInfo]);

  // Handle assign marks navigation for a specific logbook
  const handleAssignMarks = (logbookEntry) => {
    navigate(`/mentor-competency-review/${logbookEntry.competency}`, {
      state: {
        action: 'approve',
        candidateInfo: candidateInfo,
        from: '/mentor-candidate-competency',
        logbookId: logbookEntry.id,
        competencyId: logbookEntry.competency,
        logbookData: logbookEntry
      }
    });
  };

  // Handle approve/reject for a specific logbook
  const handleApproveReject = (logbookEntry, action) => {
    navigate(`/mentor-competency-review/${logbookEntry.competency}`, {
      state: {
        action: action,
        candidateInfo: candidateInfo,
        from: '/mentor-candidate-competency',
        logbookId: logbookEntry.id,
        competencyId: logbookEntry.competency,
        logbookData: logbookEntry
      }
    });
  };

  // Check if marks have been assigned for a competency
  const hasMarksAssigned = (competency) => {
    if (!competency) return false;
    const hasAnyScore = competency.technical_knowledge > 0 ||
                        competency.field_execution > 0 ||
                        competency.documentation_quality > 0 ||
                        competency.ethics_independence > 0 ||
                        competency.communication > 0;
    const isFinalized = competency.status === 'approved' || competency.status === 'rejected';
    return hasAnyScore || isFinalized;
  };

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

  // Function to get department name from ID
  const getDepartmentName = (deptId) => {
    const department = departments.find(dept => dept.id === deptId);
    return department ? department.name : null;
  };

  // Filter competencies based on current mentor's specific assignment department
  const filterCompetenciesByMentorAssignment = (allCompetencies, mentorAssignmentsList, candidateDept) => {
    if (!allCompetencies.length) return [];
    
    console.log('Filtering competencies for department:', candidateDept);
    console.log('All competencies:', allCompetencies);
    
    // First, filter competencies by candidate and department
    const filteredByDept = allCompetencies.filter(competency => {
      const competencyDeptName = getDepartmentName(competency.department);
      console.log(`Competency ID ${competency.id}: department ID ${competency.department} -> name ${competencyDeptName}, candidate department: ${candidateDept}`);
      return competencyDeptName === candidateDept;
    });
    
    console.log('Filtered by department:', filteredByDept);
    return filteredByDept;
  };

  // Fetch competencies, levels, departments, and mentor assignments on component mount
  useEffect(() => {
    const fetchData = async () => {
      if (!candidateInfo?.id) return;

      try {
        setLoading(true);
        
        const assignmentsResponse = await fetch(`${BASE_URL}/api/mentor/mentorship-assignments/`);
        if (!assignmentsResponse.ok) {
          throw new Error(`HTTP error! status: ${assignmentsResponse.status}`);
        }
        const assignmentsResult = await assignmentsResponse.json();
        
        const competenciesResponse = await fetch(`${BASE_URL}/api/candidate/competencies/`);
        if (!competenciesResponse.ok) {
          throw new Error(`HTTP error! status: ${competenciesResponse.status}`);
        }
        const competenciesResult = await competenciesResponse.json();
        
        const levelsResponse = await fetch(`${BASE_URL}/api/admin/levels/`);
        if (!levelsResponse.ok) {
          throw new Error(`HTTP error! status: ${levelsResponse.status}`);
        }
        const levelsResult = await levelsResponse.json();

        const departmentsResponse = await fetch(`${BASE_URL}/api/admin/departments/`);
        if (!departmentsResponse.ok) {
          throw new Error(`HTTP error! status: ${departmentsResponse.status}`);
        }
        const departmentsResult = await departmentsResponse.json();

        if (assignmentsResult.status && assignmentsResult.data) {
          setMentorAssignments(assignmentsResult.data);
          
          // Filter assignments for current mentor and candidate
          const currentMentorId = mentorInfo?.id || mentorInfo?.user_id;
          const mentorSpecificAssignments = assignmentsResult.data.filter(assignment => {
            const mentorMatch = currentMentorId ? Number(assignment.mentor) === Number(currentMentorId) : true;
            const candidateMatch = assignment.candidate === parseInt(candidateInfo.id);
            const isActive = assignment.mentor_status === 'accepted' && assignment.status === 'active';
            
            return mentorMatch && candidateMatch && isActive;
          });
          
          console.log('Current mentor assignments for this candidate:', mentorSpecificAssignments);
          setCurrentMentorAssignments(mentorSpecificAssignments);
        }

        if (competenciesResult.status && competenciesResult.data) {
          const candidateCompetencies = competenciesResult.data.filter(
            comp => comp.candidate === parseInt(candidateInfo.id)
          );
          setCompetencies(candidateCompetencies);
        }

        if (levelsResult.status && levelsResult.data) {
          setLevels(levelsResult.data);
        }

        if (departmentsResult.status && departmentsResult.data) {
          setDepartments(departmentsResult.data);
        }

      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [candidateInfo, mentorInfo]);

  // Apply filtering after all data is loaded - filter by the department from candidateInfo
  useEffect(() => {
    if (competencies.length > 0 && departments.length > 0 && candidateInfo?.department) {
      // Filter competencies based on the candidate's department from the assignment
      const filtered = filterCompetenciesByMentorAssignment(
        competencies, 
        currentMentorAssignments, 
        candidateInfo.department
      );
      setFilteredCompetencies(filtered);
      
      if (filtered.length > 0) {
        // Sort by level (highest first) and pick the most recent one
        const sortedCompetencies = [...filtered].sort((a, b) => b.level - a.level);
        setCurrentCompetency(sortedCompetencies[0]);
        
        // Fetch evidence for each filtered competency
        for (const comp of filtered) {
          fetchEvidenceForCompetency(comp.id);
        }
      } else {
        console.log('No competencies found for department:', candidateInfo.department);
        setCurrentCompetency(null);
      }
    }
  }, [competencies, departments, candidateInfo, currentMentorAssignments]);

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

  const handleGoBack = () => {
    navigate('/mentor-candidates');
  };

 const handleViewLogbook = (logbook) => {
  navigate(`/mentor/logbook/${logbook.id}`, {
    state: {
      logbookData: logbook,
      candidateInfo: candidateInfo
    }
  });
};



  // Get level display name based on level number
  const getLevelDisplay = (levelNumber) => {
    const levelFromData = levels.find(l => l.number === levelNumber);
    if (levelFromData) {
      return {
        name: levelFromData.name,
        display: `Level ${levelNumber} - ${levelFromData.name}`
      };
    }
    
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
      day: 'numeric'
    });
  };

  // Get verification status badge
  const getVerificationBadge = (status) => {
    switch(status) {
      case 'verified':
      case 'approved':
        return <span className="mcp-evidence-verified-badge"><FaCheckCircle /> Approved</span>;
      case 'rejected':
        return <span className="mcp-evidence-rejected-badge"><FaTimes /> Rejected</span>;
      default:
        return <span className="mcp-evidence-pending-badge"><FaSpinner /> Pending</span>;
    }
  };

  if (loading) {
    return (
      <div className="ta-layout-wrapper">
        <MentorSidebar />
        <div className="ta-main-wrapper">
          <Header />
          <div className="ta-content-area">
            <div className="mcp-loading-container">
              <FaSpinner className="mcp-spinner" />
              <p>Loading candidate competency data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ta-layout-wrapper">
        <MentorSidebar />
        <div className="ta-main-wrapper">
          <Header />
          <div className="ta-content-area">
            <div className="mcp-error-container">
              <FaExclamationCircle className="mcp-error-icon" />
              <h3>Error Loading Data</h3>
              <p>{error}</p>
              <button onClick={handleGoBack} className="mcp-retry-btn">
                Go Back
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
  
  // Get evidence for current competency
  const evidence = currentCompetency ? evidenceMap[currentCompetency.id] || [] : [];
  const isLoadingEvidence = currentCompetency ? loadingEvidence[currentCompetency.id] : false;
  
  // Check if marks are assigned for current competency
  const marksAssigned = hasMarksAssigned(currentCompetency);

  // Group logbook entries by competency ID
  const logbooksByCompetency = digitalLogbookData.reduce((acc, logbook) => {
    if (!acc[logbook.competency]) {
      acc[logbook.competency] = [];
    }
    acc[logbook.competency].push(logbook);
    return acc;
  }, {});

  // Get logbooks for current competency
  const currentLogbooks = currentCompetency ? logbooksByCompetency[currentCompetency.id] || [] : [];

  return (
    <div className="ta-layout-wrapper">
      <MentorSidebar />

      <div className="ta-main-wrapper">
        <Header />

        <div className="ta-content-area">
          <div className="container-fluid mcp-wrapper">

            {/* Back Button and Candidate Info */}
            <div className="mcp-header-section">
              <button className="mcp-back-btn" onClick={handleGoBack}>
                <FaArrowLeft /> Back to Candidates
              </button>
              
              {candidateInfo && (
                <div className="mcp-candidate-info-card">
                  <div className="mcp-candidate-avatar">
                    <FaUserGraduate />
                  </div>
                  <div className="mcp-candidate-details">
                    <h4>{candidateInfo.name}</h4>
                    <div className="mcp-candidate-meta">
                      <span><FaBuilding /> {candidateInfo.department || 'N/A'}</span>
                      <span><FaLevelUpAlt /> {candidateInfo.level || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Page Header */}
            <div className="mcp-page-header">
              <div>
                <h3 className="mcp-page-title">Candidate Competency Details</h3>
                <p className="mcp-page-subtitle">
                  View candidate's current competency level and evidence
                </p>
              </div>
            </div>

            {/* ================================================= */}
            {/* CURRENT LEVEL SECTION */}
            {/* ================================================= */}
            <div className="mcp-section">
              <div className="mcp-current-card">
                <div className="mcp-current-left">
                  <span className="mcp-label">Current Level</span>
                  <h2>
                    {currentCompetency && filteredCompetencies.length > 0
                      ? levelDisplay.display
                      : "No Competency Found"}
                  </h2>
                  <p>
                    {currentCompetency && filteredCompetencies.length > 0
                      ? `${currentDepartmentData ? currentDepartmentData.name : candidateInfo?.department || ''}`
                      : `No valid competencies found for ${candidateInfo?.department || 'assigned'} department`}
                  </p>
                </div>

                <div className="mcp-current-level">
                  {filteredCompetencies.length > 0 ? currentLevelNumber : 0}
                </div>
              </div>
            </div>

            {/* ================================================= */}
            {/* CURRENT LEVEL DETAILS */}
            {/* ================================================= */}
            {currentCompetency && filteredCompetencies.length > 0 ? (
              <div className="mcp-section">
                <div className="mcp-current-level-details">
                  
                  {/* Digital Logbook Entries Section */}
                  {currentLogbooks.length > 0 && (
                    <div className="mcp-digital-logbook-section">
                      <h5 className="mcp-section-subtitle">
                        <FaFileAlt className="mcp-section-icon" /> Digital Logbook Entries ({currentLogbooks.length})
                      </h5>
                      
                      <div className="mcp-logbook-entries">
                        {currentLogbooks.map((logbook, index) => (
                          <div key={logbook.id} className="mcp-logbook-entry-card">
                            <div className="mcp-logbook-entry-header">
                              <div className="mcp-logbook-entry-title">
                                <FaClipboardList />
                                <span>Entry #{index + 1}</span>
                              </div>
                              {getVerificationBadge(logbook.verification_status)}
                            </div>
                            
                            <div className="mcp-logbook-entry-details">
                              <div className="mcp-logbook-detail-row">
                                <FaMapMarkerAlt />
                                <strong>Location:</strong> {logbook.work_location}
                              </div>
                              <div className="mcp-logbook-detail-row">
                                <FaShip />
                                <strong>Ship:</strong> {logbook.ship_name}
                              </div>
                              <div className="mcp-logbook-detail-row">
                                <FaHardHat />
                                <strong>Work Type:</strong> {logbook.work_type}
                              </div>
                              <div className="mcp-logbook-detail-row">
                                <FaCalendarAlt />
                                <strong>Period:</strong> {logbook.start_date} to {logbook.end_date}
                              </div>
                              <div className="mcp-logbook-detail-row">
                                <FaClock />
                                <strong>Duration:</strong> {logbook.total_duration}
                              </div>
                            </div>
                            
                            {logbook.reviewed_by && (
                              <div className="mcp-logbook-review-info">
                                <strong>Reviewed by:</strong> {logbook.reviewed_by}
                                {logbook.reviewed_at && (
                                  <span> on {new Date(logbook.reviewed_at).toLocaleDateString()}</span>
                                )}
                              </div>
                            )}
                            
                            {logbook.review_comments && (
                              <div className="mcp-logbook-comments">
                                <strong>Comments:</strong>
                                <p>{logbook.review_comments}</p>
                              </div>
                            )}
                            
                            <div className="mcp-logbook-actions">
                              <button
                                className="mcp-logbook-view-btn"
                                onClick={() => handleViewLogbook(logbook)}
                              >
                                <FaEye /> View Full Details
                              </button>
                              
                              {logbook.verification_status === 'pending' && (
                                <>
                                  <button
                                    className="mcp-logbook-approve-btn"
                                    onClick={() => handleApproveReject(logbook, 'approve')}
                                  >
                                    <FaCheck /> Approve
                                  </button>
                                  <button
                                    className="mcp-logbook-reject-btn"
                                    onClick={() => handleApproveReject(logbook, 'reject')}
                                  >
                                    <FaTimes /> Reject
                                  </button>
                                </>
                              )}
                              
                              {logbook.verification_status !== 'pending' && !marksAssigned && (
                                <button
                                  className="mcp-logbook-assign-marks-btn"
                                  onClick={() => handleAssignMarks(logbook)}
                                >
                                  <FaEdit /> Assign Marks
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Competency Scores Section */}
                  <div className="mcp-scores-section">
                    <h6 className="mcp-section-subtitle">
                      <FaStar className="mcp-section-icon" /> Competency Scores
                    </h6>
                    {marksAssigned ? (
                      <div className="mcp-score-grid">
                        <div className="mcp-score-item">
                          <div className="mcp-score-label">
                            <FaChartBar className="mcp-score-icon" />
                            <span>Technical Knowledge</span>
                          </div>
                          <div className="mcp-score-value">
                            {currentCompetency.technical_knowledge || 0}
                          </div>
                        </div>
                        
                        <div className="mcp-score-item">
                          <div className="mcp-score-label">
                            <FaChartBar className="mcp-score-icon" />
                            <span>Field Execution</span>
                          </div>
                          <div className="mcp-score-value">
                            {currentCompetency.field_execution || 0}
                          </div>
                        </div>
                        
                        <div className="mcp-score-item">
                          <div className="mcp-score-label">
                            <FaChartBar className="mcp-score-icon" />
                            <span>Documentation Quality</span>
                          </div>
                          <div className="mcp-score-value">
                            {currentCompetency.documentation_quality || 0}
                          </div>
                        </div>
                        
                        <div className="mcp-score-item">
                          <div className="mcp-score-label">
                            <FaChartBar className="mcp-score-icon" />
                            <span>Ethics & Independence</span>
                          </div>
                          <div className="mcp-score-value">
                            {currentCompetency.ethics_independence || 0}
                          </div>
                        </div>
                        
                        <div className="mcp-score-item">
                          <div className="mcp-score-label">
                            <FaChartBar className="mcp-score-icon" />
                            <span>Communication</span>
                          </div>
                          <div className="mcp-score-value">
                            {currentCompetency.communication || 0}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="mcp-no-scores-message">
                        <FaEdit className="mcp-no-scores-icon" />
                        <p>Marks not assigned yet. Approve a digital logbook entry to assign marks.</p>
                      </div>
                    )}
                  </div>

                  {/* Evidence Section */}
                  {/* <div className="mcp-evidence-section">
                    <div className="mcp-evidence-header">
                      <h6 className="mcp-section-subtitle">
                        <FaFileAlt className="mcp-section-icon" /> Evidence Details
                      </h6>
                      <span className={`mcp-status-badge ${currentCompetency.status || 'draft'}`}>
                        {currentCompetency.status || 'Draft'}
                      </span>
                    </div>

                    <div className="mcp-evidence-list">
                      {isLoadingEvidence ? (
                        <div className="mcp-evidence-loading">
                          <FaSpinner className="mcp-spinner-small" />
                          <p>Loading evidence...</p>
                        </div>
                      ) : evidence.length > 0 ? (
                        <div className="mcp-evidence-items">
                          {evidence.map((item) => (
                            <div key={item.id} className="mcp-evidence-item">
                              <div className="mcp-evidence-item-header">
                                <div className="mcp-evidence-item-icon">
                                  <FaFileAlt />
                                </div>
                                <div className="mcp-evidence-item-title">
                                  <h6>{item.title}</h6>
                                  <span className="mcp-evidence-type">{item.evidence_type}</span>
                                </div>
                                <div className="mcp-evidence-verification">
                                  {getVerificationBadge(item.verification_status)}
                                </div>
                              </div>

                              <div className="mcp-evidence-item-description">
                                <p>{item.description || item.submission_notes}</p>
                              </div>

                              <div className="mcp-evidence-item-meta">
                                <span className="mcp-evidence-submitted-by">
                                  Submitted by: {item.submitted_by || 'N/A'}
                                </span>
                                <span className="mcp-evidence-date">
                                  {formatDate(item.created_at)}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="mcp-evidence-placeholder">
                          <FaCloudUploadAlt className="mcp-evidence-placeholder-icon" />
                          <p>No evidence uploaded yet for this level.</p>
                        </div>
                      )}
                    </div>
                  </div> */}

                  {/* <div className="mcp-meta-info">
                    <small>Last Updated: {new Date(currentCompetency.updated_at).toLocaleDateString()}</small>
                  </div> */}
                </div>
              </div>
            ) : (
              <div className="mcp-no-competency">
                <FaExclamationCircle className="mcp-no-competency-icon" />
                <h4>No Competency Found</h4>
                <p>This candidate doesn't have any competency records for the {candidateInfo?.department || 'assigned'} department.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Logbook Detail Modal */}
      {/* {showLogbookModal && selectedLogbook && (
        <div className="mcp-modal-overlay" onClick={closeModal}>
          <div className="mcp-modal" onClick={(e) => e.stopPropagation()}>
            <div className="mcp-modal-header">
              <h3>Digital Logbook Details</h3>
              <button className="mcp-modal-close" onClick={closeModal}>×</button>
            </div>
            <div className="mcp-modal-body">
              <div className="mcp-logbook-full-details">
                <div className="mcp-logbook-detail-group">
                  <h4>Work Information</h4>
                  <p><strong>Location:</strong> {selectedLogbook.work_location}</p>
                  <p><strong>Ship Name:</strong> {selectedLogbook.ship_name}</p>
                  <p><strong>Ship Type:</strong> {selectedLogbook.ship_type}</p>
                  <p><strong>Work Type:</strong> {selectedLogbook.work_type}</p>
                  <p><strong>Duration:</strong> {selectedLogbook.total_duration}</p>
                  <p><strong>Period:</strong> {selectedLogbook.start_date} to {selectedLogbook.end_date}</p>
                </div>
                
                <div className="mcp-logbook-detail-group">
                  <h4>Work Environment</h4>
                  <p><strong>Environment:</strong> {selectedLogbook.work_environment}</p>
                  <p><strong>Weather:</strong> {selectedLogbook.weather_conditions}</p>
                  <p><strong>Team Size:</strong> {selectedLogbook.team_size}</p>
                  <p><strong>Team Role:</strong> {selectedLogbook.team_role}</p>
                  <p><strong>Equipment Used:</strong> {selectedLogbook.equipment_used}</p>
                </div>
                
                {selectedLogbook.work_description && (
                  <div className="mcp-logbook-detail-group">
                    <h4>Work Description</h4>
                    <p>{selectedLogbook.work_description}</p>
                  </div>
                )}
                
                {selectedLogbook.evidence_documents && selectedLogbook.evidence_documents.length > 0 && (
                  <div className="mcp-logbook-detail-group">
                    <h4>Evidence Documents ({selectedLogbook.evidence_documents.length})</h4>
                    {selectedLogbook.evidence_documents.map((doc, idx) => (
                      <div key={idx} className="mcp-logbook-document">
                        <FaFile />
                        <span>{doc.filename}</span>
                        <a href={`${BASE_URL}${doc.path}`} target="_blank" rel="noopener noreferrer">
                          <FaEye /> View
                        </a>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="mcp-logbook-detail-group">
                  <h4>Verification Status</h4>
                  <p><strong>Status:</strong> {selectedLogbook.verification_status}</p>
                  {selectedLogbook.reviewed_by && (
                    <p><strong>Reviewed by:</strong> {selectedLogbook.reviewed_by}</p>
                  )}
                  {selectedLogbook.reviewed_at && (
                    <p><strong>Reviewed at:</strong> {new Date(selectedLogbook.reviewed_at).toLocaleString()}</p>
                  )}
                  {selectedLogbook.review_comments && (
                    <p><strong>Comments:</strong> {selectedLogbook.review_comments}</p>
                  )}
                </div>
              </div>
            </div>
            <div className="mcp-modal-footer">
              <button className="mcp-modal-btn mcp-modal-cancel" onClick={closeModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )} */}
    </div>
  );
};

export default MentorCandidateCompetency;