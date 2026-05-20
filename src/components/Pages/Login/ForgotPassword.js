import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from 'sweetalert2';
import "./ForgotPassword.css";
import { BASE_URL } from "../../../ApiUrl";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // New state for password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // API Base URL
  const API_BASE_URL = `${BASE_URL}/api/admin`;

  // Step 1: Send OTP API
  const sendOTP = async () => {
    setError("");
    
    // Validation
    if (!email) {
      setError("Please enter your email");
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/password/request/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim() })
      });

      const data = await response.json();
      console.log('📤 Send OTP response:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send OTP. Please try again.');
      }

      // Success
      await Swal.fire({
        icon: 'success',
        title: 'OTP Sent!',
        text: 'Please check your email for the OTP',
        timer: 2000,
        showConfirmButton: false
      });

      setStep(2);
    } catch (err) {
      console.error('❌ Send OTP error:', err);
      setError(err.message || 'Failed to send OTP. Please try again.');
      
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.message || 'Failed to send OTP. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP API
  const verifyOTP = async () => {
    setError("");
    
    // Validation
    if (!otp) {
      setError("Please enter the OTP");
      return;
    }

    if (otp.length < 4) {
      setError("Please enter a valid OTP");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/password/verify/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: email.trim(), 
          otp: otp.trim() 
        })
      });

      const data = await response.json();
      console.log('📤 Verify OTP response:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Invalid OTP. Please try again.');
      }

      // Success
      await Swal.fire({
        icon: 'success',
        title: 'OTP Verified!',
        text: 'You can now reset your password',
        timer: 2000,
        showConfirmButton: false
      });

      setStep(3);
    } catch (err) {
      console.error('❌ Verify OTP error:', err);
      setError(err.message || 'Invalid OTP. Please try again.');
      
      Swal.fire({
        icon: 'error',
        title: 'Verification Failed',
        text: err.message || 'Invalid OTP. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Reset Password API
  const resetPassword = async () => {
    setError("");
    
    // Validation
    if (!password || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/password/reset/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: email.trim(), 
          new_password: password 
        })
      });

      const data = await response.json();
      console.log('📤 Reset Password response:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Failed to reset password. Please try again.');
      }

      // Success
      await Swal.fire({
        icon: 'success',
        title: 'Password Reset Successful!',
        text: 'You can now login with your new password',
        timer: 2000,
        showConfirmButton: false
      });

      // Navigate to login page after success
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (err) {
      console.error('❌ Reset Password error:', err);
      setError(err.message || 'Failed to reset password. Please try again.');
      
      Swal.fire({
        icon: 'error',
        title: 'Reset Failed',
        text: err.message || 'Failed to reset password. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle resend OTP
  const resendOTP = async () => {
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/password/request/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim() })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to resend OTP');
      }

      await Swal.fire({
        icon: 'success',
        title: 'OTP Resent!',
        text: 'Please check your email for the new OTP',
        timer: 2000,
        showConfirmButton: false
      });
    } catch (err) {
      setError(err.message || 'Failed to resend OTP');
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.message || 'Failed to resend OTP',
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle back to login
  const goToLogin = () => {
    navigate('/');
  };

  return (
    <div className="training-admin-login d-flex align-items-center justify-content-center min-vh-100">
      <div className="training-admin-login-card card p-4 shadow" style={{ width: "100%", maxWidth: "400px", maxHeight: "600px" }}>
        <div className="card-body">
          {/* Back to Login Button */}
          <button 
            onClick={goToLogin}
            className="btn btn-link text-decoration-none mb-3"
            style={{ 
              position: 'absolute', 
              top: '15px', 
              left: '15px',
              color: '#667eea',
              padding: '5px 10px'
            }}
          >
            ← Back to Login
          </button>

          <div className="text-center mb-4 mt-3">
            <div className="training-admin-logo mb-3" style={{ 
              width: "70px", 
              height: "70px", 
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", 
              borderRadius: "50%", 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center", 
              margin: "0 auto",
              fontSize: "30px",
              color: "white"
            }}>
              🔐
            </div>

            <h3 className="training-admin-login-title" style={{ fontSize: "24px" }}>
              {step === 1 && "Forgot Password"}
              {step === 2 && "Verify OTP"}
              {step === 3 && "Reset Password"}
            </h3>

            <p className="training-admin-login-subtitle text-muted" style={{ fontSize: "14px" }}>
              {step === 1 && "Enter your email to receive OTP"}
              {step === 2 && `Enter the OTP sent to ${email}`}
              {step === 3 && "Create your new password"}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="alert alert-danger alert-dismissible fade show" role="alert" style={{ fontSize: "14px" }}>
              <i className="fas fa-exclamation-circle me-2"></i>
              {error}
              <button type="button" className="btn-close" onClick={() => setError("")}></button>
            </div>
          )}

          {/* STEP 1 - EMAIL */}
          {step === 1 && (
            <>
              <div className="mb-4">
                <label className="form-label" style={{ fontWeight: "500", fontSize: "14px" }}>
                  Email Address <span className="text-danger">*</span>
                </label>

                <input
                  type="email"
                  className="form-control"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  style={{ padding: "12px", fontSize: "14px" }}
                />
              </div>

              <div className="d-grid">
                <button 
                  className="btn btn-primary" 
                  onClick={sendOTP}
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
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Sending...
                    </>
                  ) : (
                    'Send OTP'
                  )}
                </button>
              </div>
            </>
          )}

          {/* STEP 2 - OTP */}
          {step === 2 && (
            <>
              <div className="mb-4">
                <label className="form-label" style={{ fontWeight: "500", fontSize: "14px" }}>
                  Enter OTP <span className="text-danger">*</span>
                </label>

                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength="6"
                  disabled={loading}
                  style={{ padding: "12px", fontSize: "14px", textAlign: "center", letterSpacing: "5px" }}
                />

                <div className="text-end mt-2">
                  <button 
                    type="button" 
                    className="btn btn-link p-0"
                    onClick={resendOTP}
                    disabled={loading}
                    style={{ color: "#667eea", fontSize: "13px" }}
                  >
                    Resend OTP
                  </button>
                </div>
              </div>

              <div className="d-grid">
                <button 
                  className="btn btn-primary" 
                  onClick={verifyOTP}
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
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Verifying...
                    </>
                  ) : (
                    'Verify OTP'
                  )}
                </button>
              </div>
            </>
          )}

          {/* STEP 3 - RESET PASSWORD */}
          {step === 3 && (
            <>
              <div className="mb-3">
                <label className="form-label" style={{ fontWeight: "500", fontSize: "14px" }}>
                  New Password <span className="text-danger">*</span>
                </label>
                
                <div className="position-relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    className="form-control"
                    placeholder="Enter new password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    style={{ padding: "12px 40px 12px 12px", fontSize: "14px" }}
                  />
                  <span 
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: "absolute",
                      right: "10px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      cursor: "pointer",
                      color: "#667eea",
                      fontSize: "18px"
                    }}
                  >
                    {showPassword ? "👁️" : "👁️‍🗨️"}
                  </span>
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label" style={{ fontWeight: "500", fontSize: "14px" }}>
                  Confirm Password <span className="text-danger">*</span>
                </label>
                
                <div className="position-relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    className="form-control"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={loading}
                    style={{ padding: "12px 40px 12px 12px", fontSize: "14px" }}
                  />
                  <span 
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={{
                      position: "absolute",
                      right: "10px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      cursor: "pointer",
                      color: "#667eea",
                      fontSize: "18px"
                    }}
                  >
                    {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
                  </span>
                </div>
              </div>

              <div className="d-grid">
                <button 
                  className="btn btn-primary" 
                  onClick={resetPassword}
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
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Resetting...
                    </>
                  ) : (
                    'Reset Password'
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;