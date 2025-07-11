// pages/consultant/StudentProfiles.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";

// Custom hook to get location state (replace with your router's method)
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
  Eye,
  Download,
  Image,
  Edit,
  Package,
  DollarSign,
  Briefcase,
  List,
  CheckSquare,
} from "lucide-react";
import LeadChecklistModal from "../../components/consultant/LeadChecklistModal";

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
  // Add these state variables after your existing ones
  const [showChecklistModal, setShowChecklistModal] = useState(false);
  const [editingChecklist, setEditingChecklist] = useState(null);
  const [studentChecklists, setStudentChecklists] = useState([]);

  console.log(locationState, "ascnajcnas:locationState");

  // Get lead data from navigation state
  const leadFromState = locationState?.state?.lead;

  const {
    studentProfile,
    tasks,
    documents,
    proposals,
    fetchStudentProfile,
    sendMessage,
    createTask,
    uploadDocument,
    fetchLeadTasks,
    fetchLeadDocuments,
    fetchProposalsByLead,
    createProposal,
    updateProposal,
    deleteProposal,
    loading,
    error,
    clearError,
    checklists,
    createChecklist,
    fetchStudentChecklists,
    updateChecklist,
    deleteChecklist,
  } = useConsultantStore();

  console.log(documents, "sacnacnajcnasjcn");

  // Modal states
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showProposalModal, setShowProposalModal] = useState(false);
  const [showProposalDetailsModal, setShowProposalDetailsModal] =
    useState(false);

  // Form states
  const [messageText, setMessageText] = useState("");
  const [taskList, setTaskList] = useState([]);
  const [documentFiles, setDocumentFiles] = useState([]);
  const [documentTypes, setDocumentTypes] = useState([]);
  const [documentNotes, setDocumentNotes] = useState([]);
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [editingProposal, setEditingProposal] = useState(false);

  // Proposal form states
  const [proposalForm, setProposalForm] = useState({
    title: "",
    description: "",
    proposedProgram: "",
    proposedUniversity: "",
    estimatedCost: "",
    timeline: "",
    expiresAt: "",
    details: {},
  });

  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [userProposals, setUserProposals] = useState([]);

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

      // Fetch tasks, documents, and proposals for this lead
      if (currentLead.id) {
        console.log(
          `Fetching tasks, documents, and proposals for leadId: ${currentLead.id}`
        );
        fetchLeadTasks(currentLead.id);
        fetchLeadDocuments(currentLead.id);
        fetchProposals();
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

  // Add this useEffect after your existing one
  useEffect(() => {
    if (studentId && currentLead) {
      fetchStudentChecklists(studentId)
        .then((res) => {
          console.log(res, "akncancasjcasjcnasn");
          
          setStudentChecklists(res?.data || []);
        })
        .catch((err) => {
          console.error("Error fetching checklists:", err);
          setStudentChecklists([]);
        });
    }
  }, [studentId, currentLead, fetchStudentChecklists]);

  // Fetch proposals for the current lead
  const fetchProposals = async () => {
    if (currentLead?.id) {
      try {
        const proposalsData = await fetchProposalsByLead(currentLead.id);
        setUserProposals(proposalsData || []);
      } catch (error) {
        console.error("Error fetching proposals:", error);
        setUserProposals([]);
      }
    }
  };

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

  // Handle Create/Update Proposal
  const handleProposalSubmit = async () => {
    if (!proposalForm.title.trim()) {
      showNotification("Proposal title is required", "error");
      return;
    }

    if (!currentLead?.id) {
      showNotification("No lead found for this student", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const proposalData = {
        ...proposalForm,
        estimatedCost: proposalForm.estimatedCost
          ? parseFloat(proposalForm.estimatedCost)
          : null,
        expiresAt: proposalForm.expiresAt
          ? new Date(proposalForm.expiresAt).toISOString()
          : null,
      };

      if (editingProposal && selectedProposal) {
        await updateProposal(selectedProposal.id, proposalData);
        showNotification("Proposal updated successfully!", "success");
      } else {
        await createProposal(currentLead.id, proposalData);
        showNotification("Proposal created successfully!", "success");
      }

      // Reset form and close modal
      setProposalForm({
        title: "",
        description: "",
        proposedProgram: "",
        proposedUniversity: "",
        estimatedCost: "",
        timeline: "",
        expiresAt: "",
        details: {},
      });
      setShowProposalModal(false);
      setEditingProposal(false);
      setSelectedProposal(null);

      // Refresh proposals
      await fetchProposals();
    } catch (err) {
      showNotification("Failed to save proposal", "error");
      console.error("Proposal save error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Edit Proposal
  const handleEditProposal = (proposal) => {
    setSelectedProposal(proposal);
    setProposalForm({
      title: proposal.title || "",
      description: proposal.description || "",
      proposedProgram: proposal.proposedProgram || "",
      proposedUniversity: proposal.proposedUniversity || "",
      estimatedCost: proposal.estimatedCost
        ? proposal.estimatedCost.toString()
        : "",
      timeline: proposal.timeline || "",
      expiresAt: proposal.expiresAt
        ? new Date(proposal.expiresAt).toISOString().slice(0, 16)
        : "",
      details: proposal.details || {},
    });
    setEditingProposal(true);
    setShowProposalModal(true);
  };

  // Handle View Proposal Details
  const handleViewProposal = (proposal) => {
    setSelectedProposal(proposal);
    setShowProposalDetailsModal(true);
  };

  // Handle Delete Proposal
  const handleDeleteProposal = async (proposalId) => {
    if (window.confirm("Are you sure you want to delete this proposal?")) {
      try {
        await deleteProposal(proposalId);
        showNotification("Proposal deleted successfully!", "success");
        await fetchProposals();
      } catch (err) {
        showNotification("Failed to delete proposal", "error");
        console.error("Delete proposal error:", err);
      }
    }
  };

  // Get proposal status color
  const getProposalStatusColor = (status) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      sent: "bg-blue-100 text-blue-800",
      accepted: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
      expired: "bg-gray-100 text-gray-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
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

  // File handling logic
  const getFileExtension = (filePath) => {
    return filePath.split(".").pop().toLowerCase();
  };

  const isImageFile = (doc) => {
    const imageTypes = ["photo", "image"];
    const imageExtensions = ["jpg", "jpeg", "png", "gif", "bmp", "webp"];
    return (
      imageTypes.includes(doc.type.toLowerCase()) ||
      imageExtensions.includes(getFileExtension(doc.filePath))
    );
  };

  const isPdfFile = (doc) => {
    return (
      doc.type.toLowerCase().includes("pdf") ||
      getFileExtension(doc.filePath) === "pdf"
    );
  };

  const handleViewDocument = (doc) => {
    const fileUrl = `${
      import.meta.env.VITE_API_BASE_URL || "http://localhost:5009"
    }/api/v1/file/documents/${doc.id}`;

    if (isImageFile(doc)) {
      setSelectedImage({ ...doc, url: fileUrl });
      setShowImageModal(true);
    } else if (isPdfFile(doc)) {
      window.open(fileUrl, "_blank");
    } else {
      // Download other files
      const link = document.createElement("a");
      link.href = fileUrl;
      link.download = `${doc.type}_${doc.id}.${getFileExtension(doc.filePath)}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const getFileIcon = (doc) => {
    if (isImageFile(doc)) return <Image className="h-4 w-4" />;
    if (isPdfFile(doc)) return <FileText className="h-4 w-4" />;
    return <Download className="h-4 w-4" />;
  };

  // Add these handler functions after your existing ones
  const handleCreateChecklist = async (checklistData) => {
    try {
      await createChecklist(studentId, checklistData);
      showNotification("Checklist created successfully!", "success");
      // Refresh checklists
      const updatedChecklists = await fetchStudentChecklists(studentId);
      setStudentChecklists(updatedChecklists || []);
    } catch (err) {
      showNotification("Failed to create checklist", "error");
      console.error("Create checklist error:", err);
    }
  };

  const handleEditChecklist = (checklist) => {
    setEditingChecklist(checklist);
    setShowChecklistModal(true);
  };

  const handleUpdateChecklist = async (checklistData) => {
    if (!editingChecklist) return;

    try {
      const res = await updateChecklist(editingChecklist.id, checklistData);
      console.log(res, "=ascmsancsacasnssss:res");
      
      showNotification("Checklist updated successfully!", "success");
      // Refresh checklists
      const updatedChecklists = await fetchStudentChecklists(studentId);
      setStudentChecklists(updatedChecklists.data || []);
      setEditingChecklist(null);
    } catch (err) {
      showNotification("Failed to update checklist", "error");
      console.error("Update checklist error:", err);
    }
  };

  const handleDeleteChecklist = async (checklistId) => {
    if (window.confirm("Are you sure you want to delete this checklist?")) {
      try {
        await deleteChecklist(checklistId);
        showNotification("Checklist deleted successfully!", "success");
        // Refresh checklists
        const updatedChecklists = await fetchStudentChecklists(studentId);
        setStudentChecklists(updatedChecklists || []);
      } catch (err) {
        showNotification("Failed to delete checklist", "error");
        console.error("Delete checklist error:", err);
      }
    }
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
          <Button
            variant="outline"
            onClick={() => {
              setEditingChecklist(null);
              setShowChecklistModal(true);
            }}
            className="bg-purple-50 border-purple-300 text-purple-700 hover:bg-purple-100"
          >
            <CheckSquare className="h-4 w-4 mr-2" />
            Create Checklist
          </Button>
          <Button onClick={() => setShowDocumentModal(true)}>
            <Upload className="h-4 w-4 mr-2" />
            Upload Documents
          </Button>
          <Button
            onClick={() => {
              setEditingProposal(false);
              setSelectedProposal(null);
              setProposalForm({
                title: "",
                description: "",
                proposedProgram: "",
                proposedUniversity: "",
                estimatedCost: "",
                timeline: "",
                expiresAt: "",
                details: {},
              });
              setShowProposalModal(true);
            }}
            className="bg-green-600 hover:bg-green-700"
          >
            <Briefcase className="h-4 w-4 mr-2" />
            Create Proposal
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

          {/* Proposals Section */}
          <Card title="Proposals">
            {userProposals && userProposals.length > 0 ? (
              <div className="space-y-4">
                {userProposals.map((proposal) => (
                  <div
                    key={proposal.id}
                    className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 mb-1">
                          {proposal.title}
                        </h4>
                        <p className="text-sm text-gray-600 mb-2">
                          {proposal.description}
                        </p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          {proposal.proposedProgram && (
                            <span>📚 {proposal.proposedProgram}</span>
                          )}
                          {proposal.proposedUniversity && (
                            <span>🏫 {proposal.proposedUniversity}</span>
                          )}
                          {proposal.estimatedCost && (
                            <span>
                              💰 ${proposal.estimatedCost.toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <Badge
                          className={getProposalStatusColor(proposal.status)}
                        >
                          {proposal.status.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="text-xs text-gray-400">
                        Created:{" "}
                        {new Date(proposal.createdAt).toLocaleDateString()}
                        {proposal.expiresAt && (
                          <span className="ml-2">
                            Expires:{" "}
                            {new Date(proposal.expiresAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewProposal(proposal)}
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditProposal(proposal)}
                          title="Edit Proposal"
                          className="text-blue-600 border-blue-300 hover:bg-blue-50"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteProposal(proposal.id)}
                          title="Delete Proposal"
                          className="text-red-600 border-red-300 hover:bg-red-50"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 mb-4">No proposals created yet</p>
                <Button
                  onClick={() => {
                    setEditingProposal(false);
                    setSelectedProposal(null);
                    setProposalForm({
                      title: "",
                      description: "",
                      proposedProgram: "",
                      proposedUniversity: "",
                      estimatedCost: "",
                      timeline: "",
                      expiresAt: "",
                      details: {},
                    });
                    setShowProposalModal(true);
                  }}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Briefcase className="h-4 w-4 mr-2" />
                  Create First Proposal
                </Button>
              </div>
            )}
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
                {documents?.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg group"
                  >
                    <div className="flex items-center space-x-2 flex-1">
                      {getFileIcon(doc)}
                      <div className="flex-1 min-w-0">
                        <span className="text-sm text-gray-900 capitalize block truncate">
                          {doc.type.replace("_", " ")}
                        </span>
                        {doc.notes && (
                          <span className="text-xs text-gray-500 block truncate">
                            {doc.notes}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
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

                      <button
                        onClick={() => handleViewDocument(doc)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                        title={
                          isImageFile(doc)
                            ? "View Image"
                            : isPdfFile(doc)
                            ? "Open PDF"
                            : "Download File"
                        }
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No documents uploaded</p>
            )}
          </Card>

          {/* Add this new Card after your Documents Card */}
          <Card title="Student Checklists">
            {studentChecklists && studentChecklists.length > 0 ? (
              <div className="space-y-3">
                {studentChecklists.map((checklist) => {
                  const completedItems =
                    checklist.items?.filter((item) => item.completed).length ||
                    0;
                  const totalItems = checklist.items?.length || 0;
                  const progress =
                    totalItems > 0
                      ? Math.round((completedItems / totalItems) * 100)
                      : 0;

                  return (
                    <div
                      key={checklist.id}
                      className="border rounded-lg p-3 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-gray-900 mb-1">
                            {checklist.title}
                          </h4>
                          {checklist.description && (
                            <p className="text-xs text-gray-600 mb-2">
                              {checklist.description}
                            </p>
                          )}
                          <div className="flex items-center space-x-2 text-xs text-gray-500">
                            <span>
                              {completedItems}/{totalItems} completed
                            </span>
                            {checklist.dueDate && (
                              <span className="flex items-center">
                                <Clock className="h-3 w-3 mr-1" />
                                {new Date(
                                  checklist.dueDate
                                ).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-1 ml-2">
                          <Badge
                            className={
                              checklist.priority === "high"
                                ? "bg-red-100 text-red-800"
                                : checklist.priority === "medium"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-green-100 text-green-800"
                            }
                          >
                            {checklist.priority}
                          </Badge>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="mb-3">
                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                          <span>Progress</span>
                          <span>{progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div
                            className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <Badge
                          className={
                            checklist.status === "completed"
                              ? "bg-green-100 text-green-800"
                              : checklist.status === "in_progress"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-gray-100 text-gray-800"
                          }
                        >
                          {checklist.status.replace("_", " ").toUpperCase()}
                        </Badge>

                        <div className="flex space-x-1">
                          <button
                            onClick={() => handleEditChecklist(checklist)}
                            className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                            title="Edit checklist"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteChecklist(checklist.id)}
                            className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                            title="Delete checklist"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-4">
                <List className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500 text-sm mb-3">
                  No checklists created yet
                </p>
                <Button
                  size="sm"
                  onClick={() => {
                    setEditingChecklist(null);
                    setShowChecklistModal(true);
                  }}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  <CheckSquare className="h-4 w-4 mr-2" />
                  Create First Checklist
                </Button>
              </div>
            )}
          </Card>

          {/* Add this modal after all your existing modals, before the closing </div> */}

          {/* Checklist Modal */}
          <LeadChecklistModal 
            isOpen={showChecklistModal}
            onClose={() => {
              setShowChecklistModal(false);
              setEditingChecklist(null);
            }}
            onSubmit={
              editingChecklist ? handleUpdateChecklist : handleCreateChecklist
            }
            existingChecklist={editingChecklist}
            studentName={personalInfo.name}
            loading={loading}
          />

          {/* Image Modal */}
          <Modal
            isOpen={showImageModal}
            onClose={() => {
              setShowImageModal(false);
              setSelectedImage(null);
            }}
            title={`${selectedImage?.type?.replace("_", " ") || "Document"}`}
            size="lg"
          >
            {selectedImage && (
              <div className="space-y-4">
                <div className="flex justify-center">
                  <img
                    src={selectedImage.url}
                    alt={selectedImage.type}
                    className="max-w-full max-h-96 object-contain rounded-lg shadow-lg"
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.nextSibling.style.display = "block";
                    }}
                  />
                  <div className="hidden text-center text-gray-500">
                    <FileText className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                    <p>Unable to load image</p>
                  </div>
                </div>

                {selectedImage.notes && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-700">
                      <strong>Notes:</strong> {selectedImage.notes}
                    </p>
                  </div>
                )}

                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span>
                    Uploaded:{" "}
                    {new Date(selectedImage.createdAt).toLocaleDateString()}
                  </span>
                  <span className="capitalize">
                    Status: {selectedImage.status}
                  </span>
                </div>

                <div className="flex justify-end space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      const link = document.createElement("a");
                      link.href = selectedImage.url;
                      link.download = `${selectedImage.type}_${
                        selectedImage.id
                      }.${getFileExtension(selectedImage.filePath)}`;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                  <Button
                    onClick={() => {
                      setShowImageModal(false);
                      setSelectedImage(null);
                    }}
                  >
                    Close
                  </Button>
                </div>
              </div>
            )}
          </Modal>
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

      {/* Create/Edit Proposal Modal */}
      <Modal
        isOpen={showProposalModal}
        onClose={() => {
          setShowProposalModal(false);
          setEditingProposal(false);
          setSelectedProposal(null);
          setProposalForm({
            title: "",
            description: "",
            proposedProgram: "",
            proposedUniversity: "",
            estimatedCost: "",
            timeline: "",
            expiresAt: "",
            details: {},
          });
        }}
        title={editingProposal ? "Edit Proposal" : "Create Proposal"}
        size="xl"
      >
        <div className="space-y-6 z-30">
          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Proposal Title *
              </label>
              <Input
                type="text"
                value={proposalForm.title}
                onChange={(e) =>
                  setProposalForm({ ...proposalForm, title: e.target.value })
                }
                placeholder="e.g., Study Program Proposal for Computer Science"
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={proposalForm.description}
                onChange={(e) =>
                  setProposalForm({
                    ...proposalForm,
                    description: e.target.value,
                  })
                }
                placeholder="Detailed description of the proposal..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Proposed Program
                </label>
                <Input
                  type="text"
                  value={proposalForm.proposedProgram}
                  onChange={(e) =>
                    setProposalForm({
                      ...proposalForm,
                      proposedProgram: e.target.value,
                    })
                  }
                  placeholder="e.g., Bachelor of Computer Science"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Proposed University
                </label>
                <Input
                  type="text"
                  value={proposalForm.proposedUniversity}
                  onChange={(e) =>
                    setProposalForm({
                      ...proposalForm,
                      proposedUniversity: e.target.value,
                    })
                  }
                  placeholder="e.g., University of Toronto"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estimated Cost (USD)
                </label>
                <Input
                  type="number"
                  step="0.01"
                  value={proposalForm.estimatedCost}
                  onChange={(e) =>
                    setProposalForm({
                      ...proposalForm,
                      estimatedCost: e.target.value,
                    })
                  }
                  placeholder="e.g., 45000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Timeline
                </label>
                <Input
                  type="text"
                  value={proposalForm.timeline}
                  onChange={(e) =>
                    setProposalForm({
                      ...proposalForm,
                      timeline: e.target.value,
                    })
                  }
                  placeholder="e.g., 4 years, 18 months"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Proposal Expires On
              </label>
              <Input
                type="datetime-local"
                value={proposalForm.expiresAt}
                onChange={(e) =>
                  setProposalForm({
                    ...proposalForm,
                    expiresAt: e.target.value,
                  })
                }
                min={new Date().toISOString().slice(0, 16)}
              />
              <p className="text-sm text-gray-500 mt-1">
                Leave blank for no expiration
              </p>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => {
                setShowProposalModal(false);
                setEditingProposal(false);
                setSelectedProposal(null);
                setProposalForm({
                  title: "",
                  description: "",
                  proposedProgram: "",
                  proposedUniversity: "",
                  estimatedCost: "",
                  timeline: "",
                  expiresAt: "",
                  details: {},
                });
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleProposalSubmit}
              disabled={isSubmitting || !proposalForm.title.trim()}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {isSubmitting ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  {editingProposal ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>
                  <Briefcase className="h-4 w-4 mr-2" />
                  {editingProposal ? "Update Proposal" : "Create Proposal"}
                </>
              )}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Proposal Details Modal */}
      <Modal
        isOpen={showProposalDetailsModal}
        onClose={() => {
          setShowProposalDetailsModal(false);
          setSelectedProposal(null);
        }}
        title="Proposal Details"
        size="lg"
      >
        {selectedProposal && (
          <div className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-semibold text-blue-800">
                  {selectedProposal.title}
                </h3>
                <Badge
                  className={getProposalStatusColor(selectedProposal.status)}
                >
                  {selectedProposal.status.toUpperCase()}
                </Badge>
              </div>

              {selectedProposal.description && (
                <p className="text-blue-700 mb-3">
                  {selectedProposal.description}
                </p>
              )}

              <div className="grid grid-cols-2 gap-4 text-sm">
                {selectedProposal.proposedProgram && (
                  <div>
                    <span className="font-medium text-blue-700">Program:</span>{" "}
                    {selectedProposal.proposedProgram}
                  </div>
                )}
                {selectedProposal.proposedUniversity && (
                  <div>
                    <span className="font-medium text-blue-700">
                      University:
                    </span>{" "}
                    {selectedProposal.proposedUniversity}
                  </div>
                )}
                {selectedProposal.estimatedCost && (
                  <div>
                    <span className="font-medium text-blue-700">Cost:</span> $
                    {selectedProposal.estimatedCost.toLocaleString()} USD
                  </div>
                )}
                {selectedProposal.timeline && (
                  <div>
                    <span className="font-medium text-blue-700">Timeline:</span>{" "}
                    {selectedProposal.timeline}
                  </div>
                )}
              </div>
            </div>

            {/* Additional Details */}
            {selectedProposal.details &&
              Object.keys(selectedProposal.details).length > 0 && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-md font-medium text-gray-800 mb-3">
                    Additional Details
                  </h4>
                  <div className="space-y-2">
                    {Object.entries(selectedProposal.details).map(
                      ([key, value]) => (
                        <div key={key} className="text-sm">
                          <span className="font-medium text-gray-700">
                            {key}:
                          </span>{" "}
                          <span className="text-gray-600">{value}</span>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

            {/* Metadata */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-md font-medium text-gray-800 mb-3">
                Proposal Information
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <span className="font-medium">Created:</span>{" "}
                  {new Date(selectedProposal.createdAt).toLocaleString()}
                </div>
                <div>
                  <span className="font-medium">Updated:</span>{" "}
                  {new Date(selectedProposal.updatedAt).toLocaleString()}
                </div>
                {selectedProposal.expiresAt && (
                  <div>
                    <span className="font-medium">Expires:</span>{" "}
                    {new Date(selectedProposal.expiresAt).toLocaleString()}
                  </div>
                )}
                {selectedProposal.sentAt && (
                  <div>
                    <span className="font-medium">Sent:</span>{" "}
                    {new Date(selectedProposal.sentAt).toLocaleString()}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              {/* <Button
                variant="outline"
                onClick={() => handleEditProposal(selectedProposal)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Proposal
              </Button> */}
              <Button
                onClick={() => {
                  setShowProposalDetailsModal(false);
                  setSelectedProposal(null);
                }}
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default StudentProfiles;
