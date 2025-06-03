import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

// Create the context
const VehicleContext = createContext();

// Custom hook to use the vehicle context
export const useVehicle = () => useContext(VehicleContext);

// API base URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:7000';

// Provider component
export const VehicleProvider = ({ children }) => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load vehicles from API on initial render
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        setLoading(true);
        // Try to get token from both accessToken (new) and token (legacy) locations
        const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
        
        // Debug token information
        console.log('Debug - Token exists:', !!token);
        if (token) {
          console.log('Debug - Token first 10 chars:', token.substring(0, 10) + '...');
        }
        
        if (!token) {
          console.log('Debug - No token found in localStorage');
          setError('Authentication required');
          setLoading(false);
          return;
        }
        
        console.log('Debug - Making API request to:', `${API_URL}/api/vehicles`);
        console.log('Debug - With headers:', { Authorization: `Bearer ${token.substring(0, 10)}...` });
        
        const response = await axios.get(`${API_URL}/api/vehicles`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        console.log('Debug - API response:', response.status, response.statusText);
        
        if (response.data.success) {
          console.log('Debug - Vehicles received:', (response.data.data || []).length);
          setVehicles(response.data.data || []);
        } else {
          console.log('Debug - API returned error:', response.data.error);
          throw new Error(response.data.error || 'Failed to fetch vehicles');
        }
      } catch (err) {
        console.error('Error loading vehicles:', err);
        console.log('Debug - Error details:', {
          message: err.message,
          response: err.response ? {
            status: err.response.status,
            data: err.response.data
          } : 'No response'
        });
        setError(err.message || 'Failed to load vehicles');
      } finally {
        setLoading(false);
      }
    };
    
    fetchVehicles();
  }, []);

  // Get a vehicle by ID
  const getVehicleById = async (id) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
      
      if (!token) {
        setError('Authentication required');
        setLoading(false);
        return null;
      }
      
      const response = await axios.get(`${API_URL}/api/vehicles/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.error || 'Failed to fetch vehicle');
      }
    } catch (err) {
      console.error(`Error fetching vehicle ${id}:`, err);
      setError(err.message || 'Failed to fetch vehicle');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Add a new vehicle
  const addVehicle = async (newVehicle) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Authentication required');
        setLoading(false);
        return null;
      }
      
      const formData = new FormData();
      
      // Add all vehicle properties to formData
      Object.keys(newVehicle).forEach(key => {
        if (key === 'vehiclePhoto' || key === 'documents') {
          if (newVehicle[key] && newVehicle[key] instanceof File) {
            formData.append(key, newVehicle[key]);
          }
        } else {
          formData.append(key, newVehicle[key]);
        }
      });
      
      const response = await axios.post(`${API_URL}/api/vehicles`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.data.success) {
        const addedVehicle = response.data.data;
        setVehicles([...vehicles, addedVehicle]);
        return addedVehicle;
      } else {
        throw new Error(response.data.error || 'Failed to add vehicle');
      }
    } catch (err) {
      console.error('Error adding vehicle:', err);
      setError(err.message || 'Failed to add vehicle');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Update an existing vehicle
  const updateVehicle = async (updatedVehicle) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Authentication required');
        setLoading(false);
        return null;
      }
      
      const formData = new FormData();
      
      // Add all vehicle properties to formData
      Object.keys(updatedVehicle).forEach(key => {
        if (key === 'vehiclePhoto' || key === 'documents') {
          if (updatedVehicle[key] && updatedVehicle[key] instanceof File) {
            formData.append(key, updatedVehicle[key]);
          }
        } else {
          formData.append(key, updatedVehicle[key]);
        }
      });
      
      const response = await axios.put(`${API_URL}/api/vehicles/${updatedVehicle._id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.data.success) {
        const updated = response.data.data;
        setVehicles(vehicles.map(vehicle => 
          vehicle._id === updated._id ? updated : vehicle
        ));
        return updated;
      } else {
        throw new Error(response.data.error || 'Failed to update vehicle');
      }
    } catch (err) {
      console.error('Error updating vehicle:', err);
      setError(err.message || 'Failed to update vehicle');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Delete a vehicle
  const deleteVehicle = async (id) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Authentication required');
        setLoading(false);
        return false;
      }
      
      const response = await axios.delete(`${API_URL}/api/vehicles/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        setVehicles(vehicles.filter(vehicle => vehicle._id !== id));
        return true;
      } else {
        throw new Error(response.data.error || 'Failed to delete vehicle');
      }
    } catch (err) {
      console.error('Error deleting vehicle:', err);
      setError(err.message || 'Failed to delete vehicle');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Add maintenance record
  const addMaintenanceRecord = async (vehicleId, maintenanceData) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Authentication required');
        setLoading(false);
        return null;
      }
      
      const formData = new FormData();
      
      // Add all maintenance data properties to formData
      Object.keys(maintenanceData).forEach(key => {
        if (key === 'documents' || key === 'receiptImage') {
          if (maintenanceData[key] && maintenanceData[key] instanceof File) {
            formData.append(key, maintenanceData[key]);
          }
        } else {
          formData.append(key, maintenanceData[key]);
        }
      });
      
      const response = await axios.post(`${API_URL}/api/vehicles/${vehicleId}/maintenance`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.data.success) {
        // Update the vehicle in the state with the updated data from the server
        const updatedVehicle = response.data.data;
        setVehicles(vehicles.map(vehicle => 
          vehicle._id === vehicleId ? updatedVehicle : vehicle
        ));
        return updatedVehicle;
      } else {
        throw new Error(response.data.error || 'Failed to add maintenance record');
      }
    } catch (err) {
      console.error('Error adding maintenance record:', err);
      setError(err.message || 'Failed to add maintenance record');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Add fuel record
  const addFuelRecord = async (vehicleId, fuelData) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Authentication required');
        setLoading(false);
        return null;
      }
      
      const formData = new FormData();
      
      // Add all fuel data properties to formData
      Object.keys(fuelData).forEach(key => {
        if (key === 'receiptImage') {
          if (fuelData[key] && fuelData[key] instanceof File) {
            formData.append(key, fuelData[key]);
          }
        } else {
          formData.append(key, fuelData[key]);
        }
      });
      
      const response = await axios.post(`${API_URL}/api/fuel/${vehicleId}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.data.success) {
        // Update the vehicle in the state with the updated data from the server
        const updatedVehicle = response.data.data;
        setVehicles(vehicles.map(vehicle => 
          vehicle._id === vehicleId ? updatedVehicle : vehicle
        ));
        return updatedVehicle;
      } else {
        throw new Error(response.data.error || 'Failed to add fuel record');
      }
    } catch (err) {
      console.error('Error adding fuel record:', err);
      setError(err.message || 'Failed to add fuel record');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Add insurance record
  const addInsuranceRecord = async (vehicleId, insuranceData) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Authentication required');
        setLoading(false);
        return null;
      }
      
      const formData = new FormData();
      
      // Add all insurance data properties to formData
      Object.keys(insuranceData).forEach(key => {
        if (key === 'policyDocument' || key === 'receiptImage') {
          if (insuranceData[key] && insuranceData[key] instanceof File) {
            formData.append(key, insuranceData[key]);
          }
        } else {
          formData.append(key, insuranceData[key]);
        }
      });
      
      const response = await axios.post(`${API_URL}/api/insurance/${vehicleId}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.data.success) {
        // Update the vehicle in the state with the updated data from the server
        const updatedVehicle = response.data.data;
        setVehicles(vehicles.map(vehicle => 
          vehicle._id === vehicleId ? updatedVehicle : vehicle
        ));
        return updatedVehicle;
      } else {
        throw new Error(response.data.error || 'Failed to add insurance record');
      }
    } catch (err) {
      console.error('Error adding insurance record:', err);
      setError(err.message || 'Failed to add insurance record');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Value object to be provided to consumers
  const value = {
    vehicles,
    loading,
    error,
    getVehicleById,
    addVehicle,
    updateVehicle,
    deleteVehicle,
    addMaintenanceRecord,
    addFuelRecord,
    addInsuranceRecord
  };

  return (
    <VehicleContext.Provider value={value}>
      {children}
    </VehicleContext.Provider>
  );
};

export default VehicleContext; 