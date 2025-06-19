import React, { useState } from "react";
import Button from "../ui/Button";
import Select from "../ui/Select";
import Modal from "../ui/Modal";
import Input from "../ui/Input";
import ConfirmDialog from "../ui/ConfirmDialog";
import Badge from "../ui/Badge";

const BulkActions = ({
  selectedItems = [],
  actions = [],
  onAction,
  onClearSelection,
  className = "",
}) => {
  const [selectedAction, setSelectedAction] = useState(null);
  const [actionModal, setActionModal] = useState({
    open: false,
    action: null,
    data: {},
  });
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    action: null,
  });

  if (selectedItems.length === 0) return null;

  const handleActionSelect = (action) => {
    setSelectedAction(action);

    if (action.requiresConfirmation) {
      setConfirmDialog({ open: true, action });
    } else if (action.requiresInput) {
      setActionModal({ open: true, action, data: {} });
    } else {
      executeAction(action);
    }
  };

  const executeAction = (action, inputData = {}) => {
    if (onAction) {
      onAction(action.key, selectedItems, inputData);
    }
    setSelectedAction(null);
    setActionModal({ open: false, action: null, data: {} });
    setConfirmDialog({ open: false, action: null });
  };

  const handleConfirm = () => {
    if (confirmDialog.action) {
      executeAction(confirmDialog.action);
    }
  };

  const handleModalSubmit = () => {
    if (
      actionModal.action &&
      validateInputData(actionModal.action, actionModal.data)
    ) {
      executeAction(actionModal.action, actionModal.data);
    }
  };

  const validateInputData = (action, data) => {
    if (!action.inputs) return true;

    return action.inputs.every((input) => {
      if (
        input.required &&
        (!data[input.key] || data[input.key].toString().trim() === "")
      ) {
        return false;
      }
      return true;
    });
  };

  const updateInputData = (key, value) => {
    setActionModal((prev) => ({
      ...prev,
      data: { ...prev.data, [key]: value },
    }));
  };

  const getActionIcon = (action) => {
    const icons = {
      delete: (
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
      approve: (
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
      reject: (
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
      assign: (
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
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
          />
        </svg>
      ),
      export: (
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
      activate: (
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
      deactivate: (
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
            d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728"
          />
        </svg>
      ),
      send: (
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
            d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
          />
        </svg>
      ),
      edit: (
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
            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
          />
        </svg>
      ),
      move: (
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
            d="M8 9l4-4 4 4m0 6l-4 4-4-4"
          />
        </svg>
      ),
    };

    return action.icon || icons[action.key] || icons.edit;
  };

  const renderInputField = (input) => {
    switch (input.type) {
      case "select":
        return (
          <Select
            options={input.options || []}
            value={input.options?.find(
              (option) => option.value === actionModal.data[input.key]
            )}
            onChange={(option) =>
              updateInputData(input.key, option?.value || "")
            }
            placeholder={
              input.placeholder || `Select ${input.label.toLowerCase()}`
            }
          />
        );

      case "textarea":
        return (
          <textarea
            value={actionModal.data[input.key] || ""}
            onChange={(e) => updateInputData(input.key, e.target.value)}
            placeholder={input.placeholder}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows={input.rows || 3}
          />
        );

      case "number":
        return (
          <Input
            type="number"
            value={actionModal.data[input.key] || ""}
            onChange={(e) => updateInputData(input.key, e.target.value)}
            placeholder={input.placeholder}
            min={input.min}
            max={input.max}
            step={input.step}
          />
        );

      case "date":
        return (
          <Input
            type="date"
            value={actionModal.data[input.key] || ""}
            onChange={(e) => updateInputData(input.key, e.target.value)}
            min={input.min}
            max={input.max}
          />
        );

      case "datetime-local":
        return (
          <Input
            type="datetime-local"
            value={actionModal.data[input.key] || ""}
            onChange={(e) => updateInputData(input.key, e.target.value)}
            min={input.min}
            max={input.max}
          />
        );

      default:
        return (
          <Input
            type={input.type || "text"}
            value={actionModal.data[input.key] || ""}
            onChange={(e) => updateInputData(input.key, e.target.value)}
            placeholder={input.placeholder}
          />
        );
    }
  };

  return (
    <>
      <div
        className={`bg-blue-50 border border-blue-200 rounded-lg p-4 ${className}`}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-3 sm:space-y-0">
          {/* Selection Info */}
          <div className="flex items-center space-x-3">
            <Badge variant="primary" size="md">
              {selectedItems.length} selected
            </Badge>
            <span className="text-sm text-blue-700">
              {selectedItems.length === 1
                ? "1 item selected"
                : `${selectedItems.length} items selected`}
            </span>
            <button
              onClick={onClearSelection}
              className="text-blue-600 hover:text-blue-800 text-sm underline"
            >
              Clear selection
            </button>
          </div>

          {/* Bulk Actions */}
          <div className="flex flex-wrap items-center gap-2">
            {actions.map((action) => (
              <Button
                key={action.key}
                variant={action.variant || "outline"}
                size="sm"
                onClick={() => handleActionSelect(action)}
                disabled={action.disabled && action.disabled(selectedItems)}
                className={action.className}
              >
                {getActionIcon(action)}
                <span className="ml-1">{action.label}</span>
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.open}
        onClose={() => setConfirmDialog({ open: false, action: null })}
        onConfirm={handleConfirm}
        title={
          confirmDialog.action?.confirmTitle ||
          `Confirm ${confirmDialog.action?.label}`
        }
        message={
          confirmDialog.action?.confirmMessage ||
          `Are you sure you want to ${confirmDialog.action?.label?.toLowerCase()} ${
            selectedItems.length
          } selected item${selectedItems.length !== 1 ? "s" : ""}?`
        }
        confirmText={
          confirmDialog.action?.confirmText ||
          confirmDialog.action?.label ||
          "Confirm"
        }
        cancelText="Cancel"
        type={confirmDialog.action?.confirmType || "warning"}
      />

      {/* Input Modal */}
      <Modal
        isOpen={actionModal.open}
        onClose={() => setActionModal({ open: false, action: null, data: {} })}
        title={
          actionModal.action?.modalTitle ||
          `${actionModal.action?.label} - ${selectedItems.length} item${
            selectedItems.length !== 1 ? "s" : ""
          }`
        }
        size={actionModal.action?.modalSize || "md"}
      >
        {actionModal.action && (
          <div className="space-y-4">
            {actionModal.action.description && (
              <p className="text-sm text-gray-600">
                {actionModal.action.description}
              </p>
            )}

            {/* Selected Items Preview */}
            <div className="bg-gray-50 rounded-lg p-3">
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Selected Items ({selectedItems.length})
              </h4>
              <div className="max-h-32 overflow-y-auto">
                <ul className="text-sm text-gray-600 space-y-1">
                  {selectedItems.slice(0, 5).map((item, index) => (
                    <li key={index} className="truncate">
                      •{" "}
                      {item.name ||
                        item.title ||
                        item.email ||
                        item.id ||
                        `Item ${index + 1}`}
                    </li>
                  ))}
                  {selectedItems.length > 5 && (
                    <li className="text-gray-500 italic">
                      ... and {selectedItems.length - 5} more items
                    </li>
                  )}
                </ul>
              </div>
            </div>

            {/* Input Fields */}
            {actionModal.action.inputs && (
              <div className="space-y-4">
                {actionModal.action.inputs.map((input) => (
                  <div key={input.key}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {input.label}
                      {input.required && (
                        <span className="text-red-500 ml-1">*</span>
                      )}
                    </label>
                    {renderInputField(input)}
                    {input.helpText && (
                      <p className="text-xs text-gray-500 mt-1">
                        {input.helpText}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() =>
                  setActionModal({ open: false, action: null, data: {} })
                }
              >
                Cancel
              </Button>
              <Button
                variant={actionModal.action.submitVariant || "primary"}
                onClick={handleModalSubmit}
                disabled={
                  !validateInputData(actionModal.action, actionModal.data)
                }
              >
                {actionModal.action.submitText ||
                  actionModal.action.label ||
                  "Apply"}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};

// Predefined common bulk actions
export const commonBulkActions = {
  delete: {
    key: "delete",
    label: "Delete Selected",
    variant: "outline",
    className:
      "text-red-600 hover:text-red-700 border-red-300 hover:border-red-400",
    requiresConfirmation: true,
    confirmTitle: "Delete Items",
    confirmMessage:
      "Are you sure you want to delete the selected items? This action cannot be undone.",
    confirmText: "Delete",
    confirmType: "danger",
  },

  activate: {
    key: "activate",
    label: "Activate Selected",
    variant: "outline",
    className:
      "text-green-600 hover:text-green-700 border-green-300 hover:border-green-400",
    requiresConfirmation: true,
    confirmTitle: "Activate Items",
    confirmMessage: "Are you sure you want to activate the selected items?",
    confirmText: "Activate",
    confirmType: "info",
  },

  deactivate: {
    key: "deactivate",
    label: "Deactivate Selected",
    variant: "outline",
    className:
      "text-orange-600 hover:text-orange-700 border-orange-300 hover:border-orange-400",
    requiresConfirmation: true,
    confirmTitle: "Deactivate Items",
    confirmMessage: "Are you sure you want to deactivate the selected items?",
    confirmText: "Deactivate",
    confirmType: "warning",
  },

  export: {
    key: "export",
    label: "Export Selected",
    variant: "outline",
    className:
      "text-blue-600 hover:text-blue-700 border-blue-300 hover:border-blue-400",
  },

  assign: {
    key: "assign",
    label: "Bulk Assign",
    variant: "outline",
    className:
      "text-blue-600 hover:text-blue-700 border-blue-300 hover:border-blue-400",
    requiresInput: true,
    modalTitle: "Assign Items",
    description: "Select a user to assign the selected items to.",
    inputs: [
      {
        key: "assigneeId",
        label: "Assign To",
        type: "select",
        required: true,
        placeholder: "Select a user",
        options: [], // Should be populated dynamically
      },
      {
        key: "notes",
        label: "Assignment Notes",
        type: "textarea",
        placeholder: "Optional notes for this assignment...",
        rows: 3,
      },
    ],
  },

  updateStatus: {
    key: "updateStatus",
    label: "Update Status",
    variant: "outline",
    requiresInput: true,
    modalTitle: "Update Status",
    description: "Change the status of the selected items.",
    inputs: [
      {
        key: "status",
        label: "New Status",
        type: "select",
        required: true,
        placeholder: "Select status",
        options: [
          { value: "active", label: "Active" },
          { value: "inactive", label: "Inactive" },
          { value: "pending", label: "Pending" },
          { value: "completed", label: "Completed" },
        ],
      },
      {
        key: "reason",
        label: "Reason for Change",
        type: "textarea",
        placeholder: "Explain why you are changing the status...",
        helpText: "This will be logged for audit purposes.",
      },
    ],
  },

  sendMessage: {
    key: "sendMessage",
    label: "Send Message",
    variant: "outline",
    className:
      "text-purple-600 hover:text-purple-700 border-purple-300 hover:border-purple-400",
    requiresInput: true,
    modalTitle: "Send Bulk Message",
    description: "Send a message to all selected users.",
    inputs: [
      {
        key: "subject",
        label: "Subject",
        type: "text",
        required: true,
        placeholder: "Enter message subject",
      },
      {
        key: "message",
        label: "Message",
        type: "textarea",
        required: true,
        placeholder: "Enter your message...",
        rows: 5,
      },
      {
        key: "sendMethod",
        label: "Send Via",
        type: "select",
        required: true,
        options: [
          { value: "email", label: "Email" },
          { value: "sms", label: "SMS" },
          { value: "in_app", label: "In-App Notification" },
        ],
      },
    ],
  },
};

export default BulkActions;
