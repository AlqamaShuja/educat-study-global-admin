import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import Input from "../ui/Input";
import Select from "../ui/Select";
import Button from "../ui/Button";
import Card from "../ui/Card";
import useUniversityStore from "../../stores/universityStore";

const CourseForm = ({
  course = null,
  onSubmit,
  onCancel,
  loading = false,
  mode = "create",
  preselectedUniversity = null,
}) => {
  const { universities, fetchUniversities } = useUniversityStore();
  const [courseDetails, setCourseDetails] = useState(
    course?.details || {
      modules: [],
      prerequisites: "",
      careerProspects: "",
      entryRequirements: "",
      englishRequirements: "",
      applicationDeadline: "",
      startDates: [],
      scholarships: "",
      fees: {
        tuition: "",
        application: "",
        deposit: "",
        other: "",
      },
      duration: {
        years: "",
        months: "",
        fullTime: true,
        partTime: false,
      },
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
      name: course?.name || "",
      universityId: preselectedUniversity?.id || course?.universityId || "",
      level: course?.level || "",
      duration: course?.duration || "",
      creditHour: course?.creditHour || "",
      tuitionFee: course?.tuitionFee || "",
    },
  });

  useEffect(() => {
    fetchUniversities();
  }, [fetchUniversities]);

  useEffect(() => {
    if (course && mode === "edit") {
      reset({
        name: course.name || "",
        universityId: course.universityId || "",
        level: course.level || "",
        duration: course.duration || "",
        creditHour: course.creditHour || "",
        tuitionFee: course.tuitionFee || "",
      });
      setCourseDetails(
        course.details || {
          modules: [],
          prerequisites: "",
          careerProspects: "",
          entryRequirements: "",
          englishRequirements: "",
          applicationDeadline: "",
          startDates: [],
          scholarships: "",
          fees: {
            tuition: "",
            application: "",
            deposit: "",
            other: "",
          },
          duration: {
            years: "",
            months: "",
            fullTime: true,
            partTime: false,
          },
        }
      );
    }
  }, [course, mode, reset]);

  const levelOptions = [
    { value: "bachelor", label: "Bachelor's Degree" },
    { value: "master", label: "Master's Degree" },
    { value: "phd", label: "PhD" },
    { value: "diploma", label: "Diploma" },
    { value: "certificate", label: "Certificate" },
  ];

  const universityOptions = universities.map((university) => ({
    value: university.id,
    label: university.name,
  }));

  const startDateOptions = [
    { value: "january", label: "January" },
    { value: "february", label: "February" },
    { value: "march", label: "March" },
    { value: "april", label: "April" },
    { value: "may", label: "May" },
    { value: "june", label: "June" },
    { value: "july", label: "July" },
    { value: "august", label: "August" },
    { value: "september", label: "September" },
    { value: "october", label: "October" },
    { value: "november", label: "November" },
    { value: "december", label: "December" },
  ];

  const updateCourseDetail = (key, value) => {
    setCourseDetails((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const updateNestedDetail = (parent, key, value) => {
    setCourseDetails((prev) => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [key]: value,
      },
    }));
  };

  const addModule = () => {
    setCourseDetails((prev) => ({
      ...prev,
      modules: [...prev.modules, { name: "", credits: "", description: "" }],
    }));
  };

  const updateModule = (index, field, value) => {
    setCourseDetails((prev) => ({
      ...prev,
      modules: prev.modules.map((module, i) =>
        i === index ? { ...module, [field]: value } : module
      ),
    }));
  };

  const removeModule = (index) => {
    setCourseDetails((prev) => ({
      ...prev,
      modules: prev.modules.filter((_, i) => i !== index),
    }));
  };

  const onFormSubmit = (data) => {
    const formData = {
      name: data.name,
      universityId: data.universityId || null,
      level: data.level,
      duration: data.duration,
      creditHour: data.creditHour,
      tuitionFee: parseFloat(data.tuitionFee) || null,
      details: courseDetails,
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
              label="Course Name"
              {...register("name", {
                required: "Course name is required",
                minLength: {
                  value: 2,
                  message: "Name must be at least 2 characters",
                },
              })}
              error={errors.name?.message}
              placeholder="Enter course name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              University
            </label>
            <Select
              options={universityOptions}
              value={universityOptions.find(
                (option) => option.value === watch("universityId")
              )}
              onChange={(option) =>
                setValue("universityId", option?.value || "")
              }
              placeholder="Select university"
              searchable
              disabled={!!preselectedUniversity}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Level <span className="text-red-500">*</span>
            </label>
            <Select
              options={levelOptions}
              value={levelOptions.find(
                (option) => option.value === watch("level")
              )}
              onChange={(option) => setValue("level", option?.value || "")}
              placeholder="Select level"
            />
            {errors.level && (
              <p className="text-sm text-red-600 mt-1">
                {errors.level.message}
              </p>
            )}
            <input
              type="hidden"
              {...register("level", { required: "Level is required" })}
            />
          </div>

          <Input
            label="Duration"
            {...register("duration")}
            error={errors.duration?.message}
            placeholder="e.g., 3 years, 18 months"
          />

          <Input
            label="Credit Hours"
            {...register("creditHour")}
            error={errors.creditHour?.message}
            placeholder="e.g., 120, 180"
          />

          <Input
            label="Tuition Fee (Annual)"
            type="number"
            step="0.01"
            {...register("tuitionFee")}
            error={errors.tuitionFee?.message}
            placeholder="Enter tuition fee"
          />
        </div>
      </div>

      {/* Course Duration Details */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Duration Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Input
            label="Years"
            type="number"
            value={courseDetails.duration?.years || ""}
            onChange={(e) =>
              updateNestedDetail("duration", "years", e.target.value)
            }
            placeholder="e.g., 3"
          />

          <Input
            label="Months"
            type="number"
            value={courseDetails.duration?.months || ""}
            onChange={(e) =>
              updateNestedDetail("duration", "months", e.target.value)
            }
            placeholder="e.g., 18"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Study Mode
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={courseDetails.duration?.fullTime || false}
                  onChange={(e) =>
                    updateNestedDetail("duration", "fullTime", e.target.checked)
                  }
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Full Time</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={courseDetails.duration?.partTime || false}
                  onChange={(e) =>
                    updateNestedDetail("duration", "partTime", e.target.checked)
                  }
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Part Time</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Fee Structure */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Fee Structure
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Input
            label="Tuition Fee (Annual)"
            type="number"
            step="0.01"
            value={courseDetails.fees?.tuition || ""}
            onChange={(e) =>
              updateNestedDetail("fees", "tuition", e.target.value)
            }
            placeholder="Enter tuition fee"
          />

          <Input
            label="Application Fee"
            type="number"
            step="0.01"
            value={courseDetails.fees?.application || ""}
            onChange={(e) =>
              updateNestedDetail("fees", "application", e.target.value)
            }
            placeholder="Enter application fee"
          />

          <Input
            label="Deposit Fee"
            type="number"
            step="0.01"
            value={courseDetails.fees?.deposit || ""}
            onChange={(e) =>
              updateNestedDetail("fees", "deposit", e.target.value)
            }
            placeholder="Enter deposit fee"
          />

          <Input
            label="Other Fees"
            type="number"
            step="0.01"
            value={courseDetails.fees?.other || ""}
            onChange={(e) =>
              updateNestedDetail("fees", "other", e.target.value)
            }
            placeholder="Enter other fees"
          />
        </div>
      </div>

      {/* Course Modules */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Course Modules</h3>
          <Button type="button" variant="outline" size="sm" onClick={addModule}>
            Add Module
          </Button>
        </div>

        {courseDetails.modules?.map((module, index) => (
          <div
            key={index}
            className="border border-gray-200 rounded-lg p-4 mb-4"
          >
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-md font-medium text-gray-800">
                Module {index + 1}
              </h4>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => removeModule(index)}
                className="text-red-600"
              >
                Remove
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Module Name"
                value={module.name || ""}
                onChange={(e) => updateModule(index, "name", e.target.value)}
                placeholder="Enter module name"
              />

              <Input
                label="Credits"
                type="number"
                value={module.credits || ""}
                onChange={(e) => updateModule(index, "credits", e.target.value)}
                placeholder="Enter credits"
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={module.description || ""}
                  onChange={(e) =>
                    updateModule(index, "description", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows="2"
                  placeholder="Enter module description"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Start Dates */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Available Start Dates
        </h3>
        <Select
          options={startDateOptions}
          value={startDateOptions.filter((option) =>
            courseDetails.startDates?.includes(option.value)
          )}
          onChange={(selectedOptions) => {
            const values = Array.isArray(selectedOptions)
              ? selectedOptions.map((opt) => opt.value)
              : selectedOptions
              ? [selectedOptions.value]
              : [];
            updateCourseDetail("startDates", values);
          }}
          placeholder="Select available start dates"
          multiple
        />
      </div>

      {/* Requirements */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Requirements</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Entry Requirements
            </label>
            <textarea
              value={courseDetails.entryRequirements || ""}
              onChange={(e) =>
                updateCourseDetail("entryRequirements", e.target.value)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows="3"
              placeholder="Enter entry requirements..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              English Language Requirements
            </label>
            <textarea
              value={courseDetails.englishRequirements || ""}
              onChange={(e) =>
                updateCourseDetail("englishRequirements", e.target.value)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows="2"
              placeholder="e.g., IELTS 6.5, TOEFL 90..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Prerequisites
            </label>
            <textarea
              value={courseDetails.prerequisites || ""}
              onChange={(e) =>
                updateCourseDetail("prerequisites", e.target.value)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows="2"
              placeholder="Enter any prerequisites..."
            />
          </div>
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
              Career Prospects
            </label>
            <textarea
              value={courseDetails.careerProspects || ""}
              onChange={(e) =>
                updateCourseDetail("careerProspects", e.target.value)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows="3"
              placeholder="Enter career prospects and job opportunities..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Application Deadline
            </label>
            <input
              type="date"
              value={courseDetails.applicationDeadline || ""}
              onChange={(e) =>
                updateCourseDetail("applicationDeadline", e.target.value)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Scholarships Available
            </label>
            <textarea
              value={courseDetails.scholarships || ""}
              onChange={(e) =>
                updateCourseDetail("scholarships", e.target.value)
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
          {mode === "create" ? "Add Course" : "Update Course"}
        </Button>
      </div>
    </form>
  );
};

export default CourseForm;
