import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";

const MaintenanceSchedule = () => {
  const navigate = useNavigate();
  const [maintenanceSchedules, setMaintenanceSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, upcoming, overdue, completed

  // Sample data for maintenance schedules
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setMaintenanceSchedules([
        {
          id: 1,
          vehicleId: 1,
          vehicleName: "Vehicle 1",
          vehicleNumber: "ABC123",
          maintenanceType: "Oil Change",
          scheduledDate: "2024-04-15",
          status: "Upcoming",
          description: "Regular oil change and filter replacement",
          assignedTo: "John Doe",
          estimatedCost: 75.00,
          priority: "Medium"
        },
        {
          id: 2,
          vehicleId: 2,
          vehicleName: "Vehicle 2",
          vehicleNumber: "XYZ456",
          maintenanceType: "Brake Service",
          scheduledDate: "2024-03-20",
          status: "Overdue",
          description: "Brake pad replacement and rotor inspection",
          assignedTo: "Mike Smith",
          estimatedCost: 250.00,
          priority: "High"
        },
        {
          id: 3,
          vehicleId: 3,
          vehicleName: "Vehicle 3",
          vehicleNumber: "DEF789",
          maintenanceType: "Tire Rotation",
          scheduledDate: "2024-04-10",
          status: "Upcoming",
          description: "Tire rotation and balance",
          assignedTo: "Sarah Johnson",
          estimatedCost: 50.00,
          priority: "Low"
        },
        {
          id: 4,
          vehicleId: 4,
          vehicleName: "Vehicle 4",
          vehicleNumber: "GHI101",
          maintenanceType: "Engine Tune-up",
          scheduledDate: "2024-03-05",
          status: "Completed",
          description: "Complete engine tune-up and diagnostics",
          assignedTo: "David Wilson",
          estimatedCost: 350.00,
          priority: "High"
        },
        {
          id: 5,
          vehicleId: 5,
          vehicleName: "Vehicle 5",
          vehicleNumber: "JKL202",
          maintenanceType: "Transmission Service",
          scheduledDate: "2024-04-25",
          status: "Upcoming",
          description: "Transmission fluid change and filter replacement",
          assignedTo: "Emily Brown",
          estimatedCost: 180.00,
          priority: "Medium"
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const handleFilterChange = (e) => {
    setFilter(e.target.value);
  };

  const handleAddSchedule = () => {
    navigate("/add-maintenance-schedule");
  };

  const handleViewDetails = (id) => {
    navigate(`/maintenance-schedule-details/${id}`);
  };

  const handleEditSchedule = (id) => {
    navigate(`/edit-maintenance-schedule/${id}`);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Upcoming":
        return "bg-blue-100 text-blue-800";
      case "Overdue":
        return "bg-red-100 text-red-800";
      case "Completed":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "High":
        return "bg-red-100 text-red-800";
      case "Medium":
        return "bg-yellow-100 text-yellow-800";
      case "Low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredSchedules = maintenanceSchedules.filter(schedule => {
    if (filter === "all") return true;
    return schedule.status.toLowerCase() === filter.toLowerCase();
  });

  return (
    <div className="w-screen h-screen">
      <Header />
      <div className="flex w-screen h-full pt-15">
        <Sidebar />
        <div className="w-full h-full overflow-y-scroll bg-blue-50 p-5">
          <div className="page-header flex items-center justify-between">
            <p className="py-3 text-lg italic font-bold text-gray-700">
              Maintenance Schedule
            </p>
            <div className="flex space-x-4">
              <button
                onClick={handleAddSchedule}
                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                Add Schedule
              </button>
              <button
                onClick={() => navigate("/vehicles-dashboard")}
                className="text-blue-500 hover:text-blue-700 font-semibold"
              >
                Back to Vehicles <i className="fa-solid fa-arrow-left"></i>
              </button>
            </div>
          </div>

          <div className="main-container w-full h-full">
            <div className="stats-container grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
              <div className="stats flex items-center justify-between p-4 rounded-lg shadow bg-blue-50">
                <div className="state-left">
                  <p className="text-md font-bold text-gray-700">Total Schedules</p>
                  <h1 className="text-3xl font-bold text-gray-700">
                    {maintenanceSchedules.length}
                  </h1>
                </div>
                <div className="logo w-15 h-15 flex items-center justify-center rounded-full bg-gray-200">
                  <h1 className="text-lg font-bold text-gray-700">
                    <i className="fa-solid fa-calendar-check"></i>
                  </h1>
                </div>
              </div>
              <div className="stats flex items-center justify-between p-4 rounded-lg shadow bg-yellow-50">
                <div className="state-left">
                  <p className="text-md font-bold text-gray-700">Upcoming</p>
                  <h1 className="text-3xl font-bold text-gray-700">
                    {maintenanceSchedules.filter(s => s.status === "Upcoming").length}
                  </h1>
                </div>
                <div className="logo w-15 h-15 flex items-center justify-center rounded-full bg-gray-200">
                  <h1 className="text-lg font-bold text-gray-700">
                    <i className="fa-solid fa-clock"></i>
                  </h1>
                </div>
              </div>
              <div className="stats flex items-center justify-between p-4 rounded-lg shadow bg-red-50">
                <div className="state-left">
                  <p className="text-md font-bold text-gray-700">Overdue</p>
                  <h1 className="text-3xl font-bold text-gray-700">
                    {maintenanceSchedules.filter(s => s.status === "Overdue").length}
                  </h1>
                </div>
                <div className="logo w-15 h-15 flex items-center justify-center rounded-full bg-gray-200">
                  <h1 className="text-lg font-bold text-gray-700">
                    <i className="fa-solid fa-exclamation-triangle"></i>
                  </h1>
                </div>
              </div>
              <div className="stats flex items-center justify-between p-4 rounded-lg shadow bg-green-50">
                <div className="state-left">
                  <p className="text-md font-bold text-gray-700">Completed</p>
                  <h1 className="text-3xl font-bold text-gray-700">
                    {maintenanceSchedules.filter(s => s.status === "Completed").length}
                  </h1>
                </div>
                <div className="logo w-15 h-15 flex items-center justify-center rounded-full bg-gray-200">
                  <h1 className="text-lg font-bold text-gray-700">
                    <i className="fa-solid fa-check-circle"></i>
                  </h1>
                </div>
              </div>
            </div>

            <div className="maintenance-schedules bg-white shadow p-4 rounded-lg overflow-x-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-md text-gray-600 font-bold">Maintenance Schedules</h2>
                <div className="flex items-center space-x-2">
                  <label htmlFor="filter" className="text-sm text-gray-600">Filter:</label>
                  <select
                    id="filter"
                    value={filter}
                    onChange={handleFilterChange}
                    className="border border-gray-300 rounded-md px-2 py-1 text-sm"
                  >
                    <option value="all">All Schedules</option>
                    <option value="upcoming">Upcoming</option>
                    <option value="overdue">Overdue</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>

              {loading ? (
                <div className="flex justify-center items-center h-40">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <table className="w-full text-sm text-left text-gray-500">
                  <thead className="text-xs text-white uppercase bg-gray-800 rounded-2xl">
                    <tr className="rounded-3xl">
                      <th scope="col" className="px-6 py-3">Vehicle</th>
                      <th scope="col" className="px-6 py-3">Maintenance Type</th>
                      <th scope="col" className="px-6 py-3">Scheduled Date</th>
                      <th scope="col" className="px-6 py-3">Status</th>
                      <th scope="col" className="px-6 py-3">Priority</th>
                      <th scope="col" className="px-6 py-3">Assigned To</th>
                      <th scope="col" className="px-6 py-3">Estimated Cost</th>
                      <th scope="col" className="px-6 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSchedules.map((schedule) => (
                      <tr key={schedule.id} className="bg-white border-b hover:bg-gray-50">
                        <td className="px-6 font-semibold text-gray-700 py-2">
                          {schedule.vehicleName} ({schedule.vehicleNumber})
                        </td>
                        <td className="px-6 font-semibold text-gray-700 py-2">
                          {schedule.maintenanceType}
                        </td>
                        <td className="px-6 font-semibold text-gray-700 py-2">
                          {formatDate(schedule.scheduledDate)}
                        </td>
                        <td className="px-6 font-semibold py-2">
                          <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(schedule.status)}`}>
                            {schedule.status}
                          </span>
                        </td>
                        <td className="px-6 font-semibold py-2">
                          <span className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(schedule.priority)}`}>
                            {schedule.priority}
                          </span>
                        </td>
                        <td className="px-6 font-semibold text-gray-700 py-2">
                          {schedule.assignedTo}
                        </td>
                        <td className="px-6 font-semibold text-gray-700 py-2">
                          {formatCurrency(schedule.estimatedCost)}
                        </td>
                        <td className="px-6 font-semibold text-gray-700 py-2">
                          <div className="flex space-x-2">
                            <button 
                              onClick={() => handleViewDetails(schedule.id)}
                              className="text-blue-500 hover:text-blue-700"
                              title="View Details"
                            >
                              <i className="fa-solid fa-eye"></i>
                            </button>
                            <button 
                              onClick={() => handleEditSchedule(schedule.id)}
                              className="text-green-500 hover:text-green-700"
                              title="Edit Schedule"
                            >
                              <i className="fa-solid fa-pen"></i>
                            </button>
                            <button 
                              className="text-red-500 hover:text-red-700"
                              title="Delete Schedule"
                            >
                              <i className="fa-solid fa-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaintenanceSchedule; 