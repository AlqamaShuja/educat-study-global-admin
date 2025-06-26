import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { Users, CheckSquare, FileText } from "lucide-react";
import useConsultantStore from "../../stores/consultantStore";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import LeadStatusTaskAndDocumentModal from "../../components/consultant/LeadStatusTakAndDocumentModal";

// Lead table columns
const leadColumns = [
  { header: "Student Name", accessor: (row) => row.student?.name || "N/A" },
  { header: "Email", accessor: (row) => row.student?.email || "N/A" },
  {
    header: "Status",
    accessor: (row) => (
      <span
        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium capitalize
      ${
        row.status === "in_progress"
          ? "bg-blue-100 text-blue-800"
          : row.status === "converted"
          ? "bg-green-100 text-green-800"
          : "bg-gray-100 text-gray-800"
      }`}
      >
        {row.status.replace("_", " ")}
      </span>
    ),
  },
  { header: "Source", accessor: "source" },
  {
    header: "Actions",
    accessor: (row) => (
      <Button
        variant="outline"
        size="sm"
        onClick={() => row.onSelectLead(row)}
        className="border-blue-500 text-blue-600 hover:bg-blue-50 hover:border-blue-600 transition-colors duration-200 font-medium"
      >
        View Details
      </Button>
    ),
  },
];

// Custom Table Component
const CustomTable = ({ columns, data, onSelectLead }) => {
  return (
    <div className="overflow-x-auto rounded-lg shadow-sm">
      <table className="min-w-full bg-white border border-gray-200 rounded-lg">
        <thead className="bg-gradient-to-r from-blue-50 to-indigo-50">
          <tr>
            {columns.map((column, index) => (
              <th
                key={index}
                className="px-6 py-4 text-left text-xs font-semibold text-indigo-900 uppercase tracking-wider"
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data?.length ? (
            data.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className={`transition-colors hover:bg-gray-50 ${
                  rowIndex % 2 === 0 ? "bg-white" : "bg-gray-50"
                }`}
              >
                {columns.map((column, colIndex) => (
                  <td
                    key={colIndex}
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                  >
                    {typeof column.accessor === "function"
                      ? column.accessor({ ...row, onSelectLead })
                      : row[column.accessor] || "N/A"}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={columns.length}
                className="px-6 py-8 text-center text-gray-500"
              >
                <div className="flex flex-col items-center gap-2">
                  <Users className="h-8 w-8 text-gray-400" />
                  <p>No leads available.</p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

function ConsultantDashboard() {
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
    addConsultationNote,
    setFollowUpTask,
    scheduleMeeting,
    updateTaskStatus,
    loading,
  } = useConsultantStore();

  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  useEffect(() => {
    if (selectedLead?.id) {
      fetchLeadTasks(selectedLead.id);
      fetchLeadDocuments(selectedLead.id);
    }
  }, [selectedLead, fetchLeadTasks, fetchLeadDocuments]);

  const handleSelectLead = (lead) => {
    const enrichedHistory =
      lead.history?.map((entry) => ({
        ...entry,
        userRole:
          entry.userId === lead.studentId
            ? "Student"
            : entry.userId === lead.assignedConsultant
            ? "Consultant"
            : entry.userId === "201745bd-7c96-4360-9f01-776729d63de9"
            ? "Manager"
            : "Admin",
      })) || [];
    selectLead({ ...lead, history: enrichedHistory });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    clearSelectedLead();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-100 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Consultant Dashboard
            </h1>
            <p className="mt-2 text-gray-600">
              Manage your leads, tasks, and documents efficiently
            </p>
          </div>
          <Button
            onClick={() => fetchLeads()}
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-md"
          >
            {loading ? (
              <LoadingSpinner className="h-4 w-4 text-white" />
            ) : (
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 4v5h5m11 0h-5m-6 6v5h5m-11 0h5"
                />
              </svg>
            )}
            Refresh Leads
          </Button>
        </div>

        {/* Metrics Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            {
              label: "Total Leads",
              value: leads?.length || 0,
              icon: Users,
              bgColor: "bg-gradient-to-br from-blue-500 to-indigo-600",
            },
            {
              label: "In Progress",
              value:
                leads?.filter((lead) => lead.status === "in_progress")
                  ?.length || 0,
              icon: CheckSquare,
              bgColor: "bg-gradient-to-br from-blue-400 to-blue-600",
            },
            {
              label: "Converted",
              value:
                leads?.filter((lead) => lead.status === "converted")?.length ||
                0,
              icon: FileText,
              bgColor: "bg-gradient-to-br from-green-400 to-green-600",
            },
          ].map((metric) => (
            <Card
              key={metric.label}
              className={`p-6 ${metric.bgColor} text-white rounded-xl shadow-lg transform hover:scale-105 transition-transform duration-200`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium opacity-90">
                    {metric.label}
                  </p>
                  <p className="text-2xl font-bold mt-1">{metric.value}</p>
                </div>
                <metric.icon className="h-8 w-8 opacity-80" />
              </div>
            </Card>
          ))}
        </div>

        {/* Leads Table */}
        <Card className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Users className="h-5 w-5 text-indigo-600" />
              My Leads
            </h2>
            <div className="relative w-64">
              <svg
                className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                placeholder="Search leads..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                onChange={(e) => {
                  // Add search functionality if needed
                }}
              />
            </div>
          </div>
          {loading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner className="h-10 w-10 text-indigo-600" />
            </div>
          ) : (
            <CustomTable
              columns={leadColumns}
              data={leads}
              onSelectLead={handleSelectLead}
            />
          )}
        </Card>

        {/* Modal for Lead Details and Actions */}
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
      </div>
    </div>
  );
}

export default ConsultantDashboard;

// import { useState, useEffect } from "react";
// import { toast } from "react-toastify";
// import { Users, CheckSquare, FileText } from "lucide-react";
// import useConsultantStore from "../../stores/consultantStore";
// import Button from "../../components/ui/Button";
// import Card from "../../components/ui/Card";
// import LoadingSpinner from "../../components/ui/LoadingSpinner";
// import LeadStatusTaskAndDocumentModal from "../../components/consultant/LeadStatusTakAndDocumentModal";

// // Lead table columns
// const leadColumns = [
//   { header: "Student Name", accessor: (row) => row.student?.name || "N/A" },
//   { header: "Email", accessor: (row) => row.student?.email || "N/A" },
//   { header: "Status", accessor: "status" },
//   { header: "Source", accessor: "source" },
//   {
//     header: "Actions",
//     accessor: (row) => (
//       <Button
//         variant="outline"
//         size="sm"
//         onClick={() => row.onSelectLead(row)}
//         className="border-blue-200 text-blue-600 hover:bg-blue-200 transition-colors duration-200"
//       >
//         View
//       </Button>
//     ),
//   },
// ];

// // Custom Table Component
// const CustomTable = ({ columns, data, onSelectLead }) => {
//   return (
//     <div className="overflow-x-auto">
//       <table className="min-w-full bg-white border border-blue-200 rounded-lg">
//         <thead className="bg-blue-50">
//           <tr>
//             {columns.map((column, index) => (
//               <th
//                 key={index}
//                 className="px-6 py-3 text-left text-xs font-semibold text-blue-800 uppercase tracking-wider"
//               >
//                 {column.header}
//               </th>
//             ))}
//           </tr>
//         </thead>
//         <tbody>
//           {data?.length ? (
//             data.map((row, rowIndex) => (
//               <tr
//                 key={rowIndex}
//                 className={rowIndex % 2 === 0 ? "bg-white" : "bg-blue-50"}
//               >
//                 {columns.map((column, colIndex) => (
//                   <td
//                     key={colIndex}
//                     className="px-6 py-4 whitespace-nowrap text-sm text-blue-800"
//                   >
//                     {typeof column.accessor === "function"
//                       ? column.accessor({ ...row, onSelectLead })
//                       : row[column.accessor] || "N/A"}
//                   </td>
//                 ))}
//               </tr>
//             ))
//           ) : (
//             <tr>
//               <td
//                 colSpan={columns.length}
//                 className="px-6 py-8 text-center text-blue-600"
//               >
//                 No data available.
//               </td>
//             </tr>
//           )}
//         </tbody>
//       </table>
//     </div>
//   );
// };

// function ConsultantDashboard() {
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
//   } = useConsultantStore();

//   const [isModalOpen, setIsModalOpen] = useState(false);

//   useEffect(() => {
//     fetchLeads();
//   }, [fetchLeads]);

//   useEffect(() => {
//     if (selectedLead?.id) {
//       fetchLeadTasks(selectedLead.id);
//       fetchLeadDocuments(selectedLead.id);
//     }
//   }, [selectedLead, fetchLeadTasks, fetchLeadDocuments]);

//   const handleSelectLead = (lead) => {
//     const enrichedHistory =
//       lead.history?.map((entry) => ({
//         ...entry,
//         userRole:
//           entry.userId === lead.studentId
//             ? "Student"
//             : entry.userId === lead.assignedConsultant
//             ? "Consultant"
//             : entry.userId === "201745bd-7c96-4360-9f01-776729d63de9"
//             ? "Manager"
//             : "Admin",
//       })) || [];
//     selectLead({ ...lead, history: enrichedHistory });
//     setIsModalOpen(true);
//   };

//   const handleCloseModal = () => {
//     setIsModalOpen(false);
//     clearSelectedLead();
//   };

//   return (
//     <div className="p-6 space-y-6 bg-white min-h-screen">

//       {/* Metrics Overview */}
//       <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
//         <Card className="p-4 bg-white border border-blue-200 rounded-lg">
//           <div className="flex items-center space-x-3">
//             <Users className="h-6 w-6 text-blue-500" />
//             <div>
//               <p className="text-xs font-medium text-blue-600">Total Leads</p>
//               <p className="text-lg font-bold text-indigo-800">
//                 {leads?.length || 0}
//               </p>
//             </div>
//           </div>
//         </Card>
//         <Card className="p-4 bg-white border border-blue-200 rounded-lg">
//           <div className="flex items-center space-x-3">
//             <CheckSquare className="h-6 w-6 text-blue-500" />
//             <div>
//               <p className="text-xs font-medium text-blue-600">In Progress</p>
//               <p className="text-lg font-bold text-indigo-800">
//                 {leads?.filter((lead) => lead.status === "in_progress")
//                   ?.length || 0}
//               </p>
//             </div>
//           </div>
//         </Card>
//         <Card className="p-4 bg-white border border-blue-200 rounded-lg">
//           <div className="flex items-center space-x-3">
//             <FileText className="h-6 w-6 text-blue-500" />
//             <div>
//               <p className="text-xs font-medium text-blue-600">Converted</p>
//               <p className="text-lg font-bold text-indigo-800">
//                 {leads?.filter((lead) => lead.status === "converted")?.length ||
//                   0}
//               </p>
//             </div>
//           </div>
//         </Card>
//       </div>

//       {/* Leads Table */}
//       <Card className="p-6 bg-white border border-blue-200 rounded-lg">
//         <h2 className="text-xl font-semibold text-indigo-800 mb-4">My Leads</h2>
//         {loading ? (
//           <LoadingSpinner className="mx-auto h-8 w-8 text-blue-500" />
//         ) : (
//           <CustomTable
//             columns={leadColumns}
//             data={leads}
//             onSelectLead={handleSelectLead}
//           />
//         )}
//       </Card>

//       {/* Modal for Lead Details and Actions */}
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
// }

// export default ConsultantDashboard;
