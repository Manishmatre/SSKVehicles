import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import axios from "axios";
import { toast } from "react-toastify";
import { FaGasPump, FaDollarSign, FaChartLine, FaRoad, FaFilter, FaSort, FaTachometerAlt, FaCalendarAlt, FaList, FaSync } from "react-icons/fa";
import { FaArrowUp, FaArrowDown, FaEquals, FaCarSide, FaMoneyBillWave } from "react-icons/fa";
import { Bar, Pie, Line, Doughnut } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

const FuelConsumption = () => {
  const navigate = useNavigate();

  // API Data States
  const [fuelPurchases, setFuelPurchases] = useState([]);
  const [fuelConsumptions, setFuelConsumptions] = useState([]);
  const [vehicles, setVehicles] = useState([]);

  // UI/UX States
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter & Sort States
  const [filter, setFilter] = useState("all");
  const [selectedVehicle, setSelectedVehicle] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [timePeriod, setTimePeriod] = useState("monthly");
  const [sortConfig, setSortConfig] = useState({ 
    key: "date", 
    direction: "desc" 
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const token = localStorage.getItem('token');
        const [vehiclesRes, fuelRes] = await Promise.all([
          axios.get("http://localhost:7000/api/vehicles", {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get("http://localhost:7000/api/fuel/purchase", {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        if (vehiclesRes.data.success) {
          setVehicles(vehiclesRes.data.data);
        } else {
          throw new Error(vehiclesRes.data.error || "Failed to load vehicles");
        }

        setFuelPurchases(fuelRes.data.purchases || []);
        setFuelConsumptions(fuelRes.data.consumptions || []);
      } catch (err) {
        setError(err.response?.data?.error || err.message || "Failed to load data");
        toast.error(err.response?.data?.error || "Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleFilterChange = (e) => {
    setFilter(e.target.value);
  };

  const handleVehicleChange = (e) => {
    setSelectedVehicle(e.target.value);
  };

  const handleAddFuelRecord = () => {
    navigate("/add-fuel-record");
  };

  const handleViewDetails = (id) => {
    navigate(`/fuel-record-details/${id}`);
  };

  const handleDeleteRecord = async (id) => {
    if (window.confirm("Are you sure you want to delete this record?")) {
      try {
        const response = await axios.delete(`http://localhost:7000/api/fuel-records/${id}`);
        if (response.data.success) {
          setFuelPurchases(fuelPurchases.filter(record => record._id !== id));
          setFuelConsumptions(fuelConsumptions.filter(record => record._id !== id));
          toast.success("Fuel record deleted successfully");
        } else {
          toast.error(response.data.error || "Failed to delete fuel record");
        }
      } catch (err) {
        toast.error(err.response?.data?.error || "Failed to delete fuel record");
      }
    }
  };

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Format currency as INR with Indian number formatting
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(amount);
  };
  // Format numbers with Indian separators (lakhs/crores)
  const formatNumberIN = (n) => new Intl.NumberFormat('en-IN').format(n);

  const calculateTotalCost = () => {
    const filtered = getFilteredRecords();
    return filtered.reduce((total, record) => total + (record.totalCost || 0), 0);
  };

  // Normalize and merge records
  const allRecords = [
    ...fuelPurchases.map(rec => ({
      ...rec,
      type: 'Purchase',
      vehicle: rec.vehicleId || rec.vehicle || '',
      fuelType: rec.fuelType || '',
      quantity: parseFloat(rec.quantity) || 0,
      price: parseFloat(rec.perLiterPrice) || 0,
      totalCost: parseFloat(rec.totalCost) || 0,
      odometer: rec.odometerReading || '',
      date: rec.createdAt || rec.date || '',
      _origin: 'purchase',
    })),
    ...fuelConsumptions.map(rec => ({
      ...rec,
      type: 'Consumption',
      vehicle: rec.vehicle || '',
      fuelType: rec.fuelType || '',
      quantity: parseFloat(rec.quantity) || 0,
      price: 0,
      totalCost: 0,
      odometer: rec.odometerReading || '',
      date: rec.createdAt || rec.date || '',
      _origin: 'consumption',
    })),
  ];

  // Calculate average efficiency from filtered records (if present)
  function calculateAverageEfficiency() {
    const filtered = getFilteredRecords();
    const efficiencyRecords = filtered.filter(r => typeof r.efficiency === 'number' && !isNaN(r.efficiency));
    if (efficiencyRecords.length === 0) return 0;
    const totalEfficiency = efficiencyRecords.reduce((total, record) => total + record.efficiency, 0);
    return (totalEfficiency / efficiencyRecords.length).toFixed(1);
  }

  const getFuelTypeBreakdown = () => {
    const filtered = getFilteredRecords();
    const breakdown = {};
    filtered.forEach(record => {
      if (!record.fuelType) return;
      breakdown[record.fuelType] = (breakdown[record.fuelType] || 0) + (record.quantity || 0);
    });
    return breakdown;
  };

  const getMonthlyConsumption = () => {
    const filtered = getFilteredRecords();
    const monthlyData = {};
    filtered.forEach(record => {
      const month = new Date(record.date).toLocaleString('default', { month: 'short' });
      monthlyData[month] = (monthlyData[month] || 0) + record.quantity;
    });
    return monthlyData;
  };

  const getVehicleEfficiency = () => {
    const filtered = getFilteredRecords();
    const efficiencyData = {};
    filtered.forEach(record => {
      const vehicleName = typeof record.vehicle === 'object' ? record.vehicle.name : record.vehicle;
      if (!vehicleName) return;
      if (!efficiencyData[vehicleName]) {
        efficiencyData[vehicleName] = {
          totalEfficiency: 0,
          count: 0
        };
      }
      efficiencyData[vehicleName].totalEfficiency += record.efficiency || 0;
      efficiencyData[vehicleName].count++;
    });
    return Object.entries(efficiencyData).map(([vehicle, data]) => ({
      vehicle,
      avgEfficiency: (data.totalEfficiency / data.count).toFixed(1)
    }));
  };

  // Filter records by time period
  const getFilteredRecords = () => {
    const now = new Date();
    let startDate = new Date(0); // Default to beginning of time
    
    switch(timePeriod) {
      case 'today':
        startDate = new Date(now.setHours(0, 0, 0, 0));
        break;
      case 'yesterday':
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 1);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(startDate);
        endDate.setHours(23, 59, 59, 999);
        return allRecords.filter(record => {
          const recordDate = new Date(record.date);
          return recordDate >= startDate && recordDate <= endDate;
        });
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - now.getDay()));
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'quarter':
        const quarter = Math.floor(now.getMonth() / 3);
        startDate = new Date(now.getFullYear(), quarter * 3, 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      case 'all':
        return allRecords;
      default:
        return allRecords;
    }
    
    return allRecords.filter(record => {
      const recordDate = new Date(record.date);
      return recordDate >= startDate;
    });
  };

  const sortedAndFilteredRecords = React.useMemo(() => {
    let filtered = getFilteredRecords();

    return filtered.sort((a, b) => {
      if (sortConfig.key === "date") {
        return sortConfig.direction === "asc"
          ? new Date(a.date) - new Date(b.date)
          : new Date(b.date) - new Date(a.date);
      }
      return sortConfig.direction === "asc"
        ? a[sortConfig.key] - b[sortConfig.key]
        : b[sortConfig.key] - a[sortConfig.key];
    });
  }, [allRecords, selectedVehicle, filter, searchTerm, sortConfig, timePeriod]);

  const getMonthlyEfficiency = () => {
    const filtered = getFilteredRecords();
    const monthlyData = {};
    filtered.forEach(record => {
      const month = new Date(record.date).toLocaleString('default', { month: 'short' });
      if (!monthlyData[month]) {
        monthlyData[month] = {
          totalEfficiency: 0,
          count: 0
        };
      }
      monthlyData[month].totalEfficiency += record.efficiency || 0;
      monthlyData[month].count++;
    });
    return Object.entries(monthlyData).map(([month, data]) => ({
      month,
      avgEfficiency: (data.totalEfficiency / data.count).toFixed(1)
    }));
  };

  const getMonthlyCost = () => {
    const filtered = getFilteredRecords();
    const monthlyData = {};
    filtered.forEach(record => {
      const month = new Date(record.date).toLocaleString('default', { month: 'short' });
      if (!monthlyData[month]) {
        monthlyData[month] = 0;
      }
      monthlyData[month] += record.totalCost || 0;
    });
    return monthlyData;
  };

  const calculateVehicleEfficiency = (vehicleId) => {
    const filtered = getFilteredRecords().filter(r => r.vehicle === vehicleId);
    const efficiencyRecords = filtered.filter(r => typeof r.efficiency === 'number' && !isNaN(r.efficiency));
    if (efficiencyRecords.length === 0) return 0;
    const totalEfficiency = efficiencyRecords.reduce((total, record) => total + record.efficiency, 0);
    return (totalEfficiency / efficiencyRecords.length).toFixed(1);
  };

  const getMonthlyPurchaseTrends = () => {
    const filtered = getFilteredRecords();
    const monthlyData = {};
    filtered.forEach(record => {
      const month = new Date(record.date).toLocaleString('default', { month: 'short' });
      if (!monthlyData[month]) {
        monthlyData[month] = {
          diesel: 0,
          petrol: 0
        };
      }
      if (record.fuelType === 'diesel') {
        monthlyData[month].diesel += record.quantity;
      } else if (record.fuelType === 'petrol') {
        monthlyData[month].petrol += record.quantity;
      }
    });
    return monthlyData;
  };

  if (loading) {
    return (
      <div className="w-screen h-screen bg-gray-50">
        <Header />
        <div className="flex w-screen h-full pt-15">
          <Sidebar />
          <div className="w-full h-full overflow-y-scroll p-5">
            <div className="animate-pulse space-y-6">
              <div className="h-10 bg-gray-200 rounded w-1/3"></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-gray-200 h-32 rounded-lg"></div>
                ))}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-200 h-96 rounded-lg"></div>
                <div className="bg-gray-200 h-96 rounded-lg"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen bg-gray-50">
      <Header />
      <div className="flex w-screen h-full pt-15">
        <Sidebar />
        <div className="w-full h-full overflow-y-scroll p-5">
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
              <div className="flex-1">
                <h1 className="text-xl md:text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <span className="inline-block bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm md:text-base">🚧</span>
                  Fuel & Stock Dashboard
                </h1>
                <p className="text-gray-600 mt-1 text-sm md:text-base">
                  Professional dashboard for Indian construction companies & contractors. Track fuel, compliance, and docs.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full md:w-auto">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <FaCalendarAlt className="text-gray-500" />
                  <select
                    value={timePeriod}
                    onChange={(e) => setTimePeriod(e.target.value)}
                    className="border border-gray-300 rounded-md px-2 py-1 md:px-3 md:py-2 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                  >
                    <option value="today">Today</option>
                    <option value="yesterday">Yesterday</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                    <option value="quarter">This Quarter</option>
                    <option value="year">This Year</option>
                    <option value="all">All Time</option>
                  </select>
                </div>
                <button
                  onClick={handleAddFuelRecord}
                  className="px-3 py-1 md:px-4 md:py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-1 md:gap-2 text-xs md:text-sm w-full sm:w-auto justify-center"
                >
                  <FaGasPump className="text-xs md:text-base" />
                  <span>Add Fuel Record</span>
                </button>
                <button
                  onClick={() => navigate("/fuel-records")}
                  className="px-3 py-1 md:px-4 md:py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors flex items-center gap-1 md:gap-2 text-xs md:text-sm w-full sm:w-auto justify-center"
                >
                  <FaList className="text-xs md:text-base" /> 
                  <span>All Records</span>
                </button>
              </div>
            </div>
          </div>

          {/* Comprehensive Stats Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Total Consumption */}
            <div className="bg-white p-4 rounded-xl shadow border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Consumption</p>
                  <p className="text-2xl font-bold">
                    {formatNumberIN(getFilteredRecords().reduce((sum, r) => sum + r.quantity, 0))} <span className="text-sm font-normal">Liters</span>
                  </p>
                </div>
                <div className="p-2 bg-indigo-50 rounded-lg">
                  <FaGasPump className="text-indigo-500 text-xl" />
                </div>
              </div>
              <div className="mt-2 text-xs text-red-600 flex items-center">
                <FaArrowDown className="mr-1" /> 2.1% vs last period
              </div>
            </div>
            
            {/* Diesel Stats */}
            <div className="bg-white p-4 rounded-xl shadow border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Diesel Consumed</p>
                  <p className="text-2xl font-bold">
                    {formatNumberIN(getFilteredRecords().filter(r => r.fuelType?.toLowerCase() === 'diesel').reduce((sum, r) => sum + r.quantity, 0))} <span className="text-sm font-normal">L</span>
                  </p>
                </div>
                <div className="p-2 bg-blue-50 rounded-lg">
                  <FaGasPump className="text-blue-500 text-xl" />
                </div>
              </div>
              <div className="mt-2 text-xs text-green-600 flex items-center">
                <FaArrowUp className="mr-1" /> 5.2% vs last period
              </div>
            </div>
            
            {/* Petrol Stats */}
            <div className="bg-white p-4 rounded-xl shadow border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Petrol Consumed</p>
                  <p className="text-2xl font-bold">
                    {formatNumberIN(getFilteredRecords().filter(r => r.fuelType?.toLowerCase() === 'petrol').reduce((sum, r) => sum + r.quantity, 0))} <span className="text-sm font-normal">L</span>
                  </p>
                </div>
                <div className="p-2 bg-purple-50 rounded-lg">
                  <FaGasPump className="text-purple-500 text-xl" />
                </div>
              </div>
              <div className="mt-2 text-xs text-red-600 flex items-center">
                <FaArrowDown className="mr-1" /> 2.1% vs last period
              </div>
            </div>
            
            {/* Total Fuel Cost */}
            <div className="bg-white p-4 rounded-xl shadow border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Fuel Cost</p>
                  <p className="text-2xl font-bold">{formatCurrency(calculateTotalCost())}</p>
                </div>
                <div className="p-2 bg-yellow-50 rounded-lg">
                  <FaDollarSign className="text-yellow-500 text-xl" />
                </div>
              </div>
              <div className="mt-2 text-xs text-green-600 flex items-center">
                <FaArrowUp className="mr-1" /> 8.5% vs last period
              </div>
            </div>
            
            {/* Avg Efficiency */}
            <div className="bg-white p-4 rounded-xl shadow border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Avg Efficiency</p>
                  <p className="text-2xl font-bold">
                    {calculateAverageEfficiency()} <span className="text-sm font-normal">km/L</span>
                  </p>
                </div>
                <div className="p-2 bg-green-50 rounded-lg">
                  <FaTachometerAlt className="text-green-500 text-xl" />
                </div>
              </div>
              <div className="mt-2 text-xs text-green-600 flex items-center">
                <FaArrowUp className="mr-1" /> 3.7% vs last period
              </div>
            </div>
            
            {/* Active Vehicles */}
            <div className="bg-white p-4 rounded-xl shadow border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Active Vehicles</p>
                  <p className="text-2xl font-bold">{vehicles.length}</p>
                </div>
                <div className="p-2 bg-pink-50 rounded-lg">
                  <FaCarSide className="text-pink-500 text-xl" />
                </div>
              </div>
              <div className="mt-2 text-xs text-gray-600 flex items-center">
                <FaEquals className="mr-1" /> No change
              </div>
            </div>
            
            {/* Avg Cost/Liter */}
            <div className="bg-white p-4 rounded-xl shadow border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Avg Cost/Liter</p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(calculateTotalCost() / getFilteredRecords().reduce((sum, r) => sum + r.quantity, 0))}
                  </p>
                </div>
                <div className="p-2 bg-teal-50 rounded-lg">
                  <FaMoneyBillWave className="text-teal-500 text-xl" />
                </div>
              </div>
              <div className="mt-2 text-xs text-red-600 flex items-center">
                <FaArrowUp className="mr-1" /> 4.2% vs last period
              </div>
            </div>
          </div>
          
          {/* Time Period Filter */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-800">Fuel Analytics Dashboard</h2>
              <p className="text-sm text-gray-500">Showing data for {timePeriod} period</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-gray-200">
                <FaCalendarAlt className="text-gray-500" />
                <select 
                  value={timePeriod} 
                  onChange={(e) => setTimePeriod(e.target.value)}
                  className="bg-transparent border-none focus:ring-0 text-sm"
                >
                  <option value="today">Today</option>
                  <option value="yesterday">Yesterday</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="quarter">This Quarter</option>
                  <option value="year">This Year</option>
                  <option value="all">All Time</option>
                </select>
              </div>
              <button 
                onClick={() => refreshData()}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <FaSync /> Refresh
              </button>
            </div>
          </div>

          {/* Analytics Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Fuel Efficiency Analytics */}
            <div className="bg-white p-5 rounded-xl shadow border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <FaTachometerAlt className="text-blue-500" />
                    Fuel Efficiency
                  </h3>
                  <p className="text-sm text-gray-500">Average across all vehicles</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">{calculateAverageEfficiency()} <span className="text-sm font-normal text-gray-500">km/L</span></p>
                  <p className="text-xs text-green-600 flex items-center justify-end">
                    <FaArrowUp className="mr-1" /> 3.2% from last period
                  </p>
                </div>
              </div>
              <div className="h-64">
                <Line 
                  data={{
                    labels: Object.keys(getMonthlyEfficiency()),
                    datasets: [{
                      label: 'Efficiency (km/L)',
                      data: Object.values(getMonthlyEfficiency()).map(e => e.avgEfficiency),
                      borderColor: '#3B82F6',
                      backgroundColor: 'rgba(59, 130, 246, 0.1)',
                      tension: 0.3,
                      fill: true
                    }]
                  }}
                  options={{
                    plugins: {
                      legend: { display: false }
                    },
                    scales: {
                      y: { beginAtZero: false }
                    }
                  }}
                />
              </div>
            </div>

            {/* Fuel Consumption Breakdown */}
            <div className="bg-white p-5 rounded-xl shadow border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <FaGasPump className="text-purple-500" />
                    Consumption Breakdown
                  </h3>
                  <p className="text-sm text-gray-500">By fuel type</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">{formatNumberIN(Object.values(getFuelTypeBreakdown()).reduce((a,b) => a + b, 0))} <span className="text-sm font-normal text-gray-500">Liters</span></p>
                  <p className="text-xs text-red-600 flex items-center justify-end">
                    <FaArrowDown className="mr-1" /> 1.8% from last period
                  </p>
                </div>
              </div>
              <div className="h-64">
                <Doughnut
                  data={{
                    labels: Object.keys(getFuelTypeBreakdown()),
                    datasets: [{
                      data: Object.values(getFuelTypeBreakdown()),
                      backgroundColor: [
                        '#3B82F6', // Diesel
                        '#8B5CF6', // Petrol
                        '#10B981', // CNG
                        '#F59E0B'  // Other
                      ],
                      borderWidth: 0
                    }]
                  }}
                  options={{
                    plugins: {
                      legend: { position: 'bottom' },
                      tooltip: {
                        callbacks: {
                          label: (context) => {
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const value = context.raw;
                            const percentage = Math.round((value / total) * 100);
                            return `${context.label}: ${value}L (${percentage}%)`;
                          }
                        }
                      }
                    },
                    cutout: '70%'
                  }}
                />
              </div>
            </div>

            {/* Cost Analysis */}
            <div className="bg-white p-5 rounded-xl shadow border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <FaMoneyBillWave className="text-green-500" />
                    Cost Analysis
                  </h3>
                  <p className="text-sm text-gray-500">Monthly expenditure</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">{formatCurrency(calculateTotalCost())}</p>
                  <p className="text-xs text-green-600 flex items-center justify-end">
                    <FaArrowUp className="mr-1" /> 5.4% from last period
                  </p>
                </div>
              </div>
              <div className="h-64">
                <Bar
                  data={{
                    labels: Object.keys(getMonthlyCost()),
                    datasets: [{
                      label: 'Fuel Cost',
                      data: Object.values(getMonthlyCost()),
                      backgroundColor: '#10B981',
                      borderRadius: 4
                    }]
                  }}
                  options={{
                    plugins: {
                      legend: { display: false }
                    },
                    scales: {
                      y: { 
                        beginAtZero: true,
                        ticks: {
                          callback: (value) => `₹${formatNumberIN(value)}`
                        }
                      }
                    }
                  }}
                />
              </div>
            </div>
          </div>

          {/* Additional Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Vehicle Comparison */}
            <div className="bg-white p-5 rounded-xl shadow border border-gray-100">
              <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                <FaCarSide className="text-indigo-500" />
                Vehicle Efficiency Comparison
              </h3>
              <div className="h-80">
                <Bar
                  data={{
                    labels: vehicles.map(v => v.registrationNumber),
                    datasets: [{
                      label: 'Efficiency (km/L)',
                      data: vehicles.map(v => calculateVehicleEfficiency(v._id)),
                      backgroundColor: '#6366F1'
                    }]
                  }}
                  options={{
                    indexAxis: 'y',
                    plugins: {
                      legend: { display: false }
                    }
                  }}
                />
              </div>
            </div>

            {/* Fuel Purchase Trends */}
            <div className="bg-white p-4 rounded-xl shadow border border-gray-100">
              <h3 className="text-lg font-semibold mb-4">Fuel Purchase Trends</h3>
              <div className="h-64">
                <Line
                  data={{
                    labels: Array.from({ length: 12 }, (_, i) => {
                      const date = new Date();
                      date.setMonth(date.getMonth() - (11 - i));
                      return date.toLocaleString('default', { month: 'short' });
                    }),
                    datasets: [
                      {
                        label: 'Diesel',
                        data: Array.from({ length: 12 }, (_, i) => {
                          const monthStart = new Date();
                          monthStart.setMonth(monthStart.getMonth() - (11 - i), 1);
                          monthStart.setHours(0, 0, 0, 0);
                          const monthEnd = new Date(monthStart);
                          monthEnd.setMonth(monthEnd.getMonth() + 1);
                          monthEnd.setDate(0);
                          monthEnd.setHours(23, 59, 59, 999);
                          
                          return getFilteredRecords()
                            .filter(r => r.fuelType?.toLowerCase() === 'diesel' && 
                                      new Date(r.date) >= monthStart && 
                                      new Date(r.date) <= monthEnd)
                            .reduce((sum, r) => sum + r.quantity, 0);
                        }),
                        borderColor: '#3b82f6',
                        backgroundColor: '#bfdbfe',
                        tension: 0.3
                      },
                      {
                        label: 'Petrol',
                        data: Array.from({ length: 12 }, (_, i) => {
                          const monthStart = new Date();
                          monthStart.setMonth(monthStart.getMonth() - (11 - i), 1);
                          monthStart.setHours(0, 0, 0, 0);
                          const monthEnd = new Date(monthStart);
                          monthEnd.setMonth(monthEnd.getMonth() + 1);
                          monthEnd.setDate(0);
                          monthEnd.setHours(23, 59, 59, 999);
                          
                          return getFilteredRecords()
                            .filter(r => r.fuelType?.toLowerCase() === 'petrol' && 
                                      new Date(r.date) >= monthStart && 
                                      new Date(r.date) <= monthEnd)
                            .reduce((sum, r) => sum + r.quantity, 0);
                        }),
                        borderColor: '#8b5cf6',
                        backgroundColor: '#ddd6fe',
                        tension: 0.3
                      }
                    ]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'top',
                      },
                      tooltip: {
                        callbacks: {
                          label: function(context) {
                            return `${context.dataset.label}: ${context.raw} Liters`;
                          }
                        }
                      }
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        title: {
                          display: true,
                          text: 'Liters'
                        }
                      }
                    }
                  }}
                />
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default FuelConsumption;