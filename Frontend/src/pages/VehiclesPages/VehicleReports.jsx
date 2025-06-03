import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import { Button, message, Table } from 'antd';
import axios from 'axios';

const VehicleReports = () => {
  const navigate = useNavigate();
  const [selectedReport, setSelectedReport] = useState("maintenance");
  const [dateRange, setDateRange] = useState({ startDate: "", endDate: "" });
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [reportMode, setReportMode] = useState('all');
  const [generatedReports, setGeneratedReports] = useState([]);
  const [loading, setLoading] = useState(false);

  // Table columns configuration
  const columns = [
    {
      title: 'Report ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Report Type',
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: 'Vehicle',
      dataIndex: 'vehicle',
      key: 'vehicle',
      render: (text, record) => record.vehicleDetails || 'All Vehicles'
    },
    {
      title: 'Date Range',
      dataIndex: 'dateRange',
      key: 'dateRange',
      render: (_, record) => `${record.startDate} - ${record.endDate}`
    },
    {
      title: 'Generated On',
      dataIndex: 'generatedOn',
      key: 'generatedOn',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Button type="primary" onClick={() => handleDownloadReport(record.id)}>
          Download
        </Button>
      ),
    },
  ];

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      const response = await axios.get('http://localhost:7000/api/vehicles');
      if (response.data.success) {
        setVehicles(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      message.error('Failed to fetch vehicles');
    }
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleGenerateReport = () => {
    if (!dateRange.startDate || !dateRange.endDate) {
      message.error('Please select date range');
      return;
    }

    if (reportMode === 'single' && !selectedVehicle) {
      message.error('Please select a vehicle');
      return;
    }

    setLoading(true);

    // Simulate report generation
    const newReport = {
      id: Date.now().toString(),
      type: selectedReport,
      vehicleDetails: reportMode === 'single' ? 
        vehicles.find(v => v._id === selectedVehicle)?.number : null,
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
      generatedOn: new Date().toLocaleDateString(),
    };

    setGeneratedReports(prev => [newReport, ...prev]);
    setLoading(false);
    message.success('Report generated successfully!');
  };

  const handleDownloadReport = (reportId) => {
    const report = generatedReports.find(r => r.id === reportId);
    if (report) {
      message.success('Downloading report...');
      // Implement actual download functionality here
    }
  };

  const handleExportReport = () => {
    if (generatedReports.length === 0) {
      message.warning('No reports to export');
      return;
    }
    message.success('Reports exported successfully!');
  };

  return (
    <div className="w-screen h-screen">
      <Header />
      <div className="flex w-screen h-full pt-15">
        <Sidebar />
        <div className="w-full h-full overflow-y-scroll bg-blue-50 p-5">
          <div className="page-header flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Vehicle Reports</h1>
              <p className="text-gray-600">Generate and manage vehicle reports</p>
            </div>
            <button
              onClick={() => navigate("/vehicles-dashboard")}
              className="text-blue-500 hover:text-blue-700 font-semibold"
            >
              Back to Vehicles <i className="fa-solid fa-arrow-left ml-2"></i>
            </button>
          </div>

          <div className="main-container w-full h-full">
            <div className="reports-container bg-white shadow p-6 rounded-lg">
              {/* Report Generation Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="form-group">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Report Mode
                  </label>
                  <select
                    value={reportMode}
                    onChange={(e) => setReportMode(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Vehicles Report</option>
                    <option value="single">Single Vehicle Report</option>
                  </select>
                </div>

                {reportMode === 'single' && (
                  <div className="form-group">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Select Vehicle <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={selectedVehicle}
                      onChange={(e) => setSelectedVehicle(e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select a vehicle</option>
                      {vehicles.map((vehicle) => (
                        <option key={vehicle._id} value={vehicle._id}>
                          {vehicle.number} - {vehicle.make} {vehicle.model}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="form-group">
                  <label htmlFor="reportType" className="block text-sm font-medium text-gray-700 mb-1">
                    Report Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="reportType"
                    name="reportType"
                    value={selectedReport}
                    onChange={(e) => setSelectedReport(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="maintenance">Maintenance Report</option>
                    <option value="fuel">Fuel Consumption Report</option>
                    <option value="insurance">Insurance Report</option>
                    <option value="cost">Cost Analysis Report</option>
                    <option value="utilization">Vehicle Utilization Report</option>
                    <option value="inspection">Vehicle Inspection Report</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    id="startDate"
                    name="startDate"
                    value={dateRange.startDate}
                    onChange={handleDateChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                    End Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    id="endDate"
                    name="endDate"
                    value={dateRange.endDate}
                    onChange={handleDateChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                {reportMode === 'all' && (
                  <div className="form-group">
                    <label htmlFor="vehicleFilter" className="block text-sm font-medium text-gray-700 mb-1">
                      Vehicle Filter
                    </label>
                    <select
                      id="vehicleFilter"
                      name="vehicleFilter"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">All Vehicles</option>
                      <option value="active">Active Vehicles</option>
                      <option value="maintenance">Vehicles Under Maintenance</option>
                      <option value="idle">Idle Vehicles</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={handleGenerateReport}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Generate Report
                </button>
                <button
                  onClick={handleExportReport}
                  className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Export Report
                </button>
              </div>

              {/* Generated Reports Table */}
              <div className="mt-8">
                <h3 className="text-lg font-bold text-gray-700 mb-4">Generated Reports</h3>
                <Table
                  columns={columns}
                  dataSource={generatedReports}
                  loading={loading}
                  rowKey="id"
                  pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} reports`
                  }}
                />
              </div>

              {/* Available Reports Section */}
              <div className="mt-8">
                <h3 className="text-lg font-bold text-gray-700 mb-4">Available Reports</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="report-card p-4 border border-gray-200 rounded-md hover:shadow-md transition-shadow">
                    <div className="flex items-center mb-2">
                      <i className="fa-solid fa-wrench text-blue-500 mr-2"></i>
                      <h4 className="font-semibold text-gray-700">Maintenance Report</h4>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      Detailed report of all maintenance activities, costs, and schedules.
                    </p>
                    <button
                      onClick={() => setSelectedReport("maintenance")}
                      className="text-blue-500 text-sm hover:text-blue-700"
                    >
                      Select this report <i className="fa-solid fa-arrow-right ml-1"></i>
                    </button>
                  </div>

                  <div className="report-card p-4 border border-gray-200 rounded-md hover:shadow-md transition-shadow">
                    <div className="flex items-center mb-2">
                      <i className="fa-solid fa-gas-pump text-green-500 mr-2"></i>
                      <h4 className="font-semibold text-gray-700">Fuel Consumption Report</h4>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      Analysis of fuel usage, costs, and efficiency across your fleet.
                    </p>
                    <button
                      onClick={() => setSelectedReport("fuel")}
                      className="text-blue-500 text-sm hover:text-blue-700"
                    >
                      Select this report <i className="fa-solid fa-arrow-right ml-1"></i>
                    </button>
                  </div>

                  <div className="report-card p-4 border border-gray-200 rounded-md hover:shadow-md transition-shadow">
                    <div className="flex items-center mb-2">
                      <i className="fa-solid fa-file-contract text-purple-500 mr-2"></i>
                      <h4 className="font-semibold text-gray-700">Insurance Report</h4>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      Overview of insurance policies, coverage, and expiration dates.
                    </p>
                    <button
                      onClick={() => setSelectedReport("insurance")}
                      className="text-blue-500 text-sm hover:text-blue-700"
                    >
                      Select this report <i className="fa-solid fa-arrow-right ml-1"></i>
                    </button>
                  </div>

                  <div className="report-card p-4 border border-gray-200 rounded-md hover:shadow-md transition-shadow">
                    <div className="flex items-center mb-2">
                      <i className="fa-solid fa-chart-line text-yellow-500 mr-2"></i>
                      <h4 className="font-semibold text-gray-700">Cost Analysis Report</h4>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      Comprehensive breakdown of all vehicle-related expenses.
                    </p>
                    <button
                      onClick={() => setSelectedReport("cost")}
                      className="text-blue-500 text-sm hover:text-blue-700"
                    >
                      Select this report <i className="fa-solid fa-arrow-right ml-1"></i>
                    </button>
                  </div>

                  <div className="report-card p-4 border border-gray-200 rounded-md hover:shadow-md transition-shadow">
                    <div className="flex items-center mb-2">
                      <i className="fa-solid fa-tachometer-alt text-red-500 mr-2"></i>
                      <h4 className="font-semibold text-gray-700">Vehicle Utilization Report</h4>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      Analysis of vehicle usage, mileage, and availability.
                    </p>
                    <button
                      onClick={() => setSelectedReport("utilization")}
                      className="text-blue-500 text-sm hover:text-blue-700"
                    >
                      Select this report <i className="fa-solid fa-arrow-right ml-1"></i>
                    </button>
                  </div>

                  <div className="report-card p-4 border border-gray-200 rounded-md hover:shadow-md transition-shadow">
                    <div className="flex items-center mb-2">
                      <i className="fa-solid fa-clipboard-check text-indigo-500 mr-2"></i>
                      <h4 className="font-semibold text-gray-700">Vehicle Inspection Report</h4>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      Detailed inspection results and compliance status.
                    </p>
                    <button
                      onClick={() => setSelectedReport("inspection")}
                      className="text-blue-500 text-sm hover:text-blue-700"
                    >
                      Select this report <i className="fa-solid fa-arrow-right ml-1"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleReports;