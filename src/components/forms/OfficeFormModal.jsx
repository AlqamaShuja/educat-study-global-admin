import React from "react";
import Modal from "../../components/ui/Modal";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import useUserStore from "../../stores/userStore";
import useOfficeStore from "../../stores/officeStore";
import Switch from "../../components/ui/Switch";
import { REGIONS } from "../../utils/helpers";

const OfficeFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  title,
  formData,
  setFormData,
}) => {
  const { users = [], isLoading } = useUserStore();
  const managers = users.filter((user) => user.role === "manager") || [];
  const consultants = users.filter((user) => user.role === "consultant") || [];

  // Define regions based on common business regions
  const regions = REGIONS;

  if (isOpen && (isLoading || !Array.isArray(users))) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title={title} size="xl">
        <div className="p-6 text-center text-gray-600">
          Loading staff data...
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="xl">
      <div className="space-y-6 bg-blue-50 p-6 rounded-lg">
        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-blue-600 border-b border-blue-200 pb-2">
            Basic Information
          </h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Office Name *
            </label>
            <Input
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  name: e.target.value,
                }))
              }
              placeholder="e.g., Downtown Toronto Office"
              required
              className="border-blue-300 focus:ring-blue-500"
            />
          </div>

          {/* Region Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Region *
            </label>
            <select
              value={formData.region || ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  region: e.target.value,
                }))
              }
              className="w-full px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              required
            >
              <option value="">Select Region</option>
              {regions.map((region) => (
                <option key={region.value} value={region.value}>
                  {region.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 text-gray-700">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    isActive: e.target.checked,
                  }))
                }
                className="rounded border-blue-300 text-blue-600"
              />
              Active Office
            </label>
          </div>
          <div className="flex items-center gap-3">
            <Switch
              checked={formData.isBranch}
              onChange={(checked) =>
                setFormData((prev) => ({
                  ...prev,
                  isBranch: checked,
                }))
              }
              label="Branch Office"
              color="primary"
              size="medium"
            />
          </div>
        </div>

        {/* Address Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-blue-600 border-b border-blue-200 pb-2">
            Address Information
          </h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Street Address *
            </label>
            <Input
              value={formData.address.street}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  address: { ...prev.address, street: e.target.value },
                }))
              }
              placeholder="123 Main Street"
              required
              className="border-blue-300 focus:ring-blue-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City *
              </label>
              <Input
                value={formData.address.city}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    address: { ...prev.address, city: e.target.value },
                  }))
                }
                placeholder="Toronto"
                required
                className="border-blue-300 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                State/Province
              </label>
              <Input
                value={formData.address.state}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    address: { ...prev.address, state: e.target.value },
                  }))
                }
                placeholder="Ontario"
                className="border-blue-300 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Country *
              </label>
              <select
                value={formData.address.country}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    address: { ...prev.address, country: e.target.value },
                  }))
                }
                className="w-full px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                required
              >
                <option value="">Select Country</option>
                <option value="Pakistan">Pakistan</option>
                <option value="UAE">United Arab Emirates</option>
                <option value="United Kingdom">United Kingdom</option>
                <option value="Canada">Canada</option>
                <option value="Australia">Australia</option>
                <option value="United States">United States</option>
                <option value="India">India</option>
                <option value="Saudi Arabia">Saudi Arabia</option>
                <option value="Germany">Germany</option>
                <option value="France">France</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Postal Code
              </label>
              <Input
                value={formData.address.postalCode}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    address: { ...prev.address, postalCode: e.target.value },
                  }))
                }
                placeholder="M5V 3C6"
                className="border-blue-300 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-blue-600 border-b border-blue-200 pb-2">
            Contact Information
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone *
              </label>
              <Input
                value={formData.contact.phone}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    contact: { ...prev.contact, phone: e.target.value },
                  }))
                }
                placeholder="+1-416-123-4567"
                required
                className="border-blue-300 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <Input
                type="email"
                value={formData.contact.email}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    contact: { ...prev.contact, email: e.target.value },
                  }))
                }
                placeholder="toronto@example.com"
                required
                className="border-blue-300 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Website
            </label>
            <Input
              value={formData.contact.website}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  contact: { ...prev.contact, website: e.target.value },
                }))
              }
              placeholder="https://www.example.com"
              className="border-blue-300 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Service Capacity */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-blue-600 border-b border-blue-200 pb-2">
            Service Capacity
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Daily Appointments *
              </label>
              <Input
                type="number"
                value={formData.serviceCapacity.maxAppointments}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    serviceCapacity: {
                      ...prev.serviceCapacity,
                      maxAppointments: parseInt(e.target.value) || 0,
                    },
                  }))
                }
                min="1"
                required
                className="border-blue-300 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Consultants *
              </label>
              <Input
                type="number"
                value={formData.serviceCapacity.maxConsultants}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    serviceCapacity: {
                      ...prev.serviceCapacity,
                      maxConsultants: parseInt(e.target.value) || 0,
                    },
                  }))
                }
                min="1"
                required
                className="border-blue-300 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Staff Assignment */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-blue-600 border-b border-blue-200 pb-2">
            Staff Assignment
          </h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Office Manager
            </label>
            <select
              value={formData.managerId}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  managerId: e.target.value,
                }))
              }
              className="w-full px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">Select Manager</option>
              {managers.map((manager) => (
                <option key={manager.id} value={manager.id}>
                  {manager.name} - {manager.email}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Assign Consultants
            </label>
            <div className="border border-blue-300 rounded-md p-3 max-h-40 overflow-y-auto bg-white">
              {consultants.length ? (
                consultants.map((consultant) => (
                  <label
                    key={consultant.id}
                    className="flex items-center gap-2 py-1"
                  >
                    <input
                      type="checkbox"
                      checked={formData.consultants.includes(consultant.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData((prev) => ({
                            ...prev,
                            consultants: [...prev.consultants, consultant.id],
                          }));
                        } else {
                          setFormData((prev) => ({
                            ...prev,
                            consultants: prev.consultants.filter(
                              (id) => id !== consultant.id
                            ),
                          }));
                        }
                      }}
                      className="rounded border-blue-300 text-blue-600"
                    />
                    <span className="text-sm text-gray-700">
                      {consultant.name} - {consultant.email}
                    </span>
                  </label>
                ))
              ) : (
                <p className="text-sm text-gray-500">
                  No consultants available
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Office Hours */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-blue-600 border-b border-blue-200 pb-2">
            Office Hours
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {Object.keys(formData.officeHours).map((day) => (
              <div key={day}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {day}
                </label>
                <Input
                  value={formData.officeHours[day]}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      officeHours: {
                        ...prev.officeHours,
                        [day]: e.target.value,
                      },
                    }))
                  }
                  placeholder="9:00 AM - 5:00 PM"
                  className="border-blue-300 focus:ring-blue-500"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-2 pt-4 border-t border-blue-200">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-blue-300 text-blue-600 hover:bg-blue-50"
          >
            Cancel
          </Button>
          <Button
            onClick={onSubmit}
            disabled={
              !formData.name ||
              !formData.region ||
              !formData.address.street ||
              !formData.address.city ||
              !formData.address.country ||
              !formData.contact.phone ||
              !formData.contact.email
            }
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {title.includes("Create") ? "Create Office" : "Update Office"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default OfficeFormModal;

// import React from "react";
// import Modal from "../../components/ui/Modal";
// import Input from "../../components/ui/Input";
// import Button from "../../components/ui/Button";
// import useUserStore from "../../stores/userStore";
// import useOfficeStore from "../../stores/officeStore";
// import Switch from "../../components/ui/Switch";

// const OfficeFormModal = ({
//   isOpen,
//   onClose,
//   onSubmit,
//   title,
//   formData,
//   setFormData,
// }) => {
//   const { users = [], isLoading } = useUserStore();
//   const managers = users.filter((user) => user.role === "manager") || [];
//   const consultants = users.filter((user) => user.role === "consultant") || [];

//   if (isOpen && (isLoading || !Array.isArray(users))) {
//     return (
//       <Modal isOpen={isOpen} onClose={onClose} title={title} size="xl">
//         <div className="p-6 text-center text-gray-600">
//           Loading staff data...
//         </div>
//       </Modal>
//     );
//   }

//   return (
//     <Modal isOpen={isOpen} onClose={onClose} title={title} size="xl">
//       <div className="space-y-6 bg-blue-50 p-6 rounded-lg">
//         <div className="space-y-4">
//           <h3 className="text-lg font-semibold text-blue-600 border-b border-blue-200 pb-2">
//             Basic Information
//           </h3>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               Office Name *
//             </label>
//             <Input
//               value={formData.name}
//               onChange={(e) =>
//                 setFormData((prev) => ({
//                   ...prev,
//                   name: e.target.value,
//                 }))
//               }
//               placeholder="e.g., Downtown Toronto Office"
//               required
//               className="border-blue-300 focus:ring-blue-500"
//             />
//           </div>
//           <div className="flex items-center gap-2">
//             <label className="flex items-center gap-2 text-gray-700">
//               <input
//                 type="checkbox"
//                 checked={formData.isActive}
//                 onChange={(e) =>
//                   setFormData((prev) => ({
//                     ...prev,
//                     isActive: e.target.checked,
//                   }))
//                 }
//                 className="rounded border-blue-300 text-blue-600"
//               />
//               Active Office
//             </label>
//           </div>
//           <div className="flex items-center gap-3">
//             <Switch
//               checked={formData.isBranch}
//               onChange={(checked) =>
//                 setFormData((prev) => ({
//                   ...prev,
//                   isBranch: checked,
//                 }))
//               }
//               label="Branch Office"
//               color="primary"
//               size="medium"
//             />
//           </div>
//         </div>
//         <div className="space-y-4">
//           <h3 className="text-lg font-semibold text-blue-600 border-b border-blue-200 pb-2">
//             Address Information
//           </h3>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               Street Address *
//             </label>
//             <Input
//               value={formData.address.street}
//               onChange={(e) =>
//                 setFormData((prev) => ({
//                   ...prev,
//                   address: { ...prev.address, street: e.target.value },
//                 }))
//               }
//               placeholder="123 Main Street"
//               required
//               className="border-blue-300 focus:ring-blue-500"
//             />
//           </div>
//           <div className="grid grid-cols-2 gap-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 City *
//               </label>
//               <Input
//                 value={formData.address.city}
//                 onChange={(e) =>
//                   setFormData((prev) => ({
//                     ...prev,
//                     address: { ...prev.address, city: e.target.value },
//                   }))
//                 }
//                 placeholder="Toronto"
//                 required
//                 className="border-blue-300 focus:ring-blue-500"
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 State/Province
//               </label>
//               <Input
//                 value={formData.address.state}
//                 onChange={(e) =>
//                   setFormData((prev) => ({
//                     ...prev,
//                     address: { ...prev.address, state: e.target.value },
//                   }))
//                 }
//                 placeholder="Ontario"
//                 className="border-blue-300 focus:ring-blue-500"
//               />
//             </div>
//           </div>
//           <div className="grid grid-cols-2 gap-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Country *
//               </label>
//               <select
//                 value={formData.address.country}
//                 onChange={(e) =>
//                   setFormData((prev) => ({
//                     ...prev,
//                     address: { ...prev.address, country: e.target.value },
//                   }))
//                 }
//                 className="w-full px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
//                 required
//               >
//                 <option value="">Select Country</option>
//                 <option value="Pakistan">Pakistan</option>
//                 <option value="UAE">United Arab Emirates</option>
//                 <option value="United Kingdom">United Kingdom</option>
//                 <option value="Canada">Canada</option>
//                 <option value="Australia">Australia</option>
//               </select>
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Postal Code
//               </label>
//               <Input
//                 value={formData.address.postalCode}
//                 onChange={(e) =>
//                   setFormData((prev) => ({
//                     ...prev,
//                     address: { ...prev.address, postalCode: e.target.value },
//                   }))
//                 }
//                 placeholder="M5V 3C6"
//                 className="border-blue-300 focus:ring-blue-500"
//               />
//             </div>
//           </div>
//         </div>
//         <div className="space-y-4">
//           <h3 className="text-lg font-semibold text-blue-600 border-b border-blue-200 pb-2">
//             Contact Information
//           </h3>
//           <div className="grid grid-cols-2 gap-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Phone *
//               </label>
//               <Input
//                 value={formData.contact.phone}
//                 onChange={(e) =>
//                   setFormData((prev) => ({
//                     ...prev,
//                     contact: { ...prev.contact, phone: e.target.value },
//                   }))
//                 }
//                 placeholder="+1-416-123-4567"
//                 required
//                 className="border-blue-300 focus:ring-blue-500"
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Email *
//               </label>
//               <Input
//                 type="email"
//                 value={formData.contact.email}
//                 onChange={(e) =>
//                   setFormData((prev) => ({
//                     ...prev,
//                     contact: { ...prev.contact, email: e.target.value },
//                   }))
//                 }
//                 placeholder="toronto@example.com"
//                 required
//                 className="border-blue-300 focus:ring-blue-500"
//               />
//             </div>
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               Website
//             </label>
//             <Input
//               value={formData.contact.website}
//               onChange={(e) =>
//                 setFormData((prev) => ({
//                   ...prev,
//                   contact: { ...prev.contact, website: e.target.value },
//                 }))
//               }
//               placeholder="https://www.example.com"
//               className="border-blue-300 focus:ring-blue-500"
//             />
//           </div>
//         </div>
//         <div className="space-y-4">
//           <h3 className="text-lg font-semibold text-blue-600 border-b border-blue-200 pb-2">
//             Service Capacity
//           </h3>
//           <div className="grid grid-cols-2 gap-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Max Daily Appointments *
//               </label>
//               <Input
//                 type="number"
//                 value={formData.serviceCapacity.maxAppointments}
//                 onChange={(e) =>
//                   setFormData((prev) => ({
//                     ...prev,
//                     serviceCapacity: {
//                       ...prev.serviceCapacity,
//                       maxAppointments: parseInt(e.target.value) || 0,
//                     },
//                   }))
//                 }
//                 min="1"
//                 required
//                 className="border-blue-300 focus:ring-blue-500"
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Max Consultants *
//               </label>
//               <Input
//                 type="number"
//                 value={formData.serviceCapacity.maxConsultants}
//                 onChange={(e) =>
//                   setFormData((prev) => ({
//                     ...prev,
//                     serviceCapacity: {
//                       ...prev.serviceCapacity,
//                       maxConsultants: parseInt(e.target.value) || 0,
//                     },
//                   }))
//                 }
//                 min="1"
//                 required
//                 className="border-blue-300 focus:ring-blue-500"
//               />
//             </div>
//           </div>
//         </div>
//         <div className="space-y-4">
//           <h3 className="text-lg font-semibold text-blue-600 border-b border-blue-200 pb-2">
//             Staff Assignment
//           </h3>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               Office Manager
//             </label>
//             <select
//               value={formData.managerId}
//               onChange={(e) =>
//                 setFormData((prev) => ({
//                   ...prev,
//                   managerId: e.target.value,
//                 }))
//               }
//               className="w-full px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
//             >
//               <option value="">Select Manager</option>
//               {managers.map((manager) => (
//                 <option key={manager.id} value={manager.id}>
//                   {manager.name} - {manager.email}
//                 </option>
//               ))}
//             </select>
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               Assign Consultants
//             </label>
//             <div className="border border-blue-300 rounded-md p-3 max-h-40 overflow-y-auto bg-white">
//               {consultants.length ? (
//                 consultants.map((consultant) => (
//                   <label
//                     key={consultant.id}
//                     className="flex items-center gap-2 py-1"
//                   >
//                     <input
//                       type="checkbox"
//                       checked={formData.consultants.includes(consultant.id)}
//                       onChange={(e) => {
//                         if (e.target.checked) {
//                           setFormData((prev) => ({
//                             ...prev,
//                             consultants: [...prev.consultants, consultant.id],
//                           }));
//                         } else {
//                           setFormData((prev) => ({
//                             ...prev,
//                             consultants: prev.consultants.filter(
//                               (id) => id !== consultant.id
//                             ),
//                           }));
//                         }
//                       }}
//                       className="rounded border-blue-300 text-blue-600"
//                     />
//                     <span className="text-sm text-gray-700">
//                       {consultant.name} - {consultant.email}
//                     </span>
//                   </label>
//                 ))
//               ) : (
//                 <p className="text-sm text-gray-500">
//                   No consultants available
//                 </p>
//               )}
//             </div>
//           </div>
//         </div>
//         <div className="space-y-4">
//           <h3 className="text-lg font-semibold text-blue-600 border-b border-blue-200 pb-2">
//             Office Hours
//           </h3>
//           <div className="grid grid-cols-2 gap-4">
//             {Object.keys(formData.officeHours).map((day) => (
//               <div key={day}>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   {day}
//                 </label>
//                 <Input
//                   value={formData.officeHours[day]}
//                   onChange={(e) =>
//                     setFormData((prev) => ({
//                       ...prev,
//                       officeHours: {
//                         ...prev.officeHours,
//                         [day]: e.target.value,
//                       },
//                     }))
//                   }
//                   placeholder="9:00 AM - 5:00 PM"
//                   className="border-blue-300 focus:ring-blue-500"
//                 />
//               </div>
//             ))}
//           </div>
//         </div>
//         <div className="flex justify-end gap-2 pt-4 border-t border-blue-200">
//           <Button
//             variant="outline"
//             onClick={onClose}
//             className="border-blue-300 text-blue-600 hover:bg-blue-50"
//           >
//             Cancel
//           </Button>
//           <Button
//             onClick={onSubmit}
//             disabled={
//               !formData.name ||
//               !formData.address.street ||
//               !formData.address.city ||
//               !formData.address.country ||
//               !formData.contact.phone ||
//               !formData.contact.email
//             }
//             className="bg-blue-600 hover:bg-blue-700 text-white"
//           >
//             {title.includes("Create") ? "Create Office" : "Update Office"}
//           </Button>
//         </div>
//       </div>
//     </Modal>
//   );
// };

// export default OfficeFormModal;
