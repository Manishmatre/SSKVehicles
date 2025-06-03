import React, { useState } from "react";
import { FiSearch, FiPlus, FiEye, FiDownload, FiEdit, FiTrash2, FiFileText, FiX, FiUpload } from "react-icons/fi";
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';

const mockDocs = [
  { id: 1, name: "HR Policy.pdf", type: "PDF", uploader: "Admin", dept: "HR", date: "2025-04-10", status: "Active" },
  { id: 2, name: "Invoice_1234.docx", type: "Word", uploader: "John", dept: "Finance", date: "2025-04-12", status: "Active" },
  { id: 3, name: "Logo.png", type: "Image", uploader: "Jane", dept: "Marketing", date: "2025-03-29", status: "Archived" },
  { id: 4, name: "ProjectPlan.xlsx", type: "Excel", uploader: "Amit", dept: "Projects", date: "2025-04-01", status: "Active" },
];

const DocManagement = () => {
  const [search, setSearch] = useState("");
  const [showUpload, setShowUpload] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewDoc, setPreviewDoc] = useState(null);

  const openPreview = (doc) => {
    setPreviewDoc(doc);
    setShowPreview(true);
  };

  const closePreview = () => {
    setShowPreview(false);
    setPreviewDoc(null);
  };

  return (
    <div className="w-screen h-screen bg-gray-50">
      <Header />
      <div className="flex w-screen h-full pt-15">
        <Sidebar />
        <div className="w-full h-full overflow-y-scroll p-5">
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Document Management</h1>
                <div className="text-gray-500 text-sm">Manage all company documents in one place</div>
              </div>
              <div className="flex flex-col md:flex-row gap-2 items-center">
                <div className="relative w-full md:w-64">
                  <FiSearch className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                    placeholder="Search documents..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                </div>
                <button
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow"
                  onClick={() => setShowUpload(true)}
                >
                  <FiPlus /> Add Document
                </button>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="bg-white rounded-xl shadow p-4 overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-100 text-gray-600 uppercase">
                  <tr>
                    <th className="px-4 py-2">Name</th>
                    <th className="px-4 py-2">Type</th>
                    <th className="px-4 py-2">Uploaded By</th>
                    <th className="px-4 py-2">Department</th>
                    <th className="px-4 py-2">Date</th>
                    <th className="px-4 py-2">Status</th>
                    <th className="px-4 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {mockDocs
                    .filter(doc => doc.name.toLowerCase().includes(search.toLowerCase()))
                    .map(doc => (
                      <tr key={doc.id} className="border-b last:border-0 hover:bg-gray-50">
                        <td className="px-4 py-2 font-medium flex items-center gap-2">
                          <FiFileText className="text-blue-400" />
                          {doc.name}
                        </td>
                        <td className="px-4 py-2">{doc.type}</td>
                        <td className="px-4 py-2">{doc.uploader}</td>
                        <td className="px-4 py-2">{doc.dept}</td>
                        <td className="px-4 py-2">{doc.date}</td>
                        <td className="px-4 py-2">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${doc.status === "Active" ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-500"}`}>{doc.status}</span>
                        </td>
                        <td className="px-4 py-2 flex gap-2">
                          <button title="View" onClick={() => openPreview(doc)} className="p-2 rounded hover:bg-blue-50"><FiEye className="text-blue-600" /></button>
                          <button title="Download" className="p-2 rounded hover:bg-green-50"><FiDownload className="text-green-600" /></button>
                          <button title="Edit" className="p-2 rounded hover:bg-yellow-50"><FiEdit className="text-yellow-600" /></button>
                          <button title="Delete" className="p-2 rounded hover:bg-red-50"><FiTrash2 className="text-red-600" /></button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
            {showUpload && (
              <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center">
                <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md relative">
                  <button className="absolute top-3 right-3 p-2 rounded hover:bg-gray-100" onClick={() => setShowUpload(false)}>
                    <FiX className="text-gray-400 text-xl" />
                  </button>
                  <div className="flex items-center gap-2 mb-4">
                    <FiUpload className="text-blue-500 text-2xl" />
                    <h2 className="text-lg font-semibold">Upload Document</h2>
                  </div>
                  <form className="flex flex-col gap-4">
                    <input type="text" placeholder="Document Name" className="border px-3 py-2 rounded" />
                    <select className="border px-3 py-2 rounded">
                      <option>Type</option>
                      <option>PDF</option>
                      <option>Word</option>
                      <option>Excel</option>
                      <option>Image</option>
                    </select>
                    <input type="file" className="border px-3 py-2 rounded" />
                    <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Upload</button>
                  </form>
                </div>
              </div>
            )}
            {showPreview && previewDoc && (
              <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center">
                <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-lg relative">
                  <button className="absolute top-3 right-3 p-2 rounded hover:bg-gray-100" onClick={closePreview}>
                    <FiX className="text-gray-400 text-xl" />
                  </button>
                  <div className="flex items-center gap-2 mb-4">
                    <FiFileText className="text-blue-500 text-2xl" />
                    <h2 className="text-lg font-semibold">{previewDoc.name}</h2>
                  </div>
                  <div className="bg-gray-100 rounded p-6 flex items-center justify-center text-gray-400">
                    [Document Preview Placeholder]
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocManagement;
