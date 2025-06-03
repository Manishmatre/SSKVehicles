import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";

const MaintenanceHistory = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [maintenanceRecords, setMaintenanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    type: '',
    dateRange: 'all',
    sortBy: 'date',
    sortOrder: 'desc'
  });

  // Sample data - replace with API call
  useEffect(() => {
    // Simulating API call
    const sampleData = [
      {
        id: 1,
        date: '2024-03-15',
        type: 'Regular Service',
        description: 'Regular maintenance check and oil change',
        cost: 150.00,
        mileage: 50000,
        performedBy: 'John\'s Auto Service',
        nextMaintenanceDate: '2024-09-15'
      },
      {
        id: 2,
        date: '2023-09-15',
        type: 'Tire Replacement',
        description: 'Replaced all four tires',
        cost: 800.00,
        mileage: 45000,
        performedBy: 'Tire World',
        nextMaintenanceDate: '2025-09-15'
      },
      {
        id: 3,
        date: '2023-03-15',
        type: 'Brake Service',
        description: 'Replaced front brake pads and rotors',
        cost: 400.00,
        mileage: 40000,
        performedBy: 'John\'s Auto Service',
        nextMaintenanceDate: '2024-03-15'
      }
    ];

    setTimeout(() => {
      setMaintenanceRecords(sampleData);
      setLoading(false);
    }, 1000);
  }, [id]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const filteredRecords = maintenanceRecords
    .filter(record => {
      if (filter.type && record.type !== filter.type) return false;
      // Add more filter conditions as needed
      return true;
    })
    .sort((a, b) => {
      if (filter.sortBy === 'date') {
        return filter.sortOrder === 'desc' 
          ? new Date(b.date) - new Date(a.date)
          : new Date(a.date) - new Date(b.date);
      }
      if (filter.sortBy === 'cost') {
        return filter.sortOrder === 'desc'
          ? b.cost - a.cost
          : a.cost - b.cost;
      }
      return 0;
    });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="w-screen h-screen">
      <Header />
      <div className="flex w-screen h-full pt-15">
        <Sidebar />
        <div className="w-full h-full overflow-y-scroll bg-blue-50 p-5">
          <div className="page-header flex items-center justify-between">
            <p className="py-3 text-lg italic font-bold text-gray-700">
              Maintenance History
            </p>
            <div className="flex space-x-4">
              <button
                onClick={() => navigate(`/add-maintenance/${id}`)}
                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                Add Maintenance Record
              </button>
              <button
                onClick={() => navigate(`/vehicle-details/${id}`)}
                className="text-blue-500 hover:text-blue-700 font-semibold"
              >
                Back to Vehicle Details <i className="fa-solid fa-angles-right"></i>
              </button>
            </div>
          </div>
          
          <div className="main-container w-full h-full bg-white p-6 rounded-lg shadow">
            {/* Filters */}
            <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700 mb-1">Maintenance Type</label>
                <select
                  name="type"
                  value={filter.type}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Types</option>
                  <option value="Regular Service">Regular Service</option>
                  <option value="Oil Change">Oil Change</option>
                  <option value="Tire Replacement">Tire Replacement</option>
                  <option value="Brake Service">Brake Service</option>
                  <option value="Engine Repair">Engine Repair</option>
                  <option value="Transmission Service">Transmission Service</option>
                  <option value="Electrical Repair">Electrical Repair</option>
                  <option value="Body Work">Body Work</option>
                </select>
              </div>
              
              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                <select
                  name="sortBy"
                  value={filter.sortBy}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="date">Date</option>
                  <option value="cost">Cost</option>
                </select>
              </div>
              
              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
                <select
                  name="sortOrder"
                  value={filter.sortOrder}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="desc">Newest First</option>
                  <option value="asc">Oldest First</option>
                </select>
              </div>
            </div>

            {/* Maintenance Records Table */}
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mileage</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Performed By</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Next Maintenance</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredRecords.map((record) => (
                      <tr key={record.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(record.date)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {record.type}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {record.description}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(record.cost)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {record.mileage.toLocaleString()} km
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {record.performedBy}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(record.nextMaintenanceDate)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <button
                            onClick={() => navigate(`/edit-maintenance/${id}/${record.id}`)}
                            className="text-blue-500 hover:text-blue-700 mr-3"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => {
                              // Add delete functionality
                              console.log('Delete record:', record.id);
                            }}
                            className="text-red-500 hover:text-red-700"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaintenanceHistory; 