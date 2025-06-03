import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import { FaUpload, FaPlus, FaUser, FaCar, FaGasPump } from 'react-icons/fa';

const AddFuelRecord = () => {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formType, setFormType] = useState('purchase'); // 'purchase' or 'consumption'
  const [purchaseType, setPurchaseType] = useState('direct'); // 'direct' or 'bulk'
  const [formData, setFormData] = useState({
    fuelType: 'Petrol',
    quantity: '',
    perLiterPrice: '',
    totalCost: '',
    paymentMethod: 'cash',
    vendor: '',
    receiptPhoto: null,
    notes: '',
    fuelSource: 'company_stock', // Default value
    // Purchase-specific fields
    vehicleId: '',
    employee: '',
    purpose: '',
    // Consumption-specific fields
    odometerReading: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [vehiclesRes, employeesRes] = await Promise.all([
          axios.get('http://localhost:7000/api/vehicles'),
          axios.get('http://localhost:7000/api/employees')
        ]);
        
        setVehicles(vehiclesRes.data.data || []);
        setEmployees(employeesRes.data.data || []);
        
      } catch (error) {
        toast.error('Failed to load data. Please check your connection.');
        console.error('API Error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const validateBulkPurchase = (quantity) => {
    const maxBulkPurchase = 10000; 
    if (quantity > maxBulkPurchase) {
      toast.warning(`Bulk purchase cannot exceed ${maxBulkPurchase} liters`);
      return false;
    }
    return true;
  };

  const calculateFuelValues = (field, value) => {
    const newFormData = {...formData};
    
    newFormData[field] = value;
    
    if (field === 'quantity' || field === 'perLiterPrice') {
      if (newFormData.quantity && newFormData.perLiterPrice) {
        newFormData.totalCost = (newFormData.quantity * newFormData.perLiterPrice).toFixed(2);
      }
    }
    
    if (field === 'quantity' || field === 'totalCost') {
      if (newFormData.quantity && newFormData.totalCost) {
        newFormData.perLiterPrice = (newFormData.totalCost / newFormData.quantity).toFixed(2);
      }
    }
    
    if (field === 'perLiterPrice' || field === 'totalCost') {
      if (newFormData.perLiterPrice && newFormData.totalCost) {
        newFormData.quantity = (newFormData.totalCost / newFormData.perLiterPrice).toFixed(2);
      }
    }
    
    setFormData(newFormData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login first');
        return navigate('/login');
      }

      // Validate required fields
      if (!formData.fuelType || !formData.quantity || !formData.vehicleId || !formData.employee) {
        toast.error('Please fill in all required fields');
        return;
      }

      // Validate numeric fields
      if (isNaN(formData.quantity) || isNaN(formData.perLiterPrice) || isNaN(formData.totalCost)) {
        toast.error('Please enter valid numeric values');
        return;
      }

      // For bulk purchase, validate quantity
      if (formType === 'purchase' && purchaseType === 'bulk' && !validateBulkPurchase(formData.quantity)) {
        return;
      }
  
      const formDataToSend = new FormData();
      
      // Append basic fields
      formDataToSend.append('fuelType', formData.fuelType);
      formDataToSend.append('quantity', formData.quantity);
      formDataToSend.append('employee', formData.employee);
      formDataToSend.append('notes', formData.notes || '');
      
      if (formType === 'purchase') {
        // Purchase-specific fields
        formDataToSend.append('purchaseType', purchaseType);
        formDataToSend.append('perLiterPrice', formData.perLiterPrice);
        formDataToSend.append('totalCost', formData.totalCost);
        formDataToSend.append('paymentMethod', formData.paymentMethod);
        formDataToSend.append('vendor', formData.vendor);
        formDataToSend.append('fuelSource', formData.fuelSource || 'company_stock');
        
        // For direct purchase, vehicle is required
        if (purchaseType === 'direct') {
          if (!formData.vehicleId) {
            toast.error('Vehicle selection is required for direct purchase');
            return;
          }
          formDataToSend.append('vehicleId', formData.vehicleId);
        }
      } else {
        // Consumption-specific fields
        if (!formData.vehicleId) {
          toast.error('Vehicle selection is required for consumption');
          return;
        }
        if (!formData.odometerReading) {
          toast.error('Odometer reading is required for consumption');
          return;
        }
        formDataToSend.append('vehicleId', formData.vehicleId);
        formDataToSend.append('odometerReading', formData.odometerReading);
        formDataToSend.append('fuelSource', 'company_stock');
      }
  
      // Append file if exists
      if (formData.receiptPhoto) {
        formDataToSend.append('receiptPhoto', formData.receiptPhoto);
      }
  
      const endpoint = formType === 'purchase' ? 'purchase' : 'consumption';
        const response = await axios.post(
        `http://localhost:7000/api/fuel/${endpoint}`,
        formDataToSend,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          }
        }
      );
  
      if (response.status === 401) {
        toast.error('Session expired. Please login again.');
        localStorage.removeItem('token');
        return navigate('/login');
      }
  
      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to add record');
      }
  
      toast.success(response.data.message || 'Record added successfully');
      navigate('/fuel-records');
  
    } catch (error) {
      console.error('Submission error:', error);
      
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        localStorage.removeItem('token');
        return navigate('/login');
      }
  
      toast.error(
        error.response?.data?.error || 
        error.message || 
        'Failed to submit form. Please try again.'
      );
    }
  };

  const handleInputChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  return (
    <div className="w-screen h-screen bg-gray-50">
      <Header />
      <div className="flex w-screen h-full pt-15">
        <Sidebar />
        <div className="w-full h-full overflow-y-scroll p-5">
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  {formType === 'purchase' 
                    ? `Add ${purchaseType === 'bulk' ? 'Bulk' : 'Vehicle'} Fuel Purchase`
                    : 'Add Fuel Consumption'}
                </h1>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate('/fuel-consumption')}
                  className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
                >
                  <span>Back to Records</span>
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            {/* Main tabs */}
            <div className="flex border-b border-gray-200 mb-6">
              <button
                className={`px-6 py-3 font-medium ${formType === 'purchase' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
                onClick={() => setFormType('purchase')}
              >
                Fuel Purchase
              </button>
              <button
                className={`px-6 py-3 font-medium ${formType === 'consumption' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
                onClick={() => setFormType('consumption')}
              >
                Fuel Consumption
              </button>
            </div>

            {/* Purchase type selector (only shown for purchase form) */}
            {formType === 'purchase' && (
              <div className="flex gap-4 mb-6">
                <button
                  type="button"
                  className={`px-4 py-2 rounded-md ${purchaseType === 'direct' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}
                  onClick={() => setPurchaseType('direct')}
                >
                  Direct Purchase
                </button>
                <button
                  type="button"
                  className={`px-4 py-2 rounded-md ${purchaseType === 'bulk' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}
                  onClick={() => setPurchaseType('bulk')}
                >
                  Bulk Purchase
                </button>
              </div>
            )}

            {/* Form fields */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Common fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fuel Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="fuelType"
                    value={formData.fuelType}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                  >
                    <option value="Petrol">Petrol</option>
                    <option value="Diesel">Diesel</option>
                    <option value="CNG">CNG</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quantity (Liters) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={(e) => calculateFuelValues('quantity', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                    placeholder="Enter quantity"
                    min="1"
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price per Liter (₹) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="perLiterPrice"
                    value={formData.perLiterPrice}
                    onChange={(e) => calculateFuelValues('perLiterPrice', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                    placeholder="Enter price"
                    min="1"
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Total Cost (₹) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="totalCost"
                    value={formData.totalCost}
                    onChange={(e) => calculateFuelValues('totalCost', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                    placeholder="Total cost"
                    min="1"
                    step="0.01"
                    readOnly
                  />
                </div>
              </div>

              {/* Conditional fields based on form type */}
              {formType === 'purchase' ? (
                <>
                  {purchaseType === 'direct' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Vehicle <span className="text-red-500">*</span>
                        </label>
                        <select
                          name="vehicleId"
                          value={formData.vehicleId}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                        >
                          <option value="">Select Vehicle</option>
                          {vehicles.map(vehicle => (
                            <option key={vehicle._id} value={vehicle._id}>
                              {vehicle.registrationNumber} - {vehicle.make} {vehicle.model}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Employee <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="employee"
                          value={formData.employee}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                          placeholder="Enter employee name"
                        />
                      </div>
                    </div>
                  )}

                  {purchaseType === 'bulk' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Vehicle <span className="text-red-500">*</span>
                        </label>
                        <select
                          name="vehicleId"
                          value={formData.vehicleId}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                        >
                          <option value="">Select Vehicle</option>
                          {vehicles.map(vehicle => (
                            <option key={vehicle._id} value={vehicle._id}>
                              {vehicle.registrationNumber} - {vehicle.make} {vehicle.model}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Employee <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="employee"
                          value={formData.employee}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                          placeholder="Enter employee name"
                        />
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Vendor <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="vendor"
                        value={formData.vendor}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                        placeholder="Enter vendor name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Payment Method <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="paymentMethod"
                        value={formData.paymentMethod}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                      >
                        <option value="cash">Cash</option>
                        <option value="card">Card</option>
                        <option value="upi">UPI</option>
                        <option value="netbanking">Net Banking</option>
                      </select>
                    </div>
                  </div>
                </>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Vehicle <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="vehicleId"
                      value={formData.vehicleId}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                    >
                      <option value="">Select Vehicle</option>
                      {vehicles.map(vehicle => (
                        <option key={vehicle._id} value={vehicle._id}>
                          {vehicle.registrationNumber} - {vehicle.make} {vehicle.model}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Employee <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="employee"
                      value={formData.employee}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                      placeholder="Enter employee name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Odometer Reading (km) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="odometerReading"
                      value={formData.odometerReading}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                      placeholder="Enter current odometer"
                      min="1"
                    />
                  </div>
                </div>
              )}

              {/* Additional Notes */}
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Additional Notes
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                    rows="3"
                    placeholder="Any additional information..."
                  />
                </div>
              </div>

              {/* Receipt upload (common to both) */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Receipt Photo
                </label>
                <div className="mt-1 flex items-center">
                  <label className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-50">
                    <FaUpload className="mr-2" />
                    Upload Receipt
                    <input
                      type="file"
                      name="receiptPhoto"
                      onChange={(e) => setFormData({...formData, receiptPhoto: e.target.files[0]})}
                      className="sr-only"
                      accept="image/*"
                    />
                  </label>
                  {formData.receiptPhoto && (
                    <span className="ml-3 text-sm text-gray-500">{formData.receiptPhoto.name}</span>
                  )}
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddFuelRecord;