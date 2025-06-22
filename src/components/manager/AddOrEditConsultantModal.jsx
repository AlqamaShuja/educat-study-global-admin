import React, { useState, useEffect } from "react";
import Button from "../../components/ui/Button";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { X } from "lucide-react";
import { toast } from "react-toastify";

const AddOrEditConsultantModal = ({
  isOpen,
  onClose,
  consultant,
  onSubmit,
  role = "consultant",
}) => {
  const [formData, setFormData] = useState({
    role,
    name: "",
    email: "",
    phone: "",
    password: "",
    id: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Populate form with consultant data when editing
  useEffect(() => {
    if (consultant) {
      setFormData({
        role,
        name: consultant.name || "",
        email: consultant.email || "",
        phone: consultant.phone || "",
        password: "", // Password not pre-filled for security
        id: consultant.id || "",
      });
    } else {
      setFormData({
        role,
        name: "",
        email: "",
        phone: "",
        password: "",
        id: "",
      });
    }
  }, [consultant, role]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Invalid email format";

    if (!formData.phone.trim()) newErrors.phone = "Phone is required";

    // Password only required when creating a new user
    const isCreating = !formData.id;
    if (isCreating && !formData.password.trim()) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      toast.success(
        consultant
          ? `${
              role.charAt(0).toUpperCase() + role.slice(1)
            } updated successfully`
          : `${
              role.charAt(0).toUpperCase() + role.slice(1)
            } created successfully`,
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
      toast.error(err.response?.data?.message || `Failed to save ${role}`, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">
            {consultant
              ? `Edit ${role.charAt(0).toUpperCase() + role.slice(1)}`
              : `Add ${role.charAt(0).toUpperCase() + role.slice(1)}`}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                errors.name ? "border-red-500" : ""
              }`}
              placeholder="Enter name"
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
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
              Phone
            </label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
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
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                errors.password ? "border-red-500" : ""
              }`}
              placeholder={
                consultant ? "Leave blank to keep unchanged" : "Enter password"
              }
            />
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">{errors.password}</p>
            )}
          </div>
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
              className="bg-indigo-600 hover:bg-indigo-700 text-white transition-colors duration-200"
            >
              {isSubmitting ? (
                <span className="flex items-center">
                  <LoadingSpinner size="sm" className="mr-2 text-white" />
                  {consultant ? "Updating..." : "Creating..."}
                </span>
              ) : consultant ? (
                "Update"
              ) : (
                "Create"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddOrEditConsultantModal;

// import React, { useState, useEffect } from "react";
// import Button from "../../components/ui/Button";
// import LoadingSpinner from "../../components/ui/LoadingSpinner";
// import { X } from "lucide-react";
// import { toast } from "react-toastify";

// const AddOrEditConsultantModal = ({
//   isOpen,
//   onClose,
//   consultant,
//   onSubmit,
// }) => {
//   const [formData, setFormData] = useState({
//     role: "consultant",
//     name: "",
//     email: "",
//     phone: "",
//     password: "",
//     id: "",
//   });
//   const [errors, setErrors] = useState({});
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   // Populate form with consultant data when editing
//   useEffect(() => {
//     if (consultant) {
//       setFormData({
//         role: "consultant",
//         name: consultant.name || "",
//         email: consultant.email || "",
//         phone: consultant.phone || "",
//         password: "", // Password not pre-filled for security
//         id: consultant.id || "",
//       });
//     } else {
//       setFormData({
//         role: "consultant",
//         name: "",
//         email: "",
//         phone: "",
//         password: "",
//         id: "",
//       });
//     }
//   }, [consultant]);

//   const validateForm = () => {
//     const newErrors = {};

//     if (!formData.name.trim()) newErrors.name = "Name is required";
//     if (!formData.email.trim()) newErrors.email = "Email is required";
//     else if (!/\S+@\S+\.\S+/.test(formData.email))
//       newErrors.email = "Invalid email format";

//     if (!formData.phone.trim()) newErrors.phone = "Phone is required";

//     // Password only required when creating a new consultant
//     const isCreating = !formData.id;
//     if (isCreating && !formData.password.trim()) {
//       newErrors.password = "Password is required";
//     }

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//     setErrors((prev) => ({ ...prev, [name]: "" }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!validateForm()) return;

//     setIsSubmitting(true);
//     try {
//       await onSubmit(formData);
//       toast.success(
//         consultant
//           ? "Consultant updated successfully"
//           : "Consultant created successfully"
//       );
//       onClose();
//     } catch (err) {
//       toast.error(err.response?.data?.message || "Failed to save consultant");
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//       <div className="bg-white rounded-lg p-6 w-full max-w-md">
//         <div className="flex justify-between items-center mb-4">
//           <h2 className="text-xl font-bold text-gray-900">
//             {consultant ? "Edit Consultant" : "Add Consultant"}
//           </h2>
//           <button
//             onClick={onClose}
//             className="text-gray-500 hover:text-gray-700"
//           >
//             <X className="h-5 w-5" />
//           </button>
//         </div>
//         <form onSubmit={handleSubmit} className="space-y-4">
//           <div>
//             <label className="block text-sm font-medium text-gray-700">
//               Name
//             </label>
//             <input
//               type="text"
//               name="name"
//               value={formData.name}
//               onChange={handleChange}
//               className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
//               placeholder="Enter name"
//             />
//             {errors.name && (
//               <p className="text-red-500 text-xs mt-1">{errors.name}</p>
//             )}
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700">
//               Email
//             </label>
//             <input
//               type="email"
//               name="email"
//               value={formData.email}
//               onChange={handleChange}
//               className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
//               placeholder="Enter email"
//             />
//             {errors.email && (
//               <p className="text-red-500 text-xs mt-1">{errors.email}</p>
//             )}
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700">
//               Phone
//             </label>
//             <input
//               type="text"
//               name="phone"
//               value={formData.phone}
//               onChange={handleChange}
//               className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
//               placeholder="Enter phone"
//             />
//             {errors.phone && (
//               <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
//             )}
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700">
//               Password
//             </label>
//             <input
//               type="password"
//               name="password"
//               value={formData.password}
//               onChange={handleChange}
//               className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
//               placeholder={
//                 consultant ? "Leave blank to keep unchanged" : "Enter password"
//               }
//             />
//             {errors.password && (
//               <p className="text-red-500 text-xs mt-1">{errors.password}</p>
//             )}
//           </div>
//           <div className="flex justify-end space-x-2">
//             <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
//               Cancel
//             </Button>
//             <Button type="submit" variant="primary" disabled={isSubmitting}>
//               {isSubmitting ? (
//                 <span className="flex items-center">
//                   <LoadingSpinner size="sm" className="mr-2" />
//                   {consultant ? "Updating..." : "Creating..."}
//                 </span>
//               ) : consultant ? (
//                 "Update"
//               ) : (
//                 "Create"
//               )}
//             </Button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default AddOrEditConsultantModal;
