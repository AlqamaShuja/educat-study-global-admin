import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import Input from "../ui/Input";
import Select from "../ui/Select";
import Button from "../ui/Button";
import Card from "../ui/Card";
import { AlertCircle } from "lucide-react";

const LeadRuleForm = ({
  rule = null,
  onSubmit,
  onCancel,
  loading = false,
  mode = "create",
  offices = [],
  consultants = [],
}) => {
  const [criteria, setCriteria] = useState(
    rule?.criteria || {
      officeId: "",
      studyDestination: "",
      leadSource: "",
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
      priority: rule?.priority || 1,
      officeId: rule?.officeId || "",
      consultantId: rule?.consultantId || "",
    },
  });

  useEffect(() => {
    if (rule && mode === "edit") {
      reset({
        priority: rule.priority || 1,
        officeId: rule.officeId || "",
        consultantId: rule.consultantId || "",
      });
      setCriteria(
        rule.criteria || {
          officeId: "",
          studyDestination: "",
          leadSource: "",
        }
      );
    }
  }, [rule, mode, reset]);

  const leadSourceOptions = [
    { value: "walk_in", label: "Walk In" },
    { value: "online", label: "Online" },
    { value: "referral", label: "Referral" },
    { value: "Google OAuth", label: "Google OAuth" },
    { value: "Facebook OAuth", label: "Facebook OAuth" },
  ];

  const studyDestinationOptions = [
    { value: "USA", label: "United States" },
    { value: "UK", label: "United Kingdom" },
    { value: "Canada", label: "Canada" },
    { value: "Australia", label: "Australia" },
    { value: "Germany", label: "Germany" },
    { value: "Netherlands", label: "Netherlands" },
    { value: "Sweden", label: "Sweden" },
    { value: "France", label: "France" },
    { value: "Switzerland", label: "Switzerland" },
    { value: "New Zealand", label: "New Zealand" },
    { value: "Ireland", label: "Ireland" },
    { value: "Norway", label: "Norway" },
    { value: "Denmark", label: "Denmark" },
  ];

  const officeOptions = offices.map((office) => ({
    value: office.id,
    label: `${office.name} - ${office.address?.city}`,
  }));

  // Filter consultants based on selected office
  const selectedOfficeId = watch("officeId");
  //   const availableConsultants = consultants.filter(
  //     (consultant) => consultant.officeId === selectedOfficeId
  //   );
  const availableConsultants = consultants.filter((consultant) => {
    const ids = consultant.consultantOffices.map((off) => off.id);
    console.log(
      selectedOfficeId,
      "vsaasnjcasjcsnsanca",
      ids,
      "sacmkacacma",
      consultant.consultantOffices
    );

    return ids.includes(selectedOfficeId);
  });

  const consultantOptions = availableConsultants.map((consultant) => ({
    value: consultant.id,
    label: `${consultant.name} (${consultant.email})`,
  }));

  const updateCriteria = (key, value) => {
    setCriteria((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const onFormSubmit = (data) => {
    const formData = {
      criteria: {
        ...criteria,
        officeId: criteria.officeId || null,
      },
      priority: parseInt(data.priority),
      officeId: data.officeId || null,
      consultantId: data.consultantId || null,
    };

    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-8">
      {/* Rule Priority */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Rule Priority
        </h3>
        <div className="max-w-xs">
          <Input
            label="Priority Level"
            type="number"
            min="1"
            max="100"
            {...register("priority", {
              required: "Priority is required",
              min: { value: 1, message: "Priority must be at least 1" },
              max: { value: 100, message: "Priority cannot exceed 100" },
            })}
            error={errors.priority?.message}
            placeholder="Enter priority (1-100)"
            required
          />
          <p className="text-sm text-gray-500 mt-1">
            Lower numbers = higher priority (1 is highest priority)
          </p>
        </div>
      </div>

      {/* Lead Criteria */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Lead Matching Criteria
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Office (Criteria)
            </label>
            <Select
              options={officeOptions}
              value={officeOptions.find(
                (option) => option.value === criteria.officeId
              )}
              onChange={(option) =>
                updateCriteria("officeId", option?.value || "")
              }
              placeholder="Any office"
              searchable
            />
            <p className="text-xs text-gray-500 mt-1">
              Apply rule to leads from this office
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Study Destination
            </label>
            <Select
              options={studyDestinationOptions}
              value={studyDestinationOptions.find(
                (option) => option.value === criteria.studyDestination
              )}
              onChange={(option) =>
                updateCriteria("studyDestination", option?.value || "")
              }
              placeholder="Any destination"
              searchable
            />
            <p className="text-xs text-gray-500 mt-1">
              Apply rule to leads wanting to study here
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Lead Source
            </label>
            <Select
              options={leadSourceOptions}
              value={leadSourceOptions.find(
                (option) => option.value === criteria.leadSource
              )}
              onChange={(option) =>
                updateCriteria("leadSource", option?.value || "")
              }
              placeholder="Any source"
            />
            <p className="text-xs text-gray-500 mt-1">
              Apply rule to leads from this source
            </p>
          </div>
        </div>

        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-blue-400 mr-2 mt-0.5" />
            <div className="text-sm text-blue-700">
              <p className="font-medium">Criteria Matching Rules:</p>
              <ul className="mt-1 list-disc list-inside space-y-1">
                <li>
                  Empty criteria fields will match ANY value for that field
                </li>
                <li>Multiple criteria must ALL match for the rule to apply</li>
                <li>
                  Rules with higher priority (lower numbers) are checked first
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Assignment Target */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Assignment Target
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Target Office <span className="text-red-500">*</span>
            </label>
            <Select
              options={officeOptions}
              value={officeOptions.find(
                (option) => option.value === watch("officeId")
              )}
              onChange={(option) => {
                setValue("officeId", option?.value || "");
                setValue("consultantId", ""); // Reset consultant when office changes
              }}
              placeholder="Select target office"
              searchable
            />
            {errors.officeId && (
              <p className="text-sm text-red-600 mt-1">
                {errors.officeId.message}
              </p>
            )}
            <input
              type="hidden"
              {...register("officeId", {
                required: "Target office is required",
              })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Target Consultant
            </label>
            <Select
              options={consultantOptions}
              value={consultantOptions.find(
                (option) => option.value === watch("consultantId")
              )}
              onChange={(option) =>
                setValue("consultantId", option?.value || "")
              }
              placeholder={
                selectedOfficeId
                  ? "Select consultant (optional)"
                  : "Select office first"
              }
              disabled={!selectedOfficeId}
              searchable
            />
            <p className="text-xs text-gray-500 mt-1">
              Leave empty to assign to any consultant in the office
            </p>
          </div>
        </div>
      </div>

      {/* Rule Summary */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="text-md font-medium text-gray-900 mb-3">Rule Summary</h4>
        <div className="text-sm text-gray-700 space-y-2">
          <div>
            <strong>Priority:</strong> {watch("priority") || 1} (
            {watch("priority") <= 10
              ? "High"
              : watch("priority") <= 50
              ? "Medium"
              : "Low"}{" "}
            priority)
          </div>
          <div>
            <strong>Will match leads:</strong>
            <ul className="ml-4 mt-1 space-y-1">
              {criteria.officeId && (
                <li>
                  • From office:{" "}
                  {
                    officeOptions.find((o) => o.value === criteria.officeId)
                      ?.label
                  }
                </li>
              )}
              {criteria.studyDestination && (
                <li>• Wanting to study in: {criteria.studyDestination}</li>
              )}
              {criteria.leadSource && (
                <li>
                  • From source:{" "}
                  {
                    leadSourceOptions.find(
                      (s) => s.value === criteria.leadSource
                    )?.label
                  }
                </li>
              )}
              {!criteria.officeId &&
                !criteria.studyDestination &&
                !criteria.leadSource && (
                  <li>• Any lead (no specific criteria)</li>
                )}
            </ul>
          </div>
          <div>
            <strong>Will assign to:</strong>
            <ul className="ml-4 mt-1">
              <li>
                • Office:{" "}
                {officeOptions.find((o) => o.value === watch("officeId"))
                  ?.label || "Not selected"}
              </li>
              <li>
                • Consultant:{" "}
                {consultantOptions.find(
                  (c) => c.value === watch("consultantId")
                )?.label || "Any consultant in office"}
              </li>
            </ul>
          </div>
        </div>
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
          {mode === "create" ? "Create Rule" : "Update Rule"}
        </Button>
      </div>
    </form>
  );
};

export default LeadRuleForm;
