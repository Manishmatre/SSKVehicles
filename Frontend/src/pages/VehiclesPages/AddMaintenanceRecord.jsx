import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";

const AddMaintenanceRecord = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    type: '',
    description: '',
    cost: '',
    mileage: '',
    performedBy: '',
    nextMaintenanceDate: '',
    notes: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically send the data to your backend API
    console.log(formData);
    // For now, we'll just navigate back to the vehicle details page
    navigate(`/vehicle-details/${id}`);
  };

  return (
    <div className="w-screen h-screen">
      <Header />
      <div className="flex w-screen h-full pt-15">
        <Sidebar />
        <div className="w-full h-full overflow-y-scroll bg-blue-50 p-5">
          <div className="page-header flex items-center justify-between">
            <p className="py-3 text-lg italic font-bold text-gray-700">
              Add Maintenance Record
            </p>
            <button
              onClick={() => navigate(`/vehicle-details/${id}`)}
              className="text-blue-500 hover:text-blue-700 font-semibold"
            >
              Back to Vehicle Details <i className="fa-solid fa-angles-right"></i>
            </button>
          </div>
          
          <div className="main-container w-full h-full bg-white p-6 rounded-lg shadow">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="form-group">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Maintenance Date</label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Maintenance Type</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Type</option>
                    <option value="Regular Service">Regular Service</option>
                    <option value="Oil Change">Oil Change</option>
                    <option value="Tire Replacement">Tire Replacement</option>
                    <option value="Brake Service">Brake Service</option>
                    <option value="Engine Repair">Engine Repair</option>
                    <option value="Transmission Service">Transmission Service</option>
                    <option value="Electrical Repair">Electrical Repair</option>
                    <option value="Body Work">Body Work</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cost ($)</label>
                  <input
                    type="number"
                    name="cost"
                    value={formData.cost}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mileage (km)</label>
                  <input
                    type="number"
                    name="mileage"
                    value={formData.mileage}
                    onChange={handleChange}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Performed By</label>
                  <input
                    type="text"
                    name="performedBy"
                    value={formData.performedBy}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Next Maintenance Date</label>
                  <input
                    type="date"
                    name="nextMaintenanceDate"
                    value={formData.nextMaintenanceDate}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div className="form-group col-span-1 md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  ></textarea>
                </div>
                
                <div className="form-group col-span-1 md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Additional Notes</label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  ></textarea>
                </div>
              </div>
              
              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => navigate(`/vehicle-details/${id}`)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Add Maintenance Record
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddMaintenanceRecord; 