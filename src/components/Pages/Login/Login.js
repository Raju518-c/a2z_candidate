// components/Pages/Login/Login.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash, FaUserPlus, FaUserShield } from "react-icons/fa";
import Swal from 'sweetalert2';
import "./Login.css";
import { BASE_URL } from "../../../ApiUrl";
import A2ZLogo from "../../Shared/Images/A2Zlogo.jpeg";

// Super Admin static credentials
const SUPER_ADMIN_CREDENTIALS = {
  email: "SuperAdmin@gmail.com",
  password: "SuperAdmin@123"
};

const Login = () => {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showRegistrationOptions, setShowRegistrationOptions] = useState(false);

  // Super Admin login handler
  const handleSuperAdminLogin = async () => {
    setLoading(true);
    
    try {
      // Create Super Admin user data object
      const superAdminData = {
        id: "SA-001",
        full_name: "Super Administrator",
        email: SUPER_ADMIN_CREDENTIALS.email,
        user_type: "super_admin",
        role: "super_admin",
        identifier: SUPER_ADMIN_CREDENTIALS.email,
        permissions: ["all"],
        token: "super_admin_static_token_" + Date.now(),
        created_at: new Date().toISOString()
      };

      // Store in localStorage
      localStorage.setItem("super_admin_user", JSON.stringify(superAdminData));
      localStorage.setItem("super_admin_token", superAdminData.token);

      // Show success message
      await Swal.fire({
        icon: 'success',
        title: 'Super Admin Login Successful!',
        text: 'Welcome to OCEANSTAR MAIN Control Tower',
        timer: 2000,
        showConfirmButton: false
      });

      // Navigate to Super Admin dashboard
      navigate('/super-dashboard');

    } catch (error) {
      console.error('Super Admin login error:', error);
      setError('Super Admin login failed');
      
      Swal.fire({
        icon: 'error',
        title: 'Login Failed',
        text: 'Super Admin authentication failed',
        timer: 3000,
        showConfirmButton: true
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!identifier.trim() || !password.trim()) {
      setError("Please enter both identifier and password");
      setLoading(false);
      return;
    }

    // Check for Super Admin credentials first
    if (
      identifier.trim().toLowerCase() === SUPER_ADMIN_CREDENTIALS.email.toLowerCase() &&
      password === SUPER_ADMIN_CREDENTIALS.password
    ) {
      console.log('🔐 Super Admin credentials detected');
      await handleSuperAdminLogin();
      return;
    }

    // If not Super Admin, proceed with normal API login
    console.log('🔄 Proceeding with normal login flow');

    try {
      const response = await fetch(`${BASE_URL}/api/admin/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          identifier: identifier.trim(),
          password: password
        })
      });

      const data = await response.json();
      console.log('📥 Login response:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Login failed. Please check your credentials.');
      }

      if (data.status && data.data) {

        const userType = data.data.user_type;

        console.log('✅ Login successful:', data);

        /* -----------------------------------------
           Store user data based on user_type
        ------------------------------------------ */

        let storageKey = "user";

        if (userType === "admin") {
          storageKey = "admin_user";
        } else if (userType === "mentor") {
          storageKey = "mentor_user";
        } else if (userType === "candidate") {
          storageKey = "candidate_user";
        }

        localStorage.setItem(storageKey, JSON.stringify(data.data));

        /* -----------------------------------------
           Store token based on user_type
        ------------------------------------------ */

        const token = data.data.token || data.token;

        if (token) {
          localStorage.setItem(`${userType}_token`, token);
        }

        /* -----------------------------------------
           Success Message
        ------------------------------------------ */

        await Swal.fire({
          icon: 'success',
          title: 'Login Successful!',
          text: 'Welcome back!',
          timer: 1500,
          showConfirmButton: false
        });

        /* -----------------------------------------
           Role Based Navigation
        ------------------------------------------ */

        switch (userType) {
          case 'admin':
            navigate('/dashboard');
            break;

          case 'mentor':
            navigate('/mentor-dashboard');
            break;

          case 'candidate':
            navigate('/candidate-dashboard');
            break;

          default:
            console.error('Unknown user type:', userType);
            navigate('/dashboard');
        }

      } else {
        throw new Error(data.message || 'Invalid response from server');
      }

    } catch (err) {

      console.error('❌ Login error:', err);

      setError(err.message || 'Login failed. Please try again.');

      Swal.fire({
        icon: 'error',
        title: 'Login Failed',
        text: err.message || 'Invalid credentials. Please try again.',
        timer: 3000,
        showConfirmButton: true
      });

    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleRegisterClick = () => {
    setShowRegistrationOptions(true);
  };

  const handleBackToLogin = () => {
    setShowRegistrationOptions(false);
  };

  const handleRegisterAsMentor = () => {
    navigate('/register-mentor');
  };

  const handleRegisterAsCandidate = () => {
    navigate('/register-candidate');
  };

  // Registration selection view
  if (showRegistrationOptions) {
    return (
      <div className="training-admin-login d-flex align-items-center justify-content-center min-vh-100 bg-light">
        <div className="training-admin-login-card card p-4 shadow" style={{ width: "100%", maxWidth: "400px" }}>
          <div className="card-body">
            <div className="training-admin-login-header login-text-center mb-2">
              <div className="mb-3">
                {/* A2Z Logo for Registration View */}
                <img 
                  src={A2ZLogo} 
                  alt="A2Z Logo" 
                  style={{ 
                    width: "100px",
                    height: "100px",
                    objectFit: "contain",
                    margin: "0 auto",
                    display: "block"
                  }}
                />
              </div>

              <h3 className="training-admin-login-title" style={{ fontSize: "24px", fontWeight: "600", color: "#333" }}>
                Create Account
              </h3>

              <p className="training-admin-login-subtitle text-muted" style={{ fontSize: "14px" }}>
                Choose your registration type
              </p>
            </div>

            <div className="registration-options">
              <button
                onClick={handleRegisterAsMentor}
                className="btn btn-primary w-100 mb-3"
                style={{
                  padding: "16px",
                  fontSize: "16px",
                  fontWeight: "500",
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  border: "none",
                  borderRadius: "8px",
                  transition: "transform 0.2s, box-shadow 0.2s",
                  position: "relative",
                  overflow: "hidden"
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = "translateY(-2px)";
                  e.target.style.boxShadow = "0 4px 15px rgba(102, 126, 234, 0.4)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = "translateY(0)";
                  e.target.style.boxShadow = "none";
                }}
              >
                <div style={{ fontSize: "24px", marginBottom: "4px" }}>👨‍🏫</div>
                Register as Mentor
              </button>

              <button
                onClick={handleRegisterAsCandidate}
                className="btn btn-primary w-100 mb-3"
                style={{
                  padding: "16px",
                  fontSize: "16px",
                  fontWeight: "500",
                  background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                  border: "none",
                  borderRadius: "8px",
                  transition: "transform 0.2s, box-shadow 0.2s",
                  position: "relative",
                  overflow: "hidden"
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = "translateY(-2px)";
                  e.target.style.boxShadow = "0 4px 15px rgba(245, 87, 108, 0.4)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = "translateY(0)";
                  e.target.style.boxShadow = "none";
                }}
              >
                <div style={{ fontSize: "24px", marginBottom: "4px" }}>👨‍🎓</div>
                Register as Candidate
              </button>

              <div className="text-center mt-3">
                <button
                  type="button"
                  className="training-admin-forgot-link"
                  onClick={handleBackToLogin}
                >
                  ← Back to Login
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main Login View
  return (
    <div className="training-admin-login d-flex align-items-center justify-content-center min-vh-100 bg-light">
      <div className="training-admin-login-card card p-4 shadow" style={{ width: "100%", maxWidth: "400px" }}>
        <div className="card-body">

          <div className="training-admin-login-header login-text-center mb-4">
            <div className="mb-3">
              <img 
                src={A2ZLogo} 
                alt="A2Z Logo" 
                style={{ 
                  width: "80px",
                  height: "80px",
                  objectFit: "contain",
                  margin: "0 auto",
                  display: "block"
                }}
              />
            </div>

            <h3 className="training-admin-login-title" style={{ fontSize: "24px", fontWeight: "600", color: "#333" }}>
              Training Admin
            </h3>
            <p className="text-muted" style={{ fontSize: "12px" }}>
              Admin • Mentor • Candidate • Super Admin
            </p>
          </div>

          {error && (
            <div className="alert alert-danger alert-dismissible fade show" role="alert" style={{ fontSize: "14px" }}>
              {error}
              <button type="button" className="btn-close" onClick={() => setError("")}></button>
            </div>
          )}

          <form onSubmit={handleLogin}>

            <div className="mb-3">
              <label htmlFor="identifier" className="form-label" style={{ fontWeight: "500", fontSize: "14px" }}>
                Email or Phone Number <span className="text-danger">*</span>
              </label>

              <input
                type="text"
                className="form-control"
                id="identifier"
                placeholder="Enter your email or phone number"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
                disabled={loading}
                style={{ padding: "12px", fontSize: "14px" }}
              />
            </div>

            <div className="mb-4">
              <label htmlFor="password" className="form-label" style={{ fontWeight: "500", fontSize: "14px" }}>
                Password <span className="text-danger">*</span>
              </label>

              <div className="input-group">
                <input
                  type={showPassword ? "text" : "password"}
                  className="form-control"
                  id="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  style={{ padding: "12px", fontSize: "14px" }}
                />

                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={togglePasswordVisibility}
                  disabled={loading}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <div className="d-grid mb-3">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
                style={{
                  padding: "12px",
                  fontSize: "16px",
                  fontWeight: "500",
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  border: "none"
                }}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </div>

            <div className="d-grid mb-3">
              <button
                type="button"
                className="btn btn-outline-primary"
                onClick={handleRegisterClick}
                style={{
                  padding: "12px",
                  fontSize: "16px",
                  fontWeight: "500",
                  borderRadius: "8px"
                }}
              >
                <FaUserPlus className="me-2" />
                Register New Account
              </button>
            </div>

            {/* Super Admin Quick Login Button (Optional - for development) */}
            <div className="d-grid mb-3">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => {
                  setIdentifier(SUPER_ADMIN_CREDENTIALS.email);
                  setPassword(SUPER_ADMIN_CREDENTIALS.password);
                }}
                style={{
                  padding: "12px",
                  fontSize: "12px",
                  fontWeight: "500",
                  borderRadius: "8px",
                  borderColor: "#e5e7eb"
                }}
                title="Quick fill Super Admin credentials"
              >
                <FaUserShield className="me-2" />
                Super Admin Quick Access
              </button>
            </div>

            <div className="text-center mb-3">
              <button
                type="button"
                className="training-admin-forgot-link"
                onClick={() => navigate("/forgot-password")}
              >
                Forgot Password?
              </button>
            </div>

          </form>

          <div className="text-center mt-4">
            <small className="text-muted">
              © 2026 Training Admin. All rights reserved.
            </small>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Login;