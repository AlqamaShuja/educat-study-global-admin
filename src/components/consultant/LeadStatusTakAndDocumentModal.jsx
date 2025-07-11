import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { toast } from "react-toastify";
import Button from "../ui/Button";
import Tabs from "../ui/Tabs";
import LoadingSpinner from "../ui/LoadingSpinner";
import { useState } from "react";
import Modal from "../ui/Modal";
import LeadDetailsView from "../manager/LeadDetailsView";

// Schemas for forms
const statusSchema = z.object({
  status: z.enum(["new", "in_progress", "converted", "lost"]),
});

const noteSchema = z.object({
  note: z.string().min(1, "Note is required"),
});

const meetingSchema = z.object({
  dateTime: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date format",
  }),
  type: z.enum(["in_person", "virtual"]),
});

const taskSchema = z.object({
  description: z.string().min(1, "Task description is required"),
  dueDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date format",
  }),
});

const taskStatusSchema = z.object({
  status: z.enum(["pending", "completed"]),
});

// Custom Table Component
const CustomTable = ({ columns, data, onSelectLead, onTaskStatusChange }) => {
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
                      ? column.accessor({
                          ...row,
                          onSelectLead,
                          onTaskStatusChange,
                        })
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

// Document table columns
const documentColumns = [
  { header: "Type", accessor: "type" },
  {
    header: "File",
    accessor: (row) => (
      <a
        href={`${import.meta.env.VITE_API_BASE_URL}/file/documents/${row.id}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 hover:underline"
      >
        View File
      </a>
    ),
  },
  { header: "Status", accessor: "status" },
  {
    header: "Expiry Date",
    accessor: (row) =>
      row.expiryDate ? format(new Date(row.expiryDate), "PPP") : "N/A",
  },
  { header: "Notes", accessor: "notes" },
  {
    header: "Created At",
    accessor: (row) => format(new Date(row.createdAt), "PPP"),
  },
  {
    header: "Updated At",
    accessor: (row) => format(new Date(row.updatedAt), "PPP"),
  },
];

// Task table columns
const taskColumns = [
  { header: "ID", accessor: "id" },
  { header: "Lead ID", accessor: "leadId" },
  { header: "Description", accessor: "description" },
  {
    header: "Due Date",
    accessor: (row) =>
      row.dueDate ? format(new Date(row.dueDate), "PPP") : "N/A",
  },
  { header: "Status", accessor: "status" },
  {
    header: "Actions",
    accessor: (row) => (
      <Button
        variant="outline"
        size="sm"
        onClick={() =>
          row.onTaskStatusChange(
            row.id,
            row.status === "pending" ? "completed" : "pending"
          )
        }
        className="border-blue-200 text-blue-600 hover:bg-blue-200 transition-colors duration-200"
      >
        Toggle Status
      </Button>
    ),
  },
  {
    header: "Created At",
    accessor: (row) => format(new Date(row.createdAt), "PPP"),
  },
  {
    header: "Updated At",
    accessor: (row) => format(new Date(row.updatedAt), "PPP"),
  },
];

// History table columns
const historyColumns = [
  { header: "Action/Note", accessor: (row) => row.note || row.action },
  { header: "User", accessor: (row) => row.userRole },
  {
    header: "Timestamp",
    accessor: (row) => format(new Date(row.timestamp), "PPP p"),
  },
];

const LeadStatusTaskAndDocumentModal = ({
  isOpen,
  onClose,
  selectedLead,
  tasks,
  documents,
  fetchLeadTasks,
  fetchLeadDocuments,
  updateLeadStatus,
  addConsultationNote,
  setFollowUpTask,
  scheduleMeeting,
  updateTaskStatus,
  loading,
}) => {
  const statusForm = useForm({
    resolver: zodResolver(statusSchema),
    defaultValues: { status: "new" },
  });

  const noteForm = useForm({
    resolver: zodResolver(noteSchema),
    defaultValues: { note: "" },
  });

  const meetingForm = useForm({
    resolver: zodResolver(meetingSchema),
    defaultValues: { dateTime: "", type: "virtual" },
  });

  const taskForm = useForm({
    resolver: zodResolver(taskSchema),
    defaultValues: { description: "", dueDate: "" },
  });

  const taskStatusForm = useForm({
    resolver: zodResolver(taskStatusSchema),
    defaultValues: { status: "pending" },
  });

  const handleStatusUpdate = async (data) => {
    try {
      await updateLeadStatus(selectedLead.id, data.status);
      toast.success(`Status updated for ${selectedLead.student?.name}`);
      onClose();
    } catch (error) {
      toast.error("Failed to update lead status");
    }
  };

  const handleAddNote = async (data) => {
    try {
      await addConsultationNote(selectedLead.id, data.note);
      toast.success(`Note added for ${selectedLead.student?.name}`);
      onClose();
    } catch (error) {
      toast.error("Failed to add note");
    }
  };

  const handleScheduleMeeting = async (data) => {
    try {
      await scheduleMeeting(selectedLead.studentId, data);
      toast.success(`Meeting scheduled with ${selectedLead.student?.name}`);
      onClose();
    } catch (error) {
      toast.error("Failed to schedule meeting");
    }
  };

  const handleAddTask = async (data) => {
    try {
      await setFollowUpTask(selectedLead.id, data);
      toast.success(`Task added for ${selectedLead.student?.name}`);
      onClose();
    } catch (error) {
      toast.error("Failed to add task");
    }
  };

  const handleTaskStatusChange = async (taskId, newStatus) => {
    try {
      await updateTaskStatus(taskId, newStatus);
      toast.success("Task status updated");
      fetchLeadTasks(selectedLead.id); // Refresh tasks
    } catch (error) {
      toast.error("Failed to update task status");
    }
  };

  const openModal = (type) => {
    setModalType(type);
  };

  const [modalType, setModalType] = useState(null);

  if (!selectedLead) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${selectedLead.student?.name}'s Details`}
      className="max-w-4xl mx-auto bg-white rounded-xl border border-blue-200"
      size="full"
    >
      {modalType === "status" && (
        <form
          onSubmit={statusForm.handleSubmit(handleStatusUpdate)}
          className="space-y-4"
        >
          <h3 className="text-lg font-semibold text-indigo-800">
            Update Status
          </h3>
          <select
            {...statusForm.register("status")}
            className="w-full p-2 border border-blue-200 rounded-md bg-white text-blue-800 focus:ring-purple-500 focus:border-purple-500"
          >
            <option value="new">New</option>
            <option value="in_progress">In Progress</option>
            <option value="converted">Converted</option>
            <option value="lost">Lost</option>
          </select>
          <div className="flex space-x-2">
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white transition-colors duration-200"
            >
              Update
            </Button>
            <Button
              variant="outline"
              onClick={() => setModalType(null)}
              className="border-blue-200 text-blue-600 hover:bg-blue-200 transition-colors duration-200"
            >
              Cancel
            </Button>
          </div>
        </form>
      )}
      {modalType === "note" && (
        <form
          onSubmit={noteForm.handleSubmit(handleAddNote)}
          className="space-y-4"
        >
          <h3 className="text-lg font-semibold text-indigo-800">Add Note</h3>
          <textarea
            {...noteForm.register("note")}
            className="w-full p-2 border border-blue-200 rounded-md bg-white text-blue-800 focus:ring-purple-500 focus:border-purple-500"
            placeholder="Enter consultation note"
            rows={4}
          />
          <div className="flex space-x-2">
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white transition-colors duration-200"
            >
              Add Note
            </Button>
            <Button
              variant="outline"
              onClick={() => setModalType(null)}
              className="border-blue-200 text-blue-600 hover:bg-blue-200 transition-colors duration-200"
            >
              Cancel
            </Button>
          </div>
        </form>
      )}
      {modalType === "meeting" && (
        <form
          onSubmit={meetingForm.handleSubmit(handleScheduleMeeting)}
          className="space-y-4"
        >
          <h3 className="text-lg font-semibold text-indigo-800">
            Schedule Meeting
          </h3>
          <input
            type="datetime-local"
            {...meetingForm.register("dateTime")}
            className="w-full p-2 border border-blue-200 rounded-md bg-white text-blue-800 focus:ring-purple-500 focus:border-purple-500"
          />
          <select
            {...meetingForm.register("type")}
            className="w-full p-2 border border-blue-200 rounded-md bg-white text-blue-800 focus:ring-purple-500 focus:border-purple-500"
          >
            <option value="virtual">Virtual</option>
            <option value="in_person">In Person</option>
          </select>
          <div className="flex space-x-2">
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white transition-colors duration-200"
            >
              Schedule
            </Button>
            <Button
              variant="outline"
              onClick={() => setModalType(null)}
              className="border-blue-200 text-blue-600 hover:bg-blue-200 transition-colors duration-200"
            >
              Cancel
            </Button>
          </div>
        </form>
      )}
      {modalType === "task" && (
        <form
          onSubmit={taskForm.handleSubmit(handleAddTask)}
          className="space-y-4"
        >
          <h3 className="text-lg font-semibold text-indigo-800">Add Task</h3>
          <input
            type="text"
            {...taskForm.register("description")}
            className="w-full p-2 border border-blue-200 rounded-md bg-white text-blue-800 focus:ring-purple-500 focus:border-purple-500"
            placeholder="Task description"
          />
          <input
            type="datetime-local"
            {...taskForm.register("dueDate")}
            className="w-full p-2 border border-blue-200 rounded-md bg-white text-blue-800 focus:ring-purple-500 focus:border-purple-500"
          />
          <div className="flex space-x-2">
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white transition-colors duration-200"
            >
              Add Task
            </Button>
            <Button
              variant="outline"
              onClick={() => setModalType(null)}
              className="border-blue-200 text-blue-600 hover:bg-blue-200 transition-colors duration-200"
            >
              Cancel
            </Button>
          </div>
        </form>
      )}
      {!modalType && (
        <div className="space-y-6">
          <LeadDetailsView lead={selectedLead} className="" />
          <Tabs defaultTab={0} className="space-y-4">
            <Tabs.Panel label="Tasks">
              <div className="space-y-4">
                {loading ? (
                  <LoadingSpinner className="mx-auto h-8 w-8 text-blue-500" />
                ) : (
                  <CustomTable
                    columns={taskColumns}
                    data={tasks}
                    onTaskStatusChange={handleTaskStatusChange}
                    leadId={selectedLead.id}
                  />
                )}
                <Button
                  onClick={() => openModal("task")}
                  className="bg-blue-600 hover:bg-blue-700 text-white transition-colors duration-200"
                >
                  Add Task
                </Button>
              </div>
            </Tabs.Panel>
            <Tabs.Panel label="Documents">
              <div className="space-y-4">
                {loading ? (
                  <LoadingSpinner className="mx-auto h-8 w-8 text-blue-500" />
                ) : (
                  <CustomTable
                    columns={documentColumns}
                    data={documents.map((doc) => ({
                      ...doc,
                      leadId: selectedLead.id,
                    }))}
                  />
                )}
              </div>
            </Tabs.Panel>
            <Tabs.Panel label="History">
              <div className="space-y-4">
                <CustomTable
                  columns={historyColumns}
                  data={selectedLead.history}
                />
              </div>
            </Tabs.Panel>
          </Tabs>
          <div className="flex flex-wrap gap-4">
            <Button
              onClick={() => openModal("status")}
              className="bg-blue-600 hover:bg-blue-700 text-white transition-colors duration-200"
            >
              Update Status
            </Button>
            <Button
              onClick={() => openModal("note")}
              className="bg-blue-600 hover:bg-blue-700 text-white transition-colors duration-200"
            >
              Add Note
            </Button>
            <Button
              onClick={() => openModal("meeting")}
              className="bg-blue-600 hover:bg-blue-700 text-white transition-colors duration-200"
            >
              Schedule Meeting
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default LeadStatusTaskAndDocumentModal;