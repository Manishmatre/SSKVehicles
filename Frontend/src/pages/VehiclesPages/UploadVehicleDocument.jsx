import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaUpload, FaTimes, FaPlus, FaArrowLeft } from 'react-icons/fa';

const documentTypes = [
  'RC Book',
  'Insurance',
  'PUC',
  'Fitness Certificate',
  'Road Tax',
  'Permit',
  'Vehicle Image',
  'Other'
];

export default function UploadVehicleDocument() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    vehicleId: '',
    documents: [
      {
        type: '',
        number: '',
        expiryDate: '',
        file: null,
        fileName: ''
      }
    ]
  });
  
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const res = await axios.get('http://localhost:7000/api/vehicles');
        setVehicles(res.data.data);
      } catch (err) {
        toast.error(err.response?.data?.error || 'Failed to fetch vehicles');
      }
    };
    fetchVehicles();
  }, []);

  const handleChange = (e, index) => {
    const { name, value } = e.target;
    const updatedDocuments = [...formData.documents];
    updatedDocuments[index] = {
      ...updatedDocuments[index],
      [name]: value
    };
    setFormData({
      ...formData,
      documents: updatedDocuments
    });
  };

  const handleFileChange = (e, index) => {
    const file = e.target.files[0];
    const updatedDocuments = [...formData.documents];
    updatedDocuments[index] = {
      ...updatedDocuments[index],
      file,
      fileName: file?.name || ''
    };
    setFormData({
      ...formData,
      documents: updatedDocuments
    });
  };

  const addDocumentField = () => {
    setFormData({
      ...formData,
      documents: [
        ...formData.documents,
        {
          type: '',
          number: '',
          expiryDate: '',
          file: null,
          fileName: ''
        }
      ]
    });
  };

  const removeDocumentField = (index) => {
    const updatedDocuments = [...formData.documents];
    updatedDocuments.splice(index, 1);
    setFormData({
      ...formData,
      documents: updatedDocuments
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const doc = formData.documents[0];
      const payload = new FormData();
      payload.append('file', doc.file);
      payload.append('documentType', doc.type || 'unknown');
      payload.append('documentNumber', doc.number || '');
      payload.append('expiryDate', doc.expiryDate || '');
      const vehicleId = formData.vehicleId;

      const response = await axios.post(
        `http://localhost:7000/api/vehicles/${vehicleId}/documents`,
        payload,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (response.data.success) {
        toast.success('Document uploaded and saved!');
        // Optionally redirect or reset form
        navigate('/vehicle-documents');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed, but we tried!');
      console.error('Upload error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-screen h-screen">
      <Header />
      <div className="flex w-screen h-full pt-15">
        <Sidebar />
        
        <div className="w-full h-full overflow-y-scroll p-5">
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <button
              type="button"
              onClick={() => navigate('/vehicle-documents')}
              className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
            >
              <FaArrowLeft className="mr-2" /> Back to Documents
            </button>
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Upload Vehicle Documents</h1>
            
            <form onSubmit={handleSubmit}>
              {/* Vehicle Selection */}
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Vehicle Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Select Vehicle</label>
                    <select
                      name="vehicleId"
                      value={formData.vehicleId}
                      onChange={(e) => setFormData({...formData, vehicleId: e.target.value})}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">Select Vehicle</option>
                      {vehicles.map(vehicle => (
                        <option key={vehicle._id} value={vehicle._id}>
                          {vehicle.name} - {vehicle.number}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Documents Section */}
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Documents</h2>
                
                {formData.documents.map((doc, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-6 mb-4 border border-gray-200 relative">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Document Type</label>
                        <select
                          name="type"
                          value={doc.type}
                          onChange={(e) => handleChange(e, index)}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                        >
                          <option value="">Select Type</option>
                          {documentTypes.map(type => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Document Number</label>
                        <input
                          type="text"
                          name="number"
                          value={doc.number}
                          onChange={(e) => handleChange(e, index)}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Document number"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                        <input
                          type="date"
                          name="expiryDate"
                          value={doc.expiryDate}
                          onChange={(e) => handleChange(e, index)}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Document File</label>
                      <div className="mt-1 flex items-center">
                        <label className="cursor-pointer bg-blue-50 hover:bg-blue-100 text-blue-700 px-4 py-2 rounded-md border border-blue-200 flex items-center">
                          <FaUpload className="mr-2" />
                          Choose File
                          <input
                            type="file"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files[0];
                              const allowedTypes = [
                                'application/pdf',
                                'application/msword',
                                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                                'image/jpeg',
                                'image/png'
                              ];
                              if (file && !allowedTypes.includes(file.type)) {
                                alert('Invalid file type. Only PDF, DOC, DOCX, JPG, and PNG are allowed.');
                                e.target.value = '';
                                return;
                              }
                              handleFileChange(e, index);
                            }}
                            accept=".pdf,.doc,.docx,image/jpeg,image/png"
                            required
                          />
                        </label>
                        {doc.fileName && (
                          <span className="ml-3 flex items-center">
                            {doc.fileName}
                            <button
                              type="button"
                              onClick={() => {
                                const updatedDocuments = [...formData.documents];
                                updatedDocuments[index] = {
                                  ...updatedDocuments[index],
                                  file: null,
                                  fileName: ''
                                };
                                setFormData({
                                  ...formData,
                                  documents: updatedDocuments
                                });
                              }}
                              className="ml-2 text-red-500"
                            >
                              <FaTimes />
                            </button>
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        Supported formats: PDF, DOC, DOCX, JPG, PNG (Max 5MB). Files are validated on the backend as well.
                      </p>
                    </div>
                    
                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() => removeDocumentField(index)}
                        className="absolute top-4 right-4 text-red-500 hover:text-red-700"
                      >
                        <FaTimes />
                      </button>
                    )}
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addDocumentField}
                  className="mt-4 flex items-center text-blue-600 hover:text-blue-800"
                >
                  <FaPlus className="mr-2" /> Add Another Document
                </button>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => navigate('/vehicle-documents')}
                  className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Uploading...' : 'Upload Documents'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
