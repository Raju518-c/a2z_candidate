import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import { BASE_URL } from "../../../ApiUrl";
import "./Register.css";
import { FaPlus, FaTrash } from 'react-icons/fa';

const RegisterMentor = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [error, setError] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);

  // State for dropdown options
  const [levels, setLevels] = useState([]);
  const [filteredLevels, setFilteredLevels] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(true);

  // New states for specializations and certifications
  const [specializations, setSpecializations] = useState([]);
  const [certifications, setCertifications] = useState([]);
  const [certificateErrors, setCertificateErrors] = useState({});

  const [formData, setFormData] = useState({
    full_name: "",
    phone_number: "",
    email: "",
    password: "",
    current_company: "",
    years_of_experience: "",
    max_trainees: "",
  });

  const [errors, setErrors] = useState({});

  // Issuer Type options (matching backend)
  const issuerTypeOptions = [
    { value: 'Educational Institution', label: 'Educational Institution' },
    { value: 'Client Company', label: 'Client Company' },
    { value: 'A2Z Organization', label: 'A2Z Organization' },
    { value: 'Training Center', label: 'Training Center' },
    { value: 'Government Body', label: 'Government Body' },
    { value: 'Professional Body', label: 'Professional Body' },
    { value: 'Other', label: 'Other' },
  ];

  // Certification Type options (matching backend)
  const certificationTypeOptions = [
    { value: 'Educational', label: 'Educational' },
    { value: 'Training', label: 'Training' },
    { value: 'Experience', label: 'Experience' },
    { value: 'Other', label: 'Other' },
  ];

  // Education level options
  const educationLevelOptions = [
    { value: 'High School', label: 'High School' },
    { value: "Bachelor's", label: "Bachelor's Degree" },
    { value: "Master's", label: "Master's Degree" },
    { value: 'Doctorate', label: 'Doctorate (PhD)' },
    { value: 'Diploma', label: 'Diploma' },
    { value: 'Certificate', label: 'Certificate' },
    { value: 'Associate', label: 'Associate Degree' },
    { value: 'Other', label: 'Other' },
  ];

  // Training mode options
  const trainingModeOptions = [
    { value: 'online', label: 'Online' },
    { value: 'offline', label: 'Offline (In-person)' },
    { value: 'hybrid', label: 'Hybrid (Mixed)' },
  ];

  // Employment type options
  const employmentTypeOptions = [
    { value: 'full_time', label: 'Full Time' },
    { value: 'part_time', label: 'Part Time' },
    { value: 'contract', label: 'Contract' },
    { value: 'freelance', label: 'Freelance' },
    { value: 'internship', label: 'Internship' },
  ];

  // Helper function to create empty certification object
  const makeEmptyCert = () => ({
    id: Date.now() + Math.random(),
    selectedFile: null,
    existing_document: null,
    document_name: '',
    certification_type: '',
    certification_type_other: '',
    certification_name: '',
    issued_date: '',
    expiry_date: '',
    issuing_organization: '',
    issuer_type: '',
    issuer_type_other: '',
    education_level: '',
    field_of_study: '',
    grade_or_percentage: '',
    training_program_name: '',
    training_duration: '',
    training_mode: '',
    job_role: '',
    employment_type: '',
    work_responsibilities: '',
    errors: {},
  });

  useEffect(() => {
    fetchOptions();
  }, []);

  useEffect(() => {
    if (id) {
      setIsEditMode(true);
      fetchMentorData();
    } else {
      initializeCertifications();
    }
  }, [id]);

  const initializeCertifications = () => {
    setCertifications([makeEmptyCert()]);
  };

  const fetchOptions = async () => {
    try {
      setLoadingOptions(true);

      const levelsResponse = await fetch(`${BASE_URL}/api/admin/levels/`);
      if (!levelsResponse.ok) {
        throw new Error(`Failed to fetch levels: ${levelsResponse.status}`);
      }
      const levelsData = await levelsResponse.json();

      const deptsResponse = await fetch(`${BASE_URL}/api/admin/departments/`);
      if (!deptsResponse.ok) {
        throw new Error(`Failed to fetch departments: ${deptsResponse.status}`);
      }
      const deptsData = await deptsResponse.json();

      const activeLevels = levelsData.data?.filter((level) => level.is_active) || [];
      const activeDepartments = deptsData.data?.filter((dept) => dept.is_active) || [];

      setLevels(activeLevels);
      
      const filtered = activeLevels.filter(level => level.number > 3);
      setFilteredLevels(filtered);
      
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
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

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
        });

        if (mentorData.specializations && Array.isArray(mentorData.specializations)) {
          setSpecializations(mentorData.specializations.map(spec => ({
            department_id: spec.department,
            level_id: spec.level,
            years_of_experience_in_specialization: spec.years_of_experience_in_specialization,
            is_primary_specialization: spec.is_primary_specialization,
            max_trainees_for_specialization: spec.max_trainees_for_specialization
          })));
        } else if (mentorData.specializations && typeof mentorData.specializations[0] === 'number') {
          const oldSpecs = mentorData.specializations.map(deptId => ({
            department_id: deptId,
            level_id: "",
            years_of_experience_in_specialization: "",
            is_primary_specialization: false,
            max_trainees_for_specialization: ""
          }));
          setSpecializations(oldSpecs);
        }

        // Handle certifications with proper file handling
        if (mentorData.certifications && Array.isArray(mentorData.certifications)) {
          const existingCerts = mentorData.certifications.map(cert => ({
            id: cert.id,
            selectedFile: null,
            existing_document: cert.document || null,
            document_name: cert.document ? cert.document.split('/').pop() : '',
            certification_type: cert.certification_type || "",
            certification_type_other: cert.certification_type_other || "",
            certification_name: cert.certification_name || "",
            issued_date: cert.issued_date || "",
            expiry_date: cert.expiry_date || "",
            issuing_organization: cert.issuing_organization || "",
            issuer_type: cert.issuer_type || "",
            issuer_type_other: cert.issuer_type_other || "",
            education_level: cert.education_level || "",
            field_of_study: cert.field_of_study || "",
            grade_or_percentage: cert.grade_or_percentage || "",
            training_program_name: cert.training_program_name || "",
            training_duration: cert.training_duration || "",
            training_mode: cert.training_mode || "",
            job_role: cert.job_role || "",
            employment_type: cert.employment_type || "",
            work_responsibilities: cert.work_responsibilities || "",
            errors: {},
          }));
          setCertifications(existingCerts);
        } else {
          initializeCertifications();
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

  // Specialization functions
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

  // Certification functions - similar to Candidate code
  const addCertificate = () => {
    setCertifications((prev) => [...prev, makeEmptyCert()]);
  };

  const removeCertificate = (index) => {
    if (certifications.length === 1) {
      Swal.fire({
        icon: 'warning',
        title: 'Cannot Remove',
        text: 'You must have at least one certificate entry',
        confirmButtonText: 'OK',
      });
      return;
    }

    Swal.fire({
      title: 'Remove Certificate?',
      text: 'Are you sure you want to remove this certificate?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, remove it!',
    }).then((result) => {
      if (result.isConfirmed) {
        setCertifications((prev) => prev.filter((_, i) => i !== index));
        const newCertErrors = { ...certificateErrors };
        delete newCertErrors[index];
        setCertificateErrors(newCertErrors);
      }
    });
  };

  const handleCertificateChange = (index, field, value) => {
    setCertifications((prev) =>
      prev.map((cert, i) => {
        if (i !== index) return cert;
        return {
          ...cert,
          [field]: value,
          errors: { ...cert.errors, [field]: '' },
        };
      })
    );
  };

  const handleCertificateFileChange = (index, file) => {
    if (!file) return;
    
    if (file.type !== "application/pdf") {
      Swal.fire({ 
        icon: "error", 
        title: "Invalid File Type", 
        text: "Please upload only PDF files", 
        timer: 3000 
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      Swal.fire({ 
        icon: "error", 
        title: "File Too Large", 
        text: "File size should not exceed 5MB", 
        timer: 3000 
      });
      return;
    }

    setCertifications((prev) =>
      prev.map((cert, i) => {
        if (i !== index) return cert;
        return {
          ...cert,
          selectedFile: file,
          document_name: file.name,
          errors: { ...cert.errors, document: '' },
        };
      })
    );
  };

  // Validation functions
  const validateCertificates = () => {
    let isValid = true;
    const newCertErrors = {};

    certifications.forEach((cert, index) => {
      const errs = {};
      
      if (!cert.certification_type) {
        errs.certification_type = 'Certification type is required';
        isValid = false;
      } else if (cert.certification_type === 'Other' && !cert.certification_type_other?.trim()) {
        errs.certification_type_other = 'Please specify the certification type';
        isValid = false;
      }
      
      if (!cert.certification_name?.trim()) {
        errs.certification_name = 'Certification name is required';
        isValid = false;
      }
      
      if (!cert.issuer_type) {
        errs.issuer_type = 'Issuer type is required';
        isValid = false;
      }
      
      if (cert.issuer_type === 'Other' && !cert.issuer_type_other?.trim()) {
        errs.issuer_type_other = 'Please specify the issuer type';
        isValid = false;
      }
      
      if (!cert.issuing_organization?.trim()) {
        errs.issuing_organization = 'Issuing organization is required';
        isValid = false;
      }
      
      if (!cert.issued_date) {
        errs.issued_date = 'Issue date is required';
        isValid = false;
      }
      
      if (!cert.expiry_date) {
        errs.expiry_date = 'Expiry date is required';
        isValid = false;
      }
      
      if (cert.issued_date && cert.expiry_date) {
        if (new Date(cert.expiry_date) <= new Date(cert.issued_date)) {
          errs.expiry_date = 'Expiry date must be after issue date';
          isValid = false;
        }
      }

      // Require a document only when creating a brand-new cert (no existing doc, no new file)
      if (!isEditMode && !cert.selectedFile && !cert.existing_document) {
        errs.document = 'Certificate document is required';
        isValid = false;
      }

      if (Object.keys(errs).length > 0) {
        newCertErrors[index] = errs;
      }
    });

    setCertificateErrors(newCertErrors);

    setCertifications((prev) =>
      prev.map((cert, i) => ({
        ...cert,
        errors: newCertErrors[i] || {},
      }))
    );

    return isValid;
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.full_name?.trim()) {
      newErrors.full_name = "Full name is required";
    }

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
    return Object.keys(newErrors).length === 0;
  };

  // Function to log the payload in JSON format before submission
  const logPayload = () => {
    console.log('='.repeat(60));
    console.log(isEditMode ? 'EDIT FORM SUBMISSION STARTED' : 'CREATE FORM SUBMISSION STARTED');
    console.log('='.repeat(60));
    
    const candidatePayload = {
      full_name: formData.full_name,
      phone_number: formData.phone_number,
      email: formData.email,
      password: formData.password || undefined,
      current_company: formData.current_company || "",
      years_of_experience: parseFloat(formData.years_of_experience) || 0,
      max_trainees: parseInt(formData.max_trainees) || 5,
      mentorship_status: "pending",
    };
    
    console.log('📦 Mentor Payload (JSON):', JSON.stringify(candidatePayload, null, 2));
    
    const certPayloadPreview = certifications.map((cert, index) => ({
      [`certificate_${index + 1}`]: {
        candidate: '<<will be filled after candidate creation>>',
        certification_type: cert.certification_type,
        certification_type_other: cert.certification_type === 'Other' ? cert.certification_type_other : '',
        certification_name: cert.certification_name,
        issuer_type: cert.issuer_type,
        issuer_type_other: cert.issuer_type === 'Other' ? cert.issuer_type_other : '',
        issuing_organization: cert.issuing_organization,
        issued_date: cert.issued_date,
        expiry_date: cert.expiry_date,
        document: cert.selectedFile
          ? { name: cert.selectedFile.name, size: cert.selectedFile.size, type: cert.selectedFile.type }
          : cert.existing_document || null,
        ...(cert.certification_type === 'Educational' && {
          education_level: cert.education_level,
          field_of_study: cert.field_of_study,
          grade_or_percentage: cert.grade_or_percentage,
        }),
        ...(cert.certification_type === 'Experience' && {
          job_role: cert.job_role,
          employment_type: cert.employment_type,
          work_responsibilities: cert.work_responsibilities,
        }),
        ...(['Training', 'safety_training', 'compliance_training', 'mentorship_program', 'background_check'].includes(cert.certification_type) && {
          training_program_name: cert.training_program_name,
          training_duration: cert.training_duration,
          training_mode: cert.training_mode,
        }),
      },
    }));
    
    console.log('📜 Certificates Payload (multipart — file info shown as object):',
      JSON.stringify(certPayloadPreview, null, 2)
    );
    
    console.log('📎 Files being uploaded:');
    let hasFiles = false;
    certifications.forEach((cert, index) => {
      if (cert.selectedFile && cert.selectedFile instanceof File) {
        console.log(`  - Certificate ${index + 1} Document: ${cert.selectedFile.name} (${(cert.selectedFile.size / 1024 / 1024).toFixed(2)} MB)`);
        hasFiles = true;
      }
    });
    
    if (!hasFiles) {
      console.log('  No files to upload (using JSON only)');
    }
    console.log('='.repeat(60));
  };

const handleSubmit = async (e) => {
    e.preventDefault();

    logPayload();

    if (!validateForm() || !validateCertificates()) {
      Swal.fire({
        icon: "error",
        title: "Validation Failed",
        text: "Please check all required fields and try again.",
        showConfirmButton: true,
      });
      return;
    }

    setLoading(true);
    setError("");

    try {
      // STEP 1: Prepare mentor payload (JSON) - ONLY mentor fields
      const mentorPayload = {
        full_name: formData.full_name,
        phone_number: formData.phone_number,
        email: formData.email,
        password: formData.password || undefined,
        current_company: formData.current_company || "",
        years_of_experience: parseFloat(formData.years_of_experience) || 0,
        max_trainees: parseInt(formData.max_trainees) || 5,
        mentorship_status: "pending",
      };

      console.log('📦 Mentor Payload (JSON):', JSON.stringify(mentorPayload, null, 2));

      // STEP 2: Create/Update mentor FIRST
      const method = isEditMode ? 'PUT' : 'POST';
      const mentorUrl = isEditMode
        ? `${BASE_URL}/api/mentor/mentors/${id}/`
        : `${BASE_URL}/api/mentor/mentors/`;

      const mentorRes = await fetch(mentorUrl, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mentorPayload),
      });

      const mentorData = await mentorRes.json().catch(() => null);

      if (!mentorRes.ok) {
        if (mentorData?.errors) {
          const serverErrors = {};
          Object.keys(mentorData.errors).forEach((key) => {
            serverErrors[key] = Array.isArray(mentorData.errors[key])
              ? mentorData.errors[key][0]
              : mentorData.errors[key];
          });
          setErrors(serverErrors);
          throw new Error('Please check the form for errors');
        }
        throw new Error(
          mentorData?.message ||
            `Failed to ${isEditMode ? 'update' : 'create'} mentor`
        );
      }

      const mentorId = mentorData?.data?.id || id;
      console.log('✅ Mentor saved. ID:', mentorId);

      // STEP 3: Prepare specializations data
      const specializationsData = specializations.map((spec) => ({
        department_id: parseInt(spec.department_id),
        level_id: parseInt(spec.level_id),
        years_of_experience_in_specialization: parseFloat(spec.years_of_experience_in_specialization || 0),
        is_primary_specialization: spec.is_primary_specialization || false,
        max_trainees_for_specialization: spec.max_trainees_for_specialization
          ? parseInt(spec.max_trainees_for_specialization)
          : 5,
      }));

      // STEP 4: Prepare certifications data (JSON array, no files)
      const certificationsData = certifications.map((cert) => ({
        certification_type: cert.certification_type,
        certification_type_other: cert.certification_type === 'Other' ? cert.certification_type_other : '',
        certification_name: cert.certification_name,
        issuer_type: cert.issuer_type,
        issuer_type_other: cert.issuer_type === 'Other' ? cert.issuer_type_other : '',
        issuing_organization: cert.issuing_organization,
        issued_date: cert.issued_date,
        expiry_date: cert.expiry_date,
        ...(cert.certification_type === 'Educational' && {
          education_level: cert.education_level,
          field_of_study: cert.field_of_study,
          grade_or_percentage: cert.grade_or_percentage,
        }),
        ...(cert.certification_type === 'Experience' && {
          job_role: cert.job_role,
          employment_type: cert.employment_type,
          work_responsibilities: cert.work_responsibilities,
        }),
        ...(cert.certification_type === 'Training' && {
          training_program_name: cert.training_program_name,
          training_duration: cert.training_duration,
          training_mode: cert.training_mode,
        }),
      }));

      // STEP 5: Create FormData with specializations_data, certifications_data, and files
      const formDataToSend = new FormData();
      
      // Add mentor ID
      formDataToSend.append('mentor', mentorId);
      
      // Add specializations_data as JSON string
      formDataToSend.append('specializations_data', JSON.stringify(specializationsData));
      
      // Add certifications_data as JSON string
      formDataToSend.append('certifications_data', JSON.stringify(certificationsData));
      
      // Add certification files
      certifications.forEach((cert, index) => {
        if (cert.selectedFile && cert.selectedFile instanceof File) {
          formDataToSend.append(`certification_document_${index}`, cert.selectedFile);
        }
      });

      // Console log the complete FormData
      console.log('📤 Complete FormData payload:');
      const formDataLog = {};
      formDataToSend.forEach((value, key) => {
        if (value instanceof File) {
          formDataLog[key] = {
            type: 'File',
            name: value.name,
            size: value.size,
            mimeType: value.type
          };
        } else {
          formDataLog[key] = value;
        }
      });
      console.log(JSON.stringify(formDataLog, null, 2));

      // STEP 6: Send the combined request to certifications endpoint
      const certUrl = `${BASE_URL}/api/mentor/mentor-certifications/`;
      
      // Only send certifications request if there are certifications or specializations
      if (certificationsData.length > 0 || specializationsData.length > 0) {
        const certRes = await fetch(certUrl, {
          method: 'POST',
          body: formDataToSend,
        });

        const certData = await certRes.json().catch(() => null);
        console.log('✅ Certification submission response:', certData);

        if (!certRes.ok) {
          throw new Error(
            certData?.message || 
            certData?.detail || 
            'Failed to save certifications and specializations'
          );
        }
      }

      await Swal.fire({
        icon: "success",
        title: isEditMode ? "Updated!" : "Created!",
        html: `Mentor ${isEditMode ? 'updated' : 'created'} successfully.<br/>
               ${specializations.length} specialization(s) and ${certifications.length} certificate(s) saved.`,
        timer: 2000,
        showConfirmButton: false,
      });

      navigate("/");
    } catch (err) {
      console.error("❌ ERROR:", err);
      setError(err.message);
      Swal.fire({
        icon: "error",
        title: isEditMode ? "Update Failed" : "Creation Failed",
        text: err.message,
        showConfirmButton: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate("/");
  };

  const handleCancel = () => {
    navigate("/");
  };

  const getLevelDisplay = (level) => `${level.name} (Level ${level.number})`;
  const getDepartmentDisplay = (dept) => `${dept.name} (${dept.code})`;

  if (fetchLoading || loadingOptions) {
    return (
      <div className="register-mentor-page">
        <div className="register-mentor-loading">
          <div className="register-mentor-loading__spinner"></div>
          <p className="register-mentor-loading__text">
            {fetchLoading
              ? "Loading mentor data..."
              : "Loading levels and departments..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="register-mentor-page">
      <div className="register-mentor-wrapper">
        {/* Header with Back Button */}
        <div className="register-mentor-header">
          <button 
            type="button" 
            className="register-mentor-header__back-btn" 
            onClick={handleBack}
            title="Go back to home"
          >
            ←
          </button>
          <div className="register-mentor-header__title-wrapper">
            <h2 className="register-mentor-header__title">
              {isEditMode ? "Edit Mentor" : "Add New Mentor"}
            </h2>
            <p className="register-mentor-header__subtitle">
              {isEditMode
                ? "Update the mentor details below"
                : "Fill in the mentor details and add certifications below"}
            </p>
          </div>
        </div>

        {/* Info Alert for Level Restriction */}
        {!isEditMode && (
          <div className="register-mentor-alert register-mentor-alert--info" role="alert">
            <span className="register-mentor-alert__message">
              <strong>Note:</strong> Only Level 4 and above (Mentor levels) are available for selection.
            </span>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="register-mentor-alert register-mentor-alert--error" role="alert">
            <span className="register-mentor-alert__message">
              <strong>Error:</strong> {error}
            </span>
            <button
              type="button"
              className="register-mentor-alert__close-btn"
              onClick={() => setError("")}
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        )}

        {/* Form */}
        <form className="register-mentor-form" onSubmit={handleSubmit}>
          {/* Personal Information Section */}
          <div className="register-mentor-section">
            <h3 className="register-mentor-section__title">
              <span className="register-mentor-section__title-icon">👤</span>
              Personal Information
            </h3>
            <div className="register-mentor-form__row">
              <div className="register-mentor-form__col-full">
                <div className="register-mentor-form__field-group">
                  <label className="register-mentor-form__label">
                    Full Name <span className="register-mentor-form__required">*</span>
                  </label>
                  <input
                    type="text"
                    className={`register-mentor-form__input ${errors.full_name ? "register-mentor-form__input--error" : ""}`}
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    placeholder="Enter full name"
                    disabled={loading}
                  />
                  {errors.full_name && (
                    <span className="register-mentor-form__error-text">{errors.full_name}</span>
                  )}
                </div>
              </div>

              <div className="register-mentor-form__col-half">
                <div className="register-mentor-form__field-group">
                  <label className="register-mentor-form__label">
                    Phone Number <span className="register-mentor-form__required">*</span>
                  </label>
                  <input
                    type="tel"
                    className={`register-mentor-form__input ${errors.phone_number ? "register-mentor-form__input--error" : ""}`}
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleChange}
                    placeholder="Enter 10-digit phone number"
                    disabled={loading}
                    maxLength="10"
                  />
                  {errors.phone_number && (
                    <span className="register-mentor-form__error-text">{errors.phone_number}</span>
                  )}
                </div>
              </div>

              <div className="register-mentor-form__col-half">
                <div className="register-mentor-form__field-group">
                  <label className="register-mentor-form__label">
                    Email <span className="register-mentor-form__required">*</span>
                  </label>
                  <input
                    type="email"
                    className={`register-mentor-form__input ${errors.email ? "register-mentor-form__input--error" : ""}`}
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter email address"
                    disabled={loading}
                  />
                  {errors.email && (
                    <span className="register-mentor-form__error-text">{errors.email}</span>
                  )}
                </div>
              </div>

              {!isEditMode && (
                <div className="register-mentor-form__col-half">
                  <div className="register-mentor-form__field-group">
                    <label className="register-mentor-form__label">
                      Password <span className="register-mentor-form__required">*</span>
                    </label>
                    <input
                      type="password"
                      className={`register-mentor-form__input ${errors.password ? "register-mentor-form__input--error" : ""}`}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter password"
                      disabled={loading}
                    />
                    {errors.password && (
                      <span className="register-mentor-form__error-text">{errors.password}</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Professional Information Section */}
          <div className="register-mentor-section">
            <h3 className="register-mentor-section__title">
              <span className="register-mentor-section__title-icon">💼</span>
              Professional Information
            </h3>
            <div className="register-mentor-form__row">
              <div className="register-mentor-form__col-half">
                <div className="register-mentor-form__field-group">
                  <label className="register-mentor-form__label">
                    Current Company
                  </label>
                  <input
                    type="text"
                    className="register-mentor-form__input"
                    name="current_company"
                    value={formData.current_company}
                    onChange={handleChange}
                    placeholder="Enter current company"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="register-mentor-form__col-half">
                <div className="register-mentor-form__field-group">
                  <label className="register-mentor-form__label">
                    Years of Experience <span className="register-mentor-form__required">*</span>
                  </label>
                  <input
                    type="number"
                    className={`register-mentor-form__input ${errors.years_of_experience ? "register-mentor-form__input--error" : ""}`}
                    name="years_of_experience"
                    value={formData.years_of_experience}
                    onChange={handleChange}
                    placeholder="Enter years of experience"
                    min="0"
                    max="50"
                    step="0.1"
                    disabled={loading}
                  />
                  {errors.years_of_experience && (
                    <span className="register-mentor-form__error-text">{errors.years_of_experience}</span>
                  )}
                </div>
              </div>

              <div className="register-mentor-form__col-half">
                <div className="register-mentor-form__field-group">
                  <label className="register-mentor-form__label">
                    Max Trainees <span className="register-mentor-form__required">*</span>
                  </label>
                  <input
                    type="number"
                    className={`register-mentor-form__input ${errors.max_trainees ? "register-mentor-form__input--error" : ""}`}
                    name="max_trainees"
                    value={formData.max_trainees}
                    onChange={handleChange}
                    placeholder="Maximum number of trainees"
                    min="1"
                    disabled={loading}
                  />
                  {errors.max_trainees && (
                    <span className="register-mentor-form__error-text">{errors.max_trainees}</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Specializations Section */}
          <div className="register-mentor-section">
            <h3 className="register-mentor-section__title">
              <span className="register-mentor-section__title-icon">🔧</span>
              Specializations
            </h3>
            {errors.specializations && (
              <div className="register-mentor-alert register-mentor-alert--error" role="alert">
                <span className="register-mentor-alert__message">{errors.specializations}</span>
              </div>
            )}
            {errors.primary_specialization && (
              <div className="register-mentor-alert register-mentor-alert--error" role="alert">
                <span className="register-mentor-alert__message">{errors.primary_specialization}</span>
              </div>
            )}

            {specializations.map((spec, index) => (
              <div key={index} className="register-mentor-specialization-card">
                <div className="register-mentor-form__row">
                  <div className="register-mentor-form__col-third">
                    <div className="register-mentor-form__field-group">
                      <label className="register-mentor-form__label">
                        Department <span className="register-mentor-form__required">*</span>
                      </label>
                      <select
                        className={`register-mentor-form__select ${errors[`spec_dept_${index}`] ? "register-mentor-form__select--error" : ""}`}
                        value={spec.department_id}
                        onChange={(e) => updateSpecialization(index, "department_id", e.target.value)}
                        disabled={loading}
                      >
                        <option value="">Select Department</option>
                        {departments.map((dept) => (
                          <option key={dept.id} value={dept.id}>{getDepartmentDisplay(dept)}</option>
                        ))}
                      </select>
                      {errors[`spec_dept_${index}`] && (
                        <span className="register-mentor-form__error-text">{errors[`spec_dept_${index}`]}</span>
                      )}
                    </div>
                  </div>

                  <div className="register-mentor-form__col-third">
                    <div className="register-mentor-form__field-group">
                      <label className="register-mentor-form__label">
                        Mentor Level <span className="register-mentor-form__required">*</span>
                      </label>
                      <select
                        className={`register-mentor-form__select ${errors[`spec_level_${index}`] ? "register-mentor-form__select--error" : ""}`}
                        value={spec.level_id}
                        onChange={(e) => updateSpecialization(index, "level_id", e.target.value)}
                        disabled={loading}
                      >
                        <option value="">Select Level</option>
                        {filteredLevels.map((level) => (
                          <option key={level.id} value={level.id}>{getLevelDisplay(level)}</option>
                        ))}
                      </select>
                      {errors[`spec_level_${index}`] && (
                        <span className="register-mentor-form__error-text">{errors[`spec_level_${index}`]}</span>
                      )}
                    </div>
                  </div>

                  <div className="register-mentor-form__col-third">
                    <div className="register-mentor-form__field-group">
                      <label className="register-mentor-form__label">
                        Years Exp. in Specialization <span className="register-mentor-form__required">*</span>
                      </label>
                      <input
                        type="number"
                        className={`register-mentor-form__input ${errors[`spec_years_${index}`] ? "register-mentor-form__input--error" : ""}`}
                        value={spec.years_of_experience_in_specialization}
                        onChange={(e) => updateSpecialization(index, "years_of_experience_in_specialization", e.target.value)}
                        placeholder="Years of experience"
                        min="0"
                        step="0.5"
                        disabled={loading}
                      />
                      {errors[`spec_years_${index}`] && (
                        <span className="register-mentor-form__error-text">{errors[`spec_years_${index}`]}</span>
                      )}
                    </div>
                  </div>

                  <div className="register-mentor-form__col-fourth">
                    <div className="register-mentor-form__field-group">
                      <label className="register-mentor-form__label">
                        Max Trainees
                      </label>
                      <input
                        type="number"
                        className="register-mentor-form__input"
                        value={spec.max_trainees_for_specialization}
                        onChange={(e) => updateSpecialization(index, "max_trainees_for_specialization", e.target.value)}
                        placeholder="Optional"
                        min="1"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="register-mentor-form__col-fourth">
                    <div className="register-mentor-form__field-group">
                      <label className="register-mentor-form__label">Primary</label>
                      <input
                        type="checkbox"
                        className="register-mentor-form__checkbox"
                        checked={spec.is_primary_specialization}
                        onChange={(e) => updateSpecialization(index, "is_primary_specialization", e.target.checked)}
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="register-mentor-form__col-fourth">
                    <div className="register-mentor-form__field-group">
                      <label className="register-mentor-form__label">&nbsp;</label>
                      <button
                        type="button"
                        className="register-mentor-form__btn register-mentor-form__btn--danger register-mentor-form__btn--small"
                        onClick={() => removeSpecialization(index)}
                        disabled={loading}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <div className="register-mentor-form__row">
              <div className="register-mentor-form__col-full">
                <button
                  type="button"
                  className="register-mentor-form__btn register-mentor-form__btn--secondary"
                  onClick={addSpecialization}
                  disabled={loading}
                >
                  + Add Specialization
                </button>
              </div>
            </div>
          </div>

          {/* Certifications Section */}
          <div className="register-mentor-section">
            <h3 className="register-mentor-section__title">
              <span className="register-mentor-section__title-icon">📜</span>
              Certifications
            </h3>
            <p className="register-mentor-section__subtitle">
              Add professional certifications for this mentor
            </p>

            {certifications.map((cert, index) => (
              <div
                key={cert.id}
                className="certificate-entry"
                style={{
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  padding: '20px',
                  marginBottom: '20px',
                  position: 'relative',
                  backgroundColor: '#f9f9f9',
                }}
              >
                {/* Remove button */}
                {certifications.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeCertificate(index)}
                    style={{
                      position: 'absolute',
                      top: '10px',
                      right: '10px',
                      background: '#dc3545',
                      color: 'white',
                      border: 'none',
                      borderRadius: '5px',
                      padding: '5px 10px',
                      cursor: 'pointer',
                      fontSize: '12px',
                    }}
                  >
                    <FaTrash /> Remove
                  </button>
                )}

                <h4 style={{ marginBottom: '15px', color: '#333' }}>
                  Certificate #{index + 1}
                </h4>

                <div className="register-mentor-form__row">
                  {/* Certification Type */}
                  <div className="register-mentor-form__col-half">
                    <div className="register-mentor-form__field-group">
                      <label className="register-mentor-form__label">
                        Certification Type{' '}
                        <span className="register-mentor-form__required">*</span>
                      </label>
                      <select
                        className={`register-mentor-form__select ${cert.errors.certification_type ? "register-mentor-form__select--error" : ""}`}
                        value={cert.certification_type}
                        onChange={(e) => handleCertificateChange(index, "certification_type", e.target.value)}
                        disabled={loading}
                      >
                        <option value="">Select Certification Type</option>
                        {certificationTypeOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                      {cert.errors.certification_type && (
                        <span className="register-mentor-form__error-text">
                          {cert.errors.certification_type}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Other Certification Type Input */}
                  {cert.certification_type === 'Other' && (
                    <div className="register-mentor-form__col-half">
                      <div className="register-mentor-form__field-group">
                        <label className="register-mentor-form__label">
                          Please Specify Certification Type{' '}
                          <span className="register-mentor-form__required">*</span>
                        </label>
                        <input
                          type="text"
                          className={`register-mentor-form__input ${cert.errors.certification_type_other ? "register-mentor-form__input--error" : ""}`}
                          value={cert.certification_type_other || ""}
                          onChange={(e) => handleCertificateChange(index, "certification_type_other", e.target.value)}
                          placeholder="Enter custom certification type"
                          disabled={loading}
                        />
                        {cert.errors.certification_type_other && (
                          <span className="register-mentor-form__error-text">
                            {cert.errors.certification_type_other}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Certification Name */}
                  <div className="register-mentor-form__col-half">
                    <div className="register-mentor-form__field-group">
                      <label className="register-mentor-form__label">
                        Certification Name{' '}
                        <span className="register-mentor-form__required">*</span>
                      </label>
                      <input
                        type="text"
                        className={`register-mentor-form__input ${cert.errors.certification_name ? "register-mentor-form__input--error" : ""}`}
                        value={cert.certification_name}
                        onChange={(e) => handleCertificateChange(index, "certification_name", e.target.value)}
                        placeholder="Enter certification name"
                        disabled={loading}
                      />
                      {cert.errors.certification_name && (
                        <span className="register-mentor-form__error-text">
                          {cert.errors.certification_name}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Issuer Type */}
                  <div className="register-mentor-form__col-half">
                    <div className="register-mentor-form__field-group">
                      <label className="register-mentor-form__label">
                        Issuer Type{' '}
                        <span className="register-mentor-form__required">*</span>
                      </label>
                      <select
                        className={`register-mentor-form__select ${cert.errors.issuer_type ? "register-mentor-form__select--error" : ""}`}
                        value={cert.issuer_type}
                        onChange={(e) => handleCertificateChange(index, "issuer_type", e.target.value)}
                        disabled={loading}
                      >
                        <option value="">Select Issuer Type</option>
                        {issuerTypeOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                      {cert.errors.issuer_type && (
                        <span className="register-mentor-form__error-text">
                          {cert.errors.issuer_type}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Other Issuer Type Input */}
                  {cert.issuer_type === 'Other' && (
                    <div className="register-mentor-form__col-half">
                      <div className="register-mentor-form__field-group">
                        <label className="register-mentor-form__label">
                          Please Specify Issuer Type{' '}
                          <span className="register-mentor-form__required">*</span>
                        </label>
                        <input
                          type="text"
                          className={`register-mentor-form__input ${cert.errors.issuer_type_other ? "register-mentor-form__input--error" : ""}`}
                          value={cert.issuer_type_other || ""}
                          onChange={(e) => handleCertificateChange(index, "issuer_type_other", e.target.value)}
                          placeholder="Enter custom issuer type"
                          disabled={loading}
                        />
                        {cert.errors.issuer_type_other && (
                          <span className="register-mentor-form__error-text">
                            {cert.errors.issuer_type_other}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Issuing Organization */}
                  <div className="register-mentor-form__col-half">
                    <div className="register-mentor-form__field-group">
                      <label className="register-mentor-form__label">
                        Issuing Organization{' '}
                        <span className="register-mentor-form__required">*</span>
                      </label>
                      <input
                        type="text"
                        className={`register-mentor-form__input ${cert.errors.issuing_organization ? "register-mentor-form__input--error" : ""}`}
                        value={cert.issuing_organization}
                        onChange={(e) => handleCertificateChange(index, "issuing_organization", e.target.value)}
                        placeholder="Enter issuing organization name"
                        disabled={loading}
                      />
                      {cert.errors.issuing_organization && (
                        <span className="register-mentor-form__error-text">
                          {cert.errors.issuing_organization}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Type-specific fields */}
                  {cert.certification_type === 'Educational' && (
                    <>
                      <div className="register-mentor-form__col-third">
                        <div className="register-mentor-form__field-group">
                          <label className="register-mentor-form__label">Education Level</label>
                          <select
                            className="register-mentor-form__select"
                            value={cert.education_level}
                            onChange={(e) => handleCertificateChange(index, "education_level", e.target.value)}
                            disabled={loading}
                          >
                            <option value="">Select Education Level</option>
                            {educationLevelOptions.map((opt) => (
                              <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      
                      <div className="register-mentor-form__col-third">
                        <div className="register-mentor-form__field-group">
                          <label className="register-mentor-form__label">Field of Study</label>
                          <input
                            type="text"
                            className="register-mentor-form__input"
                            value={cert.field_of_study}
                            onChange={(e) => handleCertificateChange(index, "field_of_study", e.target.value)}
                            placeholder="e.g., Computer Science, Business"
                            disabled={loading}
                          />
                        </div>
                      </div>
                      
                      <div className="register-mentor-form__col-third">
                        <div className="register-mentor-form__field-group">
                          <label className="register-mentor-form__label">Grade/Percentage</label>
                          <input
                            type="text"
                            className="register-mentor-form__input"
                            value={cert.grade_or_percentage}
                            onChange={(e) => handleCertificateChange(index, "grade_or_percentage", e.target.value)}
                            placeholder="e.g., A+, 85%, 3.5 GPA"
                            disabled={loading}
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {cert.certification_type === 'Experience' && (
                    <>
                      <div className="register-mentor-form__col-half">
                        <div className="register-mentor-form__field-group">
                          <label className="register-mentor-form__label">Job Role</label>
                          <input
                            type="text"
                            className="register-mentor-form__input"
                            value={cert.job_role}
                            onChange={(e) => handleCertificateChange(index, "job_role", e.target.value)}
                            placeholder="e.g., Senior Software Engineer"
                            disabled={loading}
                          />
                        </div>
                      </div>
                      
                      <div className="register-mentor-form__col-half">
                        <div className="register-mentor-form__field-group">
                          <label className="register-mentor-form__label">Employment Type</label>
                          <select
                            className="register-mentor-form__select"
                            value={cert.employment_type}
                            onChange={(e) => handleCertificateChange(index, "employment_type", e.target.value)}
                            disabled={loading}
                          >
                            <option value="">Select Employment Type</option>
                            {employmentTypeOptions.map((opt) => (
                              <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      
                      <div className="register-mentor-form__col-full">
                        <div className="register-mentor-form__field-group">
                          <label className="register-mentor-form__label">Work Responsibilities</label>
                          <textarea
                            className="register-mentor-form__textarea"
                            value={cert.work_responsibilities}
                            onChange={(e) => handleCertificateChange(index, "work_responsibilities", e.target.value)}
                            placeholder="Describe key responsibilities and achievements"
                            rows="3"
                            disabled={loading}
                            style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ddd' }}
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {cert.certification_type === 'Training' && (
                    <>
                      <div className="register-mentor-form__col-half">
                        <div className="register-mentor-form__field-group">
                          <label className="register-mentor-form__label">Training Program Name</label>
                          <input
                            type="text"
                            className="register-mentor-form__input"
                            value={cert.training_program_name}
                            onChange={(e) => handleCertificateChange(index, "training_program_name", e.target.value)}
                            placeholder="Enter training program name"
                            disabled={loading}
                          />
                        </div>
                      </div>
                      
                      <div className="register-mentor-form__col-half">
                        <div className="register-mentor-form__field-group">
                          <label className="register-mentor-form__label">Training Duration</label>
                          <input
                            type="text"
                            className="register-mentor-form__input"
                            value={cert.training_duration}
                            onChange={(e) => handleCertificateChange(index, "training_duration", e.target.value)}
                            placeholder="e.g., 40 hours, 3 months"
                            disabled={loading}
                          />
                        </div>
                      </div>
                      
                      <div className="register-mentor-form__col-half">
                        <div className="register-mentor-form__field-group">
                          <label className="register-mentor-form__label">Training Mode</label>
                          <select
                            className="register-mentor-form__select"
                            value={cert.training_mode}
                            onChange={(e) => handleCertificateChange(index, "training_mode", e.target.value)}
                            disabled={loading}
                          >
                            <option value="">Select Training Mode</option>
                            {trainingModeOptions.map((opt) => (
                              <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Issue Date */}
                  <div className="register-mentor-form__col-half">
                    <div className="register-mentor-form__field-group">
                      <label className="register-mentor-form__label">
                        Issued Date{' '}
                        <span className="register-mentor-form__required">*</span>
                      </label>
                      <input
                        type="date"
                        className={`register-mentor-form__input ${cert.errors.issued_date ? "register-mentor-form__input--error" : ""}`}
                        value={cert.issued_date}
                        onChange={(e) => handleCertificateChange(index, "issued_date", e.target.value)}
                        disabled={loading}
                      />
                      {cert.errors.issued_date && (
                        <span className="register-mentor-form__error-text">
                          {cert.errors.issued_date}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Expiry Date */}
                  <div className="register-mentor-form__col-half">
                    <div className="register-mentor-form__field-group">
                      <label className="register-mentor-form__label">
                        Expiry Date{' '}
                        <span className="register-mentor-form__required">*</span>
                      </label>
                      <input
                        type="date"
                        className={`register-mentor-form__input ${cert.errors.expiry_date ? "register-mentor-form__input--error" : ""}`}
                        value={cert.expiry_date}
                        onChange={(e) => handleCertificateChange(index, "expiry_date", e.target.value)}
                        disabled={loading}
                      />
                      {cert.errors.expiry_date && (
                        <span className="register-mentor-form__error-text">
                          {cert.errors.expiry_date}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Document Upload */}
                  <div className="register-mentor-form__col-full">
                    <div className="register-mentor-form__field-group">
                      <label className="register-mentor-form__label">
                        Certificate Document{' '}
                        {!isEditMode && !cert.existing_document && (
                          <span className="register-mentor-form__required">*</span>
                        )}
                        {isEditMode && (
                          <span style={{ color: '#6c757d', fontSize: '13px' }}>
                            {' '}(optional — leave blank to keep existing)
                          </span>
                        )}
                      </label>
                      <input
                        type="file"
                        className={`register-mentor-form__input ${cert.errors.document ? "register-mentor-form__input--error" : ""}`}
                        onChange={(e) => handleCertificateFileChange(index, e.target.files[0])}
                        accept=".pdf"
                        disabled={loading}
                      />
                      {cert.errors.document && (
                        <span className="register-mentor-form__error-text">
                          {cert.errors.document}
                        </span>
                      )}
                      {/* Show existing document link */}
                      {cert.existing_document && !cert.selectedFile && (
                        <small style={{ color: '#28a745', display: 'block', marginTop: '5px' }}>
                          ✓ Current document:{' '}
                          <a
                            href={cert.existing_document}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {cert.document_name || 'View file'}
                          </a>
                        </small>
                      )}
                      {/* Show newly selected file name */}
                      {cert.selectedFile && (
                        <small style={{ color: '#007bff', display: 'block', marginTop: '5px' }}>
                          New file selected: {cert.selectedFile.name}
                        </small>
                      )}
                      <small style={{ color: '#6c757d', display: 'block', marginTop: '5px' }}>
                        Supported format: PDF only (max 5 MB)
                      </small>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Add Another Certificate — only in create mode */}
            {!isEditMode && (
              <div style={{ textAlign: 'center', marginTop: '15px' }}>
                <button
                  type="button"
                  onClick={addCertificate}
                  style={{
                    background: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    padding: '10px 20px',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                  disabled={loading}
                >
                  <FaPlus /> Add Another Certificate
                </button>
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="register-mentor-form__actions">
            <button
              type="button"
              className="register-mentor-form__btn register-mentor-form__btn--outline"
              onClick={handleCancel}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="register-mentor-form__btn register-mentor-form__btn--primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="register-mentor-form__btn-spinner"></span>
                  {isEditMode ? "Updating..." : "Creating..."}
                </>
              ) : isEditMode ? (
                "Update Mentor"
              ) : (
                `Create Mentor with ${certifications.length} Certificate(s)`
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterMentor;