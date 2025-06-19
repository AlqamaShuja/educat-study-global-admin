import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import Input from "../ui/Input";
import Select from "../ui/Select";
import Button from "../ui/Button";
import Card from "../ui/Card";
import { useUserStore } from "../../stores/userStore";
import { useOfficeStore } from "../../stores/officeStore";

const LeadForm = ({
  lead = null,
  onSubmit,
  onCancel,
  loading = false,
  mode = "create",
}) => {
  const { consultants, fetchConsultants } = useUserStore();
  const { offices, fetchOffices } = useOfficeStore();
  const [studyPreferences, setStudyPreferences] = useState(
    lead?.studyPreferences || {
      destination: "",
      level: "",
      fields: [],
      budget: "",
      startDate: "",
    }
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm({
    defaultValues: {
      studentName: lead?.student?.name || "",
      studentEmail: lead?.student?.email || "",
      studentPhone: lead?.student?.phone || "",
      source: lead?.source || "walk_in",
      assignedConsultant: lead?.assignedConsultant || "",
      officeId: lead?.officeId || "",
      languagePreference: lead?.languagePreference || "english",
      notes: "",
    },
  });

  useEffect(() => {
    fetchConsultants();
    fetchOffices();
  }, [fetchConsultants, fetchOffices]);

  useEffect(() => {
    if (lead && mode === "edit") {
      reset({
        studentName: lead.student?.name || "",
        studentEmail: lead.student?.email || "",
        studentPhone: lead.student?.phone || "",
        source: lead.source || "walk_in",
        assignedConsultant: lead.assignedConsultant || "",
        officeId: lead.officeId || "",
        languagePreference: lead.languagePreference || "english",
        notes: "",
      });
      setStudyPreferences(
        lead.studyPreferences || {
          destination: "",
          level: "",
          fields: [],
          budget: "",
          startDate: "",
        }
      );
    }
  }, [lead, mode, reset]);

  const sourceOptions = [
    { value: "walk_in", label: "Walk-in" },
    { value: "online", label: "Online" },
    { value: "referral", label: "Referral" },
    { value: "Google OAuth", label: "Google OAuth" },
    { value: "Facebook OAuth", label: "Facebook OAuth" },
  ];

  const destinationOptions = [
    { value: "USA", label: "United States" },
    { value: "UK", label: "United Kingdom" },
    { value: "Canada", label: "Canada" },
    { value: "Australia", label: "Australia" },
    { value: "Germany", label: "Germany" },
    { value: "Netherlands", label: "Netherlands" },
    { value: "Sweden", label: "Sweden" },
    { value: "Other", label: "Other" },
  ];

  const levelOptions = [
    { value: "undergraduate", label: "Undergraduate" },
    { value: "postgraduate", label: "Postgraduate" },
    { value: "phd", label: "PhD" },
    { value: "diploma", label: "Diploma" },
    { value: "certificate", label: "Certificate" },
  ];

  const fieldOptions = [
    { value: "engineering", label: "Engineering" },
    { value: "business", label: "Business" },
    { value: "computer_science", label: "Computer Science" },
    { value: "medicine", label: "Medicine" },
    { value: "arts", label: "Arts" },
    { value: "sciences", label: "Sciences" },
    { value: "law", label: "Law" },
    { value: "education", label: "Education" },
  ];

  const languageOptions = [
    { value: "english", label: "English" },
    { value: "urdu", label: "Urdu" },
  ];

  const consultantOptions = consultants.map((consultant) => ({
    value: consultant.id,
    label: consultant.name,
  }));

  const officeOptions = offices.map((office) => ({
    value: office.id,
    label: office.name,
  }));

  const onFormSubmit = (data) => {
    const formData = {
      studentData: {
        name: data.studentName,
        email: data.studentEmail,
        phone: data.studentPhone,
      },
      studyPreferences,
      source: data.source,
      assignedConsultant: data.assignedConsultant || null,
      officeId: data.officeId || null,
      languagePreference: data.languagePreference,
      notes: data.notes,
    };

    onSubmit(formData);
  };

  const updateStudyPreference = (key, value) => {
    setStudyPreferences((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <Card title={`${mode === "create" ? "Create" : "Edit"} Lead`}>
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-8">
        {/* Student Information */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Student Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Input
              label="Student Name"
              {...register("studentName", {
                required: "Student name is required",
                minLength: {
                  value: 2,
                  message: "Name must be at least 2 characters",
                },
              })}
              error={errors.studentName?.message}
              placeholder="Enter student name"
              required
            />

            <Input
              label="Email Address"
              type="email"
              {...register("studentEmail", {
                required: "Email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address",
                },
              })}
              error={errors.studentEmail?.message}
              placeholder="Enter email address"
              required
            />

            <Input
              label="Phone Number"
              {...register("studentPhone", {
                required: "Phone number is required",
              })}
              error={errors.studentPhone?.message}
              placeholder="Enter phone number"
              required
            />
          </div>
        </div>

        {/* Study Preferences */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Study Preferences
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Study Destination <span className="text-red-500">*</span>
              </label>
              <Select
                options={destinationOptions}
                value={destinationOptions.find(
                  (option) => option.value === studyPreferences.destination
                )}
                onChange={(option) =>
                  updateStudyPreference("destination", option.value)
                }
                placeholder="Select destination"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Study Level <span className="text-red-500">*</span>
              </label>
              <Select
                options={levelOptions}
                value={levelOptions.find(
                  (option) => option.value === studyPreferences.level
                )}
                onChange={(option) =>
                  updateStudyPreference("level", option.value)
                }
                placeholder="Select level"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fields of Interest
              </label>
              <Select
                options={fieldOptions}
                value={fieldOptions.filter((option) =>
                  studyPreferences.fields?.includes(option.value)
                )}
                onChange={(selectedOptions) => {
                  const values = Array.isArray(selectedOptions)
                    ? selectedOptions.map((opt) => opt.value)
                    : [selectedOptions.value];
                  updateStudyPreference("fields", values);
                }}
                placeholder="Select fields"
                multiple
              />
            </div>

            <Input
              label="Budget (USD)"
              type="number"
              value={studyPreferences.budget}
              onChange={(e) => updateStudyPreference("budget", e.target.value)}
              placeholder="Enter budget"
            />

            <Input
              label="Preferred Start Date"
              type="date"
              value={studyPreferences.startDate}
              onChange={(e) =>
                updateStudyPreference("startDate", e.target.value)
              }
            />
          </div>
        </div>

        {/* Lead Information */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Lead Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Source <span className="text-red-500">*</span>
              </label>
              <Select
                options={sourceOptions}
                value={sourceOptions.find(
                  (option) => option.value === watch("source")
                )}
                onChange={(option) => setValue("source", option.value)}
                placeholder="Select source"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Assigned Consultant
              </label>
              <Select
                options={consultantOptions}
                value={consultantOptions.find(
                  (option) => option.value === watch("assignedConsultant")
                )}
                onChange={(option) =>
                  setValue("assignedConsultant", option?.value || "")
                }
                placeholder="Select consultant"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Office
              </label>
              <Select
                options={officeOptions}
                value={officeOptions.find(
                  (option) => option.value === watch("officeId")
                )}
                onChange={(option) => setValue("officeId", option?.value || "")}
                placeholder="Select office"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Language Preference
              </label>
              <Select
                options={languageOptions}
                value={languageOptions.find(
                  (option) => option.value === watch("languagePreference")
                )}
                onChange={(option) =>
                  setValue("languagePreference", option.value)
                }
                placeholder="Select language"
              />
            </div>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Initial Notes
          </label>
          <textarea
            {...register("notes")}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows="3"
            placeholder="Enter any initial notes or observations..."
          />
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
          <Button type="submit" loading={loading} disabled={loading}>
            {mode === "create" ? "Create Lead" : "Update Lead"}
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default LeadForm;
