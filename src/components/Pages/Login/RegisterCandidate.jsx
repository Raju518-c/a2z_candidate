import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import "./Register.css";
import Swal from 'sweetalert2';
import { BASE_URL } from "../../../ApiUrl";
import { FaPlus, FaTrash } from 'react-icons/fa';

const RegisterCandidate = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState({});
  const [isEditMode, setIsEditMode] = useState(false);

  // State for certificates
  const [certificates, setCertificates] = useState([]);
  const [certificateErrors, setCertificateErrors] = useState({});

  // Issuer type options
  const issuerTypeOptions = [
    { value: 'Educational Institution', label: 'Educational Institution' },
    { value: 'Client Company', label: 'Client Company' },
    { value: 'A2Z Organization', label: 'A2Z Organization' },
    { value: 'Training Center', label: 'Training Center' },
    { value: 'Government Body', label: 'Government Body' },
    { value: 'Professional Body', label: 'Professional Body' },
    { value: 'Other', label: 'Other' },
  ];

  // Certification Type options
  const certificationTypeOptions = [
    { value: 'Educational', label: 'Educational' },
    { value: 'Training', label: 'Training' },
    { value: 'Experience', label: 'Experience' },
    { value: 'Other', label: 'Other' },
  ];

  // Education level options
  const educationLevelOptions = [
    { value: 'High School', label: 'High School' },
    { value: 'Bachelor\'s', label: 'Bachelor\'s Degree' },
    { value: 'Master\'s', label: 'Master\'s Degree' },
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

  const [formData, setFormData] = useState({
    full_name: '',
    date_of_birth: '',
    gender: 'M',
    phone_number: '',
    email: '',
    address: '',
    city: '',
    state: '',
    country: '',
    pincode: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    blood_group: '',
    medical_expiry_date: '',
    safety_induction_status: true,
  });

  const [professionalInfo, setProfessionalInfo] = useState({
    highest_qualification: '',
    specialization: '',
    college_university: '',
    graduation_year: '',
    current_role: '',
    experience_years: '0',
    current_company: '',
    industry: '',
    join_date: '',
    certifications: '',
    iso_certifications: '',
  });

  // ─── Lifecycle ───────────────────────────────────────────────────────────────

  useEffect(() => {
    if (id) {
      setIsEditMode(true);
      fetchCandidateData();
    } else {
      initializeCertificates();
    }
  }, [id]);

  // ─── Helpers ─────────────────────────────────────────────────────────────────

  const makeEmptyCert = () => ({
    id: Date.now() + Math.random(),
    selectedFile: null,
    existing_document: null,
    document_name: '',
    // Form fields
    certification: null, // Keep certification field set to null as requested
    certification_type: '',
    certification_type_other: '',
    issuer_type: '',
    issuer_type_other: '',
    issuer_name: '',
    issuer_email: '',
    issuer_phone: '',
    issuer_website: '',
    issuer_address: '',
    issuer_city: '',
    issuer_state: '',
    issuer_country: '',
    issuer_postal_code: '',
    issuer_description: '',
    issuer_accreditation_number: '',
    issue_date: '',
    expiry_date: '',
    certificate_number: '',
    issuing_authority: '',
    // Type-specific fields
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

  const initializeCertificates = () => {
    setCertificates([makeEmptyCert()]);
  };

  // ─── API Calls ────────────────────────────────────────────────────────────────

  const fetchCandidateData = async () => {
    try {
      setFetchLoading(true);
      const response = await fetch(`${BASE_URL}/api/candidate/candidates/${id}/`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const result = await response.json();

      if (result.status && result.data) {
        const d = result.data;
        setFormData({
          full_name: d.full_name || '',
          date_of_birth: d.date_of_birth ? d.date_of_birth.split('T')[0] : '',
          gender: d.gender || 'M',
          phone_number: d.phone_number || '',
          email: d.email || '',
          address: d.address || '',
          city: d.city || '',
          state: d.state || '',
          country: d.country || '',
          pincode: d.pincode || '',
          emergency_contact_name: d.emergency_contact_name || '',
          emergency_contact_phone: d.emergency_contact_phone || '',
          blood_group: d.blood_group || '',
          medical_expiry_date: d.medical_expiry_date
            ? d.medical_expiry_date.split('T')[0]
            : '',
          safety_induction_status: d.safety_induction_status || true,
        });

        setProfessionalInfo({
          highest_qualification: d.professional_info?.highest_qualification || '',
          specialization: d.professional_info?.specialization || '',
          college_university: d.professional_info?.college_university || '',
          graduation_year: d.professional_info?.graduation_year || '',
          current_role: d.professional_info?.current_role || '',
          experience_years: d.professional_info?.experience_years?.toString() || '0',
          current_company: d.professional_info?.current_company || '',
          industry: d.professional_info?.industry || '',
          join_date: d.professional_info?.join_date || '',
          certifications: d.professional_info?.certifications || '',
          iso_certifications: d.professional_info?.iso_certifications || '',
        });

        await fetchCandidateCertifications(id);
      } else {
        throw new Error(result.message || 'Failed to fetch candidate data');
      }
    } catch (err) {
      setError(err.message);
      Swal.fire({
        icon: 'error',
        title: 'Failed to Load Candidate',
        text: err.message || 'An error occurred while loading candidate data',
        showConfirmButton: true,
      });
    } finally {
      setFetchLoading(false);
    }
  };

  const fetchCandidateCertifications = async (candidateId) => {
    try {
      const response = await fetch(
        `${BASE_URL}/api/candidate/certifications/?candidate=${candidateId}`
      );
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const result = await response.json();

      if (result.status && result.data && result.data.length > 0) {
        const existingCerts = result.data.map((cert) => ({
          id: cert.id,
          selectedFile: null,
          existing_document: cert.document || null,
          document_name: cert.document ? cert.document.split('/').pop() : '',
          certification: cert.certification || null,
          certification_type: cert.certification_type || '',
          certification_type_other: cert.certification_type_other || '',
          issuer_type: cert.issuer_type || '',
          issuer_type_other: cert.issuer_type_other || '',
          issuer_name: cert.issuer_name || '',
          issuer_email: cert.issuer_email || '',
          issuer_phone: cert.issuer_phone || '',
          issuer_website: cert.issuer_website || '',
          issuer_address: cert.issuer_address || '',
          issuer_city: cert.issuer_city || '',
          issuer_state: cert.issuer_state || '',
          issuer_country: cert.issuer_country || '',
          issuer_postal_code: cert.issuer_postal_code || '',
          issuer_description: cert.issuer_description || '',
          issuer_accreditation_number: cert.issuer_accreditation_number || '',
          issue_date: cert.issue_date || '',
          expiry_date: cert.expiry_date || '',
          certificate_number: cert.certificate_number || '',
          issuing_authority: cert.issuing_authority || '',
          education_level: cert.education_level || '',
          field_of_study: cert.field_of_study || '',
          grade_or_percentage: cert.grade_or_percentage || '',
          training_program_name: cert.training_program_name || '',
          training_duration: cert.training_duration || '',
          training_mode: cert.training_mode || '',
          job_role: cert.job_role || '',
          employment_type: cert.employment_type || '',
          work_responsibilities: cert.work_responsibilities || '',
          errors: {},
        }));
        setCertificates(existingCerts);
      } else {
        initializeCertificates();
      }
    } catch (err) {
      console.error('Error fetching candidate certifications:', err);
      initializeCertificates();
    }
  };

  // ─── Form Handlers ────────────────────────────────────────────────────────────

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleProfessionalInfoChange = (e) => {
    const { name, value } = e.target;
    setProfessionalInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ─── Certificate Handlers ─────────────────────────────────────────────────────

  const addCertificate = () => {
    setCertificates((prev) => [...prev, makeEmptyCert()]);
  };

  const removeCertificate = (index) => {
    if (certificates.length === 1) {
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
        setCertificates((prev) => prev.filter((_, i) => i !== index));
        const newCertErrors = { ...certificateErrors };
        delete newCertErrors[index];
        setCertificateErrors(newCertErrors);
      }
    });
  };

  const handleCertificateChange = (index, field, value) => {
    setCertificates((prev) =>
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
    setCertificates((prev) =>
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

  // ─── Validation ───────────────────────────────────────────────────────────────

  const validateCertificates = () => {
    let isValid = true;
    const newCertErrors = {};

    certificates.forEach((cert, index) => {
      const errs = {};
      
      // Validate certification_type_other if certification_type is "Other"
      if (!cert.certification_type) {
        errs.certification_type = 'Certification type is required';
        isValid = false;
      } else if (cert.certification_type === 'Other' && !cert.certification_type_other?.trim()) {
        errs.certification_type_other = 'Please specify the certification type';
        isValid = false;
      }
      
      // Validate type-specific fields based on certification type
      if (cert.certification_type === 'Educational') {
        if (!cert.education_level) {
          errs.education_level = 'Education level is required';
          isValid = false;
        }
        if (!cert.field_of_study) {
          errs.field_of_study = 'Field of study is required';
          isValid = false;
        }
      } else if (cert.certification_type === 'Training') {
        if (!cert.training_program_name) {
          errs.training_program_name = 'Training program name is required';
          isValid = false;
        }
        if (!cert.training_duration) {
          errs.training_duration = 'Training duration is required';
          isValid = false;
        }
        if (!cert.training_mode) {
          errs.training_mode = 'Training mode is required';
          isValid = false;
        }
      } else if (cert.certification_type === 'Experience') {
        if (!cert.job_role) {
          errs.job_role = 'Job role is required';
          isValid = false;
        }
        if (!cert.employment_type) {
          errs.employment_type = 'Employment type is required';
          isValid = false;
        }
      }
      
      if (!cert.issuer_type) {
        errs.issuer_type = 'Issuer type is required';
        isValid = false;
      }
      
      if (cert.issuer_type === 'Other' && !cert.issuer_type_other?.trim()) {
        errs.issuer_type_other = 'Please specify the issuer type';
        isValid = false;
      }
      
      if (!cert.issuer_name?.trim()) {
        errs.issuer_name = 'Issuer name is required';
        isValid = false;
      }
      
      if (!cert.issue_date) {
        errs.issue_date = 'Issue date is required';
        isValid = false;
      }
      if (!cert.expiry_date) {
        errs.expiry_date = 'Expiry date is required';
        isValid = false;
      }
      if (cert.issue_date && cert.expiry_date) {
        if (new Date(cert.expiry_date) <= new Date(cert.issue_date)) {
          errs.expiry_date = 'Expiry date must be after issue date';
          isValid = false;
        }
      }
      if (!cert.certificate_number?.trim()) {
        errs.certificate_number = 'Certificate number is required';
        isValid = false;
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

    setCertificates((prev) =>
      prev.map((cert, i) => ({
        ...cert,
        errors: newCertErrors[i] || {},
      }))
    );

    return isValid;
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.full_name?.trim()) newErrors.full_name = 'Full name is required';
    if (!formData.date_of_birth) newErrors.date_of_birth = 'Date of birth is required';
    if (!formData.phone_number?.trim()) {
      newErrors.phone_number = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phone_number.replace(/\D/g, ''))) {
      newErrors.phone_number = 'Please enter a valid 10-digit phone number';
    }
    if (!formData.email?.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!formData.address?.trim()) newErrors.address = 'Address is required';
    if (!formData.city?.trim()) newErrors.city = 'City is required';
    if (!formData.state?.trim()) newErrors.state = 'State is required';
    if (!formData.country?.trim()) newErrors.country = 'Country is required';
    if (!formData.pincode?.trim()) {
      newErrors.pincode = 'Pincode is required';
    } else if (!/^\d{6}$/.test(formData.pincode)) {
      newErrors.pincode = 'Please enter a valid 6-digit pincode';
    }
    if (!formData.emergency_contact_name?.trim())
      newErrors.emergency_contact_name = 'Emergency contact name is required';
    if (!formData.emergency_contact_phone?.trim()) {
      newErrors.emergency_contact_phone = 'Emergency contact phone is required';
    } else if (
      !/^\d{10}$/.test(formData.emergency_contact_phone.replace(/\D/g, ''))
    ) {
      newErrors.emergency_contact_phone =
        'Please enter a valid 10-digit phone number';
    }

    if (!professionalInfo.highest_qualification?.trim()) {
      newErrors.highest_qualification = 'Highest qualification is required';
    }
    if (!professionalInfo.current_role?.trim()) {
      newErrors.current_role = 'Current role is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Function to log the payload in JSON format before submission
  const logPayload = () => {
    console.log('='.repeat(60));
    console.log('📋 PAYLOAD TO BE SENT TO BACKEND');
    console.log('='.repeat(60));
    
    // Build candidate payload
    const candidatePayload = {
      full_name: formData.full_name,
      date_of_birth: formData.date_of_birth,
      gender: formData.gender,
      phone_number: formData.phone_number,
      email: formData.email,
      address: formData.address,
      city: formData.city,
      state: formData.state,
      country: formData.country,
      pincode: formData.pincode,
      emergency_contact_name: formData.emergency_contact_name,
      emergency_contact_phone: formData.emergency_contact_phone,
      blood_group: formData.blood_group || '',
      medical_expiry_date: formData.medical_expiry_date || '',
      safety_induction_status: formData.safety_induction_status,
    };

    console.log('📦 Candidate Payload:');
    console.log(JSON.stringify(candidatePayload, null, 2));
    console.log('📌 Professional Info Payload:');
    console.log(JSON.stringify(professionalInfo, null, 2));

    const certificatesPayload = certificates.map((cert) => ({
      certification: cert.certification,
      certification_type: cert.certification_type,
      certification_type_other: cert.certification_type_other,
      issuer_type: cert.issuer_type,
      issuer_type_other: cert.issuer_type_other,
      issuer_name: cert.issuer_name,
      issuer_email: cert.issuer_email,
      issuer_phone: cert.issuer_phone,
      issuer_website: cert.issuer_website,
      issuer_address: cert.issuer_address,
      issuer_city: cert.issuer_city,
      issuer_state: cert.issuer_state,
      issuer_country: cert.issuer_country,
      issuer_postal_code: cert.issuer_postal_code,
      issuer_description: cert.issuer_description,
      issuer_accreditation_number: cert.issuer_accreditation_number,
      issue_date: cert.issue_date,
      expiry_date: cert.expiry_date,
      certificate_number: cert.certificate_number,
      issuing_authority: cert.issuing_authority || cert.issuer_name,
      status: 'pending',
      is_approved: false,
      education_level: cert.education_level,
      field_of_study: cert.field_of_study,
      grade_or_percentage: cert.grade_or_percentage,
      training_program_name: cert.training_program_name,
      training_duration: cert.training_duration,
      training_mode: cert.training_mode,
      job_role: cert.job_role,
      employment_type: cert.employment_type,
      work_responsibilities: cert.work_responsibilities,
    }));

    console.log('📜 Certificates Payload:');
    console.log(JSON.stringify(certificatesPayload, null, 2));
    console.log('='.repeat(60));
  };

  // ─── Submit ───────────────────────────────────────────────────────────────────

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log('='.repeat(50));
    console.log(isEditMode ? 'EDIT FORM SUBMISSION STARTED' : 'CREATE FORM SUBMISSION STARTED');
    
    // Log the payload before submission
    logPayload();

    if (!validateForm() || !validateCertificates()) {
      console.log('❌ Form validation failed');
      Swal.fire({
        icon: 'error',
        title: 'Validation Failed',
        text: 'Please check all required fields and try again.',
        showConfirmButton: true,
      });
      return;
    }

    setLoading(true);
    setError('');

    try {
      // ─── STEP 1: Build candidate payload with professional info and certifications ───
      const candidatePayload = {
        full_name: formData.full_name,
        date_of_birth: formData.date_of_birth,
        gender: formData.gender,
        phone_number: formData.phone_number,
        email: formData.email,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        country: formData.country,
        pincode: formData.pincode,
        emergency_contact_name: formData.emergency_contact_name,
        emergency_contact_phone: formData.emergency_contact_phone,
        blood_group: formData.blood_group || '',
        medical_expiry_date: formData.medical_expiry_date || '',
        safety_induction_status: formData.safety_induction_status,
      };

      const requestData = new FormData();
      Object.entries(candidatePayload).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          requestData.append(key, value);
        }
      });

      requestData.append('professional_info', JSON.stringify(professionalInfo));

      const certificationsPayload = certificates.map((cert) => ({
        certification: cert.certification,
        certification_type: cert.certification_type,
        certification_type_other: cert.certification_type_other,
        issuer_type: cert.issuer_type,
        issuer_type_other: cert.issuer_type_other,
        issuer_name: cert.issuer_name,
        issuer_email: cert.issuer_email,
        issuer_phone: cert.issuer_phone,
        issuer_website: cert.issuer_website,
        issuer_address: cert.issuer_address,
        issuer_city: cert.issuer_city,
        issuer_state: cert.issuer_state,
        issuer_country: cert.issuer_country,
        issuer_postal_code: cert.issuer_postal_code,
        issuer_description: cert.issuer_description,
        issuer_accreditation_number: cert.issuer_accreditation_number,
        issue_date: cert.issue_date,
        expiry_date: cert.expiry_date,
        certificate_number: cert.certificate_number,
        issuing_authority: cert.issuing_authority || cert.issuer_name,
        status: 'pending',
        is_approved: false,
        education_level: cert.education_level,
        field_of_study: cert.field_of_study,
        grade_or_percentage: cert.grade_or_percentage,
        training_program_name: cert.training_program_name,
        training_duration: cert.training_duration,
        training_mode: cert.training_mode,
        job_role: cert.job_role,
        employment_type: cert.employment_type,
        work_responsibilities: cert.work_responsibilities,
      }));

      requestData.append('certifications', JSON.stringify(certificationsPayload));

      certificates.forEach((cert, index) => {
        if (cert.selectedFile) {
          requestData.append(`document_${index}`, cert.selectedFile);
        }
      });

      console.log('📤 Sending Candidate Payload:', JSON.stringify(candidatePayload, null, 2));
      console.log('📤 Sending Professional Info:', JSON.stringify(professionalInfo, null, 2));
      console.log('📤 Sending Certifications:', JSON.stringify(certificationsPayload, null, 2));

      const method = isEditMode ? 'PUT' : 'POST';
      const candUrl = isEditMode
        ? `${BASE_URL}/api/candidate/candidates/${id}/`
        : `${BASE_URL}/api/candidate/candidates/`;

      const candidateRes = await fetch(candUrl, {
        method,
        body: requestData,
      });

      const candidateData = await candidateRes.json().catch(() => null);

      if (!candidateRes.ok) {
        if (candidateData?.errors) {
          const serverErrors = {};
          Object.keys(candidateData.errors).forEach((key) => {
            serverErrors[key] = Array.isArray(candidateData.errors[key])
              ? candidateData.errors[key][0]
              : candidateData.errors[key];
          });
          setErrors(serverErrors);
          throw new Error('Please check the form for errors');
        }
        throw new Error(
          candidateData?.message ||
            `Failed to ${isEditMode ? 'update' : 'create'} candidate`
        );
      }

      const candidateId = candidateData?.data?.id || id;
      console.log(`✅ Candidate saved with ID: ${candidateId}`);

      await Swal.fire({
        icon: 'success',
        title: isEditMode ? 'Updated!' : 'Created!',
        html: `Candidate ${isEditMode ? 'updated' : 'created'} successfully.<br/>${certificates.length} certificate(s) included.`,
        timer: 2000,
        showConfirmButton: false,
      });

      navigate('/');

    } catch (err) {
      console.error('❌ Error:', err);
      setError(err.message || `Failed to ${isEditMode ? 'update' : 'create'} candidate.`);
      Swal.fire({
        icon: 'error',
        title: isEditMode ? 'Update Failed' : 'Creation Failed',
        text: err.message || `Failed to ${isEditMode ? 'update' : 'create'} candidate.`,
        showConfirmButton: true,
      });
    } finally {
      setLoading(false);
    }
  };

  // ─── Navigation ───────────────────────────────────────────────────────────────

  const handleBack = () => navigate('/');
  const handleCancel = () => navigate('/candidate');

  // ─── Loading State ────────────────────────────────────────────────────────────

  if (fetchLoading) {
    return (
      <div className="register-candidate-page">
        <div className="register-candidate-loading">
          <div className="register-candidate-loading__spinner"></div>
          <p className="register-candidate-loading__text">Loading candidate data...</p>
        </div>
      </div>
    );
  }

  // ─── Render Type-Specific Fields ───────────────────────────────────────────────

  const renderTypeSpecificFields = (cert, index) => {
    if (cert.certification_type === 'Educational') {
      return (
        <>
          <div className="register-candidate-form__col-half">
            <div className="register-candidate-form__field-group">
              <label className="register-candidate-form__label">
                Education Level <span className="register-candidate-form__required">*</span>
              </label>
              <select
                className={`register-candidate-form__select ${cert.errors.education_level ? 'register-candidate-form__select--error' : ''}`}
                value={cert.education_level}
                onChange={(e) => handleCertificateChange(index, 'education_level', e.target.value)}
                disabled={loading}
              >
                <option value="">Select Education Level</option>
                {educationLevelOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              {cert.errors.education_level && (
                <span className="register-candidate-form__error-text">{cert.errors.education_level}</span>
              )}
            </div>
          </div>
          
          <div className="register-candidate-form__col-half">
            <div className="register-candidate-form__field-group">
              <label className="register-candidate-form__label">
                Field of Study <span className="register-candidate-form__required">*</span>
              </label>
              <input
                type="text"
                className={`register-candidate-form__input ${cert.errors.field_of_study ? 'register-candidate-form__input--error' : ''}`}
                value={cert.field_of_study}
                onChange={(e) => handleCertificateChange(index, 'field_of_study', e.target.value)}
                placeholder="e.g., Computer Science, Business Administration"
                disabled={loading}
              />
              {cert.errors.field_of_study && (
                <span className="register-candidate-form__error-text">{cert.errors.field_of_study}</span>
              )}
            </div>
          </div>
          
          <div className="register-candidate-form__col-half">
            <div className="register-candidate-form__field-group">
              <label className="register-candidate-form__label">Grade/Percentage</label>
              <input
                type="text"
                className="register-candidate-form__input"
                value={cert.grade_or_percentage}
                onChange={(e) => handleCertificateChange(index, 'grade_or_percentage', e.target.value)}
                placeholder="e.g., A+, 85%, 3.5 GPA"
                disabled={loading}
              />
            </div>
          </div>
        </>
      );
    }
    
    if (cert.certification_type === 'Training') {
      return (
        <>
          <div className="register-candidate-form__col-half">
            <div className="register-candidate-form__field-group">
              <label className="register-candidate-form__label">
                Training Program Name <span className="register-candidate-form__required">*</span>
              </label>
              <input
                type="text"
                className={`register-candidate-form__input ${cert.errors.training_program_name ? 'register-candidate-form__input--error' : ''}`}
                value={cert.training_program_name}
                onChange={(e) => handleCertificateChange(index, 'training_program_name', e.target.value)}
                placeholder="Enter training program name"
                disabled={loading}
              />
              {cert.errors.training_program_name && (
                <span className="register-candidate-form__error-text">{cert.errors.training_program_name}</span>
              )}
            </div>
          </div>
          
          <div className="register-candidate-form__col-half">
            <div className="register-candidate-form__field-group">
              <label className="register-candidate-form__label">
                Training Duration <span className="register-candidate-form__required">*</span>
              </label>
              <input
                type="text"
                className={`register-candidate-form__input ${cert.errors.training_duration ? 'register-candidate-form__input--error' : ''}`}
                value={cert.training_duration}
                onChange={(e) => handleCertificateChange(index, 'training_duration', e.target.value)}
                placeholder="e.g., 40 hours, 3 months, 2 weeks"
                disabled={loading}
              />
              {cert.errors.training_duration && (
                <span className="register-candidate-form__error-text">{cert.errors.training_duration}</span>
              )}
            </div>
          </div>
          
          <div className="register-candidate-form__col-half">
            <div className="register-candidate-form__field-group">
              <label className="register-candidate-form__label">
                Training Mode <span className="register-candidate-form__required">*</span>
              </label>
              <select
                className={`register-candidate-form__select ${cert.errors.training_mode ? 'register-candidate-form__select--error' : ''}`}
                value={cert.training_mode}
                onChange={(e) => handleCertificateChange(index, 'training_mode', e.target.value)}
                disabled={loading}
              >
                <option value="">Select Training Mode</option>
                {trainingModeOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              {cert.errors.training_mode && (
                <span className="register-candidate-form__error-text">{cert.errors.training_mode}</span>
              )}
            </div>
          </div>
        </>
      );
    }
    
    if (cert.certification_type === 'Experience') {
      return (
        <>
          <div className="register-candidate-form__col-half">
            <div className="register-candidate-form__field-group">
              <label className="register-candidate-form__label">
                Job Role <span className="register-candidate-form__required">*</span>
              </label>
              <input
                type="text"
                className={`register-candidate-form__input ${cert.errors.job_role ? 'register-candidate-form__input--error' : ''}`}
                value={cert.job_role}
                onChange={(e) => handleCertificateChange(index, 'job_role', e.target.value)}
                placeholder="e.g., Senior Software Engineer, Project Manager"
                disabled={loading}
              />
              {cert.errors.job_role && (
                <span className="register-candidate-form__error-text">{cert.errors.job_role}</span>
              )}
            </div>
          </div>
          
          <div className="register-candidate-form__col-half">
            <div className="register-candidate-form__field-group">
              <label className="register-candidate-form__label">
                Employment Type <span className="register-candidate-form__required">*</span>
              </label>
              <select
                className={`register-candidate-form__select ${cert.errors.employment_type ? 'register-candidate-form__select--error' : ''}`}
                value={cert.employment_type}
                onChange={(e) => handleCertificateChange(index, 'employment_type', e.target.value)}
                disabled={loading}
              >
                <option value="">Select Employment Type</option>
                {employmentTypeOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              {cert.errors.employment_type && (
                <span className="register-candidate-form__error-text">{cert.errors.employment_type}</span>
              )}
            </div>
          </div>
          
          <div className="register-candidate-form__col-full">
            <div className="register-candidate-form__field-group">
              <label className="register-candidate-form__label">Work Responsibilities</label>
              <textarea
                className="register-candidate-form__textarea"
                value={cert.work_responsibilities}
                onChange={(e) => handleCertificateChange(index, 'work_responsibilities', e.target.value)}
                placeholder="Describe key responsibilities and achievements in this role"
                rows="3"
                disabled={loading}
                style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ddd' }}
              />
            </div>
          </div>
        </>
      );
    }
    
    return null;
  };

  // ─── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="register-candidate-page">
      <div className="register-candidate-wrapper">

        {/* ── Header ── */}
        <div className="register-candidate-header">
          <button
            type="button"
            className="register-candidate-header__back-btn"
            onClick={handleBack}
            title="Go back to home"
          >
            ←
          </button>
          <div className="register-candidate-header__title-wrapper">
            <h2 className="register-candidate-header__title">
              {isEditMode ? 'Edit Candidate' : 'Add New Candidate'}
            </h2>
            <p className="register-candidate-header__subtitle">
              {isEditMode
                ? 'Update the candidate details below'
                : 'Fill in the candidate details and add certifications below'}
            </p>
          </div>
        </div>

        {/* ── Global Error ── */}
        {error && (
          <div
            className="register-candidate-alert register-candidate-alert--error"
            role="alert"
          >
            <span className="register-candidate-alert__message">
              <strong>Error:</strong> {error}
            </span>
            <button
              type="button"
              className="register-candidate-alert__close-btn"
              onClick={() => setError('')}
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        )}

        {/* ── Form ── */}
        <form className="register-candidate-form" onSubmit={handleSubmit}>

          {/* Personal Information */}
          <div className="register-candidate-section">
            <h3 className="register-candidate-section__title">
              <span className="register-candidate-section__title-icon">👤</span>
              Personal Information
            </h3>
            <div className="register-candidate-form__row">
              <div className="register-candidate-form__col-full">
                <div className="register-candidate-form__field-group">
                  <label className="register-candidate-form__label">
                    Full Name <span className="register-candidate-form__required">*</span>
                  </label>
                  <input
                    type="text"
                    className={`register-candidate-form__input ${errors.full_name ? 'register-candidate-form__input--error' : ''}`}
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    placeholder="Enter full name"
                    disabled={loading}
                  />
                  {errors.full_name && (
                    <span className="register-candidate-form__error-text">{errors.full_name}</span>
                  )}
                </div>
              </div>

              <div className="register-candidate-form__col-third">
                <div className="register-candidate-form__field-group">
                  <label className="register-candidate-form__label">
                    Date of Birth <span className="register-candidate-form__required">*</span>
                  </label>
                  <input
                    type="date"
                    className={`register-candidate-form__input ${errors.date_of_birth ? 'register-candidate-form__input--error' : ''}`}
                    name="date_of_birth"
                    value={formData.date_of_birth}
                    onChange={handleChange}
                    disabled={loading}
                  />
                  {errors.date_of_birth && (
                    <span className="register-candidate-form__error-text">{errors.date_of_birth}</span>
                  )}
                </div>
              </div>

              <div className="register-candidate-form__col-third">
                <div className="register-candidate-form__field-group">
                  <label className="register-candidate-form__label">
                    Gender <span className="register-candidate-form__required">*</span>
                  </label>
                  <select
                    className={`register-candidate-form__select ${errors.gender ? 'register-candidate-form__select--error' : ''}`}
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    disabled={loading}
                  >
                    <option value="M">Male</option>
                    <option value="F">Female</option>
                    <option value="O">Other</option>
                  </select>
                  {errors.gender && (
                    <span className="register-candidate-form__error-text">{errors.gender}</span>
                  )}
                </div>
              </div>

              <div className="register-candidate-form__col-third">
                <div className="register-candidate-form__field-group">
                  <label className="register-candidate-form__label">Blood Group</label>
                  <select
                    className="register-candidate-form__select"
                    name="blood_group"
                    value={formData.blood_group}
                    onChange={handleChange}
                    disabled={loading}
                  >
                    <option value="">Select Blood Group</option>
                    {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map((bg) => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="register-candidate-section">
            <h3 className="register-candidate-section__title">
              <span className="register-candidate-section__title-icon">📞</span>
              Contact Information
            </h3>
            <div className="register-candidate-form__row">
              <div className="register-candidate-form__col-half">
                <div className="register-candidate-form__field-group">
                  <label className="register-candidate-form__label">
                    Phone Number <span className="register-candidate-form__required">*</span>
                  </label>
                  <input
                    type="tel"
                    className={`register-candidate-form__input ${errors.phone_number ? 'register-candidate-form__input--error' : ''}`}
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleChange}
                    placeholder="Enter 10-digit phone number"
                    maxLength="10"
                    disabled={loading}
                  />
                  {errors.phone_number && (
                    <span className="register-candidate-form__error-text">{errors.phone_number}</span>
                  )}
                </div>
              </div>

              <div className="register-candidate-form__col-half">
                <div className="register-candidate-form__field-group">
                  <label className="register-candidate-form__label">
                    Email <span className="register-candidate-form__required">*</span>
                  </label>
                  <input
                    type="email"
                    className={`register-candidate-form__input ${errors.email ? 'register-candidate-form__input--error' : ''}`}
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter email address"
                    disabled={loading}
                  />
                  {errors.email && (
                    <span className="register-candidate-form__error-text">{errors.email}</span>
                  )}
                </div>
              </div>

              <div className="register-candidate-form__col-full">
                <div className="register-candidate-form__field-group">
                  <label className="register-candidate-form__label">
                    Address <span className="register-candidate-form__required">*</span>
                  </label>
                  <input
                    type="text"
                    className={`register-candidate-form__input ${errors.address ? 'register-candidate-form__input--error' : ''}`}
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Enter full address"
                    disabled={loading}
                  />
                  {errors.address && (
                    <span className="register-candidate-form__error-text">{errors.address}</span>
                  )}
                </div>
              </div>

              <div className="register-candidate-form__col-third">
                <div className="register-candidate-form__field-group">
                  <label className="register-candidate-form__label">
                    City <span className="register-candidate-form__required">*</span>
                  </label>
                  <input
                    type="text"
                    className={`register-candidate-form__input ${errors.city ? 'register-candidate-form__input--error' : ''}`}
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="Enter city"
                    disabled={loading}
                  />
                  {errors.city && (
                    <span className="register-candidate-form__error-text">{errors.city}</span>
                  )}
                </div>
              </div>

              <div className="register-candidate-form__col-third">
                <div className="register-candidate-form__field-group">
                  <label className="register-candidate-form__label">
                    State <span className="register-candidate-form__required">*</span>
                  </label>
                  <input
                    type="text"
                    className={`register-candidate-form__input ${errors.state ? 'register-candidate-form__input--error' : ''}`}
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    placeholder="Enter state"
                    disabled={loading}
                  />
                  {errors.state && (
                    <span className="register-candidate-form__error-text">{errors.state}</span>
                  )}
                </div>
              </div>

              <div className="register-candidate-form__col-third">
                <div className="register-candidate-form__field-group">
                  <label className="register-candidate-form__label">
                    Country <span className="register-candidate-form__required">*</span>
                  </label>
                  <input
                    type="text"
                    className={`register-candidate-form__input ${errors.country ? 'register-candidate-form__input--error' : ''}`}
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    placeholder="Enter country"
                    disabled={loading}
                  />
                  {errors.country && (
                    <span className="register-candidate-form__error-text">{errors.country}</span>
                  )}
                </div>
              </div>

              <div className="register-candidate-form__col-half">
                <div className="register-candidate-form__field-group">
                  <label className="register-candidate-form__label">
                    Pincode <span className="register-candidate-form__required">*</span>
                  </label>
                  <input
                    type="text"
                    className={`register-candidate-form__input ${errors.pincode ? 'register-candidate-form__input--error' : ''}`}
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                    placeholder="Enter 6-digit pincode"
                    maxLength="6"
                    disabled={loading}
                  />
                  {errors.pincode && (
                    <span className="register-candidate-form__error-text">{errors.pincode}</span>
                  )}
                </div>
              </div>

              <div className="register-candidate-form__col-half">
                <div className="register-candidate-form__field-group">
                  <label className="register-candidate-form__label">Medical Expiry Date</label>
                  <input
                    type="date"
                    className="register-candidate-form__input"
                    name="medical_expiry_date"
                    value={formData.medical_expiry_date}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="register-candidate-section">
            <h3 className="register-candidate-section__title">
              <span className="register-candidate-section__title-icon">🆘</span>
              Emergency Contact
            </h3>
            <div className="register-candidate-form__row">
              <div className="register-candidate-form__col-half">
                <div className="register-candidate-form__field-group">
                  <label className="register-candidate-form__label">
                    Emergency Contact Name{' '}
                    <span className="register-candidate-form__required">*</span>
                  </label>
                  <input
                    type="text"
                    className={`register-candidate-form__input ${errors.emergency_contact_name ? 'register-candidate-form__input--error' : ''}`}
                    name="emergency_contact_name"
                    value={formData.emergency_contact_name}
                    onChange={handleChange}
                    placeholder="Enter emergency contact name"
                    disabled={loading}
                  />
                  {errors.emergency_contact_name && (
                    <span className="register-candidate-form__error-text">
                      {errors.emergency_contact_name}
                    </span>
                  )}
                </div>
              </div>

              <div className="register-candidate-form__col-half">
                <div className="register-candidate-form__field-group">
                  <label className="register-candidate-form__label">
                    Emergency Contact Phone{' '}
                    <span className="register-candidate-form__required">*</span>
                  </label>
                  <input
                    type="tel"
                    className={`register-candidate-form__input ${errors.emergency_contact_phone ? 'register-candidate-form__input--error' : ''}`}
                    name="emergency_contact_phone"
                    value={formData.emergency_contact_phone}
                    onChange={handleChange}
                    placeholder="Enter emergency contact phone"
                    maxLength="10"
                    disabled={loading}
                  />
                  {errors.emergency_contact_phone && (
                    <span className="register-candidate-form__error-text">
                      {errors.emergency_contact_phone}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Professional Information */}
          <div className="register-candidate-section">
            <h3 className="register-candidate-section__title">
              <span className="register-candidate-section__title-icon">💼</span>
              Professional Information
            </h3>
            <div className="register-candidate-form__row">
              <div className="register-candidate-form__col-half">
                <div className="register-candidate-form__field-group">
                  <label className="register-candidate-form__label">
                    Highest Qualification <span className="register-candidate-form__required">*</span>
                  </label>
                  <input
                    type="text"
                    className={`register-candidate-form__input ${errors.highest_qualification ? 'register-candidate-form__input--error' : ''}`}
                    name="highest_qualification"
                    value={professionalInfo.highest_qualification}
                    onChange={handleProfessionalInfoChange}
                    placeholder="Enter highest qualification"
                    disabled={loading}
                  />
                  {errors.highest_qualification && (
                    <span className="register-candidate-form__error-text">
                      {errors.highest_qualification}
                    </span>
                  )}
                </div>
              </div>

              <div className="register-candidate-form__col-half">
                <div className="register-candidate-form__field-group">
                  <label className="register-candidate-form__label">
                    Current Role <span className="register-candidate-form__required">*</span>
                  </label>
                  <input
                    type="text"
                    className={`register-candidate-form__input ${errors.current_role ? 'register-candidate-form__input--error' : ''}`}
                    name="current_role"
                    value={professionalInfo.current_role}
                    onChange={handleProfessionalInfoChange}
                    placeholder="Enter current role"
                    disabled={loading}
                  />
                  {errors.current_role && (
                    <span className="register-candidate-form__error-text">
                      {errors.current_role}
                    </span>
                  )}
                </div>
              </div>

              <div className="register-candidate-form__col-half">
                <div className="register-candidate-form__field-group">
                  <label className="register-candidate-form__label">College / University</label>
                  <input
                    type="text"
                    className="register-candidate-form__input"
                    name="college_university"
                    value={professionalInfo.college_university}
                    onChange={handleProfessionalInfoChange}
                    placeholder="Enter college or university"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="register-candidate-form__col-half">
                <div className="register-candidate-form__field-group">
                  <label className="register-candidate-form__label">Graduation Year</label>
                  <input
                    type="number"
                    className="register-candidate-form__input"
                    name="graduation_year"
                    value={professionalInfo.graduation_year}
                    onChange={handleProfessionalInfoChange}
                    placeholder="Enter graduation year"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="register-candidate-form__col-half">
                <div className="register-candidate-form__field-group">
                  <label className="register-candidate-form__label">Current Company</label>
                  <input
                    type="text"
                    className="register-candidate-form__input"
                    name="current_company"
                    value={professionalInfo.current_company}
                    onChange={handleProfessionalInfoChange}
                    placeholder="Enter current company"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="register-candidate-form__col-half">
                <div className="register-candidate-form__field-group">
                  <label className="register-candidate-form__label">Industry</label>
                  <input
                    type="text"
                    className="register-candidate-form__input"
                    name="industry"
                    value={professionalInfo.industry}
                    onChange={handleProfessionalInfoChange}
                    placeholder="Enter industry"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="register-candidate-form__col-half">
                <div className="register-candidate-form__field-group">
                  <label className="register-candidate-form__label">Join Date</label>
                  <input
                    type="date"
                    className="register-candidate-form__input"
                    name="join_date"
                    value={professionalInfo.join_date}
                    onChange={handleProfessionalInfoChange}
                    disabled={loading}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Certifications */}
          <div className="register-candidate-section">
            <h3 className="register-candidate-section__title">
              <span className="register-candidate-section__title-icon">📜</span>
              Certifications
            </h3>
            <p className="register-candidate-section__subtitle">
              Add professional certifications for this candidate
            </p>

            {certificates.map((cert, index) => (
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
                {certificates.length > 1 && (
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

                <div className="register-candidate-form__row">

                  {/* Certification Type */}
                  <div className="register-candidate-form__col-half">
                    <div className="register-candidate-form__field-group">
                      <label className="register-candidate-form__label">
                        Certification Type{' '}
                        <span className="register-candidate-form__required">*</span>
                      </label>
                      <select
                        className={`register-candidate-form__select ${cert.errors.certification_type ? 'register-candidate-form__select--error' : ''}`}
                        value={cert.certification_type}
                        onChange={(e) =>
                          handleCertificateChange(index, 'certification_type', e.target.value)
                        }
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
                        <span className="register-candidate-form__error-text">
                          {cert.errors.certification_type}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Conditional Other Certification Type Input */}
                  {cert.certification_type === 'Other' && (
                    <div className="register-candidate-form__col-half">
                      <div className="register-candidate-form__field-group">
                        <label className="register-candidate-form__label">
                          Please Specify Certification Type{' '}
                          <span className="register-candidate-form__required">*</span>
                        </label>
                        <input
                          type="text"
                          className={`register-candidate-form__input ${cert.errors.certification_type_other ? 'register-candidate-form__input--error' : ''}`}
                          value={cert.certification_type_other || ''}
                          onChange={(e) =>
                            handleCertificateChange(index, 'certification_type_other', e.target.value)
                          }
                          placeholder="Enter custom certification type (e.g., Professional, Academic)"
                          disabled={loading}
                        />
                        {cert.errors.certification_type_other && (
                          <span className="register-candidate-form__error-text">
                            {cert.errors.certification_type_other}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Type-specific fields (Educational, Training, Experience) */}
                  {renderTypeSpecificFields(cert, index)}

                  {/* Issuer Type */}
                  <div className="register-candidate-form__col-half">
                    <div className="register-candidate-form__field-group">
                      <label className="register-candidate-form__label">
                        Issuer Type{' '}
                        <span className="register-candidate-form__required">*</span>
                      </label>
                      <select
                        className={`register-candidate-form__select ${cert.errors.issuer_type ? 'register-candidate-form__select--error' : ''}`}
                        value={cert.issuer_type}
                        onChange={(e) =>
                          handleCertificateChange(index, 'issuer_type', e.target.value)
                        }
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
                        <span className="register-candidate-form__error-text">
                          {cert.errors.issuer_type}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Conditional Other Issuer Type Input */}
                  {cert.issuer_type === 'Other' && (
                    <div className="register-candidate-form__col-half">
                      <div className="register-candidate-form__field-group">
                        <label className="register-candidate-form__label">
                          Please Specify Issuer Type{' '}
                          <span className="register-candidate-form__required">*</span>
                        </label>
                        <input
                          type="text"
                          className={`register-candidate-form__input ${cert.errors.issuer_type_other ? 'register-candidate-form__input--error' : ''}`}
                          value={cert.issuer_type_other || ''}
                          onChange={(e) =>
                            handleCertificateChange(index, 'issuer_type_other', e.target.value)
                          }
                          placeholder="Enter custom issuer type"
                          disabled={loading}
                        />
                        {cert.errors.issuer_type_other && (
                          <span className="register-candidate-form__error-text">
                            {cert.errors.issuer_type_other}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Issuer Name */}
                  <div className="register-candidate-form__col-half">
                    <div className="register-candidate-form__field-group">
                      <label className="register-candidate-form__label">
                        Issuer Name{' '}
                        <span className="register-candidate-form__required">*</span>
                      </label>
                      <input
                        type="text"
                        className={`register-candidate-form__input ${cert.errors.issuer_name ? 'register-candidate-form__input--error' : ''}`}
                        value={cert.issuer_name}
                        onChange={(e) =>
                          handleCertificateChange(index, 'issuer_name', e.target.value)
                        }
                        placeholder="Enter issuer name"
                        disabled={loading}
                      />
                      {cert.errors.issuer_name && (
                        <span className="register-candidate-form__error-text">
                          {cert.errors.issuer_name}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Issuer Contact Information Section */}
                  <div style={{ width: '100%', marginTop: '15px', marginBottom: '10px' }}>
                    <h5 style={{ color: '#555', marginBottom: '10px' }}>Issuer Contact Information</h5>
                  </div>

                  {/* Issuer Email */}
                  <div className="register-candidate-form__col-third">
                    <div className="register-candidate-form__field-group">
                      <label className="register-candidate-form__label">Issuer Email</label>
                      <input
                        type="email"
                        className="register-candidate-form__input"
                        value={cert.issuer_email}
                        onChange={(e) => handleCertificateChange(index, 'issuer_email', e.target.value)}
                        placeholder="issuer@example.com"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  {/* Issuer Phone */}
                  <div className="register-candidate-form__col-third">
                    <div className="register-candidate-form__field-group">
                      <label className="register-candidate-form__label">Issuer Phone</label>
                      <input
                        type="tel"
                        className="register-candidate-form__input"
                        value={cert.issuer_phone}
                        onChange={(e) => handleCertificateChange(index, 'issuer_phone', e.target.value)}
                        placeholder="Contact phone number"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  {/* Issuer Website */}
                  <div className="register-candidate-form__col-third">
                    <div className="register-candidate-form__field-group">
                      <label className="register-candidate-form__label">Issuer Website</label>
                      <input
                        type="url"
                        className="register-candidate-form__input"
                        value={cert.issuer_website}
                        onChange={(e) => handleCertificateChange(index, 'issuer_website', e.target.value)}
                        placeholder="https://example.com"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  {/* Issuer Address */}
                  <div className="register-candidate-form__col-full">
                    <div className="register-candidate-form__field-group">
                      <label className="register-candidate-form__label">Issuer Address</label>
                      <input
                        type="text"
                        className="register-candidate-form__input"
                        value={cert.issuer_address}
                        onChange={(e) => handleCertificateChange(index, 'issuer_address', e.target.value)}
                        placeholder="Street address"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  {/* Issuer City, State, Country */}
                  <div className="register-candidate-form__col-fourth">
                    <div className="register-candidate-form__field-group">
                      <label className="register-candidate-form__label">Issuer City</label>
                      <input
                        type="text"
                        className="register-candidate-form__input"
                        value={cert.issuer_city}
                        onChange={(e) => handleCertificateChange(index, 'issuer_city', e.target.value)}
                        placeholder="City"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="register-candidate-form__col-fourth">
                    <div className="register-candidate-form__field-group">
                      <label className="register-candidate-form__label">Issuer State</label>
                      <input
                        type="text"
                        className="register-candidate-form__input"
                        value={cert.issuer_state}
                        onChange={(e) => handleCertificateChange(index, 'issuer_state', e.target.value)}
                        placeholder="State/Province"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="register-candidate-form__col-fourth">
                    <div className="register-candidate-form__field-group">
                      <label className="register-candidate-form__label">Issuer Country</label>
                      <input
                        type="text"
                        className="register-candidate-form__input"
                        value={cert.issuer_country}
                        onChange={(e) => handleCertificateChange(index, 'issuer_country', e.target.value)}
                        placeholder="Country"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="register-candidate-form__col-fourth">
                    <div className="register-candidate-form__field-group">
                      <label className="register-candidate-form__label">Postal Code</label>
                      <input
                        type="text"
                        className="register-candidate-form__input"
                        value={cert.issuer_postal_code}
                        onChange={(e) => handleCertificateChange(index, 'issuer_postal_code', e.target.value)}
                        placeholder="Postal/Zip code"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  {/* Issuer Description */}
                  <div className="register-candidate-form__col-full">
                    <div className="register-candidate-form__field-group">
                      <label className="register-candidate-form__label">Issuer Description</label>
                      <textarea
                        className="register-candidate-form__textarea"
                        value={cert.issuer_description}
                        onChange={(e) => handleCertificateChange(index, 'issuer_description', e.target.value)}
                        placeholder="Brief description of the issuing organization"
                        rows="2"
                        disabled={loading}
                        style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ddd' }}
                      />
                    </div>
                  </div>

                  {/* Issuer Accreditation Number */}
                  <div className="register-candidate-form__col-half">
                    <div className="register-candidate-form__field-group">
                      <label className="register-candidate-form__label">Accreditation Number</label>
                      <input
                        type="text"
                        className="register-candidate-form__input"
                        value={cert.issuer_accreditation_number}
                        onChange={(e) => handleCertificateChange(index, 'issuer_accreditation_number', e.target.value)}
                        placeholder="Accreditation/Registration number"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  {/* Issue Date */}
                  <div className="register-candidate-form__col-half">
                    <div className="register-candidate-form__field-group">
                      <label className="register-candidate-form__label">
                        Issue Date{' '}
                        <span className="register-candidate-form__required">*</span>
                      </label>
                      <input
                        type="date"
                        className={`register-candidate-form__input ${cert.errors.issue_date ? 'register-candidate-form__input--error' : ''}`}
                        value={cert.issue_date}
                        onChange={(e) =>
                          handleCertificateChange(index, 'issue_date', e.target.value)
                        }
                        disabled={loading}
                      />
                      {cert.errors.issue_date && (
                        <span className="register-candidate-form__error-text">
                          {cert.errors.issue_date}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Expiry Date */}
                  <div className="register-candidate-form__col-half">
                    <div className="register-candidate-form__field-group">
                      <label className="register-candidate-form__label">
                        Expiry Date{' '}
                        <span className="register-candidate-form__required">*</span>
                      </label>
                      <input
                        type="date"
                        className={`register-candidate-form__input ${cert.errors.expiry_date ? 'register-candidate-form__input--error' : ''}`}
                        value={cert.expiry_date}
                        onChange={(e) =>
                          handleCertificateChange(index, 'expiry_date', e.target.value)
                        }
                        disabled={loading}
                      />
                      {cert.errors.expiry_date && (
                        <span className="register-candidate-form__error-text">
                          {cert.errors.expiry_date}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Certificate Number */}
                  <div className="register-candidate-form__col-half">
                    <div className="register-candidate-form__field-group">
                      <label className="register-candidate-form__label">
                        Certificate Number{' '}
                        <span className="register-candidate-form__required">*</span>
                      </label>
                      <input
                        type="text"
                        className={`register-candidate-form__input ${cert.errors.certificate_number ? 'register-candidate-form__input--error' : ''}`}
                        value={cert.certificate_number}
                        onChange={(e) =>
                          handleCertificateChange(index, 'certificate_number', e.target.value)
                        }
                        placeholder="Enter certificate number"
                        disabled={loading}
                      />
                      {cert.errors.certificate_number && (
                        <span className="register-candidate-form__error-text">
                          {cert.errors.certificate_number}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Issuing Authority (for backward compatibility) */}
                  <div className="register-candidate-form__col-half">
                    <div className="register-candidate-form__field-group">
                      <label className="register-candidate-form__label">Issuing Authority</label>
                      <input
                        type="text"
                        className="register-candidate-form__input"
                        value={cert.issuing_authority}
                        onChange={(e) =>
                          handleCertificateChange(index, 'issuing_authority', e.target.value)
                        }
                        placeholder="Enter issuing authority (if different from issuer)"
                        disabled={loading}
                      />
                      <small style={{ color: '#6c757d', display: 'block', marginTop: '5px' }}>
                        Leave blank to use issuer name
                      </small>
                    </div>
                  </div>

                  {/* Document Upload */}
                  <div className="register-candidate-form__col-full">
                    <div className="register-candidate-form__field-group">
                      <label className="register-candidate-form__label">
                        Certificate Document{' '}
                        {!isEditMode && !cert.existing_document && (
                          <span className="register-candidate-form__required">*</span>
                        )}
                        {isEditMode && (
                          <span style={{ color: '#6c757d', fontSize: '13px' }}>
                            {' '}(optional — leave blank to keep existing)
                          </span>
                        )}
                      </label>
                      <input
                        type="file"
                        className={`register-candidate-form__input ${cert.errors.document ? 'register-candidate-form__input--error' : ''}`}
                        onChange={(e) =>
                          handleCertificateFileChange(index, e.target.files[0])
                        }
                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                        disabled={loading}
                      />
                      {cert.errors.document && (
                        <span className="register-candidate-form__error-text">
                          {cert.errors.document}
                        </span>
                      )}
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
                      {cert.selectedFile && (
                        <small style={{ color: '#007bff', display: 'block', marginTop: '5px' }}>
                          New file selected: {cert.selectedFile.name}
                        </small>
                      )}
                      <small style={{ color: '#6c757d', display: 'block', marginTop: '5px' }}>
                        Supported formats: PDF, JPG, JPEG, PNG, DOC, DOCX (max 10 MB)
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
          <div className="register-candidate-form__actions">
            <button
              type="button"
              className="register-candidate-form__btn register-candidate-form__btn--outline"
              onClick={handleCancel}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="register-candidate-form__btn register-candidate-form__btn--primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="register-candidate-form__btn-spinner"></span>
                  {isEditMode ? 'Updating...' : 'Creating...'}
                </>
              ) : isEditMode ? (
                'Update Candidate'
              ) : (
                `Create Candidate with ${certificates.length} Certificate(s)`
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default RegisterCandidate;