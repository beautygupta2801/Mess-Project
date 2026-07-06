
import React, { useState, useEffect } from "react";
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  AlertCircle,
  UserPlus,
  User,
  Hash,
  Home,
  DoorOpen,
  ChevronDown,
  Phone,
  CheckCircle,
  KeyRound,
} from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetMessage, setResetMessage] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const [loginRole, setLoginRole] = useState("student");
  const [registerRole, setRegisterRole] = useState("student");
  // OTP Verification State
  const [showOTP, setShowOTP] = useState(false);
  const [otp, setOtp] = useState("");
  const [verifyingOTP, setVerifyingOTP] = useState(false);

  // Clear messages on view change
  useEffect(() => {
    setError("");
    setSuccessMessage("");
    if (!showRegister) {
      setShowOTP(false);
      setOtp("");
    }
  }, [showRegister, showForgotPassword, showResetPassword]);

  // Registration form fields
  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    rollNo: "",
    hostelNo: "",
    roomNo: "",
    phoneNo: "",
    munshiHostel: "",
    clerkHostel: "",
    clerkCode: "",
  });

  const API_URL = "http://localhost:5000/api";

  // Hostel options
  const hostelOptions = [
    { value: "", label: "Select Hostel", disabled: true },
    { value: "MBH-A", label: "MBH-A - Mega Boys Hostel" },
    { value: "MBH-B", label: "MBH-B - Mega Boys Hostel" },
    { value: "MBH-F", label: "MBH-F - Mega Boys Hostel" },
    { value: "BH-1", label: "BH-1 - Boys Hostel 1" },
    { value: "BH-2", label: "BH-2 - Boys Hostel 2" },
    { value: "BH-3", label: "BH-3 - Boys Hostel 3" },
    { value: "BH-4", label: "BH-4 - Boys Hostel 4" },
    { value: "BH-5", label: "BH-5 - Boys Hostel 5" },
    { value: "BH-6", label: "BH-6 - Boys Hostel 6" },
    { value: "BH-7", label: "BH-7 - Boys Hostel 7" },
    { value: "GH-1", label: "GH-1 - Girls Hostel 1" },
    { value: "GH-2", label: "GH-2 - Girls Hostel 2" },
    { value: "MGH-1", label: "MGH-1 - Main Girls Hostel 1" },
    { value: "MGH-2", label: "MGH-2 - Main Girls Hostel 2" },
  ];

  const validateEmail = (email) => {
    // Check if email ends with @nitj.ac.in
    const collegeDomain = "@nitj.ac.in";
    if (!email.endsWith(collegeDomain)) {
      return `Email must be a college email ending with ${collegeDomain}`;
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return "Please enter a valid email address";
    }

    return null;
  };

  const validatePhoneNumber = (phone) => {
    // Indian phone number validation (10 digits)
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      return "Please enter a valid 10-digit Indian mobile number";
    }
    return null;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, role: loginRole }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.message || "Invalid email or password");
        setLoading(false);
        return;
      }

      // Store authentication data (role: student | munshi)
      const role = data.role || "student";
      const user = data.student || data.munshi || data.clerk;
      const authData = {
        isAuthenticated: true,
        token: data.token,
        role,
        student: data.student || null,
        munshi: data.munshi || null,
        clerk:data.clerk || null,
        user,
        loginTime: new Date().toISOString(),
      };

      localStorage.setItem("authToken", data.token);
      localStorage.setItem("authRole", role);
      localStorage.setItem("authUser", JSON.stringify(authData));
      sessionStorage.setItem("authUser", JSON.stringify(authData));
      
      // Store hostel for clerk/munshi
      if (role === "munshi" && data.munshi?.hostel) {
        localStorage.setItem("hostel", data.munshi.hostel);
      }
      if (role === "clerk" && data.clerk?.hostel) {
        localStorage.setItem("hostel", data.clerk.hostel);
      }
      window.currentUser = authData;

      setLoading(false);

      if (role === "clerk") {
        window.location.href = "/clerk/dashboard";
      } else if (role === "munshi") {
        
        
         window.location.href = "/munshi/dashboard";
        
      } else {
        window.location.href = "/student/dashboard";
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("Server error. Please try again later.");
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Common validation
    if (
      !registerData.name ||
      !registerData.email ||
      !registerData.password ||
      !registerData.confirmPassword
    ) {
      setError("Please fill in all required fields");
      setLoading(false);
      return;
    }

    // Role-specific validation
    if (registerRole === "student") {
      if (
        !registerData.rollNo ||
        !registerData.hostelNo ||
        !registerData.roomNo ||
        !registerData.phoneNo
      ) {
        setError("Please fill in all student fields");
        setLoading(false);
        return;
      }

      const phoneError = validatePhoneNumber(registerData.phoneNo);
      if (phoneError) {
        setError(phoneError);
        setLoading(false);
        return;
      }
    }

    if (registerRole === "munshi") {
      if (!registerData.munshiHostel) {
        setError("Please fill in all munshi fields");
        setLoading(false);
        return;
      }
    }

    if (registerRole === "clerk") {
      if (!registerData.clerkCode || !registerData.clerkHostel) {
        setError("Please fill in all clerk fields");
        setLoading(false);
        return;
      }
    }

    // Email validation
    const emailError = validateEmail(registerData.email);
    if (emailError) {
      setError(emailError);
      setLoading(false);
      return;
    }

    if (registerData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      setLoading(false);
      return;
    }

    if (registerData.password !== registerData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      let endpoint = `${API_URL}/auth/register`;

      if (registerRole === "munshi") {
        endpoint = `${API_URL}/auth/register-munshi`;
      } else if (registerRole === "clerk") {
        endpoint = `${API_URL}/auth/register-clerk`;
      }

      let payload = {
        name: registerData.name,
        email: registerData.email,
        password: registerData.password,
      };

      if (registerRole === "student") {
        payload = {
          ...payload,
          rollNo: registerData.rollNo,
          hostelNo: registerData.hostelNo,
          roomNo: registerData.roomNo,
          phoneNo: registerData.phoneNo,
        };
      }

      if (registerRole === "munshi") {
        payload = {
          ...payload,
          hostel: registerData.munshiHostel,
        };
      }

      if (registerRole === "clerk") {
        payload = {
          ...payload,
          hostel: registerData.clerkHostel,
          clerkCode: registerData.clerkCode,
        };
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.message || "Registration failed");
        setLoading(false);
        return;
      }

      setLoading(false);

      if (
        registerRole === "student" &&
        data.message &&
        data.message.includes("Verification code sent")
      ) {
        setShowOTP(true);
        setShowRegister(true);
        setSuccessMessage(
          `Verification code sent to ${data.email || registerData.email}`
        );
        return;
      }

      setShowRegister(false);
      setEmail(registerData.email);
      setSuccessMessage(
        `${registerRole.charAt(0).toUpperCase() + registerRole.slice(1)} registration successful! Please login with your credentials.`
      );

      setRegisterData({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        rollNo: "",
        hostelNo: "",
        roomNo: "",
        phoneNo: "",
        munshiHostel: "",
        clerkHostel: "",
        clerkCode: "",
      });
    } catch (error) {
      console.error("Registration error:", error);
      setError("Server error. Please try again later.");
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError("");
    setVerifyingOTP(true);

    if (!otp || otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      setVerifyingOTP(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/auth/verify-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: registerData.email,
          otp: otp
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.message || "Verification failed");
        setVerifyingOTP(false);
        return;
      }

      setVerifyingOTP(false);
      
      // Auto login after verification
      const role = data.role || "student";
      const user = data.student;
      const authData = {
        isAuthenticated: true,
        token: data.token,
        role,
        student: data.student,
        user,
        loginTime: new Date().toISOString(),
      };

      localStorage.setItem("authToken", data.token);
      localStorage.setItem("authRole", role);
      localStorage.setItem("authUser", JSON.stringify(authData));
      sessionStorage.setItem("authUser", JSON.stringify(authData));
      window.currentUser = authData;

      // Redirect to dashboard
      window.location.href = "/student/dashboard";
      
    } catch (error) {
      console.error("OTP Verification error:", error);
      setError("Server error. Please try again later.");
      setVerifyingOTP(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError("");
    setResetMessage("");
    setLoading(true);

    // Email validation
    const emailError = validateEmail(resetEmail);
    if (emailError) {
      setError(emailError);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: resetEmail }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.message || "Failed to send reset link");
        setLoading(false);
        return;
      }

      setLoading(false);
      setResetMessage(
        "Password reset link has been sent to your email. Please check your inbox."
      );

      setTimeout(() => {
        setShowForgotPassword(false);
        setShowResetPassword(true);
        setResetEmail("");
        setResetMessage("");
      }, 2000);
    } catch (error) {
      console.error("Forgot password error:", error);
      setError("Server error. Please try again later.");
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!resetToken) {
      setError("Please enter the reset token from your email");
      setLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long");
      setLoading(false);
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/auth/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: resetToken,
          newPassword: newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.message || "Failed to reset password");
        setLoading(false);
        return;
      }

      setLoading(false);
      
      // Redirect to login
      setShowResetPassword(false);
      setSuccessMessage("Password reset successful! You can now login.");
      setResetToken("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (error) {
      console.error("Reset password error:", error);
      setError("Server error. Please try again later.");
      setLoading(false);
    }
  };

  // Reset Password View
  if (showResetPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-950 relative overflow-hidden">
        {/* Animated background blobs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        
        <div className="bg-slate-900/50 backdrop-blur-2xl rounded-3xl w-full max-w-md p-10 relative z-10 border border-white/10 shadow-2xl">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-500 via-green-500 to-teal-600 rounded-3xl mb-6 shadow-2xl shadow-green-500/30">
              <KeyRound className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-4xl font-bold text-white mb-3 tracking-tight">
              Reset Password
            </h2>
            <p className="text-slate-300 text-base">
              Enter the token from your email and set a new password
            </p>
          </div>

          <form onSubmit={handleResetPassword}>
            <div className="mb-5">
              <label className="block mb-2 text-sm font-semibold text-white">
                Reset Token <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={resetToken}
                  onChange={(e) => setResetToken(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:bg-white/15 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all outline-none"
                  placeholder="Enter token from email"
                  required
                />
              </div>
            </div>

            <div className="mb-5">
              <label className="block mb-2 text-sm font-semibold text-white">
                New Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:bg-white/15 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all outline-none"
                  placeholder="••••••••"
                  minLength="6"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              <p className="mt-1 text-xs text-slate-400">
                Minimum 6 characters
              </p>
            </div>

            <div className="mb-6">
              <label className="block mb-2 text-sm font-semibold text-white">
                Confirm New Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:bg-white/15 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all outline-none"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 text-red-700 text-sm">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold transition-all transform hover:scale-[1.02] shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Resetting Password...
                </span>
              ) : (
                "Reset Password"
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setShowResetPassword(false);
                setError("");
              }}
              className="w-full mt-3 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-all"
            >
              Back to Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Forgot Password View
  if (showForgotPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-950 relative overflow-hidden">
        {/* Animated background blobs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        
        <div className="bg-slate-900/50 backdrop-blur-2xl rounded-3xl w-full max-w-md p-10 relative z-10 border border-white/10 shadow-2xl">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 rounded-3xl mb-6 shadow-2xl shadow-blue-500/30">
              <Lock className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-4xl font-bold text-white mb-3 tracking-tight">
              Forgot Password?
            </h2>
            <p className="text-slate-300 text-base">
              Enter your email to receive a reset token
            </p>
          </div>

          <form onSubmit={handleForgotPassword}>
            <div className="mb-6">
              <label className="block mb-2 text-sm font-semibold text-white">
                College Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:bg-white/15 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all outline-none"
                  placeholder="yourname@nitj.ac.in"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 text-red-700 text-sm">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {resetMessage && (
              <div className="mb-4 p-3 rounded-lg text-sm bg-green-50 text-green-700 border border-green-200 flex items-start gap-2">
                <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>{resetMessage}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all transform hover:scale-[1.02] shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Sending...
                </span>
              ) : (
                "Send Reset Token"
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setShowForgotPassword(false);
                setError("");
                setResetMessage("");
              }}
              className="w-full mt-3 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-all"
            >
              Back to Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Register View
  if (showRegister) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-950 relative overflow-hidden">
        {/* Animated background blobs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        
        <div className="bg-slate-900/50 backdrop-blur-2xl rounded-3xl w-full max-w-2xl p-10 relative z-10 border border-white/10 shadow-2xl">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-cyan-500 via-blue-500 to-purple-600 rounded-3xl mb-6 shadow-2xl shadow-blue-500/30">
              <UserPlus className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-4xl font-bold text-white mb-3 tracking-tight">
              {showOTP ? "Verify Email" : "Create Account"}
            </h2>
            <p className="text-slate-300 text-base">
              {showOTP 
                ? "Enter the 6-digit code sent to your email" 
                : `Register as a new ${
                    registerRole.charAt(0).toUpperCase() + registerRole.slice(1)
                  } at NITJ`}
            </p>
          </div>

          {showOTP ? (
            <form onSubmit={handleVerifyOTP}>
              <div className="mb-6">
                <label className="block mb-2 text-sm font-semibold text-white">
                  Verification Code <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                    className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:bg-white/15 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all tracking-widest text-lg outline-none"
                    placeholder="123456"
                    maxLength="6"
                    required
                    autoFocus
                  />
                </div>
                <p className="mt-2 text-xs text-slate-400">
                  Code sent to <span className="font-semibold text-white">{registerData.email}</span>
                </p>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 text-red-700 text-sm">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={verifyingOTP}
                className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold transition-all transform hover:scale-[1.02] shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {verifyingOTP ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Verifying...
                  </span>
                ) : (
                  "Verify & Complete Registration"
                )}
              </button>

              <button
                type="button"
                onClick={() => setShowOTP(false)}
                className="w-full mt-3 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-all"
              >
                Back to Registration
              </button>
            </form>
          ) : (

            <form onSubmit={handleRegister}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block mb-2 text-sm font-semibold text-white">
                      Register As <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        value={registerRole}
                        onChange={(e) => setRegisterRole(e.target.value)}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:bg-white/15 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all appearance-none cursor-pointer outline-none"
                      >
                        <option value="student" className="bg-slate-800">Student</option>
                        <option value="munshi" className="bg-slate-800">Munshi</option>
                        <option value="clerk" className="bg-slate-800">Clerk</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block mb-2 text-sm font-semibold text-white">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={registerData.name}
                        onChange={(e) => {
                          const val = e.target.value
                            .split(" ")
                            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                            .join(" ");
                          setRegisterData({ ...registerData, name: val });
                        }}
                        className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:bg-white/15 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all outline-none"
                        placeholder="Your Name"
                        required
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block mb-2 text-sm font-semibold text-white">
                      College Email Address <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        value={registerData.email}
                        onChange={(e) =>
                          setRegisterData({
                            ...registerData,
                            email: e.target.value,
                          })
                        }
                        className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:bg-white/15 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all outline-none"
                        placeholder="yourname@nitj.ac.in"
                        required
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Use your official NITJ email address
                    </p>
                  </div>

                  {registerRole === "student" && (
                    <>
                      <div>
                        <label className="block mb-2 text-sm font-semibold text-white">
                          Roll Number <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="text"
                            value={registerData.rollNo}
                            onChange={(e) =>
                              setRegisterData({
                                ...registerData,
                                rollNo: e.target.value,
                              })
                            }
                            className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:bg-white/15 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all outline-none"
                            placeholder="22103084"
                            required={registerRole === "student"}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block mb-2 text-sm font-semibold text-white">
                          Phone Number <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="tel"
                            value={registerData.phoneNo}
                            onChange={(e) =>
                              setRegisterData({
                                ...registerData,
                                phoneNo: e.target.value,
                              })
                            }
                            className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:bg-white/15 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all outline-none"
                            placeholder="9876543210"
                            maxLength="10"
                            required={registerRole === "student"}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block mb-2 text-sm font-semibold text-white">
                          Hostel <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <Home className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
                          <select
                            value={registerData.hostelNo}
                            onChange={(e) =>
                              setRegisterData({
                                ...registerData,
                                hostelNo: e.target.value,
                              })
                            }
                            className="w-full pl-12 pr-10 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:bg-white/15 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all appearance-none cursor-pointer outline-none"
                            required={registerRole === "student"}
                          >
                            {hostelOptions.map((option) => (
                              <option
                                key={option.value}
                                value={option.value}
                                disabled={option.disabled}
                                className="py-2 bg-slate-800 text-white"
                              >
                                {option.label}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                        </div>
                      </div>

                      <div>
                        <label className="block mb-2 text-sm font-semibold text-white">
                          Room Number <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <DoorOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="text"
                            value={registerData.roomNo}
                            onChange={(e) =>
                              setRegisterData({
                                ...registerData,
                                roomNo: e.target.value,
                              })
                            }
                            className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:bg-white/15 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all outline-none"
                            placeholder="428"
                            required={registerRole === "student"}
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {registerRole === "munshi" && (
                    <>
                      <div>
                        <label className="block mb-2 text-sm font-semibold text-white">
                          Assigned Hostel <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <Home className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
                          <select
                            value={registerData.munshiHostel}
                            onChange={(e) =>
                              setRegisterData({
                                ...registerData,
                                munshiHostel: e.target.value,
                              })
                            }
                            className="w-full pl-12 pr-10 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:bg-white/15 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all appearance-none cursor-pointer outline-none"
                            required={registerRole === "munshi"}
                          >
                            {hostelOptions.map((option) => (
                              <option
                                key={option.value}
                                value={option.value}
                                disabled={option.disabled}
                                className="py-2 bg-slate-800 text-white"
                              >
                                {option.label}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                        </div>
                      </div>

                      
                    </>
                  )}

                  {registerRole === "clerk" && (
  <>
    <div>
      <label className="block mb-2 text-sm font-semibold text-white">
        Assigned Hostel <span className="text-red-500">*</span>
      </label>
      <div className="relative">
        <Home className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
        <select
          value={registerData.clerkHostel}
          onChange={(e) =>
            setRegisterData({
              ...registerData,
              clerkHostel: e.target.value,
            })
          }
          className="w-full pl-12 pr-10 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:bg-white/15 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all appearance-none cursor-pointer outline-none"
          required={registerRole === "clerk"}
          >
            {hostelOptions.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
                className="py-2 bg-slate-800 text-white"
              >
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
        </div>
      </div>

      <div>
        <label className="block mb-2 text-sm font-semibold text-white">
          Clerk Secret Code <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <KeyRound className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={registerData.clerkCode}
            onChange={(e) =>
              setRegisterData({
                ...registerData,
                clerkCode: e.target.value,
              })
            }
            className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:bg-white/15 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all outline-none"
            placeholder="Enter clerk secret code"
            required={registerRole === "clerk"}
          />
        </div>
      </div>
    </>
                  )}

                  <div>
                    <label className="block mb-2 text-sm font-semibold text-white">
                      Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={registerData.password}
                        onChange={(e) =>
                          setRegisterData({
                            ...registerData,
                            password: e.target.value,
                          })
                        }
                        className="w-full pl-12 pr-12 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:bg-white/15 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all outline-none"
                        placeholder="••••••••"
                        minLength="6"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Minimum 6 characters
                    </p>
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-semibold text-white">
                      Confirm Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={registerData.confirmPassword}
                        onChange={(e) =>
                          setRegisterData({
                            ...registerData,
                            confirmPassword: e.target.value,
                          })
                        }
                        className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:bg-white/15 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all outline-none"
                        placeholder="••••••••"
                        required
                      />
                    </div>
                  </div>
                </div>

            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 text-red-700 text-sm">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white rounded-xl font-semibold transition-all transform hover:scale-[1.02] shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creating Account...
                </span>
              ) : (
                "Create Account"
              )}
            </button>

            <div className="text-center mt-4">
              <button
                type="button"
                onClick={() => {
                  setShowRegister(false);
                  setError("");
                }}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline"
              >
                Already have an account? Sign In
              </button>
            </div>
          </form>
          )}
        </div>
      </div>
    );
  }

  // Login View
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-950 relative overflow-hidden">
      {/* Animated background blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      
      <div className="bg-slate-900/50 backdrop-blur-2xl rounded-3xl w-full max-w-md p-10 relative z-10 border border-white/10 shadow-2xl">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-cyan-500 via-blue-500 to-purple-600 rounded-3xl mb-6 shadow-2xl shadow-blue-500/30">
            <Lock className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-4xl font-bold text-white mb-3 tracking-tight">
            Welcome Back
          </h2>
          <p className="text-slate-300 text-base">Sign in to access your dashboard</p>
        </div>
        
        
        <div className="mb-6">
          <label className="block mb-3 text-sm font-semibold text-white">
            Login As
          </label>
          <select
            value={loginRole}
            onChange={(e) => setLoginRole(e.target.value)}
            className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white outline-none"
          >
            <option value="student" className="bg-slate-800">Student</option>
            <option value="munshi" className="bg-slate-800">Munshi</option>
            <option value="clerk" className="bg-slate-800">Clerk</option>
          </select>
        </div>

       
        <form onSubmit={handleLogin}>
          <div className="mb-6">
            <label className="block mb-3 text-sm font-semibold text-white">
              College Email Address
            </label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-cyan-400 transition-colors" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-slate-400 focus:bg-white/10 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all outline-none"
                placeholder="you@nitj.ac.in"
                required
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block mb-3 text-sm font-semibold text-white">
              Password
            </label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-cyan-400 transition-colors" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-12 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-slate-400 focus:bg-white/10 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all outline-none"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-cyan-400 transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          <div className="flex justify-end mb-8">
            <button
              type="button"
              onClick={() => setShowForgotPassword(true)}
              className="text-sm text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
            >
              Forgot Password?
            </button>
          </div>

          {/* Success Message Display */}
          {successMessage && (
            <div className="mb-5 p-4 bg-emerald-500/10 border border-emerald-400/30 rounded-2xl flex items-center gap-3 text-emerald-300 text-sm backdrop-blur-sm">
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {error && (
            <div className="mb-5 p-4 bg-red-500/10 border border-red-400/30 rounded-2xl flex items-center gap-3 text-red-300 text-sm backdrop-blur-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 hover:from-cyan-400 hover:via-blue-400 hover:to-purple-500 text-white rounded-2xl font-bold text-lg transition-all transform hover:scale-[1.02] hover:shadow-2xl hover:shadow-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Signing In...
              </span>
            ) : (
              "Sign In"
            )}
          </button>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-slate-900/50 text-slate-400">
                New to NITJ Mess?
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setShowRegister(true);
              setError("");
            }}
            className="w-full py-4 bg-white/5 border-2 border-white/20 text-white hover:bg-white/10 hover:border-cyan-400/50 rounded-2xl font-semibold transition-all transform hover:scale-[1.02] hover:shadow-lg"
          >
            Create New Account
          </button>
        </form>
      </div>

      <style>{`
        .bg-grid-pattern {
          background-image: 
            linear-gradient(to right, #e5e7eb 1px, transparent 1px),
            linear-gradient(to bottom, #e5e7eb 1px, transparent 1px);
          background-size: 20px 20px;
        }
        
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }

        select option {
          padding: 12px;
        }

        select:focus option:checked {
          background: linear-gradient(to right, #3b82f6, #10b981);
          color: white;
        }
      `}</style>
    </div>
  );
}
