import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import axios from "axios";
import { toast } from "react-toastify";
import { FaPlus, FaEye, FaEdit, FaTrash } from "react-icons/fa";
import { FaCar } from "react-icons/fa";
import { FaExclamationTriangle ,FaChartBar } from "react-icons/fa";

const VehicleInsurance = () => {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVehicle, setSelectedVehicle] = useState("all");
  const [insuranceRecords, setInsuranceRecords] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    vehicleId: "",
    provider: "",
    policyNumber: "",
    startDate: "",
    endDate: "",
    premium: "",
    coverage: "",
    notes: ""
  });
  const [viewRecord, setViewRecord] = useState(null);

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const response = await axios.get("http://localhost:7000/api/vehicles");
        if (response.data.success) {
          setVehicles(response.data.data);
        } else {
          toast.error(response.data.error || "Failed to load vehicles");
        }
      } catch (err) {
        toast.error(err.response?.data?.error || "Failed to load vehicles");
      }
    };

    fetchVehicles();
  }, []);

  useEffect(() => {
    const fetchInsuranceRecords = async () => {
      try {
        setLoading(true);
        const response = await axios.get("http://localhost:7000/api/insurance-records");
        if (response.data.success) {
          setInsuranceRecords(response.data.data);
        } else {
          toast.error(response.data.error || "Failed to load insurance records");
        }
      } catch (err) {
        toast.error(err.response?.data?.error || "Failed to load insurance records");
      } finally {
        setLoading(false);
      }
    };

    fetchInsuranceRecords();
  }, []);

  const handleVehicleChange = (e) => {
    setSelectedVehicle(e.target.value);
  };

  const handleAddInsurance = () => {
    setShowAddForm(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.vehicleId || !formData.provider || !formData.policyNumber || !formData.startDate || !formData.endDate || !formData.premium) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      setLoading(true);

      const insuranceData = {
        vehicleId: formData.vehicleId,
        provider: formData.provider,
        policyNumber: formData.policyNumber,
        startDate: formData.startDate,
        endDate: formData.endDate,
        premium: parseFloat(formData.premium),
        coverage: formData.coverage,
        notes: formData.notes
      };

      const isUpdate = formData._id;
      const url = isUpdate 
        ? `http://localhost:7000/api/insurance-records/${formData._id}`
        : "http://localhost:7000/api/insurance-records";

      const method = isUpdate ? 'put' : 'post';

      const response = await axios[method](url, insuranceData);

      if (response.data.success) {
        toast.success(`Insurance record ${isUpdate ? 'updated' : 'added'} successfully`);
        setShowAddForm(false);
        setFormData({ vehicleId: "", provider: "", policyNumber: "", startDate: "", endDate: "", premium: "", coverage: "", notes: "" });

        const recordsResponse = await axios.get("http://localhost:7000/api/insurance-records");
        if (recordsResponse.data.success) {
          setInsuranceRecords(recordsResponse.data.data);
        }

        // Update vehicle insurance data
        const vehicleUpdateResponse = await axios.put(`http://localhost:7000/api/vehicles/${formData.vehicleId}/update-insurance`, { insuranceId: response.data.data._id });
        if (vehicleUpdateResponse.data.success) {
          toast.success("Vehicle insurance data updated successfully");
        } else {
          toast.error(vehicleUpdateResponse.data.error || "Failed to update vehicle insurance data");
        }
      } else {
        toast.error(response.data.error || `Failed to ${isUpdate ? 'update' : 'add'} insurance record`);
      }
    } catch (err) {
      toast.error(err.response?.data?.error || `Failed to ${formData._id ? 'update' : 'add'} insurance record`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRecord = async (id) => {
    if (window.confirm("Are you sure you want to delete this insurance record?")) {
      try {
        const response = await axios.delete(`http://localhost:7000/api/insurance-records/${id}`);
        if (response.data.success) {
          setInsuranceRecords(insuranceRecords.filter(record => record._id !== id));
          toast.success("Insurance record deleted successfully");
        } else {
          toast.error(response.data.error || "Failed to delete insurance record");
        }
      } catch (err) {
        toast.error(err.response?.data?.error || "Failed to delete insurance record");
      }
    }
  };

  const handleViewDetails = (record) => {
    setViewRecord(record);
  };

  const handleEditRecord = (record) => {
    setFormData({
      _id: record._id,
      vehicleId: record.vehicleId._id || record.vehicleId,
      provider: record.provider,
      policyNumber: record.policyNumber,
      startDate: new Date(record.startDate).toISOString().split('T')[0],
      endDate: new Date(record.endDate).toISOString().split('T')[0],
      premium: record.premium,
      coverage: record.coverage,
      notes: record.notes
    });
    setShowAddForm(true);
  };

  const formatDate = (dateString) => new Date(dateString).toLocaleDateString();
  const formatCurrency = (amount) => new Intl.NumberFormat('en-IN', { 
    style: 'currency', 
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);

  const filteredRecords = insuranceRecords.filter(record => selectedVehicle === "all" || record.vehicleId._id === selectedVehicle);

  const calculateStats = () => {
    const today = new Date();
    const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
  
    const totalPolicies = insuranceRecords.length;
    const nearExpiryPolicies = insuranceRecords.filter(record => {
      const expiryDate = new Date(record.endDate);
      return expiryDate <= thirtyDaysFromNow && expiryDate >= today;
    }).length;
  
    const totalPremium = insuranceRecords.reduce((sum, record) => sum + parseFloat(record.premium), 0);
    const averagePolicyDuration = insuranceRecords.reduce((sum, record) => {
      const start = new Date(record.startDate);
      const end = new Date(record.endDate);
      return sum + (end - start) / (1000 * 60 * 60 * 24);
    }, 0) / totalPolicies;
  
    return { totalPolicies, nearExpiryPolicies, totalPremium, averagePolicyDuration };
  };
  
  const stats = calculateStats();
  
  return (
    <div className="w-screen h-screen bg-gray-50">
      <Header />
      <div className="flex w-screen h-full pt-15">
        <Sidebar />
        <div className="w-full h-full overflow-y-scroll p-5">
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Vehicle Insurance Management</h1>
                <p className="text-gray-600 mt-1">Manage and track vehicle insurance policies</p>
              </div>
              <div className="flex items-center gap-4">
                <button onClick={handleAddInsurance} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2">
                  <FaPlus /> Add Insurance
                </button>
                <button onClick={() => navigate("/vehicles-dashboard")} className="text-blue-600 hover:text-blue-800">
                  Back to Vehicles
                </button>
              </div>
            </div>
          </div>
  
          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-full">
                  <FaCar className="text-blue-600 text-xl" />
                </div>
                <div className="ml-4">
                  <p className="text-gray-500">Total Policies</p>
                  <p className="text-2xl font-bold">{stats.totalPolicies}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="flex items-center">
                <div className="p-3 bg-orange-100 rounded-full">
                  <FaExclamationTriangle className="text-orange-600 text-xl" />
                </div>
                <div className="ml-4">
                  <p className="text-gray-500">Near Expiry Policies</p>
                  <p className="text-2xl font-bold">{stats.nearExpiryPolicies}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-full">
                  <FaChartBar className="text-green-600 text-xl" />
                </div>
                <div className="ml-4">
                  <p className="text-gray-500">Total Premium</p>
                  <p className="text-2xl font-bold">{formatCurrency(stats.totalPremium)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Vehicle Filter */}
          <div className="bg-white p-4 rounded-lg shadow mb-6">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-gray-700">Filter by Vehicle:</label>
              <select value={selectedVehicle} onChange={handleVehicleChange} className="border border-gray-300 rounded px-3 py-2">
                <option value="all">All Vehicles</option>
                {vehicles.map(vehicle => (
                  <option key={vehicle._id} value={vehicle._id}>
                    {vehicle.name || `${vehicle.make} ${vehicle.model} (${vehicle.number})`}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Add Insurance Form */}
          {showAddForm && (
            <div className="bg-white p-6 rounded-lg shadow mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Add New Insurance Record</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Vehicle</label>
                    <select name="vehicleId" value={formData.vehicleId} onChange={handleChange} className="w-full border border-gray-300 rounded px-3 py-2" required>
                      <option value="">Select a vehicle</option>
                      {vehicles.map(vehicle => (
                        <option key={vehicle._id} value={vehicle._id}>
                          {vehicle.name} ({vehicle.number})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Insurance Provider</label>
                    <input type="text" name="provider" value={formData.provider} onChange={handleChange} className="w-full border border-gray-300 rounded px-3 py-2" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Policy Number</label>
                    <input type="text" name="policyNumber" value={formData.policyNumber} onChange={handleChange} className="w-full border border-gray-300 rounded px-3 py-2" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Premium Amount</label>
                    <input type="number" name="premium" value={formData.premium} onChange={handleChange} className="w-full border border-gray-300 rounded px-3 py-2" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Start Date</label>
                    <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} className="w-full border border-gray-300 rounded px-3 py-2" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">End Date</label>
                    <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} className="w-full border border-gray-300 rounded px-3 py-2" required />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Coverage Details</label>
                    <textarea name="coverage" value={formData.coverage} onChange={handleChange} rows="3" className="w-full border border-gray-300 rounded px-3 py-2"></textarea>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Notes</label>
                    <textarea name="notes" value={formData.notes} onChange={handleChange} rows="3" className="w-full border border-gray-300 rounded px-3 py-2"></textarea>
                  </div>
                </div>
                <div className="flex justify-end gap-4">
                  <button type="button" onClick={() => setShowAddForm(false)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300">Cancel</button>
                  <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">
                    {loading ? "Saving..." : "Save Record"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Insurance Records Table */}
          <div className="bg-white rounded-lg shadow">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-white uppercase bg-gray-800">
                  <tr>
                    <th className="px-6 py-3">Vehicle</th>
                    <th className="px-6 py-3">Provider</th>
                    <th className="px-6 py-3">Policy Number</th>
                    <th className="px-6 py-3">Start Date</th>
                    <th className="px-6 py-3">End Date</th>
                    <th className="px-6 py-3">Premium</th>
                    <th className="px-6 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan="7" className="text-center p-4">Loading...</td></tr>
                  ) : filteredRecords.length === 0 ? (
                    <tr><td colSpan="7" className="text-center p-4 text-gray-500">No insurance records found</td></tr>
                  ) : (
                    filteredRecords.map((record) => (
                      <tr key={record._id} className="bg-white border-b hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <span className="font-medium text-gray-900">
                              {(() => {
                                const vehicle = vehicles.find(v => v._id === (typeof record.vehicleId === 'object' ? record.vehicleId._id : record.vehicleId));
                                return vehicle?.name || `${vehicle?.make} ${vehicle?.model}` || 'Vehicle not found';
                              })()}
                            </span>
                            <br />
                            <span className="text-sm text-gray-500">
                              {(() => {
                                const vehicle = vehicles.find(v => v._id === (typeof record.vehicleId === 'object' ? record.vehicleId._id : record.vehicleId));
                                return vehicle?.number || '';
                              })()}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">{record.provider}</td>
                        <td className="px-6 py-4">{record.policyNumber}</td>
                        <td className="px-6 py-4">{formatDate(record.startDate)}</td>
                        <td className="px-6 py-4">{formatDate(record.endDate)}</td>
                        <td className="px-6 py-4">{formatCurrency(record.premium)}</td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button 
                              onClick={() => handleViewDetails(record)}
                              className="text-blue-600 hover:text-blue-800"
                              title="View Details"
                            >
                              <FaEye />
                            </button>
                            <button 
                              onClick={() => handleEditRecord(record)}
                              className="text-green-600 hover:text-green-800"
                              title="Edit"
                            >
                              <FaEdit />
                            </button>
                            <button 
                              onClick={() => handleDeleteRecord(record._id)}
                              className="text-red-600 hover:text-red-800"
                              title="Delete"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {viewRecord && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
                <h2 className="text-xl font-bold mb-4">Insurance Policy Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="font-medium text-gray-500">Vehicle:</p>
                    <p>{vehicles.find(v => v._id === (typeof viewRecord.vehicleId === 'object' ? viewRecord.vehicleId._id : viewRecord.vehicleId))?.name || 
                        `${vehicles.find(v => v._id === (typeof viewRecord.vehicleId === 'object' ? viewRecord.vehicleId._id : viewRecord.vehicleId))?.make} ${vehicles.find(v => v._id === (typeof viewRecord.vehicleId === 'object' ? viewRecord.vehicleId._id : viewRecord.vehicleId))?.model}`}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-500">Provider:</p>
                    <p>{viewRecord.provider}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-500">Policy Number:</p>
                    <p>{viewRecord.policyNumber}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-500">Start Date:</p>
                    <p>{formatDate(viewRecord.startDate)}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-500">End Date:</p>
                    <p>{formatDate(viewRecord.endDate)}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-500">Premium:</p>
                    <p>{formatCurrency(viewRecord.premium)}</p>
                  </div>
                  {viewRecord.coverage && (
                    <div className="md:col-span-2">
                      <p className="font-medium text-gray-500">Coverage:</p>
                      <p>{viewRecord.coverage}</p>
                    </div>
                  )}
                  {viewRecord.notes && (
                    <div className="md:col-span-2">
                      <p className="font-medium text-gray-500">Notes:</p>
                      <p>{viewRecord.notes}</p>
                    </div>
                  )}
                </div>
                <div className="mt-6">
                  <button 
                    onClick={() => setViewRecord(null)}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VehicleInsurance;
