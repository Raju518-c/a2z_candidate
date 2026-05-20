import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "../Layout/Sidebar";
import Header from "../Layout/Header";
import "./AddMentor.css";
import Swal from "sweetalert2";
import { BASE_URL } from "../../../ApiUrl";

const AddMentor = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [error, setError] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);

  const [levels, setLevels] = useState([]);
  const [filteredLevels, setFilteredLevels] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(true);

  const [specializations, setSpecializations] = useState([]);
  const [certifications, setCertifications] = useState([]);

  const [formData, setFormData] = useState({
    full_name: "",
    phone_number: "",
    email: "",
    password: "",
    current_company: "",
    years_of_experience: "",
    max_trainees: "",
    mentorship_status: "active",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchOptions();
  }, []);

  useEffect(() => {
    if (id) {
      setIsEditMode(true);
      fetchMentorData();
    }
  }, [id]);

  const fetchOptions = async () => {
    try {
      setLoadingOptions(true);

      const levelsResponse = await fetch(`${BASE_URL}/api/admin/levels/`);
      if (!levelsResponse.ok) throw new Error(`Failed to fetch levels: ${levelsResponse.status}`);
      const levelsData = await levelsResponse.json();

      const deptsResponse = await fetch(`${BASE_URL}/api/admin/departments/`);
      if (!deptsResponse.ok) throw new Error(`Failed to fetch departments: ${deptsResponse.status}`);
      const deptsData = await deptsResponse.json();

      const activeLevels = levelsData.data?.filter((level) => level.is_active) || [];
      const activeDepartments = deptsData.data?.filter((dept) => dept.is_active) || [];

      setLevels(activeLevels);
      setFilteredLevels(activeLevels.filter((level) => level.number > 3));
      setDepartments(activeDepartments);
    } catch (err) {
      console.error("Error fetching options:", err);
      setError(err.message);
      Swal.fire({
        icon: "error",
        title: "Failed to Load Options",
        text: err.message || "Could not load levels and departments",
        timer: 3000,
        showConfirmButton: true,
      });
    } finally {
      setLoadingOptions(false);
    }
  };

  const fetchMentorData = async () => {
    try {
      setFetchLoading(true);
      const response = await fetch(`${BASE_URL}/api/mentor/mentors/${id}/`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const result = await response.json();

      if (result.status && result.data) {
        const mentorData = result.data;

        setFormData({
          full_name: mentorData.full_name || "",
          phone_number: mentorData.phone_number || "",
          email: mentorData.email || "",
          password: "",
          current_company: mentorData.current_company || "",
          years_of_experience: mentorData.years_of_experience || "",
          max_trainees: mentorData.max_trainees || "",
          mentorship_status: mentorData.mentorship_status || "active",
        });

        if (mentorData.specializations && Array.isArray(mentorData.specializations)) {
          setSpecializations(mentorData.specializations.map(spec => ({
            department_id: spec.department,
            level_id: spec.level,
            years_of_experience_in_specialization: spec.years_of_experience_in_specialization,
            is_primary_specialization: spec.is_primary_specialization,
            max_trainees_for_specialization: spec.max_trainees_for_specialization
          })));
        }

        if (mentorData.certifications && Array.isArray(mentorData.certifications)) {
          setCertifications(mentorData.certifications.map(cert => ({
            certification_type: cert.certification_type,
            certification_name: cert.certification_name,
            document: null,
            document_url: cert.document_url || "",
            issued_date: cert.issued_date || "",
            expiry_date: cert.expiry_date || "",
            issuing_organization: cert.issuing_organization || "",
            keep_existing_document: true,
            existing_document: cert.document // Store existing document path
          })));
        }
      } else {
        throw new Error(result.message || "Failed to fetch mentor data");
      }
    } catch (err) {
      setError(err.message);
      console.error("Error fetching mentor data:", err);
      Swal.fire({
        icon: "error",
        title: "Failed to Load Mentor",
        text: err.message || "An error occurred while loading mentor data",
        timer: 3000,
        showConfirmButton: true,
      });
    } finally {
      setFetchLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? (value === "" ? "" : Number(value)) : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const addSpecialization = () => {
    setSpecializations([
      ...specializations,
      {
        department_id: "",
        level_id: "",
        years_of_experience_in_specialization: "",
        is_primary_specialization: false,
        max_trainees_for_specialization: "",
      },
    ]);
  };

  const updateSpecialization = (index, field, value) => {
    const updated = [...specializations];
    updated[index][field] = value;
    setSpecializations(updated);
  };

  const removeSpecialization = (index) => {
    setSpecializations(specializations.filter((_, i) => i !== index));
  };

  const addCertification = () => {
    setCertifications([
      ...certifications,
      {
        certification_type: "",
        certification_name: "",
        document: null,
        document_url: "",
        issued_date: "",
        expiry_date: "",
        issuing_organization: "",
        keep_existing_document: false,
        existing_document: null,
      },
    ]);
  };

  const updateCertification = (index, field, value) => {
    const updated = [...certifications];
    updated[index][field] = value;
    setCertifications(updated);
  };

  const handleCertificationFile = (index, file) => {
    if (!file) return;

    if (file.type !== "application/pdf") {
      Swal.fire({ icon: "error", title: "Invalid File Type", text: "Please upload only PDF files", timer: 3000 });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      Swal.fire({ icon: "error", title: "File Too Large", text: "File size should not exceed 5MB", timer: 3000 });
      return;
    }

    const updated = [...certifications];
    updated[index].document = file;
    updated[index].document_url = ""; // Clear URL if file is uploaded
    updated[index].keep_existing_document = false;
    setCertifications(updated);
  };

  const removeCertification = (index) => {
    setCertifications(certifications.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.full_name?.trim()) newErrors.full_name = "Full name is required";

    if (!formData.phone_number?.trim()) {
      newErrors.phone_number = "Phone number is required";
    } else if (!/^\d{10}$/.test(formData.phone_number.replace(/\D/g, ""))) {
      newErrors.phone_number = "Please enter a valid 10-digit phone number";
    }

    if (!formData.email?.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!isEditMode && !formData.password?.trim()) {
      newErrors.password = "Password is required for new mentors";
    }

    if (!formData.years_of_experience && formData.years_of_experience !== 0) {
      newErrors.years_of_experience = "Years of experience is required";
    } else if (formData.years_of_experience < 0 || formData.years_of_experience > 50) {
      newErrors.years_of_experience = "Years of experience must be between 0 and 50";
    }

    if (!formData.max_trainees) {
      newErrors.max_trainees = "Max trainees is required";
    } else if (formData.max_trainees < 1) {
      newErrors.max_trainees = "Max trainees must be at least 1";
    }

    if (specializations.length === 0) {
      newErrors.specializations = "At least one specialization is required";
    } else {
      let hasPrimary = false;
      specializations.forEach((spec, index) => {
        if (!spec.department_id) newErrors[`spec_dept_${index}`] = "Department is required";
        if (!spec.level_id) newErrors[`spec_level_${index}`] = "Level is required";
        if (!spec.years_of_experience_in_specialization) newErrors[`spec_years_${index}`] = "Years of experience is required";
        if (spec.is_primary_specialization) hasPrimary = true;
      });
      if (!hasPrimary) newErrors.primary_specialization = "One specialization must be marked as primary";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      Swal.fire({
        icon: "error",
        title: "Validation Failed",
        text: "Please check all required fields and try again.",
        timer: 3000,
        showConfirmButton: true,
      });
      return false;
    }

    return true;
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  if (!validateForm()) return;

  setLoading(true);
  setError("");

  try {
    // Prepare specializations data
    const specializationsData = specializations.map((spec) => ({
      department_id: parseInt(spec.department_id),
      level_id: parseInt(spec.level_id),
      years_of_experience_in_specialization: parseFloat(spec.years_of_experience_in_specialization || 0),
      is_primary_specialization: spec.is_primary_specialization || false,
      max_trainees_for_specialization: spec.max_trainees_for_specialization ? parseInt(spec.max_trainees_for_specialization) : 5,
    }));

    // Prepare certifications data (without files - use URLs only)
    const certificationsData = certifications.map((cert) => ({
      certification_type: cert.certification_type || "",
      certification_name: cert.certification_name || "",
      issued_date: cert.issued_date || null,
      expiry_date: cert.expiry_date || null,
      issuing_organization: cert.issuing_organization || "",
      document_url: cert.document_url || null,
      // Note: Can't send file via JSON, only URL
    }));

    const url = isEditMode
      ? `${BASE_URL}/api/mentor/mentors/${id}/`
      : `${BASE_URL}/api/mentor/mentors/`;

    // Build JSON payload
    const jsonPayload = {
      full_name: formData.full_name,
      phone_number: formData.phone_number,
      email: formData.email,
      password: formData.password || undefined,
      current_company: formData.current_company || "",
      years_of_experience: parseFloat(formData.years_of_experience) || 0,
      max_trainees: parseInt(formData.max_trainees) || 5,
      mentorship_status: formData.mentorship_status || "active",
      specializations_data: specializationsData,
      certifications_data: certificationsData,
    };

    // Remove undefined password for edit mode
    if (isEditMode && !jsonPayload.password) {
      delete jsonPayload.password;
    }

    console.log("Sending payload:", JSON.stringify(jsonPayload, null, 2));

    const response = await fetch(url, {
      method: isEditMode ? "PUT" : "POST",
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(jsonPayload),
    });

    const responseData = await response.json().catch(() => ({
      status: false,
      message: "Failed to parse response"
    }));

    console.log("Response:", responseData);

    if (!response.ok) {
      if (responseData?.data) {
        const errorMessages = [];
        Object.entries(responseData.data).forEach(([field, errors]) => {
          if (typeof errors === 'object' && !Array.isArray(errors)) {
            Object.entries(errors).forEach(([subField, subErrors]) => {
              if (Array.isArray(subErrors)) {
                errorMessages.push(`${field} ${subField}: ${subErrors.join(', ')}`);
              }
            });
          } else if (Array.isArray(errors)) {
            errorMessages.push(`${field}: ${errors.join(', ')}`);
          } else if (typeof errors === 'string') {
            errorMessages.push(`${field}: ${errors}`);
          }
        });
        throw new Error(errorMessages.join('\n') || responseData?.message || `HTTP ${response.status}`);
      }
      throw new Error(responseData?.message || `Request failed with status ${response.status}`);
    }

    await Swal.fire({
      icon: "success",
      title: isEditMode ? "Updated!" : "Created!",
      text: "Mentor saved successfully",
      timer: 2000,
      showConfirmButton: false,
    });

    navigate("/mentor");
  } catch (err) {
    console.error("Error:", err);
    Swal.fire({ 
      icon: "error", 
      title: "Save Failed", 
      text: err.message || "An error occurred while saving the mentor" 
    });
    setError(err.message);
  } finally {
    setLoading(false);
  }
};

  const handleCancel = () => navigate("/mentor");

  const getLevelDisplay = (level) => `${level.name} (Level ${level.number})`;
  const getDepartmentDisplay = (dept) => `${dept.name} (${dept.code})`;

  if (fetchLoading || loadingOptions) {
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
                {fetchLoading ? "Loading mentor data..." : "Loading levels and departments..."}
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
          <div className="am-wrapper">
            <div className="am-header">
              <div>
                <h2>{isEditMode ? "Edit Mentor" : "Add New Mentor"}</h2>
                <p>{isEditMode ? "Update the mentor details below" : "Fill in the mentor details below"}</p>
              </div>
            </div>

            {error && (
              <div className="alert alert-danger alert-dismissible fade show" role="alert">
                <strong>Error:</strong> {error}
                <button type="button" className="btn-close" onClick={() => setError("")} aria-label="Close" />
              </div>
            )}

            <div className="am-form-container">
              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-md-4 mb-3">
                    <label className="form-label">Full Name *</label>
                    <input
                      type="text"
                      className={`form-control ${errors.full_name ? "is-invalid" : ""}`}
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleChange}
                      placeholder="Enter full name"
                      disabled={loading}
                    />
                    {errors.full_name && <div className="invalid-feedback">{errors.full_name}</div>}
                  </div>

                  <div className="col-md-4 mb-3">
                    <label className="form-label">Phone Number *</label>
                    <input
                      type="tel"
                      className={`form-control ${errors.phone_number ? "is-invalid" : ""}`}
                      name="phone_number"
                      value={formData.phone_number}
                      onChange={handleChange}
                      placeholder="Enter 10-digit phone number"
                      disabled={loading}
                      maxLength="10"
                    />
                    {errors.phone_number && <div className="invalid-feedback">{errors.phone_number}</div>}
                  </div>

                  <div className="col-md-4 mb-3">
                    <label className="form-label">Email *</label>
                    <input
                      type="email"
                      className={`form-control ${errors.email ? "is-invalid" : ""}`}
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter email address"
                      disabled={loading}
                    />
                    {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                  </div>

                  {!isEditMode && (
                    <div className="col-md-4 mb-3">
                      <label className="form-label">Password *</label>
                      <input
                        type="password"
                        className={`form-control ${errors.password ? "is-invalid" : ""}`}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Enter password"
                        disabled={loading}
                      />
                      {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                    </div>
                  )}

                  <div className="col-md-4 mb-3">
                    <label className="form-label">Current Company</label>
                    <input
                      type="text"
                      className="form-control"
                      name="current_company"
                      value={formData.current_company}
                      onChange={handleChange}
                      placeholder="Enter current company"
                      disabled={loading}
                    />
                  </div>

                  <div className="col-md-4 mb-3">
                    <label className="form-label">Years of Experience *</label>
                    <input
                      type="number"
                      className={`form-control ${errors.years_of_experience ? "is-invalid" : ""}`}
                      name="years_of_experience"
                      value={formData.years_of_experience}
                      onChange={handleChange}
                      placeholder="Enter years of experience"
                      min="0"
                      max="50"
                      step="0.1"
                      disabled={loading}
                    />
                    {errors.years_of_experience && <div className="invalid-feedback">{errors.years_of_experience}</div>}
                  </div>

                  <div className="col-md-4 mb-3">
                    <label className="form-label">Max Trainees *</label>
                    <input
                      type="number"
                      className={`form-control ${errors.max_trainees ? "is-invalid" : ""}`}
                      name="max_trainees"
                      value={formData.max_trainees}
                      onChange={handleChange}
                      placeholder="Maximum number of trainees"
                      min="1"
                      disabled={loading}
                    />
                    {errors.max_trainees && <div className="invalid-feedback">{errors.max_trainees}</div>}
                  </div>

                  {isEditMode && (
                    <div className="col-md-4 mb-3">
                      <label className="form-label">Mentorship Status</label>
                      <select
                        className="form-select"
                        name="mentorship_status"
                        value={formData.mentorship_status}
                        onChange={handleChange}
                        disabled={loading}
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="pending">Pending</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </div>
                  )}
                </div>

                {/* Specializations Section */}
                <div className="row mt-4">
                  <div className="col-12">
                    <h5 className="mb-3">Specializations *</h5>
                    {errors.specializations && <div className="alert alert-danger">{errors.specializations}</div>}
                    {errors.primary_specialization && <div className="alert alert-danger">{errors.primary_specialization}</div>}
                  </div>

                  {specializations.map((spec, index) => (
                    <div key={index} className="card mb-3 p-3">
                      <div className="row">
                        <div className="col-md-3 mb-2">
                          <label className="form-label">Department *</label>
                          <select
                            className={`form-select ${errors[`spec_dept_${index}`] ? "is-invalid" : ""}`}
                            value={spec.department_id}
                            onChange={(e) => updateSpecialization(index, "department_id", e.target.value)}
                            disabled={loading}
                          >
                            <option value="">Select Department</option>
                            {departments.map((dept) => (
                              <option key={dept.id} value={dept.id}>{getDepartmentDisplay(dept)}</option>
                            ))}
                          </select>
                          {errors[`spec_dept_${index}`] && <div className="invalid-feedback">{errors[`spec_dept_${index}`]}</div>}
                        </div>

                        <div className="col-md-3 mb-2">
                          <label className="form-label">Level *</label>
                          <select
                            className={`form-select ${errors[`spec_level_${index}`] ? "is-invalid" : ""}`}
                            value={spec.level_id}
                            onChange={(e) => updateSpecialization(index, "level_id", e.target.value)}
                            disabled={loading}
                          >
                            <option value="">Select Level</option>
                            {filteredLevels.map((level) => (
                              <option key={level.id} value={level.id}>{getLevelDisplay(level)}</option>
                            ))}
                          </select>
                          {errors[`spec_level_${index}`] && <div className="invalid-feedback">{errors[`spec_level_${index}`]}</div>}
                        </div>

                        <div className="col-md-2 mb-2">
                          <label className="form-label">Years Exp. *</label>
                          <input
                            type="number"
                            className={`form-control ${errors[`spec_years_${index}`] ? "is-invalid" : ""}`}
                            value={spec.years_of_experience_in_specialization}
                            onChange={(e) => updateSpecialization(index, "years_of_experience_in_specialization", e.target.value)}
                            placeholder="Years"
                            min="0"
                            step="0.5"
                            disabled={loading}
                          />
                          {errors[`spec_years_${index}`] && <div className="invalid-feedback">{errors[`spec_years_${index}`]}</div>}
                        </div>

                        <div className="col-md-2 mb-2">
                          <label className="form-label">Max Trainees</label>
                          <input
                            type="number"
                            className="form-control"
                            value={spec.max_trainees_for_specialization}
                            onChange={(e) => updateSpecialization(index, "max_trainees_for_specialization", e.target.value)}
                            placeholder="Optional"
                            min="1"
                            disabled={loading}
                          />
                        </div>

                        <div className="col-md-1 mb-2">
                          <label className="form-label">Primary</label>
                          <input
                            type="checkbox"
                            className="form-check-input d-block mt-2"
                            checked={spec.is_primary_specialization}
                            onChange={(e) => updateSpecialization(index, "is_primary_specialization", e.target.checked)}
                            disabled={loading}
                            style={{ width: "20px", height: "20px" }}
                          />
                        </div>

                        <div className="col-md-1 mb-2">
                          <label className="form-label">&nbsp;</label>
                          <button
                            type="button"
                            className="btn btn-danger btn-sm d-block"
                            onClick={() => removeSpecialization(index)}
                            disabled={loading}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  <div className="col-12 mb-3">
                    <button type="button" className="btn btn-secondary" onClick={addSpecialization} disabled={loading}>
                      + Add Specialization
                    </button>
                  </div>
                </div>

                {/* Certifications Section */}
                <div className="row mt-4">
                  <div className="col-12">
                    <h5 className="mb-3">Certifications</h5>
                  </div>

                  {certifications.map((cert, index) => (
                    <div key={index} className="card mb-3 p-3">
                      <div className="row">
                        <div className="col-md-3 mb-2">
                          <label className="form-label">Certification Type</label>
                          <select
                            className="form-select"
                            value={cert.certification_type}
                            onChange={(e) => updateCertification(index, "certification_type", e.target.value)}
                            disabled={loading}
                          >
                            <option value="">Select Type</option>
                            <option value="background_check">Background Check</option>
                            <option value="mentorship_program">Mentorship Program</option>
                            <option value="technical_certification">Technical Certification</option>
                            <option value="industry_certification">Industry Certification</option>
                            <option value="safety_training">Safety Training</option>
                            <option value="compliance_training">Compliance Training</option>
                            <option value="other">Other</option>
                          </select>
                        </div>

                        <div className="col-md-3 mb-2">
                          <label className="form-label">Certification Name</label>
                          <input
                            type="text"
                            className="form-control"
                            value={cert.certification_name}
                            onChange={(e) => updateCertification(index, "certification_name", e.target.value)}
                            placeholder="Certification name"
                            disabled={loading}
                          />
                        </div>

                        <div className="col-md-2 mb-2">
                          <label className="form-label">Issued Date</label>
                          <input
                            type="date"
                            className="form-control"
                            value={cert.issued_date}
                            onChange={(e) => updateCertification(index, "issued_date", e.target.value)}
                            disabled={loading}
                          />
                        </div>

                        <div className="col-md-2 mb-2">
                          <label className="form-label">Expiry Date</label>
                          <input
                            type="date"
                            className="form-control"
                            value={cert.expiry_date}
                            onChange={(e) => updateCertification(index, "expiry_date", e.target.value)}
                            disabled={loading}
                          />
                        </div>

                        <div className="col-md-2 mb-2">
                          <label className="form-label">Issuing Organization</label>
                          <input
                            type="text"
                            className="form-control"
                            value={cert.issuing_organization}
                            onChange={(e) => updateCertification(index, "issuing_organization", e.target.value)}
                            placeholder="Organization"
                            disabled={loading}
                          />
                        </div>

                        <div className="col-md-4 mb-2">
                          <label className="form-label">Document URL (Optional)</label>
                          <input
                            type="url"
                            className="form-control"
                            value={cert.document_url || ""}
                            onChange={(e) => updateCertification(index, "document_url", e.target.value)}
                            placeholder="https://example.com/document.pdf"
                            disabled={loading || !!cert.document}
                          />
                          {cert.document_url && !cert.document && (
                            <small className="text-info d-block mt-1">✓ Document URL provided</small>
                          )}
                        </div>

                        <div className="col-md-4 mb-2">
                          <label className="form-label">Upload PDF Document</label>
                          <input
                            type="file"
                            className="form-control"
                            accept=".pdf"
                            onChange={(e) => handleCertificationFile(index, e.target.files[0])}
                            disabled={loading}
                          />
                          {cert.document && (
                            <small className="text-success d-block mt-1">✓ File selected: {cert.document.name}</small>
                          )}
                          {!cert.document && cert.existing_document && (
                            <small className="text-info d-block mt-1">
                              📄 Existing document available
                            </small>
                          )}
                          <small className="text-muted d-block mt-1">Max 5MB, PDF only</small>
                        </div>

                        <div className="col-md-1 mb-2 d-flex align-items-end">
                          <button
                            type="button"
                            className="btn btn-danger btn-sm"
                            onClick={() => removeCertification(index)}
                            disabled={loading}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  <div className="col-12 mb-3">
                    <button type="button" className="btn btn-secondary" onClick={addCertification} disabled={loading}>
                      + Add Certification
                    </button>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="am-actions mt-4">
                  <button type="button" className="btn btn-outline-secondary me-2" onClick={handleCancel} disabled={loading}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                        {isEditMode ? "Updating..." : "Creating..."}
                      </>
                    ) : isEditMode ? "Update Mentor" : "Add Mentor"}
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

export default AddMentor;