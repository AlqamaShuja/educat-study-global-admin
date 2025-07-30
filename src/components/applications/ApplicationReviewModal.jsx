import React, { useState, useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  CheckCircle,
  Clock,
  FileText,
  User,
  AlertTriangle,
  Save,
  X,
  Edit3,
  TrendingUp,
  Award,
} from "lucide-react";
import {
  STATUS_OPTIONS,
  STAGE_OPTIONS,
  STATUS_CONFIG,
  STAGE_CONFIG,
} from "../../constants/applicationConstants";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import Input from "../ui/Input";
import Textarea from "../ui/Textarea";
import Select from "../ui/Select";

const ApplicationReviewModal = ({ application, isOpen, onClose, onSave }) => {
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    watch,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: {
      status: "",
      stage: "",
      notes: "",
      rejectionReason: "",
    },
  });

  // Watch status to show/hide rejection reason
  const watchedStatus = watch("status");

  useEffect(() => {
    if (application && isOpen) {
      reset({
        status: application.status || "",
        stage: application.stage || "",
        notes: application.notes || "",
        rejectionReason: application.rejectionReason || "",
      });
    }
  }, [application, isOpen, reset]);

  const onSubmit = async (data) => {
    if (!application) return;

    setLoading(true);
    try {
      await onSave(application.id, data);
      onClose();
    } catch (error) {
      console.error("Failed to update application:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "rejected":
        return <X className="h-5 w-5 text-red-500" />;
      case "in_review":
        return <Clock className="h-5 w-5 text-blue-500" />;
      case "submitted":
        return <TrendingUp className="h-5 w-5 text-amber-500" />;
      case "offers_received":
        return <Award className="h-5 w-5 text-purple-500" />;
      case "accepted":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      default:
        return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="" size="lg">
      <div className="bg-white">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-50 via-white to-purple-50 px-6 py-6 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
              <Edit3 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Review Application
              </h2>
              <p className="text-gray-600">
                Update status and stage for{" "}
                {application?.student?.name || "this application"}
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Current Application Info */}
          <div className="bg-gradient-to-r from-gray-50 to-blue-50/30 rounded-xl p-5 border border-gray-100">
            <div className="flex items-center space-x-2 mb-4">
              <User className="h-5 w-5 text-blue-600" />
              <h3 className="font-semibold text-gray-900">
                Current Application Details
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Student Name
                  </label>
                  <p className="text-sm font-medium text-gray-900">
                    {application?.student?.name || "N/A"}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Application ID
                  </label>
                  <p className="text-xs font-mono text-gray-700 bg-gray-100 px-2 py-1 rounded">
                    {application?.id || "N/A"}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Current Status
                  </label>
                  <div className="flex items-center space-x-2 mt-1">
                    {getStatusIcon(application?.status)}
                    <span
                      className={`text-sm font-medium ${
                        STATUS_CONFIG[application?.status]?.color ||
                        "text-gray-600"
                      }`}
                    >
                      {STATUS_CONFIG[application?.status]?.label ||
                        application?.status ||
                        "N/A"}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Current Stage
                  </label>
                  <p
                    className={`text-sm font-medium ${
                      STAGE_CONFIG[application?.stage]?.color || "text-gray-600"
                    }`}
                  >
                    {STAGE_CONFIG[application?.stage]?.label ||
                      application?.stage ||
                      "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Status and Stage Updates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Status Update */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Application Status <span className="text-red-500">*</span>
              </label>
              {console.log(STATUS_OPTIONS, "akcnajncasjcjsancjc")}
              {/* <Select
                {...register("status", { required: "Status is required" })}
                className={`w-full ${
                  errors.status
                    ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                }`}
              >
                <option value="">Choose Status</option>
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select> */}
              <Controller
                name="status"
                control={control}
                rules={{ required: "Status is required" }}
                render={({ field }) => (
                  <Select
                    options={STATUS_OPTIONS}
                    value={STATUS_OPTIONS.find(
                      (option) => option.value === field.value
                    )}
                    onChange={(option) => field.onChange(option?.value || "")}
                    placeholder="Choose Status"
                    error={errors.status?.message}
                    required
                    className="w-full"
                  />
                )}
              />
              {errors.status && (
                <div className="flex items-center space-x-1 mt-1">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  <p className="text-sm text-red-600">
                    {errors.status.message}
                  </p>
                </div>
              )}
            </div>

            {/* Stage Update */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Application Stage <span className="text-red-500">*</span>
              </label>
              {/* <Select
                {...register("stage", { required: "Stage is required" })}
                className={`w-full ${
                  errors.stage
                    ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                }`}
              >
                <option value="">Choose Stage</option>
                {STAGE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select> */}
              <Controller
                name="stage"
                control={control}
                rules={{ required: "Stage is required" }}
                render={({ field }) => (
                  <Select
                    options={STAGE_OPTIONS}
                    value={STAGE_OPTIONS.find(
                      (option) => option.value === field.value
                    )}
                    onChange={(option) => field.onChange(option?.value || "")}
                    placeholder="Choose Stage"
                    error={errors.stage?.message}
                    required
                    className="w-full"
                  />
                )}
              />
              {errors.stage && (
                <div className="flex items-center space-x-1 mt-1">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  <p className="text-sm text-red-600">{errors.stage.message}</p>
                </div>
              )}
            </div>
          </div>

          {/* Notes Section */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Review Notes
            </label>
            <Textarea
              {...register("notes")}
              placeholder="Add any notes, comments, or feedback about this application..."
              rows={4}
              className="w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500 resize-none !bg-white !text-black"
            />
            <p className="text-xs text-gray-500">
              These notes will be saved with the application for future
              reference.
            </p>
          </div>

          {/* Rejection Reason (conditionally shown) */}
          {watchedStatus === "rejected" && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-5 space-y-3">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <h4 className="font-semibold text-red-900">
                  Rejection Details Required
                </h4>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-red-800">
                  Reason for Rejection <span className="text-red-600">*</span>
                </label>
                <Textarea
                  {...register("rejectionReason", {
                    required:
                      watchedStatus === "rejected"
                        ? "Rejection reason is required"
                        : false,
                  })}
                  placeholder="Please provide a clear reason for rejecting this application..."
                  rows={3}
                  className={`w-full resize-none ${
                    errors.rejectionReason
                      ? "border-red-400 focus:border-red-500 focus:ring-red-500"
                      : "border-red-300 focus:border-red-500 focus:ring-red-500"
                  } bg-white`}
                />
                {errors.rejectionReason && (
                  <div className="flex items-center space-x-1 mt-1">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                    <p className="text-sm text-red-600">
                      {errors.rejectionReason.message}
                    </p>
                  </div>
                )}
                <p className="text-xs text-red-700">
                  This reason will be communicated to the student and
                  consultant.
                </p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-100">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
              className="px-6 py-2 border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-gray-500"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 focus:ring-2 focus:ring-blue-500 shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default ApplicationReviewModal;
