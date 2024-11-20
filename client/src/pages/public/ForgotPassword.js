import { apiForgotPassword } from 'apis';
import React, { useState } from 'react'
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { toast } from 'react-toastify';
import path from 'ultils/path';

const commonDomains = ["gmail.com", "yahoo.com", "hotmail.com", "outlook.com"];
const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [suggestions, setSuggestions] = useState([]);

    const validateEmail = (email) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    };

    const handleEmailChange = (e) => {
        const value = e.target.value;
        setEmail(value);
        setError("");

        if (value.includes("@")) {
        const [prefix] = value.split("@");
        const filteredDomains = commonDomains.map(
            (domain) => `${prefix}@${domain}`
        );
        setSuggestions(filteredDomains);
        } else {
        setSuggestions([]);
        }
    };
  
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email) {
          setError("Email is required");
          return;
        }
        if (!validateEmail(email)) {
          setError("Please enter a valid email address");
          return;
        }
        
        setLoading(true);
        const response = await apiForgotPassword({email})
        setLoading(false);
        if(response.success){
            toast.success(response.mes, {theme:"colored"})
        }
        else{
            toast.info(response.mes, {theme: "colored"})
        }
      };
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100 p-4 animate-slide-right">
      <div className="max-w-md w-full bg-white rounded-xl shadow-2xl p-8 transform transition-all hover:scale-[1.01]">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#0a66c2] mb-2">Forgot Password?</h1>
          <p className="text-gray-600">
            Enter your email address to reset your password
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={handleEmailChange}
              className={`w-full px-4 py-3 rounded-lg border ${error ? "border-red-500" : "border-gray-300"} focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none`}
              placeholder="Enter your email address"
              aria-label="Email address input field"
              aria-invalid={error ? "true" : "false"}
              aria-describedby={error ? "email-error" : undefined}
            />
            {suggestions.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    type="button"
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 focus:bg-gray-100 outline-none"
                    onClick={() => {
                      setEmail(suggestion);
                      setSuggestions([]);
                    }}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
            {error && (
              <p
                id="email-error"
                className="mt-2 text-sm text-red-600"
                role="alert"
              >
                {error}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-all disabled:opacity-70 flex items-center justify-center space-x-2"
            aria-label="Reset password button"
          >
            {loading && (
              <AiOutlineLoading3Quarters className="animate-spin h-5 w-5" />
            )}
            <span>{loading ? "Sending Instructions..." : "Reset Password"}</span>
          </button>

          <div className="text-center">
            <a
              href={`/${path.LOGIN}`}
              className="text-sm text-blue-600 hover:text-blue-800 focus:outline-none focus:underline"
            >
              Back to Login
            </a>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ForgotPassword