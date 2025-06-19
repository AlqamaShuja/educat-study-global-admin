import React from "react";
import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";

const StaffFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  title,
  formData,
  setFormData,
  formErrors,
  offices,
}) => (
  <Modal isOpen={isOpen} onClose={onClose} title={title} size="lg">
    <div className="space-y-6">
      {formErrors.general && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {formErrors.general}
        </div>
      )}

      {/* Basic Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium border-b pb-2">Basic Information</h3>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Full Name *
            </label>
            <Input
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  name: e.target.value,
                }))
              }
              placeholder="John Doe"
              className={formErrors.name ? "border-red-500" : ""}
              required
            />
            {formErrors.name && (
              <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Email *</label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  email: e.target.value,
                }))
              }
              placeholder="john@example.com"
              className={formErrors.email ? "border-red-500" : ""}
              required
            />
            {formErrors.email && (
              <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Phone</label>
            <Input
              value={formData.phone}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  phone: e.target.value,
                }))
              }
              placeholder="+1-234-567-8900"
              className={formErrors.phone ? "border-red-500" : ""}
            />
            {formErrors.phone && (
              <p className="text-red-500 text-sm mt-1">{formErrors.phone}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              {title.includes("Create")
                ? "Password *"
                : "New Password (Optional)"}
            </label>
            <Input
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  password: e.target.value,
                }))
              }
              placeholder={
                title.includes("Create")
                  ? "Enter password"
                  : "Leave blank to keep current"
              }
              className={formErrors.password ? "border-red-500" : ""}
              required={title.includes("Create")}
            />
            {formErrors.password && (
              <p className="text-red-500 text-sm mt-1">{formErrors.password}</p>
            )}
          </div>
        </div>
      </div>

      {/* Role & Office Assignment */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium border-b pb-2">Role & Assignment</h3>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Role *</label>
            <select
              value={formData.role}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  role: e.target.value,
                  officeId:
                    e.target.value === "super_admin" ? "" : prev.officeId,
                }))
              }
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                formErrors.role ? "border-red-500" : "border-gray-300"
              }`}
              required
            >
              <option value="">Select Role</option>
              <option value="super_admin">Super Admin</option>
              <option value="manager">Manager</option>
              <option value="consultant">Consultant</option>
              <option value="receptionist">Receptionist</option>
            </select>
            {formErrors.role && (
              <p className="text-red-500 text-sm mt-1">{formErrors.role}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              Office Assignment
            </label>
            <select
              value={formData.officeId}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  officeId: e.target.value,
                }))
              }
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                formErrors.officeId ? "border-red-500" : "border-gray-300"
              }`}
              disabled={formData.role === "super_admin"}
            >
              <option value="">No Office Assignment</option>
              {offices?.map((office) => (
                <option key={office.id} value={office.id}>
                  {office.name} - {office.address?.city}
                </option>
              ))}
            </select>
            {formErrors.officeId && (
              <p className="text-red-500 text-sm mt-1">{formErrors.officeId}</p>
            )}
            {formData.role === "super_admin" && (
              <p className="text-sm text-gray-500 mt-1">
                Super admins are not assigned to specific offices
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  isActive: e.target.checked,
                }))
              }
              className="rounded"
            />
            Active Staff Member
          </label>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button
          onClick={onSubmit}
          disabled={
            !formData.name ||
            !formData.email ||
            !formData.role ||
            (title.includes("Create") && !formData.password)
          }
        >
          {title.includes("Create") ? "Create Staff" : "Update Staff"}
        </Button>
      </div>
    </div>
  </Modal>
);

export default StaffFormModal;
