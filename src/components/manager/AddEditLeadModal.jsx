import React, { useState, useEffect } from "react";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { X } from "lucide-react";
import { toast } from "react-toastify";

const AddEditLeadModal = ({
  isOpen,
  onClose,
  lead,
  consultants,
  onSubmit,
  mode = "add",
}) => {
  const [formData, setFormData] = useState({
    studentData: { name: "", email: "", phone: "" },
    studyPreferences: "",
    source: "referral",
    assignedConsultant: "",
    status: "new",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (lead && mode === "edit") {
      setFormData({
        studentData: { name: "", email: "", phone: "" },
        studyPreferences: "",
        source: "",
        assignedConsultant: lead.assignedConsultant || "",
        status: lead.status || "new",
      });
    } else {
      setFormData({
        studentData: { name: "", email: "", phone: "" },
        studyPreferences: "",
        source: "referral",
        assignedConsultant: "",
        status: "new",
      });
    }
  }, [lead, mode]);

  const validateForm = () => {
    const newErrors = {};
    if (mode === "add") {
      if (!formData.studentData.name.trim())
        newErrors.name = "Name is required";
      if (!formData.studentData.email.trim())
        newErrors.email = "Email is required";
      else if (!/\S+@\S+\.\S+/.test(formData.studentData.email))
        newErrors.email = "Invalid email format";
      if (!formData.studentData.phone.trim())
        newErrors.phone = "Phone is required";
      if (!formData.studyPreferences.trim())
        newErrors.studyPreferences = "Study preferences are required";
    }
    if (mode === "edit" && !formData.status)
      newErrors.status = "Status is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("studentData.")) {
      const field = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        studentData: { ...prev.studentData, [field]: value },
      }));
      setErrors((prev) => ({ ...prev, [field]: "" }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      toast.success(
        mode === "add"
          ? "Lead created successfully"
          : "Lead updated successfully",
        {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "colored",
        }
      );
      onClose();
    } catch (err) {
      toast.error(
        err.response?.data?.error ||
          `Failed to ${mode === "add" ? "create" : "update"} lead`,
        {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "colored",
        }
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg max-h-[90vh] overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">
            {mode === "add" ? "Add Lead" : "Edit Lead"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "add" && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Student Name *
                </label>
                <Input
                  type="text"
                  name="studentData.name"
                  value={formData.studentData.name}
                  onChange={handleChange}
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                    errors.name ? "border-red-500" : ""
                  }`}
                  placeholder="Enter student name"
                />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email *
                </label>
                <Input
                  type="email"
                  name="studentData.email"
                  value={formData.studentData.email}
                  onChange={handleChange}
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                    errors.email ? "border-red-500" : ""
                  }`}
                  placeholder="Enter email"
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Phone *
                </label>
                <Input
                  type="text"
                  name="studentData.phone"
                  value={formData.studentData.phone}
                  onChange={handleChange}
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                    errors.phone ? "border-red-500" : ""
                  }`}
                  placeholder="Enter phone"
                />
                {errors.phone && (
                  <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Study Preferences *
                </label>
                <Input
                  type="text"
                  name="studyPreferences"
                  value={formData.studyPreferences}
                  onChange={handleChange}
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                    errors.studyPreferences ? "border-red-500" : ""
                  }`}
                  placeholder="E.g., Undergraduate study in UK"
                />
                {errors.studyPreferences && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.studyPreferences}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Source
                </label>
                <select
                  name="source"
                  value={formData.source}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                >
                  <option value="referral">Referral</option>
                  <option value="online">Online</option>
                  <option value="walk_in">Walk-in</option>
                </select>
              </div>
            </>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Assigned Consultant
            </label>
            <select
              name="assignedConsultant"
              value={formData.assignedConsultant}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="">Unassigned</option>
              {consultants.map((consultant) => (
                <option key={consultant.id} value={consultant.id}>
                  {consultant.name}
                </option>
              ))}
            </select>
          </div>
          {mode === "edit" && (
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Status *
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                  errors.status ? "border-red-500" : ""
                }`}
              >
                <option value="">Select status</option>
                {[
                  { value: "new", label: "New" },
                  { value: "in_progress", label: "In Progress" },
                  { value: "converted", label: "Converted" },
                  { value: "lost", label: "Lost" },
                ].map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
              {errors.status && (
                <p className="text-red-500 text-xs mt-1">{errors.status}</p>
              )}
            </div>
          )}
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors duration-200"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 text-white transition-colors duration-200"
            >
              {isSubmitting ? (
                <span className="flex items-center">
                  <LoadingSpinner size="sm" className="mr-2 text-white" />
                  {mode === "add" ? "Creating..." : "Updating..."}
                </span>
              ) : mode === "add" ? (
                "Create Lead"
              ) : (
                "Update Lead"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEditLeadModal;
