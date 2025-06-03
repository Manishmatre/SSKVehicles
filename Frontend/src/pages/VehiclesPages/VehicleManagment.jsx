import React, { useState, useEffect } from "react";
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaCar, FaWrench, FaTimes, FaCheck, FaSearch, FaFilter, FaExclamationTriangle, FaTools, FaEye, FaHistory, FaTrash, FaShieldAlt, FaGasPump, FaChartBar, FaList, FaHome, FaSync } from "react-icons/fa";

const VehicleManagment = () => {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    maintenance: 0,
    inactive: 0,
    insuranceExpiring: 0,
    maintenanceDue: 0
  });

  // Fetch vehicles from database
  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken'); // Updated to use accessToken instead of token
      
      if (!token) {
        console.error('No access token found');
        setError('Authentication required');
        toast.error('❌ Authentication required. Please log in.');
        setLoading(false);
        navigate('/login');
        return;
      }
      
      console.log('Making API request with token:', token.substring(0, 10) + '...');
      const response = await axios.get('http://localhost:7000/api/vehicles', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setVehicles(response.data.data);
      toast.success('✅ Vehicles loaded successfully!', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });
    } catch (err) {
      setError(err.message);
      toast.error('❌ Failed to load vehicles. Please try again.', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });
    } finally {
      setLoading(false);
    }
  };

  // Delete vehicle
  const handleDeleteVehicle = async (id) => {
    if (window.confirm("Are you sure you want to delete this vehicle?")) {
      try {
        const token = localStorage.getItem('token');
        
        if (!token) {
          toast.error('❌ Authentication required. Please log in.');
          navigate('/login');
          return;
        }
        
        await axios.delete(`http://localhost:7000/api/vehicles/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        setVehicles(vehicles.filter(vehicle => vehicle._id !== id));
        toast.success('✅ Vehicle deleted successfully!', {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "colored",
        });
      } catch (err) {
        toast.error('❌ Failed to delete vehicle. Please try again.', {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "colored",
        });
      }
    }
  };

  // Calculate stats when vehicles data changes
  useEffect(() => {
    if (vehicles.length > 0) {
      const today = new Date();
      const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

      const newStats = {
        total: vehicles.length,
        active: vehicles.filter(v => v.status === 'Active').length,
        maintenance: vehicles.filter(v => v.status === 'Under Maintenance').length,
        inactive: vehicles.filter(v => v.status === 'Inactive').length,
        insuranceExpiring: vehicles.filter(v => {
          if (!v.insuranceExpireDate) return false;
          const expiryDate = new Date(v.insuranceExpireDate);
          return expiryDate <= thirtyDaysFromNow && expiryDate >= today;
        }).length,
        maintenanceDue: vehicles.filter(v => {
          if (!v.nextMaintenance) return false;
          const maintenanceDate = new Date(v.nextMaintenance);
          return maintenanceDate <= thirtyDaysFromNow && maintenanceDate >= today;
        }).length
      };

      setStats(newStats);
    }
  }, [vehicles]);

  // Fetch vehicles on component mount
  useEffect(() => {
    fetchVehicles();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const getDaysUntil = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = date - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  if (loading) {
    return (
      <div className="w-screen h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-screen h-screen flex items-center justify-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
      <Header />
      <div className="flex w-screen h-full pt-15">
        <Sidebar />
        <div className="w-full h-full overflow-y-scroll bg-gray-50 p-5">
          {/* Page Header */}
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Vehicle Management Dashboard</h1>
                <p className="text-gray-600 mt-1">Manage your fleet efficiently</p>
              </div>
              <div className="flex items-center gap-4">
                <Link
                  to="/vehicles-dashboard"
                  className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
                >
                  <FaHome className="text-lg" />
                  <span>Dashboard</span>
                </Link>
                <Link
                  to="/vehicles-dashboard"
                  className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
                >
                  <FaSync className="text-lg" />
                  <span>Refresh</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-full">
                  <FaCar className="text-blue-600 text-xl" />
                </div>
                <div className="ml-4">
                  <p className="text-gray-500">Total Vehicles</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-full">
                  <FaCheck className="text-green-600 text-xl" />
                </div>
                <div className="ml-4">
                  <p className="text-gray-500">Active Vehicles</p>
                  <p className="text-2xl font-bold">{stats.active}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="flex items-center">
                <div className="p-3 bg-yellow-100 rounded-full">
                  <FaWrench className="text-yellow-600 text-xl" />
                </div>
                <div className="ml-4">
                  <p className="text-gray-500">Under Maintenance</p>
                  <p className="text-2xl font-bold">{stats.maintenance}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="flex items-center">
                <div className="p-3 bg-red-100 rounded-full">
                  <FaTimes className="text-red-600 text-xl" />
                </div>
                <div className="ml-4">
                  <p className="text-gray-500">Inactive Vehicles</p>
                  <p className="text-2xl font-bold">{stats.inactive}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="flex items-center">
                <div className="p-3 bg-orange-100 rounded-full">
                  <FaExclamationTriangle className="text-orange-600 text-xl" />
                </div>
                <div className="ml-4">
                  <p className="text-gray-500">Insurance Expiring Soon</p>
                  <p className="text-2xl font-bold">{stats.insuranceExpiring}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 rounded-full">
                  <FaTools className="text-purple-600 text-xl" />
                </div>
                <div className="ml-4">
                  <p className="text-gray-500">Maintenance Due Soon</p>
                  <p className="text-2xl font-bold">{stats.maintenanceDue}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="bg-white p-4 rounded-lg shadow mb-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <Link
                to="/add-vehicle"
                className="flex flex-col items-center justify-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <FaCar className="text-blue-600 text-2xl mb-2" />
                <span className="text-sm font-medium text-gray-700">Add Vehicle</span>
              </Link>
              <Link
                to="/vehicle-insurance"
                className="flex flex-col items-center justify-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
              >
                <FaShieldAlt className="text-green-600 text-2xl mb-2" />
                <span className="text-sm font-medium text-gray-700">Insurance</span>
              </Link>
              <Link
                to="/maintenance-schedule"
                className="flex flex-col items-center justify-center p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors"
              >
                <FaWrench className="text-yellow-600 text-2xl mb-2" />
                <span className="text-sm font-medium text-gray-700">Maintenance</span>
              </Link>
              <Link
                to="/fuel-consumption"
                className="flex flex-col items-center justify-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
              >
                <FaGasPump className="text-purple-600 text-2xl mb-2" />
                <span className="text-sm font-medium text-gray-700">Fuel</span>
              </Link>
              <Link
                to="/vehicle-reports"
                className="flex flex-col items-center justify-center p-4 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
              >
                <FaChartBar className="text-red-600 text-2xl mb-2" />
                <span className="text-sm font-medium text-gray-700">Reports</span>
              </Link>
              <Link
                to="/all-vehicles"
                className="flex flex-col items-center justify-center p-4 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
              >
                <FaList className="text-indigo-600 text-2xl mb-2" />
                <span className="text-sm font-medium text-gray-700">All Vehicles</span>
              </Link>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="bg-white p-4 rounded-lg shadow mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search vehicles..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="w-full md:w-48">
                <div className="relative">
                  <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="under maintenance">Under Maintenance</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Vehicles Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vehicle Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Insurance
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Maintenance
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {vehicles
                    .filter(vehicle => {
                      const matchesSearch = 
                        vehicle.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        vehicle.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        vehicle.type.toLowerCase().includes(searchTerm.toLowerCase());
                      
                      const matchesStatus = 
                        filterStatus === "all" || 
                        vehicle.status.toLowerCase() === filterStatus.toLowerCase();
                      
                      return matchesSearch && matchesStatus;
                    })
                    .map((vehicle) => (
                      <tr key={vehicle._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {vehicle.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {vehicle.type} • {vehicle.number}
                              </div>
                              <div className="text-sm text-gray-500">
                                {vehicle.make} {vehicle.model} ({vehicle.year})
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            vehicle.status === 'Active' ? 'bg-green-100 text-green-800' :
                            vehicle.status === 'Under Maintenance' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {vehicle.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {vehicle.insuranceProvider || 'N/A'}
                          </div>
                          <div className={`text-sm ${
                            vehicle.insuranceExpireDate ? 
                              (getDaysUntil(vehicle.insuranceExpireDate) <= 30 ? 
                                'text-red-600 font-semibold' : 
                                'text-gray-500') : 
                              'text-gray-500'
                          }`}>
                            {vehicle.insuranceExpireDate ? 
                              `Expires: ${formatDate(vehicle.insuranceExpireDate)} 
                              (${getDaysUntil(vehicle.insuranceExpireDate)} days)` : 
                              'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            Last: {formatDate(vehicle.lastMaintenance)}
                          </div>
                          <div className={`text-sm ${
                            vehicle.nextMaintenance ? 
                              (getDaysUntil(vehicle.nextMaintenance) <= 30 ? 
                                'text-red-600 font-semibold' : 
                                'text-gray-500') : 
                              'text-gray-500'
                          }`}>
                            Next: {formatDate(vehicle.nextMaintenance)}
                            {vehicle.nextMaintenance && 
                              ` (${getDaysUntil(vehicle.nextMaintenance)} days)`}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            {/* Replace the existing action buttons with this styled version */}
                            <td className="px-6 py-4">
                              <div className="flex items-center space-x-3">
                                <button
                                  onClick={() => navigate(`/vehicle-details/${vehicle._id}`)}
                                  className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors duration-200 flex items-center gap-2"
                                  title="View Details"
                                >
                                  <FaEye className="text-lg" />
                                  <span className="hidden md:inline text-sm">View</span>
                                </button>
                                
                                <button
                                  onClick={() => navigate(`/maintenance-history/${vehicle._id}`)}
                                  className="p-2 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200 transition-colors duration-200 flex items-center gap-2"
                                  title="Maintenance History"
                                >
                                  <FaHistory className="text-lg" />
                                  <span className="hidden md:inline text-sm">History</span>
                                </button>
                                
                                <button
                                  onClick={() => {
                                    if (window.confirm('Are you sure you want to delete this vehicle?')) {
                                      handleDeleteVehicle(vehicle._id);
                                    }
                                  }}
                                  className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors duration-200 flex items-center gap-2"
                                  title="Delete Vehicle"
                                >
                                  <FaTrash className="text-lg" />
                                  <span className="hidden md:inline text-sm">Delete</span>
                                </button>
                              </div>
                            </td>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleManagment;
