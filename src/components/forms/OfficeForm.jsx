import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import Input from "../ui/Input";
import Select from "../ui/Select";
import Button from "../ui/Button";
import Card from "../ui/Card";
import useUserStore from "../../stores/userStore";

const OfficeForm = ({
  office = null,
  onSubmit,
  onCancel,
  loading = false,
  mode = "create",
}) => {
  const { users, isLoading, fetchAllStaff } = useUserStore();
  const [workingDays, setWorkingDays] = useState(
    office?.workingDays || [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
    ]
  );
  const [officeHours, setOfficeHours] = useState(
    office?.officeHours || {
      Monday: "9:00 AM - 5:00 PM",
      Tuesday: "9:00 AM - 5:00 PM",
      Wednesday: "9:00 AM - 5:00 PM",
      Thursday: "9:00 AM - 5:00 PM",
      Friday: "9:00 AM - 5:00 PM",
    }
  );
  const [selectedConsultants, setSelectedConsultants] = useState(
    office?.consultants?.map((c) => c.id) || []
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
      name: office?.name || "",
      street: office?.address?.street || "",
      city: office?.address?.city || "",
      state: office?.address?.state || "",
      country: office?.address?.country || "",
      postalCode: office?.address?.postalCode || "",
      phone: office?.contact?.phone || "",
      email: office?.contact?.email || "",
      managerId: office?.managerId || "",
      maxAppointments: office?.serviceCapacity?.maxAppointments || 20,
      maxConsultants: office?.serviceCapacity?.maxConsultants || 5,
      isActive: office?.isActive !== undefined ? office.isActive : true,
    },
  });

  useEffect(() => {
    fetchAllStaff();
  }, [fetchAllStaff]);

  useEffect(() => {
    if (office && mode === "edit") {
      reset({
        name: office.name || "",
        street: office.address?.street || "",
        city: office.address?.city || "",
        state: office.address?.state || "",
        country: office.address?.country || "",
        postalCode: office.address?.postalCode || "",
        phone: office.contact?.phone || "",
        email: office.contact?.email || "",
        managerId: office.managerId || "",
        maxAppointments: office.serviceCapacity?.maxAppointments || 20,
        maxConsultants: office.serviceCapacity?.maxConsultants || 5,
        isActive: office.isActive !== undefined ? office.isActive : true,
      });
      setWorkingDays(
        office.workingDays || [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
        ]
      );
      setOfficeHours(office.officeHours || {});
      setSelectedConsultants(office.consultants?.map((c) => c.id) || []);
    }
  }, [office, mode, reset]);

  const daysOfWeek = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  const managers = users.filter((user) => user.role === "manager") || [];
  const consultants = users.filter((user) => user.role === "consultant") || [];

  const managerOptions = managers.map((manager) => ({
    value: manager.id,
    label: manager.name,
  }));

  const consultantOptions = consultants.map((consultant) => ({
    value: consultant.id,
    label: consultant.name,
  }));

  const statusOptions = [
    { value: true, label: "Active" },
    { value: false, label: "Inactive" },
  ];

  const handleWorkingDayToggle = (day) => {
    setWorkingDays((prev) => {
      const updated = prev.includes(day)
        ? prev.filter((d) => d !== day)
        : [...prev, day];
      return updated;
    });
  };

  const handleOfficeHourChange = (day, value) => {
    setOfficeHours((prev) => ({
      ...prev,
      [day]: value,
    }));
  };

  const onFormSubmit = (data) => {
    const formData = {
      name: data.name,
      address: {
        street: data.street,
        city: data.city,
        state: data.state,
        country: data.country,
        postalCode: data.postalCode,
      },
      contact: {
        phone: data.phone,
        email: data.email,
      },
      officeHours,
      workingDays,
      serviceCapacity: {
        maxAppointments: parseInt(data.maxAppointments),
        maxConsultants: parseInt(data.maxConsultants),
      },
      isActive: data.isActive,
      managerId: data.managerId || null,
      consultants: selectedConsultants,
    };

    onSubmit(formData);
  };

  if (isLoading && !users.length) {
    return <div>Loading staff data...</div>;
  }

  return (
    <Card title={`${mode === "create" ? "Create" : "Edit"} Office`}>
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-8">
        {/* Basic Information */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Basic Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <Input
                label="Office Name"
                {...register("name", {
                  required: "Office name is required",
                  minLength: {
                    value: 2,
                    message: "Name must be at least 2 characters",
                  },
                })}
                error={errors.name?.message}
                placeholder="Enter office name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Manager
              </label>
              <Select
                options={managerOptions}
                value={managerOptions.find(
                  (option) => option.value === watch("managerId")
                )}
                onChange={(option) =>
                  setValue("managerId", option?.value || "")
                }
                placeholder="Select manager"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status <span className="text-red-500">*</span>
              </label>
              <Select
                options={statusOptions}
                value={statusOptions.find(
                  (option) => option.value === watch("isActive")
                )}
                onChange={(option) => setValue("isActive", option.value)}
                placeholder="Select status"
              />
              <input
                type="hidden"
                {...register("isActive", { required: "Status is required" })}
              />
            </div>
          </div>
        </div>

        {/* Address Information */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Address Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <Input
                label="Street Address"
                {...register("street", {
                  required: "Street address is required",
                })}
                error={errors.street?.message}
                placeholder="Enter street address"
                required
              />
            </div>

            <Input
              label="City"
              {...register("city", { required: "City is required" })}
              error={errors.city?.message}
              placeholder="Enter city"
              required
            />

            <Input
              label="State/Province"
              {...register("state")}
              error={errors.state?.message}
              placeholder="Enter state or province"
            />

            <Input
              label="Country"
              {...register("country", { required: "Country is required" })}
              error={errors.country?.message}
              placeholder="Enter country"
              required
            />

            <Input
              label="Zip/Postal Code"
              {...register("postalCode")}
              error={errors.postalCode?.message}
              placeholder="Enter postal code"
            />
          </div>
        </div>

        {/* Contact Information */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Contact Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Phone Number"
              {...register("phone", {
                required: "Phone number is required",
                pattern: {
                  value: /^[\+]?[1-9][\d]{0,15}$/,
                  message: "Invalid phone number",
                },
              })}
              error={errors.phone?.message}
              placeholder="Enter phone number"
              required
            />

            <Input
              label="Email Address"
              type="email"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address",
                },
              })}
              error={errors.email?.message}
              placeholder="Enter email address"
              required
            />
          </div>
        </div>

        {/* Working Days */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Working Days
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {daysOfWeek.map((day) => (
              <div key={day} className="flex items-center">
                <input
                  type="checkbox"
                  id={day}
                  checked={workingDays.includes(day)}
                  onChange={() => handleWorkingDayToggle(day)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor={day} className="ml-2 text-sm text-gray-700">
                  {day}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Office Hours */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Office Hours
          </h3>
          <div className="space-y-4">
            {workingDays.map((day) => (
              <div key={day} className="flex items-center space-x-4">
                <div className="w-24">
                  <span className="text-sm font-medium text-gray-700">
                    {day}
                  </span>
                </div>
                <div className="flex-1 max-w-md">
                  <input
                    type="text"
                    value={officeHours[day] || ""}
                    onChange={(e) =>
                      handleOfficeHourChange(day, e.target.value)
                    }
                    placeholder="e.g., 9:00 AM - 5:00 PM"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Service Capacity */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Service Capacity
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Maximum Appointments Per Day"
              type="number"
              {...register("maxAppointments", {
                required: "Maximum appointments is required",
                min: { value: 1, message: "Must be at least 1" },
                max: { value: 100, message: "Cannot exceed 100" },
              })}
              error={errors.maxAppointments?.message}
              placeholder="Enter max appointments"
              required
            />

            <Input
              label="Maximum Consultants"
              type="number"
              {...register("maxConsultants", {
                required: "Maximum consultants is required",
                min: { value: 1, message: "Must be at least 1" },
                max: { value: 20, message: "Cannot exceed 20" },
              })}
              error={errors.maxConsultants?.message}
              placeholder="Enter max consultants"
              required
            />
          </div>
        </div>

        {/* Assigned Consultants */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Assigned Consultants
          </h3>
          <Select
            options={consultantOptions}
            value={consultantOptions.filter((option) =>
              selectedConsultants.includes(option.value)
            )}
            onChange={(selectedOptions) => {
              const values = Array.isArray(selectedOptions)
                ? selectedOptions.map((opt) => opt.value)
                : selectedOptions
                ? [selectedOptions.value]
                : [];
              setSelectedConsultants(values);
            }}
            placeholder="Select consultants"
            multiple
            searchable
          />
          <p className="text-sm text-gray-500 mt-2">
            Selected {selectedConsultants.length} of {watch("maxConsultants")}{" "}
            consultants
          </p>
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
            {mode === "create" ? "Create Office" : "Update Office"}
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default OfficeForm;
