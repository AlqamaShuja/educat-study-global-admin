import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useConsultantStore from "../../stores/consultantStore";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Modal from "../../components/ui/Modal";
import Input from "../../components/ui/Input";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import DocumentUpload from "../../components/forms/DocumentUpload";
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
} from "lucide-react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const StudentProfiles = () => {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const {
    studentProfile,
    leads,
    tasks,
    documents,
    fetchLeads,
    fetchStudentProfile,
    sendMessage,
    createTask,
    uploadDocument,
    fetchLeadTasks,
    fetchLeadDocuments,
    loading,
    error,
  } = useConsultantStore();

  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showChecklistModal, setShowChecklistModal] = useState(false);
  const [message, setMessage] = useState("");
  const [checklist, setChecklist] = useState([]);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [leadsLoaded, setLeadsLoaded] = useState(false);

  useEffect(() => {
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

      // Ensure leads are loaded
      if (!Array.isArray(leads) || !leads.length) {
        console.log("Leads not loaded, fetching leads...");
        fetchLeads()
          .then(() => {
            console.log("Fetch leads completed");
            setLeadsLoaded(true);
          })
          .catch((err) => {
            console.error("Fetch leads failed:", err);
            setLeadsLoaded(true);
          });
      } else {
        setLeadsLoaded(true);
      }
    }
  }, [studentId]);

  useEffect(() => {
    if (leadsLoaded && Array.isArray(leads)) {
      const lead = leads.find((l) => l.studentId === studentId);
      if (lead?.id) {
        console.log(`Fetching tasks and documents for leadId: ${lead.id}`);
        fetchLeadTasks(lead.id);
        fetchLeadDocuments(lead.id);
      } else {
        console.warn(`No lead found for studentId: ${studentId}`);
      }
    }
  }, [leadsLoaded, studentId]);

  useEffect(() => {
    if (error) {
      console.error("Store error:", error);
      toast.error(error);
    }
  }, [error]);

  useEffect(() => {
    console.log("Student profile:", studentProfile);
    console.log("Leads:", leads);
    console.log("Tasks:", tasks);
    console.log("Documents:", documents);
  }, [studentProfile, leads, tasks, documents]);

  const handleSendMessage = async () => {
    if (!message.trim()) {
      toast.error("Message cannot be empty");
      return;
    }

    try {
      await sendMessage(studentId, message);
      toast.success("Message sent successfully!");
      setMessage("");
      setShowMessageModal(false);
    } catch (err) {
      toast.error("Failed to send message");
      console.error("Send message error:", err);
    }
  };

  const handleCreateChecklist = async () => {
    if (!checklist.length) {
      toast.error("Checklist cannot be empty");
      return;
    }

    try {
      const lead = Array.isArray(leads)
        ? leads.find((l) => l.studentId === studentId)
        : null;
      if (!lead?.id) {
        throw new Error("No lead found for this student");
      }

      for (const item of checklist) {
        await createTask(lead.id, {
          description: item.task,
          status: item.status,
          dueDate: null,
        });
      }

      toast.success("Checklist created successfully!");
      setChecklist([]);
      setShowChecklistModal(false);
      fetchLeadTasks(lead.id);
    } catch (err) {
      toast.error("Failed to create checklist");
      console.error("Create checklist error:", err);
    }
  };

  const addChecklistItem = () => {
    setChecklist([...checklist, { task: "", status: "pending" }]);
  };

  const updateChecklistItem = (index, field, value) => {
    const updated = checklist.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    );
    setChecklist(updated);
  };

  const removeChecklistItem = (index) => {
    setChecklist(checklist.filter((_, i) => i !== index));
  };

  const handleDocumentUpload = async (files, types, notes) => {
    try {
      const lead = Array.isArray(leads)
        ? leads.find((l) => l.studentId === studentId)
        : null;
      if (!lead?.id) {
        throw new Error("No lead found for this student");
      }

      const formData = new FormData();
      files.forEach((file) => formData.append("files", file));
      formData.append("types", JSON.stringify(types));
      formData.append("notes", JSON.stringify(notes));

      await uploadDocument(lead.id, formData);
      toast.success("Documents uploaded successfully!");
      setShowDocumentModal(false);
      fetchLeadDocuments(lead.id);
    } catch (err) {
      toast.error("Failed to upload documents");
      console.error("Upload documents error:", err);
    }
  };

  if (!hasLoaded || (loading && !studentProfile)) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

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

  // Map studentProfile to match provided response structure
  const personalInfo = {
    name: studentProfile.personalInfo?.fullName
      ? `${studentProfile.personalInfo.fullName.firstName} ${studentProfile.personalInfo.fullName.lastName}`
      : "N/A",
    email: studentProfile.personalInfo?.email || "N/A",
    phone: studentProfile.personalInfo?.phone || "N/A",
    dob: studentProfile.personalInfo?.dateOfBirth || null,
    nationality: studentProfile.personalInfo?.residenceCountry || "N/A",
    gender: studentProfile.personalInfo?.gender || "N/A",
  };

  const educationalBackground = studentProfile.educationalBackground
    ? [
        {
          institution:
            studentProfile.educationalBackground.intermediate?.board || "N/A",
          degree:
            studentProfile.educationalBackground.intermediate
              ?.preEngineeringOrPreMedical || "N/A",
          startYear:
            studentProfile.educationalBackground.intermediate?.year || "N/A",
          endYear:
            studentProfile.educationalBackground.intermediate?.year || "N/A",
          gpa:
            studentProfile.educationalBackground.intermediate
              ?.scorePercentage || null,
        },
        {
          institution:
            studentProfile.educationalBackground.matriculation?.board || "N/A",
          degree:
            studentProfile.educationalBackground.matriculation?.subjects ||
            "N/A",
          startYear:
            studentProfile.educationalBackground.matriculation?.year || "N/A",
          endYear:
            studentProfile.educationalBackground.matriculation?.year || "N/A",
          gpa:
            studentProfile.educationalBackground.matriculation
              ?.scorePercentage || null,
        },
      ]
    : [];

  const studyPreferences = {
    destination: studentProfile.studyPreferences?.preferredCountry || "N/A",
    level: studentProfile.educationalBackground?.studyLevel || "N/A",
    fields: studentProfile.studyPreferences?.specialization
      ? [studentProfile.studyPreferences.specialization]
      : [],
    budget: studentProfile.studyPreferences?.budget || "N/A",
  };

  // Derive application status from tasks
  const applicationStatus = tasks.length
    ? tasks.every((task) => task.status === "completed")
      ? "Completed"
      : "In Progress"
    : "Not Started";
  const progressPercent = tasks.length
    ? (tasks.filter((task) => task.status === "completed").length /
        tasks.length) *
      100
    : 0;

  // Use lead.history for recent activity
  const lead = Array.isArray(leads)
    ? leads.find((l) => l.studentId === studentId)
    : null;
  const recentActivity = lead?.history
    ? lead.history.slice(0, 3).map((entry) => ({
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
            Manage student information and application progress
          </p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={() => setShowMessageModal(true)}>
            <MessageSquare className="h-4 w-4 mr-2" />
            Send Message
          </Button>
          <Button variant="outline" onClick={() => setShowChecklistModal(true)}>
            <FileText className="h-4 w-4 mr-2" />
            Create Checklist
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
            {Array.isArray(educationalBackground) &&
            educationalBackground.length > 0 ? (
              <div className="space-y-4">
                {educationalBackground.map((edu, index) => (
                  <div key={index} className="border-l-4 border-blue-500 pl-4">
                    <h4 className="font-medium text-gray-900">
                      {edu.institution}
                    </h4>
                    <p className="text-gray-600">{edu.degree}</p>
                    <p className="text-sm text-gray-500">
                      {edu.startYear} - {edu.endYear}
                    </p>
                    {edu.gpa && (
                      <p className="text-sm text-gray-500">Score: {edu.gpa}%</p>
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
                  {studyPreferences.fields.length
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
                      : "bg-blue-100 text-blue-800"
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
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
            </div>
          </Card>

          {/* Application Checklist */}
          <Card title="Application Checklist">
            {tasks.length ? (
              <div className="space-y-2">
                {tasks.map((task) => (
                  <div key={task.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={task.status === "completed"}
                      readOnly
                      className="rounded border-gray-300"
                    />
                    <span
                      className={`text-sm ${
                        task.status === "completed"
                          ? "text-gray-500 line-through"
                          : "text-gray-900"
                      }`}
                    >
                      {task.description}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No checklist available</p>
            )}
          </Card>

          {/* Recent Activity */}
          <Card title="Recent Activity">
            {recentActivity.length ? (
              <div className="space-y-3">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div>
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
        </div>
      </div>

      {/* Send Message Modal */}
      <Modal
        isOpen={showMessageModal}
        onClose={() => {
          setShowMessageModal(false);
          setMessage("");
        }}
        title="Send Message to Student"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message
            </label>
            <Input
              as="textarea"
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter your message..."
              className="block w-full px-3 py-2 border border-gray-200 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => {
                setShowMessageModal(false);
                setMessage("");
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSendMessage}>Send Message</Button>
          </div>
        </div>
      </Modal>

      {/* Create Checklist Modal */}
      <Modal
        isOpen={showChecklistModal}
        onClose={() => {
          setShowChecklistModal(false);
          setChecklist([]);
        }}
        title="Create Application Checklist"
        size="lg"
      >
        <div className="space-y-4">
          <div className="space-y-3">
            {checklist.map((item, index) => (
              <div key={index} className="flex items-center space-x-3">
                <Input
                  type="text"
                  value={item.task}
                  onChange={(e) =>
                    updateChecklistItem(index, "task", e.target.value)
                  }
                  placeholder="Enter task..."
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
                <select
                  value={item.status}
                  onChange={(e) =>
                    updateChecklistItem(index, "status", e.target.value)
                  }
                  className="px-3 py-2 border border-gray-200 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                </select>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeChecklistItem(index)}
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
          <Button variant="outline" onClick={addChecklistItem}>
            Add Item
          </Button>
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => {
                setShowChecklistModal(false);
                setChecklist([]);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateChecklist}>Create Checklist</Button>
          </div>
        </div>
      </Modal>

      {/* Document Upload Modal */}
      <Modal
        isOpen={showDocumentModal}
        onClose={() => setShowDocumentModal(false)}
        title="Upload Documents"
        size="lg"
      >
        <DocumentUpload
          onUpload={handleDocumentUpload}
          onCancel={() => setShowDocumentModal(false)}
        />
      </Modal>
    </div>
  );
};

export default StudentProfiles;
