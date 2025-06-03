import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import api from "../../utils/api";
import { FaCar, FaWrench, FaCalendarAlt, FaGasPump, FaTachometerAlt, FaInfoCircle, FaChevronLeft, FaFileAlt } from "react-icons/fa";

import { FaEye, FaDownload } from "react-icons/fa";

// Inline handlers to avoid cross-file context issues
function handlePreviewDocument(fileUrl, fileName = '') {
  if (!fileUrl) return;
  const ext = (fileName || fileUrl).split('.').pop().toLowerCase();
  // If you have a preview modal, trigger it here; otherwise, open in new tab
  if (["pdf"].includes(ext)) {
    window.open(fileUrl, '_blank', 'noopener,noreferrer');
  } else if (["jpg", "jpeg", "png", "gif", "bmp", "webp"].includes(ext)) {
    window.open(fileUrl, '_blank', 'noopener,noreferrer');
  } else {
    window.open(fileUrl, '_blank', 'noopener,noreferrer');
  }
}

function handleDownloadDocument(fileUrl, fileName = 'document') {
  if (!fileUrl) {
    alert('No file URL found for this document.');
    return;
  }
  // Force download via anchor
  const link = document.createElement('a');
  link.href = fileUrl;
  link.download = fileName || 'document';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}


const VehicleDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Insurance records state
  const [insuranceRecords, setInsuranceRecords] = useState([]);
  const [insuranceLoading, setInsuranceLoading] = useState(true);
  const [insuranceError, setInsuranceError] = useState(null);

  // Vehicle documents state
  const [vehicleDocuments, setVehicleDocuments] = useState([]);
  const [documentsLoading, setDocumentsLoading] = useState(true);

  useEffect(() => {
    const fetchVehicleDetails = async () => {
      try {
        const response = await api.get(`/vehicles/${id}`);
        if (response.data.success) {
          setVehicle(response.data.data);
        } else {
          setError(response.data.error || "Failed to fetch vehicle details");
        }
      } catch (err) {
        setError(err?.error || "Failed to fetch vehicle details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    const fetchInsuranceRecords = async () => {
      try {
        setInsuranceLoading(true);
        const response = await api.get(`/insurance-records/vehicle/${id}/records`);
        if (response.data.success) {
          setInsuranceRecords(response.data.data);
        } else {
          setInsuranceError(response.data.error || "Failed to fetch insurance records");
        }
      } catch (err) {
        setInsuranceError(err?.error || "Failed to fetch insurance records");
      } finally {
        setInsuranceLoading(false);
      }
    };

    const fetchVehicleDocuments = async () => {
      try {
        setDocumentsLoading(true);
        // Use the same endpoint as VehicleDocuments.jsx
        const response = await api.get(`/vehicles/${id}/documents`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setVehicleDocuments(response.data.data || []);
      } catch (err) {
        setVehicleDocuments([]);
      } finally {
        setDocumentsLoading(false);
      }
    };


    if (id) {
      fetchVehicleDetails();
      fetchInsuranceRecords();
      fetchVehicleDocuments();
    } else {
      setError("No vehicle ID provided");
      setLoading(false);
      setInsuranceLoading(false);
    }
  }, [id]);

  if (loading) {
    return (
      <div className="w-screen h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-screen h-screen flex items-center justify-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="w-screen h-screen flex items-center justify-center">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          Vehicle not found
        </div>
      </div>
    );
  }

  // Calculate days until insurance expiry
  const daysUntilInsuranceExpiry = vehicle.insuranceExpireDate
    ? Math.ceil((new Date(vehicle.insuranceExpireDate) - new Date()) / (1000 * 60 * 60 * 24))
    : null;

  // Calculate days until next maintenance
  const daysUntilMaintenance = vehicle.nextMaintenance
    ? Math.ceil((new Date(vehicle.nextMaintenance) - new Date()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div className="w-screen h-screen">
      <Header />
      <div className="flex w-screen h-full pt-15">
        <Sidebar />
        <div className="w-full h-full overflow-y-scroll bg-gray-50 p-5">
          {/* Back Button */}
          <button
            onClick={() => navigate("/all-vehicles")}
            className="mb-4 text-blue-600 hover:text-blue-800 flex items-center"
          >
            <FaChevronLeft className="mr-1" /> Back to Vehicles
          </button>

          {/* Vehicle Header */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{vehicle.name}</h1>
                <p className="text-gray-500 mt-1">{vehicle.type} • {vehicle.number}</p>
              </div>
              <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                vehicle.status === 'Active' ? 'bg-green-100 text-green-800' :
                vehicle.status === 'Under Maintenance' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {vehicle.status}
              </span>
            </div>
          </div>

          {/* Vehicle Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <FaCar className="mr-2 text-blue-600" /> Basic Information
              </h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Make</p>
                    <p className="font-medium">{vehicle.make}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Model</p>
                    <p className="font-medium">{vehicle.model}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Year</p>
                    <p className="font-medium">{vehicle.year}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Color</p>
                    <p className="font-medium">{vehicle.color}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">VIN</p>
                    <p className="font-medium">{vehicle.vin}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Fuel Type</p>
                    <p className="font-medium">{vehicle.fuelType}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Insurance Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <FaInfoCircle className="mr-2 text-blue-600" /> Insurance Information
              </h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Provider</p>
                  <p className="font-medium">{vehicle.insuranceProvider || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Policy Number</p>
                  <p className="font-medium">{vehicle.insurancePolicyNumber || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Expiry Date</p>
                  <p className={`font-medium ${
                    daysUntilInsuranceExpiry && daysUntilInsuranceExpiry <= 30 ? 'text-red-600' : ''
                  }`}>
                    {vehicle.insuranceExpireDate
                      ? `${new Date(vehicle.insuranceExpireDate).toLocaleDateString()} 
                         (${daysUntilInsuranceExpiry} days remaining)`
                      : 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            {/* Maintenance Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <FaWrench className="mr-2 text-blue-600" /> Maintenance Information
              </h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Last Maintenance</p>
                  <p className="font-medium">
                    {vehicle.lastMaintenance
                      ? new Date(vehicle.lastMaintenance).toLocaleDateString()
                      : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Next Maintenance</p>
                  <p className={`font-medium ${
                    daysUntilMaintenance && daysUntilMaintenance <= 30 ? 'text-red-600' : ''
                  }`}>
                    {vehicle.nextMaintenance
                      ? `${new Date(vehicle.nextMaintenance).toLocaleDateString()} 
                         (${daysUntilMaintenance} days remaining)`
                      : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Current Mileage</p>
                  <p className="font-medium">{vehicle.mileage || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Purchase Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <FaCalendarAlt className="mr-2 text-blue-600" /> Purchase Information
              </h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Purchase Date</p>
                  <p className="font-medium">
                    {vehicle.purchaseDate
                      ? new Date(vehicle.purchaseDate).toLocaleDateString()
                      : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Purchase Price</p>
                  <p className="font-medium">
                    {vehicle.purchasePrice ? `$${vehicle.purchasePrice.toLocaleString()}` : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Insurance Records Section */}
          <div className="bg-white rounded-lg shadow p-6 mt-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <FaFileAlt className="mr-2 text-blue-600" /> Insurance Records
            </h2>
            {insuranceLoading ? (
              <div className="flex items-center space-x-2"><div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div><span>Loading insurance records...</span></div>
            ) : insuranceError ? (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded">{insuranceError}</div>
            ) : insuranceRecords.length === 0 ? (
              <div className="text-gray-500">No insurance records found for this vehicle.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Policy #</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Provider</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Start Date</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">End Date</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Premium</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Coverage</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Notes</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Documents</th>
                    </tr>
                  </thead>
                  <tbody>
                    {insuranceRecords.map(record => (
                      <tr key={record._id} className="bg-white border-b">
                        <td className="px-4 py-2 font-mono">{record.policyNumber}</td>
                        <td className="px-4 py-2">{record.provider}</td>
                        <td className="px-4 py-2">{record.startDate ? new Date(record.startDate).toLocaleDateString() : 'N/A'}</td>
                        <td className="px-4 py-2">{record.endDate ? new Date(record.endDate).toLocaleDateString() : 'N/A'}</td>
                        <td className="px-4 py-2">{record.premium ? `$${record.premium}` : 'N/A'}</td>
                        <td className="px-4 py-2">{record.coverage || 'N/A'}</td>
                        <td className="px-4 py-2">{record.notes || '-'}</td>
                        <td className="px-4 py-2">
                          {record.documents && record.documents.length > 0 ? (
                            <div className="flex flex-col space-y-1">
                              {record.documents.map((doc, idx) => (
                                <a
                                  key={idx}
                                  href={doc.url || '#'}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline flex items-center"
                                  download={doc.filename}
                                >
                                  <FaFileAlt className="mr-1" />
                                  {doc.filename || `Document ${idx + 1}`}
                                </a>
                              ))}
                            </div>
                          ) : (
                            <span className="text-gray-400">No files</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Vehicle Documents Section */}
          <div className="bg-white rounded-lg shadow p-6 mt-6">
            <h2 className="text-xl font-semibold mb-4">Vehicle Documents</h2>
            {documentsLoading ? (
              <div>Loading documents...</div>
            ) : vehicleDocuments.length === 0 ? (
              <div className="text-gray-500">No documents found for this vehicle.</div>
            ) : (
              <table className="min-w-full text-sm">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left text-gray-600 font-semibold">Type</th>
                    <th className="px-4 py-2 text-left text-gray-600 font-semibold">Name</th>
                    <th className="px-4 py-2 text-left text-gray-600 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {vehicleDocuments.map(doc => (
                    <tr key={doc._id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-2 font-medium text-gray-800">{doc.documentType}</td>
                      <td className="px-4 py-2 text-gray-700">{doc.fileName}</td>
                      <td className="px-4 py-2 flex gap-2">
                        <button onClick={() => handlePreviewDocument(doc.fileUrl, doc.fileName)} className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50" title="View Document" aria-label="View Document">
                          <FaEye className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleDownloadDocument(doc.fileUrl, doc.fileName)} className="text-green-600 hover:text-green-800 p-1 rounded hover:bg-green-50" title="Download Document" aria-label="Download Document">
                          <FaDownload className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Notes Section */}
          {vehicle.notes && (
            <div className="bg-white rounded-lg shadow p-6 mt-6">
              <h2 className="text-xl font-semibold mb-4">Additional Notes</h2>
              <p className="text-gray-700">{vehicle.notes}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 mt-6">
            <button
              onClick={() => navigate(`/edit-vehicle/${id}`)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Edit Vehicle
            </button>
            <button
              onClick={() => navigate("/all-vehicles")}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              Back to List
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleDetails;