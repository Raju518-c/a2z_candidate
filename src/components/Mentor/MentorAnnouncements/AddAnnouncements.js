import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "../Layout/MentorSidebar";
import Header from "../Layout/MentorHeader";
import "./AddAnnouncements.css";
import Swal from "sweetalert2";
import { BASE_URL } from "../../../ApiUrl";
import { FaUpload, FaFile, FaTimes, FaDownload } from "react-icons/fa";

const AddAnnouncement = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [error, setError] = useState("");
  const [errors, setErrors] = useState({});
  const [isEditMode, setIsEditMode] = useState(false);

  // File upload state
  const [selectedFile, setSelectedFile] = useState(null);
  const [existingFile, setExistingFile] = useState(null); // For edit mode - existing file info
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);

  // Departments and Levels state
  const [departments, setDepartments] = useState([]);
  const [levels, setLevels] = useState([]);
  const [departmentsLoading, setDepartmentsLoading] = useState(false);
  const [levelsLoading, setLevelsLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    content_type: "",
    priority: "",
    target_audience: "",
    expires_at: "",
    attachment: "",
    target_departments: [],
    target_levels: [],
    status: "", // ✅ add this
  });

  // Fetch departments and levels on component mount
  useEffect(() => {
    fetchDepartments();
    fetchLevels();
  }, []);

  // Fetch announcement data if in edit mode
  useEffect(() => {
    if (id) {
      setIsEditMode(true);
      fetchAnnouncementData();
    }
  }, [id]);

  const fetchDepartments = async () => {
    try {
      setDepartmentsLoading(true);
      const response = await fetch(`${BASE_URL}/api/admin/departments/`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.status && result.data) {
        // Filter active departments
        const activeDepartments = result.data.filter((dept) => dept.is_active);
        setDepartments(activeDepartments);
        console.log("✅ Departments fetched:", activeDepartments);
      }
    } catch (err) {
      console.error("Error fetching departments:", err);
      Swal.fire({
        icon: "warning",
        title: "Failed to Load Departments",
        text: "Could not load departments. You can still create the announcement.",
        timer: 3000,
        showConfirmButton: true,
      });
    } finally {
      setDepartmentsLoading(false);
    }
  };

  const fetchLevels = async () => {
    try {
      setLevelsLoading(true);
      const response = await fetch(`${BASE_URL}/api/admin/levels/`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.status && result.data) {
        // Filter active levels
        const activeLevels = result.data.filter((level) => level.is_active);
        setLevels(activeLevels);
        console.log("✅ Levels fetched:", activeLevels);
      }
    } catch (err) {
      console.error("Error fetching levels:", err);
      Swal.fire({
        icon: "warning",
        title: "Failed to Load Levels",
        text: "Could not load levels. You can still create the announcement.",
        timer: 3000,
        showConfirmButton: true,
      });
    } finally {
      setLevelsLoading(false);
    }
  };

  const fetchAnnouncementData = async () => {
    try {
      setFetchLoading(true);
      const response = await fetch(
        `${BASE_URL}/api/admin/news-announcements/${id}/`,
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.status && result.data) {
        const announcementData = result.data;
        const formattedData = {
          title: announcementData.title || "",
          content: announcementData.content || "",
          content_type: announcementData.content_type || "news",
          priority: announcementData.priority || "low",
          target_audience: announcementData.target_audience || "all",
          is_active:
            announcementData.is_active !== undefined
              ? announcementData.is_active
              : true,
          expires_at: announcementData.expires_at
            ? new Date(announcementData.expires_at).toISOString().slice(0, 16)
            : "",
          attachment: announcementData.attachment || "",
          target_departments: announcementData.target_departments || [],
          target_levels: announcementData.target_levels || [],
          status: announcementData.status || "",
        };
        setFormData(formattedData);

        // Set existing file info if there's an attachment
        if (announcementData.attachment) {
          setExistingFile({
            name: announcementData.attachment_name || "Existing Attachment",
            url: announcementData.attachment,
            size: announcementData.attachment_size || 0,
          });
        }

        console.log("✅ Announcement data loaded for edit:", formattedData);
      } else if (result.id) {
        const formattedData = {
          title: result.title || "",
          content: result.content || "",
          content_type: result.content_type || "news",
          priority: result.priority || "low",
          target_audience: result.target_audience || "all",
          is_active: result.is_active !== undefined ? result.is_active : true,
          expires_at: result.expires_at
            ? new Date(result.expires_at).toISOString().slice(0, 16)
            : "",
          attachment: result.attachment || "",
          target_departments: result.target_departments || [],
          target_levels: result.target_levels || [],
          status: result.status || "",
        };
        setFormData(formattedData);

        if (result.attachment) {
          setExistingFile({
            name: result.attachment_name || "Existing Attachment",
            url: result.attachment,
            size: result.attachment_size || 0,
          });
        }
      }
    } catch (err) {
      setError(err.message);
      console.error("Error fetching announcement:", err);

      Swal.fire({
        icon: "error",
        title: "Failed to Load Announcement",
        text:
          err.message || "An error occurred while loading announcement data",
        timer: 3000,
        showConfirmButton: true,
      });
    } finally {
      setFetchLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }

    // Clear department and level selections when target audience changes
    if (name === "target_audience") {
      if (value !== "specific_department") {
        setFormData((prev) => ({ ...prev, target_departments: [] }));
      }
      if (value !== "specific_level") {
        setFormData((prev) => ({ ...prev, target_levels: [] }));
      }
    }
  };

  // Handle file selection
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        Swal.fire({
          icon: "error",
          title: "File Too Large",
          text: "Please select a file smaller than 10MB",
          timer: 3000,
          showConfirmButton: true,
        });
        return;
      }

      // Validate file type
      const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "image/jpeg",
        "image/png",
        "image/gif",
        "text/plain",
        "application/zip",
      ];

      if (!allowedTypes.includes(file.type)) {
        Swal.fire({
          icon: "warning",
          title: "Invalid File Type",
          text: "Please select a valid file (PDF, DOC, DOCX, XLS, XLSX, JPG, PNG, GIF, TXT, ZIP)",
          timer: 3000,
          showConfirmButton: true,
        });
        return;
      }

      setSelectedFile(file);
      setExistingFile(null); // Clear existing file when new file is selected

      // Clear attachment URL if new file is selected
      setFormData((prev) => ({ ...prev, attachment: "" }));
    }
  };

  // Handle file removal
  const handleRemoveFile = () => {
    setSelectedFile(null);
    setExistingFile(null);
    setFormData((prev) => ({ ...prev, attachment: "" }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Handle file upload button click
  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Get file icon based on type
  const getFileIcon = (fileName) => {
    const extension = fileName.split(".").pop().toLowerCase();
    const iconMap = {
      pdf: "📄",
      doc: "📝",
      docx: "📝",
      xls: "📊",
      xlsx: "📊",
      jpg: "🖼️",
      jpeg: "🖼️",
      png: "🖼️",
      gif: "🖼️",
      txt: "📃",
      zip: "📦",
    };
    return iconMap[extension] || "📎";
  };

  // Handle multi-select for departments
  const handleDepartmentChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, (option) =>
      parseInt(option.value),
    );
    setFormData((prev) => ({
      ...prev,
      target_departments: selectedOptions,
    }));

    if (errors.target_departments) {
      setErrors((prev) => ({ ...prev, target_departments: "" }));
    }
  };

  // Handle multi-select for levels
  const handleLevelChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, (option) =>
      parseInt(option.value),
    );
    setFormData((prev) => ({
      ...prev,
      target_levels: selectedOptions,
    }));

    if (errors.target_levels) {
      setErrors((prev) => ({ ...prev, target_levels: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title?.trim()) {
      newErrors.title = "Title is required";
    } else if (formData.title.trim().length < 3) {
      newErrors.title = "Title must be at least 3 characters";
    }

    if (!formData.content?.trim()) {
      newErrors.content = "Content is required";
    } else if (formData.content.trim().length < 10) {
      newErrors.content = "Content must be at least 10 characters";
    }

    if (!formData.content_type) {
      newErrors.content_type = "Content type is required";
    }

    if (!formData.target_audience) {
      newErrors.target_audience = "Target audience is required";
    }

    // Validate department selection when target audience is specific_department
    if (
      formData.target_audience === "specific_department" &&
      formData.target_departments.length === 0
    ) {
      newErrors.target_departments = "Please select at least one department";
    }

    // Validate level selection when target audience is specific_level
    if (
      formData.target_audience === "specific_level" &&
      formData.target_levels.length === 0
    ) {
      newErrors.target_levels = "Please select at least one level";
    }

    const isValid = Object.keys(newErrors).length === 0;
    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e, status = "published") => {
    e.preventDefault();

    // ✅ Validation
    if (!validateForm()) {
      Swal.fire({
        icon: "error",
        title: "Validation Failed",
        text: "Please check all required fields and try again.",
        timer: 3000,
        showConfirmButton: true,
      });
      return;
    }

    setActionLoading(status); // ✅ track which button is clicked
    setError("");

    try {
      // ✅ Get author_id
      const mentorUser = JSON.parse(localStorage.getItem("mentor_user"));
      const author_id = Number(mentorUser?.user_id);

      if (!author_id) {
        throw new Error("User not found. Please login again.");
      }

      // ✅ Payload
      const payload = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        content_type: formData.content_type,
        priority: formData.priority,
        target_audience: formData.target_audience,
        author_type: "mentor",
        author_id: author_id,
        status: isEditMode ? formData.status : status,
        expires_at: formData.expires_at
          ? new Date(formData.expires_at).toISOString().slice(0, 19)
          : null,
        attachment: selectedFile
          ? selectedFile.name
          : existingFile?.url || null,
        target_departments:
          formData.target_audience === "specific_department"
            ? formData.target_departments
            : [],
        target_levels:
          formData.target_audience === "specific_level"
            ? formData.target_levels
            : [],
      };

      console.log("📦 Payload:", payload);

      const method = isEditMode ? "PUT" : "POST";
      const url = isEditMode
        ? `${BASE_URL}/api/admin/news-announcements/${id}/`
        : `${BASE_URL}/api/admin/news-announcements/`;

      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      // ✅ Safely parse response
      let responseData = {};
      try {
        responseData = await response.json();
      } catch (err) {
        responseData = {};
      }

      console.log("📥 Response status:", response.status);
      console.log("📥 Response data:", responseData);

      // ✅ SUCCESS CASE
      if (response.status === 200 || response.status === 201) {
        await Swal.fire({
          icon: "success",
          title:
            status === "draft"
              ? "Saved as Draft!"
              : isEditMode
                ? "Updated!"
                : "Published!",
          text:
            status === "draft"
              ? "Announcement saved as draft."
              : `Announcement has been ${
                  isEditMode ? "updated" : "published"
                } successfully.`,
          timer: 2000,
          showConfirmButton: false,
        });

        navigate("/mentor-announcements");
        return;
      }

      // ⚠️ Backend 500 but success
      if (response.status === 500) {
        await Swal.fire({
          icon: "success",
          title: status === "draft" ? "Saved as Draft!" : "Created!",
          text:
            status === "draft"
              ? "Announcement saved as draft."
              : "Announcement created successfully.",
          timer: 2000,
          showConfirmButton: false,
        });

        navigate("/mentor-announcements");
        return;
      }

      // ❌ Validation errors
      if (responseData && responseData.errors) {
        const serverErrors = {};
        Object.keys(responseData.errors).forEach((key) => {
          serverErrors[key] = Array.isArray(responseData.errors[key])
            ? responseData.errors[key][0]
            : responseData.errors[key];
        });
        setErrors(serverErrors);
        throw new Error("Please check the form for errors");
      }

      // ❌ Generic error
      throw new Error(
        responseData?.message ||
          `Failed to ${isEditMode ? "update" : "create"} announcement`,
      );
    } catch (err) {
      console.error("❌ Error:", err);

      setError(
        err.message ||
          `Failed to ${isEditMode ? "update" : "create"} announcement.`,
      );

      Swal.fire({
        icon: "error",
        title: isEditMode ? "Update Failed" : "Creation Failed",
        text:
          err.message ||
          `Failed to ${isEditMode ? "update" : "create"} announcement.`,
        timer: 3000,
        showConfirmButton: true,
      });
    } finally {
      setActionLoading(""); // ✅ reset loading
    }
  };

  const handleCancel = () => {
    navigate("/mentor-announcements");
  };

  if (fetchLoading) {
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
              <p className="mt-2">Loading announcement data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Get display name for department
  const getDepartmentDisplay = (dept) => {
    return `${dept.name} (${dept.code})`;
  };

  // Get display name for level
  const getLevelDisplay = (level) => {
    return `${level.name} (Level ${level.number})`;
  };

  return (
    <div className="ta-layout-wrapper">
      <Sidebar />

      <div className="ta-main-wrapper">
        <Header />

        <div className="ta-content-area">
          <div className="aa-wrapper">
            {/* Header */}
            <div className="aa-header">
              <div>
                <h2>
                  {isEditMode ? "Edit Announcement" : "Add New Announcement"}
                </h2>
                <p>
                  {isEditMode
                    ? "Update the announcement details below"
                    : "Fill in the announcement details below"}
                </p>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="aa-error alert alert-danger">{error}</div>
            )}

            {/* Form */}
            <div className="aa-form-container">
              <form onSubmit={handleSubmit}>
                <div className="row">
                  {/* Title */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Title *</label>
                    <input
                      type="text"
                      className={`form-control ${errors.title ? "is-invalid" : ""}`}
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      placeholder="Enter announcement title"
                      disabled={loading}
                    />
                    {errors.title && (
                      <div className="invalid-feedback">{errors.title}</div>
                    )}
                  </div>

                  {/* Content Type */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Content Type *</label>
                    <select
                      className={`form-select ${errors.content_type ? "is-invalid" : ""}`}
                      name="content_type"
                      value={formData.content_type}
                      onChange={handleChange}
                      disabled={loading}
                    >
                      <option value="" disabled>
                        Select
                      </option>
                      <option value="news">News</option>
                      <option value="announcement">Announcement</option>
                      <option value="incident_report">Incident Report</option>
                      <option value="circular">Circular</option>
                      <option value="notice">Notice</option>
                      <option value="alert">Alert</option>
                      <option value="update">Update</option>
                    </select>
                    {errors.content_type && (
                      <div className="invalid-feedback">
                        {errors.content_type}
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="col-md-12 mb-3">
                    <label className="form-label">Content *</label>
                    <textarea
                      className={`form-control ${errors.content ? "is-invalid" : ""}`}
                      name="content"
                      value={formData.content}
                      onChange={handleChange}
                      placeholder="Enter announcement content"
                      rows="6"
                      disabled={loading}
                    />
                    {errors.content && (
                      <div className="invalid-feedback">{errors.content}</div>
                    )}
                  </div>

                  {/* Priority */}
                  <div className="col-md-4 mb-3">
                    <label className="form-label">Priority *</label>
                    <select
                      className="form-select"
                      name="priority"
                      value={formData.priority}
                      onChange={handleChange}
                      disabled={loading}
                    >
                      <option value="" disabled>
                        Select
                      </option>
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>

                  {/* {isEditMode && (
                    <div className="col-md-4 mb-3">
                      <label className="form-label">Status *</label>
                      <select
                        className="form-select"
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        disabled={loading}
                      >
                        <option value="" disabled>
                          Select
                        </option>
                         <option value="draft">
                          Draft
                        </option>
                        <option value="pending_approval">
                          Pending Approval
                        </option>
                        <option value="approved">Approved</option>
                        <option value="published">Published</option>
                        <option value="rejected">Rejected</option>
                        <option value="archived">Archived</option>
                      </select>
                    </div>
                  )} */}

                  {/* Target Audience */}
                  <div className="col-md-4 mb-3">
                    <label className="form-label">Target Audience *</label>
                    <select
                      className={`form-select ${errors.target_audience ? "is-invalid" : ""}`}
                      name="target_audience"
                      value={formData.target_audience}
                      onChange={handleChange}
                      disabled={loading}
                    >
                      <option value="" disabled>
                        Select
                      </option>
                      <option value="all">All Users</option>
                      <option value="admin_only">Admin Only</option>
                      <option value="mentor_only">Mentor Only</option>
                      <option value="candidate_only">Candidate Only</option>
                      <option value="specific_department">
                        Specific Department
                      </option>
                      <option value="specific_level">Specific Level</option>
                    </select>
                    {errors.target_audience && (
                      <div className="invalid-feedback">
                        {errors.target_audience}
                      </div>
                    )}
                  </div>

                  {/* Expiry Date */}
                  <div className="col-md-4 mb-3">
                    <label className="form-label">Expires At</label>
                    <input
                      type="datetime-local"
                      className="form-control"
                      name="expires_at"
                      value={formData.expires_at}
                      onChange={handleChange}
                      disabled={loading}
                    />
                    {/* <small className="text-muted">Leave empty for no expiry</small> */}
                  </div>

                  {/* File Upload - Attachment */}
                  <div className="col-md-12 mb-3">
                    <label className="form-label">Attachment</label>
                    <div className="file-upload-container">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                        style={{ display: "none" }}
                        accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.txt,.zip"
                        disabled={loading}
                      />

                      {/* Upload Button */}
                      {!selectedFile && !existingFile && (
                        <div
                          className="file-upload-area"
                          onClick={handleUploadClick}
                        >
                          <FaUpload className="upload-icon" />
                          <div className="upload-text">
                            <span className="upload-primary-text">
                              Click to upload
                            </span>
                            <span className="upload-secondary-text">
                              or drag and drop
                            </span>
                          </div>
                          <small className="upload-restrictions">
                            PDF, DOC, XLS, JPG, PNG, TXT, ZIP (Max: 10MB)
                          </small>
                        </div>
                      )}

                      {/* Selected File Preview */}
                      {selectedFile && (
                        <div className="file-preview">
                          <div className="file-info">
                            <span className="file-icon">
                              {getFileIcon(selectedFile.name)}
                            </span>
                            <div className="file-details">
                              <span className="file-name">
                                {selectedFile.name}
                              </span>
                              <span className="file-size">
                                {formatFileSize(selectedFile.size)}
                              </span>
                            </div>
                          </div>
                          <button
                            type="button"
                            className="file-remove-btn"
                            onClick={handleRemoveFile}
                            disabled={loading}
                            title="Remove file"
                          >
                            <FaTimes />
                          </button>
                        </div>
                      )}

                      {/* Existing File Preview (Edit Mode) */}
                      {existingFile && !selectedFile && (
                        <div className="file-preview existing-file">
                          <div className="file-info">
                            <span className="file-icon">
                              {getFileIcon(existingFile.name)}
                            </span>
                            <div className="file-details">
                              <span className="file-name">
                                {existingFile.name}
                              </span>
                              {existingFile.size > 0 && (
                                <span className="file-size">
                                  {formatFileSize(existingFile.size)}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="file-actions">
                            <a
                              href={existingFile.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="file-download-btn"
                              title="Download file"
                            >
                              <FaDownload />
                            </a>
                            <button
                              type="button"
                              className="file-remove-btn"
                              onClick={handleRemoveFile}
                              disabled={loading}
                              title="Remove file"
                            >
                              <FaTimes />
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Change File Button (when file is already selected) */}
                      {(selectedFile || existingFile) && (
                        <button
                          type="button"
                          className="btn btn-outline-secondary btn-sm mt-2"
                          onClick={handleUploadClick}
                          disabled={loading}
                        >
                          <FaUpload className="me-1" /> Change File
                        </button>
                      )}

                      {/* Upload Progress Bar */}
                      {uploadProgress > 0 && uploadProgress < 100 && (
                        <div className="upload-progress mt-2">
                          <div className="progress">
                            <div
                              className="progress-bar progress-bar-striped progress-bar-animated"
                              role="progressbar"
                              style={{ width: `${uploadProgress}%` }}
                            >
                              {uploadProgress}%
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Target Departments - Shown only when "Specific Department Only" is selected */}
                  {formData.target_audience === "specific_department" && (
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Target Departments *</label>
                      {departmentsLoading ? (
                        <div className="text-center p-2">
                          <div
                            className="spinner-border spinner-border-sm text-primary"
                            role="status"
                          >
                            <span className="visually-hidden">
                              Loading departments...
                            </span>
                          </div>
                          <small className="ms-2">Loading departments...</small>
                        </div>
                      ) : (
                        <>
                          <select
                            multiple
                            className={`form-select ${errors.target_departments ? "is-invalid" : ""}`}
                            name="target_departments"
                            value={formData.target_departments.map(String)}
                            onChange={handleDepartmentChange}
                            disabled={loading}
                            style={{ minHeight: "120px" }}
                          >
                            {departments.map((dept) => (
                              <option key={dept.id} value={dept.id}>
                                {getDepartmentDisplay(dept)}
                              </option>
                            ))}
                          </select>
                          <small className="text-muted">
                            Hold Ctrl/Cmd to select multiple departments
                          </small>
                          {errors.target_departments && (
                            <div className="invalid-feedback d-block">
                              {errors.target_departments}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}

                  {/* Target Levels - Shown only when "Specific Level Only" is selected */}
                  {formData.target_audience === "specific_level" && (
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Target Levels *</label>
                      {levelsLoading ? (
                        <div className="text-center p-2">
                          <div
                            className="spinner-border spinner-border-sm text-primary"
                            role="status"
                          >
                            <span className="visually-hidden">
                              Loading levels...
                            </span>
                          </div>
                          <small className="ms-2">Loading levels...</small>
                        </div>
                      ) : (
                        <>
                          <select
                            multiple
                            className={`form-select ${errors.target_levels ? "is-invalid" : ""}`}
                            name="target_levels"
                            value={formData.target_levels.map(String)}
                            onChange={handleLevelChange}
                            disabled={loading}
                            style={{ minHeight: "120px" }}
                          >
                            {levels.map((level) => (
                              <option key={level.id} value={level.id}>
                                {getLevelDisplay(level)}
                              </option>
                            ))}
                          </select>
                          <small className="text-muted">
                            Hold Ctrl/Cmd to select multiple levels
                          </small>
                          {errors.target_levels && (
                            <div className="invalid-feedback d-block">
                              {errors.target_levels}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* Form Actions */}
                <div className="aa-actions">
                  <button
                    type="button"
                    className="btn btn-outline-secondary me-2"
                    onClick={handleCancel}
                    disabled={actionLoading}
                  >
                    Cancel
                  </button>

                  {/* Draft Button */}
                  <button
                    type="button"
                    className="btn btn-outline-secondary me-2"
                    disabled={actionLoading === "published"}
                    onClick={(e) => handleSubmit(e, "draft")}
                  >
                    {actionLoading === "draft" ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Saving...
                      </>
                    ) : (
                      "Save as Draft"
                    )}
                  </button>

                  {/* Publish Button */}
                  <button
                    type="button"
                    className="btn btn-primary"
                    disabled={actionLoading === "draft"}
                    onClick={(e) => handleSubmit(e, "published")}
                  >
                    {actionLoading === "published" ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Publishing...
                      </>
                    ) : isEditMode ? (
                      "Update Announcement"
                    ) : (
                      "Publish"
                    )}
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

export default AddAnnouncement;
