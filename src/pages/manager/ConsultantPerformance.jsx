import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useManagerStore from "../../stores/useManagerStore";
import managerService from "../../services/managerService";
import AddOrEditConsultantModal from "../../components/manager/AddOrEditConsultantModal";
import ConfirmDeleteConsultantModal from "../../components/manager/ConfirmDeleteConsultantModal";
import ConsultantLeadsModal from "../../components/manager/ConsultantLeadsModal";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { Users, User, Edit2, Trash2, Eye } from "lucide-react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ConsultantPerformance = () => {
  const navigate = useNavigate();
  const { consultants, fetchOfficeConsultants, loading, error } =
    useManagerStore();
  const [reports, setReports] = useState([]);
  const [isLoadingReports, setIsLoadingReports] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedConsultant, setSelectedConsultant] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [consultantToDelete, setConsultantToDelete] = useState(null);
  const [isLeadsModalOpen, setIsLeadsModalOpen] = useState(false);
  const [selectedConsultantForLeads, setSelectedConsultantForLeads] =
    useState(null);

  // Fetch consultants and reports
  useEffect(() => {
    console.log("Fetching consultants and reports...");
    fetchOfficeConsultants();
    // const fetchReports = async () => {
    //   setIsLoadingReports(true);
    //   try {
    //     const res = await managerService.getStaffReports();
    //     console.log('Fetched reports:', res.data);
    //     setReports(res.data || []);
    //   } catch (err) {
    //     console.error('Fetch reports error:', err);
    //     toast.error(
    //       err.response?.data?.error || 'Failed to fetch performance reports'
    //     );
    //   } finally {
    //     setIsLoadingReports(false);
    //   }
    // };
    // fetchReports();
  }, [fetchOfficeConsultants]);

  // Handle errors
  useEffect(() => {
    if (error) {
      console.error("Consultant error:", error);
      toast.error(error);
    }
  }, [error]);

  // Handle modal submit (create or update)
  const handleModalSubmit = async (formData) => {
    try {
      await managerService.createStaffMember(formData); // Handles both create and update
      await fetchOfficeConsultants(); // Refresh consultants list
    } catch (err) {
      throw err; // Let modal handle error
    }
  };

  // Handle delete consultant
  const openDeleteModal = (consultant) => {
    setConsultantToDelete(consultant);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    try {
      await managerService.disconnectStaffMember(consultantToDelete.id);
      toast.success("Consultant disconnected successfully");
      await fetchOfficeConsultants(); // Refresh consultants list
      setIsDeleteModalOpen(false);
      setConsultantToDelete(null);
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to disconnect consultant"
      );
    }
  };

  // Open modal for adding
  const openAddModal = () => {
    setSelectedConsultant(null);
    setIsModalOpen(true);
  };

  // Open modal for editing
  const openEditModal = (consultant) => {
    setSelectedConsultant(consultant);
    setIsModalOpen(true);
  };

  // Open modal for viewing leads
  const openLeadsModal = (consultant) => {
    setSelectedConsultantForLeads(consultant);
    setIsLeadsModalOpen(true);
  };

  if (loading || isLoadingReports) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Consultant</h1>
          <p className="text-gray-600">Overview of consultant performance</p>
        </div>
        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={() => navigate("/manager/schedules")}
          >
            <Users className="h-4 w-4 mr-2" />
            View Schedules
          </Button>
          <Button variant="primary" onClick={openAddModal}>
            <User className="h-4 w-4 mr-2" />
            Add Consultant
          </Button>
        </div>
      </div>

      {/* Consultants Table */}
      <Card title="Consultant Performance Metrics" className="mt-6">
        {consultants.length ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Consultant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Leads
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Converted Leads
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Conversion Rate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pending Tasks
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {consultants.map((consultant) => (
                  <tr key={consultant.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {consultant.name || "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {consultant.email || "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {consultant.totalLeads || 0}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {consultant.convertedLeads || 0}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {(
                          ((consultant.totalLeads > 0
                            ? consultant.convertedLeads / consultant.totalLeads
                            : 0) || 0) * 100
                        ).toFixed(2)}
                        %
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge
                        className={
                          (consultant.pendingTasks || 0) > 5
                            ? "bg-red-100 text-red-800"
                            : (consultant.pendingTasks || 0) > 0
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-green-100 text-green-800"
                        }
                      >
                        {consultant.pendingTasks || 0}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex space-x-2">
                      <button
                        onClick={() => openEditModal(consultant)}
                        className="text-blue-600 hover:text-blue-800"
                        title="Edit Consultant"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => openDeleteModal(consultant)}
                        className="text-red-600 hover:text-red-800"
                        title="Disconnect Consultant"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => openLeadsModal(consultant)}
                        className={`text-gray-600 hover:text-gray-800 ${
                          consultant.leads.length === 0
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        }`}
                        title="View Leads"
                        disabled={consultant.leads.length === 0}
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-sm p-4">No consultants available</p>
        )}
      </Card>

      {/* Add/Edit Modal */}
      <AddOrEditConsultantModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        consultant={selectedConsultant}
        onSubmit={handleModalSubmit}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteConsultantModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        consultantName={consultantToDelete?.name}
      />

      {/* Leads Modal */}
      <ConsultantLeadsModal
        isOpen={isLeadsModalOpen}
        onClose={() => setIsLeadsModalOpen(false)}
        consultant={selectedConsultantForLeads}
      />
    </div>
  );
};

export default ConsultantPerformance;

// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import useManagerStore from "../../stores/useManagerStore";
// import managerService from "../../services/managerService";
// import AddOrEditConsultantModal from "../../components/manager/AddOrEditConsultantModal";
// import Card from "../../components/ui/Card";
// import Button from "../../components/ui/Button";
// import Badge from "../../components/ui/Badge";
// import LoadingSpinner from "../../components/ui/LoadingSpinner";
// import { Users, User, Edit2, Trash2 } from "lucide-react";
// import { toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";

// const ConsultantPerformance = () => {
//   const navigate = useNavigate();
//   const { consultants, fetchOfficeConsultants, loading, error } =
//     useManagerStore();
//   const [reports, setReports] = useState([]);
//   const [isLoadingReports, setIsLoadingReports] = useState(false);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [selectedConsultant, setSelectedConsultant] = useState(null);

//   // Fetch consultants and reports
//   useEffect(() => {
//     console.log("Fetching consultants and reports...");
//     fetchOfficeConsultants();
//     // const fetchReports = async () => {
//     //   setIsLoadingReports(true);
//     //   try {
//     //     const res = await managerService.getStaffReports();
//     //     console.log('Fetched reports:', res.data);
//     //     setReports(res.data || []);
//     //   } catch (err) {
//     //     console.error('Fetch reports error:', err);
//     //     toast.error(
//     //       err.response?.data?.error || 'Failed to fetch performance reports'
//     //     );
//     //   } finally {
//     //     setIsLoadingReports(false);
//     //   }
//     // };
//     // fetchReports();
//   }, [fetchOfficeConsultants]);

//   // Handle errors
//   useEffect(() => {
//     if (error) {
//       console.error("Consultant error:", error);
//       toast.error(error);
//     }
//   }, [error]);

//   // Handle modal submit (create or update)
//   const handleModalSubmit = async (formData) => {
//     try {
//       await managerService.createStaffMember(formData); // Handles both create and update
//       await fetchOfficeConsultants(); // Refresh consultants list
//     } catch (err) {
//       throw err; // Let modal handle error
//     }
//   };

//   // Handle delete consultant
//   const handleDelete = async (consultantId) => {
//     if (!window.confirm("Are you sure you want to disconnect this consultant?"))
//       return;
//     try {
//       await managerService.disconnectStaffMember(consultantId);
//       toast.success("Consultant disconnected successfully");
//       await fetchOfficeConsultants(); // Refresh consultants list
//     } catch (err) {
//       toast.error(
//         err.response?.data?.message || "Failed to disconnect consultant"
//       );
//     }
//   };

//   // Open modal for adding
//   const openAddModal = () => {
//     setSelectedConsultant(null);
//     setIsModalOpen(true);
//   };

//   // Open modal for editing
//   const openEditModal = (consultant) => {
//     setSelectedConsultant(consultant);
//     setIsModalOpen(true);
//   };

//   if (loading || isLoadingReports) {
//     return (
//       <div className="flex items-center justify-center h-64">
//         <LoadingSpinner size="lg" />
//       </div>
//     );
//   }

//   return (
//     <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
//       {/* Header */}
//       <div className="flex justify-between items-center">
//         <div>
//           <h1 className="text-2xl font-bold text-gray-900">Consultant</h1>
//           <p className="text-gray-600">Overview of consultant performance</p>
//         </div>
//         <div className="flex space-x-3">
//           <Button
//             variant="outline"
//             onClick={() => navigate("/manager/schedules")}
//           >
//             <Users className="h-4 w-4 mr-2" />
//             View Schedules
//           </Button>
//           <Button variant="primary" onClick={openAddModal}>
//             <User className="h-4 w-4 mr-2" />
//             Add Consultant
//           </Button>
//         </div>
//       </div>

//       {/* Consultants Table */}
//       <Card title="Consultant Performance Metrics" className="mt-6">
//         {consultants.length ? (
//           <div className="overflow-x-auto">
//             <table className="min-w-full divide-y divide-gray-200">
//               <thead className="bg-gray-50">
//                 <tr>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Consultant
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Email
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Total Leads
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Converted Leads
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Conversion Rate
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Pending Tasks
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Actions
//                   </th>
//                 </tr>
//               </thead>
//               <tbody className="bg-white divide-y divide-gray-200">
//                 {consultants.map((consultant) => (
//                   <tr key={consultant.id}>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <div className="text-sm font-medium text-gray-900">
//                         {consultant.name || "N/A"}
//                       </div>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <div className="text-sm text-gray-500">
//                         {consultant.email || "N/A"}
//                       </div>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <div className="text-sm text-gray-900">
//                         {consultant.totalLeads || 0}
//                       </div>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <div className="text-sm text-gray-900">
//                         {consultant.convertedLeads || 0}
//                       </div>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <div className="text-sm text-gray-900">
//                         {(
//                           ((consultant.totalLeads > 0
//                             ? consultant.convertedLeads / consultant.totalLeads
//                             : 0) || 0) * 100
//                         ).toFixed(2)}
//                         %
//                       </div>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <Badge
//                         className={
//                           (consultant.pendingTasks || 0) > 5
//                             ? "bg-red-100 text-red-800"
//                             : (consultant.pendingTasks || 0) > 0
//                             ? "bg-yellow-100 text-yellow-800"
//                             : "bg-green-100 text-green-800"
//                         }
//                       >
//                         {consultant.pendingTasks || 0}
//                       </Badge>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex space-x-2">
//                       <button
//                         onClick={() => openEditModal(consultant)}
//                         className="text-blue-600 hover:text-blue-800"
//                         title="Edit Consultant"
//                       >
//                         <Edit2 className="h-4 w-4" />
//                       </button>
//                       <button
//                         onClick={() => handleDelete(consultant.id)}
//                         className="text-red-600 hover:text-red-800"
//                         title="Disconnect Consultant"
//                       >
//                         <Trash2 className="h-4 w-4" />
//                       </button>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         ) : (
//           <p className="text-gray-500 text-sm p-4">No consultants available</p>
//         )}
//       </Card>

//       {/* Modal */}
//       <AddOrEditConsultantModal
//         isOpen={isModalOpen}
//         onClose={() => setIsModalOpen(false)}
//         consultant={selectedConsultant}
//         onSubmit={handleModalSubmit}
//       />
//     </div>
//   );
// };

// export default ConsultantPerformance;
