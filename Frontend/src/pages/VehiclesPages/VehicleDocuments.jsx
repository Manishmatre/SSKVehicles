import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaFileAlt, FaUpload, FaSearch, FaTrash, FaDownload, FaEye, FaTimes } from 'react-icons/fa';

const VehicleDocuments = () => {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  // Modal state for document preview
const [previewModal, setPreviewModal] = useState({ open: false, url: '', type: '', fileName: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const [documentsPerPage, setDocumentsPerPage] = useState(10);

  // Fetch vehicles and documents
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log('VehicleDocuments: fetching vehicles');
        const vehiclesRes = await axios.get('http://localhost:7000/api/vehicles', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        console.log('VehicleDocuments: vehiclesRes:', vehiclesRes.data);
        if (vehiclesRes.data.success) {
          setVehicles(vehiclesRes.data.data);
        }

        // Fetch documents for all vehicles
        let allDocs = [];
        for (const v of vehiclesRes.data.data) {
          console.log('VehicleDocuments: fetching docs for vehicle', v._id);
          const docsRes = await axios.get(
            `http://localhost:7000/api/vehicles/${v._id}/documents`,
            { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
          );
          console.log('VehicleDocuments: docsRes for', v._id, docsRes.data);
          if (docsRes.data.success) {
            allDocs = allDocs.concat(docsRes.data.data);
          }
        }
        console.log('VehicleDocuments: allDocs aggregated:', allDocs);
        setDocuments(allDocs);
      } catch (err) {
        toast.error(err.response?.data?.error || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Filtering
  // Filtering
  const filteredDocuments = documents.filter(doc => {
    const matchesVehicle = selectedVehicle === 'all' || doc.vehicleId === selectedVehicle || doc.vehicleId?._id === selectedVehicle;
    // Normalize IDs and find vehicle
    const vid = String(doc.vehicleId?._id || doc.vehicleId);
    const vehicle = vehicles.find(v => v._id === vid) || {};
    const lower = searchTerm.toLowerCase();
    const matchesSearch = !searchTerm || (
      doc.documentType?.toLowerCase().includes(lower) ||
      doc.documentNumber?.toLowerCase().includes(lower) ||
      doc.fileName?.toLowerCase().includes(lower) ||
      vehicle.name?.toLowerCase().includes(lower) ||
      vehicle.number?.toLowerCase().includes(lower)
    );
    return matchesVehicle && matchesSearch;
  });

  // Pagination logic
  const totalDocuments = filteredDocuments.length;
  const totalPages = Math.ceil(totalDocuments / documentsPerPage);
  const paginatedDocuments = filteredDocuments.slice(
    (currentPage - 1) * documentsPerPage,
    currentPage * documentsPerPage
  );

  // Calculate current range for display
  const startIdx = totalDocuments === 0 ? 0 : (currentPage - 1) * documentsPerPage + 1;
  const endIdx = Math.min(currentPage * documentsPerPage, totalDocuments);

  // Reset to first page when search/filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedVehicle, documentsPerPage]);

  // Handle document delete
  const handleDelete = async (vehicleId, docId) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      try {
        const response = await axios.delete(
          `http://localhost:7000/api/vehicles/${vehicleId}/documents/${docId}`,
          { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
        );
        if (response.data.success) {
          setDocuments(docs => docs.filter(doc => doc._id !== docId));
          toast.success('Document deleted successfully');
        } else {
          toast.error(response.data.error || 'Failed to delete document');
        }
      } catch (err) {
        toast.error(err.response?.data?.error || 'Failed to delete document');
      }
    }
  };

  // Dummy upload handler
  const handleUpload = () => {
    navigate('/upload-vehicle-document');
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
                <h1 className="text-2xl font-bold text-gray-800">Vehicle Documents</h1>
                <p className="text-gray-600 mt-1">Manage all vehicle documents in one place</p>
              </div>
              <button
                onClick={handleUpload}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <FaUpload /> Upload Document
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex items-center gap-2 w-full md:w-auto">
                <label className="text-sm text-gray-600">Vehicle:</label>
                <select
                  value={selectedVehicle}
                  onChange={(e) => setSelectedVehicle(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                >
                  <option value="all">All Vehicles</option>
                  {vehicles.map(vehicle => (
                    <option key={vehicle._id} value={vehicle._id}>
                      {vehicle.name} ({vehicle.number})
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2 w-full">
                <FaSearch className="text-gray-500" />
                <input
                  type="text"
                  placeholder="Search documents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            {loading ? (
              <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-800">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                        Vehicle Information
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                        Document Details
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                        Files
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {paginatedDocuments.map((doc) => {
                      // Normalize vehicleId to string for matching
                      const vid = String(doc.vehicleId?._id || doc.vehicleId);
                      const vehicle = vehicles.find(v => v._id === vid);
                      const today = new Date();
                      const expiryDate = doc.expiryDate ? new Date(doc.expiryDate) : null;
                      const isExpired = expiryDate && expiryDate < today;
                      const expiresSoon = expiryDate &&
                        expiryDate > today &&
                        expiryDate < new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

                      return (
                        <tr key={doc._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-blue-600 font-medium">
                                  {vehicle?.number?.charAt(0) || 'V'}
                                </span>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {vehicle?.name || 'Unknown Vehicle'}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {vehicle?.number || 'No plate'}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">
                              {doc.documentType || 'Document'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {doc.documentNumber || 'No number'}
                            </div>
                            <div className="mt-1 text-xs text-gray-500">
                              {doc.issueDate ? `Issued: ${new Date(doc.issueDate).toLocaleDateString()}` : ''}
                              {expiryDate ? ` | Expires: ${expiryDate.toLocaleDateString()}` : ''}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {!expiryDate ? (
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                                No Expiry
                              </span>
                            ) : isExpired ? (
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                Expired
                              </span>
                            ) : expiresSoon ? (
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                Expires Soon
                              </span>
                            ) : (
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                Valid
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            {doc.fileUrl ? (
                              <div className="flex items-center">
                                <FaFileAlt className="flex-shrink-0 h-5 w-5 text-blue-400" />
                                <div className="ml-3">
                                  <div className="text-sm font-medium text-gray-900 truncate max-w-xs">
                                    {doc.fileName || 'Document'}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {doc.fileUrl.split('.').pop().toUpperCase()} file
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <span className="text-sm text-gray-500">No file attached</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              {(() => {
                                // DEBUG: Show the doc object in console for each row
                                console.log('Vehicle Document Row:', doc);
                                if (doc.fileUrl) {
                                  return (
                                    <>
                                      <button
                                        onClick={() => handlePreviewDocument(doc.fileUrl, doc.fileName)}
                                        className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                                        title="View Document"
                                        aria-label={`View ${doc.fileName || 'Document'}`}
                                      >
                                        <FaEye className="h-4 w-4" />
                                      </button>
                                      <button
                                        onClick={() => handleDownloadDocument(doc.fileUrl, doc.fileName)}
                                        className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50 flex items-center gap-1"
                                        title="Download Document"
                                        aria-label={`Download ${doc.fileName || 'Document'}`}
                                        disabled={!doc.fileUrl}
                                      >
                                        <FaDownload className="h-4 w-4" />
                                        <span className="ml-1 text-xs font-semibold">Download</span>
                                      </button>
                                    </>
                                  );
                                } else {
                                  // Show disabled download/view buttons with tooltips if file is missing
                                  return (
                                    <>
                                      <button
                                        disabled
                                        className="text-blue-300 p-1 rounded cursor-not-allowed"
                                        title="No file to view"
                                        aria-label="No file to view"
                                      >
                                        <FaEye className="h-4 w-4" />
                                      </button>
                                      <button
                                        disabled
                                        className="text-green-300 p-1 rounded cursor-not-allowed flex items-center gap-1"
                                        title="No file to download"
                                        aria-label="No file to download"
                                      >
                                        <FaDownload className="h-4 w-4" />
                                      </button>
                                    </>
                                  );
                                }
                              })()}
                              <button
                                onClick={() => handleDelete(String(doc.vehicleId?._id || doc.vehicleId), doc._id)}
                                className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                                title="Delete"
                                aria-label="Delete Document"
                              >
                                <FaTrash className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
            {/* Pagination Controls */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3 mt-4">
              {/* Left: Range and count */}
              <div className="text-sm text-gray-600">
                Showing <span className="font-semibold">{startIdx}</span> to <span className="font-semibold">{endIdx}</span> of <span className="font-semibold">{totalDocuments}</span> documents
              </div>
              {/* Center: Pagination */}
              {totalPages > 1 && (
                <div className="pagination flex items-center gap-1">
                  <button
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    className="px-2 py-1 border rounded disabled:opacity-50 font-semibold"
                  >
                    First
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-2 py-1 border rounded disabled:opacity-50 font-semibold"
                  >
                    Prev
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-2 py-1 border rounded font-semibold ${currentPage === page ? 'bg-blue-600 text-white border-blue-600' : 'hover:bg-gray-100'}`}
                      aria-current={currentPage === page ? 'page' : undefined}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-2 py-1 border rounded disabled:opacity-50 font-semibold"
                  >
                    Next
                  </button>
                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                    className="px-2 py-1 border rounded disabled:opacity-50 font-semibold"
                  >
                    Last
                  </button>
                </div>
              )}
              {/* Right: Per page selector */}
              <div className="flex items-center gap-2">
                <label htmlFor="docs-per-page" className="text-sm text-gray-600">Rows per page:</label>
                <select
                  id="docs-per-page"
                  value={documentsPerPage}
                  onChange={e => setDocumentsPerPage(Number(e.target.value))}
                  className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {[5, 10, 20, 50, 100].map(size => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

// Robust document download handler
function handleDownloadDocument(fileUrl) {
  if (!fileUrl) {
    alert('No file URL found for this document.');
    return;
  }
  console.log('Download fileUrl:', fileUrl);
  // Open in a new tab for preview/download
  window.open(fileUrl, '_blank', 'noopener,noreferrer');
}



// Helper: Preview document handler
function handlePreviewDocument(fileUrl, fileName = '') {
  if (!fileUrl) return;
  const ext = (fileName || fileUrl).split('.').pop().toLowerCase();
  if (['pdf'].includes(ext)) {
    setPreviewModal({ open: true, url: fileUrl, type: 'pdf', fileName });
  } else if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(ext)) {
    setPreviewModal({ open: true, url: fileUrl, type: 'image', fileName });
  } else {
    setPreviewModal({ open: true, url: fileUrl, type: 'unsupported', fileName });
  }
}

export default VehicleDocuments;
