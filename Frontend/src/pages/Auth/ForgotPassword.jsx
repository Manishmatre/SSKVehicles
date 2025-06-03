import React, { useState } from "react";
import Logo from "../../assets/logo.png";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!currentPassword) {
      setError("Current password is required.");
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setError("New password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }
    setIsLoading(true);
    try {
      await axios.put("http://localhost:7000/api/auth/update-password", { 
        email,
        currentPassword,
        newPassword 
      });
      setSuccess("Password has been successfully updated.");
      setTimeout(() => {
        navigate('/login');
      }, 1000);
    } catch (err) {
      setError(
        err.response?.data?.error ||
          "Something went wrong. Please try again later."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-50 via-blue-100 to-purple-100 px-2">
      <div className="max-w-md w-full mx-auto bg-white/90 rounded-2xl shadow-2xl p-8 md:p-10 flex flex-col items-center border border-blue-100">
        <img src={Logo} alt="SSK Vehicles Logo" className="w-24 h-24 mb-4 rounded-full shadow-lg bg-white border-2 border-blue-100 object-contain" />
        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-800 mb-2 tracking-tight text-center">
          Forgot Password
        </h1>
        <p className="text-gray-500 text-center mb-6 font-medium">
          Enter your email and passwords to update your account
        </p>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 w-full text-center">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 w-full text-center">
            {success}
          </div>
        )}
        <form onSubmit={handleSubmit} className="w-full space-y-4">
          <div>
            <label htmlFor="email" className="block text-gray-700 font-semibold mb-1">Email</label>
            <input
              className="border border-gray-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 w-full p-3 rounded-lg text-gray-800 font-medium transition-all duration-200 outline-none bg-blue-50/60"
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@email.com"
              autoComplete="email"
            />
          </div>
          <div>
            <label htmlFor="currentPassword" className="block text-gray-700 font-semibold mb-1">Current Password</label>
            <input
              className="border border-gray-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 w-full p-3 rounded-lg text-gray-800 font-medium transition-all duration-200 outline-none bg-blue-50/60"
              type="password"
              id="currentPassword"
              name="currentPassword"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              placeholder="Enter current password"
              autoComplete="current-password"
            />
          </div>
          <div>
            <label htmlFor="newPassword" className="block text-gray-700 font-semibold mb-1">New Password</label>
            <input
              className="border border-gray-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 w-full p-3 rounded-lg text-gray-800 font-medium transition-all duration-200 outline-none bg-blue-50/60"
              type="password"
              id="newPassword"
              name="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              placeholder="Enter new password"
              autoComplete="new-password"
            />
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block text-gray-700 font-semibold mb-1">Confirm New Password</label>
            <input
              className="border border-gray-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 w-full p-3 rounded-lg text-gray-800 font-medium transition-all duration-200 outline-none bg-blue-50/60"
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="Confirm new password"
              autoComplete="new-password"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 rounded-lg text-white font-bold shadow transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 ${
              isLoading ? "bg-blue-300" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {isLoading ? "Updating..." : "Update Password"}
          </button>
        </form>
        <div className="flex justify-between items-center w-full mt-4 text-sm">
          <Link
            to="/login"
            className="text-blue-500 hover:text-blue-700 font-semibold underline"
          >
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
