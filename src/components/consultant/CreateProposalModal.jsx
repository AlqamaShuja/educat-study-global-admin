import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import Input from "../ui/Input";
import LoadingSpinner from "../ui/LoadingSpinner";
import { toast } from "react-toastify";
import useConsultantStore from "../../stores/consultantStore";
import { X, Plus, Trash2 } from "lucide-react";

// Zod schema for proposal validation
const proposalSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title is too long"),
  description: z.string().optional(),
  proposedProgram: z.string().optional(),
  proposedUniversity: z.string().optional(),
  estimatedCost: z
    .string()
    .optional()
    .refine((val) => !val || !isNaN(parseFloat(val)), {
      message: "Must be a valid number",
    }),
  timeline: z.string().optional(),
  expiresAt: z.string().optional(),
});

const CreateProposalModal = ({ isOpen, onClose, selectedLead, onSuccess }) => {
  const { createProposal, loading } = useConsultantStore();
  const [additionalDetails, setAdditionalDetails] = useState({});
  const [detailsFields, setDetailsFields] = useState([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm({
    resolver: zodResolver(proposalSchema),
    defaultValues: {
      title: "",
      description: "",
      proposedProgram: "",
      proposedUniversity: "",
      estimatedCost: "",
      timeline: "",
      expiresAt: "",
    },
  });

  const handleClose = () => {
    reset();
    setAdditionalDetails({});
    setDetailsFields([]);
    onClose();
  };

  const onSubmit = async (data) => {
    try {
      // Prepare proposal data
      const proposalData = {
        ...data,
        estimatedCost: data.estimatedCost
          ? parseFloat(data.estimatedCost)
          : null,
        expiresAt: data.expiresAt
          ? new Date(data.expiresAt).toISOString()
          : null,
        details: additionalDetails,
      };

      await createProposal(selectedLead.id, proposalData);

      toast.success(
        `Proposal "${data.title}" sent to ${selectedLead.student?.name} successfully!`
      );

      if (onSuccess) {
        onSuccess();
      }

      handleClose();
    } catch (error) {
      console.error("Error creating proposal:", error);
      toast.error("Failed to create proposal. Please try again.");
    }
  };

  // Dynamic details field management
  const addDetailsField = () => {
    const newField = {
      id: Date.now(),
      key: "",
      value: "",
    };
    setDetailsFields([...detailsFields, newField]);
  };

  const removeDetailsField = (id) => {
    setDetailsFields(detailsFields.filter((field) => field.id !== id));
    // Remove from additionalDetails
    const updatedDetails = { ...additionalDetails };
    const fieldToRemove = detailsFields.find((field) => field.id === id);
    if (fieldToRemove && fieldToRemove.key) {
      delete updatedDetails[fieldToRemove.key];
      setAdditionalDetails(updatedDetails);
    }
  };

  const updateDetailsField = (id, key, value) => {
    setDetailsFields(
      detailsFields.map((field) =>
        field.id === id ? { ...field, [key]: value } : field
      )
    );

    // Update additionalDetails
    const field = detailsFields.find((f) => f.id === id);
    if (field && field.key) {
      // Remove old key if it changed
      const updatedDetails = { ...additionalDetails };
      if (key === "key" && field.key !== value) {
        delete updatedDetails[field.key];
      }

      // Set new value
      const currentField = detailsFields.find((f) => f.id === id);
      const fieldKey = key === "key" ? value : currentField?.key;
      const fieldValue = key === "value" ? value : currentField?.value;

      if (fieldKey && fieldValue) {
        updatedDetails[fieldKey] = fieldValue;
      }

      setAdditionalDetails(updatedDetails);
    }
  };

  if (!selectedLead) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={`Create Proposal for ${selectedLead.student?.name}`}
      size="xl"
      className="max-w-4xl"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Lead Information Display */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">
            Lead Information
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-blue-700">Student:</span>{" "}
              {selectedLead.student?.name}
            </div>
            <div>
              <span className="font-medium text-blue-700">Email:</span>{" "}
              {selectedLead.student?.email}
            </div>
            <div>
              <span className="font-medium text-blue-700">Status:</span>{" "}
              <span className="capitalize">{selectedLead.status}</span>
            </div>
            <div>
              <span className="font-medium text-blue-700">Source:</span>{" "}
              <span className="capitalize">{selectedLead.source}</span>
            </div>
            {selectedLead.studyPreferences?.destination && (
              <div>
                <span className="font-medium text-blue-700">Destination:</span>{" "}
                {selectedLead.studyPreferences.destination}
              </div>
            )}
            {selectedLead.studyPreferences?.level && (
              <div>
                <span className="font-medium text-blue-700">Level:</span>{" "}
                {selectedLead.studyPreferences.level}
              </div>
            )}
          </div>
        </div>

        {/* Basic Proposal Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
            Proposal Details
          </h3>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Proposal Title <span className="text-red-500">*</span>
            </label>
            <Input
              {...register("title")}
              placeholder="e.g., Study Program Proposal for Computer Science"
              className={errors.title ? "border-red-500" : ""}
            />
            {errors.title && (
              <p className="text-red-500 text-sm mt-1">
                {errors.title.message}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              {...register("description")}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Detailed description of the proposal..."
            />
          </div>

          {/* Program and University */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Proposed Program
              </label>
              <Input
                {...register("proposedProgram")}
                placeholder="e.g., Bachelor of Computer Science"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Proposed University
              </label>
              <Input
                {...register("proposedUniversity")}
                placeholder="e.g., University of Toronto"
              />
            </div>
          </div>

          {/* Cost and Timeline */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estimated Cost (USD)
              </label>
              <Input
                {...register("estimatedCost")}
                type="number"
                step="0.01"
                placeholder="e.g., 45000"
                className={errors.estimatedCost ? "border-red-500" : ""}
              />
              {errors.estimatedCost && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.estimatedCost.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Timeline
              </label>
              <Input
                {...register("timeline")}
                placeholder="e.g., 4 years, 18 months"
              />
            </div>
          </div>

          {/* Expiration Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Proposal Expires On
            </label>
            <Input
              {...register("expiresAt")}
              type="datetime-local"
              min={new Date().toISOString().slice(0, 16)}
            />
            <p className="text-sm text-gray-500 mt-1">
              Leave blank for no expiration
            </p>
          </div>
        </div>

        {/* Additional Details Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
              Additional Details
            </h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addDetailsField}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Detail
            </Button>
          </div>

          {detailsFields.map((field) => (
            <div key={field.id} className="flex gap-2 items-start">
              <Input
                placeholder="Detail name (e.g., Requirements)"
                value={field.key}
                onChange={(e) =>
                  updateDetailsField(field.id, "key", e.target.value)
                }
                className="flex-1"
              />
              <Input
                placeholder="Detail value"
                value={field.value}
                onChange={(e) =>
                  updateDetailsField(field.id, "value", e.target.value)
                }
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => removeDetailsField(field.id)}
                className="text-red-600 border-red-300 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}

          {detailsFields.length === 0 && (
            <p className="text-gray-500 text-sm italic">
              No additional details added. Click "Add Detail" to include custom
              information.
            </p>
          )}
        </div>

        {/* Preview Section */}
        {Object.keys(additionalDetails).length > 0 && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-md font-medium text-gray-800 mb-2">
              Additional Details Preview:
            </h4>
            <div className="space-y-1">
              {Object.entries(additionalDetails).map(([key, value]) => (
                <div key={key} className="text-sm">
                  <span className="font-medium text-gray-700">{key}:</span>{" "}
                  <span className="text-gray-600">{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {loading ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Sending...
              </>
            ) : (
              "Send Proposal"
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateProposalModal;
