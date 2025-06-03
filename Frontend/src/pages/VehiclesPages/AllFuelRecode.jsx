import React, { useState, useEffect } from 'react';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaGasPump, FaMoneyBillWave, FaTachometerAlt, FaCarSide, FaPlus, FaChartLine, FaArrowLeft, FaEdit, FaTrash, FaChevronLeft, FaChevronRight, FaArrowUp, FaArrowDown, FaEquals, FaDollarSign, FaFilter } from 'react-icons/fa';
import { Dialog, IconButton, Tooltip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Doughnut } from 'react-chartjs-2';

const AllFuelRecode = () => {
  const [fuelPurchases, setFuelPurchases] = useState([]);
  const [fuelConsumptions, setFuelConsumptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterVehicle, setFilterVehicle] = useState('');
  const [filterFuelType, setFilterFuelType] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [purchaseType, setPurchaseType] = useState('all');
  const [editRecord, setEditRecord] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFuelRecords = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:7000/api/fuel/purchase', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setFuelPurchases(response.data.purchases || []);
        setFuelConsumptions(response.data.consumptions || []);
      } catch (error) {
        toast.error('Failed to load fuel records');
      } finally {
        setLoading(false);
      }
    };
    fetchFuelRecords();
  }, []);

  // --- Action Handlers ---
  const handleDeleteRecord = async (record) => {
    if (!window.confirm('Are you sure you want to delete this record?')) return;
    try {
      const token = localStorage.getItem('token');
      // Determine endpoint and id
      let url = '';
      let id = '';
      if (record._origin === 'purchase') {
        url = `http://localhost:7000/api/fuel/purchase/${record._id}`;
        id = record._id;
      } else if (record._origin === 'consumption') {
        url = `http://localhost:7000/api/fuel/consumption/${record._id}`;
        id = record._id;
      } else {
        toast.error('Unknown record type.');
        return;
      }
      await axios.delete(url, { headers: { Authorization: `Bearer ${token}` } });
      toast.success('Record deleted successfully');
      // Refresh records
      fetchFuelRecords();
    } catch (err) {
      toast.error('Failed to delete record');
    }
  };

  // Normalize and merge records
  const allRecords = [
    ...fuelPurchases.map(rec => ({
      ...rec,
      type: 'Purchase',
      vehicle: rec.vehicleId || rec.vehicle || '',
      fuelType: rec.fuelType || '',
      quantity: rec.quantity || '',
      price: rec.perLiterPrice || '',
      totalCost: rec.totalCost || '',
      odometer: rec.odometerReading || '',
      date: rec.createdAt || rec.date || '',
      _origin: 'purchase',
    })),
    ...fuelConsumptions.map(rec => ({
      ...rec,
      type: 'Consumption',
      vehicle: rec.vehicle || '',
      fuelType: rec.fuelType || '',
      quantity: rec.quantity || '',
      price: '',
      totalCost: '',
      odometer: rec.odometerReading || '',
      date: rec.createdAt || rec.date || '',
      _origin: 'consumption',
    })),
  ];

  // Unique vehicles and fuel types for filter dropdowns
  const uniqueVehicles = [...new Set(allRecords.map(r => r.vehicle).filter(Boolean))];
  const uniqueFuelTypes = [...new Set(allRecords.map(r => r.fuelType).filter(Boolean))];

  // Sort records by date (newest first)
  const sortedRecords = [...allRecords].sort((a, b) => new Date(b.date) - new Date(a.date));

  // Filtering logic
  const filteredRecords = sortedRecords.filter(record => {
    const matchesType = filterType === 'all' || record.type === filterType;
    const matchesVehicle = !filterVehicle || record.vehicle === filterVehicle;
    const matchesFuelType = !filterFuelType || record.fuelType === filterFuelType;
    const matchesPurchaseType = purchaseType === 'all' || record.purchaseType === purchaseType;
    const matchesSearch =
      record.vehicle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.fuelType.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDateFrom = !filterDateFrom || new Date(record.date) >= new Date(filterDateFrom);
    const matchesDateTo = !filterDateTo || new Date(record.date) <= new Date(filterDateTo);
    return matchesType && matchesVehicle && matchesFuelType && matchesPurchaseType && matchesSearch && matchesDateFrom && matchesDateTo;
  });

  // --- Table Columns ---
  const columns = [
    {
      header: 'Type',
      accessor: '_origin',
      cell: (record) => (
        <span className={`px-2 py-1 text-xs rounded-full ${record._origin === 'purchase' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
          {record._origin === 'purchase' ? 'Purchase' : 'Consumption'}
        </span>
      ),
      width: '100px'
    },
    {
      header: 'Purchase Type',
      accessor: 'purchaseType',
      cell: (record) => (
        <span className={`px-2 py-1 text-xs rounded-full ${record.purchaseType === 'bulk' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
          {record.purchaseType === 'bulk' ? 'Bulk' : 'Direct'}
        </span>
      ),
      width: '120px'
    },
    {
      header: 'Vehicle',
      accessor: 'vehicle',
      cell: (record) => (
        <div className="flex flex-col">
          <span className="font-medium">{record.vehicle?.name || record.vehicleName || 'No Vehicle'}</span>
          <span className="text-xs text-gray-500">{record.vehicle?.number || ''}</span>
        </div>
      ),
      width: '180px'
    },
    {
      header: 'Fuel',
      accessor: 'fuelType',
      cell: (record) => (
        <div className="flex items-center gap-2">
          <FaGasPump className="text-gray-400" />
          <span>{record.fuelType || 'N/A'}</span>
        </div>
      ),
      width: '120px'
    },
    {
      header: 'Qty (L)',
      accessor: 'quantity',
      cell: (record) => (
        <div className="text-right font-medium">
          {record.quantity || '0'} L
        </div>
      ),
      width: '100px'
    },
    {
      header: 'Amount',
      accessor: 'amount',
      cell: (record) => (
        <div className="text-right font-medium">
          ₹ {record.amount || record.totalCost || '0'}
        </div>
      ),
      width: '120px'
    },
    {
      header: 'Date',
      accessor: 'date',
      cell: (record) => (
        <div>
          {record.date ? new Date(record.date).toLocaleDateString() : ''}
        </div>
      ),
      width: '120px'
    },
    {
      header: 'Actions',
      accessor: 'actions',
      cell: (record) => (
        <div className="flex gap-2">
          <Tooltip title="Edit">
            <IconButton size="small" onClick={() => { setEditRecord(record); setEditModalOpen(true); }}>
              <FaEdit className="text-blue-500" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton size="small" onClick={() => handleDeleteRecord(record)}>
              <FaTrash className="text-red-500" />
            </IconButton>
          </Tooltip>
        </div>
      ),
      width: '100px'
    }
  ];

  // --- Dashboard Stats ---
  const totalPurchasedLiters = fuelPurchases.reduce((sum, rec) => sum + (parseFloat(rec.quantity) || 0), 0);
  const totalPurchasedCost = fuelPurchases.reduce((sum, rec) => sum + (parseFloat(rec.totalCost) || 0), 0);
  const totalConsumedLiters = fuelConsumptions.reduce((sum, rec) => sum + (parseFloat(rec.quantity) || 0), 0);
  const avgPricePerLiter = fuelPurchases.length > 0 ?
    (fuelPurchases.reduce((sum, rec) => sum + (parseFloat(rec.perLiterPrice) || 0), 0) / fuelPurchases.length).toFixed(2) : 0;
  const numPurchases = fuelPurchases.length;
  const numConsumptions = fuelConsumptions.length;
  const numTotal = allRecords.length;

  // Consumption Breakdown
  const dieselConsumption = fuelConsumptions.reduce((sum, rec) => rec.fuelType === 'Diesel' ? sum + (parseFloat(rec.quantity) || 0) : sum, 0);
  const petrolConsumption = fuelConsumptions.reduce((sum, rec) => rec.fuelType === 'Petrol' ? sum + (parseFloat(rec.quantity) || 0) : sum, 0);
  const cngConsumption = fuelConsumptions.reduce((sum, rec) => rec.fuelType === 'CNG' ? sum + (parseFloat(rec.quantity) || 0) : sum, 0);
  const electricConsumption = fuelConsumptions.reduce((sum, rec) => rec.fuelType === 'Electric' ? sum + (parseFloat(rec.quantity) || 0) : sum, 0);

  // --- End Dashboard Stats ---

  // Pagination logic
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredRecords.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(filteredRecords.length / recordsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

  return (
    <div className="w-screen h-screen bg-gray-50">
      <Header />
      <div className="flex w-screen h-full pt-15">
        <Sidebar />
        <div className="w-full h-full overflow-y-scroll p-5">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Fuel Records Dashboard</h1>
              <p className="text-sm text-gray-500">All fuel purchase and consumption records</p>
            </div>
            <div className="flex gap-3 mt-4 md:mt-0">
              <button
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                onClick={() => navigate('/fuel-consumption')}
              >
                <FaChartLine /> Analytics
              </button>
              <button
                className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg transition-colors"
                onClick={() => navigate('/vehicles')}
              >
                <FaArrowLeft /> Vehicles
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Total Purchased */}
            <div className="bg-white p-4 rounded-xl shadow border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Purchased</p>
                  <p className="text-2xl font-bold">
                    {totalPurchasedLiters.toLocaleString()} <span className="text-sm font-normal">Liters</span>
                  </p>
                </div>
                <div className="p-2 bg-blue-50 rounded-lg">
                  <FaGasPump className="text-blue-500 text-xl" />
                </div>
              </div>
              <div className="mt-2 text-xs text-green-600 flex items-center">
                <FaArrowUp className="mr-1" /> 5.4% vs last period
              </div>
            </div>
            
            {/* Total Cost */}
            <div className="bg-white p-4 rounded-xl shadow border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Cost</p>
                  <p className="text-2xl font-bold">₹ {totalPurchasedCost.toLocaleString()}</p>
                </div>
                <div className="p-2 bg-purple-50 rounded-lg">
                  <FaMoneyBillWave className="text-purple-500 text-xl" />
                </div>
              </div>
              <div className="mt-2 text-xs text-red-600 flex items-center">
                <FaArrowDown className="mr-1" /> 2.1% vs last period
              </div>
            </div>
            
            {/* Total Consumed */}
            <div className="bg-white p-4 rounded-xl shadow border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Consumed</p>
                  <p className="text-2xl font-bold">
                    {totalConsumedLiters.toLocaleString()} <span className="text-sm font-normal">Liters</span>
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
            
            {/* Avg Cost/Liter */}
            <div className="bg-white p-4 rounded-xl shadow border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Avg Cost/Liter</p>
                  <p className="text-2xl font-bold">
                    ₹ {(totalPurchasedCost / totalPurchasedLiters || 0).toFixed(2)}
                  </p>
                </div>
                <div className="p-2 bg-yellow-50 rounded-lg">
                  <FaDollarSign className="text-yellow-500 text-xl" />
                </div>
              </div>
              <div className="mt-2 text-xs text-red-600 flex items-center">
                <FaArrowUp className="mr-1" /> 4.2% vs last period
              </div>
            </div>
          </div>

          {/* Consumption Breakdown */}
          <div className="bg-white p-6 rounded-xl shadow border border-gray-100">
            <h3 className="text-lg font-semibold mb-4">Consumption Breakdown</h3>
            <div className="h-64">
              <Doughnut
                data={{
                  labels: ['Diesel', 'Petrol', 'CNG', 'Electric'],
                  datasets: [{
                    data: [dieselConsumption, petrolConsumption, cngConsumption, electricConsumption],
                    backgroundColor: [
                      'rgba(59, 130, 246, 0.7)',
                      'rgba(16, 185, 129, 0.7)',
                      'rgba(245, 158, 11, 0.7)',
                      'rgba(139, 92, 246, 0.7)'
                    ],
                    borderColor: [
                      'rgba(59, 130, 246, 1)',
                      'rgba(16, 185, 129, 1)',
                      'rgba(245, 158, 11, 1)',
                      'rgba(139, 92, 246, 1)'
                    ],
                    borderWidth: 1,
                    borderRadius: 6,
                    spacing: 4
                  }]
                }}
                options={{
                  cutout: '65%',
                  plugins: {
                    legend: { display: false },
                    tooltip: {
                      callbacks: {
                        label: (context) => {
                          const label = context.label || '';
                          const value = context.raw || 0;
                          return `${label}: ${value} L`;
                        }
                      }
                    }
                  },
                  animation: {
                    animateScale: true,
                    animateRotate: true
                  }
                }}
              />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {[
                { id: 'Diesel', color: 'rgba(59, 130, 246, 0.7)', value: dieselConsumption },
                { id: 'Petrol', color: 'rgba(16, 185, 129, 0.7)', value: petrolConsumption },
                { id: 'CNG', color: 'rgba(245, 158, 11, 0.7)', value: cngConsumption },
                { id: 'Electric', color: 'rgba(139, 92, 246, 0.7)', value: electricConsumption }
              ].map(item => (
                <div key={item.id} className="flex items-center">
                  <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }} />
                  <span className="text-sm">{item.id}: {item.value} L</span>
                </div>
              ))}
            </div>
          </div>

          {/* Purchase Type Filter */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-gray-200">
              <FaFilter className="text-gray-500" />
              <select 
                value={purchaseType} 
                onChange={(e) => setPurchaseType(e.target.value)}
                className="bg-transparent border-none focus:ring-0 text-sm"
              >
                <option value="all">All Types</option>
                <option value="bulk">Bulk Purchase</option>
                <option value="direct">Direct Purchase</option>
              </select>
            </div>
          </div>

          {/* Add Record Button */}
          <div className="flex justify-end mb-6">
            <button
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
              onClick={() => navigate('/add-fuel-record')}
            >
              <FaPlus /> Add Fuel Record
            </button>
          </div>

          {/* Records Table */}
          <div className="bg-white rounded-xl shadow border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold">All Fuel Records</h3>
              <div className="text-sm text-gray-500">
                Showing {filteredRecords.length} records
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                {/* Table Headers */}
                <thead className="bg-gray-50">
                  <tr>
                    {columns.map((column, index) => (
                      <th key={index} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase" style={{ width: column.width }}>
                        {column.header}
                      </th>
                    ))}
                  </tr>
                </thead>
                {/* Table Body */}
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentRecords.map((record) => (
                    <tr key={record._id} className="hover:bg-gray-50">
                      {columns.map((column, index) => (
                        <td key={index} className="px-4 py-3 whitespace-nowrap" style={{ width: column.width }}>
                          {column.cell(record)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 mt-4">
            {/* Page size selector */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Rows per page:</span>
              <select
                className="border rounded px-2 py-1"
                value={recordsPerPage}
                onChange={e => { setRecordsPerPage(Number(e.target.value)); setCurrentPage(1); }}
              >
                {[10, 20, 50].map(size => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
            </div>
            {/* Pagination bar */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => paginate(1)}
                disabled={currentPage === 1}
                className={`px-2 py-1 rounded ${currentPage === 1 ? 'bg-gray-100 text-gray-400' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'}`}
                title="First Page"
              >
                {'<<'}
              </button>
              <button
                onClick={prevPage}
                disabled={currentPage === 1}
                className={`px-2 py-1 rounded ${currentPage === 1 ? 'bg-gray-100 text-gray-400' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'}`}
                title="Previous Page"
              >
                <FaChevronLeft />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(number =>
                  number === 1 ||
                  number === totalPages ||
                  Math.abs(number - currentPage) <= 1
                )
                .map((number, idx, arr) => (
                  <React.Fragment key={number}>
                    {idx > 0 && number - arr[idx - 1] > 1 && (
                      <span className="px-1">...</span>
                    )}
                    <button
                      onClick={() => paginate(number)}
                      className={`px-3 py-1 rounded ${currentPage === number ? 'bg-blue-600 text-white' : 'bg-gray-100 text-blue-700 hover:bg-blue-200'}`}
                    >
                      {number}
                    </button>
                  </React.Fragment>
                ))}
              <button
                onClick={nextPage}
                disabled={currentPage === totalPages}
                className={`px-2 py-1 rounded ${currentPage === totalPages ? 'bg-gray-100 text-gray-400' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'}`}
                title="Next Page"
              >
                <FaChevronRight />
              </button>
              <button
                onClick={() => paginate(totalPages)}
                disabled={currentPage === totalPages}
                className={`px-2 py-1 rounded ${currentPage === totalPages ? 'bg-gray-100 text-gray-400' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'}`}
                title="Last Page"
              >
                {'>>'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllFuelRecode;