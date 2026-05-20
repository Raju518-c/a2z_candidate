import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Sidebar from '../Layout/Sidebar';
import Header from '../Layout/Header';
import "./AddLearning.css";
import Swal from 'sweetalert2';
import { BASE_URL } from "../../../ApiUrl";
import { FaPlus, FaTrash, FaVideo, FaFolderOpen } from 'react-icons/fa';

const AddLearning = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [levelsLoading, setLevelsLoading] = useState(false);
  const [departmentsLoading, setDepartmentsLoading] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState({});
  const [isEditMode, setIsEditMode] = useState(false);
  
  // State for dropdown data
  const [levels, setLevels] = useState([]);
  const [departments, setDepartments] = useState([]);

  // State for sessions and videos
  const [sessions, setSessions] = useState([]);

  const [formData, setFormData] = useState({
    department: '',
    level: '',
    title: '',
    description: '',
    thumbnail: null,
    thumbnail_preview: null,
  });

  // Fetch levels and departments on component mount
  useEffect(() => {
    fetchLevels();
    fetchDepartments();
  }, []);

  // Fetch learning module data if in edit mode
  useEffect(() => {
    if (id) {
      setIsEditMode(true);
      fetchLearningModule();
    } else {
      // Initialize with one empty session
      initializeSessions();
    }
  }, [id]);

  const fetchLevels = async () => {
    try {
      setLevelsLoading(true);
      const response = await fetch(`${BASE_URL}/api/admin/levels/`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.status && result.data) {
        setLevels(result.data);
        console.log('✅ Levels fetched successfully:', result.data);
      } else {
        throw new Error(result.message || 'Failed to fetch levels');
      }
    } catch (err) {
      console.error('Error fetching levels:', err);
      Swal.fire({
        icon: 'error',
        title: 'Failed to Load Levels',
        text: err.message || 'An error occurred while loading levels',
        timer: 3000,
        showConfirmButton: true
      });
    } finally {
      setLevelsLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      setDepartmentsLoading(true);
      const response = await fetch(`${BASE_URL}/api/admin/departments/`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.status && result.data) {
        setDepartments(result.data);
        console.log('✅ Departments fetched successfully:', result.data);
      } else {
        throw new Error(result.message || 'Failed to fetch departments');
      }
    } catch (err) {
      console.error('Error fetching departments:', err);
      Swal.fire({
        icon: 'error',
        title: 'Failed to Load Departments',
        text: err.message || 'An error occurred while loading departments',
        timer: 3000,
        showConfirmButton: true
      });
    } finally {
      setDepartmentsLoading(false);
    }
  };

  const fetchLearningModule = async () => {
    try {
      setFetchLoading(true);
      const response = await fetch(`${BASE_URL}/api/mentor/learning-modules/${id}/`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.status && result.data) {
        const moduleData = result.data;
        setFormData({
          department: moduleData.department?.toString() || '',
          level: moduleData.level?.toString() || '',
          title: moduleData.title || '',
          description: moduleData.description || '',
          thumbnail: null,
          thumbnail_preview: moduleData.thumbnail_url || null,
        });
        
        // Load sessions and videos
        if (moduleData.sessions && Array.isArray(moduleData.sessions)) {
          const loadedSessions = moduleData.sessions.map((session, sessionIndex) => ({
            id: session.id,
            title: session.title,
            session_number: session.session_number,
            videos: (session.videos || []).map((video, videoIndex) => ({
              id: video.id,
              title: video.title,
              order_number: video.order_number,
              video: null,
              video_preview: video.video_url || null,
              thumbnail: null,
              thumbnail_preview: video.thumbnail_url || null,
              existing_video: video.video,
              existing_thumbnail: video.thumbnail,
            }))
          }));
          setSessions(loadedSessions);
        } else {
          initializeSessions();
        }
        
        console.log('✅ Learning module loaded for edit:', moduleData);
      } else {
        throw new Error(result.message || 'Failed to fetch learning module');
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching learning module:', err);
      
      Swal.fire({
        icon: 'error',
        title: 'Failed to Load Learning Module',
        text: err.message || 'An error occurred while loading learning module',
        timer: 3000,
        showConfirmButton: true
      });
    } finally {
      setFetchLoading(false);
    }
  };

  const initializeSessions = () => {
    setSessions([
      {
        id: Date.now(),
        title: '',
        session_number: 1,
        videos: []
      }
    ]);
  };

  // Session management functions
  const addSession = () => {
    const newSessionNumber = sessions.length + 1;
    setSessions([
      ...sessions,
      {
        id: Date.now(),
        title: '',
        session_number: newSessionNumber,
        videos: []
      }
    ]);
  };

  const updateSession = (sessionIndex, field, value) => {
    const updatedSessions = [...sessions];
    updatedSessions[sessionIndex][field] = value;
    setSessions(updatedSessions);
  };

  const removeSession = (sessionIndex) => {
    if (sessions.length === 1) {
      Swal.fire({
        icon: 'warning',
        title: 'Cannot Remove',
        text: 'You must have at least one session',
        confirmButtonText: 'OK',
      });
      return;
    }
    
    Swal.fire({
      title: 'Remove Session?',
      text: 'Are you sure you want to remove this session and all its videos?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, remove it!',
    }).then((result) => {
      if (result.isConfirmed) {
        const updatedSessions = sessions.filter((_, i) => i !== sessionIndex);
        // Renumber remaining sessions
        updatedSessions.forEach((session, idx) => {
          session.session_number = idx + 1;
        });
        setSessions(updatedSessions);
      }
    });
  };

  // Video management functions
  const addVideo = (sessionIndex) => {
    const updatedSessions = [...sessions];
    const newVideoNumber = updatedSessions[sessionIndex].videos.length + 1;
    updatedSessions[sessionIndex].videos.push({
      id: Date.now() + Math.random(),
      title: '',
      order_number: newVideoNumber,
      video: null,
      video_preview: null,
      thumbnail: null,
      thumbnail_preview: null,
      existing_video: null,
      existing_thumbnail: null,
    });
    setSessions(updatedSessions);
  };

  const updateVideo = (sessionIndex, videoIndex, field, value) => {
    const updatedSessions = [...sessions];
    updatedSessions[sessionIndex].videos[videoIndex][field] = value;
    setSessions(updatedSessions);
  };

  const handleVideoFile = (sessionIndex, videoIndex, file, type) => {
    if (!file) return;

    // Validate file type
    const validVideoTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];
    const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

    if (type === 'video' && !validVideoTypes.includes(file.type)) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Video Format',
        text: 'Please upload MP4, WebM, OGG, or MOV files',
        timer: 3000,
      });
      return;
    }

    if (type === 'thumbnail' && !validImageTypes.includes(file.type)) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Image Format',
        text: 'Please upload JPG, JPEG, PNG, or WebP images',
        timer: 3000,
      });
      return;
    }

    // Validate file size (100MB for video, 5MB for thumbnail)
    if (type === 'video' && file.size > 100 * 1024 * 1024) {
      Swal.fire({
        icon: 'error',
        title: 'File Too Large',
        text: 'Video file size should not exceed 100MB',
        timer: 3000,
      });
      return;
    }

    if (type === 'thumbnail' && file.size > 5 * 1024 * 1024) {
      Swal.fire({
        icon: 'error',
        title: 'File Too Large',
        text: 'Thumbnail image size should not exceed 5MB',
        timer: 3000,
      });
      return;
    }

    const updatedSessions = [...sessions];
    
    if (type === 'video') {
      updatedSessions[sessionIndex].videos[videoIndex].video = file;
      updatedSessions[sessionIndex].videos[videoIndex].video_preview = URL.createObjectURL(file);
      updatedSessions[sessionIndex].videos[videoIndex].existing_video = null;
    } else if (type === 'thumbnail') {
      updatedSessions[sessionIndex].videos[videoIndex].thumbnail = file;
      updatedSessions[sessionIndex].videos[videoIndex].thumbnail_preview = URL.createObjectURL(file);
      updatedSessions[sessionIndex].videos[videoIndex].existing_thumbnail = null;
    }
    
    setSessions(updatedSessions);
  };

  const removeVideo = (sessionIndex, videoIndex) => {
    Swal.fire({
      title: 'Remove Video?',
      text: 'Are you sure you want to remove this video?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, remove it!',
    }).then((result) => {
      if (result.isConfirmed) {
        const updatedSessions = [...sessions];
        updatedSessions[sessionIndex].videos = updatedSessions[sessionIndex].videos.filter((_, i) => i !== videoIndex);
        // Renumber remaining videos
        updatedSessions[sessionIndex].videos.forEach((video, idx) => {
          video.order_number = idx + 1;
        });
        setSessions(updatedSessions);
      }
    });
  };

  // Handle module thumbnail
  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validImageTypes.includes(file.type)) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Image Format',
        text: 'Please upload JPG, JPEG, PNG, or WebP images',
        timer: 3000,
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      Swal.fire({
        icon: 'error',
        title: 'File Too Large',
        text: 'Thumbnail image size should not exceed 5MB',
        timer: 3000,
      });
      return;
    }

    setFormData(prev => ({
      ...prev,
      thumbnail: file,
      thumbnail_preview: URL.createObjectURL(file)
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
  const newErrors = {};

  if (!formData.department) {
    newErrors.department = "Department is required";
  }

  if (!formData.level) {
    newErrors.level = "Level is required";
  }

  if (!formData.title?.trim()) {
    newErrors.title = "Title is required";
  }

  if (!formData.description?.trim()) {
    newErrors.description = "Description is required";
  }

  // Validate sessions
  if (sessions.length === 0) {
    newErrors.sessions = "At least one session is required";
  } else {
    sessions.forEach((session, sessionIndex) => {
      if (!session.title?.trim()) {
        newErrors[`session_${sessionIndex}_title`] = "Session title is required";
      }
      
      if (session.videos.length === 0) {
        newErrors[`session_${sessionIndex}_videos`] = "At least one video is required per session";
      } else {
        session.videos.forEach((video, videoIndex) => {
          if (!video.title?.trim()) {
            newErrors[`session_${sessionIndex}_video_${videoIndex}_title`] = "Video title is required";
          }
          
          // For create mode: video file is required
          // For edit mode: video file is required only if no existing video
          if (!isEditMode && !video.video) {
            newErrors[`session_${sessionIndex}_video_${videoIndex}_video`] = "Video file is required";
          }
          // In edit mode, if there's no existing_video and no new video file, show error
          if (isEditMode && !video.existing_video && !video.video) {
            newErrors[`session_${sessionIndex}_video_${videoIndex}_video`] = "Video file is required";
          }
        });
      }
    });
  }

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};

  // Function to log the payload in JSON format before submission
  const logPayload = () => {
    console.log('='.repeat(60));
    console.log('📋 PAYLOAD TO BE SENT TO BACKEND');
    console.log('='.repeat(60));
    
    // Build the payload object
    const payload = {
      department: parseInt(formData.department),
      level: parseInt(formData.level),
      title: formData.title,
      description: formData.description,
      thumbnail: formData.thumbnail ? formData.thumbnail.name : null,
      sessions: []
    };
    
    // Add sessions data
    for (let sIndex = 0; sIndex < sessions.length; sIndex++) {
      const session = sessions[sIndex];
      const sessionData = {
        title: session.title,
        session_number: session.session_number,
        videos: []
      };
      
      for (let vIndex = 0; vIndex < session.videos.length; vIndex++) {
        const video = session.videos[vIndex];
        const videoData = {
          title: video.title,
          order_number: video.order_number,
          video: video.video ? video.video.name : (video.existing_video || null),
          thumbnail: video.thumbnail ? video.thumbnail.name : (video.existing_thumbnail || null)
        };
        
        sessionData.videos.push(videoData);
      }
      
      payload.sessions.push(sessionData);
    }
    
    console.log(JSON.stringify(payload, null, 2));
    console.log('='.repeat(60));
    console.log('📎 Files being uploaded:');
    
    if (formData.thumbnail) {
      console.log(`  - Module Thumbnail: ${formData.thumbnail.name} (${(formData.thumbnail.size / 1024 / 1024).toFixed(2)} MB)`);
    }
    
    let fileCount = 0;
    for (let sIndex = 0; sIndex < sessions.length; sIndex++) {
      const session = sessions[sIndex];
      for (let vIndex = 0; vIndex < session.videos.length; vIndex++) {
        const video = session.videos[vIndex];
        if (video.video) {
          console.log(`  - Video [Session ${sIndex + 1}, Video ${vIndex + 1}]: ${video.video.name} (${(video.video.size / 1024 / 1024).toFixed(2)} MB)`);
          fileCount++;
        }
        if (video.thumbnail) {
          console.log(`  - Thumbnail [Session ${sIndex + 1}, Video ${vIndex + 1}]: ${video.thumbnail.name} (${(video.thumbnail.size / 1024 / 1024).toFixed(2)} MB)`);
          fileCount++;
        }
      }
    }
    
    if (fileCount === 0 && !formData.thumbnail) {
      console.log('  No files to upload');
    }
    console.log('='.repeat(60));
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  console.log("=".repeat(50));
  console.log(
    isEditMode
      ? "EDIT FORM SUBMISSION STARTED"
      : "CREATE FORM SUBMISSION STARTED"
  );

  if (!validateForm()) {
    console.log("❌ Form validation failed");

    Swal.fire({
      icon: "error",
      title: "Validation Failed",
      text: "Please check all required fields and try again.",
      timer: 3000,
      showConfirmButton: true,
    });

    return;
  }

  setLoading(true);
  setError("");

  try {
    // ==========================================
    // CREATE FORMDATA
    // ==========================================

    const formDataPayload = new FormData();

    // ==========================================
    // PREPARE JSON DATA (WITHOUT FILES)
    // ==========================================

    const moduleData = {
      department: parseInt(formData.department),
      level: parseInt(formData.level),
      title: formData.title,
      description: formData.description,

      sessions: sessions.map((session) => ({
        title: session.title,
        session_number: session.session_number,

        videos: session.videos.map((video) => ({
          title: video.title,
          order_number: video.order_number,
        })),
      })),
    };

    // ==========================================
    // APPEND JSON DATA
    // ==========================================

    formDataPayload.append(
      "module_data",
      JSON.stringify(moduleData)
    );

    // ==========================================
    // MODULE THUMBNAIL
    // ==========================================

    if (formData.thumbnail) {
      formDataPayload.append(
        "thumbnail",
        formData.thumbnail
      );
    }

    // ==========================================
    // APPEND VIDEOS & THUMBNAILS
    // FORMAT:
    // video_0_0
    // thumbnail_0_0
    // ==========================================

    sessions.forEach((session, sessionIndex) => {
      session.videos.forEach((video, videoIndex) => {

        // VIDEO FILE
        if (video.video) {
          formDataPayload.append(
            `video_${sessionIndex}_${videoIndex}`,
            video.video
          );
        }

        // THUMBNAIL FILE
        if (video.thumbnail) {
          formDataPayload.append(
            `thumbnail_${sessionIndex}_${videoIndex}`,
            video.thumbnail
          );
        }

      });
    });

    // ==========================================
    // CONSOLE LOG PAYLOAD
    // ==========================================

    console.log("=".repeat(60));
    console.log("📋 FINAL PAYLOAD");
    console.log("=".repeat(60));

    console.log(
      JSON.stringify(moduleData, null, 2)
    );

    console.log("=".repeat(60));
    console.log("📎 FILES");

    for (let pair of formDataPayload.entries()) {
      if (pair[1] instanceof File) {
        console.log(
          `${pair[0]} => ${pair[1].name} (${(
            pair[1].size /
            1024 /
            1024
          ).toFixed(2)} MB)`
        );
      } else {
        console.log(`${pair[0]} => ${pair[1]}`);
      }
    }

    console.log("=".repeat(60));

    // ==========================================
    // API URL
    // ==========================================

    const method = isEditMode ? "PUT" : "POST";

    const url = isEditMode
      ? `${BASE_URL}/api/mentor/learning-modules/${id}/`
      : `${BASE_URL}/api/mentor/learning-modules/`;

    console.log(`🌐 ${method} API => ${url}`);

    // ==========================================
    // API CALL
    // ==========================================

    const response = await fetch(url, {
      method: method,
      body: formDataPayload,
    });

    const responseData = await response.json();

    console.log("📥 RESPONSE");
    console.log(responseData);

    if (!response.ok) {
      throw new Error(
        responseData.message ||
          `Failed to ${
            isEditMode ? "update" : "create"
          } learning module`
      );
    }

    console.log(
      `✅ Learning module ${
        isEditMode ? "updated" : "created"
      } successfully`
    );

    await Swal.fire({
      icon: "success",
      title: isEditMode ? "Updated!" : "Created!",
      text: `Learning module has been ${
        isEditMode ? "updated" : "created"
      } successfully.`,
      timer: 2000,
      showConfirmButton: false,
    });

    navigate("/learning");

  } catch (err) {
    console.error("❌ ERROR:", err);

    setError(
      err.message ||
        `Failed to ${
          isEditMode ? "update" : "create"
        } learning module.`
    );

    Swal.fire({
      icon: "error",
      title: isEditMode
        ? "Update Failed"
        : "Creation Failed",
      text:
        err.message ||
        `Failed to ${
          isEditMode ? "update" : "create"
        } learning module.`,
      timer: 3000,
      showConfirmButton: true,
    });

  } finally {
    setLoading(false);
  }
};

  const handleCancel = () => {
    navigate('/learning');
  };

  if (fetchLoading || levelsLoading || departmentsLoading) {
    return (
      <div className="ta-layout-wrapper">
        <Sidebar />
        <div className="ta-main-wrapper">
          <Header />
          <div className="ta-content-area">
            <div className="text-center p-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-2">
                {fetchLoading ? 'Loading learning module...' : 
                 levelsLoading ? 'Loading levels...' : 'Loading departments...'}
              </p>
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
          <div className="al-wrapper">
            {/* Header */}
            <div className="al-header">
              <div>
                <h2>{isEditMode ? 'Edit Learning Module' : 'Add New Learning Module'}</h2>
                <p>{isEditMode ? 'Update the learning module details below' : 'Fill in the learning module details below'}</p>
              </div>
            </div>

            {/* Error Message */}
            {error && <div className="al-error">{error}</div>}

            {/* Form */}
            <div className="al-form-container">
              <form onSubmit={handleSubmit}>
                <div className="row">
                  {/* Basic Information Section */}
                  <div className="col-12">
                    <h5 className="al-section-title">Basic Information</h5>
                  </div>

                  {/* Department */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Department *</label>
                    <select
                      className={`form-select ${errors.department ? 'is-invalid' : ''}`}
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                    >
                      <option value="">Select Department</option>
                      {departments.map((dept) => (
                        <option key={dept.id} value={dept.id}>
                          {dept.name} ({dept.code})
                        </option>
                      ))}
                    </select>
                    {errors.department && (
                      <div className="invalid-feedback">{errors.department}</div>
                    )}
                  </div>

                  {/* Level */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Level *</label>
                    <select
                      className={`form-select ${errors.level ? 'is-invalid' : ''}`}
                      name="level"
                      value={formData.level}
                      onChange={handleChange}
                    >
                      <option value="">Select Level</option>
                      {levels.map((level) => (
                        <option key={level.id} value={level.id}>
                          {level.name} (Level {level.number}) - {level.code}
                        </option>
                      ))}
                    </select>
                    {errors.level && (
                      <div className="invalid-feedback">{errors.level}</div>
                    )}
                  </div>

                  {/* Title */}
                  <div className="col-md-12 mb-3">
                    <label className="form-label">Module Title *</label>
                    <input
                      type="text"
                      className={`form-control ${errors.title ? 'is-invalid' : ''}`}
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      placeholder="Enter module title"
                    />
                    {errors.title && (
                      <div className="invalid-feedback">{errors.title}</div>
                    )}
                  </div>

                  {/* Description */}
                  <div className="col-12 mb-3">
                    <label className="form-label">Description *</label>
                    <textarea
                      className={`form-control ${errors.description ? 'is-invalid' : ''}`}
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows="3"
                      placeholder="Enter detailed description"
                    />
                    {errors.description && (
                      <div className="invalid-feedback">{errors.description}</div>
                    )}
                  </div>

                  {/* Module Thumbnail */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Module Thumbnail</label>
                    <input
                      type="file"
                      className="form-control"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      onChange={handleThumbnailChange}
                    />
                    <small className="text-muted">Recommended size: 1280x720px, Max 5MB</small>
                    {formData.thumbnail_preview && (
                      <div className="mt-2">
                        <img 
                          src={formData.thumbnail_preview} 
                          alt="Thumbnail preview" 
                          style={{ maxWidth: '200px', borderRadius: '8px' }}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Sessions Section */}
                <div className="row mt-4">
                  <div className="col-12">
                    <h5 className="al-section-title">Sessions & Videos</h5>
                    {errors.sessions && (
                      <div className="alert alert-danger">{errors.sessions}</div>
                    )}
                  </div>
                </div>

                {sessions.map((session, sessionIndex) => (
                  <div key={session.id} className="session-card">
                    <div className="session-header">
                      <h6>Session {session.session_number}</h6>
                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        onClick={() => removeSession(sessionIndex)}
                      >
                        <FaTrash /> Remove Session
                      </button>
                    </div>
                    
                    <div className="row">
                      <div className="col-12 mb-3">
                        <label className="form-label">Session Title *</label>
                        <input
                          type="text"
                          className={`form-control ${errors[`session_${sessionIndex}_title`] ? 'is-invalid' : ''}`}
                          value={session.title}
                          onChange={(e) => updateSession(sessionIndex, 'title', e.target.value)}
                          placeholder="Enter session title"
                        />
                        {errors[`session_${sessionIndex}_title`] && (
                          <div className="invalid-feedback">{errors[`session_${sessionIndex}_title`]}</div>
                        )}
                      </div>
                    </div>

                    {/* Videos Section */}
                    <div className="videos-section">
                      <div className="videos-header">
                        <label className="form-label">Videos</label>
                        <button
                          type="button"
                          className="btn btn-success btn-sm"
                          onClick={() => addVideo(sessionIndex)}
                        >
                          <FaPlus /> Add Video
                        </button>
                      </div>
                      
                      {errors[`session_${sessionIndex}_videos`] && (
                        <div className="alert alert-danger mt-2">{errors[`session_${sessionIndex}_videos`]}</div>
                      )}

                      {session.videos.map((video, videoIndex) => (
                        <div key={video.id} className="video-card">
                          <div className="video-header">
                            <h6>Video {video.order_number}</h6>
                            <button
                              type="button"
                              className="btn btn-outline-danger btn-sm"
                              onClick={() => removeVideo(sessionIndex, videoIndex)}
                            >
                              <FaTrash /> Remove
                            </button>
                          </div>
                          
                          <div className="row">
                            <div className="col-md-6 mb-3">
                              <label className="form-label">Video Title *</label>
                              <input
                                type="text"
                                className={`form-control ${errors[`session_${sessionIndex}_video_${videoIndex}_title`] ? 'is-invalid' : ''}`}
                                value={video.title}
                                onChange={(e) => updateVideo(sessionIndex, videoIndex, 'title', e.target.value)}
                                placeholder="Enter video title"
                              />
                              {errors[`session_${sessionIndex}_video_${videoIndex}_title`] && (
                                <div className="invalid-feedback">{errors[`session_${sessionIndex}_video_${videoIndex}_title`]}</div>
                              )}
                            </div>
                            
                            <div className="col-md-6 mb-3">
                              <label className="form-label">Video File *</label>
                              <input
                                type="file"
                                className={`form-control ${errors[`session_${sessionIndex}_video_${videoIndex}_video`] ? 'is-invalid' : ''}`}
                                accept="video/mp4,video/webm,video/ogg,video/quicktime"
                                onChange={(e) => handleVideoFile(sessionIndex, videoIndex, e.target.files[0], 'video')}
                              />
                              {errors[`session_${sessionIndex}_video_${videoIndex}_video`] && (
                                <div className="invalid-feedback">{errors[`session_${sessionIndex}_video_${videoIndex}_video`]}</div>
                              )}
                              {video.video_preview && (
                                <div className="mt-2">
                                  <video controls style={{ maxWidth: '100%', maxHeight: '200px' }}>
                                    <source src={video.video_preview} type="video/mp4" />
                                  </video>
                                </div>
                              )}
                              {video.existing_video && !video.video && (
                                <small className="text-muted d-block mt-1">
                                  <FaVideo /> Existing video available
                                </small>
                              )}
                              <small className="text-muted">Max 100MB, MP4/WebM/OGG/MOV</small>
                            </div>
                            
                            <div className="col-md-6 mb-3">
                              <label className="form-label">Video Thumbnail</label>
                              <input
                                type="file"
                                className="form-control"
                                accept="image/jpeg,image/jpg,image/png,image/webp"
                                onChange={(e) => handleVideoFile(sessionIndex, videoIndex, e.target.files[0], 'thumbnail')}
                              />
                              {video.thumbnail_preview && (
                                <div className="mt-2">
                                  <img 
                                    src={video.thumbnail_preview} 
                                    alt="Thumbnail preview" 
                                    style={{ maxWidth: '150px', borderRadius: '8px' }}
                                  />
                                </div>
                              )}
                              {video.existing_thumbnail && !video.thumbnail && (
                                <small className="text-muted d-block mt-1">
                                  <FaFolderOpen /> Existing thumbnail available
                                </small>
                              )}
                              <small className="text-muted">Max 5MB, JPG/PNG/WebP</small>
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {session.videos.length === 0 && (
                        <div className="alert alert-info mt-2">
                          No videos added yet. Click "Add Video" to add videos to this session.
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Add Session Button */}
                <div className="row mt-3">
                  <div className="col-12">
                    <button
                      type="button"
                      className="btn btn-outline-primary"
                      onClick={addSession}
                    >
                      <FaPlus /> Add Session
                    </button>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="al-actions mt-4">
                  <button 
                    type="button" 
                    className="btn btn-outline-secondary"
                    onClick={handleCancel}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Update Module' : 'Add Module')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddLearning;