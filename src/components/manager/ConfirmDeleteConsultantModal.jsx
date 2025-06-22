import React from "react";
import Button from "../../components/ui/Button";
import { X } from "lucide-react";

const ConfirmDeleteConsultantModal = ({
  isOpen,
  onClose,
  onConfirm,
  consultantName,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">
            Confirm Disconnection
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <p className="text-gray-600 mb-6">
          Are you sure you want to disconnect{" "}
          <span className="font-medium">
            {consultantName || "this consultant"}
          </span>
          ?
        </p>
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="danger" onClick={onConfirm}>
            Disconnect
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteConsultantModal;
