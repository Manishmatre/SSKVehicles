import React, { useState, useEffect } from 'react';
import { useVehicle } from '../../context/VehicleContext';
import './VehicleTable.css'; // Will create this next

const VehicleTable = () => {
  const { vehicles, loading, error } = useVehicle();
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    type: '',
    status: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter and search logic
  const filteredVehicles = vehicles.filter(vehicle => {
    const matchesSearch = 
      vehicle.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.number.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = 
      !filters.type || vehicle.type === filters.type;
    
    const matchesStatus = 
      !filters.status || vehicle.status === filters.status;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredVehicles.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredVehicles.slice(indexOfFirstItem, indexOfLastItem);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filters]);

  // Get unique types and statuses for filter dropdowns
  const vehicleTypes = [...new Set(vehicles.map(v => v.type))];
  const vehicleStatuses = [...new Set(vehicles.map(v => v.status))];

  // Statistics
  const totalVehicles = vehicles.length;
  const typesCount = vehicleTypes.length;
  const filteredCount = filteredVehicles.length;

  if (loading) return <div>Loading vehicles...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="vehicle-table-container">
      <h2>Vehicle Inventory</h2>
      
      {/* Summary Statistics */}
      <div className="stats">
        <p>Total Vehicles: {totalVehicles}</p>
        <p>Vehicle Types: {typesCount}</p>
        <p>Showing: {filteredCount} vehicles</p>
      </div>

      {/* Search and Filters */}
      <div className="controls">
        <input
          type="text"
          placeholder="Search by name or number..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <select
          value={filters.type}
          onChange={(e) => setFilters({...filters, type: e.target.value})}
        >
          <option value="">All Types</option>
          {vehicleTypes.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>

        <select
          value={filters.status}
          onChange={(e) => setFilters({...filters, status: e.target.value})}
        >
          <option value="">All Statuses</option>
          {vehicleStatuses.map(status => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
      </div>

      {/* Vehicle Table */}
      <table className="vehicle-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Number</th>
            <th>Type</th>
            <th>Make/Model</th>
            <th>Year</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {currentItems.map(vehicle => (
            <tr 
              key={vehicle.id} 
              onClick={() => {
                // Filter to show only this vehicle
                setFilters({
                  type: '',
                  status: ''
                });
                setSearchTerm(vehicle.name);
              }}
              className="clickable-row"
            >
              <td>{vehicle.name}</td>
              <td>{vehicle.number}</td>
              <td>{vehicle.type}</td>
              <td>{vehicle.make} {vehicle.model}</td>
              <td>{vehicle.year}</td>
              <td className={`status-${vehicle.status.toLowerCase().replace(' ', '-')}`}>
                {vehicle.status}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="pagination">
          <button 
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={currentPage === page ? 'active' : ''}
            >
              {page}
            </button>
          ))}
          
          <button 
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default VehicleTable;
