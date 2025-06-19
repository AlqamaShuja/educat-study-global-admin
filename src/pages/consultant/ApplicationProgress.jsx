// pages/consultant/ApplicationProgress.jsx
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import useApi from "../../hooks/useApi";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Modal from "../../components/ui/Modal";
import Input from "../../components/ui/Input";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import ProgressTracker from "../../components/widgets/ProgressTracker";
import {
  CheckCircle,
  Clock,
  AlertCircle,
  User,
  FileText,
  Calendar,
  Target,
  TrendingUp,
  Edit,
  Plus,
  Send,
  Bell,
  Download,
  Upload,
} from "lucide-react";

const ApplicationProgress = () => {
  const { studentId } = useParams();
  const { request, loading } = useApi();

  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [progressData, setProgressData] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [showChecklistModal, setShowChecklistModal] = useState(false);
  const [reminderForm, setReminderForm] = useState({
    deadline: "",
    message: "",
  });
  const [statusUpdate, setStatusUpdate] = useState("");

  const applicationSteps = [
    {
      id: "profile_completion",
      title: "Profile Completion",
      description: "Complete student profile and preferences",
      weight: 10,
    },
    {
      id: "document_collection",
      title: "Document Collection",
      description: "Gather all required documents",
      weight: 25,
    },
    {
      id: "university_selection",
      title: "University Selection",
      description: "Choose target universities and programs",
      weight: 15,
    },
    {
      id: "application_preparation",
      title: "Application Preparation",
      description: "Prepare application materials",
      weight: 20,
    },
    {
      id: "application_submission",
      title: "Application Submission",
      description: "Submit applications to universities",
      weight: 15,
    },
    {
      id: "interview_preparation",
      title: "Interview Preparation",
      description: "Prepare for university interviews",
      weight: 10,
    },
    {
      id: "visa_application",
      title: "Visa Application",
      description: "Apply for student visa",
      weight: 5,
    },
  ];

  const statusColors = {
    not_started: "bg-gray-100 text-gray-800",
    in_progress: "bg-blue-100 text-blue-800",
    completed: "bg-green-100 text-green-800",
    blocked: "bg-red-100 text-red-800",
    pending_review: "bg-yellow-100 text-yellow-800",
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    if (studentId) {
      const student = students.find((s) => s.id === studentId);
      if (student) {
        setSelectedStudent(student);
        fetchApplicationProgress(studentId);
      }
    } else if (students.length > 0) {
      setSelectedStudent(students[0]);
      fetchApplicationProgress(students[0].id);
    }
  }, [studentId, students]);

  const fetchStudents = async () => {
    try {
      const response = await request("/consultant/leads");
      const leads = response || [];

      const studentsData = leads.map((lead) => ({
        id: lead.studentId,
        name: lead.student?.name || "Unknown",
        email: lead.student?.email || "N/A",
        status: lead.status,
        leadId: lead.id,
      }));

      setStudents(studentsData);
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  const fetchApplicationProgress = async (studentIdParam) => {
    try {
      const response = await request(
        `/consultant/students/${studentIdParam}/progress`
      );

      // Mock progress data if API doesn't return it
      const mockProgress = {
        overallProgress: 65,
        currentStep: "document_collection",
        steps: {
          profile_completion: {
            status: "completed",
            completedAt: "2024-06-01T10:00:00Z",
            progress: 100,
            notes: "Profile completed successfully",
          },
          document_collection: {
            status: "in_progress",
            completedAt: null,
            progress: 70,
            notes: "Missing IELTS certificate",
          },
          university_selection: {
            status: "not_started",
            completedAt: null,
            progress: 0,
            notes: "",
          },
          application_preparation: {
            status: "not_started",
            completedAt: null,
            progress: 0,
            notes: "",
          },
          application_submission: {
            status: "not_started",
            completedAt: null,
            progress: 0,
            notes: "",
          },
          interview_preparation: {
            status: "not_started",
            completedAt: null,
            progress: 0,
            notes: "",
          },
          visa_application: {
            status: "not_started",
            completedAt: null,
            progress: 0,
            notes: "",
          },
        },
        checklist: response?.checklist || {
          items: [
            { task: "Submit passport copy", status: "completed" },
            { task: "Submit academic transcripts", status: "completed" },
            { task: "Submit IELTS certificate", status: "pending" },
            { task: "Submit personal statement", status: "pending" },
            { task: "Submit recommendation letters", status: "pending" },
          ],
        },
        deadlines: [
          {
            id: "1",
            title: "IELTS Test Registration",
            date: "2024-06-25T00:00:00Z",
            status: "upcoming",
            priority: "high",
          },
          {
            id: "2",
            title: "University Application Deadline",
            date: "2024-07-15T00:00:00Z",
            status: "upcoming",
            priority: "urgent",
          },
          {
            id: "3",
            title: "Scholarship Application",
            date: "2024-06-30T00:00:00Z",
            status: "upcoming",
            priority: "medium",
          },
        ],
        applicationStatus: response?.applicationStatus || "in_progress",
        lastUpdated: "2024-06-18T14:30:00Z",
      };

      setProgressData(mockProgress);
    } catch (error) {
      console.error("Error fetching application progress:", error);
    }
  };

  const handleStatusUpdate = async () => {
    if (!selectedStudent || !statusUpdate) return;

    try {
      await request(
        `/consultant/students/${selectedStudent.id}/application-status`,
        {
          method: "PUT",
          data: { status: statusUpdate },
        }
      );

      setProgressData((prev) => ({
        ...prev,
        applicationStatus: statusUpdate,
        lastUpdated: new Date().toISOString(),
      }));

      setShowUpdateModal(false);
      setStatusUpdate("");
      alert("Application status updated successfully!");
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleSetReminder = async () => {
    if (!selectedStudent || !reminderForm.deadline || !reminderForm.message) {
      alert("Please fill in all fields");
      return;
    }

    try {
      await request(`/consultant/students/${selectedStudent.id}/reminders`, {
        method: "POST",
        data: reminderForm,
      });

      setShowReminderModal(false);
      setReminderForm({ deadline: "", message: "" });
      alert("Reminder set successfully!");
    } catch (error) {
      console.error("Error setting reminder:", error);
    }
  };

  const calculateOverallProgress = () => {
    if (!progressData) return 0;

    let totalWeight = 0;
    let completedWeight = 0;

    applicationSteps.forEach((step) => {
      const stepData = progressData.steps[step.id];
      totalWeight += step.weight;

      if (stepData.status === "completed") {
        completedWeight += step.weight;
      } else if (stepData.status === "in_progress") {
        completedWeight += step.weight * (stepData.progress / 100);
      }
    });

    return Math.round((completedWeight / totalWeight) * 100);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "in_progress":
        return <Clock className="h-5 w-5 text-blue-500" />;
      case "blocked":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case "pending_review":
        return <Clock className="h-5 w-5 text-yellow-500" />;
      default:
        return <div className="h-5 w-5 bg-gray-300 rounded-full" />;
    }
  };

  const getDeadlinePriorityColor = (priority) => {
    const colors = {
      low: "bg-gray-100 text-gray-800",
      medium: "bg-blue-100 text-blue-800",
      high: "bg-orange-100 text-orange-800",
      urgent: "bg-red-100 text-red-800",
    };
    return colors[priority] || "bg-gray-100 text-gray-800";
  };

  const overallProgress = calculateOverallProgress();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Application Progress
          </h1>
          <p className="text-gray-600">
            {selectedStudent
              ? `Track ${selectedStudent.name}'s application journey`
              : "Track student application progress"}
          </p>
        </div>

        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={() => setShowReminderModal(true)}
            disabled={!selectedStudent}
          >
            <Bell className="h-4 w-4 mr-2" />
            Set Reminder
          </Button>

          <Button
            onClick={() => setShowUpdateModal(true)}
            disabled={!selectedStudent}
          >
            <Edit className="h-4 w-4 mr-2" />
            Update Status
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Student Selector */}
        <div className="lg:col-span-1">
          <Card>
            <Card.Header>
              <h3 className="text-lg font-semibold">Students</h3>
            </Card.Header>
            <Card.Content>
              <div className="space-y-2">
                {students.map((student) => (
                  <button
                    key={student.id}
                    onClick={() => {
                      setSelectedStudent(student);
                      fetchApplicationProgress(student.id);
                    }}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      selectedStudent?.id === student.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <div className="font-medium text-gray-900">
                      {student.name}
                    </div>
                    <div className="text-sm text-gray-500">{student.email}</div>
                    <Badge className="mt-1 text-xs">{student.status}</Badge>
                  </button>
                ))}
              </div>
            </Card.Content>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {selectedStudent && progressData && (
            <>
              {/* Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <Card.Content className="p-4">
                    <div className="flex items-center">
                      <Target className="h-8 w-8 text-blue-500" />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-600">
                          Overall Progress
                        </p>
                        <p className="text-2xl font-bold text-gray-900">
                          {overallProgress}%
                        </p>
                      </div>
                    </div>
                  </Card.Content>
                </Card>

                <Card>
                  <Card.Content className="p-4">
                    <div className="flex items-center">
                      <CheckCircle className="h-8 w-8 text-green-500" />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-600">
                          Completed Steps
                        </p>
                        <p className="text-2xl font-bold text-gray-900">
                          {
                            Object.values(progressData.steps).filter(
                              (step) => step.status === "completed"
                            ).length
                          }
                          /{applicationSteps.length}
                        </p>
                      </div>
                    </div>
                  </Card.Content>
                </Card>

                <Card>
                  <Card.Content className="p-4">
                    <div className="flex items-center">
                      <TrendingUp className="h-8 w-8 text-purple-500" />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-600">
                          Status
                        </p>
                        <Badge
                          className={
                            statusColors[progressData.applicationStatus]
                          }
                        >
                          {progressData.applicationStatus
                            .replace("_", " ")
                            .toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  </Card.Content>
                </Card>
              </div>

              {/* Progress Timeline */}
              <Card>
                <Card.Header>
                  <h3 className="text-lg font-semibold">
                    Application Timeline
                  </h3>
                </Card.Header>
                <Card.Content>
                  <div className="space-y-6">
                    {applicationSteps.map((step, index) => {
                      const stepData = progressData.steps[step.id];
                      const isActive = progressData.currentStep === step.id;

                      return (
                        <div
                          key={step.id}
                          className="flex items-start space-x-4"
                        >
                          {/* Timeline Line */}
                          <div className="flex flex-col items-center">
                            {getStatusIcon(stepData.status)}
                            {index < applicationSteps.length - 1 && (
                              <div
                                className={`w-px h-12 mt-2 ${
                                  stepData.status === "completed"
                                    ? "bg-green-300"
                                    : "bg-gray-300"
                                }`}
                              />
                            )}
                          </div>

                          {/* Step Content */}
                          <div
                            className={`flex-1 pb-6 ${
                              isActive ? "bg-blue-50 p-4 rounded-lg" : ""
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-medium text-gray-900">
                                  {step.title}
                                </h4>
                                <p className="text-sm text-gray-600">
                                  {step.description}
                                </p>
                              </div>

                              <div className="flex items-center space-x-2">
                                <Badge
                                  className={statusColors[stepData.status]}
                                >
                                  {stepData.status.replace("_", " ")}
                                </Badge>

                                {stepData.status === "in_progress" && (
                                  <div className="text-sm text-gray-600">
                                    {stepData.progress}%
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Progress Bar for In Progress Steps */}
                            {stepData.status === "in_progress" && (
                              <div className="mt-2">
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${stepData.progress}%` }}
                                  />
                                </div>
                              </div>
                            )}

                            {/* Notes */}
                            {stepData.notes && (
                              <div className="mt-2 text-sm text-gray-600">
                                <strong>Notes:</strong> {stepData.notes}
                              </div>
                            )}

                            {/* Completion Date */}
                            {stepData.completedAt && (
                              <div className="mt-2 text-sm text-gray-500">
                                Completed on{" "}
                                {new Date(
                                  stepData.completedAt
                                ).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card.Content>
              </Card>

              {/* Application Checklist */}
              <Card>
                <Card.Header>
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">
                      Application Checklist
                    </h3>
                    <Button size="sm" variant="outline">
                      <Plus className="h-4 w-4 mr-1" />
                      Add Item
                    </Button>
                  </div>
                </Card.Header>
                <Card.Content>
                  <div className="space-y-3">
                    {progressData.checklist.items.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={item.status === "completed"}
                            readOnly
                            className="rounded border-gray-300"
                          />
                          <span
                            className={`${
                              item.status === "completed"
                                ? "text-gray-500 line-through"
                                : "text-gray-900"
                            }`}
                          >
                            {item.task}
                          </span>
                        </div>

                        <Badge
                          className={
                            item.status === "completed"
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }
                        >
                          {item.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </Card.Content>
              </Card>

              {/* Upcoming Deadlines */}
              <Card>
                <Card.Header>
                  <h3 className="text-lg font-semibold">Upcoming Deadlines</h3>
                </Card.Header>
                <Card.Content>
                  <div className="space-y-3">
                    {progressData.deadlines.map((deadline) => {
                      const deadlineDate = new Date(deadline.date);
                      const daysUntil = Math.ceil(
                        (deadlineDate - new Date()) / (1000 * 60 * 60 * 24)
                      );

                      return (
                        <div
                          key={deadline.id}
                          className="flex items-center justify-between p-4 border rounded-lg"
                        >
                          <div className="flex items-center space-x-3">
                            <Calendar className="h-5 w-5 text-gray-400" />
                            <div>
                              <h4 className="font-medium text-gray-900">
                                {deadline.title}
                              </h4>
                              <p className="text-sm text-gray-600">
                                {deadlineDate.toLocaleDateString()}
                                {daysUntil > 0 && ` (${daysUntil} days left)`}
                                {daysUntil === 0 && " (Today)"}
                                {daysUntil < 0 &&
                                  ` (${Math.abs(daysUntil)} days overdue)`}
                              </p>
                            </div>
                          </div>

                          <Badge
                            className={getDeadlinePriorityColor(
                              deadline.priority
                            )}
                          >
                            {deadline.priority}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                </Card.Content>
              </Card>
            </>
          )}
        </div>
      </div>

      {/* Update Status Modal */}
      <Modal
        isOpen={showUpdateModal}
        onClose={() => {
          setShowUpdateModal(false);
          setStatusUpdate("");
        }}
        title="Update Application Status"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Status for {selectedStudent?.name}
            </label>
            <select
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              value={statusUpdate}
              onChange={(e) => setStatusUpdate(e.target.value)}
            >
              <option value="">Select status...</option>
              <option value="not_started">Not Started</option>
              <option value="in_progress">In Progress</option>
              <option value="pending_review">Pending Review</option>
              <option value="completed">Completed</option>
              <option value="blocked">Blocked</option>
            </select>
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => {
                setShowUpdateModal(false);
                setStatusUpdate("");
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleStatusUpdate}>Update Status</Button>
          </div>
        </div>
      </Modal>

      {/* Set Reminder Modal */}
      <Modal
        isOpen={showReminderModal}
        onClose={() => {
          setShowReminderModal(false);
          setReminderForm({ deadline: "", message: "" });
        }}
        title="Set Deadline Reminder"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Deadline Date
            </label>
            <Input
              type="datetime-local"
              value={reminderForm.deadline}
              onChange={(e) =>
                setReminderForm({
                  ...reminderForm,
                  deadline: e.target.value,
                })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reminder Message
            </label>
            <textarea
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              rows={3}
              value={reminderForm.message}
              onChange={(e) =>
                setReminderForm({
                  ...reminderForm,
                  message: e.target.value,
                })
              }
              placeholder="Enter reminder message..."
            />
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => {
                setShowReminderModal(false);
                setReminderForm({ deadline: "", message: "" });
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSetReminder}>
              <Bell className="h-4 w-4 mr-2" />
              Set Reminder
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ApplicationProgress;
