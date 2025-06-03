import React, { useState } from 'react';

const VehicleFilter = ({ onFilterChange }) => {
  const [vehicleType, setVehicleType] = useState('');

  const handleFilterChange = (e) => {
    setVehicleType(e.target.value);
    onFilterChange(e.target.value);
  };

  return (
    <div>
      <h2>Filter Vehicles</h2>
      <label>Vehicle Type:</label>
      <select value={vehicleType} onChange={handleFilterChange}>
        <option value="">All</option>
        <option value="Car">Car</option>
        <option value="Truck">Truck</option>
        <option value="Motorcycle">Motorcycle</option>
        {/* Add more vehicle types as needed */}
      </select>
    </div>
  );
};

export default VehicleFilter;
