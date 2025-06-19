import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import Button from "../ui/Button";
import Card from "../ui/Card";
import Input from "../ui/Input";
import Select from "../ui/Select";
import FileUpload from "../ui/FileUpload";

const MultiStepForm = ({
  onSubmit,
  onCancel,
  loading = false,
  initialData = {},
  steps = [],
  title = "Multi-Step Form",
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState(initialData);
  const [completedSteps, setCompletedSteps] = useState(new Set());
  const [uploadedFiles, setUploadedFiles] = useState({});

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
    trigger,
  } = useForm({
    mode: "onChange",
    defaultValues: initialData,
  });

  useEffect(() => {
    // Reset form with current step data
    const stepData = formData[steps[currentStep]?.key] || {};
    reset(stepData);
  }, [currentStep, formData, steps, reset]);

  const defaultSteps = [
    {
      key: "basic_info",
      title: "Basic Information",
      description: "Enter your personal details",
      fields: [
        {
          name: "firstName",
          label: "First Name",
          type: "text",
          required: true,
        },
        { name: "lastName", label: "Last Name", type: "text", required: true },
        { name: "email", label: "Email", type: "email", required: true },
        { name: "phone", label: "Phone", type: "tel", required: true },
        {
          name: "dateOfBirth",
          label: "Date of Birth",
          type: "date",
          required: true,
        },
      ],
    },
    {
      key: "preferences",
      title: "Study Preferences",
      description: "Tell us about your study goals",
      fields: [
        {
          name: "destination",
          label: "Preferred Destination",
          type: "select",
          required: true,
          options: [
            { value: "USA", label: "United States" },
            { value: "UK", label: "United Kingdom" },
            { value: "Canada", label: "Canada" },
            { value: "Australia", label: "Australia" },
          ],
        },
        {
          name: "level",
          label: "Study Level",
          type: "select",
          required: true,
          options: [
            { value: "undergraduate", label: "Undergraduate" },
            { value: "postgraduate", label: "Postgraduate" },
            { value: "phd", label: "PhD" },
          ],
        },
        {
          name: "field",
          label: "Field of Study",
          type: "select",
          required: true,
          options: [
            { value: "engineering", label: "Engineering" },
            { value: "business", label: "Business" },
            { value: "computer_science", label: "Computer Science" },
            { value: "medicine", label: "Medicine" },
          ],
        },
        {
          name: "budget",
          label: "Budget (USD)",
          type: "number",
          required: false,
        },
        {
          name: "startDate",
          label: "Preferred Start Date",
          type: "date",
          required: false,
        },
      ],
    },
    {
      key: "documents",
      title: "Document Upload",
      description: "Upload required documents",
      fields: [
        {
          name: "passport",
          label: "Passport",
          type: "file",
          required: true,
          accept: ".pdf,.jpg,.jpeg,.png",
        },
        {
          name: "transcript",
          label: "Academic Transcript",
          type: "file",
          required: true,
          accept: ".pdf",
        },
        {
          name: "testScores",
          label: "Test Scores (IELTS/TOEFL)",
          type: "file",
          required: false,
          accept: ".pdf,.jpg,.jpeg,.png",
        },
        {
          name: "photo",
          label: "Passport Photo",
          type: "file",
          required: true,
          accept: ".jpg,.jpeg,.png",
        },
      ],
    },
    {
      key: "review",
      title: "Review & Submit",
      description: "Review your information before submitting",
      isReview: true,
    },
  ];

  const currentSteps = steps.length > 0 ? steps : defaultSteps;
  const currentStepData = currentSteps[currentStep];

  const handleNext = async () => {
    const isValid = await trigger();

    if (isValid) {
      // Save current step data
      const stepData = watch();
      setFormData((prev) => ({
        ...prev,
        [currentStepData.key]: stepData,
      }));

      // Mark step as completed
      setCompletedSteps((prev) => new Set([...prev, currentStep]));

      if (currentStep < currentSteps.length - 1) {
        setCurrentStep((prev) => prev + 1);
      } else {
        // Submit form
        handleFinalSubmit();
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      // Save current step data before going back
      const stepData = watch();
      setFormData((prev) => ({
        ...prev,
        [currentStepData.key]: stepData,
      }));
      setCurrentStep((prev) => prev - 1);
    }
  };

  const goToStep = (stepIndex) => {
    // Save current step data
    const stepData = watch();
    setFormData((prev) => ({
      ...prev,
      [currentStepData.key]: stepData,
    }));
    setCurrentStep(stepIndex);
  };

  const handleFinalSubmit = () => {
    const finalData = {
      ...formData,
      [currentStepData.key]: watch(),
      uploadedFiles,
    };
    onSubmit(finalData);
  };

  const handleFileUpload = (fieldName, files) => {
    setUploadedFiles((prev) => ({
      ...prev,
      [fieldName]: files,
    }));
  };

  const renderField = (field) => {
    const { name, label, type, required, options, accept } = field;

    switch (type) {
      case "select":
        return (
          <div key={name}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {label} {required && <span className="text-red-500">*</span>}
            </label>
            <Select
              options={options}
              value={options?.find((option) => option.value === watch(name))}
              onChange={(option) => setValue(name, option?.value || "")}
              placeholder={`Select ${label.toLowerCase()}`}
              error={errors[name]?.message}
            />
            {required && (
              <input
                type="hidden"
                {...register(name, { required: `${label} is required` })}
              />
            )}
          </div>
        );

      case "file":
        return (
          <div key={name}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {label} {required && <span className="text-red-500">*</span>}
            </label>
            <FileUpload
              onFileSelect={(files) => handleFileUpload(name, files)}
              accept={accept}
              variant="dropzone"
              multiple={false}
              className="mb-2"
            >
              Drop {label.toLowerCase()} here or click to browse
            </FileUpload>
            {required && !uploadedFiles[name] && (
              <p className="text-sm text-red-600">{label} is required</p>
            )}
          </div>
        );

      case "textarea":
        return (
          <div key={name}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {label} {required && <span className="text-red-500">*</span>}
            </label>
            <textarea
              {...register(name, {
                required: required ? `${label} is required` : false,
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows="4"
              placeholder={`Enter ${label.toLowerCase()}`}
            />
            {errors[name] && (
              <p className="text-sm text-red-600 mt-1">
                {errors[name].message}
              </p>
            )}
          </div>
        );

      default:
        return (
          <Input
            key={name}
            label={label}
            type={type}
            {...register(name, {
              required: required ? `${label} is required` : false,
              pattern:
                type === "email"
                  ? {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Invalid email address",
                    }
                  : undefined,
            })}
            error={errors[name]?.message}
            placeholder={`Enter ${label.toLowerCase()}`}
            required={required}
          />
        );
    }
  };

  const renderReviewStep = () => {
    return (
      <div className="space-y-6">
        {currentSteps.slice(0, -1).map((step, index) => {
          const stepData = formData[step.key] || {};

          return (
            <Card key={step.key} title={step.title} className="bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {step.fields?.map((field) => {
                  const value = stepData[field.name];
                  if (!value && field.type !== "file") return null;

                  return (
                    <div key={field.name}>
                      <dt className="text-sm font-medium text-gray-500">
                        {field.label}
                      </dt>
                      <dd className="text-sm text-gray-900 mt-1">
                        {field.type === "select"
                          ? field.options?.find((opt) => opt.value === value)
                              ?.label || value
                          : field.type === "file"
                          ? uploadedFiles[field.name]
                            ? `${uploadedFiles[field.name].name} (${(
                                uploadedFiles[field.name].size / 1024
                              ).toFixed(1)} KB)`
                            : "No file uploaded"
                          : value || "Not provided"}
                      </dd>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => goToStep(index)}
                >
                  Edit {step.title}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    );
  };

  const getStepStatus = (stepIndex) => {
    if (stepIndex === currentStep) return "current";
    if (completedSteps.has(stepIndex)) return "completed";
    return "upcoming";
  };

  const getStepIcon = (stepIndex) => {
    const status = getStepStatus(stepIndex);

    if (status === "completed") {
      return (
        <svg
          className="w-5 h-5 text-white"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
          />
        </svg>
      );
    }

    return <span className="text-sm font-medium">{stepIndex + 1}</span>;
  };

  return (
    <Card title={title}>
      {/* Step Progress */}
      <div className="mb-8">
        <nav aria-label="Progress">
          <ol className="flex items-center">
            {currentSteps.map((step, index) => {
              const status = getStepStatus(index);

              return (
                <li
                  key={step.key}
                  className={`relative ${
                    index !== currentSteps.length - 1 ? "pr-8 sm:pr-20" : ""
                  } flex-1`}
                >
                  {/* Step Connector */}
                  {index !== currentSteps.length - 1 && (
                    <div
                      className="absolute inset-0 flex items-center"
                      aria-hidden="true"
                    >
                      <div
                        className={`h-0.5 w-full ${
                          status === "completed" ? "bg-blue-600" : "bg-gray-200"
                        }`}
                      />
                    </div>
                  )}

                  {/* Step Item */}
                  <button
                    type="button"
                    onClick={() => goToStep(index)}
                    className={`
                      relative w-8 h-8 flex items-center justify-center rounded-full border-2 transition-colors
                      ${
                        status === "current"
                          ? "border-blue-600 bg-blue-600"
                          : ""
                      }
                      ${
                        status === "completed"
                          ? "border-blue-600 bg-blue-600"
                          : ""
                      }
                      ${status === "upcoming" ? "border-gray-300 bg-white" : ""}
                    `}
                  >
                    <span
                      className={
                        status === "upcoming" ? "text-gray-500" : "text-white"
                      }
                    >
                      {getStepIcon(index)}
                    </span>
                  </button>

                  {/* Step Label */}
                  <div className="mt-2">
                    <p
                      className={`text-xs font-medium ${
                        status === "current" ? "text-blue-600" : "text-gray-500"
                      }`}
                    >
                      {step.title}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        </nav>
      </div>

      {/* Step Content */}
      <div className="mb-8">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            {currentStepData.title}
          </h2>
          {currentStepData.description && (
            <p className="text-sm text-gray-600 mt-1">
              {currentStepData.description}
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit(handleNext)}>
          {currentStepData.isReview ? (
            renderReviewStep()
          ) : (
            <div className="space-y-6">
              {currentStepData.fields?.map((field) => renderField(field))}
            </div>
          )}
        </form>
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center pt-6 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={currentStep === 0 ? onCancel : handlePrevious}
        >
          {currentStep === 0 ? "Cancel" : "Previous"}
        </Button>

        <div className="flex space-x-3">
          {currentStep === currentSteps.length - 1 ? (
            <Button
              type="button"
              onClick={handleFinalSubmit}
              loading={loading}
              disabled={loading}
            >
              Submit Application
            </Button>
          ) : (
            <Button type="button" onClick={handleNext} disabled={loading}>
              Next
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};

export default MultiStepForm;
