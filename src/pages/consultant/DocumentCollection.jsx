import React, { useState, useEffect } from "react";
import {
  Upload,
  FileText,
  Download,
  Eye,
  Trash2,
  Plus,
  Search,
  Filter,
  Calendar,
  User,
  AlertCircle,
  CheckCircle,
  Clock,
  X,
  FolderOpen,
  ExternalLink,
} from "lucide-react";
import useConsultantStore from "../../stores/consultantStore";

const DOCUMENT_TYPES = [
  "passport",
  "transcript",
  "diploma",
  "recommendation_letter",
  "personal_statement",
  "cv_resume",
  "financial_documents",
  "test_scores",
  "portfolio",
  "other",
];

const DocumentCollection = () => {
  const {
    leads,
    documents,
    loading,
    error,
    fetchLeads,
    fetchLeadDocuments,
    uploadDocument,
    trackDocumentSubmission,
    setLoading,
    clearError,
  } = useConsultantStore();

  const [selectedLead, setSelectedLead] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showDocumentsModal, setShowDocumentsModal] = useState(false);
  const [uploadFiles, setUploadFiles] = useState([]);
  const [uploadTypes, setUploadTypes] = useState([]);
  const [uploadNotes, setUploadNotes] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [previewDocument, setPreviewDocument] = useState(null);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        clearError();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      lead.student?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.student?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || lead.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleViewDocuments = async (lead) => {
    setSelectedLead(lead);
    setShowDocumentsModal(true);
    await fetchLeadDocuments(lead.id);
  };

  const handleFileUpload = (files) => {
    const newFiles = Array.from(files);
    setUploadFiles((prev) => [...prev, ...newFiles]);
    setUploadTypes((prev) => [...prev, ...newFiles.map(() => "other")]);
    setUploadNotes((prev) => [...prev, ...newFiles.map(() => "")]);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  const removeUploadFile = (index) => {
    setUploadFiles((prev) => prev.filter((_, i) => i !== index));
    setUploadTypes((prev) => prev.filter((_, i) => i !== index));
    setUploadNotes((prev) => prev.filter((_, i) => i !== index));
  };

  const updateUploadType = (index, type) => {
    setUploadTypes((prev) => prev.map((t, i) => (i === index ? type : t)));
  };

  const updateUploadNote = (index, note) => {
    setUploadNotes((prev) => prev.map((n, i) => (i === index ? note : n)));
  };

  const handleUploadSubmit = async () => {
    if (!selectedLead || uploadFiles.length === 0) return;

    try {
      setLoading(true);
      const formData = new FormData();

      uploadFiles.forEach((file) => {
        formData.append("files", file);
      });

      formData.append("types", JSON.stringify(uploadTypes));
      formData.append("notes", JSON.stringify(uploadNotes));

      await uploadDocument(selectedLead.id, formData);

      // Reset upload state
      setUploadFiles([]);
      setUploadTypes([]);
      setUploadNotes([]);
      setShowUploadModal(false);

      // Refresh documents
      await fetchLeadDocuments(selectedLead.id);
    } catch (error) {
      console.error("Upload failed:", error);
    }
  };

  const handleViewDocument = (document) => {
    // Open document in new tab for viewing
    const fileUrl = `${
      import.meta.env.VITE_API_BASE_URL || "http://localhost:5009/api/v1"
    }/file/documents/${document.id}`;
    window.open(fileUrl, "_blank");
  };

  const handleDownloadDocument = (document) => {
    // Download document
    const fileUrl = `${
      import.meta.env.VITE_API_BASE_URL || "http://localhost:5009/api/v1"
    }/file/documents/${document.id}`;
    const link = document.createElement("a");
    link.href = fileUrl;
    link.download = `${document.type}_${document.id}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "new":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "in_progress":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "converted":
        return "bg-green-100 text-green-800 border-green-200";
      case "lost":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDocumentType = (type) => {
    return type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const getDocumentIcon = (type) => {
    const iconClass = "h-5 w-5";
    switch (type) {
      case "passport":
        return <FileText className={`${iconClass} text-blue-600`} />;
      case "transcript":
        return <FileText className={`${iconClass} text-green-600`} />;
      case "diploma":
        return <FileText className={`${iconClass} text-purple-600`} />;
      default:
        return <FileText className={`${iconClass} text-gray-600`} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Document Collection
              </h1>
              <p className="text-gray-600 mt-2">
                Manage and collect student documents efficiently
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
                <span className="text-sm text-gray-600">Total Students: </span>
                <span className="font-semibold text-gray-900">
                  {leads.length}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 shadow-sm">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
            <p className="text-red-700">{error}</p>
            <button
              onClick={clearError}
              className="ml-auto text-red-500 hover:text-red-700 rounded-lg p-1"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          {/* Search and Filter Header */}
          <div className="p-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <h2 className="text-xl font-semibold">My Students</h2>
              <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search students..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full md:w-64 pl-10 pr-4 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-white focus:border-transparent"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full md:w-40 px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-white focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="new">New</option>
                  <option value="in_progress">In Progress</option>
                  <option value="converted">Converted</option>
                  <option value="lost">Lost</option>
                </select>
              </div>
            </div>
          </div>

          {/* Students Grid */}
          <div className="p-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-500 mt-4">Loading students...</p>
              </div>
            ) : filteredLeads.length === 0 ? (
              <div className="text-center py-12">
                <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No students found</p>
                <p className="text-gray-400 text-sm">
                  Try adjusting your search or filter criteria
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredLeads.map((lead) => (
                  <div
                    key={lead.id}
                    className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-200 hover:border-blue-300 group"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg shadow-md">
                          {lead.student?.name?.charAt(0) || "S"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 truncate">
                            {lead.student?.name || "Unknown"}
                          </h3>
                          <p className="text-sm text-gray-500 truncate">
                            {lead.student?.email}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                          lead.status
                        )}`}
                      >
                        {lead.status.replace("_", " ").toUpperCase()}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleViewDocuments(lead)}
                        className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                      >
                        <FolderOpen className="h-4 w-4" />
                        View Documents
                      </button>
                      <button
                        onClick={() => {
                          setSelectedLead(lead);
                          setShowUploadModal(true);
                        }}
                        className="bg-green-50 hover:bg-green-100 text-green-700 p-2 rounded-lg transition-colors"
                        title="Upload Documents"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Documents Modal */}
      {showDocumentsModal && selectedLead && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                    {selectedLead.student?.name?.charAt(0) || "S"}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">
                      {selectedLead.student?.name}
                    </h3>
                    <p className="text-blue-100">
                      {selectedLead.student?.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowUploadModal(true)}
                    className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    Upload
                  </button>
                  <button
                    onClick={() => setShowDocumentsModal(false)}
                    className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Documents Content */}
            <div className="p-6 max-h-[70vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h4 className="text-lg font-semibold text-gray-900">
                  Documents
                </h4>
                <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                  {documents.length} document{documents.length !== 1 ? "s" : ""}
                </div>
              </div>

              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-500 mt-4">Loading documents...</p>
                </div>
              ) : documents.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg mb-2">
                    No documents uploaded yet
                  </p>
                  <p className="text-gray-400 text-sm mb-6">
                    Upload the first document to get started
                  </p>
                  <button
                    onClick={() => setShowUploadModal(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
                  >
                    Upload First Document
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow bg-gray-50"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            {getDocumentIcon(doc.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h5 className="font-medium text-gray-900 truncate">
                              {formatDocumentType(doc.type)}
                            </h5>
                            <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                              <Calendar className="h-3 w-3" />
                              <span>
                                {new Date(doc.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {doc.notes && (
                        <p className="text-sm text-gray-600 mb-3 bg-white p-2 rounded-lg">
                          {doc.notes}
                        </p>
                      )}

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewDocument(doc)}
                          className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                        >
                          <Eye className="h-4 w-4" />
                          View
                        </button>
                        <button
                          onClick={() => handleDownloadDocument(doc)}
                          className="flex-1 bg-green-50 hover:bg-green-100 text-green-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                        >
                          <Download className="h-4 w-4" />
                          Download
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && selectedLead && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">
                  Upload Documents
                </h3>
                <button
                  onClick={() => {
                    setShowUploadModal(false);
                    setUploadFiles([]);
                    setUploadTypes([]);
                    setUploadNotes([]);
                  }}
                  className="text-gray-400 hover:text-gray-600 rounded-lg p-1"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <p className="text-gray-600 mt-2">
                Upload documents for{" "}
                <span className="font-medium">
                  {selectedLead.student?.name}
                </span>
              </p>
            </div>

            <div className="p-6">
              {/* Drag and Drop Area */}
              <div
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
                  dragActive
                    ? "border-blue-500 bg-blue-50 scale-105"
                    : "border-gray-300 hover:border-gray-400"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2 font-medium">
                  Drag and drop files here, or click to select
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  Support for multiple files, max 10MB each
                </p>
                <input
                  type="file"
                  multiple
                  onChange={(e) => handleFileUpload(e.target.files)}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg cursor-pointer transition-colors inline-block font-medium"
                >
                  Choose Files
                </label>
              </div>

              {/* File List */}
              {uploadFiles.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-semibold text-gray-900 mb-4">
                    Selected Files ({uploadFiles.length})
                  </h4>
                  <div className="space-y-4 max-h-64 overflow-y-auto">
                    {uploadFiles.map((file, index) => (
                      <div
                        key={index}
                        className="border border-gray-200 rounded-xl p-4 bg-gray-50"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                              <FileText className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                {file.name}
                              </p>
                              <p className="text-sm text-gray-500">
                                {formatFileSize(file.size)}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => removeUploadFile(index)}
                            className="text-gray-400 hover:text-red-600 p-1 rounded-lg hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Document Type
                            </label>
                            <select
                              value={uploadTypes[index] || "other"}
                              onChange={(e) =>
                                updateUploadType(index, e.target.value)
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                              {DOCUMENT_TYPES.map((type) => (
                                <option key={type} value={type}>
                                  {formatDocumentType(type)}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Notes (Optional)
                            </label>
                            <input
                              type="text"
                              value={uploadNotes[index] || ""}
                              onChange={(e) =>
                                updateUploadNote(index, e.target.value)
                              }
                              placeholder="Add notes..."
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowUploadModal(false);
                    setUploadFiles([]);
                    setUploadTypes([]);
                    setUploadNotes([]);
                  }}
                  className="px-6 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUploadSubmit}
                  disabled={uploadFiles.length === 0 || loading}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      Upload {uploadFiles.length} Document
                      {uploadFiles.length !== 1 ? "s" : ""}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentCollection;

// import React, { useState, useEffect } from "react";
// import {
//   Upload,
//   FileText,
//   Download,
//   Eye,
//   Trash2,
//   Plus,
//   Search,
//   Filter,
//   Calendar,
//   User,
//   AlertCircle,
//   CheckCircle,
//   Clock,
//   X,
//   FolderOpen,
//   ExternalLink,
// } from "lucide-react";
// import useConsultantStore from "../../stores/consultantStore";

// const DOCUMENT_TYPES = [
//   "passport",
//   "transcript",
//   "diploma",
//   "recommendation_letter",
//   "personal_statement",
//   "cv_resume",
//   "financial_documents",
//   "test_scores",
//   "portfolio",
//   "other",
// ];

// const DocumentCollection = () => {
//   const {
//     leads,
//     documents,
//     loading,
//     error,
//     fetchLeads,
//     fetchLeadDocuments,
//     uploadDocument,
//     trackDocumentSubmission,
//     setLoading,
//     clearError,
//   } = useConsultantStore();

//   const [selectedLead, setSelectedLead] = useState(null);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [statusFilter, setStatusFilter] = useState("all");
//   const [showUploadModal, setShowUploadModal] = useState(false);
//   const [showDocumentsModal, setShowDocumentsModal] = useState(false);
//   const [uploadFiles, setUploadFiles] = useState([]);
//   const [uploadTypes, setUploadTypes] = useState([]);
//   const [uploadNotes, setUploadNotes] = useState([]);
//   const [dragActive, setDragActive] = useState(false);
//   const [previewDocument, setPreviewDocument] = useState(null);

//   useEffect(() => {
//     fetchLeads();
//   }, [fetchLeads]);

//   useEffect(() => {
//     if (error) {
//       const timer = setTimeout(() => {
//         clearError();
//       }, 5000);
//       return () => clearTimeout(timer);
//     }
//   }, [error, clearError]);

//   const filteredLeads = leads.filter((lead) => {
//     const matchesSearch =
//       lead.student?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       lead.student?.email?.toLowerCase().includes(searchTerm.toLowerCase());
//     const matchesStatus =
//       statusFilter === "all" || lead.status === statusFilter;
//     return matchesSearch && matchesStatus;
//   });

//   const handleViewDocuments = async (lead) => {
//     setSelectedLead(lead);
//     setShowDocumentsModal(true);
//     await fetchLeadDocuments(lead.id);
//   };

//   const handleFileUpload = (files) => {
//     const newFiles = Array.from(files);
//     setUploadFiles((prev) => [...prev, ...newFiles]);
//     setUploadTypes((prev) => [...prev, ...newFiles.map(() => "other")]);
//     setUploadNotes((prev) => [...prev, ...newFiles.map(() => "")]);
//   };

//   const handleDrag = (e) => {
//     e.preventDefault();
//     e.stopPropagation();
//     if (e.type === "dragenter" || e.type === "dragover") {
//       setDragActive(true);
//     } else if (e.type === "dragleave") {
//       setDragActive(false);
//     }
//   };

//   const handleDrop = (e) => {
//     e.preventDefault();
//     e.stopPropagation();
//     setDragActive(false);

//     if (e.dataTransfer.files && e.dataTransfer.files[0]) {
//       handleFileUpload(e.dataTransfer.files);
//     }
//   };

//   const removeUploadFile = (index) => {
//     setUploadFiles((prev) => prev.filter((_, i) => i !== index));
//     setUploadTypes((prev) => prev.filter((_, i) => i !== index));
//     setUploadNotes((prev) => prev.filter((_, i) => i !== index));
//   };

//   const updateUploadType = (index, type) => {
//     setUploadTypes((prev) => prev.map((t, i) => (i === index ? type : t)));
//   };

//   const updateUploadNote = (index, note) => {
//     setUploadNotes((prev) => prev.map((n, i) => (i === index ? note : n)));
//   };

//   const handleUploadSubmit = async () => {
//     if (!selectedLead || uploadFiles.length === 0) return;

//     try {
//       setLoading(true);
//       const formData = new FormData();

//       uploadFiles.forEach((file) => {
//         formData.append("files", file);
//       });

//       formData.append("types", JSON.stringify(uploadTypes));
//       formData.append("notes", JSON.stringify(uploadNotes));

//       await uploadDocument(selectedLead.id, formData);

//       // Reset upload state
//       setUploadFiles([]);
//       setUploadTypes([]);
//       setUploadNotes([]);
//       setShowUploadModal(false);

//       // Refresh documents
//       await fetchLeadDocuments(selectedLead.id);
//     } catch (error) {
//       console.error("Upload failed:", error);
//     }
//   };

//   const handleViewDocument = (document) => {
//     // Open document in new tab for viewing
//     const fileUrl = `${import.meta.env.VITE_API_BASE_URL}/file/documents/${
//       document.id
//     }`;
//     window.open(fileUrl, "_blank");
//   };

//   const handleDownloadDocument = async (doc) => {
//     try {
//       const fileUrl = `${import.meta.env.VITE_API_BASE_URL}/file/documents/${
//         doc.id
//       }`;

//       // Fetch the file as blob
//       const response = await fetch(fileUrl);
//       const blob = await response.blob();

//       // Create download link
//       const link = document.createElement("a");
//       link.href = URL.createObjectURL(blob);
//       link.download = `${doc.type}_${doc.id}`;
//       document.body.appendChild(link);
//       link.click();
//       document.body.removeChild(link);

//       // Clean up the blob URL
//       URL.revokeObjectURL(link.href);
//     } catch (error) {
//       console.error("Download failed:", error);
//     }
//   };

//   const getStatusColor = (status) => {
//     switch (status) {
//       case "new":
//         return "bg-blue-100 text-blue-800 border-blue-200";
//       case "in_progress":
//         return "bg-yellow-100 text-yellow-800 border-yellow-200";
//       case "converted":
//         return "bg-green-100 text-green-800 border-green-200";
//       case "lost":
//         return "bg-red-100 text-red-800 border-red-200";
//       default:
//         return "bg-gray-100 text-gray-800 border-gray-200";
//     }
//   };

//   const formatFileSize = (bytes) => {
//     if (bytes === 0) return "0 Bytes";
//     const k = 1024;
//     const sizes = ["Bytes", "KB", "MB", "GB"];
//     const i = Math.floor(Math.log(bytes) / Math.log(k));
//     return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
//   };

//   const formatDocumentType = (type) => {
//     return type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
//   };

//   const getDocumentIcon = (type) => {
//     const iconClass = "h-5 w-5";
//     switch (type) {
//       case "passport":
//         return <FileText className={`${iconClass} text-blue-600`} />;
//       case "transcript":
//         return <FileText className={`${iconClass} text-green-600`} />;
//       case "diploma":
//         return <FileText className={`${iconClass} text-purple-600`} />;
//       default:
//         return <FileText className={`${iconClass} text-gray-600`} />;
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
//       <div className="max-w-7xl mx-auto">
//         {/* Header */}
//         <div className="mb-8">
//           <div className="flex justify-between items-center">
//             <div>
//               <h1 className="text-3xl font-bold text-gray-900">
//                 Document Collection
//               </h1>
//               <p className="text-gray-600 mt-2">
//                 Manage and collect student documents efficiently
//               </p>
//             </div>
//             <div className="flex items-center gap-3">
//               <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
//                 <span className="text-sm text-gray-600">Total Students: </span>
//                 <span className="font-semibold text-gray-900">
//                   {leads.length}
//                 </span>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Error Message */}
//         {error && (
//           <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 shadow-sm">
//             <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
//             <p className="text-red-700">{error}</p>
//             <button
//               onClick={clearError}
//               className="ml-auto text-red-500 hover:text-red-700 rounded-lg p-1"
//             >
//               <X className="h-4 w-4" />
//             </button>
//           </div>
//         )}

//         {/* Main Content */}
//         <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
//           {/* Search and Filter Header */}
//           <div className="p-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
//             <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
//               <h2 className="text-xl font-semibold">My Students</h2>
//               <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
//                 <div className="relative">
//                   <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
//                   <input
//                     type="text"
//                     placeholder="Search students..."
//                     value={searchTerm}
//                     onChange={(e) => setSearchTerm(e.target.value)}
//                     className="w-full md:w-64 pl-10 pr-4 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-white focus:border-transparent"
//                   />
//                 </div>

//                 <select
//                   value={statusFilter}
//                   onChange={(e) => setStatusFilter(e.target.value)}
//                   className="w-full md:w-40 px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-white focus:border-transparent"
//                 >
//                   <option value="all">All Status</option>
//                   <option value="new">New</option>
//                   <option value="in_progress">In Progress</option>
//                   <option value="converted">Converted</option>
//                   <option value="lost">Lost</option>
//                 </select>
//               </div>
//             </div>
//           </div>

//           {/* Students Grid */}
//           <div className="p-6">
//             {loading ? (
//               <div className="text-center py-12">
//                 <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
//                 <p className="text-gray-500 mt-4">Loading students...</p>
//               </div>
//             ) : filteredLeads.length === 0 ? (
//               <div className="text-center py-12">
//                 <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
//                 <p className="text-gray-500 text-lg">No students found</p>
//                 <p className="text-gray-400 text-sm">
//                   Try adjusting your search or filter criteria
//                 </p>
//               </div>
//             ) : (
//               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
//                 {filteredLeads.map((lead) => (
//                   <div
//                     key={lead.id}
//                     className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-200 hover:border-blue-300 group"
//                   >
//                     <div className="flex items-center justify-between mb-4">
//                       <div className="flex items-center gap-3">
//                         <div className="h-12 w-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg shadow-md">
//                           {lead.student?.name?.charAt(0) || "S"}
//                         </div>
//                         <div className="flex-1 min-w-0">
//                           <h3 className="font-semibold text-gray-900 truncate">
//                             {lead.student?.name || "Unknown"}
//                           </h3>
//                           <p className="text-sm text-gray-500 truncate">
//                             {lead.student?.email}
//                           </p>
//                         </div>
//                       </div>
//                     </div>

//                     <div className="mb-4">
//                       <span
//                         className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
//                           lead.status
//                         )}`}
//                       >
//                         {lead.status.replace("_", " ").toUpperCase()}
//                       </span>
//                     </div>

//                     <div className="flex items-center gap-2">
//                       <button
//                         onClick={() => handleViewDocuments(lead)}
//                         className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
//                       >
//                         <FolderOpen className="h-4 w-4" />
//                         View Documents
//                       </button>
//                       <button
//                         onClick={() => {
//                           setSelectedLead(lead);
//                           setShowUploadModal(true);
//                         }}
//                         className="bg-green-50 hover:bg-green-100 text-green-700 p-2 rounded-lg transition-colors"
//                         title="Upload Documents"
//                       >
//                         <Plus className="h-4 w-4" />
//                       </button>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Documents Modal */}
//       {showDocumentsModal && selectedLead && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
//           <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
//             {/* Modal Header */}
//             <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
//               <div className="flex items-center justify-between">
//                 <div className="flex items-center gap-4">
//                   <div className="h-12 w-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-white font-semibold text-lg">
//                     {selectedLead.student?.name?.charAt(0) || "S"}
//                   </div>
//                   <div>
//                     <h3 className="text-xl font-semibold">
//                       {selectedLead.student?.name}
//                     </h3>
//                     <p className="text-blue-100">
//                       {selectedLead.student?.email}
//                     </p>
//                   </div>
//                 </div>
//                 <div className="flex items-center gap-3">
//                   <button
//                     onClick={() => setShowUploadModal(true)}
//                     className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
//                   >
//                     <Plus className="h-4 w-4" />
//                     Upload
//                   </button>
//                   <button
//                     onClick={() => setShowDocumentsModal(false)}
//                     className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-colors"
//                   >
//                     <X className="h-5 w-5" />
//                   </button>
//                 </div>
//               </div>
//             </div>

//             {/* Documents Content */}
//             <div className="p-6 max-h-[70vh] overflow-y-auto">
//               <div className="flex items-center justify-between mb-6">
//                 <h4 className="text-lg font-semibold text-gray-900">
//                   Documents
//                 </h4>
//                 <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
//                   {documents.length} document{documents.length !== 1 ? "s" : ""}
//                 </div>
//               </div>

//               {loading ? (
//                 <div className="text-center py-12">
//                   <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
//                   <p className="text-gray-500 mt-4">Loading documents...</p>
//                 </div>
//               ) : documents.length === 0 ? (
//                 <div className="text-center py-12">
//                   <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
//                   <p className="text-gray-500 text-lg mb-2">
//                     No documents uploaded yet
//                   </p>
//                   <p className="text-gray-400 text-sm mb-6">
//                     Upload the first document to get started
//                   </p>
//                   <button
//                     onClick={() => setShowUploadModal(true)}
//                     className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
//                   >
//                     Upload First Document
//                   </button>
//                 </div>
//               ) : (
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   {documents.map((doc) => (
//                     <div
//                       key={doc.id}
//                       className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow bg-gray-50"
//                     >
//                       <div className="flex items-start justify-between mb-3">
//                         <div className="flex items-center gap-3">
//                           <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
//                             {getDocumentIcon(doc.type)}
//                           </div>
//                           <div className="flex-1 min-w-0">
//                             <h5 className="font-medium text-gray-900 truncate">
//                               {formatDocumentType(doc.type)}
//                             </h5>
//                             <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
//                               <Calendar className="h-3 w-3" />
//                               <span>
//                                 {new Date(doc.createdAt).toLocaleDateString()}
//                               </span>
//                             </div>
//                           </div>
//                         </div>
//                       </div>

//                       {doc.notes && (
//                         <p className="text-sm text-gray-600 mb-3 bg-white p-2 rounded-lg">
//                           {doc.notes}
//                         </p>
//                       )}

//                       <div className="flex items-center gap-2">
//                         <button
//                           onClick={() => handleViewDocument(doc)}
//                           className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
//                         >
//                           <Eye className="h-4 w-4" />
//                           View
//                         </button>
//                         <button
//                           onClick={() => handleDownloadDocument(doc)}
//                           className="flex-1 bg-green-50 hover:bg-green-100 text-green-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
//                         >
//                           <Download className="h-4 w-4" />
//                           Download
//                         </button>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Upload Modal */}
//       {showUploadModal && selectedLead && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
//           <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
//             <div className="p-6 border-b border-gray-200">
//               <div className="flex items-center justify-between">
//                 <h3 className="text-xl font-semibold text-gray-900">
//                   Upload Documents
//                 </h3>
//                 <button
//                   onClick={() => {
//                     setShowUploadModal(false);
//                     setUploadFiles([]);
//                     setUploadTypes([]);
//                     setUploadNotes([]);
//                   }}
//                   className="text-gray-400 hover:text-gray-600 rounded-lg p-1"
//                 >
//                   <X className="h-5 w-5" />
//                 </button>
//               </div>
//               <p className="text-gray-600 mt-2">
//                 Upload documents for{" "}
//                 <span className="font-medium">
//                   {selectedLead.student?.name}
//                 </span>
//               </p>
//             </div>

//             <div className="p-6">
//               {/* Drag and Drop Area */}
//               <div
//                 className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
//                   dragActive
//                     ? "border-blue-500 bg-blue-50 scale-105"
//                     : "border-gray-300 hover:border-gray-400"
//                 }`}
//                 onDragEnter={handleDrag}
//                 onDragLeave={handleDrag}
//                 onDragOver={handleDrag}
//                 onDrop={handleDrop}
//               >
//                 <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
//                 <p className="text-gray-600 mb-2 font-medium">
//                   Drag and drop files here, or click to select
//                 </p>
//                 <p className="text-sm text-gray-500 mb-4">
//                   Support for multiple files, max 10MB each
//                 </p>
//                 <input
//                   type="file"
//                   multiple
//                   onChange={(e) => handleFileUpload(e.target.files)}
//                   className="hidden"
//                   id="file-upload"
//                 />
//                 <label
//                   htmlFor="file-upload"
//                   className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg cursor-pointer transition-colors inline-block font-medium"
//                 >
//                   Choose Files
//                 </label>
//               </div>

//               {/* File List */}
//               {uploadFiles.length > 0 && (
//                 <div className="mt-6">
//                   <h4 className="font-semibold text-gray-900 mb-4">
//                     Selected Files ({uploadFiles.length})
//                   </h4>
//                   <div className="space-y-4 max-h-64 overflow-y-auto">
//                     {uploadFiles.map((file, index) => (
//                       <div
//                         key={index}
//                         className="border border-gray-200 rounded-xl p-4 bg-gray-50"
//                       >
//                         <div className="flex items-start justify-between mb-3">
//                           <div className="flex items-center gap-3">
//                             <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
//                               <FileText className="h-5 w-5 text-blue-600" />
//                             </div>
//                             <div>
//                               <p className="font-medium text-gray-900">
//                                 {file.name}
//                               </p>
//                               <p className="text-sm text-gray-500">
//                                 {formatFileSize(file.size)}
//                               </p>
//                             </div>
//                           </div>
//                           <button
//                             onClick={() => removeUploadFile(index)}
//                             className="text-gray-400 hover:text-red-600 p-1 rounded-lg hover:bg-red-50 transition-colors"
//                           >
//                             <Trash2 className="h-4 w-4" />
//                           </button>
//                         </div>

//                         <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
//                           <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-1">
//                               Document Type
//                             </label>
//                             <select
//                               value={uploadTypes[index] || "other"}
//                               onChange={(e) =>
//                                 updateUploadType(index, e.target.value)
//                               }
//                               className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                             >
//                               {DOCUMENT_TYPES.map((type) => (
//                                 <option key={type} value={type}>
//                                   {formatDocumentType(type)}
//                                 </option>
//                               ))}
//                             </select>
//                           </div>

//                           <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-1">
//                               Notes (Optional)
//                             </label>
//                             <input
//                               type="text"
//                               value={uploadNotes[index] || ""}
//                               onChange={(e) =>
//                                 updateUploadNote(index, e.target.value)
//                               }
//                               placeholder="Add notes..."
//                               className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                             />
//                           </div>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               )}

//               {/* Action Buttons */}
//               <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
//                 <button
//                   onClick={() => {
//                     setShowUploadModal(false);
//                     setUploadFiles([]);
//                     setUploadTypes([]);
//                     setUploadNotes([]);
//                   }}
//                   className="px-6 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   onClick={handleUploadSubmit}
//                   disabled={uploadFiles.length === 0 || loading}
//                   className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium"
//                 >
//                   {loading ? (
//                     <>
//                       <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
//                       Uploading...
//                     </>
//                   ) : (
//                     <>
//                       <Upload className="h-4 w-4" />
//                       Upload {uploadFiles.length} Document
//                       {uploadFiles.length !== 1 ? "s" : ""}
//                     </>
//                   )}
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default DocumentCollection;
