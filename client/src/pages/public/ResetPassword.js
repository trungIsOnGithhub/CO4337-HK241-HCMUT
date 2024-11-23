import React, {useState} from 'react'
import { Button } from '../../components'
import { useNavigate, useParams } from 'react-router-dom'
import { apiResetPassword } from '../../apis/user'
import { toast } from 'react-toastify'
import path from 'ultils/path'
import { FaArrowLeft, FaEye, FaEyeSlash } from "react-icons/fa";
import { ImSpinner8 } from "react-icons/im";

const ResetPassword = () => {
  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: ""
  });
  const [errors, setErrors] = useState({
    newPassword: "",
    confirmPassword: ""
  });
  const [showPassword, setShowPassword] = useState({
    new: false,
    confirm: false
  });
  const [loading, setLoading] = useState(false);

  const {token} = useParams()
  const navigate = useNavigate()

  const validatePassword = (password) => {
    const conditions = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*]/.test(password)
    };
    return conditions;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === "newPassword") {
      const validation = validatePassword(value);
      const newErrors = [];
      if (!validation.length) newErrors.push("Password must be at least 8 characters long");
      if (!validation.uppercase) newErrors.push("Include at least one uppercase letter");
      if (!validation.lowercase) newErrors.push("Include at least one lowercase letter");
      if (!validation.number) newErrors.push("Include at least one number");

      setErrors(prev => ({
        ...prev,
        newPassword: newErrors.join(", ")
      }));
    }

    if (name === "confirmPassword") {
      setErrors(prev => ({
        ...prev,
        confirmPassword: value !== formData.newPassword ? "Passwords do not match" : ""
      }));
    }
  };


  const handleResetPassword = async(e) => {
    e.preventDefault();
    if (errors.newPassword || errors.confirmPassword) return;

    setLoading(true);
    const response = await apiResetPassword({password: formData.newPassword, token})
    setLoading(false);
    if(response.success){
      toast.success("Password reset successful!", {theme:"colored"})
      setFormData({ newPassword: "", confirmPassword: "" });
    }
    else{
      toast.info("An error occurred. Please try again.", {theme: "colored"})
    }
  }

  const handleBackToLogin = () => {
    navigate(`/${path.LOGIN}`)
  }
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 transition-transform transform hover:scale-[1.02]">
        <div className="flex items-center mb-6">
          <button
            onClick={handleBackToLogin}
            className="flex items-center text-[#0a66c2] hover:text-[#084e96] transition-colors duration-200"
            aria-label="Back to Login"
          >
            <FaArrowLeft className="mr-2" />
            <span className="text-sm font-medium">Back to Login</span>
          </button>
        </div>
        
        <h2 className="text-3xl font-bold text-center mb-8 text-[#0a66c2]">Reset Password</h2>
        
        <form onSubmit={handleResetPassword} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label 
                htmlFor="newPassword" 
                className="block text-sm font-medium text-gray-700 mb-1"
                aria-label="New Password"
              >
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword.new ? "text" : "password"}
                  id="newPassword"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 rounded-lg border ${errors.newPassword ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-[#0a66c2] transition-all duration-200`}
                  aria-invalid={errors.newPassword ? "true" : "false"}
                  aria-describedby="newPassword-error"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(prev => ({ ...prev, new: !prev.new }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  aria-label={showPassword.new ? "Hide password" : "Show password"}
                >
                  {showPassword.new ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {errors.newPassword && (
                <p id="newPassword-error" className="mt-1 text-sm text-red-600" role="alert">
                  {errors.newPassword}
                </p>
              )}
            </div>

            <div>
              <label 
                htmlFor="confirmPassword" 
                className="block text-sm font-medium text-gray-700 mb-1"
                aria-label="Confirm Password"
              >
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showPassword.confirm ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 rounded-lg border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-[#0a66c2] transition-all duration-200`}
                  aria-invalid={errors.confirmPassword ? "true" : "false"}
                  aria-describedby="confirmPassword-error"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(prev => ({ ...prev, confirm: !prev.confirm }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  aria-label={showPassword.confirm ? "Hide password" : "Show password"}
                >
                  {showPassword.confirm ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p id="confirmPassword-error" className="mt-1 text-sm text-red-600" role="alert">
                  {errors.confirmPassword}
                </p>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || errors.newPassword || errors.confirmPassword}
            className="w-full bg-[#0a66c2] text-white py-3 px-6 rounded-lg font-semibold transition-all duration-200 hover:bg-[#084e96] focus:outline-none focus:ring-2 focus:ring-[#0a66c2] focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <ImSpinner8 className="animate-spin" />
                <span>Resetting...</span>
              </>
            ) : (
              <span>Reset Password</span>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}

export default ResetPassword