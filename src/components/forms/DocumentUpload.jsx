import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import FileUpload from "../ui/FileUpload";
import Select from "../ui/Select";
import Button from "../ui/Button";
import Card from "../ui/Card";
import Input from "../ui/Input";
import Badge from "../ui/Badge";

const DocumentUpload = ({
  onSubmit,
  onCancel,
  loading = false,
  allowMultiple = true,
  userId = null,
  existingDocuments = [],
}) => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [documentDetails, setDocumentDetails] = useState([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm();

  const documentTypes = [
    { value: "passport", label: "Passport" },
    { value: "cnic", label: "CNIC/National ID" },
    { value: "transcript", label: "Academic Transcript" },
    { value: "test_score", label: "Test Score (IELTS/TOEFL/SAT)" },
    { value: "degree", label: "Degree Certificate" },
    { value: "experience_letter", label: "Experience Letter" },
    { value: "bank_statement", label: "Bank Statement" },
    { value: "photo", label: "Passport Photo" },
    { value: "other", label: "Other Document" },
  ];

  useEffect(() => {
    if (selectedFiles.length > 0) {
      // Initialize document details for new files
      const newDetails = selectedFiles.map((file, index) => ({
        file,
        type: documentDetails[index]?.type || "",
        notes: documentDetails[index]?.notes || "",
        expiryDate: documentDetails[index]?.expiryDate || "",
      }));
      setDocumentDetails(newDetails);
    } else {
      setDocumentDetails([]);
    }
  }, [selectedFiles.length]);

  const handleFileSelect = (files) => {
    if (allowMultiple) {
      setSelectedFiles(Array.isArray(files) ? files : [files].filter(Boolean));
    } else {
      setSelectedFiles(files ? [files] : []);
    }
  };

  const updateDocumentDetail = (index, field, value) => {
    setDocumentDetails((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const removeDocument = (index) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    const newDetails = documentDetails.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    setDocumentDetails(newDetails);
  };

  const onFormSubmit = (data) => {
    if (selectedFiles.length === 0) {
      alert("Please select at least one file to upload");
      return;
    }

    // Validate that all files have types assigned
    const missingTypes = documentDetails.some((detail) => !detail.type);
    if (missingTypes) {
      alert("Please select document type for all files");
      return;
    }

    const formData = new FormData();

    // Append files
    selectedFiles.forEach((file, index) => {
      formData.append("files", file);
    });

    // Append metadata
    const types = documentDetails.map((detail) => detail.type);
    const notes = documentDetails.map((detail) => detail.notes || "");
    const expiryDates = documentDetails.map(
      (detail) => detail.expiryDate || ""
    );

    formData.append("types", JSON.stringify(types));
    formData.append("notes", JSON.stringify(notes));
    formData.append("expiryDates", JSON.stringify(expiryDates));

    if (userId) {
      formData.append("userId", userId);
    }

    onSubmit(formData);
  };

  const getDocumentIcon = (type) => {
    const icons = {
      passport: "📘",
      cnic: "🆔",
      transcript: "📜",
      test_score: "📊",
      degree: "🎓",
      experience_letter: "💼",
      bank_statement: "💰",
      photo: "📷",
      other: "📄",
    };
    return icons[type] || "📄";
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <Card title="Upload Documents">
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
        {/* Existing Documents */}
        {existingDocuments.length > 0 && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Existing Documents
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {existingDocuments.map((doc) => (
                <div key={doc.id} className="bg-gray-50 rounded-lg p-4 border">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">
                        {getDocumentIcon(doc.type)}
                      </span>
                      <div>
                        <p className="text-sm font-medium text-gray-900 capitalize">
                          {doc.type.replace("_", " ")}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(doc.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant={
                        doc.status === "approved"
                          ? "success"
                          : doc.status === "rejected"
                          ? "danger"
                          : "warning"
                      }
                      size="sm"
                    >
                      {doc.status}
                    </Badge>
                  </div>
                  {doc.notes && (
                    <p className="text-xs text-gray-600 mt-2">{doc.notes}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* File Upload */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {existingDocuments.length > 0
              ? "Upload Additional Documents"
              : "Upload Documents"}
          </h3>
          <FileUpload
            onFileSelect={handleFileSelect}
            multiple={allowMultiple}
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            maxSize={10 * 1024 * 1024} // 10MB
            className="mb-6"
          >
            <span className="font-medium text-blue-600">Choose files</span> or
            drag and drop
            <br />
            <span className="text-xs text-gray-500">
              PDF, DOC, DOCX, JPG, PNG up to 10MB each
            </span>
          </FileUpload>
        </div>

        {/* Document Details */}
        {selectedFiles.length > 0 && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Document Details
            </h3>
            <div className="space-y-6">
              {selectedFiles.map((file, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4 border">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <svg
                        className="w-8 h-8 text-gray-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                        />
                      </svg>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {file.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeDocument(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      Remove
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Document Type */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Document Type <span className="text-red-500">*</span>
                      </label>
                      <Select
                        options={documentTypes}
                        value={documentTypes.find(
                          (option) =>
                            option.value === documentDetails[index]?.type
                        )}
                        onChange={(option) =>
                          updateDocumentDetail(index, "type", option.value)
                        }
                        placeholder="Select type"
                      />
                    </div>

                    {/* Expiry Date (optional) */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Expiry Date (if applicable)
                      </label>
                      <input
                        type="date"
                        value={documentDetails[index]?.expiryDate || ""}
                        onChange={(e) =>
                          updateDocumentDetail(
                            index,
                            "expiryDate",
                            e.target.value
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    {/* Notes */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Notes
                      </label>
                      <input
                        type="text"
                        value={documentDetails[index]?.notes || ""}
                        onChange={(e) =>
                          updateDocumentDetail(index, "notes", e.target.value)
                        }
                        placeholder="Add notes..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upload Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-900 mb-2">
            Upload Guidelines:
          </h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Ensure documents are clear and readable</li>
            <li>• Files should be in PDF, DOC, DOCX, JPG, or PNG format</li>
            <li>• Maximum file size is 10MB per document</li>
            <li>
              • Provide expiry dates for documents like passports and visas
            </li>
            <li>• Add relevant notes to help with document review</li>
          </ul>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-6 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            loading={loading}
            disabled={loading || selectedFiles.length === 0}
          >
            Upload Documents
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default DocumentUpload;
