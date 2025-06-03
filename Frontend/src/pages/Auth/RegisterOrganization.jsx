import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Logo from "../../assets/logo.png";
import { toast } from "react-toastify";

const RegisterOrganization = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    organizationName: "",
    domain: "",
    adminEmail: "",
    adminPassword: "",
    adminConfirmPassword: "",
    industry: "",
    size: "",
    plan: "free"
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.organizationName) {
      newErrors.organizationName = "Organization name is required";
    }
    if (!formData.domain) {
      newErrors.domain = "Domain is required";
    } else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(formData.domain)) {
      newErrors.domain = "Domain must contain only lowercase letters, numbers, and hyphens";
    }
    if (!formData.adminEmail) {
      newErrors.adminEmail = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.adminEmail)) {
      newErrors.adminEmail = "Email is invalid";
    }
    if (!formData.adminPassword) {
      newErrors.adminPassword = "Password is required";
    } else if (formData.adminPassword.length < 8) {
      newErrors.adminPassword = "Password must be at least 8 characters";
    }
    if (formData.adminPassword !== formData.adminConfirmPassword) {
      newErrors.adminConfirmPassword = "Passwords do not match";
    }
    if (!formData.industry) {
      newErrors.industry = "Industry is required";
    }
    if (!formData.size) {
      newErrors.size = "Organization size is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const response = await axios.post("/api/organizations/register", formData);
      toast.success("Organization registered successfully!");
      // Save the token and redirect to dashboard
      localStorage.setItem("token", response.data.token);
      navigate("/admin-dashboard");
    } catch (error) {
      const message = error.response?.data?.error || "Registration failed. Please try again.";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-50 via-blue-100 to-purple-100 px-4">
      <div className="max-w-xl w-full mx-auto bg-white rounded-2xl shadow-2xl p-8 space-y-6">
        <div className="text-center">
          <img src={Logo} alt="Logo" className="w-20 h-20 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-800">Register Organization</h1>
          <p className="text-gray-600 mt-2">Create your organization account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Organization Name</label>
            <input
              type="text"
              name="organizationName"
              value={formData.organizationName}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter organization name"
            />
            {errors.organizationName && (
              <p className="mt-1 text-sm text-red-600">{errors.organizationName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Domain</label>
            <div className="mt-1 flex rounded-md shadow-sm">
              <input
                type="text"
                name="domain"
                value={formData.domain}
                onChange={handleChange}
                className="flex-1 block w-full px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="your-domain"
              />
              <span className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 bg-gray-50 text-gray-500 rounded-r-md">
                .yourdomain.com
              </span>
            </div>
            {errors.domain && (
              <p className="mt-1 text-sm text-red-600">{errors.domain}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Admin Email</label>
            <input
              type="email"
              name="adminEmail"
              value={formData.adminEmail}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="admin@example.com"
            />
            {errors.adminEmail && (
              <p className="mt-1 text-sm text-red-600">{errors.adminEmail}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              name="adminPassword"
              value={formData.adminPassword}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Create a strong password"
            />
            {errors.adminPassword && (
              <p className="mt-1 text-sm text-red-600">{errors.adminPassword}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
            <input
              type="password"
              name="adminConfirmPassword"
              value={formData.adminConfirmPassword}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Confirm your password"
            />
            {errors.adminConfirmPassword && (
              <p className="mt-1 text-sm text-red-600">{errors.adminConfirmPassword}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Industry</label>
            <select
              name="industry"
              value={formData.industry}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select Industry</option>
              <option value="technology">Technology</option>
              <option value="healthcare">Healthcare</option>
              <option value="education">Education</option>
              <option value="manufacturing">Manufacturing</option>
              <option value="retail">Retail</option>
              <option value="other">Other</option>
            </select>
            {errors.industry && (
              <p className="mt-1 text-sm text-red-600">{errors.industry}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Organization Size</label>
            <select
              name="size"
              value={formData.size}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select Size</option>
              <option value="1-10">1-10 employees</option>
              <option value="11-50">11-50 employees</option>
              <option value="51-200">51-200 employees</option>
              <option value="201-500">201-500 employees</option>
              <option value="501+">501+ employees</option>
            </select>
            {errors.size && (
              <p className="mt-1 text-sm text-red-600">{errors.size}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Subscription Plan</label>
            <select
              name="plan"
              value={formData.plan}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="free">Free Plan</option>
              <option value="starter">Starter Plan</option>
              <option value="professional">Professional Plan</option>
              <option value="enterprise">Enterprise Plan</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
              isLoading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
          >
            {isLoading ? 'Registering...' : 'Register Organization'}
          </button>
        </form>

        <div className="text-center text-sm">
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="text-blue-600 hover:text-blue-500"
          >
            ← Back to Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegisterOrganization;