import React, { useState, useEffect, useRef } from "react";
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { FaCar, FaWrench, FaTimes, FaCheck, FaSearch, FaFilter, FaExclamationTriangle, FaTools, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AllVehicles = () => {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const vehiclesPerPage = 10;
  const initialLoad = useRef(true);

  // Fetch vehicles from backend
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const response = await axios.get('http://localhost:7000/api/vehicles');
        if (response.data.success) {
          setVehicles(response.data.data);
          if (initialLoad.current) {
            toast.success('🚗 Vehicles loaded successfully!', {
              position: "top-right",
              autoClose: 3000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
              theme: "colored",
            });
            initialLoad.current = false;
          }
        }
      } catch (err) {
        setError(err.response?.data?.error || "Failed to fetch vehicles");
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

    fetchVehicles();
  }, []);

  // Listen for vehicle updates
  useEffect(() => {
    const handleVehicleUpdate = (event) => {
      if (event.detail?.type === 'update') {
        // Refresh the vehicle list
        fetchVehicles();
      }
    };

    window.addEventListener('vehicleUpdate', handleVehicleUpdate);
    return () => window.removeEventListener('vehicleUpdate', handleVehicleUpdate);
  }, []);

  // Calculate stats with more detailed information
  const stats = {
    total: vehicles.length,
    active: vehicles.filter(v => v.status === 'Active').length,
    maintenance: vehicles.filter(v => v.status === 'Under Maintenance').length,
    inactive: vehicles.filter(v => v.status === 'Inactive').length,
    insuranceExpiring: vehicles.filter(v => {
      if (!v.insuranceExpireDate) return false;
      const expiryDate = new Date(v.insuranceExpireDate);
      const today = new Date();
      const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
      return daysUntilExpiry <= 30 && daysUntilExpiry >= 0;
    }).length,
    maintenanceDue: vehicles.filter(v => {
      if (!v.nextMaintenance) return false;
      const maintenanceDate = new Date(v.nextMaintenance);
      const today = new Date();
      const daysUntilMaintenance = Math.ceil((maintenanceDate - today) / (1000 * 60 * 60 * 24));
      return daysUntilMaintenance <= 30 && daysUntilMaintenance >= 0;
    }).length
  };

  // Sort vehicles by insurance expiry date (nearest first)
  const sortedVehicles = [...vehicles].sort((a, b) => {
    if (!a.insuranceExpireDate && !b.insuranceExpireDate) return 0;
    if (!a.insuranceExpireDate) return 1;
    if (!b.insuranceExpireDate) return -1;
    return new Date(a.insuranceExpireDate) - new Date(b.insuranceExpireDate);
  });

  // Filter vehicles based on search term and status filter
  const filteredVehicles = sortedVehicles.filter(vehicle => {
    const matchesSearch = 
      vehicle.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.type.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = 
      filterStatus === "all" || 
      vehicle.status.toLowerCase() === filterStatus.toLowerCase();
    
    return matchesSearch && matchesStatus;
  });

  // Calculate pagination
  const indexOfLastVehicle = currentPage * vehiclesPerPage;
  const indexOfFirstVehicle = indexOfLastVehicle - vehiclesPerPage;
  const currentVehicles = filteredVehicles.slice(indexOfFirstVehicle, indexOfLastVehicle);
  const totalPages = Math.ceil(filteredVehicles.length / vehiclesPerPage);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

  // Reset to first page when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus]);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this vehicle?")) {
      try {
        await axios.delete(`http://localhost:7000/api/vehicles/${id}`);
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
        setError(err.response?.data?.error || "Failed to delete vehicle");
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

  const handleStatusChange = async (id, newStatus) => {
    try {
      const response = await axios.put(`http://localhost:7000/api/vehicles/${id}`, {
        status: newStatus
      });
      
      if (response.data.success) {
        setVehicles(vehicles.map(vehicle => 
          vehicle._id === id ? { ...vehicle, status: newStatus } : vehicle
        ));
        toast.success(`✅ Vehicle status updated to ${newStatus}!`, {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "colored",
        });
      }
    } catch (err) {
      toast.error('❌ Failed to update vehicle status. Please try again.', {
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
          <div className="page-header flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-800">
              Vehicle Management
            </h1>
            <Link
              to="/add-vehicle"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Add New Vehicle
            </Link>
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
                  {currentVehicles.map((vehicle) => (
                    <tr key={vehicle._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div>
                            <Link
                              to={`/vehicle-details/${vehicle._id}`}
                              className="text-sm font-medium text-blue-600 hover:text-blue-800"
                            >
                              {vehicle.name}
                            </Link>
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
                            (new Date(vehicle.insuranceExpireDate) - new Date() <= 30 * 24 * 60 * 60 * 1000 ? 
                              'text-red-600 font-semibold' : 
                              'text-gray-500') : 
                            'text-gray-500'
                        }`}>
                          {vehicle.insuranceExpireDate ? 
                            `Expires: ${new Date(vehicle.insuranceExpireDate).toLocaleDateString()} 
                            (${Math.ceil((new Date(vehicle.insuranceExpireDate) - new Date()) / (1000 * 60 * 60 * 24))} days)` : 
                            'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          Last: {vehicle.lastMaintenance ? new Date(vehicle.lastMaintenance).toLocaleDateString() : 'N/A'}
                        </div>
                        <div className="text-sm text-gray-500">
                          Next: {vehicle.nextMaintenance ? new Date(vehicle.nextMaintenance).toLocaleDateString() : 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <Link
                            to={`/vehicle-details/${vehicle._id}`}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                          >
                            View Details
                          </Link>
                          <Link
                            to={`/edit-vehicle/${vehicle._id}`}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-colors"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => handleDelete(vehicle._id)}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={prevPage}
                  disabled={currentPage === 1}
                  className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                    currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Previous
                </button>
                <button
                  onClick={nextPage}
                  disabled={currentPage === totalPages}
                  className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                    currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{indexOfFirstVehicle + 1}</span> to{' '}
                    <span className="font-medium">
                      {Math.min(indexOfLastVehicle, filteredVehicles.length)}
                    </span>{' '}
                    of <span className="font-medium">{filteredVehicles.length}</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={prevPage}
                      disabled={currentPage === 1}
                      className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                        currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      <span className="sr-only">Previous</span>
                      <FaChevronLeft className="h-5 w-5" aria-hidden="true" />
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                      <button
                        key={number}
                        onClick={() => paginate(number)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          currentPage === number
                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {number}
                      </button>
                    ))}
                    <button
                      onClick={nextPage}
                      disabled={currentPage === totalPages}
                      className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                        currentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      <span className="sr-only">Next</span>
                      <FaChevronRight className="h-5 w-5" aria-hidden="true" />
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllVehicles;
