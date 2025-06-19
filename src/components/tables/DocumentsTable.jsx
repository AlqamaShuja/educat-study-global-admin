import React, { useState } from "react";
import DataTable from "./DataTable";
import Badge from "../ui/Badge";
import Button from "../ui/Button";
import ConfirmDialog from "../ui/ConfirmDialog";
import Modal from "../ui/Modal";

const DocumentsTable = ({
  documents = [],
  loading = false,
  onView,
  onDownload,
  onApprove,
  onReject,
  onDelete,
  onRequestUpdate,
  showActions = true,
  userRole = "consultant",
  showStudentInfo = true,
}) => {
  const [deleteConfirm, setDeleteConfirm] = useState({
    open: false,
    document: null,
  });
  const [statusModal, setStatusModal] = useState({
    open: false,
    document: null,
  });
  const [previewModal, setPreviewModal] = useState({
    open: false,
    document: null,
  });
  const [rejectionReason, setRejectionReason] = useState("");

  const columns = [
    ...(showStudentInfo
      ? [
          {
            key: "user",
            header: "Student",
            render: (value, row) => (
              <div className="flex items-center">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-purple-600 font-medium text-sm">
                    {row.user?.name?.charAt(0)?.toUpperCase() || "S"}
                  </span>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {row.user?.name || "Unknown"}
                  </div>
                  <div className="text-sm text-gray-500">
                    {row.user?.email || "N/A"}
                  </div>
                </div>
              </div>
            ),
            sortable: true,
          },
        ]
      : []),
    {
      key: "type",
      header: "Document Type",
      render: (value) => {
        const typeIcons = {
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

        const typeLabels = {
          passport: "Passport",
          cnic: "CNIC/National ID",
          transcript: "Academic Transcript",
          test_score: "Test Score",
          degree: "Degree Certificate",
          experience_letter: "Experience Letter",
          bank_statement: "Bank Statement",
          photo: "Passport Photo",
          other: "Other Document",
        };

        return (
          <div className="flex items-center">
            <span className="text-lg mr-2">{typeIcons[value] || "📄"}</span>
            <div>
              <div className="text-sm font-medium text-gray-900">
                {typeLabels[value] || value?.replace("_", " ")?.toUpperCase()}
              </div>
              <div className="text-sm text-gray-500 capitalize">
                {value?.replace("_", " ")}
              </div>
            </div>
          </div>
        );
      },
      sortable: true,
    },
    {
      key: "fileName",
      header: "File Name",
      render: (value, row) => {
        const fileName = value || row.filePath?.split("/").pop() || "Unknown";
        const fileSize = row.fileSize
          ? formatFileSize(row.fileSize)
          : "Unknown size";

        return (
          <div>
            <div
              className="text-sm font-medium text-gray-900 truncate max-w-xs"
              title={fileName}
            >
              {fileName}
            </div>
            <div className="text-sm text-gray-500">{fileSize}</div>
          </div>
        );
      },
    },
    {
      key: "status",
      header: "Status",
      render: (value) => {
        const statusColors = {
          pending: "warning",
          approved: "success",
          rejected: "danger",
          expired: "secondary",
        };

        const statusLabels = {
          pending: "Pending Review",
          approved: "Approved",
          rejected: "Rejected",
          expired: "Expired",
        };

        return (
          <Badge variant={statusColors[value] || "default"} size="sm">
            {statusLabels[value] || value?.toUpperCase()}
          </Badge>
        );
      },
      sortable: true,
    },
    {
      key: "expiryDate",
      header: "Expiry Date",
      render: (value) => {
        if (!value)
          return <span className="text-gray-400 text-sm">No expiry</span>;

        const expiryDate = new Date(value);
        const today = new Date();
        const daysUntilExpiry = Math.ceil(
          (expiryDate - today) / (1000 * 60 * 60 * 24)
        );

        let textColor = "text-gray-900";
        if (daysUntilExpiry < 0) textColor = "text-red-600";
        else if (daysUntilExpiry < 30) textColor = "text-orange-600";
        else if (daysUntilExpiry < 90) textColor = "text-yellow-600";

        return (
          <div className={`text-sm ${textColor}`}>
            <div className="font-medium">{expiryDate.toLocaleDateString()}</div>
            <div className="text-xs">
              {daysUntilExpiry < 0
                ? `Expired ${Math.abs(daysUntilExpiry)} days ago`
                : daysUntilExpiry === 0
                ? "Expires today"
                : `${daysUntilExpiry} days remaining`}
            </div>
          </div>
        );
      },
      sortable: true,
    },
    {
      key: "uploadedAt",
      header: "Uploaded",
      render: (value) => {
        if (!value) return "N/A";
        const date = new Date(value);
        return (
          <div className="text-sm">
            <div className="text-gray-900">{date.toLocaleDateString()}</div>
            <div className="text-gray-500">
              {date.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          </div>
        );
      },
      sortable: true,
    },
    {
      key: "notes",
      header: "Notes",
      render: (value) => {
        if (!value)
          return <span className="text-gray-400 text-sm">No notes</span>;
        return (
          <div
            className="text-sm text-gray-600 max-w-xs truncate"
            title={value}
          >
            {value}
          </div>
        );
      },
    },
  ];

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getActions = () => {
    if (!showActions) return [];

    const actions = [
      {
        label: "View",
        onClick: (document) =>
          onView ? onView(document) : setPreviewModal({ open: true, document }),
        variant: "outline",
        icon: (
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
            />
          </svg>
        ),
      },
      {
        label: "Download",
        onClick: (document) => onDownload && onDownload(document),
        variant: "outline",
        className: "text-blue-600 hover:text-blue-700",
        icon: (
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        ),
      },
    ];

    // Review actions for consultants and managers
    if (
      userRole === "consultant" ||
      userRole === "manager" ||
      userRole === "super_admin"
    ) {
      actions.push(
        {
          label: "Approve",
          onClick: (document) => onApprove && onApprove(document.id),
          variant: "outline",
          className: "text-green-600 hover:text-green-700",
          disabled: (document) => document.status === "approved",
          icon: (
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          ),
        },
        {
          label: "Reject",
          onClick: (document) => {
            setStatusModal({ open: true, document });
            setRejectionReason("");
          },
          variant: "outline",
          className: "text-red-600 hover:text-red-700",
          disabled: (document) => document.status === "rejected",
          icon: (
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          ),
        },
        {
          label: "Request Update",
          onClick: (document) => onRequestUpdate && onRequestUpdate(document),
          variant: "outline",
          className: "text-orange-600 hover:text-orange-700",
          icon: (
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          ),
        }
      );
    }

    // Delete action for super admin
    if (userRole === "super_admin") {
      actions.push({
        label: "Delete",
        onClick: (document) => setDeleteConfirm({ open: true, document }),
        variant: "outline",
        className: "text-red-600 hover:text-red-700",
        icon: (
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        ),
      });
    }

    return actions;
  };

  const filters = [
    {
      key: "status",
      label: "Status",
      options: [
        { value: "", label: "All Status" },
        { value: "pending", label: "Pending Review" },
        { value: "approved", label: "Approved" },
        { value: "rejected", label: "Rejected" },
        { value: "expired", label: "Expired" },
      ],
    },
    {
      key: "type",
      label: "Document Type",
      options: [
        { value: "", label: "All Types" },
        { value: "passport", label: "Passport" },
        { value: "cnic", label: "CNIC/National ID" },
        { value: "transcript", label: "Academic Transcript" },
        { value: "test_score", label: "Test Score" },
        { value: "degree", label: "Degree Certificate" },
        { value: "experience_letter", label: "Experience Letter" },
        { value: "bank_statement", label: "Bank Statement" },
        { value: "photo", label: "Passport Photo" },
        { value: "other", label: "Other" },
      ],
    },
    {
      key: "expiryStatus",
      label: "Expiry Status",
      options: [
        { value: "", label: "All Documents" },
        { value: "expired", label: "Expired" },
        { value: "expiring_soon", label: "Expiring Soon (30 days)" },
        { value: "valid", label: "Valid" },
        { value: "no_expiry", label: "No Expiry Date" },
      ],
      filterFn: (row, value) => {
        if (value === "") return true;

        const expiryDate = row.expiryDate ? new Date(row.expiryDate) : null;
        const today = new Date();

        switch (value) {
          case "expired":
            return expiryDate && expiryDate < today;
          case "expiring_soon":
            if (!expiryDate) return false;
            const daysUntilExpiry = Math.ceil(
              (expiryDate - today) / (1000 * 60 * 60 * 24)
            );
            return daysUntilExpiry >= 0 && daysUntilExpiry <= 30;
          case "valid":
            return expiryDate && expiryDate > today;
          case "no_expiry":
            return !expiryDate;
          default:
            return true;
        }
      },
    },
  ];

  const bulkActions =
    userRole === "consultant" ||
    userRole === "manager" ||
    userRole === "super_admin"
      ? [
          {
            label: "Approve Selected",
            onClick: (selectedDocuments) => {
              selectedDocuments.forEach((doc) => {
                if (doc.status === "pending" && onApprove) {
                  onApprove(doc.id);
                }
              });
            },
            variant: "outline",
            className: "text-green-600 hover:text-green-700",
            icon: (
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            ),
          },
          {
            label: "Download Selected",
            onClick: (selectedDocuments) => {
              selectedDocuments.forEach((doc) => {
                if (onDownload) {
                  onDownload(doc);
                }
              });
            },
            variant: "outline",
            className: "text-blue-600 hover:text-blue-700",
            icon: (
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            ),
          },
        ]
      : [];

  const handleConfirmDelete = () => {
    if (deleteConfirm.document && onDelete) {
      onDelete(deleteConfirm.document.id);
    }
    setDeleteConfirm({ open: false, document: null });
  };

  const handleReject = () => {
    if (statusModal.document && onReject) {
      onReject(statusModal.document.id, rejectionReason);
    }
    setStatusModal({ open: false, document: null });
    setRejectionReason("");
  };

  const handleExport = () => {
    const csvData = documents.map((doc) => ({
      "Student Name": doc.user?.name || "N/A",
      "Student Email": doc.user?.email || "N/A",
      "Document Type": doc.type?.replace("_", " ")?.toUpperCase() || "N/A",
      "File Name": doc.fileName || doc.filePath?.split("/").pop() || "N/A",
      Status: doc.status?.toUpperCase() || "N/A",
      "Expiry Date": doc.expiryDate
        ? new Date(doc.expiryDate).toLocaleDateString()
        : "No expiry",
      "Uploaded Date": doc.uploadedAt
        ? new Date(doc.uploadedAt).toLocaleDateString()
        : "N/A",
      Notes: doc.notes || "No notes",
    }));

    const csvContent = [
      Object.keys(csvData[0] || {}).join(","),
      ...csvData.map((row) =>
        Object.values(row)
          .map((val) => `"${val}"`)
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `documents_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <>
      <DataTable
        data={documents}
        columns={columns}
        loading={loading}
        searchable
        filterable
        sortable
        selectable={userRole !== "student"}
        pagination
        pageSize={10}
        actions={getActions()}
        filters={filters}
        bulkActions={bulkActions}
        exportable
        onExport={handleExport}
        title="Documents Management"
        subtitle={`${documents.length} total documents`}
        emptyMessage="No documents found. Upload your first document to get started."
        className="bg-white rounded-lg shadow"
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirm.open}
        onClose={() => setDeleteConfirm({ open: false, document: null })}
        onConfirm={handleConfirmDelete}
        title="Delete Document"
        message={`Are you sure you want to delete this document? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />

      {/* Rejection Modal */}
      <Modal
        isOpen={statusModal.open}
        onClose={() => {
          setStatusModal({ open: false, document: null });
          setRejectionReason("");
        }}
        title="Reject Document"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Provide a reason for rejecting this document. This will help the
            student understand what needs to be corrected.
          </p>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rejection Reason <span className="text-red-500">*</span>
            </label>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              rows="4"
              placeholder="Please provide specific details about why this document is being rejected..."
              required
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => {
                setStatusModal({ open: false, document: null });
                setRejectionReason("");
              }}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleReject}
              disabled={!rejectionReason.trim()}
            >
              Reject Document
            </Button>
          </div>
        </div>
      </Modal>

      {/* Document Preview Modal */}
      <Modal
        isOpen={previewModal.open}
        onClose={() => setPreviewModal({ open: false, document: null })}
        title="Document Preview"
        size="xl"
      >
        {previewModal.document && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  {previewModal.document.type?.replace("_", " ")?.toUpperCase()}
                </h3>
                <p className="text-sm text-gray-500">
                  Uploaded by {previewModal.document.user?.name} on{" "}
                  {previewModal.document.uploadedAt
                    ? new Date(
                        previewModal.document.uploadedAt
                      ).toLocaleDateString()
                    : "Unknown date"}
                </p>
              </div>
              <Badge
                variant={
                  previewModal.document.status === "approved"
                    ? "success"
                    : previewModal.document.status === "rejected"
                    ? "danger"
                    : "warning"
                }
              >
                {previewModal.document.status?.toUpperCase()}
              </Badge>
            </div>

            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <p className="mt-2 text-sm text-gray-600">
                Document preview not available
              </p>
              <p className="text-xs text-gray-500">
                Click download to view the document
              </p>
            </div>

            {previewModal.document.notes && (
              <div>
                <h4 className="text-sm font-medium text-gray-700">Notes</h4>
                <p className="text-sm text-gray-600 mt-1">
                  {previewModal.document.notes}
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </>
  );
};

export default DocumentsTable;
