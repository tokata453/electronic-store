import { useState } from "react";
import { useNavigate, Link } from "react-router-dom"; 
import { FcGoogle } from "react-icons/fc";
import { FaFacebook } from "react-icons/fa";
import { FiEye, FiEyeOff, FiAlertCircle } from "react-icons/fi";
import { authService } from "@/services/authentication"; 
import { toast } from "react-hot-toast";

export default function Register() {
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState(null);
  const [touched, setTouched] = useState({});
  
  const [apiError, setApiError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Helper functions for validation
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const hasNumbers = (string) => /\d/.test(string);

  // Password strength calculator (Fixed Levels)
  const calculateStrength = (pass) => {
    if (!pass) return { level: 0, text: "", color: "bg-transparent", textColor: "" };
    
    let score = 0;
    if (pass.length >= 8) score += 1; // 1
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score += 1; // 2
    if (/\d/.test(pass)) score += 1; // 3
    if (/[^A-Za-z0-9]/.test(pass)) score += 1; // 4

    // Map the raw score (0-4) to visual levels (1-3)
    if (score <= 2) return { level: 1, text: "Weak", color: "bg-[#d32f2f]", textColor: "text-[#d32f2f]" };
    if (score === 3) return { level: 2, text: "Medium", color: "bg-yellow-500", textColor: "text-yellow-600" };
    return { level: 3, text: "Strong", color: "bg-green-500", textColor: "text-green-600" };
  };

  const strength = calculateStrength(form.password);

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleBlur = (name) => {
    setFocused(null);
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  const errors = {
    firstName: touched.firstName && !form.firstName 
        ? "Please input your first name" 
        : touched.firstName && hasNumbers(form.firstName) 
        ? "First name cannot contain numbers" 
        : "",
    lastName: touched.lastName && !form.lastName 
        ? "Please input your last name" 
        : touched.lastName && hasNumbers(form.lastName) 
        ? "Last name cannot contain numbers" 
        : "",
    email: touched.email && !form.email 
        ? "Please input your email" 
        : touched.email && !emailRegex.test(form.email) 
        ? "Please enter a valid email address" 
        : "",
    password: touched.password && !form.password
        ? "Please input your password"
        : touched.password && form.password.length < 8
        ? "Password must have at least 8 characters"
        : "",
  };

  const inputClass = (name) => {
    const hasError = !!errors[name];
    const isFocused = focused === name;
    return `w-full px-4 h-12 rounded-lg text-[15px] text-[#191c1d] border outline-none transition-all duration-200 placeholder:text-[#191c1d]/40 ${
      hasError
        ? "border-[#ffcdd2] bg-[#ffebee]"
        : isFocused
        ? "border-[#003d9b]/30 bg-white shadow-[0_0_0_4px_rgba(0,61,155,0.05)]"
        : "border-transparent bg-[#f3f4f5]"
    }`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError("");
    
    // Mark all fields as touched so UI errors show up
    setTouched({ firstName: true, lastName: true, email: true, password: true });

    // 1. Check for empty fields
    if (!form.firstName || !form.lastName || !form.email || !form.password) {
      setApiError("Please fill out all fields.");
      return;
    }

    // 2. Check for numbers in names
    if (hasNumbers(form.firstName) || hasNumbers(form.lastName)) {
      setApiError("Names cannot contain numbers.");
      return;
    }

    // 3. Strict Email Validation
    if (!emailRegex.test(form.email)) {
      setApiError("Please enter a valid email address.");
      return;
    }

    // 4. Strict Password Validation
    if (form.password.length < 8) {
      setApiError("Password must have at least 8 characters.");
      return;
    }

    setIsLoading(true);

    try {
      const userData = {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        password: form.password,
        phone: "+855000000000" 
      };

      const result = await authService.register(userData);

      if (result.success) {
        localStorage.setItem("token", result.data.token);
        localStorage.setItem("user", JSON.stringify(result.data.user));
        toast.success("Account created successfully!");
        navigate("/");
      } else {
        setApiError(result.message || "Registration failed. Please try again.");
      }
    } catch (err) {
      toast.error("Registration failed.");
      setApiError("Failed to connect to the server.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[85vh] bg-[#f8f9fa] p-5 font-sans w-full">
      <div className="bg-white rounded-2xl shadow-[0_20px_40px_rgba(25,28,29,0.06)] p-10 w-full max-w-lg">

        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[#003d9b] tracking-tight mb-2">Create an Account</h1>
          <p className="text-[#191c1d]/60 text-sm">Please sign up below to join the gallery.</p>
        </div>

        {apiError && (
          <div className="mb-5 p-3 rounded-lg bg-[#ffebee] border border-[#ffcdd2] text-[#d32f2f] text-sm text-center font-medium">
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          
          <div className="flex gap-4 mb-5">
            <div className="flex-1">
              <label className="block text-sm font-medium text-[#191c1d] mb-1.5">
                First Name <span className="text-[#d32f2f]">*</span>
              </label>
              <div className="relative">
                <input
                  name="firstName"
                  value={form.firstName}
                  onChange={handle}
                  onFocus={() => setFocused("firstName")}
                  onBlur={() => handleBlur("firstName")}
                  placeholder="Enter first name"
                  disabled={isLoading}
                  className={`${inputClass("firstName")} ${errors.firstName ? "pr-10" : ""}`}
                />
                {errors.firstName && (
                  <FiAlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 text-[#d32f2f]" size={18} />
                )}
              </div>
              {errors.firstName && (
                <p className="text-[#d32f2f] text-xs mt-1.5 font-medium">{errors.firstName}</p>
              )}
            </div>
            
            <div className="flex-1">
              <label className="block text-sm font-medium text-[#191c1d] mb-1.5">
                Last Name <span className="text-[#d32f2f]">*</span>
              </label>
              <div className="relative">
                <input
                  name="lastName"
                  value={form.lastName}
                  onChange={handle}
                  onFocus={() => setFocused("lastName")}
                  onBlur={() => handleBlur("lastName")}
                  placeholder="Enter last name"
                  disabled={isLoading}
                  className={`${inputClass("lastName")} ${errors.lastName ? "pr-10" : ""}`}
                />
                {errors.lastName && (
                  <FiAlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 text-[#d32f2f]" size={18} />
                )}
              </div>
              {errors.lastName && (
                <p className="text-[#d32f2f] text-xs mt-1.5 font-medium">{errors.lastName}</p>
              )}
            </div>
          </div>

          <div className="mb-5">
            <label className="block text-sm font-medium text-[#191c1d] mb-1.5">
              Email <span className="text-[#d32f2f]">*</span>
            </label>
            <div className="relative">
              <input
                name="email"
                type="text"
                value={form.email}
                onChange={handle}
                onFocus={() => setFocused("email")}
                onBlur={() => handleBlur("email")}
                placeholder="name@example.com"
                disabled={isLoading}
                className={`${inputClass("email")} ${errors.email ? "pr-10" : ""}`}
              />
              {errors.email && (
                <FiAlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 text-[#d32f2f]" size={18} />
              )}
            </div>
            {errors.email && (
              <p className="text-[#d32f2f] text-xs mt-1.5 font-medium">{errors.email}</p>
            )}
          </div>

          <div className="mb-5">
            <label className="block text-sm font-medium text-[#191c1d] mb-1.5">
              Password <span className="text-[#d32f2f]">*</span>
            </label>
            <div className="relative">
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={handle}
                onFocus={() => setFocused("password")}
                onBlur={() => handleBlur("password")}
                placeholder="••••••••"
                disabled={isLoading}
                className={`${inputClass("password")} ${errors.password ? "pr-16" : "pr-12"}`}
              />
              {errors.password && (
                <FiAlertCircle className="absolute right-10 top-1/2 -translate-y-1/2 text-[#d32f2f]" size={18} />
              )}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#191c1d]/40 hover:text-[#191c1d]/80 transition-colors"
              >
                {showPassword ? <FiEye size={20} /> : <FiEyeOff size={20} />}
              </button>
            </div>
            
            {/* Password Strength Indicator */}
            {form.password && (
              <div className="mt-2 flex items-center gap-2">
                <div className="flex-1 flex gap-1 h-1.5">
                  {/* Changed strength.score to strength.level here */}
                  <div className={`flex-1 rounded-full ${strength.level >= 1 ? strength.color : 'bg-gray-200'}`}></div>
                  <div className={`flex-1 rounded-full ${strength.level >= 2 ? strength.color : 'bg-gray-200'}`}></div>
                  <div className={`flex-1 rounded-full ${strength.level >= 3 ? strength.color : 'bg-gray-200'}`}></div>
                </div>
                <span className={`text-[11px] font-semibold ${strength.textColor} w-12 text-right`}>
                  {strength.text}
                </span>
              </div>
            )}
            
            {errors.password && (
              <p className="text-[#d32f2f] text-xs mt-1.5 font-medium">{errors.password}</p>
            )}
          </div>

          <p className="text-[13px] text-[#191c1d]/60 mb-6 leading-relaxed">
            By signing up I agree to the {" "}
            <a href="/help?tab=privacy" className="text-[#003d9b] font-medium hover:underline">Privacy Policy</a>{" "}
            and{" "}
            <a href="/help?tab=terms" className="text-[#003d9b] font-medium hover:underline">Terms & Conditions</a>
          </p>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full h-12 rounded-lg bg-[#003d9b] hover:bg-[#003d9b]/90 text-white font-medium text-[15px] shadow-[0_10px_20px_rgba(0,61,155,0.15)] transition-all mb-6 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-[#191c1d]/10" />
          </div>
          <div className="relative flex justify-center text-[10px] font-bold tracking-[0.05em] uppercase">
            <span className="bg-white px-4 text-[#191c1d]/40">
              Or sign up with
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <button 
            type="button" 
            onClick={() => authService.loginWithGoogle()}
            disabled={isLoading}
            className="h-11 flex items-center justify-center bg-transparent border border-[#191c1d]/15 hover:bg-[#f3f4f5] text-[#191c1d] text-[15px] font-medium rounded-lg transition-all disabled:opacity-50"
          >
            <FcGoogle size={18} className="mr-2" /> Google
          </button>
          <button 
            type="button"
            onClick={() => authService.loginWithFacebook()}
            disabled={isLoading} 
            className="h-11 flex items-center justify-center bg-transparent border border-[#191c1d]/15 hover:bg-[#f3f4f5] text-[#191c1d] text-[15px] font-medium rounded-lg transition-all disabled:opacity-50"
          >
            <FaFacebook size={18} className="text-[#1877F2] mr-2" /> Facebook
          </button>
        </div>

        <p className="text-center text-sm text-[#191c1d]/60">
          Already have an account?{" "}
          <Link to="/login" className="text-[#003d9b] font-semibold hover:underline">Login</Link>
        </p>

      </div>
    </div>
  );
}