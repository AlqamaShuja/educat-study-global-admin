import React, { useState, useEffect } from "react";
import useConsultantStore from "../../stores/consultantStore";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import Input from "../../components/ui/Input";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { Eye, Calendar, FileText, Package, Send } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import LeadStatusTaskAndDocumentModal from "../../components/consultant/LeadStatusTakAndDocumentModal";
import CreateProposalModal from "../../components/consultant/CreateProposalModal";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Confirmation Modal Component
const ParkConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  leadName,
  isParked,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {isParked ? "Unpark Lead" : "Park Lead"}
        </h3>
        <p className="text-gray-600 mb-6">
          Are you sure you want to {isParked ? "unpark" : "park"} the lead for{" "}
          <span className="font-medium">{leadName}</span>?
        </p>
        <div className="flex justify-end space-x-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            className={
              isParked
                ? "bg-green-600 hover:bg-green-700"
                : "bg-red-600 hover:bg-red-700"
            }
          >
            {isParked ? "Unpark" : "Park"}
          </Button>
        </div>
      </div>
    </div>
  );
};

const MyLeads = () => {
  const {
    leads,
    selectedLead,
    tasks,
    documents,
    fetchLeads,
    fetchLeadTasks,
    fetchLeadDocuments,
    selectLead,
    clearSelectedLead,
    updateLeadStatus,
    updateLeadParkedStatus,
    addConsultationNote,
    setFollowUpTask,
    scheduleMeeting,
    updateTaskStatus,
    loading,
    error,
  } = useConsultantStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProposalModalOpen, setIsProposalModalOpen] = useState(false);
  const [selectedLeadForProposal, setSelectedLeadForProposal] = useState(null);
  const [isParkModalOpen, setIsParkModalOpen] = useState(false);
  const [selectedLeadForPark, setSelectedLeadForPark] = useState(null);
  const [filters, setFilters] = useState({
    status: "",
    search: "",
    parked: "", // New parked filter
  });
  const [hasLoaded, setHasLoaded] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();
  const pageSize = 10;

  useEffect(() => {
    console.log("Fetching leads...");
    fetchLeads()
      .then(() => {
        console.log("Fetch leads completed");
        setHasLoaded(true);
      })
      .catch((err) => {
        console.error("Fetch leads failed:", err);
        setHasLoaded(true);
      });
  }, [fetchLeads]);

  useEffect(() => {
    console.log("Leads state:", leads);
    console.log("Has loaded:", hasLoaded);
    console.log("Loading:", loading);
    if (leads?.length && hasLoaded) {
      console.log("First lead:", leads[0]);
    }
  }, [leads, hasLoaded, loading]);

  useEffect(() => {
    if (error) {
      console.error("Store error:", error);
      toast.error(error);
    }
  }, [error]);

  useEffect(() => {
    if (selectedLead?.id) {
      console.log("Fetching tasks and documents for lead:", selectedLead.id);
      fetchLeadTasks(selectedLead.id);
      fetchLeadDocuments(selectedLead.id);
    }
  }, [selectedLead, fetchLeadTasks, fetchLeadDocuments]);

  const handleSelectLead = (lead) => {
    console.log("Selecting lead:", lead);
    const enrichedHistory = lead?.history
      ? lead?.history?.map((entry) => ({
          ...entry,
          userRole:
            entry.userId === lead.studentId
              ? "Student"
              : entry.userId === lead.assignedConsultant
              ? "Consultant"
              : entry.userId === "201745bd-7c96-4360-9f01-776729d63de9"
              ? "Manager"
              : entry.userId
              ? "Admin"
              : "System",
        }))
      : [];
    selectLead({ ...lead, history: enrichedHistory });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    clearSelectedLead();
  };

  const handleToggleParked = (lead) => {
    setSelectedLeadForPark(lead);
    setIsParkModalOpen(true);
  };

  const handleConfirmPark = async () => {
    try {
      const newParkedStatus = !selectedLeadForPark.parked;
      await updateLeadParkedStatus(selectedLeadForPark.id, newParkedStatus);
      toast.success(
        `Lead ${newParkedStatus ? "parked" : "unparked"} successfully`
      );
      setIsParkModalOpen(false);
      setSelectedLeadForPark(null);
    } catch (error) {
      toast.error("Failed to update parked status");
    }
  };

  const handleCloseParkModal = () => {
    setIsParkModalOpen(false);
    setSelectedLeadForPark(null);
  };

  const handleCreateProposal = (lead) => {
    setSelectedLeadForProposal(lead);
    setIsProposalModalOpen(true);
  };

  const handleCloseProposalModal = () => {
    setIsProposalModalOpen(false);
    setSelectedLeadForProposal(null);
  };

  const handleProposalSuccess = () => {
    // Optionally refresh leads or show additional success message
    toast.success("Proposal sent successfully!");
    // You could also refresh the leads list here if needed
    // fetchLeads();
  };

  const getStatusColor = (status) => {
    const colors = {
      new: "bg-blue-100 text-blue-800",
      in_progress: "bg-yellow-100 text-yellow-800",
      converted: "bg-green-100 text-green-800",
      lost: "bg-red-100 text-red-800",
      lead: "bg-purple-100 text-purple-800",
      opportunity: "bg-orange-100 text-orange-800",
      project: "bg-indigo-100 text-indigo-800",
      done: "bg-gray-100 text-gray-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const filteredLeads = Array.isArray(leads)
    ? leads?.filter((lead) => {
        const matchesStatus = !filters.status || lead.status === filters.status;
        const matchesParked =
          filters.parked === "" ||
          (filters.parked === "true" && lead.parked) ||
          (filters.parked === "false" && !lead.parked);
        const matchesSearch =
          !filters.search ||
          (lead.student &&
            lead.student.name &&
            lead.student.name
              .toLowerCase()
              .includes(filters.search.toLowerCase())) ||
          (lead.student &&
            lead.student.email &&
            lead.student.email
              .toLowerCase()
              .includes(filters.search.toLowerCase()));
        console.log(
          `Lead ${lead.id}: matchesStatus=${matchesStatus}, matchesParked=${matchesParked}, matchesSearch=${matchesSearch}`
        );
        return matchesStatus && matchesParked && matchesSearch;
      })
    : [];

  console.log("Filtered leads:", filteredLeads);

  // Pagination logic
  const totalPages = Math.ceil(filteredLeads?.length / pageSize);
  const paginatedLeads = filteredLeads.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleViewProfile = (lead) => {
    navigate(`/consultant/students/${lead.studentId}`, {
      state: { lead },
    });
  };

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Leads</h1>
          <p className="text-gray-600">
            Manage your assigned leads and track progress
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input
            placeholder="Search by name or email..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
          <select
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          >
            <option value="">All Statuses</option>
            <option value="lead">Lead</option>
            <option value="opportunity">Opportunity</option>
            <option value="project">Project</option>
            <option value="done">Done</option>
            {/* <option value="new">New</option>
            <option value="in_progress">In Progress</option>
            <option value="converted">Converted</option>
            <option value="lost">Lost</option> */}
          </select>
          <select
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            value={filters.parked}
            onChange={(e) => setFilters({ ...filters, parked: e.target.value })}
          >
            <option value="">All</option>
            <option value="false">Active</option>
            <option value="true">Parked</option>
          </select>
          <div className="text-sm text-gray-600 flex items-center">
            Total: {filteredLeads?.length} leads
          </div>
        </div>
      </div>

      {/* Leads Table */}
      {!hasLoaded || (loading && !leads?.length) ? (
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      ) : filteredLeads?.length ? (
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Student Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Parked
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Source
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Study Preferences
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Language
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedLeads?.map((lead, index) => (
                <tr
                  key={lead.id}
                  className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="font-medium text-gray-900">
                      {lead.student?.name || "N/A"}
                    </div>
                    <div className="text-sm text-gray-500">
                      {lead.student?.email || "N/A"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <Badge className={getStatusColor(lead.status)}>
                      {lead.status
                        ? lead.status.replace("_", " ").toUpperCase()
                        : "N/A"}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center space-x-2">
                      <Badge
                        className={
                          lead.parked
                            ? "bg-red-100 text-red-800"
                            : "bg-green-100 text-green-800"
                        }
                      >
                        {lead.parked ? "Yes" : "No"}
                      </Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleToggleParked(lead)}
                        title={lead.parked ? "Unpark Lead" : "Park Lead"}
                        className="p-1"
                      >
                        <Package className="h-3 w-3" />
                      </Button>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                    {lead.source || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>
                      Destination:{" "}
                      {lead.studyPreferences?.destination || "Not Specified"}
                    </div>
                    <div>
                      Level: {lead.studyPreferences?.level || "Not Specified"}
                    </div>
                    <div>
                      Fields:{" "}
                      {lead.studyPreferences?.fields?.length
                        ? lead.studyPreferences.fields.join(", ")
                        : "Not Specified"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                    {lead.languagePreference || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {lead.createdAt
                      ? new Date(lead.createdAt).toLocaleDateString()
                      : "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        title="View Profile"
                        onClick={() => handleViewProfile(lead)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSelectLead(lead)}
                        title="View Details"
                      >
                        <FileText className="h-4 w-4" />
                      </Button>
                      {/* <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCreateProposal(lead)}
                        title="Create Proposal"
                        className="text-blue-600 border-blue-300 hover:bg-blue-50"
                      >
                        <Send className="h-4 w-4" />
                      </Button> */}
                      <Link
                        to={`/consultant/students/${lead.studentId}/meetings`}
                      >
                        <Button
                          size="sm"
                          variant="outline"
                          title="Schedule Meeting"
                        >
                          <Calendar className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center p-4 border-t border-gray-200">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white p-6 rounded-lg shadow text-center text-gray-500">
          No leads found matching the current filters.
        </div>
      )}

      {/* Lead Details Modal */}
      <LeadStatusTaskAndDocumentModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        selectedLead={selectedLead}
        tasks={tasks}
        documents={documents}
        fetchLeadTasks={fetchLeadTasks}
        fetchLeadDocuments={fetchLeadDocuments}
        updateLeadStatus={updateLeadStatus}
        addConsultationNote={addConsultationNote}
        setFollowUpTask={setFollowUpTask}
        scheduleMeeting={scheduleMeeting}
        updateTaskStatus={updateTaskStatus}
        loading={loading}
      />

      {/* Create Proposal Modal */}
      <CreateProposalModal
        isOpen={isProposalModalOpen}
        onClose={handleCloseProposalModal}
        selectedLead={selectedLeadForProposal}
        onSuccess={handleProposalSuccess}
      />

      {/* Park Confirmation Modal */}
      <ParkConfirmationModal
        isOpen={isParkModalOpen}
        onClose={handleCloseParkModal}
        onConfirm={handleConfirmPark}
        leadName={selectedLeadForPark?.student?.name || "this lead"}
        isParked={selectedLeadForPark?.parked || false}
      />
    </div>
  );
};

export default MyLeads;

// import React, { useState, useEffect } from "react";
// import useConsultantStore from "../../stores/consultantStore";
// import Button from "../../components/ui/Button";
// import Badge from "../../components/ui/Badge";
// import Input from "../../components/ui/Input";
// import LoadingSpinner from "../../components/ui/LoadingSpinner";
// import { Eye, Calendar, FileText, Package, Send } from "lucide-react";
// import { Link, useNavigate } from "react-router-dom";
// import LeadStatusTaskAndDocumentModal from "../../components/consultant/LeadStatusTakAndDocumentModal";
// import CreateProposalModal from "../../components/consultant/CreateProposalModal";
// import { toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";

// const MyLeads = () => {
//   const {
//     leads,
//     selectedLead,
//     tasks,
//     documents,
//     fetchLeads,
//     fetchLeadTasks,
//     fetchLeadDocuments,
//     selectLead,
//     clearSelectedLead,
//     updateLeadStatus,
//     updateLeadParkedStatus,
//     addConsultationNote,
//     setFollowUpTask,
//     scheduleMeeting,
//     updateTaskStatus,
//     loading,
//     error,
//   } = useConsultantStore();

//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [isProposalModalOpen, setIsProposalModalOpen] = useState(false);
//   const [selectedLeadForProposal, setSelectedLeadForProposal] = useState(null);
//   const [filters, setFilters] = useState({
//     status: "",
//     search: "",
//     parked: "", // New parked filter
//   });
//   const [hasLoaded, setHasLoaded] = useState(false);
//   const [currentPage, setCurrentPage] = useState(1);
//   const navigate = useNavigate();
//   const pageSize = 10;

//   useEffect(() => {
//     console.log("Fetching leads...");
//     fetchLeads()
//       .then(() => {
//         console.log("Fetch leads completed");
//         setHasLoaded(true);
//       })
//       .catch((err) => {
//         console.error("Fetch leads failed:", err);
//         setHasLoaded(true);
//       });
//   }, [fetchLeads]);

//   useEffect(() => {
//     console.log("Leads state:", leads);
//     console.log("Has loaded:", hasLoaded);
//     console.log("Loading:", loading);
//     if (leads?.length && hasLoaded) {
//       console.log("First lead:", leads[0]);
//     }
//   }, [leads, hasLoaded, loading]);

//   useEffect(() => {
//     if (error) {
//       console.error("Store error:", error);
//       toast.error(error);
//     }
//   }, [error]);

//   useEffect(() => {
//     if (selectedLead?.id) {
//       console.log("Fetching tasks and documents for lead:", selectedLead.id);
//       fetchLeadTasks(selectedLead.id);
//       fetchLeadDocuments(selectedLead.id);
//     }
//   }, [selectedLead, fetchLeadTasks, fetchLeadDocuments]);

//   const handleSelectLead = (lead) => {
//     console.log("Selecting lead:", lead);
//     const enrichedHistory = lead?.history
//       ? lead?.history?.map((entry) => ({
//           ...entry,
//           userRole:
//             entry.userId === lead.studentId
//               ? "Student"
//               : entry.userId === lead.assignedConsultant
//               ? "Consultant"
//               : entry.userId === "201745bd-7c96-4360-9f01-776729d63de9"
//               ? "Manager"
//               : entry.userId
//               ? "Admin"
//               : "System",
//         }))
//       : [];
//     selectLead({ ...lead, history: enrichedHistory });
//     setIsModalOpen(true);
//   };

//   const handleCloseModal = () => {
//     setIsModalOpen(false);
//     clearSelectedLead();
//   };

//   const handleToggleParked = async (lead) => {
//     try {
//       const newParkedStatus = !lead.parked;
//       await updateLeadParkedStatus(lead.id, newParkedStatus);
//       toast.success(
//         `Lead ${newParkedStatus ? "parked" : "unparked"} successfully`
//       );
//     } catch (error) {
//       toast.error("Failed to update parked status");
//     }
//   };

//   const handleCreateProposal = (lead) => {
//     setSelectedLeadForProposal(lead);
//     setIsProposalModalOpen(true);
//   };

//   const handleCloseProposalModal = () => {
//     setIsProposalModalOpen(false);
//     setSelectedLeadForProposal(null);
//   };

//   const handleProposalSuccess = () => {
//     // Optionally refresh leads or show additional success message
//     toast.success("Proposal sent successfully!");
//     // You could also refresh the leads list here if needed
//     // fetchLeads();
//   };

//   const getStatusColor = (status) => {
//     const colors = {
//       new: "bg-blue-100 text-blue-800",
//       in_progress: "bg-yellow-100 text-yellow-800",
//       converted: "bg-green-100 text-green-800",
//       lost: "bg-red-100 text-red-800",
//       lead: "bg-purple-100 text-purple-800",
//       opportunity: "bg-orange-100 text-orange-800",
//       project: "bg-indigo-100 text-indigo-800",
//       done: "bg-gray-100 text-gray-800",
//     };
//     return colors[status] || "bg-gray-100 text-gray-800";
//   };

//   const filteredLeads = Array.isArray(leads)
//     ? leads?.filter((lead) => {
//         const matchesStatus = !filters.status || lead.status === filters.status;
//         const matchesParked =
//           filters.parked === "" ||
//           (filters.parked === "true" && lead.parked) ||
//           (filters.parked === "false" && !lead.parked);
//         const matchesSearch =
//           !filters.search ||
//           (lead.student &&
//             lead.student.name &&
//             lead.student.name
//               .toLowerCase()
//               .includes(filters.search.toLowerCase())) ||
//           (lead.student &&
//             lead.student.email &&
//             lead.student.email
//               .toLowerCase()
//               .includes(filters.search.toLowerCase()));
//         console.log(
//           `Lead ${lead.id}: matchesStatus=${matchesStatus}, matchesParked=${matchesParked}, matchesSearch=${matchesSearch}`
//         );
//         return matchesStatus && matchesParked && matchesSearch;
//       })
//     : [];

//   console.log("Filtered leads:", filteredLeads);

//   // Pagination logic
//   const totalPages = Math.ceil(filteredLeads?.length / pageSize);
//   const paginatedLeads = filteredLeads.slice(
//     (currentPage - 1) * pageSize,
//     currentPage * pageSize
//   );

//   const handlePageChange = (page) => {
//     if (page >= 1 && page <= totalPages) {
//       setCurrentPage(page);
//     }
//   };

//   const handleViewProfile = (lead) => {
//     navigate(`/consultant/students/${lead.studentId}`, {
//       state: { lead },
//     });
//   };

//   return (
//     <div className="p-6 space-y-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
//       {/* Header */}
//       <div className="flex justify-between items-center">
//         <div>
//           <h1 className="text-2xl font-bold text-gray-900">My Leads</h1>
//           <p className="text-gray-600">
//             Manage your assigned leads and track progress
//           </p>
//         </div>
//       </div>

//       {/* Filters */}
//       <div className="bg-white p-4 rounded-lg shadow">
//         <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//           <Input
//             placeholder="Search by name or email..."
//             value={filters.search}
//             onChange={(e) => setFilters({ ...filters, search: e.target.value })}
//           />
//           <select
//             className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
//             value={filters.status}
//             onChange={(e) => setFilters({ ...filters, status: e.target.value })}
//           >
//             <option value="">All Statuses</option>
//             <option value="lead">Lead</option>
//             <option value="opportunity">Opportunity</option>
//             <option value="project">Project</option>
//             <option value="done">Done</option>
//             {/* <option value="new">New</option>
//             <option value="in_progress">In Progress</option>
//             <option value="converted">Converted</option>
//             <option value="lost">Lost</option> */}
//           </select>
//           <select
//             className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
//             value={filters.parked}
//             onChange={(e) => setFilters({ ...filters, parked: e.target.value })}
//           >
//             <option value="">All</option>
//             <option value="false">Active</option>
//             <option value="true">Parked</option>
//           </select>
//           <div className="text-sm text-gray-600 flex items-center">
//             Total: {filteredLeads?.length} leads
//           </div>
//         </div>
//       </div>

//       {/* Leads Table */}
//       {!hasLoaded || (loading && !leads?.length) ? (
//         <div className="flex items-center justify-center h-64">
//           <LoadingSpinner size="lg" />
//         </div>
//       ) : filteredLeads?.length ? (
//         <div className="bg-white rounded-lg shadow overflow-x-auto">
//           <table className="min-w-full bg-white border border-gray-200">
//             <thead className="bg-gray-50">
//               <tr>
//                 <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
//                   Student Name
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
//                   Status
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
//                   Parked
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
//                   Source
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
//                   Study Preferences
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
//                   Language
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
//                   Created
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
//                   Actions
//                 </th>
//               </tr>
//             </thead>
//             <tbody>
//               {paginatedLeads?.map((lead, index) => (
//                 <tr
//                   key={lead.id}
//                   className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
//                 >
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                     <div className="font-medium text-gray-900">
//                       {lead.student?.name || "N/A"}
//                     </div>
//                     <div className="text-sm text-gray-500">
//                       {lead.student?.email || "N/A"}
//                     </div>
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                     <Badge className={getStatusColor(lead.status)}>
//                       {lead.status
//                         ? lead.status.replace("_", " ").toUpperCase()
//                         : "N/A"}
//                     </Badge>
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                     <div className="flex items-center space-x-2">
//                       <Badge
//                         className={
//                           lead.parked
//                             ? "bg-red-100 text-red-800"
//                             : "bg-green-100 text-green-800"
//                         }
//                       >
//                         {lead.parked ? "Yes" : "No"}
//                       </Badge>
//                       <Button
//                         size="sm"
//                         variant="outline"
//                         onClick={() => handleToggleParked(lead)}
//                         title={lead.parked ? "Unpark Lead" : "Park Lead"}
//                         className="p-1"
//                       >
//                         <Package className="h-3 w-3" />
//                       </Button>
//                     </div>
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
//                     {lead.source || "N/A"}
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                     <div>
//                       Destination:{" "}
//                       {lead.studyPreferences?.destination || "Not Specified"}
//                     </div>
//                     <div>
//                       Level: {lead.studyPreferences?.level || "Not Specified"}
//                     </div>
//                     <div>
//                       Fields:{" "}
//                       {lead.studyPreferences?.fields?.length
//                         ? lead.studyPreferences.fields.join(", ")
//                         : "Not Specified"}
//                     </div>
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
//                     {lead.languagePreference || "N/A"}
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
//                     {lead.createdAt
//                       ? new Date(lead.createdAt).toLocaleDateString()
//                       : "N/A"}
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                     <div className="flex space-x-2">
//                       <Button
//                         size="sm"
//                         variant="outline"
//                         title="View Profile"
//                         onClick={() => handleViewProfile(lead)}
//                       >
//                         <Eye className="h-4 w-4" />
//                       </Button>
//                       <Button
//                         size="sm"
//                         variant="outline"
//                         onClick={() => handleSelectLead(lead)}
//                         title="View Details"
//                       >
//                         <FileText className="h-4 w-4" />
//                       </Button>
//                       <Button
//                         size="sm"
//                         variant="outline"
//                         onClick={() => handleCreateProposal(lead)}
//                         title="Create Proposal"
//                         className="text-blue-600 border-blue-300 hover:bg-blue-50"
//                       >
//                         <Send className="h-4 w-4" />
//                       </Button>
//                       <Link
//                         to={`/consultant/students/${lead.studentId}/meetings`}
//                       >
//                         <Button
//                           size="sm"
//                           variant="outline"
//                           title="Schedule Meeting"
//                         >
//                           <Calendar className="h-4 w-4" />
//                         </Button>
//                       </Link>
//                     </div>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//           {/* Pagination */}
//           {totalPages > 1 && (
//             <div className="flex justify-between items-center p-4 border-t border-gray-200">
//               <Button
//                 variant="outline"
//                 size="sm"
//                 onClick={() => handlePageChange(currentPage - 1)}
//                 disabled={currentPage === 1}
//               >
//                 Previous
//               </Button>
//               <span className="text-sm text-gray-600">
//                 Page {currentPage} of {totalPages}
//               </span>
//               <Button
//                 variant="outline"
//                 size="sm"
//                 onClick={() => handlePageChange(currentPage + 1)}
//                 disabled={currentPage === totalPages}
//               >
//                 Next
//               </Button>
//             </div>
//           )}
//         </div>
//       ) : (
//         <div className="bg-white p-6 rounded-lg shadow text-center text-gray-500">
//           No leads found matching the current filters.
//         </div>
//       )}

//       {/* Lead Details Modal */}
//       <LeadStatusTaskAndDocumentModal
//         isOpen={isModalOpen}
//         onClose={handleCloseModal}
//         selectedLead={selectedLead}
//         tasks={tasks}
//         documents={documents}
//         fetchLeadTasks={fetchLeadTasks}
//         fetchLeadDocuments={fetchLeadDocuments}
//         updateLeadStatus={updateLeadStatus}
//         addConsultationNote={addConsultationNote}
//         setFollowUpTask={setFollowUpTask}
//         scheduleMeeting={scheduleMeeting}
//         updateTaskStatus={updateTaskStatus}
//         loading={loading}
//       />

//       {/* Create Proposal Modal */}
//       <CreateProposalModal
//         isOpen={isProposalModalOpen}
//         onClose={handleCloseProposalModal}
//         selectedLead={selectedLeadForProposal}
//         onSuccess={handleProposalSuccess}
//       />
//     </div>
//   );
// };

// export default MyLeads;

// import React, { useState, useEffect } from "react";
// import useConsultantStore from "../../stores/consultantStore";
// import Button from "../../components/ui/Button";
// import Badge from "../../components/ui/Badge";
// import Input from "../../components/ui/Input";
// import LoadingSpinner from "../../components/ui/LoadingSpinner";
// import { Eye, Calendar, FileText } from "lucide-react";
// import { Link, useNavigate } from "react-router-dom";
// import LeadStatusTaskAndDocumentModal from "../../components/consultant/LeadStatusTakAndDocumentModal";
// import { toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";

// const MyLeads = () => {
//   const {
//     leads,
//     selectedLead,
//     tasks,
//     documents,
//     fetchLeads,
//     fetchLeadTasks,
//     fetchLeadDocuments,
//     selectLead,
//     clearSelectedLead,
//     updateLeadStatus,
//     addConsultationNote,
//     setFollowUpTask,
//     scheduleMeeting,
//     updateTaskStatus,
//     loading,
//     error,
//   } = useConsultantStore();

//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [filters, setFilters] = useState({
//     status: "",
//     search: "",
//   });
//   const [hasLoaded, setHasLoaded] = useState(false);
//   const [currentPage, setCurrentPage] = useState(1);
//   const navigate = useNavigate();
//   const pageSize = 10;

//   useEffect(() => {
//     console.log("Fetching leads...");
//     fetchLeads()
//       .then(() => {
//         console.log("Fetch leads completed");
//         setHasLoaded(true);
//       })
//       .catch((err) => {
//         console.error("Fetch leads failed:", err);
//         setHasLoaded(true);
//       });
//   }, [fetchLeads]);

//   useEffect(() => {
//     console.log("Leads state:", leads);
//     console.log("Has loaded:", hasLoaded);
//     console.log("Loading:", loading);
//     if (leads?.length && hasLoaded) {
//       console.log("First lead:", leads[0]);
//     }
//   }, [leads, hasLoaded, loading]);

//   useEffect(() => {
//     if (error) {
//       console.error("Store error:", error);
//       toast.error(error);
//     }
//   }, [error]);

//   useEffect(() => {
//     if (selectedLead?.id) {
//       console.log("Fetching tasks and documents for lead:", selectedLead.id);
//       fetchLeadTasks(selectedLead.id);
//       fetchLeadDocuments(selectedLead.id);
//     }
//   }, [selectedLead, fetchLeadTasks, fetchLeadDocuments]);

//   const handleSelectLead = (lead) => {
//     console.log("Selecting lead:", lead);
//     const enrichedHistory = lead?.history
//       ? lead?.history?.map((entry) => ({
//           ...entry,
//           userRole:
//             entry.userId === lead.studentId
//               ? "Student"
//               : entry.userId === lead.assignedConsultant
//               ? "Consultant"
//               : entry.userId === "201745bd-7c96-4360-9f01-776729d63de9"
//               ? "Manager"
//               : entry.userId
//               ? "Admin"
//               : "System",
//         }))
//       : [];
//     selectLead({ ...lead, history: enrichedHistory });
//     setIsModalOpen(true);
//   };

//   const handleCloseModal = () => {
//     setIsModalOpen(false);
//     clearSelectedLead();
//   };

//   const getStatusColor = (status) => {
//     const colors = {
//       new: "bg-blue-100 text-blue-800",
//       in_progress: "bg-yellow-100 text-yellow-800",
//       converted: "bg-green-100 text-green-800",
//       lost: "bg-red-100 text-red-800",
//     };
//     return colors[status] || "bg-gray-100 text-gray-800";
//   };

//   const filteredLeads = Array.isArray(leads)
//     ? leads?.filter((lead) => {
//         const matchesStatus = !filters.status || lead.status === filters.status;
//         const matchesSearch =
//           !filters.search ||
//           (lead.student &&
//             lead.student.name &&
//             lead.student.name
//               .toLowerCase()
//               .includes(filters.search.toLowerCase())) ||
//           (lead.student &&
//             lead.student.email &&
//             lead.student.email
//               .toLowerCase()
//               .includes(filters.search.toLowerCase()));
//         console.log(
//           `Lead ${lead.id}: matchesStatus=${matchesStatus}, matchesSearch=${matchesSearch}`
//         );
//         return matchesStatus && matchesSearch;
//       })
//     : [];

//   console.log("Filtered leads:", filteredLeads);

//   // Pagination logic
//   const totalPages = Math.ceil(filteredLeads?.length / pageSize);
//   const paginatedLeads = filteredLeads.slice(
//     (currentPage - 1) * pageSize,
//     currentPage * pageSize
//   );

//   const handlePageChange = (page) => {
//     if (page >= 1 && page <= totalPages) {
//       setCurrentPage(page);
//     }
//   };

//   const handleViewProfile = (lead) => {
//     navigate(`/consultant/students/${lead.studentId}`, {
//       state: { lead },
//     });
//   };

//   return (
//     <div className="p-6 space-y-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
//       {/* Header */}
//       <div className="flex justify-between items-center">
//         <div>
//           <h1 className="text-2xl font-bold text-gray-900">My Leads</h1>
//           <p className="text-gray-600">
//             Manage your assigned leads and track progress
//           </p>
//         </div>
//       </div>

//       {/* Filters */}
//       <div className="bg-white p-4 rounded-lg shadow">
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//           <Input
//             placeholder="Search by name or email..."
//             value={filters.search}
//             onChange={(e) => setFilters({ ...filters, search: e.target.value })}
//           />
//           <select
//             className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
//             value={filters.status}
//             onChange={(e) => setFilters({ ...filters, status: e.target.value })}
//           >
//             <option value="">All Statuses</option>
//             <option value="new">New</option>
//             <option value="in_progress">In Progress</option>
//             <option value="converted">Converted</option>
//             <option value="lost">Lost</option>
//           </select>
//           <div className="text-sm text-gray-600 flex items-center">
//             Total: {filteredLeads?.length} leads
//           </div>
//         </div>
//       </div>

//       {/* Leads Table */}
//       {!hasLoaded || (loading && !leads?.length) ? (
//         <div className="flex items-center justify-center h-64">
//           <LoadingSpinner size="lg" />
//         </div>
//       ) : filteredLeads?.length ? (
//         <div className="bg-white rounded-lg shadow overflow-x-auto">
//           <table className="min-w-full bg-white border border-gray-200">
//             <thead className="bg-gray-50">
//               <tr>
//                 <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
//                   Student Name
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
//                   Status
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
//                   Source
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
//                   Study Preferences
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
//                   Language
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
//                   Created
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
//                   Actions
//                 </th>
//               </tr>
//             </thead>
//             <tbody>
//               {paginatedLeads?.map((lead, index) => (
//                 <tr
//                   key={lead.id}
//                   className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
//                 >
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                     <div className="font-medium text-gray-900">
//                       {lead.student?.name || "N/A"}
//                     </div>
//                     <div className="text-sm text-gray-500">
//                       {lead.student?.email || "N/A"}
//                     </div>
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                     <Badge className={getStatusColor(lead.status)}>
//                       {lead.status
//                         ? lead.status.replace("_", " ").toUpperCase()
//                         : "N/A"}
//                     </Badge>
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
//                     {lead.source || "N/A"}
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                     <div>
//                       Destination:{" "}
//                       {lead.studyPreferences?.destination || "Not Specified"}
//                     </div>
//                     <div>
//                       Level: {lead.studyPreferences?.level || "Not Specified"}
//                     </div>
//                     <div>
//                       Fields:{" "}
//                       {lead.studyPreferences?.fields?.length
//                         ? lead.studyPreferences.fields.join(", ")
//                         : "Not Specified"}
//                     </div>
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
//                     {lead.languagePreference || "N/A"}
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
//                     {lead.createdAt
//                       ? new Date(lead.createdAt).toLocaleDateString()
//                       : "N/A"}
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                     <div className="flex space-x-2">
//                       {/* <Link
//                         to={`/consultant/students/${lead.studentId}`}
//                         state={lead}
//                       > */}
//                       <Button
//                         size="sm"
//                         variant="outline"
//                         title="View Profile"
//                         onClick={() => handleViewProfile(lead)}
//                       >
//                         <Eye className="h-4 w-4" />
//                       </Button>
//                       {/* </Link> */}
//                       <Button
//                         size="sm"
//                         variant="outline"
//                         onClick={() => handleSelectLead(lead)}
//                         title="View Details"
//                       >
//                         <FileText className="h-4 w-4" />
//                       </Button>
//                       <Link
//                         to={`/consultant/students/${lead.studentId}/meetings`}
//                       >
//                         <Button
//                           size="sm"
//                           variant="outline"
//                           title="Schedule Meeting"
//                         >
//                           <Calendar className="h-4 w-4" />
//                         </Button>
//                       </Link>
//                     </div>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//           {/* Pagination */}
//           {totalPages > 1 && (
//             <div className="flex justify-between items-center p-4 border-t border-gray-200">
//               <Button
//                 variant="outline"
//                 size="sm"
//                 onClick={() => handlePageChange(currentPage - 1)}
//                 disabled={currentPage === 1}
//               >
//                 Previous
//               </Button>
//               <span className="text-sm text-gray-600">
//                 Page {currentPage} of {totalPages}
//               </span>
//               <Button
//                 variant="outline"
//                 size="sm"
//                 onClick={() => handlePageChange(currentPage + 1)}
//                 disabled={currentPage === totalPages}
//               >
//                 Next
//               </Button>
//             </div>
//           )}
//         </div>
//       ) : (
//         <div className="bg-white p-6 rounded-lg shadow text-center text-gray-500">
//           No leads found matching the current filters.
//         </div>
//       )}

//       {/* Lead Details Modal */}
//       <LeadStatusTaskAndDocumentModal
//         isOpen={isModalOpen}
//         onClose={handleCloseModal}
//         selectedLead={selectedLead}
//         tasks={tasks}
//         documents={documents}
//         fetchLeadTasks={fetchLeadTasks}
//         fetchLeadDocuments={fetchLeadDocuments}
//         updateLeadStatus={updateLeadStatus}
//         addConsultationNote={addConsultationNote}
//         setFollowUpTask={setFollowUpTask}
//         scheduleMeeting={scheduleMeeting}
//         updateTaskStatus={updateTaskStatus}
//         loading={loading}
//       />
//     </div>
//   );
// };

// export default MyLeads;
