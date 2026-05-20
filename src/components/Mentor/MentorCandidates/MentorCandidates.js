import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MentorSidebar from "../Layout/MentorSidebar";
import Header from "../Layout/MentorHeader";
import { 
  FaSpinner, 
  FaCheckCircle, 
  FaExclamationTriangle,
  FaUserGraduate,
  FaBuilding,
  FaLevelUpAlt,
  FaClock,
  FaEnvelope,
  FaPhone,
  FaEye
} from "react-icons/fa";
import { BASE_URL } from "../../../ApiUrl";
import "./MentorCandidates.css";

const MentorCandidatesPage = () => {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [levelFilter, setLevelFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [mentorInfo, setMentorInfo] = useState(null);

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

  // Fetch mentors and assignments
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch both APIs in parallel
        const [mentorsRes, assignmentsRes] = await Promise.all([
          fetch(`${BASE_URL}/api/mentor/mentors/`),
          fetch(`${BASE_URL}/api/mentor/mentorship-assignments/`)
        ]);

        const mentorsData = await mentorsRes.json();
        const assignmentsData = await assignmentsRes.json();

        console.log('Mentors API Response:', mentorsData);
        console.log('Assignments API Response:', assignmentsData);

        // Set mentors data
        if (mentorsData.status && mentorsData.data) {
          setMentors(mentorsData.data);
        }

        // Process assignments
        if (assignmentsData.status && assignmentsData.data) {
          // Get current mentor ID from localStorage
          const currentMentorId = mentorInfo?.id || mentorInfo?.user_id || mentorInfo?.mentor_id;
          
          // Filter assignments where:
          // 1. mentor_status is 'accepted' (mentor has accepted the request)
          // 2. status is 'active' (mentorship is active)
          // 3. mentor ID matches the current mentor
          let activeAssignments = assignmentsData.data.filter(assignment => {
            const mentorMatch = currentMentorId ? 
              Number(assignment.mentor) === Number(currentMentorId) : true;
            
            return assignment.mentor_status === 'accepted' && 
                   assignment.status === 'active' && 
                   mentorMatch;
          });

          console.log('Filtered active assignments:', activeAssignments);
          setAssignments(activeAssignments);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [mentorInfo]);

  // Get level name
  const getLevelName = (levelName) => {
    return levelName || 'N/A';
  };

  // Determine candidate status based on completion percentage - FIXED
  const getCandidateStatus = (assignment) => {
    const completion = assignment.completion_percentage || 0;
    if (completion >= 75) return "Compliant";
    if (completion >= 40) return "At Risk";
    return "Active";
  };

  // Check if eligible for promotion (if completion is 100%)
  const isPromotionEligible = (assignment) => {
    const completion = assignment.completion_percentage || 0;
    return completion >= 100 ? "Eligible" : "-";
  };

  // Get unique levels for filter
  const getUniqueLevels = () => {
    const levels = assignments.map(a => a.target_level_name).filter(Boolean);
    return [...new Set(levels)];
  };

  // Filter assignments based on search and filters
  const filteredAssignments = assignments.filter(assignment => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = searchTerm === '' || 
      assignment.candidate_name?.toLowerCase().includes(searchLower);
    
    const matchesLevel = levelFilter === 'all' || 
      assignment.target_level_name === levelFilter;
    
    const status = getCandidateStatus(assignment);
    const matchesStatus = statusFilter === 'all' || 
      status.toLowerCase() === statusFilter.toLowerCase();
    
    return matchesSearch && matchesLevel && matchesStatus;
  });

  // Calculate statistics - FIXED
  const stats = {
    total: filteredAssignments.length,
    compliant: filteredAssignments.filter(a => getCandidateStatus(a) === "Compliant").length,
    atRisk: filteredAssignments.filter(a => getCandidateStatus(a) === "At Risk").length,
    active: filteredAssignments.filter(a => getCandidateStatus(a) === "Active").length,
    promotionReady: filteredAssignments.filter(a => isPromotionEligible(a) === "Eligible").length
  };

  // Handle view competency
  const handleViewCompetency = (assignment) => {
    navigate('/mentor-candidate-competency', {
      state: {
        candidateId: assignment.candidate,
        candidateName: assignment.candidate_name,
        departmentName: assignment.department_name,
        levelName: assignment.target_level_name,
         assignmentId: assignment.id  // Add this line
      }
    });
  };

  if (loading) {
    return (
      <div className="ta-layout-wrapper">
        <MentorSidebar />
        <div className="ta-main-wrapper">
          <Header />
          <div className="ta-content-area">
            <div className="ta-loading-container">
              <FaSpinner className="ta-spinner" />
              <p>Loading candidates...</p>
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
            <div className="ta-error-container">
              <FaExclamationTriangle className="ta-error-icon" />
              <p>Error loading candidates: {error}</p>
              <button 
                className="btn btn-primary mt-3"
                onClick={() => window.location.reload()}
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ta-layout-wrapper">
      <MentorSidebar />
      
      <div className="ta-main-wrapper">
        <Header />
        
        <div className="ta-content-area">
          <div className="ta-candidates-page">

            {/* Page Header */}
            <div className="mb-4">
              <h4 className="fw-semibold">My Candidates</h4>
              <p className="text-muted">
                Manage and monitor all candidates under your supervision
              </p>
              {assignments.length > 0 && (
                <small className="text-muted d-block mt-1">
                  Showing {assignments.length} active {assignments.length === 1 ? 'candidate' : 'candidates'}
                </small>
              )}
            </div>

            {/* Filters */}
            <div className="ta-candidates-filters mb-4 d-flex gap-3">
              <input
                type="text"
                className="form-control ta-candidates-search"
                placeholder="Search candidates by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />

              <select 
                className="form-select ta-candidates-select"
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value)}
              >
                <option value="all">All Levels</option>
                {getUniqueLevels().map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>

              <select 
                className="form-select ta-candidates-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="compliant">Compliant</option>
                <option value="at risk">At Risk</option>
                <option value="active">Active</option>
              </select>

              <button className="btn ta-candidates-export ms-auto">
                ⬇ Export
              </button>
            </div>

            {/* Stat Cards */}
            <div className="row g-3 mb-4">
              <div className="col-md-3">
                <div className="ta-candidates-stat">
                  <h3>{stats.total}</h3>
                  <p>Total Candidates</p>
                </div>
              </div>

              <div className="col-md-3">
                <div className="ta-candidates-stat ta-stat-green">
                  <h3>{stats.compliant}</h3>
                  <p>Compliant</p>
                </div>
              </div>

              <div className="col-md-3">
                <div className="ta-candidates-stat ta-stat-orange">
                  <h3>{stats.atRisk}</h3>
                  <p>At Risk</p>
                </div>
              </div>

              <div className="col-md-3">
                <div className="ta-candidates-stat ta-stat-blue">
                  <h3>{stats.active}</h3>
                  <p>Active</p>
                </div>
              </div>
            </div>

            {/* Candidates Table */}
            <div className="ta-candidates-table-card">
              {filteredAssignments.length === 0 ? (
                <div className="text-center p-5">
                  <p className="text-muted mb-0">No candidates found</p>
                  {assignments.length > 0 && (
                    <small className="text-muted d-block mt-2">
                      Try adjusting your filters or search term
                    </small>
                  )}
                  {assignments.length === 0 && (
                    <small className="text-muted d-block mt-2">
                      You don't have any active candidates yet
                    </small>
                  )}
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table align-middle mb-0">
                    <thead>
                      <tr>
                        <th>CANDIDATE</th>
                        <th>LEVEL</th>
                        <th>DEPARTMENT</th>
                        <th>STATUS</th>
                        <th>ACTIONS</th>
                        {/* <th>PROMOTION</th> */}
                        {/* <th>PROGRESS</th> */}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAssignments.map((assignment) => {
                        const candidateStatus = getCandidateStatus(assignment);
                        
                        // Get initials from candidate name
                        const initials = assignment.candidate_name
                          .split(' ')
                          .map(n => n[0])
                          .join('')
                          .slice(0, 2)
                          .toUpperCase();

                        return (
                          <tr key={assignment.id}>
                            {/* Candidate */}
                            <td>
                              <div className="ta-candidate-cell">
                                <div className="ta-candidate-avatar">
                                  {initials}
                                </div>
                                <div>
                                  <div className="fw-semibold">{assignment.candidate_name}</div>
                                  <small className="text-muted">ID: {assignment.candidate}</small>
                                </div>
                              </div>
                            </td>

                            {/* Level */}
                            <td>
                              <span className="ta-badge-level">
                                <FaLevelUpAlt className="me-1" size={10} />
                                {getLevelName(assignment.target_level_name)}
                              </span>
                            </td>

                            {/* Department */}
                            <td>
                              <span className="ta-department-tag">
                                <FaBuilding className="me-1" size={10} />
                                {assignment.department_name}
                              </span>
                            </td>

                            {/* Status */}
                            <td>
                              <span
                                className={`ta-status ${
                                  candidateStatus === "Compliant" 
                                    ? "ta-status-green" 
                                    : candidateStatus === "At Risk"
                                    ? "ta-status-orange"
                                    : "ta-status-blue"
                                }`}
                              >
                                {candidateStatus === "Compliant" && <FaCheckCircle className="me-1" size={10} />}
                                {candidateStatus === "At Risk" && <FaExclamationTriangle className="me-1" size={10} />}
                                {candidateStatus === "Active" && <FaClock className="me-1" size={10} />}
                                {candidateStatus}
                              </span>
                            </td>

                            {/* Actions */}
                            <td>
                              <button
                                className="ta-view-competency-btn"
                                onClick={() => handleViewCompetency(assignment)}
                                title="View Candidate Competency"
                              >
                                <FaEye className="me-1" size={12} />
                                View Competency
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MentorCandidatesPage;