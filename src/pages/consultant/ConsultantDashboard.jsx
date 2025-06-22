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
  { header: "Status", accessor: "status" },
  { header: "Source", accessor: "source" },
  {
    header: "Actions",
    accessor: (row) => (
      <Button
        variant="outline"
        size="sm"
        onClick={() => row.onSelectLead(row)}
        className="border-blue-200 text-blue-600 hover:bg-blue-200 transition-colors duration-200"
      >
        View
      </Button>
    ),
  },
];

// Custom Table Component
const CustomTable = ({ columns, data, onSelectLead }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-blue-200 rounded-lg">
        <thead className="bg-blue-50">
          <tr>
            {columns.map((column, index) => (
              <th
                key={index}
                className="px-6 py-3 text-left text-xs font-semibold text-blue-800 uppercase tracking-wider"
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
                className={rowIndex % 2 === 0 ? "bg-white" : "bg-blue-50"}
              >
                {columns.map((column, colIndex) => (
                  <td
                    key={colIndex}
                    className="px-6 py-4 whitespace-nowrap text-sm text-blue-800"
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
                className="px-6 py-8 text-center text-blue-600"
              >
                No data available.
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
    <div className="p-6 space-y-6 bg-white min-h-screen">

      {/* Metrics Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 bg-white border border-blue-200 rounded-lg">
          <div className="flex items-center space-x-3">
            <Users className="h-6 w-6 text-blue-500" />
            <div>
              <p className="text-xs font-medium text-blue-600">Total Leads</p>
              <p className="text-lg font-bold text-indigo-800">
                {leads?.length || 0}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-white border border-blue-200 rounded-lg">
          <div className="flex items-center space-x-3">
            <CheckSquare className="h-6 w-6 text-blue-500" />
            <div>
              <p className="text-xs font-medium text-blue-600">In Progress</p>
              <p className="text-lg font-bold text-indigo-800">
                {leads?.filter((lead) => lead.status === "in_progress")
                  ?.length || 0}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-white border border-blue-200 rounded-lg">
          <div className="flex items-center space-x-3">
            <FileText className="h-6 w-6 text-blue-500" />
            <div>
              <p className="text-xs font-medium text-blue-600">Converted</p>
              <p className="text-lg font-bold text-indigo-800">
                {leads?.filter((lead) => lead.status === "converted")?.length ||
                  0}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Leads Table */}
      <Card className="p-6 bg-white border border-blue-200 rounded-lg">
        <h2 className="text-xl font-semibold text-indigo-800 mb-4">My Leads</h2>
        {loading ? (
          <LoadingSpinner className="mx-auto h-8 w-8 text-blue-500" />
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
//         className="hover:bg-blue-50 transition-colors"
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
//       <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm">
//         <thead className="bg-gray-50">
//           <tr>
//             {columns.map((column, index) => (
//               <th
//                 key={index}
//                 className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
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
//                 className={rowIndex % 2 === 0 ? "bg-white" : "bg-gray-50"}
//               >
//                 {columns.map((column, colIndex) => (
//                   <td
//                     key={colIndex}
//                     className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
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
//                 className="px-6 py-8 text-center text-gray-500"
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
//     <div className="p-6 space-y-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
//       <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
//         Consultant Dashboard
//       </h1>

//       {/* Metrics Overview */}
//       <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
//         <Card className="p-4 bg-white shadow-md hover:shadow-lg transition-shadow rounded-lg">
//           <div className="flex items-center space-x-3">
//             <Users className="h-6 w-6 text-blue-600" />
//             <div>
//               <p className="text-xs font-medium text-gray-500">Total Leads</p>
//               <p className="text-lg font-bold text-gray-900">
//                 {leads?.length || 0}
//               </p>
//             </div>
//           </div>
//         </Card>
//         <Card className="p-4 bg-white shadow-md hover:shadow-lg transition-shadow rounded-lg">
//           <div className="flex items-center space-x-3">
//             <CheckSquare className="h-6 w-6 text-green-600" />
//             <div>
//               <p className="text-xs font-medium text-gray-500">In Progress</p>
//               <p className="text-lg font-bold text-gray-900">
//                 {leads?.filter((lead) => lead.status === "in_progress")
//                   ?.length || 0}
//               </p>
//             </div>
//           </div>
//         </Card>
//         <Card className="p-4 bg-white shadow-md hover:shadow-lg transition-shadow rounded-lg">
//           <div className="flex items-center space-x-3">
//             <FileText className="h-6 w-6 text-purple-600" />
//             <div>
//               <p className="text-xs font-medium text-gray-500">Converted</p>
//               <p className="text-lg font-bold text-gray-900">
//                 {leads?.filter((lead) => lead.status === "converted")?.length ||
//                   0}
//               </p>
//             </div>
//           </div>
//         </Card>
//       </div>

//       {/* Leads Table */}
//       <Card className="p-6 bg-white shadow-md rounded-lg">
//         <h2 className="text-xl font-semibold text-gray-800 mb-4">My Leads</h2>
//         {loading ? (
//           <LoadingSpinner className="mx-auto h-8 w-8 text-blue-600" />
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
