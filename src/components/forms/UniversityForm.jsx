import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import Input from "../ui/Input";
import Select from "../ui/Select";
import Button from "../ui/Button";
import Card from "../ui/Card";
import { COUNTRY_OPTION } from "../../config/constants";

const UniversityForm = ({
  university = null,
  onSubmit,
  onCancel,
  loading = false,
  mode = "create",
}) => {
    console.log(university, "ascancjsancnuniversity");
    
  const [additionalDetails, setAdditionalDetails] = useState(
    university?.details || {
      establishedYear: "",
      studentPopulation: "",
      internationalStudents: "",
      campuses: "",
      ranking: "",
      accreditation: "",
      programs: [],
      facilities: [],
      admissionRequirements: "",
      applicationDeadlines: "",
      scholarships: "",
      hostelFacilities: false,
      sportsFacilities: false,
      library: false,
      researchFacilities: false,
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
      name: university?.name || "",
      country: university?.country || "",
      city: university?.city || "",
      website: university?.website || "",
      mouStatus: university?.mouStatus || "none",
    },
  });

  useEffect(() => {
    if (university && mode === "edit") {
      reset({
        name: university.name || "",
        country: university.country || "",
        city: university.city || "",
        website: university.website || "",
        mouStatus: university.mouStatus || "none",
      });
      setAdditionalDetails(
        university.details || {
          establishedYear: "",
          studentPopulation: "",
          internationalStudents: "",
          campuses: "",
          ranking: "",
          accreditation: "",
          programs: [],
          facilities: [],
          admissionRequirements: "",
          applicationDeadlines: "",
          scholarships: "",
          hostelFacilities: false,
          sportsFacilities: false,
          library: false,
          researchFacilities: false,
        }
      );
    }
  }, [university, mode, reset]);

  const mouStatusOptions = [
    { value: "none", label: "No MOU" },
    { value: "direct", label: "Direct Partnership" },
    { value: "third_party", label: "Third Party Partnership" },
  ];


  const programOptions = [
    { value: "undergraduate", label: "Undergraduate Programs" },
    { value: "postgraduate", label: "Postgraduate Programs" },
    { value: "phd", label: "PhD Programs" },
    { value: "diploma", label: "Diploma Programs" },
    { value: "certificate", label: "Certificate Programs" },
    { value: "exchange", label: "Exchange Programs" },
    { value: "research", label: "Research Programs" },
  ];

  const facilityOptions = [
    { value: "library", label: "Library" },
    { value: "labs", label: "Research Labs" },
    { value: "sports", label: "Sports Complex" },
    { value: "hostel", label: "Student Accommodation" },
    { value: "medical", label: "Medical Center" },
    { value: "cafeteria", label: "Dining Facilities" },
    { value: "transport", label: "Transportation" },
    { value: "wifi", label: "Campus WiFi" },
    { value: "career", label: "Career Services" },
    { value: "counseling", label: "Student Counseling" },
  ];

  const updateAdditionalDetail = (key, value) => {
    setAdditionalDetails((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const onFormSubmit = (data) => {
    const formData = {
      name: data.name,
      country: data.country,
      city: data.city,
      website: data.website,
      mouStatus: data.mouStatus,
      details: additionalDetails,
    };

    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-8">
      {/* Basic Information */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Basic Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <Input
              label="University Name"
              {...register("name", {
                required: "University name is required",
                minLength: {
                  value: 2,
                  message: "Name must be at least 2 characters",
                },
              })}
              error={errors.name?.message}
              placeholder="Enter university name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Country <span className="text-red-500">*</span>
            </label>
            <Select
              options={COUNTRY_OPTION}
              value={COUNTRY_OPTION.find(
                (option) => option.value === watch("country")
              )}
              onChange={(option) => setValue("country", option?.value || "")}
              placeholder="Select country"
              searchable
            />
            {errors.country && (
              <p className="text-sm text-red-600 mt-1">
                {errors.country.message}
              </p>
            )}
            <input
              type="hidden"
              {...register("country", { required: "Country is required" })}
            />
          </div>

          <Input
            label="City"
            {...register("city")}
            error={errors.city?.message}
            placeholder="Enter city name"
          />

          <Input
            label="Website URL"
            type="url"
            {...register("website", {
              pattern: {
                value: /^https?:\/\/.+\..+/,
                message: "Please enter a valid URL",
              },
            })}
            error={errors.website?.message}
            placeholder="https://university.edu"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              MOU Status <span className="text-red-500">*</span>
            </label>
            <Select
              options={mouStatusOptions}
              value={mouStatusOptions.find(
                (option) => option.value === watch("mouStatus")
              )}
              onChange={(option) => setValue("mouStatus", option.value)}
              placeholder="Select MOU status"
            />
            <input
              type="hidden"
              {...register("mouStatus", {
                required: "MOU status is required",
              })}
            />
          </div>
        </div>
      </div>

      {/* University Details */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          University Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Input
            label="Established Year"
            type="number"
            value={additionalDetails.establishedYear}
            onChange={(e) =>
              updateAdditionalDetail("establishedYear", e.target.value)
            }
            placeholder="e.g., 1985"
          />

          <Input
            label="Total Students"
            type="number"
            value={additionalDetails.studentPopulation}
            onChange={(e) =>
              updateAdditionalDetail("studentPopulation", e.target.value)
            }
            placeholder="e.g., 25000"
          />

          <Input
            label="International Students"
            type="number"
            value={additionalDetails.internationalStudents}
            onChange={(e) =>
              updateAdditionalDetail("internationalStudents", e.target.value)
            }
            placeholder="e.g., 5000"
          />

          <Input
            label="Number of Campuses"
            type="number"
            value={additionalDetails.campuses}
            onChange={(e) => updateAdditionalDetail("campuses", e.target.value)}
            placeholder="e.g., 3"
          />

          <Input
            label="World Ranking"
            value={additionalDetails.ranking}
            onChange={(e) => updateAdditionalDetail("ranking", e.target.value)}
            placeholder="e.g., QS Top 100"
          />

          <Input
            label="Accreditation"
            value={additionalDetails.accreditation}
            onChange={(e) =>
              updateAdditionalDetail("accreditation", e.target.value)
            }
            placeholder="e.g., AACSB, EQUIS"
          />
        </div>
      </div>

      {/* Programs Offered */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Programs Offered
        </h3>
        <Select
          options={programOptions}
          value={programOptions.filter((option) =>
            additionalDetails.programs?.includes(option.value)
          )}
          onChange={(selectedOptions) => {
            const values = Array.isArray(selectedOptions)
              ? selectedOptions.map((opt) => opt.value)
              : selectedOptions
              ? [selectedOptions.value]
              : [];
            updateAdditionalDetail("programs", values);
          }}
          placeholder="Select programs offered"
          multiple
        />
      </div>

      {/* Facilities */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Campus Facilities
        </h3>
        <Select
          options={facilityOptions}
          value={facilityOptions.filter((option) =>
            additionalDetails.facilities?.includes(option.value)
          )}
          onChange={(selectedOptions) => {
            const values = Array.isArray(selectedOptions)
              ? selectedOptions.map((opt) => opt.value)
              : selectedOptions
              ? [selectedOptions.value]
              : [];
            updateAdditionalDetail("facilities", values);
          }}
          placeholder="Select available facilities"
          multiple
        />
      </div>

      {/* Key Facilities Checkboxes */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Key Facilities
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { key: "hostelFacilities", label: "Student Housing" },
            { key: "sportsFacilities", label: "Sports Complex" },
            { key: "library", label: "Central Library" },
            { key: "researchFacilities", label: "Research Centers" },
          ].map((facility) => (
            <div key={facility.key} className="flex items-center">
              <input
                type="checkbox"
                id={facility.key}
                checked={additionalDetails[facility.key] || false}
                onChange={(e) =>
                  updateAdditionalDetail(facility.key, e.target.checked)
                }
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label
                htmlFor={facility.key}
                className="ml-2 text-sm text-gray-700"
              >
                {facility.label}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Additional Information */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Additional Information
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Admission Requirements
            </label>
            <textarea
              value={additionalDetails.admissionRequirements}
              onChange={(e) =>
                updateAdditionalDetail("admissionRequirements", e.target.value)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows="3"
              placeholder="Enter general admission requirements..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Application Deadlines
            </label>
            <textarea
              value={additionalDetails.applicationDeadlines}
              onChange={(e) =>
                updateAdditionalDetail("applicationDeadlines", e.target.value)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows="2"
              placeholder="Enter application deadlines for different intakes..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Scholarships Available
            </label>
            <textarea
              value={additionalDetails.scholarships}
              onChange={(e) =>
                updateAdditionalDetail("scholarships", e.target.value)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows="3"
              placeholder="Enter information about available scholarships..."
            />
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
          {mode === "create" ? "Add University" : "Update University"}
        </Button>
      </div>
    </form>
  );
};

export default UniversityForm;
