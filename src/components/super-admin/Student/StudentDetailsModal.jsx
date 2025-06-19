import React from "react";
import Modal from "../../../components/ui/Modal";
import {
  User,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  Building,
  Calendar,
  FileText,
} from "lucide-react";
import useUserStore from "../../../stores/userStore";

const StudentDetailsModal = ({
  isOpen,
  onClose,
  student,
  lead,
  offices,
  consultants,
}) => {
  const { users } = useUserStore();
  if (!student || !lead) return null;

  const getOfficeName = (officeId) => {
    const office = offices.find((o) => o.id === officeId);
    return office ? `${office.name} - ${office.address?.city}` : "No Office";
  };

  const getConsultantName = (consultantId) => {
    const consultant = consultants.find((c) => c.id === consultantId);
    return consultant ? consultant.name : "Unassigned";
  };

  const getStatusBadgeColor = (status) => {
    const colors = {
      new: "bg-blue-100 text-blue-800",
      in_progress: "bg-yellow-100 text-yellow-800",
      converted: "bg-green-100 text-green-800",
      lost: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getSourceBadgeColor = (source) => {
    const colors = {
      walk_in: "bg-purple-100 text-purple-800",
      online: "bg-indigo-100 text-indigo-800",
      referral: "bg-orange-100 text-orange-800",
      "Google OAuth": "bg-red-100 text-red-800",
      "Facebook OAuth": "bg-blue-100 text-blue-800",
    };
    return colors[source] || "bg-gray-100 text-gray-800";
  };

  const getUserNameFromAction = (action) => {
    // Extract user ID from actions like "Lead created by manager 201745bd-7c96-4360-9f01-776729d63de9"
    const patterns = [
      /Lead created by (manager|receptionist|consultant|super_admin) ([a-f0-9-]{36})/i,
      /Lead created by ([a-f0-9-]{36})/i,
    ];

    for (const pattern of patterns) {
      const match = action.match(pattern);
      if (match) {
        const userId = match[2] || match[1]; // Get the UUID part
        const user = users.find((u) => u.id === userId);
        if (user) {
          const role = match[1] && match[1].length < 10 ? match[1] : user.role; // If first capture is role
          return `Lead created by ${user?.name} - ${user?.email}`;
        }
        return action; // Return original if user not found
      }
    }
    return action; // Return original if no pattern matches
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const renderTestScoreValue = (score) => {
    if (typeof score === "object" && score !== null) {
      // Handle IELTS scores and other nested objects
      if (score.total !== undefined) {
        return (
          <div className="space-y-1">
            <div className="font-bold text-blue-600">{score.total}</div>
            <div className="text-xs text-gray-500">
              R:{score.reading} W:{score.writing} S:{score.speaking} L:
              {score.listening}
            </div>
          </div>
        );
      }
      // Handle other object types
      return JSON.stringify(score);
    }
    return score;
  };

  const renderPersonalInfoValue = (key, value) => {
    if (typeof value === "object" && value !== null) {
      if (key === "fullName") {
        return `${value.firstName || ""} ${value.lastName || ""}`.trim();
      }
      if (key === "permanentAddress") {
        return `${value.street || ""}, ${value.city || ""}, ${
          value.provinceOfDomicile || ""
        }`.replace(/^,\s*|,\s*$/g, "");
      }
      if (key === "passportDetails") {
        return `${value.passportNumber || ""} (${value.passportCountry || ""})`;
      }
      if (key === "emergencyContact") {
        return `${value.name || ""} - ${value.relation || ""} (${
          value.phone || ""
        })`;
      }
      return JSON.stringify(value);
    }
    if (key === "dateOfBirth") {
      return formatDate(value);
    }
    return value;
  };

  const renderEducationalBackground = (eduBackground) => {
    if (typeof eduBackground === "object" && eduBackground !== null) {
      // Handle the new structure where it's an object instead of array
      if (eduBackground.bachelorDegree) {
        const degree = eduBackground.bachelorDegree;
        return (
          <div className="bg-white p-3 rounded border text-sm">
            <div className="font-medium">{degree.institution}</div>
            <div className="text-gray-600">
              {degree.programName} - {degree.specialization}
            </div>
            <div className="text-gray-500">
              {degree.startDate} - {degree.endDate}
            </div>
            <div className="text-gray-500">Country: {degree.country}</div>
            {degree.cgpaPercentage && (
              <div className="text-gray-500">CGPA: {degree.cgpaPercentage}</div>
            )}
          </div>
        );
      }

      // Handle study level info
      if (eduBackground.studyLevel) {
        return (
          <div className="bg-white p-3 rounded border text-sm">
            <div className="font-medium">
              Study Level: {eduBackground.studyLevel}
            </div>
            {eduBackground.admissionYear && (
              <div className="text-gray-600">
                Admission Year: {eduBackground.admissionYear}
              </div>
            )}
            {eduBackground.educationalGap && (
              <div className="text-gray-500">
                Gap: {eduBackground.educationalGap}
              </div>
            )}
          </div>
        );
      }
    }

    if (Array.isArray(eduBackground)) {
      return eduBackground.map((edu, index) => (
        <div key={index} className="bg-white p-3 rounded border text-sm">
          <div className="font-medium">{edu.institution}</div>
          <div className="text-gray-600">
            {edu.degree} - {edu.field}
          </div>
          <div className="text-gray-500">
            {edu.startYear} - {edu.endYear}
          </div>
          {edu.gpa && <div className="text-gray-500">GPA: {edu.gpa}</div>}
        </div>
      ));
    }

    return null;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Student Details" size="xl">
      <div className="space-y-6">
        {/* Student Basic Info */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <User className="h-5 w-5 text-blue-600" />
            Student Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-500" />
                <span className="font-medium">Name:</span>
                <span>{student.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-500" />
                <span className="font-medium">Email:</span>
                <span>{student.email}</span>
              </div>
              {student.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">Phone:</span>
                  <span>{student.phone}</span>
                </div>
              )}
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="font-medium">Joined:</span>
                <span>{formatDate(student.createdAt || new Date())}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">Status:</span>
                <span
                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    student.isActive
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {student.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Lead Information */}
        <div className="bg-blue-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            Lead Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="font-medium">Status:</span>
                <span
                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(
                    lead.status
                  )}`}
                >
                  {lead.status
                    ?.replace("_", " ")
                    .replace(/\b\w/g, (l) => l.toUpperCase())}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">Source:</span>
                <span
                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSourceBadgeColor(
                    lead.source
                  )}`}
                >
                  {lead.source?.replace("_", " ")}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="font-medium">Created:</span>
                <span>{formatDate(lead.createdAt)}</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Building className="h-4 w-4 text-gray-500" />
                <span className="font-medium">Office:</span>
                <span>{getOfficeName(lead.officeId)}</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-500" />
                <span className="font-medium">Consultant:</span>
                <span>{getConsultantName(lead.assignedConsultant)}</span>
              </div>
              {lead.languagePreference && (
                <div className="flex items-center gap-2">
                  <span className="font-medium">Language:</span>
                  <span className="capitalize">{lead.languagePreference}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Study Preferences */}
        {lead.studyPreferences && (
          <div className="bg-green-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-green-600" />
              Study Preferences
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                {lead.studyPreferences.destination && (
                  <div>
                    <span className="font-medium">Destination:</span>
                    <span className="ml-2">
                      {lead.studyPreferences.destination}
                    </span>
                  </div>
                )}
                {lead.studyPreferences.level && (
                  <div>
                    <span className="font-medium">Level:</span>
                    <span className="ml-2">{lead.studyPreferences.level}</span>
                  </div>
                )}
                {lead.studyPreferences.budget && (
                  <div>
                    <span className="font-medium">Budget:</span>
                    <span className="ml-2">{lead.studyPreferences.budget}</span>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                {lead.studyPreferences.fields &&
                  lead.studyPreferences.fields.length > 0 && (
                    <div>
                      <span className="font-medium">Fields of Interest:</span>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {lead.studyPreferences.fields.map((field, index) => (
                          <span
                            key={index}
                            className="inline-flex px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded"
                          >
                            {field}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                {lead.studyPreferences.startDate && (
                  <div>
                    <span className="font-medium">Preferred Start Date:</span>
                    <span className="ml-2">
                      {lead.studyPreferences.startDate}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Student Profile */}
        {student.profile && (
          <div className="bg-yellow-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User className="h-5 w-5 text-yellow-600" />
              Student Profile
            </h3>

            {/* Personal Info */}
            {student.profile.personalInfo && (
              <div className="mb-4">
                <h4 className="font-medium text-gray-900 mb-2">
                  Personal Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  {Object.entries(student.profile.personalInfo).map(
                    ([key, value]) => {
                      if (!value || key === "email") return null; // Skip empty values and email (already shown above)

                      const displayKey = key
                        .replace(/([A-Z])/g, " $1")
                        .replace(/^./, (str) => str.toUpperCase());
                      const displayValue = renderPersonalInfoValue(key, value);

                      return (
                        <div
                          key={key}
                          className={
                            key === "permanentAddress" ? "col-span-2" : ""
                          }
                        >
                          <span className="font-medium">{displayKey}:</span>
                          <span className="ml-2">{displayValue}</span>
                        </div>
                      );
                    }
                  )}
                </div>
              </div>
            )}

            {/* Educational Background */}
            {student.profile.educationalBackground && (
              <div className="mb-4">
                <h4 className="font-medium text-gray-900 mb-2">
                  Educational Background
                </h4>
                <div className="space-y-2">
                  {renderEducationalBackground(
                    student.profile.educationalBackground
                  )}
                </div>
              </div>
            )}

            {/* Test Scores */}
            {student.profile.testScores &&
              Object.keys(student.profile.testScores).length > 0 && (
                <div className="mb-4">
                  <h4 className="font-medium text-gray-900 mb-2">
                    Test Scores
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    {Object.entries(student.profile.testScores).map(
                      ([test, score]) => {
                        if (!score || test === "partTimeWork") return null; // Skip empty or non-score fields

                        return (
                          <div
                            key={test}
                            className="bg-white p-2 rounded border text-center"
                          >
                            <div className="font-medium uppercase">
                              {test.replace(/([A-Z])/g, " $1")}
                            </div>
                            <div className="text-sm">
                              {renderTestScoreValue(score)}
                            </div>
                          </div>
                        );
                      }
                    )}
                  </div>
                </div>
              )}
          </div>
        )}

        {/* Lead History */}
        {lead.history && lead.history.length > 0 && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Lead History
            </h3>
            <div className="space-y-2 overflow-y-auto">
              {lead.history.map((entry, index) => {
                const user = users.find((u) => u.id === entry.userId);
                return (
                  <div
                    key={index}
                    className="bg-white p-3 rounded border text-sm"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="font-medium">
                          {entry.action
                            ? getUserNameFromAction(entry.action)
                            : entry.note}
                        </div>
                        {entry.details && (
                          <div className="text-gray-600 mt-1">
                            {entry.details}
                          </div>
                        )}
                        {entry.dueDate && (
                          <div className="text-orange-600 mt-1 text-xs">
                            Due: {formatDate(entry.dueDate)}
                          </div>
                        )}
                        {entry.userId && (
                          <div className="text-blue-600 mt-1 text-xs">
                            By:{" "}
                            {`${user?.name} - ${user?.email}` || "Unknown User"}
                          </div>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 ml-2">
                        {formatDate(entry.timestamp)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default StudentDetailsModal;
