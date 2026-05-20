import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from 'sweetalert2';
import Sidebar from "../Layout/Sidebar";
import Header from "../Layout/Header";
import "./DepartmentLevel.css";
import {
   FaChevronLeft,
  FaChevronRight,
  FaPlus,
  FaEdit,
  FaTrash,
  FaUserGraduate,
  FaUser,
  FaUserTie,
  FaUserCheck,
  FaUserAstronaut,
  FaUserShield,
  FaChartLine,
  FaCalendarAlt
} from "react-icons/fa";
import { BASE_URL } from '../../../ApiUrl';

const DepartmentLevel = () => {
  const [departmentLevels, setDepartmentLevels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [departments, setDepartments] = useState([]);
  const navigate = useNavigate();

  // Refs for each department section
  const departmentRefs = useRef({});

  // Fetch department levels on component mount
  useEffect(() => {
    fetchDepartmentLevels();
    fetchDepartments();
  }, []);

  const fetchDepartmentLevels = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/api/admin/department-levels/`);
      const data = await response.json();
      
      if (data.status && data.data) {
        setDepartmentLevels(data.data);
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to fetch department levels',
          confirmButtonColor: '#007bff'
        });
      }
    } catch (error) {
      console.error('Error fetching department levels:', error);
      Swal.fire({
        icon: 'error',
        title: 'Connection Error',
        text: 'Error connecting to server',
        confirmButtonColor: '#007bff'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/admin/departments/`);
      const data = await response.json();
      
      if (data.status && data.data) {
        setDepartments(data.data);
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const scrollLeft = (refKey) => {
    if (departmentRefs.current[refKey]) {
      departmentRefs.current[refKey].scrollBy({
        left: -350,
        behavior: "smooth"
      });
    }
  };

  const scrollRight = (refKey) => {
    if (departmentRefs.current[refKey]) {
      departmentRefs.current[refKey].scrollBy({
        left: 350,
        behavior: "smooth"
      });
    }
  };

  const handleAddDepartment = () => {
    navigate("/add-department-level");
  };

  const handleEdit = (id) => {
    // Navigate to edit page with the id
    navigate(`/add-department-level/${id}`);
  };

  const handleDelete = async (id, departmentName, levelName) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `You are about to delete ${departmentName} - ${levelName}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(`${BASE_URL}/api/admin/department-levels/${id}/`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          }
        });

        if (response.ok) {
          Swal.fire({
            icon: 'success',
            title: 'Deleted!',
            text: 'Department level has been deleted.',
            confirmButtonColor: '#007bff',
            timer: 1500
          });
          // Refresh the list
          fetchDepartmentLevels();
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error!',
            text: 'Failed to delete department level',
            confirmButtonColor: '#007bff'
          });
        }
      } catch (error) {
        console.error('Error deleting department level:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: 'Error connecting to server',
          confirmButtonColor: '#007bff'
        });
      }
    }
  };

  // Group department levels by department
  const groupByDepartment = () => {
    const grouped = {};
    departmentLevels.forEach(item => {
      if (!grouped[item.department]) {
        grouped[item.department] = {
          departmentId: item.department,
          departmentName: item.department_name,
          levels: []
        };
      }
      grouped[item.department].levels.push(item);
    });
    return grouped;
  };

  const groupedData = groupByDepartment();

  if (loading) {
    return (
      <div className="ta-layout-wrapper">
        <Sidebar />
        <div className="ta-main-wrapper">
          <Header />
          <div className="ta-content-area">
            <div className="loading-container">Loading department levels...</div>
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
          <div className="dept-wrapper">

            <div className="dept-header">
              <h2>Department Level Management</h2>

              <button 
                className="btn btn-primary"
                onClick={handleAddDepartment}
              >
                <FaPlus /> Add Department Level
              </button>
            </div>

            {Object.keys(groupedData).length === 0 ? (
              <div className="no-data-message">
                No department levels found. Click "Add Department Level" to create one.
              </div>
            ) : (
              Object.values(groupedData).map((department) => (
                <DepartmentSection
                  key={department.departmentId}
                  title={`${department.departmentName}`}
                  scrollRefKey={department.departmentId}
                  scrollRef={(el) => {
                    if (el) departmentRefs.current[department.departmentId] = el;
                  }}
                  scrollLeft={scrollLeft}
                  scrollRight={scrollRight}
                  levels={department.levels}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

/* ---------------- Department Section ---------------- */
/* ---------------- Department Section (Updated) ---------------- */
const DepartmentSection = ({
  title,
  scrollRefKey,
  scrollRef,
  scrollLeft,
  scrollRight,
  levels,
  onEdit,
  onDelete
}) => {

  return (
    <div className="dept-section">

      {/* Department Heading */}
      <div className="dept-title">
        {title} ({levels.length} {levels.length === 1 ? 'Level' : 'Levels'})
      </div>

      {/* Grid Layout - No Scroll */}
      <div className="dept-slider-container">
        <div className="dept-slider">
          {levels.map((level) => (
            <LevelCard 
              key={level.id}
              id={level.id}
              levelName={level.level_name}
              levelNumber={level.level_number}
              minOverallScore={level.min_overall_score}
              durationWeeks={level.duration_weeks}
              onEdit={onEdit}
              onDelete={onDelete}
              departmentName={title}
            />
          ))}
        </div>
      </div>

    </div>
  );
};

/* ---------------- Level Card ---------------- */
const LevelCard = ({ 
  id, 
  levelName, 
  levelNumber, 
  minOverallScore, 
  durationWeeks,
  onEdit,
  onDelete,
  departmentName
}) => {
  
  const getLevelBadgeClass = (levelNumber) => {
    switch(levelNumber) {
      case 0:
        return 'level-badge trainee';
      case 1:
        return 'level-badge junior';
      case 2:
        return 'level-badge associate';
      case 3:
        return 'level-badge surveyor';
      case 4:
        return 'level-badge senior';
      case 5:
        return 'level-badge principal';
      default:
        return 'level-badge';
    }
  };


    const getLevelIcon = (levelNumber) => {
    switch(levelNumber) {
      case 0:
        return <FaUserGraduate />;  // Trainee - Graduation cap
      case 1:
        return <FaUser />;  // Junior - User icon
      case 2:
        return <FaUserTie />;  // Associate - Business user
      case 3:
        return <FaChartLine />;  // Surveyor - Chart/analytics
      case 4:
        return <FaUserAstronaut />;  // Senior - Advanced/specialized
      case 5:
        return <FaUserShield />;  // Principal - Shield/authority
      default:
        return <FaUserCheck />;  // Default
    }
  };

  const getIconBackground = (levelNumber) => {
    switch(levelNumber) {
      case 0:
        return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';  
      case 1:
        return 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)';  
      case 2:
        return 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)';  
      case 3:
        return 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)';  
      case 4:
        return 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';  
      case 5:
        return 'linear-gradient(135deg, #10b981 0%, #059669 100%)';  
      default:
        return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    }
  };

  const handleEditClick = () => {
    onEdit(id);
  };

  const handleDeleteClick = () => {
    onDelete(id, departmentName, levelName);
  };

  return (
    <div className="dept-level-card">

      <div className="dept-card-header">
        <div className="dept-card-icon"    style={{ background: getIconBackground(levelNumber) }} > {getLevelIcon(levelNumber)}</div>

        <div className="dept-card-actions">
          <FaEdit className="edit-icon" onClick={handleEditClick} />
          <FaTrash className="delete-icon" onClick={handleDeleteClick} />
        </div>
      </div>

      <h5 className="dept-card-title">
        {levelName}
      </h5>

      <div className="dept-card-stats">
        <div className="stat-item">
          <span className="stat-label">Min Score:</span>
          <span className="stat-value">{minOverallScore}%</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Duration:</span>
          <span className="stat-value">{durationWeeks} weeks</span>
        </div>
      </div>

      {/* <p className="dept-card-desc">
        Training and skill development for {levelName} level
      </p> */}

      <div className="dept-card-footer">
        <span className={getLevelBadgeClass(levelNumber)}>
          Level {levelNumber + 1}
        </span>
      </div>

    </div>
  );
};

export default DepartmentLevel;