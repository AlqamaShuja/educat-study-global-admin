// pages/consultant/StudentProfiles.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useApi from "../../hooks/useApi";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Modal from "../../components/ui/Modal";
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
  Clock,
  Upload,
  Download,
  AlertCircle,
} from "lucide-react";

const StudentProfiles = () => {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const { request, loading } = useApi();

  const [profile, setProfile] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [applicationProgress, setApplicationProgress] = useState(null);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showChecklistModal, setShowChecklistModal] = useState(false);
  const [message, setMessage] = useState("");
  const [checklist, setChecklist] = useState([]);

  useEffect(() => {
    if (studentId) {
      fetchStudentProfile();
      fetchApplicationProgress();
    }
  }, [studentId]);

  const fetchStudentProfile = async () => {
    try {
      const response = await request(
        `/consultant/students/${studentId}/profile`
      );
      setProfile(response);
    } catch (error) {
      console.error("Error fetching student profile:", error);
    }
  };

  const fetchApplicationProgress = async () => {
    try {
      const response = await request(
        `/consultant/students/${studentId}/progress`
      );
      setApplicationProgress(response);
    } catch (error) {
      console.error("Error fetching application progress:", error);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    try {
      await request(`/consultant/students/${studentId}/messages`, {
        method: "POST",
        data: { message },
      });

      setMessage("");
      setShowMessageModal(false);
      alert("Message sent successfully!");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleCreateChecklist = async () => {
    try {
      await request(`/consultant/students/${studentId}/checklist`, {
        method: "POST",
        data: { items: checklist },
      });

      setShowChecklistModal(false);
      setChecklist([]);
      fetchApplicationProgress();
      alert("Checklist created successfully!");
    } catch (error) {
      console.error("Error creating checklist:", error);
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
      const formData = new FormData();
      files.forEach((file, index) => {
        formData.append("files", file);
      });
      formData.append("types", JSON.stringify(types));
      formData.append("notes", JSON.stringify(notes));

      await request(`/consultant/students/${studentId}/documents`, {
        method: "PUT",
        data: formData,
        headers: { "Content-Type": "multipart/form-data" },
      });

      setShowDocumentModal(false);
      alert("Documents uploaded successfully!");
    } catch (error) {
      console.error("Error uploading documents:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!profile) {
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

  const personalInfo = profile.personalInfo || {};
  const educationalBackground = profile.educationalBackground || [];
  const studyPreferences = profile.studyPreferences || {};

  return (
    <div className="space-y-6">
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
          <Card>
            <Card.Header>
              <div className="flex items-center">
                <User className="h-5 w-5 text-gray-400 mr-2" />
                <h3 className="text-lg font-semibold">Personal Information</h3>
              </div>
            </Card.Header>
            <Card.Content>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <p className="text-gray-900">{personalInfo.name || "N/A"}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 text-gray-400 mr-2" />
                    <p className="text-gray-900">
                      {personalInfo.email || "N/A"}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 text-gray-400 mr-2" />
                    <p className="text-gray-900">
                      {personalInfo.phone || "N/A"}
                    </p>
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
                    <p className="text-gray-900">
                      {personalInfo.nationality || "N/A"}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gender
                  </label>
                  <p className="text-gray-900 capitalize">
                    {personalInfo.gender || "N/A"}
                  </p>
                </div>
              </div>
            </Card.Content>
          </Card>

          {/* Educational Background */}
          <Card>
            <Card.Header>
              <div className="flex items-center">
                <GraduationCap className="h-5 w-5 text-gray-400 mr-2" />
                <h3 className="text-lg font-semibold">
                  Educational Background
                </h3>
              </div>
            </Card.Header>
            <Card.Content>
              {Array.isArray(educationalBackground) &&
              educationalBackground.length > 0 ? (
                <div className="space-y-4">
                  {educationalBackground.map((edu, index) => (
                    <div
                      key={index}
                      className="border-l-4 border-blue-500 pl-4"
                    >
                      <h4 className="font-medium text-gray-900">
                        {edu.institution || "N/A"}
                      </h4>
                      <p className="text-gray-600">{edu.degree || "N/A"}</p>
                      <p className="text-sm text-gray-500">
                        {edu.startYear} - {edu.endYear || "Present"}
                      </p>
                      {edu.gpa && (
                        <p className="text-sm text-gray-500">GPA: {edu.gpa}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">
                  No educational background information available
                </p>
              )}
            </Card.Content>
          </Card>

          {/* Study Preferences */}
          <Card>
            <Card.Header>
              <h3 className="text-lg font-semibold">Study Preferences</h3>
            </Card.Header>
            <Card.Content>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Preferred Destination
                  </label>
                  <p className="text-gray-900">
                    {studyPreferences.destination || "N/A"}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Study Level
                  </label>
                  <p className="text-gray-900">
                    {studyPreferences.level || "N/A"}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Field of Study
                  </label>
                  <p className="text-gray-900">
                    {Array.isArray(studyPreferences.fields)
                      ? studyPreferences.fields.join(", ")
                      : studyPreferences.fields || "N/A"}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Budget Range
                  </label>
                  <p className="text-gray-900">
                    {studyPreferences.budget || "N/A"}
                  </p>
                </div>
              </div>
            </Card.Content>
          </Card>
        </div>

        {/* Application Progress Sidebar */}
        <div className="space-y-6">
          {/* Application Status */}
          <Card>
            <Card.Header>
              <h3 className="text-lg font-semibold">Application Status</h3>
            </Card.Header>
            <Card.Content>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    Status
                  </span>
                  <Badge className="bg-blue-100 text-blue-800">
                    {applicationProgress?.applicationStatus || "In Progress"}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    Progress
                  </span>
                  <span className="text-sm text-gray-600">75%</span>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full w-3/4"></div>
                </div>
              </div>
            </Card.Content>
          </Card>

          {/* Application Checklist */}
          <Card>
            <Card.Header>
              <h3 className="text-lg font-semibold">Application Checklist</h3>
            </Card.Header>
            <Card.Content>
              {applicationProgress?.checklist?.items ? (
                <div className="space-y-2">
                  {applicationProgress.checklist.items.map((item, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={item.status === "completed"}
                        readOnly
                        className="rounded border-gray-300"
                      />
                      <span
                        className={`text-sm ${
                          item.status === "completed"
                            ? "text-gray-500 line-through"
                            : "text-gray-900"
                        }`}
                      >
                        {item.task}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No checklist available</p>
              )}
            </Card.Content>
          </Card>

          {/* Recent Activity */}
          <Card>
            <Card.Header>
              <h3 className="text-lg font-semibold">Recent Activity</h3>
            </Card.Header>
            <Card.Content>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm text-gray-900">Profile updated</p>
                    <p className="text-xs text-gray-500">2 hours ago</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm text-gray-900">Document uploaded</p>
                    <p className="text-xs text-gray-500">1 day ago</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm text-gray-900">Meeting scheduled</p>
                    <p className="text-xs text-gray-500">3 days ago</p>
                  </div>
                </div>
              </div>
            </Card.Content>
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
            <textarea
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter your message..."
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
                <input
                  type="text"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  value={item.task}
                  onChange={(e) =>
                    updateChecklistItem(index, "task", e.target.value)
                  }
                  placeholder="Enter task..."
                />

                <select
                  className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  value={item.status}
                  onChange={(e) =>
                    updateChecklistItem(index, "status", e.target.value)
                  }
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
