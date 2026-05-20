import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CandidateSidebar from "../Layout/CandidateSidebar";
import Header from "../Layout/CandidateHeader";
import { 
  FaUsers, 
  FaCommentDots, 
  FaCalendarAlt, 
  FaCheckCircle,
  FaSpinner,
  FaExclamationCircle,
  FaEnvelope,
  FaPhone,
  FaBuilding,
  FaUserTie,
  FaStar,
  FaCertificate,
  FaUserCheck,
  FaUserPlus
} from "react-icons/fa";
import { BASE_URL } from "../../../ApiUrl";
import "./CandidateMentorship.css";

const CandidateMentorship = () => {
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [yourMentor, setYourMentor] = useState(null);
  const [yourMentorDetails, setYourMentorDetails] = useState(null);
  const [departmentsMap, setDepartmentsMap] = useState({});
  const [levelsMap, setLevelsMap] = useState({});
  const [assignedMentors, setAssignedMentors] = useState([]);
  const [assignedMentorIds, setAssignedMentorIds] = useState(new Set());
  const [assignedMentorDepts, setAssignedMentorDepts] = useState({});
  const navigate = useNavigate();

  // Get candidate user ID from localStorage
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

  // Fetch complete mentor details
  const fetchMentorDetails = async (mentorId) => {
    try {
      const response = await fetch(`${BASE_URL}/api/mentor/mentors/${mentorId}/`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      if (result.status && result.data) {
        return result.data;
      }
    } catch (err) {
      console.error('Error fetching mentor details:', err);
    }
    return null;
  };

  // Fetch mentorship assignments
  const fetchMentorshipAssignments = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/mentor/mentorship-assignments/`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      
      if (result.status && result.data) {
        // Filter assignments for current candidate with status 'active'
        const candidateAssignments = result.data.filter(
          assignment => assignment.candidate.toString() === candidateId && 
                       assignment.status === 'active'
        );
        setAssignedMentors(candidateAssignments);
        
        // Create a map of mentor ID to assigned department ID
        const mentorDeptMap = {};
        const mentorIds = new Set();
        
        candidateAssignments.forEach(assignment => {
          if (assignment.mentor) {
            mentorIds.add(assignment.mentor);
            // Store the department ID for this mentor assignment
            if (assignment.department) {
              mentorDeptMap[assignment.mentor] = assignment.department;
            }
          }
        });
        
        setAssignedMentorIds(mentorIds);
        setAssignedMentorDepts(mentorDeptMap);
        
        // If there are assignments, set the first one as "Your Mentor" and fetch details
        if (candidateAssignments.length > 0) {
          const firstAssignment = candidateAssignments[0];
          setYourMentor(firstAssignment);
          
          // Fetch complete mentor details
          const mentorDetails = await fetchMentorDetails(firstAssignment.mentor);
          if (mentorDetails) {
            setYourMentorDetails(mentorDetails);
          }
        }
      }
    } catch (err) {
      console.error('Error fetching mentorship assignments:', err);
    }
  };

  // Fetch departments mapping
  const fetchDepartments = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/admin/departments/`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      if (result.status && result.data) {
        const deptMap = {};
        result.data.forEach(dept => {
          deptMap[dept.id] = dept;
        });
        setDepartmentsMap(deptMap);
      }
    } catch (err) {
      console.error('Error fetching departments:', err);
    }
  };

  // Fetch levels mapping
  const fetchLevels = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/admin/levels/`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      if (result.status && result.data) {
        const levelMap = {};
        result.data.forEach(level => {
          levelMap[level.id] = level;
        });
        setLevelsMap(levelMap);
      }
    } catch (err) {
      console.error('Error fetching levels:', err);
    }
  };

  // Fetch mentors from API
  const fetchMentors = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${BASE_URL}/api/mentor/mentors/`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      
      if (result.status && result.data) {
        // Filter active mentors
        const activeMentors = result.data.filter(mentor => 
          mentor.mentorship_status === 'active' || mentor.mentorship_status === null
        );
        setMentors(activeMentors);
      } else {
        throw new Error(result.message || 'Failed to fetch mentors');
      }
    } catch (err) {
      console.error('Error fetching mentors:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await fetchDepartments();
      await fetchLevels();
      await fetchMentorshipAssignments();
      await fetchMentors();
    };
    loadData();
  }, [candidateId]);

  // Handle Connect button click - Always allow connection even if already assigned
  const handleConnect = (mentor) => {
    console.log('Connect clicked for mentor:', mentor);
    
    // Navigate to find-mentor with selected mentor data
    navigate('/find-mentor', {
      state: {
        selectedMentor: {
          id: mentor.id,
          name: mentor.full_name,
          department: mentor.specializations && mentor.specializations.length > 0 ? mentor.specializations[0] : "",
          target_level: mentor.mentor_level || "",
          status: 'active',
          mentor_status: 'requested'
        },
        candidateId: candidateId
      }
    });
  };

  // Handle Find a Mentor button click
  const handleFindMentor = () => {
    navigate('/find-mentor');
  };

  // Get department names from IDs
  const getDepartmentNames = (departmentIds) => {
    if (!departmentIds || !Array.isArray(departmentIds)) return [];
    return departmentIds
      .map(id => departmentsMap[id]?.name || null)
      .filter(Boolean);
  };

  // Get filtered specializations for a mentor (exclude already assigned department)
  const getFilteredSpecializations = (mentor) => {
    if (!mentor.specializations || mentor.specializations.length === 0) {
      return [];
    }
    
    const assignedDeptId = assignedMentorDepts[mentor.id];
    
    // If mentor is not assigned, show all specializations
    if (!assignedDeptId) {
      return mentor.specializations;
    }
    
    // Filter out the assigned department
    return mentor.specializations.filter(specId => specId !== assignedDeptId);
  };

  // Get filtered department names for display
  const getFilteredDepartmentNames = (mentor) => {
    const filteredSpecs = getFilteredSpecializations(mentor);
    return filteredSpecs.map(id => departmentsMap[id]?.name || null).filter(Boolean);
  };

  // Check if mentor should be shown in available mentors
  const shouldShowMentor = (mentor) => {
    // Always show mentor if they have any specializations
    // (even if assigned, they might have other specializations)
    const filteredSpecs = getFilteredSpecializations(mentor);
    return filteredSpecs.length > 0;
  };

  // Get the department name for an assigned mentor
  const getAssignedDepartmentName = (mentorId) => {
    const deptId = assignedMentorDepts[mentorId];
    return deptId && departmentsMap[deptId] ? departmentsMap[deptId].name : 'N/A';
  };

  // Get level badge color
  const getLevelBadge = (level) => {
    switch(level) {
      case 1: return { bg: '#e6f7ff', color: '#0077b6', text: 'Junior Mentor' };
      case 2: return { bg: '#f0f7e6', color: '#2e7d32', text: 'Senior Mentor' };
      case 3: return { bg: '#fff3e0', color: '#ed6c02', text: 'Lead Mentor' };
      case 4: return { bg: '#f3e5f5', color: '#7b1fa2', text: 'Principal Mentor' };
      case 5: return { bg: '#fbe9e7', color: '#d84315', text: 'Executive Mentor' };
      default: return { bg: '#e6eaf0', color: '#5f6b7a', text: `Level ${level}` };
    }
  };

  // Format experience
  const formatExperience = (years) => {
    if (!years) return 'N/A';
    const exp = parseFloat(years);
    if (exp === 1) return '1 year';
    if (exp < 1) return `${Math.round(exp * 12)} months`;
    return `${exp} years`;
  };

  if (loading) {
    return (
      <div className="cm-layout-wrapper">
        <CandidateSidebar />
        <div className="cm-main-wrapper">
          <Header />
          <div className="cm-content-area">
            <div className="cm-loading-container">
              <FaSpinner className="cm-spinner" />
              <p>Loading mentors...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="cm-layout-wrapper">
        <CandidateSidebar />
        <div className="cm-main-wrapper">
          <Header />
          <div className="cm-content-area">
            <div className="cm-error-container">
              <FaExclamationCircle className="cm-error-icon" />
              <h3>Error Loading Mentors</h3>
              <p>{error}</p>
              <button onClick={fetchMentors} className="cm-retry-btn">
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const levelBadge = yourMentorDetails ? getLevelBadge(yourMentorDetails.mentor_level) : null;

  return (
    <div className="cm-layout-wrapper">
      <CandidateSidebar />

      <div className="cm-main-wrapper">
        <Header />

        <div className="cm-content-area container-fluid">

          {/* Page Header */}
          <div className="d-flex justify-content-between align-items-start mb-4">
            <div>
              <h3 className="cm-title">Mentorship</h3>
              <p className="cm-sub">Connect with experienced professionals</p>
            </div>

            <button 
              className="btn cm-primary-btn"
              onClick={handleFindMentor}
            >
              <FaUsers className="me-2" />
              Find a Mentor
            </button>
          </div>

          {/* Your Mentor Section - Show only if mentor is assigned */}
          {yourMentor && yourMentorDetails ? (
            <div className="cm-card mb-4">
              <h5>Your Mentor</h5>
              <p className="cm-muted">Your assigned senior guide</p>

              <div className="cm-mentor-box">
                <div className="d-flex align-items-start gap-3">
                  <div className="cm-avatar">
                    {yourMentorDetails.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'NA'}
                  </div>

                  <div className="flex-grow-1">
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <h6 className="mb-0">{yourMentorDetails.full_name}</h6>
                      {yourMentorDetails.background_verified && (
                        <span className="cm-verified-badge" title="Background Verified">
                          <FaCheckCircle />
                        </span>
                      )}
                      {yourMentorDetails.mentorship_certified && (
                        <span className="cm-certified-badge" title="Mentorship Certified">
                          <FaCertificate />
                        </span>
                      )}
                    </div>
                    
                    <p className="cm-muted mb-2">
                      <span 
                        className="cm-level-badge"
                        style={{ backgroundColor: levelBadge?.bg, color: levelBadge?.color }}
                      >
                        {levelBadge?.text}
                      </span>
                      {yourMentorDetails.current_company && (
                        <span className="cm-company ms-2">
                          <FaBuilding className="me-1" /> {yourMentorDetails.current_company}
                        </span>
                      )}
                    </p>

                    {/* Department Badge - Only show the assigned department */}
                    <div className="mb-2">
                      <span className="cm-department-badge">
                        {getAssignedDepartmentName(yourMentorDetails.id)}
                      </span>
                    </div>

                    {/* Contact Info */}
                    <div className="cm-contact-info mb-2">
                      {yourMentorDetails.email && (
                        <span className="cm-contact-item">
                          <FaEnvelope /> {yourMentorDetails.email}
                        </span>
                      )}
                      {yourMentorDetails.phone_number && (
                        <span className="cm-contact-item ms-3">
                          <FaPhone /> {yourMentorDetails.phone_number}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="d-flex gap-2 mt-3">
                  <button className="btn cm-outline-btn">
                    <FaCommentDots className="me-2" />
                    Message
                  </button>

                  <button className="btn cm-outline-btn">
                    <FaCalendarAlt className="me-2" />
                    Schedule
                  </button>
                </div>
              </div>

              {/* Mentor Stats */}
              <div className="cm-mentor-stats mt-3">
                <div className="cm-stat-item">
                  <FaUserTie className="cm-stat-icon" />
                  <div>
                    <span className="cm-stat-label">Experience</span>
                    <span className="cm-stat-value">{formatExperience(yourMentorDetails.years_of_experience)}</span>
                  </div>
                </div>
                <div className="cm-stat-item">
                  <FaUsers className="cm-stat-icon" />
                  <div>
                    <span className="cm-stat-label">Trainees</span>
                    <span className="cm-stat-value">{yourMentorDetails.current_trainees || 0} / {yourMentorDetails.max_trainees || 0}</span>
                  </div>
                </div>
                <div className="cm-stat-item">
                  <FaStar className="cm-stat-icon" />
                  <div>
                    <span className="cm-stat-label">Mentor Level</span>
                    <span className="cm-stat-value">Level {yourMentorDetails.mentor_level}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* No Mentor Assigned Message */
            <div className="cm-card text-center py-5 mb-4">
              <FaUserCheck className="cm-empty-icon" />
              <h5>No Mentor Assigned</h5>
              <p className="cm-muted">
                You don't have any mentor assigned yet. Please click "Find a Mentor" to request one.
              </p>
              <button 
                className="btn cm-primary-btn mt-3"
                onClick={handleFindMentor}
              >
                <FaUsers className="me-2" />
                Find a Mentor
              </button>
            </div>
          )}

          {/* Available Mentors Section */}
          {mentors.length > 0 && (
            <div className="cm-card">
              <h5>Available Mentors</h5>
              <p className="cm-muted">
                Senior professionals you can connect with
              </p>

              <div className="row g-4 mt-2">
                {mentors.map((mentor) => {
                  const mentorLevelBadge = getLevelBadge(mentor.mentor_level);
                  const filteredDepartments = getFilteredDepartmentNames(mentor);
                  const isAssigned = assignedMentorIds.has(mentor.id);
                  const assignedDeptName = isAssigned ? getAssignedDepartmentName(mentor.id) : null;
                  const showMentor = shouldShowMentor(mentor);
                  
                  // Skip if mentor has no additional specializations to show
                  if (!showMentor) {
                    return null;
                  }
                  
                  return (
                    <MentorCard
                      key={mentor.id}
                      mentor={mentor}
                      initials={mentor.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                      name={mentor.full_name}
                      role={mentorLevelBadge.text}
                      company={mentor.current_company}
                      departments={filteredDepartments}
                      level={`Level ${mentor.mentor_level}`}
                      experience={formatExperience(mentor.years_of_experience)}
                      mentees={`${mentor.current_trainees || 0} mentees`}
                      backgroundVerified={mentor.background_verified}
                      mentorshipCertified={mentor.mentorship_certified}
                      isAssigned={isAssigned}
                      assignedDepartment={assignedDeptName}
                      onConnect={() => handleConnect(mentor)}
                    />
                  );
                })}
              </div>
              
              {/* Show message if no mentors are displayed after filtering */}
              {mentors.filter(mentor => shouldShowMentor(mentor)).length === 0 && (
                <div className="text-center py-4">
                  <p className="cm-muted">No additional mentors available at this time.</p>
                </div>
              )}
            </div>
          )}

          {/* No mentors available message */}
          {mentors.length === 0 && (
            <div className="cm-card text-center py-5">
              <FaUsers className="cm-empty-icon" />
              <h5>No Available Mentors</h5>
              <p className="cm-muted">
                No mentors are currently available. Please check back later.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ================= SUB COMPONENTS ================= */

const MentorCard = ({ 
  mentor,
  initials, 
  name, 
  role, 
  company,
  departments, 
  level, 
  experience,
  mentees,
  backgroundVerified,
  mentorshipCertified,
  isAssigned,
  assignedDepartment,
  onConnect
}) => (
  <div className="col-lg-4 col-md-6">
    <div className="cm-mentor-card">
      <div className="d-flex justify-content-between align-items-start">
        <div className="d-flex gap-3">
          <div className="cm-avatar-light">{initials}</div>
          <div>
            <div className="d-flex align-items-center gap-1">
              <h6 className="mb-1">{name}</h6>
              {backgroundVerified && (
                <FaCheckCircle className="cm-verified-icon" title="Background Verified" />
              )}
              {mentorshipCertified && (
                <FaCertificate className="cm-certified-icon" title="Mentorship Certified" />
              )}
            </div>
            <p className="cm-muted small mb-1">{role}</p>
            {company && (
              <p className="cm-muted small mb-0">
                <FaBuilding className="me-1" /> {company}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Already Assigned Department Badge */}
      {isAssigned && assignedDepartment && (
        <div className="mt-2">
          <span className="cm-assigned-badge">
            <FaUserCheck className="me-1" size={10} />
            Already assigned for: {assignedDepartment}
          </span>
        </div>
      )}

      {/* Available Departments (excluding assigned one) */}
      {departments.length > 0 && (
        <div className="mt-2">
          <span className="cm-muted small me-2">Available for:</span>
          {departments.map((dept, idx) => (
            <span key={idx} className="cm-tag-light me-1">{dept}</span>
          ))}
        </div>
      )}

      <div className="d-flex justify-content-between mt-3">
        <div>
          <span className="cm-muted small">Level</span>
          <br />
          <span className="cm-stat-small">{level}</span>
        </div>
        <div>
          <span className="cm-muted small">Exp</span>
          <br />
          <span className="cm-stat-small">{experience}</span>
        </div>
        <div>
          <span className="cm-muted small">Mentees</span>
          <br />
          <span className="cm-stat-small">{mentees}</span>
        </div>
      </div>

      <button 
        className={`btn ${isAssigned ? 'cm-connect-again-btn' : 'cm-connect-btn'} w-100 mt-3`}
        onClick={onConnect}
      >
        {isAssigned ? (
          <>
            <FaUserPlus className="me-2" />
            Connect for Another Department
          </>
        ) : (
          'Connect'
        )}
      </button>
    </div>
  </div>
);

export default CandidateMentorship;