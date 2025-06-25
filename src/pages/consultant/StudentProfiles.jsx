// pages/consultant/StudentProfiles.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";

// Custom hook to get location state (replace with your router's method)
const useLocationState = () => {
  // This would typically come from your router
  // For now, we'll assume it's passed via window.history.state or similar
  try {
    return window.history.state || {};
  } catch {
    return {};
  }
};
import useConsultantStore from "../../stores/consultantStore";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Modal from "../../components/ui/Modal";
import Input from "../../components/ui/Input";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import {
  User,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  Calendar,
  FileText,
  MessageSquare,
  Upload,
  AlertCircle,
  Plus,
  X,
  Clock,
  Send,
  CheckCircle,
  Circle,
} from "lucide-react";

// Custom notification helper
const showNotification = (message, type = "info") => {
  console.log(`${type.toUpperCase()}: ${message}`);
  // Replace with your actual notification system
  if (window.alert && type === "error") {
    window.alert(message);
  } else {
    console.log(`Notification: ${message}`);
  }
};

const StudentProfiles = () => {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const locationState = useLocation();

  console.log(locationState, "ascnajcnas:locationState");
  
  // Get lead data from navigation state
  const leadFromState = locationState?.state?.lead;

  const {
    studentProfile,
    tasks,
    documents,
    fetchStudentProfile,
    sendMessage,
    createTask,
    uploadDocument,
    fetchLeadTasks,
    fetchLeadDocuments,
    loading,
    error,
    clearError,
  } = useConsultantStore();

  // Modal states
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);

  // Form states
  const [messageText, setMessageText] = useState("");
  const [taskList, setTaskList] = useState([]);
  const [documentFiles, setDocumentFiles] = useState([]);
  const [documentTypes, setDocumentTypes] = useState([]);
  const [documentNotes, setDocumentNotes] = useState([]);

  // Loading states
  const [hasLoaded, setHasLoaded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Use lead from state or redirect if not available
  const currentLead = leadFromState;

  // Document type options
  const documentTypeOptions = [
    "passport",
    "cnic",
    "transcript",
    "test_score",
    "degree",
    "experience_letter",
    "bank_statement",
    "photo",
    "other",
  ];

  // Load data on component mount
  useEffect(() => {
    // If no lead data passed, redirect back
    if (!currentLead) {
      console.warn("No lead data provided, redirecting back");
      navigate("/consultant/leads");
      return;
    }

    // Fetch student profile
    if (studentId) {
      console.log(`Fetching profile for studentId: ${studentId}`);
      fetchStudentProfile(studentId)
        .then((res) => {
          console.log("Fetch profile completed:", res);
          setHasLoaded(true);
        })
        .catch((err) => {
          console.error("Fetch profile failed:", err);
          setHasLoaded(true);
        });

      // Fetch tasks and documents for this lead
      if (currentLead.id) {
        console.log(
          `Fetching tasks and documents for leadId: ${currentLead.id}`
        );
        fetchLeadTasks(currentLead.id);
        fetchLeadDocuments(currentLead.id);
      }
    }
  }, [
    studentId,
    currentLead,
    fetchStudentProfile,
    fetchLeadTasks,
    fetchLeadDocuments,
    navigate,
  ]);

  // Handle errors
  useEffect(() => {
    if (error) {
      console.error("Store error:", error);
      showNotification(error, "error");
      clearError();
    }
  }, [error, clearError]);

  // Handle Send Message
  const handleSendMessage = async () => {
    if (!messageText.trim()) {
      showNotification("Message cannot be empty", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      await sendMessage(studentId, messageText.trim());
      showNotification("Message sent successfully!", "success");
      setMessageText("");
      setShowMessageModal(false);
    } catch (err) {
      showNotification("Failed to send message", "error");
      console.error("Send message error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Create Tasks
  const handleCreateTasks = async () => {
    if (!taskList.length) {
      showNotification("Task list cannot be empty", "error");
      return;
    }

    if (!currentLead?.id) {
      showNotification("No lead found for this student", "error");
      return;
    }

    const invalidTasks = taskList.filter(
      (task) => !task.description.trim() || !task.dueDate
    );
    if (invalidTasks.length > 0) {
      showNotification("All tasks must have description and due date", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      // Create tasks one by one
      for (const task of taskList) {
        await createTask(currentLead.id, {
          description: task.description.trim(),
          dueDate: task.dueDate,
        });
      }

      showNotification("Tasks created successfully!", "success");
      setTaskList([]);
      setShowTaskModal(false);
      // Refresh tasks
      await fetchLeadTasks(currentLead.id);
    } catch (err) {
      showNotification("Failed to create tasks", "error");
      console.error("Create tasks error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Document Upload
  const handleDocumentUpload = async () => {
    if (!documentFiles.length) {
      showNotification("Please select at least one file", "error");
      return;
    }

    if (!currentLead?.id) {
      showNotification("No lead found for this student", "error");
      return;
    }

    if (documentFiles.length !== documentTypes.length) {
      showNotification("Please select a type for each document", "error");
      return;
    }

    const emptyTypes = documentTypes.some((type) => !type);
    if (emptyTypes) {
      showNotification("Please select a type for each document", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();

      // Append files
      documentFiles.forEach((file) => {
        formData.append("files", file);
      });

      // Append types and notes as JSON strings
      formData.append("types", JSON.stringify(documentTypes));
      formData.append("notes", JSON.stringify(documentNotes));

      await uploadDocument(currentLead.id, formData);
      showNotification("Documents uploaded successfully!", "success");

      // Reset form
      setDocumentFiles([]);
      setDocumentTypes([]);
      setDocumentNotes([]);
      setShowDocumentModal(false);

      // Refresh documents
      await fetchLeadDocuments(currentLead.id);
    } catch (err) {
      showNotification("Failed to upload documents", "error");
      console.error("Upload documents error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Task management functions
  const addTask = () => {
    setTaskList([...taskList, { description: "", dueDate: "" }]);
  };

  const updateTask = (index, field, value) => {
    const updated = taskList.map((task, i) =>
      i === index ? { ...task, [field]: value } : task
    );
    setTaskList(updated);
  };

  const removeTask = (index) => {
    setTaskList(taskList.filter((_, i) => i !== index));
  };

  // Document management functions
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setDocumentFiles(files);

    // Initialize types and notes arrays
    setDocumentTypes(new Array(files.length).fill(""));
    setDocumentNotes(new Array(files.length).fill(""));
  };

  const updateDocumentType = (index, type) => {
    const updated = [...documentTypes];
    updated[index] = type;
    setDocumentTypes(updated);
  };

  const updateDocumentNote = (index, note) => {
    const updated = [...documentNotes];
    updated[index] = note;
    setDocumentNotes(updated);
  };

  const removeFile = (index) => {
    setDocumentFiles(documentFiles.filter((_, i) => i !== index));
    setDocumentTypes(documentTypes.filter((_, i) => i !== index));
    setDocumentNotes(documentNotes.filter((_, i) => i !== index));
  };

  // Loading state
  if (!hasLoaded || (loading && !studentProfile)) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // No lead data state
  if (!currentLead) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900">
          No lead data available
        </h3>
        <p className="text-gray-600">
          Please navigate from the leads page to view student profile.
        </p>
        <Button
          onClick={() => navigate("/consultant/my-leads")}
          className="mt-4"
        >
          Back to Leads
        </Button>
      </div>
    );
  }

  // Not found state
  if (!studentProfile) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900">Profile not found</h3>
        <p className="text-gray-600">
          The student profile could not be loaded.
        </p>
        <Button
          onClick={() => navigate("/consultant/my-leads")}
          className="mt-4"
        >
          Back to Leads
        </Button>
      </div>
    );
  }

  // Extract student data from lead (passed from parent)
  const student = currentLead.student || {};

  // Map studentProfile and student data to display data
  const personalInfo = {
    name:
      student.name ||
      (studentProfile.personalInfo?.fullName
        ? `${studentProfile.personalInfo.fullName.firstName || ""} ${
            studentProfile.personalInfo.fullName.lastName || ""
          }`.trim()
        : studentProfile.personalInfo?.name) ||
      "N/A",
    email: student.email || studentProfile.personalInfo?.email || "N/A",
    phone: student.phone || studentProfile.personalInfo?.phone || "N/A",
    dob: studentProfile.personalInfo?.dateOfBirth || null,
    nationality:
      studentProfile.personalInfo?.residenceCountry ||
      studentProfile.personalInfo?.nationality ||
      "N/A",
    gender: studentProfile.personalInfo?.gender || "N/A",
  };

  const educationalBackground = studentProfile.educationalBackground
    ? Object.entries(studentProfile.educationalBackground)
        .filter(([key, value]) => value && typeof value === "object")
        .map(([key, edu]) => ({
          type: key,
          institution: edu.board || edu.institution || "N/A",
          degree:
            edu.preEngineeringOrPreMedical ||
            edu.subjects ||
            edu.degree ||
            "N/A",
          year: edu.year || "N/A",
          score: edu.scorePercentage || edu.gpa || null,
        }))
    : [];

  const studyPreferences = {
    destination:
      currentLead.studyPreferences?.destination ||
      studentProfile.studyPreferences?.preferredCountry ||
      "N/A",
    level: studentProfile.studyPreferences?.studyLevel || "N/A",
    fields: studentProfile.studyPreferences?.specialization
      ? [studentProfile.studyPreferences.specialization]
      : studentProfile.studyPreferences?.fields ||
        (currentLead.studyPreferences?.fields
          ? [currentLead.studyPreferences.fields]
          : []),
    budget:
      currentLead.studyPreferences?.budget ||
      studentProfile.studyPreferences?.budget ||
      "N/A",
  };

  // Calculate application status from tasks
  const applicationStatus =
    tasks && tasks.length
      ? tasks.every((task) => task.status === "completed")
        ? "Completed"
        : "In Progress"
      : "Not Started";

  const progressPercent =
    tasks && tasks.length
      ? (tasks.filter((task) => task.status === "completed").length /
          tasks.length) *
        100
      : 0;

  // Recent activity from lead history
  const recentActivity = currentLead?.history
    ? currentLead.history
        .slice(-3)
        .reverse()
        .map((entry) => ({
          action: entry.note || entry.action || "Activity recorded",
          timestamp: new Date(entry.timestamp).toLocaleString(),
        }))
    : [];

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Student Profile</h1>
          <p className="text-gray-600">
            Manage {personalInfo.name}'s information and application progress
          </p>
          {/* Lead Info */}
          <div className="flex items-center space-x-4 mt-2">
            <Badge className="bg-blue-100 text-blue-800">
              Lead ID: {currentLead.id.slice(-8)}
            </Badge>
            <Badge
              className={
                currentLead.status === "converted"
                  ? "bg-green-100 text-green-800"
                  : currentLead.status === "in_progress"
                  ? "bg-yellow-100 text-yellow-800"
                  : currentLead.status === "lost"
                  ? "bg-red-100 text-red-800"
                  : "bg-gray-100 text-gray-800"
              }
            >
              {currentLead.status?.replace("_", " ").toUpperCase()}
            </Badge>
            <Badge className="bg-purple-100 text-purple-800">
              {currentLead.source?.toUpperCase()}
            </Badge>
          </div>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={() => setShowMessageModal(true)}>
            <MessageSquare className="h-4 w-4 mr-2" />
            Send Message
          </Button>
          <Button variant="outline" onClick={() => setShowTaskModal(true)}>
            <FileText className="h-4 w-4 mr-2" />
            Create Task
          </Button>
          <Button onClick={() => setShowDocumentModal(true)}>
            <Upload className="h-4 w-4 mr-2" />
            Upload Documents
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Personal Information */}
        <div className="lg:col-span-2 space-y-6">
          <Card title="Personal Information">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <p className="text-gray-900">{personalInfo.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <div className="flex items-center">
                  <Mail className="h-4 w-4 text-gray-400 mr-2" />
                  <p className="text-gray-900">{personalInfo.email}</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <div className="flex items-center">
                  <Phone className="h-4 w-4 text-gray-400 mr-2" />
                  <p className="text-gray-900">{personalInfo.phone}</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date of Birth
                </label>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                  <p className="text-gray-900">
                    {personalInfo.dob
                      ? new Date(personalInfo.dob).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nationality
                </label>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                  <p className="text-gray-900">{personalInfo.nationality}</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gender
                </label>
                <p className="text-gray-900 capitalize">
                  {personalInfo.gender}
                </p>
              </div>
            </div>
          </Card>

          {/* Educational Background */}
          <Card title="Educational Background">
            {educationalBackground.length > 0 ? (
              <div className="space-y-4">
                {educationalBackground.map((edu, index) => (
                  <div key={index} className="border-l-4 border-blue-500 pl-4">
                    <h4 className="font-medium text-gray-900 capitalize">
                      {edu.type.replace(/([A-Z])/g, " $1").trim()}
                    </h4>
                    <p className="text-gray-600">{edu.institution}</p>
                    <p className="text-gray-600">{edu.degree}</p>
                    <p className="text-sm text-gray-500">Year: {edu.year}</p>
                    {edu.score && (
                      <p className="text-sm text-gray-500">
                        Score: {edu.score}%
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">
                No educational background available
              </p>
            )}
          </Card>

          {/* Study Preferences */}
          <Card title="Study Preferences">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Preferred Destination
                </label>
                <p className="text-gray-900">{studyPreferences.destination}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Study Level
                </label>
                <p className="text-gray-900">{studyPreferences.level}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Field of Study
                </label>
                <p className="text-gray-900">
                  {Array.isArray(studyPreferences.fields) &&
                  studyPreferences.fields.length
                    ? studyPreferences.fields.join(", ")
                    : "N/A"}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Budget Range
                </label>
                <p className="text-gray-900">{studyPreferences.budget}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Application Progress Sidebar */}
        <div className="space-y-6">
          {/* Application Status */}
          <Card title="Application Status">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  Status
                </span>
                <Badge
                  className={
                    applicationStatus === "Completed"
                      ? "bg-green-100 text-green-800"
                      : applicationStatus === "In Progress"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-gray-100 text-gray-800"
                  }
                >
                  {applicationStatus}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  Progress
                </span>
                <span className="text-sm text-gray-600">
                  {Math.round(progressPercent)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
            </div>
          </Card>

          {/* Application Tasks */}
          <Card title="Application Tasks">
            {tasks && tasks.length ? (
              <div className="space-y-2">
                {tasks.map((task) => (
                  <div key={task.id} className="flex items-start space-x-2">
                    {task.status === "completed" ? (
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    ) : (
                      <Circle className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <span
                        className={`text-sm ${
                          task.status === "completed"
                            ? "text-gray-500 line-through"
                            : "text-gray-900"
                        }`}
                      >
                        {task.description}
                      </span>
                      {task.dueDate && (
                        <div className="flex items-center text-xs text-gray-500 mt-1">
                          <Clock className="h-3 w-3 mr-1" />
                          {new Date(task.dueDate).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No tasks available</p>
            )}
          </Card>

          {/* Recent Activity */}
          <Card title="Recent Activity">
            {recentActivity.length ? (
              <div className="space-y-3">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">{activity.action}</p>
                      <p className="text-xs text-gray-500">
                        {activity.timestamp}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No recent activity</p>
            )}
          </Card>

          {/* Documents */}
          <Card title="Documents">
            {documents && documents.length ? (
              <div className="space-y-2">
                {documents.slice(0, 5).map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between"
                  >
                    <span className="text-sm text-gray-900 capitalize">
                      {doc.type.replace("_", " ")}
                    </span>
                    <Badge
                      className={
                        doc.status === "approved"
                          ? "bg-green-100 text-green-800"
                          : doc.status === "rejected"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                      }
                    >
                      {doc.status}
                    </Badge>
                  </div>
                ))}
                {documents.length > 5 && (
                  <p className="text-xs text-gray-500">
                    +{documents.length - 5} more documents
                  </p>
                )}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No documents uploaded</p>
            )}
          </Card>
        </div>
      </div>

      {/* Send Message Modal */}
      <Modal
        isOpen={showMessageModal}
        onClose={() => {
          setShowMessageModal(false);
          setMessageText("");
        }}
        title="Send Message to Student"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message
            </label>
            <textarea
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Enter your message..."
              rows={4}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => {
                setShowMessageModal(false);
                setMessageText("");
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSendMessage}
              disabled={isSubmitting || !messageText.trim()}
            >
              <Send className="h-4 w-4 mr-2" />
              {isSubmitting ? "Sending..." : "Send Message"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Create Task Modal */}
      <Modal
        isOpen={showTaskModal}
        onClose={() => {
          setShowTaskModal(false);
          setTaskList([]);
        }}
        title="Create Tasks"
        size="lg"
      >
        <div className="space-y-4">
          <div className="space-y-3">
            {taskList.map((task, index) => (
              <div key={index} className="grid grid-cols-12 gap-3 items-end">
                <div className="col-span-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Task Description
                  </label>
                  <Input
                    type="text"
                    value={task.description}
                    onChange={(e) =>
                      updateTask(index, "description", e.target.value)
                    }
                    placeholder="Enter task description..."
                    className="w-full"
                  />
                </div>
                <div className="col-span-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Due Date
                  </label>
                  <Input
                    type="datetime-local"
                    value={task.dueDate}
                    onChange={(e) =>
                      updateTask(index, "dueDate", e.target.value)
                    }
                    className="w-full"
                  />
                </div>
                <div className="col-span-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeTask(index)}
                    className="w-full"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <Button variant="outline" onClick={addTask} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Task
          </Button>
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => {
                setShowTaskModal(false);
                setTaskList([]);
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateTasks}
              disabled={isSubmitting || !taskList.length}
            >
              {isSubmitting ? "Creating..." : "Create Tasks"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Document Upload Modal */}
      <Modal
        isOpen={showDocumentModal}
        onClose={() => {
          setShowDocumentModal(false);
          setDocumentFiles([]);
          setDocumentTypes([]);
          setDocumentNotes([]);
        }}
        title="Upload Documents"
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Files
            </label>
            <input
              type="file"
              multiple
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            />
          </div>

          {documentFiles.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-700">
                Document Details
              </h4>
              {documentFiles.map((file, index) => (
                <div key={index} className="border rounded-lg p-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-4 w-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-900">
                        {file.name}
                      </span>
                      <span className="text-xs text-gray-500">
                        ({(file.size / 1024 / 1024).toFixed(2)} MB)
                      </span>
                    </div>
                    <button
                      onClick={() => removeFile(index)}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Document Type *
                      </label>
                      <select
                        value={documentTypes[index] || ""}
                        onChange={(e) =>
                          updateDocumentType(index, e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        <option value="">Select type...</option>
                        {documentTypeOptions.map((type) => (
                          <option key={type} value={type}>
                            {type.replace("_", " ").toUpperCase()}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Notes (Optional)
                      </label>
                      <input
                        type="text"
                        value={documentNotes[index] || ""}
                        onChange={(e) =>
                          updateDocumentNote(index, e.target.value)
                        }
                        placeholder="Add notes..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => {
                setShowDocumentModal(false);
                setDocumentFiles([]);
                setDocumentTypes([]);
                setDocumentNotes([]);
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDocumentUpload}
              disabled={
                isSubmitting ||
                !documentFiles.length ||
                documentTypes.some((type) => !type)
              }
            >
              <Upload className="h-4 w-4 mr-2" />
              {isSubmitting ? "Uploading..." : "Upload Documents"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default StudentProfiles;

// import React, { useState, useEffect } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import useConsultantStore from "../../stores/consultantStore";
// import Button from "../../components/ui/Button";
// import Card from "../../components/ui/Card";
// import Badge from "../../components/ui/Badge";
// import Modal from "../../components/ui/Modal";
// import Input from "../../components/ui/Input";
// import LoadingSpinner from "../../components/ui/LoadingSpinner";
// import DocumentUpload from "../../components/forms/DocumentUpload";
// import {
//   User,
//   Mail,
//   Phone,
//   MapPin,
//   GraduationCap,
//   Calendar,
//   FileText,
//   MessageSquare,
//   Upload,
//   AlertCircle,
// } from "lucide-react";
// import { toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";

// const StudentProfiles = () => {
//   const { studentId } = useParams();
//   const navigate = useNavigate();
//   const {
//     studentProfile,
//     leads,
//     tasks,
//     documents,
//     fetchLeads,
//     fetchStudentProfile,
//     sendMessage,
//     createTask,
//     uploadDocument,
//     fetchLeadTasks,
//     fetchLeadDocuments,
//     loading,
//     error,
//   } = useConsultantStore();

//   const [showDocumentModal, setShowDocumentModal] = useState(false);
//   const [showMessageModal, setShowMessageModal] = useState(false);
//   const [showChecklistModal, setShowChecklistModal] = useState(false);
//   const [message, setMessage] = useState("");
//   const [checklist, setChecklist] = useState([]);
//   const [hasLoaded, setHasLoaded] = useState(false);
//   const [leadsLoaded, setLeadsLoaded] = useState(false);

//   useEffect(() => {
//     if (studentId) {
//       console.log(`Fetching profile for studentId: ${studentId}`);
//       fetchStudentProfile(studentId)
//         .then((res) => {
//           console.log("Fetch profile completed:", res);
//           setHasLoaded(true);
//         })
//         .catch((err) => {
//           console.error("Fetch profile failed:", err);
//           setHasLoaded(true);
//         });

//       // Ensure leads are loaded
//       if (!Array.isArray(leads) || !leads.length) {
//         console.log("Leads not loaded, fetching leads...");
//         fetchLeads()
//           .then(() => {
//             console.log("Fetch leads completed");
//             setLeadsLoaded(true);
//           })
//           .catch((err) => {
//             console.error("Fetch leads failed:", err);
//             setLeadsLoaded(true);
//           });
//       } else {
//         setLeadsLoaded(true);
//       }
//     }
//   }, [studentId]);

//   useEffect(() => {
//     if (leadsLoaded && Array.isArray(leads)) {
//       const lead = leads.find((l) => l.studentId === studentId);
//       if (lead?.id) {
//         console.log(`Fetching tasks and documents for leadId: ${lead.id}`);
//         fetchLeadTasks(lead.id);
//         fetchLeadDocuments(lead.id);
//       } else {
//         console.warn(`No lead found for studentId: ${studentId}`);
//       }
//     }
//   }, [leadsLoaded, studentId]);

//   useEffect(() => {
//     if (error) {
//       console.error("Store error:", error);
//       toast.error(error);
//     }
//   }, [error]);

//   useEffect(() => {
//     console.log("Student profile:", studentProfile);
//     console.log("Leads:", leads);
//     console.log("Tasks:", tasks);
//     console.log("Documents:", documents);
//   }, [studentProfile, leads, tasks, documents]);

//   const handleSendMessage = async () => {
//     if (!message.trim()) {
//       toast.error("Message cannot be empty");
//       return;
//     }

//     try {
//       await sendMessage(studentId, message);
//       toast.success("Message sent successfully!");
//       setMessage("");
//       setShowMessageModal(false);
//     } catch (err) {
//       toast.error("Failed to send message");
//       console.error("Send message error:", err);
//     }
//   };

//   const handleCreateChecklist = async () => {
//     if (!checklist.length) {
//       toast.error("Checklist cannot be empty");
//       return;
//     }

//     try {
//       const lead = Array.isArray(leads)
//         ? leads.find((l) => l.studentId === studentId)
//         : null;
//       if (!lead?.id) {
//         throw new Error("No lead found for this student");
//       }

//       for (const item of checklist) {
//         await createTask(lead.id, {
//           description: item.task,
//           status: item.status,
//           dueDate: null,
//         });
//       }

//       toast.success("Checklist created successfully!");
//       setChecklist([]);
//       setShowChecklistModal(false);
//       fetchLeadTasks(lead.id);
//     } catch (err) {
//       toast.error("Failed to create checklist");
//       console.error("Create checklist error:", err);
//     }
//   };

//   const addChecklistItem = () => {
//     setChecklist([...checklist, { task: "", status: "pending" }]);
//   };

//   const updateChecklistItem = (index, field, value) => {
//     const updated = checklist.map((item, i) =>
//       i === index ? { ...item, [field]: value } : item
//     );
//     setChecklist(updated);
//   };

//   const removeChecklistItem = (index) => {
//     setChecklist(checklist.filter((_, i) => i !== index));
//   };

//   const handleDocumentUpload = async (files, types, notes) => {
//     try {
//       const lead = Array.isArray(leads)
//         ? leads.find((l) => l.studentId === studentId)
//         : null;
//       if (!lead?.id) {
//         throw new Error("No lead found for this student");
//       }

//       const formData = new FormData();
//       files.forEach((file) => formData.append("files", file));
//       formData.append("types", JSON.stringify(types));
//       formData.append("notes", JSON.stringify(notes));

//       await uploadDocument(lead.id, formData);
//       toast.success("Documents uploaded successfully!");
//       setShowDocumentModal(false);
//       fetchLeadDocuments(lead.id);
//     } catch (err) {
//       toast.error("Failed to upload documents");
//       console.error("Upload documents error:", err);
//     }
//   };

//   if (!hasLoaded || (loading && !studentProfile)) {
//     return (
//       <div className="flex items-center justify-center h-64">
//         <LoadingSpinner size="lg" />
//       </div>
//     );
//   }

//   if (!studentProfile) {
//     return (
//       <div className="text-center py-8">
//         <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
//         <h3 className="text-lg font-medium text-gray-900">Profile not found</h3>
//         <p className="text-gray-600">
//           The student profile could not be loaded.
//         </p>
//         <Button
//           onClick={() => navigate("/consultant/my-leads")}
//           className="mt-4"
//         >
//           Back to Leads
//         </Button>
//       </div>
//     );
//   }

//   // Map studentProfile to match provided response structure
//   const personalInfo = {
//     name: studentProfile.personalInfo?.fullName
//       ? `${studentProfile.personalInfo.fullName.firstName} ${studentProfile.personalInfo.fullName.lastName}`
//       : "N/A",
//     email: studentProfile.personalInfo?.email || "N/A",
//     phone: studentProfile.personalInfo?.phone || "N/A",
//     dob: studentProfile.personalInfo?.dateOfBirth || null,
//     nationality: studentProfile.personalInfo?.residenceCountry || "N/A",
//     gender: studentProfile.personalInfo?.gender || "N/A",
//   };

//   const educationalBackground = studentProfile.educationalBackground
//     ? [
//         {
//           institution:
//             studentProfile.educationalBackground.intermediate?.board || "N/A",
//           degree:
//             studentProfile.educationalBackground.intermediate
//               ?.preEngineeringOrPreMedical || "N/A",
//           startYear:
//             studentProfile.educationalBackground.intermediate?.year || "N/A",
//           endYear:
//             studentProfile.educationalBackground.intermediate?.year || "N/A",
//           gpa:
//             studentProfile.educationalBackground.intermediate
//               ?.scorePercentage || null,
//         },
//         {
//           institution:
//             studentProfile.educationalBackground.matriculation?.board || "N/A",
//           degree:
//             studentProfile.educationalBackground.matriculation?.subjects ||
//             "N/A",
//           startYear:
//             studentProfile.educationalBackground.matriculation?.year || "N/A",
//           endYear:
//             studentProfile.educationalBackground.matriculation?.year || "N/A",
//           gpa:
//             studentProfile.educationalBackground.matriculation
//               ?.scorePercentage || null,
//         },
//       ]
//     : [];

//   const studyPreferences = {
//     destination: studentProfile.studyPreferences?.preferredCountry || "N/A",
//     level: studentProfile.educationalBackground?.studyLevel || "N/A",
//     fields: studentProfile.studyPreferences?.specialization
//       ? [studentProfile.studyPreferences.specialization]
//       : [],
//     budget: studentProfile.studyPreferences?.budget || "N/A",
//   };

//   // Derive application status from tasks
//   const applicationStatus = tasks.length
//     ? tasks.every((task) => task.status === "completed")
//       ? "Completed"
//       : "In Progress"
//     : "Not Started";
//   const progressPercent = tasks.length
//     ? (tasks.filter((task) => task.status === "completed").length /
//         tasks.length) *
//       100
//     : 0;

//   // Use lead.history for recent activity
//   const lead = Array.isArray(leads)
//     ? leads.find((l) => l.studentId === studentId)
//     : null;
//   const recentActivity = lead?.history
//     ? lead.history.slice(0, 3).map((entry) => ({
//         action: entry.note || entry.action || "Activity recorded",
//         timestamp: new Date(entry.timestamp).toLocaleString(),
//       }))
//     : [];

//   return (
//     <div className="p-6 space-y-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
//       {/* Header */}
//       <div className="flex justify-between items-center">
//         <div>
//           <h1 className="text-2xl font-bold text-gray-900">Student Profile</h1>
//           <p className="text-gray-600">
//             Manage student information and application progress
//           </p>
//         </div>
//         <div className="flex space-x-3">
//           <Button variant="outline" onClick={() => setShowMessageModal(true)}>
//             <MessageSquare className="h-4 w-4 mr-2" />
//             Send Message
//           </Button>
//           <Button variant="outline" onClick={() => setShowChecklistModal(true)}>
//             <FileText className="h-4 w-4 mr-2" />
//             Create Checklist
//           </Button>
//           <Button onClick={() => setShowDocumentModal(true)}>
//             <Upload className="h-4 w-4 mr-2" />
//             Upload Documents
//           </Button>
//         </div>
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//         {/* Personal Information */}
//         <div className="lg:col-span-2 space-y-6">
//           <Card title="Personal Information">
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Full Name
//                 </label>
//                 <p className="text-gray-900">{personalInfo.name}</p>
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Email
//                 </label>
//                 <div className="flex items-center">
//                   <Mail className="h-4 w-4 text-gray-400 mr-2" />
//                   <p className="text-gray-900">{personalInfo.email}</p>
//                 </div>
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Phone
//                 </label>
//                 <div className="flex items-center">
//                   <Phone className="h-4 w-4 text-gray-400 mr-2" />
//                   <p className="text-gray-900">{personalInfo.phone}</p>
//                 </div>
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Date of Birth
//                 </label>
//                 <div className="flex items-center">
//                   <Calendar className="h-4 w-4 text-gray-400 mr-2" />
//                   <p className="text-gray-900">
//                     {personalInfo.dob
//                       ? new Date(personalInfo.dob).toLocaleDateString()
//                       : "N/A"}
//                   </p>
//                 </div>
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Nationality
//                 </label>
//                 <div className="flex items-center">
//                   <MapPin className="h-4 w-4 text-gray-400 mr-2" />
//                   <p className="text-gray-900">{personalInfo.nationality}</p>
//                 </div>
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Gender
//                 </label>
//                 <p className="text-gray-900 capitalize">
//                   {personalInfo.gender}
//                 </p>
//               </div>
//             </div>
//           </Card>

//           {/* Educational Background */}
//           <Card title="Educational Background">
//             {Array.isArray(educationalBackground) &&
//             educationalBackground.length > 0 ? (
//               <div className="space-y-4">
//                 {educationalBackground.map((edu, index) => (
//                   <div key={index} className="border-l-4 border-blue-500 pl-4">
//                     <h4 className="font-medium text-gray-900">
//                       {edu.institution}
//                     </h4>
//                     <p className="text-gray-600">{edu.degree}</p>
//                     <p className="text-sm text-gray-500">
//                       {edu.startYear} - {edu.endYear}
//                     </p>
//                     {edu.gpa && (
//                       <p className="text-sm text-gray-500">Score: {edu.gpa}%</p>
//                     )}
//                   </div>
//                 ))}
//               </div>
//             ) : (
//               <p className="text-gray-500">
//                 No educational background available
//               </p>
//             )}
//           </Card>

//           {/* Study Preferences */}
//           <Card title="Study Preferences">
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Preferred Destination
//                 </label>
//                 <p className="text-gray-900">{studyPreferences.destination}</p>
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Study Level
//                 </label>
//                 <p className="text-gray-900">{studyPreferences.level}</p>
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Field of Study
//                 </label>
//                 <p className="text-gray-900">
//                   {studyPreferences.fields.length
//                     ? studyPreferences.fields.join(", ")
//                     : "N/A"}
//                 </p>
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Budget Range
//                 </label>
//                 <p className="text-gray-900">{studyPreferences.budget}</p>
//               </div>
//             </div>
//           </Card>
//         </div>

//         {/* Application Progress Sidebar */}
//         <div className="space-y-6">
//           {/* Application Status */}
//           <Card title="Application Status">
//             <div className="space-y-3">
//               <div className="flex items-center justify-between">
//                 <span className="text-sm font-medium text-gray-700">
//                   Status
//                 </span>
//                 <Badge
//                   className={
//                     applicationStatus === "Completed"
//                       ? "bg-green-100 text-green-800"
//                       : "bg-blue-100 text-blue-800"
//                   }
//                 >
//                   {applicationStatus}
//                 </Badge>
//               </div>
//               <div className="flex items-center justify-between">
//                 <span className="text-sm font-medium text-gray-700">
//                   Progress
//                 </span>
//                 <span className="text-sm text-gray-600">
//                   {Math.round(progressPercent)}%
//                 </span>
//               </div>
//               <div className="w-full bg-gray-200 rounded-full h-2">
//                 <div
//                   className="bg-blue-600 h-2 rounded-full"
//                   style={{ width: `${progressPercent}%` }}
//                 ></div>
//               </div>
//             </div>
//           </Card>

//           {/* Application Checklist */}
//           <Card title="Application Checklist">
//             {tasks.length ? (
//               <div className="space-y-2">
//                 {tasks.map((task) => (
//                   <div key={task.id} className="flex items-center space-x-2">
//                     <input
//                       type="checkbox"
//                       checked={task.status === "completed"}
//                       readOnly
//                       className="rounded border-gray-300"
//                     />
//                     <span
//                       className={`text-sm ${
//                         task.status === "completed"
//                           ? "text-gray-500 line-through"
//                           : "text-gray-900"
//                       }`}
//                     >
//                       {task.description}
//                     </span>
//                   </div>
//                 ))}
//               </div>
//             ) : (
//               <p className="text-gray-500 text-sm">No checklist available</p>
//             )}
//           </Card>

//           {/* Recent Activity */}
//           <Card title="Recent Activity">
//             {recentActivity.length ? (
//               <div className="space-y-3">
//                 {recentActivity.map((activity, index) => (
//                   <div key={index} className="flex items-start space-x-3">
//                     <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
//                     <div>
//                       <p className="text-sm text-gray-900">{activity.action}</p>
//                       <p className="text-xs text-gray-500">
//                         {activity.timestamp}
//                       </p>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             ) : (
//               <p className="text-gray-500 text-sm">No recent activity</p>
//             )}
//           </Card>
//         </div>
//       </div>

//       {/* Send Message Modal */}
//       <Modal
//         isOpen={showMessageModal}
//         onClose={() => {
//           setShowMessageModal(false);
//           setMessage("");
//         }}
//         title="Send Message to Student"
//       >
//         <div className="space-y-4">
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Message
//             </label>
//             <Input
//               as="textarea"
//               rows={4}
//               value={message}
//               onChange={(e) => setMessage(e.target.value)}
//               placeholder="Enter your message..."
//               className="block w-full px-3 py-2 border border-gray-200 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
//             />
//           </div>
//           <div className="flex justify-end space-x-3">
//             <Button
//               variant="outline"
//               onClick={() => {
//                 setShowMessageModal(false);
//                 setMessage("");
//               }}
//             >
//               Cancel
//             </Button>
//             <Button onClick={handleSendMessage}>Send Message</Button>
//           </div>
//         </div>
//       </Modal>

//       {/* Create Checklist Modal */}
//       <Modal
//         isOpen={showChecklistModal}
//         onClose={() => {
//           setShowChecklistModal(false);
//           setChecklist([]);
//         }}
//         title="Create Application Checklist"
//         size="lg"
//       >
//         <div className="space-y-4">
//           <div className="space-y-3">
//             {checklist.map((item, index) => (
//               <div key={index} className="flex items-center space-x-3">
//                 <Input
//                   type="text"
//                   value={item.task}
//                   onChange={(e) =>
//                     updateChecklistItem(index, "task", e.target.value)
//                   }
//                   placeholder="Enter task..."
//                   className="flex-1 px-3 py-2 border border-gray-200 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
//                 />
//                 <select
//                   value={item.status}
//                   onChange={(e) =>
//                     updateChecklistItem(index, "status", e.target.value)
//                   }
//                   className="px-3 py-2 border border-gray-200 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
//                 >
//                   <option value="pending">Pending</option>
//                   <option value="completed">Completed</option>
//                 </select>
//                 <Button
//                   variant="outline"
//                   size="sm"
//                   onClick={() => removeChecklistItem(index)}
//                 >
//                   Remove
//                 </Button>
//               </div>
//             ))}
//           </div>
//           <Button variant="outline" onClick={addChecklistItem}>
//             Add Item
//           </Button>
//           <div className="flex justify-end space-x-3">
//             <Button
//               variant="outline"
//               onClick={() => {
//                 setShowChecklistModal(false);
//                 setChecklist([]);
//               }}
//             >
//               Cancel
//             </Button>
//             <Button onClick={handleCreateChecklist}>Create Checklist</Button>
//           </div>
//         </div>
//       </Modal>

//       {/* Document Upload Modal */}
//       <Modal
//         isOpen={showDocumentModal}
//         onClose={() => setShowDocumentModal(false)}
//         title="Upload Documents"
//         size="lg"
//       >
//         <DocumentUpload
//           onUpload={handleDocumentUpload}
//           onCancel={() => setShowDocumentModal(false)}
//         />
//       </Modal>
//     </div>
//   );
// };

// export default StudentProfiles;
