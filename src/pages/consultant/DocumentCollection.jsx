// pages/consultant/DocumentCollection.jsx
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import useApi from "../../hooks/useApi";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Modal from "../../components/ui/Modal";
import Input from "../../components/ui/Input";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import DataTable from "../../components/tables/DataTable";
import DocumentUpload from "../../components/forms/DocumentUpload";
import {
  FileText,
  Upload,
  Download,
  Eye,
  Check,
  X,
  Clock,
  AlertCircle,
  Search,
  Filter,
  Plus,
  Trash2,
  MessageSquare,
} from "lucide-react";

const DocumentCollection = () => {
  const { studentId } = useParams();
  const { request, loading } = useApi();

  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [filters, setFilters] = useState({
    status: "",
    type: "",
    search: "",
  });

  const [requestForm, setRequestForm] = useState({
    documentTypes: [],
    message: "",
    deadline: "",
  });

  const documentTypes = [
    "passport",
    "transcript",
    "diploma",
    "cv_resume",
    "personal_statement",
    "recommendation_letter",
    "ielts_toefl",
    "financial_documents",
    "photos",
    "other",
  ];

  const documentStatuses = [
    {
      value: "pending",
      label: "Pending",
      color: "bg-yellow-100 text-yellow-800",
    },
    {
      value: "submitted",
      label: "Submitted",
      color: "bg-blue-100 text-blue-800",
    },
    {
      value: "approved",
      label: "Approved",
      color: "bg-green-100 text-green-800",
    },
    { value: "rejected", label: "Rejected", color: "bg-red-100 text-red-800" },
    {
      value: "revision_required",
      label: "Revision Required",
      color: "bg-orange-100 text-orange-800",
    },
  ];

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    if (studentId) {
      const student = students.find((s) => s.id === studentId);
      if (student) {
        setSelectedStudent(student);
        fetchDocuments(studentId);
      }
    } else if (students.length > 0) {
      setSelectedStudent(students[0]);
      fetchDocuments(students[0].id);
    }
  }, [studentId, students]);

  const fetchStudents = async () => {
    try {
      const response = await request("/consultant/leads");
      const leads = response || [];

      const studentsData = leads.map((lead) => ({
        id: lead.studentId,
        name: lead.student?.name || "Unknown",
        email: lead.student?.email || "N/A",
        status: lead.status,
        leadId: lead.id,
      }));

      setStudents(studentsData);
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  const fetchDocuments = async (studentIdParam) => {
    try {
      // Since there's no direct documents endpoint, we'll simulate document data
      const mockDocuments = [
        {
          id: "1",
          type: "passport",
          filename: "passport_scan.pdf",
          status: "approved",
          uploadedAt: "2024-01-15T10:30:00Z",
          size: "2.5 MB",
          notes: "Valid passport copy",
        },
        {
          id: "2",
          type: "transcript",
          filename: "university_transcript.pdf",
          status: "pending",
          uploadedAt: "2024-01-10T14:20:00Z",
          size: "1.8 MB",
          notes: "Official transcript required",
        },
        {
          id: "3",
          type: "ielts_toefl",
          filename: "ielts_certificate.pdf",
          status: "revision_required",
          uploadedAt: "2024-01-08T09:15:00Z",
          size: "1.2 MB",
          notes: "Score too low, retake required",
        },
      ];

      setDocuments(mockDocuments);
    } catch (error) {
      console.error("Error fetching documents:", error);
    }
  };

  const handleDocumentUpload = async (files, types, notes) => {
    if (!selectedStudent) return;

    try {
      const formData = new FormData();
      files.forEach((file, index) => {
        formData.append("files", file);
      });
      formData.append("types", JSON.stringify(types));
      formData.append("notes", JSON.stringify(notes));

      await request(`/consultant/leads/${selectedStudent.leadId}/documents`, {
        method: "POST",
        data: formData,
        headers: { "Content-Type": "multipart/form-data" },
      });

      setShowUploadModal(false);
      fetchDocuments(selectedStudent.id);
      alert("Documents uploaded successfully!");
    } catch (error) {
      console.error("Error uploading documents:", error);
      alert("Error uploading documents. Please try again.");
    }
  };

  const handleDocumentStatusUpdate = async (
    documentId,
    newStatus,
    notes = ""
  ) => {
    try {
      // This would be an actual API call to update document status
      setDocuments((prev) =>
        prev.map((doc) =>
          doc.id === documentId
            ? { ...doc, status: newStatus, notes: notes || doc.notes }
            : doc
        )
      );

      alert("Document status updated successfully!");
    } catch (error) {
      console.error("Error updating document status:", error);
    }
  };

  const handleRequestDocuments = async () => {
    if (!selectedStudent || requestForm.documentTypes.length === 0) {
      alert("Please select at least one document type");
      return;
    }

    try {
      await request(`/consultant/students/${selectedStudent.id}/review`, {
        method: "POST",
        data: {
          message: `Please submit the following documents: ${requestForm.documentTypes.join(
            ", "
          )}. ${requestForm.message}`,
          requiredDocuments: requestForm.documentTypes,
          deadline: requestForm.deadline,
        },
      });

      setShowRequestModal(false);
      setRequestForm({
        documentTypes: [],
        message: "",
        deadline: "",
      });

      alert("Document request sent to student!");
    } catch (error) {
      console.error("Error requesting documents:", error);
    }
  };

  const handleDownloadDocument = (document) => {
    // In a real app, this would download the actual file
    console.log("Downloading document:", document.filename);
    alert(`Downloading ${document.filename}`);
  };

  const getStatusColor = (status) => {
    const statusConfig = documentStatuses.find((s) => s.value === status);
    return statusConfig?.color || "bg-gray-100 text-gray-800";
  };

  const filteredDocuments = documents.filter((doc) => {
    const matchesStatus = !filters.status || doc.status === filters.status;
    const matchesType = !filters.type || doc.type === filters.type;
    const matchesSearch =
      !filters.search ||
      doc.filename.toLowerCase().includes(filters.search.toLowerCase()) ||
      doc.type.toLowerCase().includes(filters.search.toLowerCase());

    return matchesStatus && matchesType && matchesSearch;
  });

  const getDocumentStats = () => {
    const total = documents.length;
    const approved = documents.filter(
      (doc) => doc.status === "approved"
    ).length;
    const pending = documents.filter((doc) => doc.status === "pending").length;
    const rejected = documents.filter(
      (doc) => doc.status === "rejected"
    ).length;

    return { total, approved, pending, rejected };
  };

  const columns = [
    {
      key: "type",
      label: "Document Type",
      render: (doc) => (
        <div className="flex items-center">
          <FileText className="h-5 w-5 text-gray-400 mr-3" />
          <div>
            <div className="font-medium text-gray-900 capitalize">
              {doc.type.replace("_", " ")}
            </div>
            <div className="text-sm text-gray-500">{doc.filename}</div>
          </div>
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (doc) => (
        <Badge className={getStatusColor(doc.status)}>
          {doc.status.replace("_", " ").toUpperCase()}
        </Badge>
      ),
    },
    {
      key: "uploadedAt",
      label: "Uploaded",
      render: (doc) => (
        <div className="text-sm text-gray-600">
          {new Date(doc.uploadedAt).toLocaleDateString()}
        </div>
      ),
    },
    {
      key: "size",
      label: "Size",
      render: (doc) => (
        <span className="text-sm text-gray-600">{doc.size}</span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (doc) => (
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setSelectedDocument(doc);
              setShowPreviewModal(true);
            }}
          >
            <Eye className="h-4 w-4" />
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => handleDownloadDocument(doc)}
          >
            <Download className="h-4 w-4" />
          </Button>

          {doc.status === "pending" && (
            <>
              <Button
                size="sm"
                onClick={() => handleDocumentStatusUpdate(doc.id, "approved")}
                className="bg-green-600 hover:bg-green-700"
              >
                <Check className="h-4 w-4" />
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  handleDocumentStatusUpdate(
                    doc.id,
                    "rejected",
                    "Document needs revision"
                  )
                }
                className="border-red-300 text-red-600 hover:bg-red-50"
              >
                <X className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  const stats = getDocumentStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Document Collection
          </h1>
          <p className="text-gray-600">
            Manage and track student document submissions
          </p>
        </div>

        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={() => setShowRequestModal(true)}
            disabled={!selectedStudent}
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            Request Documents
          </Button>

          <Button
            onClick={() => setShowUploadModal(true)}
            disabled={!selectedStudent}
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload Documents
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Student Selector */}
        <div className="lg:col-span-1">
          <Card>
            <Card.Header>
              <h3 className="text-lg font-semibold">Students</h3>
            </Card.Header>
            <Card.Content>
              <div className="space-y-2">
                {students.map((student) => (
                  <button
                    key={student.id}
                    onClick={() => {
                      setSelectedStudent(student);
                      fetchDocuments(student.id);
                    }}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      selectedStudent?.id === student.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <div className="font-medium text-gray-900">
                      {student.name}
                    </div>
                    <div className="text-sm text-gray-500">{student.email}</div>
                    <Badge className="mt-1 text-xs">{student.status}</Badge>
                  </button>
                ))}
              </div>
            </Card.Content>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {selectedStudent && (
            <>
              {/* Document Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <Card.Content className="p-4">
                    <div className="flex items-center">
                      <FileText className="h-8 w-8 text-blue-500" />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-600">
                          Total
                        </p>
                        <p className="text-2xl font-bold text-gray-900">
                          {stats.total}
                        </p>
                      </div>
                    </div>
                  </Card.Content>
                </Card>

                <Card>
                  <Card.Content className="p-4">
                    <div className="flex items-center">
                      <Check className="h-8 w-8 text-green-500" />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-600">
                          Approved
                        </p>
                        <p className="text-2xl font-bold text-gray-900">
                          {stats.approved}
                        </p>
                      </div>
                    </div>
                  </Card.Content>
                </Card>

                <Card>
                  <Card.Content className="p-4">
                    <div className="flex items-center">
                      <Clock className="h-8 w-8 text-yellow-500" />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-600">
                          Pending
                        </p>
                        <p className="text-2xl font-bold text-gray-900">
                          {stats.pending}
                        </p>
                      </div>
                    </div>
                  </Card.Content>
                </Card>

                <Card>
                  <Card.Content className="p-4">
                    <div className="flex items-center">
                      <AlertCircle className="h-8 w-8 text-red-500" />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-600">
                          Rejected
                        </p>
                        <p className="text-2xl font-bold text-gray-900">
                          {stats.rejected}
                        </p>
                      </div>
                    </div>
                  </Card.Content>
                </Card>
              </div>

              {/* Filters */}
              <Card>
                <Card.Content className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search documents..."
                        value={filters.search}
                        onChange={(e) =>
                          setFilters({ ...filters, search: e.target.value })
                        }
                        className="pl-10"
                      />
                    </div>

                    <select
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      value={filters.status}
                      onChange={(e) =>
                        setFilters({ ...filters, status: e.target.value })
                      }
                    >
                      <option value="">All Statuses</option>
                      {documentStatuses.map((status) => (
                        <option key={status.value} value={status.value}>
                          {status.label}
                        </option>
                      ))}
                    </select>

                    <select
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      value={filters.type}
                      onChange={(e) =>
                        setFilters({ ...filters, type: e.target.value })
                      }
                    >
                      <option value="">All Types</option>
                      {documentTypes.map((type) => (
                        <option key={type} value={type}>
                          {type.replace("_", " ").toUpperCase()}
                        </option>
                      ))}
                    </select>
                  </div>
                </Card.Content>
              </Card>

              {/* Documents Table */}
              <Card>
                <Card.Header>
                  <h3 className="text-lg font-semibold">
                    Documents for {selectedStudent.name}
                  </h3>
                </Card.Header>
                <Card.Content>
                  {filteredDocuments.length === 0 ? (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No documents found
                      </h3>
                      <p className="text-gray-600 mb-4">
                        {filters.search || filters.status || filters.type
                          ? "No documents match your current filters."
                          : "This student hasn't uploaded any documents yet."}
                      </p>
                      <Button onClick={() => setShowUploadModal(true)}>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload First Document
                      </Button>
                    </div>
                  ) : (
                    <DataTable
                      data={filteredDocuments}
                      columns={columns}
                      searchable={false}
                      pagination={true}
                      pageSize={10}
                    />
                  )}
                </Card.Content>
              </Card>
            </>
          )}
        </div>
      </div>

      {/* Upload Documents Modal */}
      <Modal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        title="Upload Documents"
        size="lg"
      >
        <DocumentUpload
          onUpload={handleDocumentUpload}
          onCancel={() => setShowUploadModal(false)}
          allowedTypes={documentTypes}
        />
      </Modal>

      {/* Document Preview Modal */}
      <Modal
        isOpen={showPreviewModal}
        onClose={() => {
          setShowPreviewModal(false);
          setSelectedDocument(null);
        }}
        title="Document Preview"
        size="lg"
      >
        {selectedDocument && (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">
                Document Information
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Type:</span>
                  <span className="ml-2 font-medium capitalize">
                    {selectedDocument.type.replace("_", " ")}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Filename:</span>
                  <span className="ml-2 font-medium">
                    {selectedDocument.filename}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Status:</span>
                  <Badge
                    className={`ml-2 ${getStatusColor(
                      selectedDocument.status
                    )}`}
                  >
                    {selectedDocument.status.replace("_", " ").toUpperCase()}
                  </Badge>
                </div>
                <div>
                  <span className="text-gray-600">Size:</span>
                  <span className="ml-2 font-medium">
                    {selectedDocument.size}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-gray-600">Uploaded:</span>
                  <span className="ml-2 font-medium">
                    {new Date(selectedDocument.uploadedAt).toLocaleString()}
                  </span>
                </div>
                {selectedDocument.notes && (
                  <div className="col-span-2">
                    <span className="text-gray-600">Notes:</span>
                    <p className="ml-2 font-medium">{selectedDocument.notes}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Document preview would go here - for PDF, images, etc. */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Document preview not available</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => handleDownloadDocument(selectedDocument)}
              >
                <Download className="h-4 w-4 mr-2" />
                Download to View
              </Button>
            </div>

            <div className="flex justify-end space-x-3">
              {selectedDocument.status === "pending" && (
                <>
                  <Button
                    variant="outline"
                    onClick={() => {
                      handleDocumentStatusUpdate(
                        selectedDocument.id,
                        "rejected",
                        "Document needs revision"
                      );
                      setShowPreviewModal(false);
                    }}
                    className="border-red-300 text-red-600 hover:bg-red-50"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                  <Button
                    onClick={() => {
                      handleDocumentStatusUpdate(
                        selectedDocument.id,
                        "approved"
                      );
                      setShowPreviewModal(false);
                    }}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Request Documents Modal */}
      <Modal
        isOpen={showRequestModal}
        onClose={() => {
          setShowRequestModal(false);
          setRequestForm({
            documentTypes: [],
            message: "",
            deadline: "",
          });
        }}
        title="Request Documents from Student"
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Required Documents
            </label>
            <div className="grid grid-cols-2 gap-2">
              {documentTypes.map((type) => (
                <label key={type} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={requestForm.documentTypes.includes(type)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setRequestForm({
                          ...requestForm,
                          documentTypes: [...requestForm.documentTypes, type],
                        });
                      } else {
                        setRequestForm({
                          ...requestForm,
                          documentTypes: requestForm.documentTypes.filter(
                            (t) => t !== type
                          ),
                        });
                      }
                    }}
                    className="rounded border-gray-300 mr-2"
                  />
                  <span className="text-sm capitalize">
                    {type.replace("_", " ")}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Message
            </label>
            <textarea
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              rows={3}
              value={requestForm.message}
              onChange={(e) =>
                setRequestForm({
                  ...requestForm,
                  message: e.target.value,
                })
              }
              placeholder="Enter any additional instructions or requirements..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Deadline (Optional)
            </label>
            <Input
              type="date"
              value={requestForm.deadline}
              onChange={(e) =>
                setRequestForm({
                  ...requestForm,
                  deadline: e.target.value,
                })
              }
            />
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => {
                setShowRequestModal(false);
                setRequestForm({
                  documentTypes: [],
                  message: "",
                  deadline: "",
                });
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleRequestDocuments}>
              <MessageSquare className="h-4 w-4 mr-2" />
              Send Request
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default DocumentCollection;
