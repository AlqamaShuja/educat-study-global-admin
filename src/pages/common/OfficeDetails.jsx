import React, { useEffect, useState } from "react";
import {
  MapPin,
  Phone,
  Mail,
  Globe,
  Clock,
  Users,
  Calendar,
  User,
  Building2,
  CheckCircle,
  XCircle,
  Badge,
  Eye,
  UserCheck,
  ArrowLeftCircle,
  X,
} from "lucide-react";

import LeadDetailsView from "../../components/manager/LeadDetailsView";
import officeService from "../../services/officeService";
import { useNavigate, useParams } from "react-router-dom";
import LoadingSpinner from "../../components/ui/LoadingSpinner";

const OfficeDetails = () => {
  const [selectedLead, setSelectedLead] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [officeData, setOfficeData] = useState(null);
  const { officeId } = useParams();
  const navigate = useNavigate();

  const getOfficeDetailsById = async (officeId) => {
    setIsLoading(true);
    const office = await officeService.getOfficeDetailsById(officeId);
    setOfficeData(office);
    setIsLoading(false);
  };

  useEffect(() => {
    getOfficeDetailsById(officeId);
  }, [officeId]);

  const openLeadModal = (lead) => {
    setSelectedLead(lead);
    setIsModalOpen(true);
  };

  const closeLeadModal = () => {
    setSelectedLead(null);
    setIsModalOpen(false);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-background">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-foreground">Loading Office...</p>
        </div>
      </div>
    );
  }

  if (!officeData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 mb-4">
            <Building2 size={64} className="mx-auto" />
          </div>
          <h2 className="text-xl font-semibold text-gray-700">
            No Office Data Available
          </h2>
          <p className="text-gray-500 mt-2">
            Please select an office to view details.
          </p>
        </div>
      </div>
    );
  }

  const formatTime = (timeStr) => {
    if (!timeStr || timeStr === "Closed") return timeStr;
    return timeStr;
  };

  const getStatusBadge = (isActive) => {
    return isActive ? (
      <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
        <CheckCircle size={14} />
        Active
      </span>
    ) : (
      <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-800 text-sm font-medium rounded-full">
        <XCircle size={14} />
        Inactive
      </span>
    );
  };

  const getBranchBadge = (isBranch) => {
    return isBranch ? (
      <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
        <Badge size={14} />
        Branch Office
      </span>
    ) : (
      <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-800 text-sm font-medium rounded-full">
        <Building2 size={14} />
        Main Office
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex gap-3 items-center">
              <ArrowLeftCircle
                className="cursor-pointer w-8 h-8 text-gray-500 hover:text-gray-700"
                onClick={() => navigate(-1)}
              />
              <div className="w-[2px] h-[60px] bg-gray-400" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {officeData?.name}
                </h1>
                <div className="flex flex-wrap gap-3">
                  {getStatusBadge(officeData?.isActive)}
                  {getBranchBadge(officeData?.isBranch)}
                </div>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              <p>
                Created: {new Date(officeData?.createdAt).toLocaleDateString()}
              </p>
              <p>
                Updated: {new Date(officeData?.updatedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        <div className="">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Address & Contact Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin className="text-blue-600" size={20} />
                Location & Contact
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Address */}
                <div>
                  <h3 className="font-medium text-gray-700 mb-3">Address</h3>
                  <div className="space-y-2 text-gray-600">
                    <p>{officeData?.address?.street}</p>
                    <p>
                      {officeData?.address?.city}, {officeData?.address?.state}
                    </p>
                    <p>{officeData?.address?.country}</p>
                    {officeData?.address?.postalCode && (
                      <p className="font-mono text-sm bg-gray-100 px-2 py-1 rounded inline-block">
                        {officeData?.address?.postalCode}
                      </p>
                    )}
                  </div>
                </div>

                {/* Contact */}
                <div>
                  <h3 className="font-medium text-gray-700 mb-3">
                    Contact Information
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-gray-600">
                      <Mail className="text-blue-600" size={16} />
                      <a
                        href={`mailto:${officeData?.contact?.email}`}
                        className="hover:text-blue-600 transition-colors"
                      >
                        {officeData?.contact?.email}
                      </a>
                    </div>
                    <div className="flex items-center gap-3 text-gray-600">
                      <Phone className="text-blue-600" size={16} />
                      <a
                        href={`tel:${officeData?.contact?.phone}`}
                        className="hover:text-blue-600 transition-colors"
                      >
                        {officeData?.contact?.phone}
                      </a>
                    </div>
                    {officeData?.contact?.website && (
                      <div className="flex items-center gap-3 text-gray-600">
                        <Globe className="text-blue-600" size={16} />
                        <a
                          href={officeData?.contact?.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-blue-600 transition-colors"
                        >
                          {officeData?.contact?.website}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Manager Information and Service Capacity (Side by Side) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Manager Information */}
              <div className="bg-white border border-green-50 rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <User className="text-blue-600" size={20} />
                  Manager Information
                </h2>

                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="text-blue-600" size={20} />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {officeData?.manager?.name}
                      </h3>
                      <p className="text-sm text-gray-500 capitalize">
                        {officeData?.manager?.role}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <p className="flex items-center gap-2 text-gray-600">
                      <Mail size={14} />
                      {officeData?.manager?.email}
                    </p>
                    {officeData?.manager?.phone && (
                      <p className="flex items-center gap-2 text-gray-600">
                        <Phone size={14} />
                        {officeData?.manager?.phone}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Service Capacity */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Calendar className="text-blue-600" size={20} />
                  Service Capacity
                </h2>

                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600 mb-1">
                        {officeData?.serviceCapacity?.maxConsultants}
                      </div>
                      <div className="text-sm text-blue-700">
                        Max Consultants
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600 mb-1">
                        {officeData?.serviceCapacity?.maxAppointments}
                      </div>
                      <div className="text-sm text-green-700">
                        Max Appointments
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Office Hours */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Clock className="text-blue-600" size={20} />
                Office Hours
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
                {Object.entries(officeData?.officeHours).map(([day, hours]) => (
                  <div
                    key={day}
                    className="flex justify-between items-center p-3 bg-gray-50 rounded-lg min-w-[200px]"
                  >
                    <span className="font-medium text-gray-700">{day}</span>
                    <span
                      className={`text-sm ${
                        hours === "Closed" ? "text-red-600" : "text-blue-600"
                      }`}
                    >
                      {formatTime(hours)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-700">
                  <strong>Working Days:</strong>{" "}
                  {officeData?.workingDays?.join(", ")}
                </p>
              </div>
            </div>

            {/* Receptionists */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <UserCheck className="text-blue-600" size={20} />
                Receptionists ({officeData?.Users?.length || 0})
              </h2>

              {officeData?.Users?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {officeData?.Users?.map((receptionist) => (
                    <div
                      key={receptionist?.id}
                      className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="text-blue-600" size={16} />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {receptionist?.name}
                          </h3>
                          <p className="text-sm text-gray-500 capitalize">
                            {receptionist?.role}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p className="flex items-center gap-2">
                          <Mail size={14} />
                          {receptionist?.email}
                        </p>
                        {receptionist?.phone && (
                          <p className="flex items-center gap-2">
                            <Phone size={14} />
                            {receptionist?.phone}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <UserCheck size={48} className="mx-auto mb-4 text-gray-300" />
                  <p>No receptionists assigned to this office</p>
                </div>
              )}
            </div>

            {/* Consultants */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Users className="text-blue-600" size={20} />
                Consultants ({officeData?.consultants?.length})
              </h2>

              {officeData?.consultants?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {officeData?.consultants?.map((consultant) => (
                    <div
                      key={consultant?.id}
                      className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="text-blue-600" size={16} />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {consultant?.name}
                          </h3>
                          <p className="text-sm text-gray-500 capitalize">
                            {consultant?.role}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p className="flex items-center gap-2">
                          <Mail size={14} />
                          {consultant?.email}
                        </p>
                        {consultant?.phone && (
                          <p className="flex items-center gap-2">
                            <Phone size={14} />
                            {consultant?.phone}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Users size={48} className="mx-auto mb-4 text-gray-300" />
                  <p>No consultants assigned to this office</p>
                </div>
              )}
            </div>

            {/* Leads */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Users className="text-blue-600" size={20} />
                Leads ({officeData?.Leads?.length || 0})
              </h2>

              {officeData?.Leads?.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Student Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Source
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {officeData?.Leads?.map((lead) => (
                        <tr key={lead.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {lead.student?.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {lead.student?.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span
                              className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                lead.status === "new"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {lead.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {lead.source}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <button
                              onClick={() => openLeadModal(lead)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <Eye size={18} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Users size={48} className="mx-auto mb-4 text-gray-300" />
                  <p>No leads assigned to this office</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column (Empty to maintain layout) */}
          <div className="space-y-6"></div>
        </div>

        {/* Lead Details Modal */}
        {isModalOpen && selectedLead && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-4xl relative">
              <button
                onClick={closeLeadModal}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors duration-200"
              >
                <X className="h-6 w-6" />
              </button>
              <LeadDetailsView lead={selectedLead} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OfficeDetails;

// import React, { useEffect } from "react";
// import {
//   MapPin,
//   Phone,
//   Mail,
//   Globe,
//   Clock,
//   Users,
//   Calendar,
//   User,
//   Building2,
//   CheckCircle,
//   XCircle,
//   Badge,
//   ArrowLeft,
//   ArrowLeftCircle,
// } from "lucide-react";
// import { useLocation, useNavigate, useParams } from "react-router-dom";
// import officeService from "../../services/officeService";

// const OfficeDetails = () => {
//   const location = useLocation();
//   const navigate = useNavigate();
//   const { officeId } = useParams();
//   const officeData = location.state;

//   const fetchOfficeData = async (id) => {
//       const res = await officeService.getOfficeDetailsById(id);
//       console.log(res, 'acsnajcasncsjascnsa');
//   }

//     useEffect(() => {
//         fetchOfficeData(officeId);
//     }, [officeId]);

//   if (!officeData) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <div className="text-center">
//           <div className="text-gray-400 mb-4">
//             <Building2 size={64} className="mx-auto" />
//           </div>
//           <h2 className="text-xl font-semibold text-gray-700">
//             No Office Data Available
//           </h2>
//           <p className="text-gray-500 mt-2">
//             Please select an office to view details.
//           </p>
//         </div>
//       </div>
//     );
//   }

//   const formatTime = (timeStr) => {
//     if (!timeStr || timeStr === "Closed") return timeStr;
//     return timeStr;
//   };

//   const getStatusBadge = (isActive) => {
//     return isActive ? (
//       <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
//         <CheckCircle size={14} />
//         Active
//       </span>
//     ) : (
//       <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-800 text-sm font-medium rounded-full">
//         <XCircle size={14} />
//         Inactive
//       </span>
//     );
//   };

//   const getBranchBadge = (isBranch) => {
//     return isBranch ? (
//       <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
//         <Badge size={14} />
//         Branch Office
//       </span>
//     ) : (
//       <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-800 text-sm font-medium rounded-full">
//         <Building2 size={14} />
//         Main Office
//       </span>
//     );
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 py-8 px-4">
//       <div className="max-w-6xl mx-auto">
//         {/* Header Section */}
//         <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
//           <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
//             <div>
//                 <div>
//                     <ArrowLeftCircle onClick={() => navigate(-1)} className="w-6 h-6 cursor-pointer text-gray-500 hover:text-gray-800 mb-2 flex " />
//                 </div>
//               <h1 className="text-3xl font-bold text-gray-900 mb-2">
//                 {officeData.name}
//               </h1>
//               <div className="flex flex-wrap gap-3">
//                 {getStatusBadge(officeData.isActive)}
//                 {getBranchBadge(officeData.isBranch)}
//               </div>
//             </div>
//             <div className="text-sm text-gray-500">
//               <p>
//                 Created: {new Date(officeData.createdAt).toLocaleDateString()}
//               </p>
//               <p>
//                 Updated: {new Date(officeData.updatedAt).toLocaleDateString()}
//               </p>
//             </div>
//           </div>
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//           {/* Left Column */}
//           <div className="lg:col-span-2 space-y-6">
//             {/* Address & Contact Information */}
//             <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
//               <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
//                 <MapPin className="text-blue-600" size={20} />
//                 Location & Contact
//               </h2>

//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 {/* Address */}
//                 <div>
//                   <h3 className="font-medium text-gray-700 mb-3">Address</h3>
//                   <div className="space-y-2 text-gray-600">
//                     <p>{officeData.address.street}</p>
//                     <p>
//                       {officeData.address.city}, {officeData.address.state}
//                     </p>
//                     <p>{officeData.address.country}</p>
//                     {officeData.address.postalCode && (
//                       <p className="font-mono text-sm bg-gray-100 px-2 py-1 rounded inline-block">
//                         {officeData.address.postalCode}
//                       </p>
//                     )}
//                   </div>
//                 </div>

//                 {/* Contact */}
//                 <div>
//                   <h3 className="font-medium text-gray-700 mb-3">
//                     Contact Information
//                   </h3>
//                   <div className="space-y-3">
//                     <div className="flex items-center gap-3 text-gray-600">
//                       <Mail className="text-blue-600" size={16} />
//                       <a
//                         href={`mailto:${officeData.contact.email}`}
//                         className="hover:text-blue-600 transition-colors"
//                       >
//                         {officeData.contact.email}
//                       </a>
//                     </div>
//                     <div className="flex items-center gap-3 text-gray-600">
//                       <Phone className="text-blue-600" size={16} />
//                       <a
//                         href={`tel:${officeData.contact.phone}`}
//                         className="hover:text-blue-600 transition-colors"
//                       >
//                         {officeData.contact.phone}
//                       </a>
//                     </div>
//                     {officeData.contact.website && (
//                       <div className="flex items-center gap-3 text-gray-600">
//                         <Globe className="text-blue-600" size={16} />
//                         <a
//                           href={officeData.contact.website}
//                           target="_blank"
//                           rel="noopener noreferrer"
//                           className="hover:text-blue-600 transition-colors"
//                         >
//                           {officeData.contact.website}
//                         </a>
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Office Hours */}
//             <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
//               <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
//                 <Clock className="text-blue-600" size={20} />
//                 Office Hours
//               </h2>

//               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
//                 {Object.entries(officeData.officeHours).map(([day, hours]) => (
//                   <div
//                     key={day}
//                     className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
//                   >
//                     <span className="font-medium text-gray-700">{day}</span>
//                     <span
//                       className={`text-sm ${
//                         hours === "Closed" ? "text-red-600" : "text-blue-600"
//                       }`}
//                     >
//                       {formatTime(hours)}
//                     </span>
//                   </div>
//                 ))}
//               </div>

//               <div className="mt-4 p-3 bg-blue-50 rounded-lg">
//                 <p className="text-sm text-blue-700">
//                   <strong>Working Days:</strong>{" "}
//                   {officeData.workingDays.join(", ")}
//                 </p>
//               </div>
//             </div>

//             {/* Consultants */}
//             <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
//               <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
//                 <Users className="text-blue-600" size={20} />
//                 Consultants ({officeData.consultants.length})
//               </h2>

//               {officeData.consultants.length > 0 ? (
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   {officeData.consultants.map((consultant) => (
//                     <div
//                       key={consultant.id}
//                       className="p-4 bg-gray-50 rounded-lg border border-gray-200"
//                     >
//                       <div className="flex items-center gap-3 mb-2">
//                         <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
//                           <User className="text-blue-600" size={16} />
//                         </div>
//                         <div>
//                           <h3 className="font-medium text-gray-900">
//                             {consultant.name}
//                           </h3>
//                           <p className="text-sm text-gray-500 capitalize">
//                             {consultant.role}
//                           </p>
//                         </div>
//                       </div>
//                       <div className="space-y-1 text-sm text-gray-600">
//                         <p className="flex items-center gap-2">
//                           <Mail size={14} />
//                           {consultant.email}
//                         </p>
//                         {consultant.phone && (
//                           <p className="flex items-center gap-2">
//                             <Phone size={14} />
//                             {consultant.phone}
//                           </p>
//                         )}
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               ) : (
//                 <div className="text-center py-8 text-gray-500">
//                   <Users size={48} className="mx-auto mb-4 text-gray-300" />
//                   <p>No consultants assigned to this office</p>
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* Right Column */}
//           <div className="space-y-6">
//             {/* Service Capacity */}
//             <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
//               <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
//                 <Calendar className="text-blue-600" size={20} />
//                 Service Capacity
//               </h2>

//               <div className="space-y-4">
//                 <div className="p-4 bg-blue-50 rounded-lg">
//                   <div className="text-center">
//                     <div className="text-2xl font-bold text-blue-600 mb-1">
//                       {officeData.serviceCapacity.maxConsultants}
//                     </div>
//                     <div className="text-sm text-blue-700">Max Consultants</div>
//                   </div>
//                 </div>

//                 <div className="p-4 bg-green-50 rounded-lg">
//                   <div className="text-center">
//                     <div className="text-2xl font-bold text-green-600 mb-1">
//                       {officeData.serviceCapacity.maxAppointments}
//                     </div>
//                     <div className="text-sm text-green-700">
//                       Max Appointments
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Manager Information */}
//             <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
//               <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
//                 <User className="text-blue-600" size={20} />
//                 Manager Information
//               </h2>

//               <div className="space-y-4">
//                 <div className="flex items-center gap-4">
//                   <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
//                     <User className="text-blue-600" size={20} />
//                   </div>
//                   <div>
//                     <h3 className="font-medium text-gray-900">
//                       {officeData.manager.name}
//                     </h3>
//                     <p className="text-sm text-gray-500 capitalize">
//                       {officeData.manager.role}
//                     </p>
//                   </div>
//                 </div>

//                 <div className="space-y-2 text-sm">
//                   <p className="flex items-center gap-2 text-gray-600">
//                     <Mail size={14} />
//                     {officeData.manager.email}
//                   </p>
//                   {officeData.manager.phone && (
//                     <p className="flex items-center gap-2 text-gray-600">
//                       <Phone size={14} />
//                       {officeData.manager.phone}
//                     </p>
//                   )}
//                 </div>

//                 <div className="pt-3 border-t border-gray-200">
//                   <div className="flex justify-between text-sm text-gray-500">
//                     <span>Status:</span>
//                     <span
//                       className={
//                         officeData.manager.isActive
//                           ? "text-green-600"
//                           : "text-red-600"
//                       }
//                     >
//                       {officeData.manager.isActive ? "Active" : "Inactive"}
//                     </span>
//                   </div>
//                   <div className="flex justify-between text-sm text-gray-500 mt-1">
//                     <span>Profile:</span>
//                     <span
//                       className={
//                         officeData.manager.isProfileCreated
//                           ? "text-green-600"
//                           : "text-orange-600"
//                       }
//                     >
//                       {officeData.manager.isProfileCreated
//                         ? "Complete"
//                         : "Incomplete"}
//                     </span>
//                   </div>
//                 </div>

//                 {/* Notification Preferences */}
//                 <div className="pt-3 border-t border-gray-200">
//                   <h4 className="text-sm font-medium text-gray-700 mb-2">
//                     Notifications
//                   </h4>
//                   <div className="space-y-1 text-xs">
//                     <div className="flex justify-between">
//                       <span>Email:</span>
//                       <span
//                         className={
//                           officeData.manager.notificationPreferences.email
//                             ? "text-green-600"
//                             : "text-gray-400"
//                         }
//                       >
//                         {officeData.manager.notificationPreferences.email
//                           ? "Enabled"
//                           : "Disabled"}
//                       </span>
//                     </div>
//                     <div className="flex justify-between">
//                       <span>SMS:</span>
//                       <span
//                         className={
//                           officeData.manager.notificationPreferences.sms
//                             ? "text-green-600"
//                             : "text-gray-400"
//                         }
//                       >
//                         {officeData.manager.notificationPreferences.sms
//                           ? "Enabled"
//                           : "Disabled"}
//                       </span>
//                     </div>
//                     <div className="flex justify-between">
//                       <span>In-App:</span>
//                       <span
//                         className={
//                           officeData.manager.notificationPreferences.in_app
//                             ? "text-green-600"
//                             : "text-gray-400"
//                         }
//                       >
//                         {officeData.manager.notificationPreferences.in_app
//                           ? "Enabled"
//                           : "Disabled"}
//                       </span>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default OfficeDetails;
