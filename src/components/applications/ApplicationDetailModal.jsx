import React from "react";
import { format } from "date-fns";
import {
  User,
  Calendar,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  Building,
  Award,
  Globe,
  Eye,
  Users,
  BookOpen,
  Target,
  TrendingUp,
  Shield,
} from "lucide-react";
import {
  STATUS_CONFIG,
  STAGE_CONFIG,
} from "../../constants/applicationConstants";
import Modal from "../ui/Modal";
import Badge from "../ui/Badge";
import Card from "../ui/Card";

const ApplicationDetailModal = ({ application, isOpen, onClose }) => {
  if (!application) return null;

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-emerald-500" />;
      case "rejected":
        return <XCircle className="h-5 w-5 text-red-500" />;
      case "in_review":
        return <Clock className="h-5 w-5 text-blue-500" />;
      case "submitted":
        return <TrendingUp className="h-5 w-5 text-amber-500" />;
      case "offers_received":
        return <Award className="h-5 w-5 text-purple-500" />;
      case "accepted":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "visa_applied":
        return <Globe className="h-5 w-5 text-indigo-500" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStageIcon = (stage) => {
    switch (stage) {
      case "profile_review":
        return <User className="h-5 w-5 text-blue-500" />;
      case "university_selection":
        return <Building className="h-5 w-5 text-purple-500" />;
      case "document_preparation":
        return <FileText className="h-5 w-5 text-amber-500" />;
      case "submission":
        return <TrendingUp className="h-5 w-5 text-orange-500" />;
      case "offer_management":
        return <Award className="h-5 w-5 text-indigo-500" />;
      case "visa_application":
        return <Globe className="h-5 w-5 text-teal-500" />;
      case "completed":
        return <CheckCircle className="h-5 w-5 text-emerald-500" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" size="xl">
      <div className="bg-white">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-50 via-white to-purple-50 px-6 py-6 border-b border-gray-100">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Application Details
              </h2>
              <p className="text-gray-600 mb-3">
                ID:{" "}
                <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                  {application.id}
                </span>
              </p>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  {getStatusIcon(application.status)}
                  <Badge
                    className={`${
                      STATUS_CONFIG[application.status]?.bg || "bg-gray-100"
                    } ${
                      STATUS_CONFIG[application.status]?.color ||
                      "text-gray-600"
                    } border-0 font-medium`}
                  >
                    {STATUS_CONFIG[application.status]?.label ||
                      application.status}
                  </Badge>
                </div>
                <div className="flex items-center space-x-2">
                  {getStageIcon(application.stage)}
                  <Badge
                    className={`${
                      STAGE_CONFIG[application.stage]?.bg || "bg-gray-100"
                    } ${
                      STAGE_CONFIG[application.stage]?.color || "text-gray-600"
                    } border-0 font-medium`}
                  >
                    {STAGE_CONFIG[application.stage]?.label ||
                      application.stage}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Quick Info */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Calendar className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">
                  Submitted
                </span>
              </div>
              <p className="text-sm text-blue-700">
                {application.submissionDate
                  ? (() => {
                      try {
                        const date = new Date(application.submissionDate);
                        return isNaN(date.getTime()) ? 'Invalid date' : format(date, "MMM dd, yyyy");
                      } catch (error) {
                        return 'Invalid date';
                      }
                    })()
                  : "Not yet"}
              </p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <CheckCircle className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-900">
                  Completed
                </span>
              </div>
              <p className="text-sm text-purple-700">
                {application.completionDate
                  ? (() => {
                      try {
                        const date = new Date(application.completionDate);
                        return isNaN(date.getTime()) ? 'Invalid date' : format(date, "MMM dd, yyyy");
                      } catch (error) {
                        return 'Invalid date';
                      }
                    })()
                  : "In progress"}
              </p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Building className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-900">
                  Universities
                </span>
              </div>
              <p className="text-sm text-green-700">
                {application.universitySelections?.length || 0} selected
              </p>
            </div>
            <div className="bg-amber-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Award className="h-4 w-4 text-amber-600" />
                <span className="text-sm font-medium text-amber-900">
                  Offers
                </span>
              </div>
              <p className="text-sm text-amber-700">
                {application.offerLetters?.length || 0} received
              </p>
            </div>
          </div>

          {/* Student & Consultant Info */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Student Info */}
            <Card className="border border-gray-200">
              <div className="p-5">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Student Information
                    </h3>
                    <p className="text-sm text-gray-500">Personal details</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Full Name
                    </label>
                    <p className="text-sm text-gray-900 font-medium">
                      {application.student?.name || "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Email
                    </label>
                    <div className="flex items-center space-x-2">
                      <Mail className="h-3 w-3 text-gray-400" />
                      <p className="text-sm text-gray-900">
                        {application.student?.email || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Consultant Info */}
            {application.consultant && (
              <Card className="border border-gray-200">
                <div className="p-5">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <Users className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        Consultant Information
                      </h3>
                      <p className="text-sm text-gray-500">
                        Assigned consultant
                      </p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Name
                      </label>
                      <p className="text-sm text-gray-900 font-medium">
                        {application.consultant.name}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Email
                      </label>
                      <div className="flex items-center space-x-2">
                        <Mail className="h-3 w-3 text-gray-400" />
                        <p className="text-sm text-gray-900">
                          {application.consultant.email}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </div>

          {/* University Selections */}
          {application.universitySelections &&
            application.universitySelections.length > 0 && (
              <Card className="border border-gray-200">
                <div className="p-5">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                      <Building className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        University Selections
                      </h3>
                      <p className="text-sm text-gray-500">
                        {application.universitySelections.length} universities
                      </p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {application.universitySelections.map(
                      (selection, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div>
                            <h4 className="font-medium text-gray-900">
                              {selection.universityName}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {selection.courseName}
                            </p>
                          </div>
                          <Badge className="bg-indigo-100 text-indigo-800 text-xs border-0">
                            {selection.priority || "Standard"}
                          </Badge>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </Card>
            )}

          {/* Offer Letters */}
          {application.offerLetters && application.offerLetters.length > 0 && (
            <Card className="border border-gray-200">
              <div className="p-5">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                    <Award className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Offer Letters
                    </h3>
                    <p className="text-sm text-gray-500">
                      {application.offerLetters.length} offers received
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  {application.offerLetters.map((offer, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {offer.universityName}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {offer.courseName}
                        </p>
                        <p className="text-xs text-gray-500">
                          Received:{" "}
                          {offer.receivedDate
                            ? (() => {
                                try {
                                  const date = new Date(offer.receivedDate);
                                  return isNaN(date.getTime()) ? 'Invalid date' : format(date, "MMM dd, yyyy");
                                } catch (error) {
                                  return 'Invalid date';
                                }
                              })()
                            : 'N/A'}
                        </p>
                      </div>
                      <Badge
                        className={`text-xs border-0 ${
                          offer.status === "accepted"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {offer.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}

          {/* Visa Information */}
          {application.visaInfo &&
            Object.keys(application.visaInfo).length > 0 && (
              <Card className="border border-gray-200">
                <div className="p-5">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                      <Globe className="h-5 w-5 text-teal-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        Visa Information
                      </h3>
                      <p className="text-sm text-gray-500">
                        Travel documentation
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {application.visaInfo.country && (
                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                          Country
                        </label>
                        <p className="text-sm text-gray-900 font-medium">
                          {application.visaInfo.country}
                        </p>
                      </div>
                    )}
                    {application.visaInfo.status && (
                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                          Status
                        </label>
                        <Badge className="bg-teal-100 text-teal-800 text-xs border-0 mt-1">
                          {application.visaInfo.status}
                        </Badge>
                      </div>
                    )}
                    {application.visaInfo.applicationDate && (
                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                          Applied
                        </label>
                        <p className="text-sm text-gray-900 font-medium">
                          {application.visaInfo.applicationDate
                            ? (() => {
                                try {
                                  const date = new Date(application.visaInfo.applicationDate);
                                  return isNaN(date.getTime()) ? 'Invalid date' : format(date, "MMM dd, yyyy");
                                } catch (error) {
                                  return 'Invalid date';
                                }
                              })()
                            : 'N/A'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            )}

          {/* Notes */}
          {application.notes && (
            <Card className="border border-gray-200">
              <div className="p-5">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                    <FileText className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Notes</h3>
                    <p className="text-sm text-gray-500">
                      Additional information
                    </p>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {application.notes}
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Rejection Reason */}
          {application.rejectionReason && (
            <Card className="border border-red-200 bg-red-50">
              <div className="p-5">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                    <XCircle className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-red-900">
                      Rejection Reason
                    </h3>
                    <p className="text-sm text-red-700">Application declined</p>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-4 border border-red-200">
                  <p className="text-sm text-red-800">
                    {application.rejectionReason}
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Timeline */}
          <Card className="border border-gray-200">
            <div className="p-5">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                  <Clock className="h-5 w-5 text-slate-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Timeline</h3>
                  <p className="text-sm text-gray-500">
                    Creation and modification dates
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Created
                  </label>
                  <p className="text-sm text-gray-900 font-medium">
                    {format(
                      new Date(application.createdAt),
                      "MMM dd, yyyy HH:mm"
                    )}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Last Updated
                  </label>
                  <p className="text-sm text-gray-900 font-medium">
                    {format(
                      new Date(application.updatedAt),
                      "MMM dd, yyyy HH:mm"
                    )}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </Modal>
  );
};

export default ApplicationDetailModal;
