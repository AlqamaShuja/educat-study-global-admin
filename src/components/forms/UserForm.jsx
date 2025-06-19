import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import Input from "../ui/Input";
import Select from "../ui/Select";
import Button from "../ui/Button";
import Card from "../ui/Card";
import { useOfficeStore } from "../../stores/officeStore";

const UserForm = ({
  user = null,
  onSubmit,
  onCancel,
  loading = false,
  mode = "create", // 'create' or 'edit'
}) => {
  const { offices, fetchOffices } = useOfficeStore();
  const [selectedRole, setSelectedRole] = useState(user?.role || "");

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm({
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      role: user?.role || "",
      officeId: user?.officeId || "",
      password: "",
      confirmPassword: "",
    },
  });

  const watchedRole = watch("role");

  useEffect(() => {
    fetchOffices();
  }, [fetchOffices]);

  useEffect(() => {
    setSelectedRole(watchedRole);
  }, [watchedRole]);

  useEffect(() => {
    if (user && mode === "edit") {
      reset({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        role: user.role || "",
        officeId: user.officeId || "",
        password: "",
        confirmPassword: "",
      });
    }
  }, [user, mode, reset]);

  const roleOptions = [
    { value: "super_admin", label: "Super Admin" },
    { value: "manager", label: "Manager" },
    { value: "consultant", label: "Consultant" },
    { value: "receptionist", label: "Receptionist" },
    { value: "student", label: "Student" },
  ];

  const officeOptions = offices.map((office) => ({
    value: office.id,
    label: office.name,
  }));

  const needsOffice = ["manager", "consultant", "receptionist"].includes(
    selectedRole
  );

  const onFormSubmit = (data) => {
    const formData = { ...data };

    // Remove password fields if they're empty in edit mode
    if (mode === "edit" && !formData.password) {
      delete formData.password;
      delete formData.confirmPassword;
    }

    // Remove officeId if role doesn't need it
    if (!needsOffice) {
      delete formData.officeId;
    }

    onSubmit(formData);
  };

  return (
    <Card title={`${mode === "create" ? "Create" : "Edit"} User`}>
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Name */}
          <Input
            label="Full Name"
            {...register("name", {
              required: "Name is required",
              minLength: {
                value: 2,
                message: "Name must be at least 2 characters",
              },
            })}
            error={errors.name?.message}
            placeholder="Enter full name"
            required
          />

          {/* Email */}
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

          {/* Phone */}
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

          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role <span className="text-red-500">*</span>
            </label>
            <Select
              options={roleOptions}
              value={roleOptions.find(
                (option) => option.value === selectedRole
              )}
              onChange={(option) => {
                setValue("role", option.value);
                setSelectedRole(option.value);
                if (!needsOffice) {
                  setValue("officeId", "");
                }
              }}
              placeholder="Select role"
              error={errors.role?.message}
            />
            {errors.role && (
              <p className="text-sm text-red-600 mt-1">{errors.role.message}</p>
            )}
            <input
              type="hidden"
              {...register("role", { required: "Role is required" })}
            />
          </div>

          {/* Office (conditional) */}
          {needsOffice && (
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Office <span className="text-red-500">*</span>
              </label>
              <Select
                options={officeOptions}
                value={officeOptions.find(
                  (option) => option.value === watch("officeId")
                )}
                onChange={(option) => setValue("officeId", option.value)}
                placeholder="Select office"
                error={errors.officeId?.message}
              />
              {errors.officeId && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.officeId.message}
                </p>
              )}
              <input
                type="hidden"
                {...register("officeId", {
                  required: needsOffice
                    ? "Office is required for this role"
                    : false,
                })}
              />
            </div>
          )}
        </div>

        {/* Password Section */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {mode === "create" ? "Password" : "Change Password (Optional)"}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Password"
              type="password"
              {...register("password", {
                required: mode === "create" ? "Password is required" : false,
                minLength: {
                  value: 6,
                  message: "Password must be at least 6 characters",
                },
              })}
              error={errors.password?.message}
              placeholder="Enter password"
              required={mode === "create"}
            />

            <Input
              label="Confirm Password"
              type="password"
              {...register("confirmPassword", {
                required: mode === "create" ? "Please confirm password" : false,
                validate: (value) => {
                  const password = watch("password");
                  if (password && value !== password) {
                    return "Passwords do not match";
                  }
                  if (mode === "create" && !value) {
                    return "Please confirm password";
                  }
                },
              })}
              error={errors.confirmPassword?.message}
              placeholder="Confirm password"
              required={mode === "create"}
            />
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
            {mode === "create" ? "Create User" : "Update User"}
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default UserForm;
