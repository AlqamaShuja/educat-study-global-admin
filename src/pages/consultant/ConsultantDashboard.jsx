import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { Users, CheckSquare, FileText } from "lucide-react";
import useConsultantStore from "../../stores/consultantStore";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import LeadStatusTaskAndDocumentModal from "../../components/consultant/LeadStatusTakAndDocumentModal";
import "react-toastify/dist/ReactToastify.css";

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
        className="hover:bg-blue-50 transition-colors"
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
      <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column, index) => (
              <th
                key={index}
                className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
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
                className={rowIndex % 2 === 0 ? "bg-white" : "bg-gray-50"}
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
    <div className="p-6 space-y-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
        Consultant Dashboard
      </h1>

      {/* Metrics Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 bg-white shadow-md hover:shadow-lg transition-shadow rounded-lg">
          <div className="flex items-center space-x-3">
            <Users className="h-6 w-6 text-blue-600" />
            <div>
              <p className="text-xs font-medium text-gray-500">Total Leads</p>
              <p className="text-lg font-bold text-gray-900">
                {leads?.length || 0}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-white shadow-md hover:shadow-lg transition-shadow rounded-lg">
          <div className="flex items-center space-x-3">
            <CheckSquare className="h-6 w-6 text-green-600" />
            <div>
              <p className="text-xs font-medium text-gray-500">In Progress</p>
              <p className="text-lg font-bold text-gray-900">
                {leads?.filter((lead) => lead.status === "in_progress")
                  ?.length || 0}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-white shadow-md hover:shadow-lg transition-shadow rounded-lg">
          <div className="flex items-center space-x-3">
            <FileText className="h-6 w-6 text-purple-600" />
            <div>
              <p className="text-xs font-medium text-gray-500">Converted</p>
              <p className="text-lg font-bold text-gray-900">
                {leads?.filter((lead) => lead.status === "converted")?.length ||
                  0}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Leads Table */}
      <Card className="p-6 bg-white shadow-md rounded-lg">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">My Leads</h2>
        {loading ? (
          <LoadingSpinner className="mx-auto h-8 w-8 text-blue-600" />
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
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import * as z from "zod";
// import { format } from "date-fns";
// import {
//   Calendar,
//   FileText,
//   MessageSquare,
//   CheckSquare,
//   Users,
//   File,
// } from "lucide-react";
// import { toast } from "react-toastify";
// import useConsultantStore from "../../stores/consultantStore";
// import Button from "../../components/ui/Button";
// import Card from "../../components/ui/Card";
// import Modal from "../../components/ui/Modal";
// import Tabs from "../../components/ui/Tabs";
// import LoadingSpinner from "../../components/ui/LoadingSpinner";
// import "react-toastify/dist/ReactToastify.css";

// // Schemas for forms
// const statusSchema = z.object({
//   status: z.enum(["new", "in_progress", "converted", "lost"]),
// });

// const noteSchema = z.object({
//   note: z.string().min(1, "Note is required"),
// });

// const meetingSchema = z.object({
//   dateTime: z.string().refine((val) => !isNaN(Date.parse(val)), {
//     message: "Invalid date format",
//   }),
//   type: z.enum(["in_person", "virtual"]),
// });

// const taskSchema = z.object({
//   description: z.string().min(1, "Task description is required"),
//   dueDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
//     message: "Invalid date format",
//   }),
// });

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

// // Task table columns
// const taskColumns = [
//   { header: "Description", accessor: "description" },
//   {
//     header: "Due Date",
//     accessor: (row) => format(new Date(row.dueDate), "PPP"),
//   },
//   { header: "Status", accessor: "status" },
// ];

// // Document table columns
// const documentColumns = [
//   { header: "Type", accessor: "type" },
//   { header: "Notes", accessor: "notes" },
//   {
//     header: "Uploaded At",
//     accessor: (row) => format(new Date(row.uploadedAt), "PPP"),
//   },
// ];

// // History table columns
// const historyColumns = [
//   { header: "Action/Note", accessor: (row) => row.note || row.action },
//   { header: "User", accessor: (row) => row.userRole },
//   {
//     header: "Timestamp",
//     accessor: (row) => format(new Date(row.timestamp), "PPP p"),
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
//     loading,
//   } = useConsultantStore();

//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [modalType, setModalType] = useState(null);

//   const statusForm = useForm({
//     resolver: zodResolver(statusSchema),
//     defaultValues: { status: "new" },
//   });

//   const noteForm = useForm({
//     resolver: zodResolver(noteSchema),
//     defaultValues: { note: "" },
//   });

//   const meetingForm = useForm({
//     resolver: zodResolver(meetingSchema),
//     defaultValues: { dateTime: "", type: "virtual" },
//   });

//   const taskForm = useForm({
//     resolver: zodResolver(taskSchema),
//     defaultValues: { description: "", dueDate: "" },
//   });

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
//     setModalType(null); // Show lead details by default
//   };

//   const handleCloseModal = () => {
//     setIsModalOpen(false);
//     setModalType(null);
//     statusForm.reset();
//     noteForm.reset();
//     meetingForm.reset();
//     taskForm.reset();
//     clearSelectedLead();
//   };

//   const handleStatusUpdate = async (data) => {
//     try {
//       await updateLeadStatus(selectedLead.id, data.status);
//       toast.success(`Status updated for ${selectedLead.student?.name}`);
//       handleCloseModal();
//     } catch (error) {
//       toast.error("Failed to update lead status");
//     }
//   };

//   const handleAddNote = async (data) => {
//     try {
//       await addConsultationNote(selectedLead.id, data.note);
//       toast.success(`Note added for ${selectedLead.student?.name}`);
//       handleCloseModal();
//     } catch (error) {
//       toast.error("Failed to add note");
//     }
//   };

//   const handleScheduleMeeting = async (data) => {
//     try {
//       await scheduleMeeting(selectedLead.studentId, data);
//       toast.success(`Meeting scheduled with ${selectedLead.student?.name}`);
//       handleCloseModal();
//     } catch (error) {
//       toast.error("Failed to schedule meeting");
//     }
//   };

//   const handleAddTask = async (data) => {
//     try {
//       await setFollowUpTask(selectedLead.id, data);
//       toast.success(`Task added for ${selectedLead.student?.name}`);
//       handleCloseModal();
//     } catch (error) {
//       toast.error("Failed to add task");
//     }
//   };

//   const openModal = (type) => {
//     setModalType(type);
//   };

//   const renderModalContent = () => {
//     if (!selectedLead) return null;

//     switch (modalType) {
//       case "status":
//         return (
//           <form
//             onSubmit={statusForm.handleSubmit(handleStatusUpdate)}
//             className="space-y-4"
//           >
//             <h3 className="text-lg font-semibold text-gray-800">
//               Update Status
//             </h3>
//             <select
//               {...statusForm.register("status")}
//               className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
//             >
//               <option value="new">New</option>
//               <option value="in_progress">In Progress</option>
//               <option value="converted">Converted</option>
//               <option value="lost">Lost</option>
//             </select>
//             <div className="flex space-x-2">
//               <Button
//                 type="submit"
//                 className="bg-blue-600 hover:bg-blue-700 text-white"
//               >
//                 Update
//               </Button>
//               <Button variant="outline" onClick={() => setModalType(null)}>
//                 Cancel
//               </Button>
//             </div>
//           </form>
//         );
//       case "note":
//         return (
//           <form
//             onSubmit={noteForm.handleSubmit(handleAddNote)}
//             className="space-y-4"
//           >
//             <h3 className="text-lg font-semibold text-gray-800">Add Note</h3>
//             <textarea
//               {...noteForm.register("note")}
//               className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
//               placeholder="Enter consultation note"
//               rows={4}
//             />
//             <div className="flex space-x-2">
//               <Button
//                 type="submit"
//                 className="bg-blue-600 hover:bg-blue-700 text-white"
//               >
//                 Add Note
//               </Button>
//               <Button variant="outline" onClick={() => setModalType(null)}>
//                 Cancel
//               </Button>
//             </div>
//           </form>
//         );
//       case "meeting":
//         return (
//           <form
//             onSubmit={meetingForm.handleSubmit(handleScheduleMeeting)}
//             className="space-y-4"
//           >
//             <h3 className="text-lg font-semibold text-gray-800">
//               Schedule Meeting
//             </h3>
//             <input
//               type="datetime-local"
//               {...meetingForm.register("dateTime")}
//               className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
//             />
//             <select
//               {...meetingForm.register("type")}
//               className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
//             >
//               <option value="virtual">Virtual</option>
//               <option value="in_person">In Person</option>
//             </select>
//             <div className="flex space-x-2">
//               <Button
//                 type="submit"
//                 className="bg-blue-600 hover:bg-blue-700 text-white"
//               >
//                 Schedule
//               </Button>
//               <Button variant="outline" onClick={() => setModalType(null)}>
//                 Cancel
//               </Button>
//             </div>
//           </form>
//         );
//       case "task":
//         return (
//           <form
//             onSubmit={taskForm.handleSubmit(handleAddTask)}
//             className="space-y-4"
//           >
//             <h3 className="text-lg font-semibold text-gray-800">Add Task</h3>
//             <input
//               type="text"
//               {...taskForm.register("description")}
//               className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
//               placeholder="Task description"
//             />
//             <input
//               type="datetime-local"
//               {...taskForm.register("dueDate")}
//               className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
//             />
//             <div className="flex space-x-2">
//               <Button
//                 type="submit"
//                 className="bg-blue-600 hover:bg-blue-700 text-white"
//               >
//                 Add Task
//               </Button>
//               <Button variant="outline" onClick={() => setModalType(null)}>
//                 Cancel
//               </Button>
//             </div>
//           </form>
//         );
//       default:
//         return (
//           <div className="space-y-6">
//             <div>
//               <h3 className="text-lg font-semibold text-gray-800">
//                 Lead Details
//               </h3>
//               <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
//                 <div>
//                   <p className="text-sm text-gray-500">Name</p>
//                   <p className="text-gray-900">
//                     {selectedLead.student?.name || "N/A"}
//                   </p>
//                 </div>
//                 <div>
//                   <p className="text-sm text-gray-500">Email</p>
//                   <p className="text-gray-900">
//                     {selectedLead.student?.email || "N/A"}
//                   </p>
//                 </div>
//                 <div>
//                   <p className="text-sm text-gray-500">Phone</p>
//                   <p className="text-gray-900">
//                     {selectedLead.student?.phone || "N/A"}
//                   </p>
//                 </div>
//                 <div>
//                   <p className="text-sm text-gray-500">Status</p>
//                   <p className="text-gray-900 capitalize">
//                     {selectedLead.status || "N/A"}
//                   </p>
//                 </div>
//                 <div>
//                   <p className="text-sm text-gray-500">Source</p>
//                   <p className="text-gray-900 capitalize">
//                     {selectedLead.source || "N/A"}
//                   </p>
//                 </div>
//                 <div>
//                   <p className="text-sm text-gray-500">Language Preference</p>
//                   <p className="text-gray-900 capitalize">
//                     {selectedLead.languagePreference || "N/A"}
//                   </p>
//                 </div>
//                 <div>
//                   <p className="text-sm text-gray-500">Study Preferences</p>
//                   <p className="text-gray-900">
//                     {selectedLead.studyPreferences?.level || "N/A"}
//                     {selectedLead.studyPreferences?.fields?.length
//                       ? `, ${selectedLead.studyPreferences.fields.join(", ")}`
//                       : ""}
//                     {selectedLead.studyPreferences?.destination
//                       ? ` in ${selectedLead.studyPreferences.destination}`
//                       : ""}
//                   </p>
//                 </div>
//                 <div>
//                   <p className="text-sm text-gray-500">Created At</p>
//                   <p className="text-gray-900">
//                     {format(new Date(selectedLead.createdAt), "PPP")}
//                   </p>
//                 </div>
//               </div>
//             </div>
//             <Tabs defaultTab={0} className="space-y-4">
//               <Tabs.Panel label="Tasks">
//                 <div className="space-y-4">
//                   {loading ? (
//                     <LoadingSpinner className="mx-auto h-8 w-8 text-blue-600" />
//                   ) : (
//                     <CustomTable columns={taskColumns} data={tasks} />
//                   )}
//                   <Button
//                     onClick={() => openModal("task")}
//                     className="bg-blue-600 hover:bg-blue-700 text-white transition-colors"
//                   >
//                     Add Task
//                   </Button>
//                 </div>
//               </Tabs.Panel>
//               <Tabs.Panel label="Documents">
//                 <div className="space-y-4">
//                   {loading ? (
//                     <LoadingSpinner className="mx-auto h-8 w-8 text-blue-600" />
//                   ) : (
//                     <CustomTable columns={documentColumns} data={documents} />
//                   )}
//                 </div>
//               </Tabs.Panel>
//               <Tabs.Panel label="History">
//                 <div className="space-y-4">
//                   <CustomTable
//                     columns={historyColumns}
//                     data={selectedLead.history}
//                   />
//                 </div>
//               </Tabs.Panel>
//             </Tabs>
//             <div className="flex flex-wrap gap-4">
//               <Button
//                 onClick={() => openModal("status")}
//                 className="bg-blue-600 hover:bg-blue-700 text-white transition-colors"
//               >
//                 Update Status
//               </Button>
//               <Button
//                 onClick={() => openModal("note")}
//                 className="bg-blue-600 hover:bg-blue-700 text-white transition-colors"
//               >
//                 Add Note
//               </Button>
//               <Button
//                 onClick={() => openModal("meeting")}
//                 className="bg-blue-600 hover:bg-blue-700 text-white transition-colors"
//               >
//                 Schedule Meeting
//               </Button>
//             </div>
//           </div>
//         );
//     }
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
//       <Modal
//         isOpen={isModalOpen}
//         onClose={handleCloseModal}
//         title={
//           selectedLead
//             ? `${selectedLead.student?.name}'s Details`
//             : "Lead Details"
//         }
//         className="max-w-4xl mx-auto bg-white rounded-xl shadow-2xl"
//       >
//         {renderModalContent()}
//       </Modal>
//     </div>
//   );
// }

// export default ConsultantDashboard;

// // pages/consultant/ConsultantDashboard.jsx
// import React, { useState, useEffect } from "react";
// import useAuthStore from "../../stores/authStore";
// import useApi from "../../hooks/useApi";
// import StatsCard from "../../components/widgets/StatsCard";
// import RecentActivity from "../../components/widgets/RecentActivity";
// import QuickActions from "../../components/widgets/QuickActions";
// import TaskList from "../../components/widgets/TaskList";
// import LoadingSpinner from "../../components/ui/LoadingSpinner";
// import { Users, CheckCircle, Clock, TrendingUp } from "lucide-react";

// const ConsultantDashboard = () => {
//   const { user } = useAuthStore();
//   const { request, loading } = useApi();
//   const [dashboardData, setDashboardData] = useState({
//     leads: [],
//     appointments: [],
//     tasks: [],
//     stats: {
//       totalLeads: 0,
//       activeLeads: 0,
//       completedTasks: 0,
//       upcomingAppointments: 0,
//     },
//   });

//   useEffect(() => {
//     fetchDashboardData();
//   }, []);

//   const fetchDashboardData = async () => {
//     try {
//       const [leadsResponse, appointmentsResponse] = await Promise.all([
//         request("/consultant/leads"),
//         request("/consultant/appointments"),
//       ]);

//       const leads = leadsResponse.data || [];
//       const appointments = appointmentsResponse.data || [];

//       const stats = {
//         totalLeads: leads.length,
//         activeLeads: leads.filter((lead) => lead.status === "in_progress")
//           .length,
//         completedTasks: 0, // This would come from a tasks endpoint
//         upcomingAppointments: appointments.filter(
//           (apt) => new Date(apt.dateTime) > new Date()
//         ).length,
//       };

//       setDashboardData({
//         leads,
//         appointments,
//         tasks: [], // This would come from a tasks endpoint
//         stats,
//       });
//     } catch (error) {
//       console.error("Error fetching dashboard data:", error);
//     }
//   };

//   const quickActions = [
//     {
//       title: "View My Leads",
//       description: "Manage assigned leads",
//       icon: Users,
//       href: "/consultant/my-leads",
//       color: "bg-blue-500",
//     },
//     {
//       title: "Schedule Meeting",
//       description: "Book new appointment",
//       icon: Clock,
//       href: "/consultant/meeting-scheduler",
//       color: "bg-green-500",
//     },
//     {
//       title: "Student Profiles",
//       description: "Review student information",
//       icon: CheckCircle,
//       href: "/consultant/student-profiles",
//       color: "bg-purple-500",
//     },
//     {
//       title: "Communication",
//       description: "Message students",
//       icon: TrendingUp,
//       href: "/consultant/communication-history",
//       color: "bg-orange-500",
//     },
//   ];

//   const recentActivities = dashboardData.leads.slice(0, 5).map((lead) => ({
//     id: lead.id,
//     title: `Lead updated: ${lead.student?.name || "Unknown"}`,
//     description: `Status changed to ${lead.status}`,
//     time: lead.updatedAt,
//     type: "lead",
//   }));

//   const upcomingTasks = [
//     ...dashboardData.appointments
//       .filter((apt) => new Date(apt.dateTime) > new Date())
//       .slice(0, 3)
//       .map((apt) => ({
//         id: apt.id,
//         title: `Meeting with ${apt.student?.name || "Student"}`,
//         dueDate: apt.dateTime,
//         priority: "high",
//         status: "pending",
//       })),
//   ];

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center h-64">
//         <LoadingSpinner size="lg" />
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       {/* Welcome Header */}
//       <div className="bg-white rounded-lg shadow p-6">
//         <h1 className="text-2xl font-bold text-gray-900">
//           Welcome back, {user?.name}!
//         </h1>
//         <p className="text-gray-600 mt-1">
//           Here's what's happening with your students today.
//         </p>
//       </div>

//       {/* Stats Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//         <StatsCard
//           title="Total Leads"
//           value={dashboardData.stats.totalLeads}
//           icon={Users}
//           trend={{ value: 12, isPositive: true }}
//           color="blue"
//         />
//         <StatsCard
//           title="Active Leads"
//           value={dashboardData.stats.activeLeads}
//           icon={TrendingUp}
//           trend={{ value: 8, isPositive: true }}
//           color="green"
//         />
//         <StatsCard
//           title="Upcoming Meetings"
//           value={dashboardData.stats.upcomingAppointments}
//           icon={Clock}
//           trend={{ value: 3, isPositive: false }}
//           color="purple"
//         />
//         <StatsCard
//           title="Completed Tasks"
//           value={dashboardData.stats.completedTasks}
//           icon={CheckCircle}
//           trend={{ value: 15, isPositive: true }}
//           color="orange"
//         />
//       </div>

//       {/* Main Content Grid */}
//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//         {/* Quick Actions */}
//         <div className="lg:col-span-2">
//           <QuickActions actions={quickActions} />
//         </div>

//         {/* Task List */}
//         <div>
//           <TaskList
//             tasks={upcomingTasks}
//             title="Upcoming Tasks"
//             onTaskClick={(task) => {
//               // Handle task click
//               console.log("Task clicked:", task);
//             }}
//           />
//         </div>
//       </div>

//       {/* Recent Activity */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         <RecentActivity
//           activities={recentActivities}
//           title="Recent Lead Activities"
//         />

//         {/* Today's Schedule */}
//         <div className="bg-white rounded-lg shadow">
//           <div className="p-6 border-b border-gray-200">
//             <h3 className="text-lg font-semibold text-gray-900">
//               Today's Schedule
//             </h3>
//           </div>
//           <div className="p-6">
//             {dashboardData.appointments.filter((apt) => {
//               const aptDate = new Date(apt.dateTime);
//               const today = new Date();
//               return aptDate.toDateString() === today.toDateString();
//             }).length === 0 ? (
//               <p className="text-gray-500 text-center py-4">
//                 No appointments scheduled for today
//               </p>
//             ) : (
//               <div className="space-y-3">
//                 {dashboardData.appointments
//                   .filter((apt) => {
//                     const aptDate = new Date(apt.dateTime);
//                     const today = new Date();
//                     return aptDate.toDateString() === today.toDateString();
//                   })
//                   .map((apt) => (
//                     <div
//                       key={apt.id}
//                       className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
//                     >
//                       <div>
//                         <p className="font-medium text-gray-900">
//                           {apt.student?.name || "Student"}
//                         </p>
//                         <p className="text-sm text-gray-600">
//                           {new Date(apt.dateTime).toLocaleTimeString([], {
//                             hour: "2-digit",
//                             minute: "2-digit",
//                           })}
//                         </p>
//                       </div>
//                       <span
//                         className={`px-2 py-1 rounded-full text-xs font-medium ${
//                           apt.type === "virtual"
//                             ? "bg-blue-100 text-blue-800"
//                             : "bg-green-100 text-green-800"
//                         }`}
//                       >
//                         {apt.type}
//                       </span>
//                     </div>
//                   ))}
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ConsultantDashboard;

// import React, { useState, useEffect } from "react";
// import {
//   Users,
//   Calendar,
//   FileText,
//   TrendingUp,
//   Clock,
//   CheckCircle,
//   AlertCircle,
//   MessageCircle,
//   Plus,
//   Eye,
//   Filter,
//   Download,
// } from "lucide-react";
// import { useAuthStore } from "../../stores/authStore";
// import { useLeadStore } from "../../stores/leadStore";
// import { useAppointmentStore } from "../../stores/appointmentStore";
// import StatsCard from "../../components/widgets/StatsCard";
// import RecentActivity from "../../components/widgets/RecentActivity";
// import QuickActions from "../../components/widgets/QuickActions";
// import ProgressTracker from "../../components/widgets/ProgressTracker";
// import TaskList from "../../components/widgets/TaskList";
// import LineChart from "../../components/charts/LineChart";
// import PieChart from "../../components/charts/PieChart";
// import Card from "../../components/ui/Card";
// import Button from "../../components/ui/Button";
// import Badge from "../../components/ui/Badge";

// const ConsultantDashboard = () => {
//   const { user } = useAuthStore();
//   const {
//     leads,
//     myLeads,
//     isLoading: leadsLoading,
//     fetchMyLeads,
//     getLeadStats,
//   } = useLeadStore();
//   const {
//     appointments,
//     todayAppointments,
//     isLoading: appointmentsLoading,
//     fetchMyAppointments,
//   } = useAppointmentStore();

//   const [selectedPeriod, setSelectedPeriod] = useState("week");
//   const [dashboardData, setDashboardData] = useState({
//     totalStudents: 0,
//     activeApplications: 0,
//     upcomingAppointments: 0,
//     completedTasks: 0,
//     conversionRate: 0,
//     responseTime: "2.5 hours",
//   });

//   useEffect(() => {
//     fetchMyLeads();
//     fetchMyAppointments();
//   }, [fetchMyLeads, fetchMyAppointments]);

//   useEffect(() => {
//     // Calculate dashboard metrics
//     const stats = getLeadStats(user?.id);
//     setDashboardData((prev) => ({
//       ...prev,
//       totalStudents: myLeads?.length || 0,
//       activeApplications:
//         myLeads?.filter((lead) => lead.status === "in_progress")?.length || 0,
//       upcomingAppointments: todayAppointments?.length || 0,
//       conversionRate: stats?.conversionRate || 0,
//     }));
//   }, [myLeads, todayAppointments, user?.id, getLeadStats]);

//   // Sample data for charts
//   const performanceData = [
//     { date: "2024-01-01", leads: 12, appointments: 8, conversions: 3 },
//     { date: "2024-01-02", leads: 15, appointments: 12, conversions: 5 },
//     { date: "2024-01-03", leads: 18, appointments: 14, conversions: 4 },
//     { date: "2024-01-04", leads: 22, appointments: 16, conversions: 6 },
//     { date: "2024-01-05", leads: 20, appointments: 18, conversions: 8 },
//     { date: "2024-01-06", leads: 25, appointments: 20, conversions: 7 },
//     { date: "2024-01-07", leads: 28, appointments: 22, conversions: 9 },
//   ];

//   const leadStatusData = [
//     { name: "New", value: 15, color: "#3B82F6" },
//     { name: "In Progress", value: 25, color: "#F59E0B" },
//     { name: "Converted", value: 12, color: "#10B981" },
//     { name: "Lost", value: 8, color: "#EF4444" },
//   ];

//   const recentActivities = [
//     {
//       id: 1,
//       type: "appointment_completed",
//       title: "Consultation completed",
//       description: "Meeting with Sarah Johnson about UK universities",
//       user: { name: "Sarah Johnson", avatar: null },
//       timestamp: "2024-01-15T10:30:00Z",
//       metadata: { duration: "45 minutes" },
//     },
//     {
//       id: 2,
//       type: "document_uploaded",
//       title: "Document received",
//       description: "IELTS certificate uploaded by Mike Chen",
//       user: { name: "Mike Chen", avatar: null },
//       timestamp: "2024-01-15T09:15:00Z",
//       metadata: { fileName: "IELTS_Certificate.pdf" },
//     },
//     {
//       id: 3,
//       type: "lead_assigned",
//       title: "New lead assigned",
//       description: "Emma Wilson interested in Canadian programs",
//       user: { name: "Emma Wilson", avatar: null },
//       timestamp: "2024-01-15T08:45:00Z",
//     },
//   ];

//   const quickActions = [
//     {
//       id: "book_appointment",
//       title: "Book Appointment",
//       description: "Schedule meeting with student",
//       icon: Calendar,
//       color: "blue",
//       category: "appointments",
//       shortcut: "Ctrl+Shift+A",
//     },
//     {
//       id: "add_student",
//       title: "Add Student",
//       description: "Register new student",
//       icon: Users,
//       color: "green",
//       category: "students",
//       shortcut: "Ctrl+Shift+S",
//     },
//     {
//       id: "review_applications",
//       title: "Review Applications",
//       description: "Check pending applications",
//       icon: FileText,
//       color: "purple",
//       category: "applications",
//     },
//     {
//       id: "send_message",
//       title: "Send Message",
//       description: "Contact student or colleague",
//       icon: MessageCircle,
//       color: "indigo",
//       category: "communication",
//     },
//   ];

//   const progressItems = [
//     {
//       id: 1,
//       title: "Complete John Doe Application",
//       description: "Finalize university application documents",
//       status: "in_progress",
//       progress: 75,
//       dueDate: "2024-01-20T00:00:00Z",
//       priority: "high",
//       assignee: "John Doe",
//     },
//     {
//       id: 2,
//       title: "Schedule UK University Fair",
//       description: "Organize student information session",
//       status: "pending",
//       progress: 30,
//       dueDate: "2024-01-25T00:00:00Z",
//       priority: "medium",
//     },
//     {
//       id: 3,
//       title: "Review Scholarship Applications",
//       description: "Evaluate 5 scholarship applications",
//       status: "completed",
//       progress: 100,
//       completedDate: "2024-01-14T00:00:00Z",
//       priority: "normal",
//     },
//   ];

//   const upcomingTasks = [
//     {
//       id: 1,
//       title: "Call Sarah about visa documentation",
//       description: "Follow up on missing documents",
//       status: "pending",
//       priority: "high",
//       dueDate: "2024-01-16T14:00:00Z",
//       assignee: "Sarah Johnson",
//       category: "follow_up",
//     },
//     {
//       id: 2,
//       title: "Prepare university presentation",
//       description: "Create slides for Cambridge info session",
//       status: "pending",
//       priority: "medium",
//       dueDate: "2024-01-17T10:00:00Z",
//       category: "preparation",
//     },
//     {
//       id: 3,
//       title: "Review IELTS scores",
//       description: "Verify submitted test results",
//       status: "in_progress",
//       priority: "normal",
//       dueDate: "2024-01-18T16:00:00Z",
//       category: "review",
//     },
//   ];

//   return (
//     <div className="p-6 max-w-7xl mx-auto">
//       {/* Header */}
//       <div className="mb-8">
//         <div className="flex items-center justify-between">
//           <div>
//             <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
//               Welcome back, {user?.firstName}!
//             </h1>
//             <p className="text-gray-600 dark:text-gray-400 mt-1">
//               Here's what's happening with your students today
//             </p>
//           </div>

//           <div className="flex items-center space-x-3">
//             <select
//               value={selectedPeriod}
//               onChange={(e) => setSelectedPeriod(e.target.value)}
//               className="text-sm border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700"
//             >
//               <option value="today">Today</option>
//               <option value="week">This Week</option>
//               <option value="month">This Month</option>
//               <option value="quarter">This Quarter</option>
//             </select>

//             <Button variant="outline" size="sm">
//               <Download className="h-4 w-4 mr-2" />
//               Export Report
//             </Button>
//           </div>
//         </div>
//       </div>

//       {/* Stats Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
//         <StatsCard
//           title="Total Students"
//           value={dashboardData.totalStudents}
//           subtitle="Active consultations"
//           icon={Users}
//           trend="up"
//           trendValue={12}
//           color="blue"
//         />

//         <StatsCard
//           title="Active Applications"
//           value={dashboardData.activeApplications}
//           subtitle="In progress"
//           icon={FileText}
//           trend="up"
//           trendValue={8}
//           color="green"
//         />

//         <StatsCard
//           title="Today's Appointments"
//           value={dashboardData.upcomingAppointments}
//           subtitle="Scheduled meetings"
//           icon={Calendar}
//           trend="flat"
//           trendValue={0}
//           color="purple"
//         />

//         <StatsCard
//           title="Conversion Rate"
//           value={`${dashboardData.conversionRate}%`}
//           subtitle="This month"
//           icon={TrendingUp}
//           trend="up"
//           trendValue={5.2}
//           color="yellow"
//         />
//       </div>

//       {/* Main Content Grid */}
//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
//         {/* Performance Chart */}
//         <div className="lg:col-span-2">
//           <LineChart
//             title="Performance Overview"
//             subtitle="Your leads and conversions over time"
//             data={performanceData}
//             lines={[
//               { dataKey: "leads", stroke: "#3B82F6", name: "New Leads" },
//               {
//                 dataKey: "appointments",
//                 stroke: "#10B981",
//                 name: "Appointments",
//               },
//               {
//                 dataKey: "conversions",
//                 stroke: "#F59E0B",
//                 name: "Conversions",
//               },
//             ]}
//             height={300}
//             showTrend={true}
//           />
//         </div>

//         {/* Lead Status Distribution */}
//         <div>
//           <PieChart
//             title="Lead Status Distribution"
//             subtitle="Current pipeline status"
//             data={leadStatusData}
//             height={300}
//             showValueList={true}
//           />
//         </div>
//       </div>

//       {/* Secondary Content Grid */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
//         {/* Quick Actions */}
//         <QuickActions
//           title="Quick Actions"
//           actions={quickActions}
//           layout="grid"
//           columns={2}
//           onActionClick={(action) => console.log("Action clicked:", action)}
//         />

//         {/* Recent Activity */}
//         <RecentActivity
//           title="Recent Activity"
//           activities={recentActivities}
//           maxItems={5}
//           showTimestamps={true}
//           groupByDate={false}
//         />
//       </div>

//       {/* Progress and Tasks */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//         {/* Progress Tracker */}
//         <ProgressTracker
//           title="Current Projects"
//           items={progressItems}
//           type="milestones"
//           showProgress={true}
//           showTimeline={false}
//           onItemClick={(item) => console.log("Progress item clicked:", item)}
//         />

//         {/* Task List */}
//         <TaskList
//           title="Upcoming Tasks"
//           tasks={upcomingTasks}
//           maxItems={5}
//           showFilters={false}
//           groupBy="none"
//           onTaskClick={(task) => console.log("Task clicked:", task)}
//           onTaskComplete={(task) => console.log("Task completed:", task)}
//         />
//       </div>

//       {/* Today's Schedule */}
//       <div className="mt-8">
//         <Card className="p-6">
//           <div className="flex items-center justify-between mb-6">
//             <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
//               Today's Schedule
//             </h2>
//             <Button variant="outline" size="sm">
//               <Plus className="h-4 w-4 mr-2" />
//               Add Appointment
//             </Button>
//           </div>

//           {todayAppointments && todayAppointments.length > 0 ? (
//             <div className="space-y-4">
//               {todayAppointments.map((appointment) => (
//                 <div
//                   key={appointment.id}
//                   className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
//                 >
//                   <div className="flex items-center space-x-4">
//                     <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
//                       <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
//                     </div>
//                     <div>
//                       <h3 className="font-medium text-gray-900 dark:text-white">
//                         {appointment.title}
//                       </h3>
//                       <p className="text-sm text-gray-600 dark:text-gray-400">
//                         {appointment.studentName} • {appointment.time}
//                       </p>
//                     </div>
//                   </div>

//                   <div className="flex items-center space-x-3">
//                     <Badge
//                       variant={
//                         appointment.status === "confirmed"
//                           ? "success"
//                           : appointment.status === "pending"
//                           ? "warning"
//                           : "secondary"
//                       }
//                     >
//                       {appointment.status}
//                     </Badge>

//                     <Button variant="ghost" size="sm">
//                       <Eye className="h-4 w-4" />
//                     </Button>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           ) : (
//             <div className="text-center py-8">
//               <Calendar className="h-8 w-8 text-gray-400 mx-auto mb-2" />
//               <p className="text-gray-500 dark:text-gray-400">
//                 No appointments scheduled for today
//               </p>
//               <Button variant="outline" size="sm" className="mt-2">
//                 Schedule an appointment
//               </Button>
//             </div>
//           )}
//         </Card>
//       </div>
//     </div>
//   );
// };

// export default ConsultantDashboard;
