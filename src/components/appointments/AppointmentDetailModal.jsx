import React from "react";
import { format } from "date-fns";
import { X, Calendar, Clock, Users, MapPin, FileText, User } from "lucide-react";
import Badge from "../ui/Badge";

const AppointmentDetailModal = ({
  isOpen,
  onClose,
  appointment,
  getStatusColor,
  getTypeIcon,
}) => {
  if (!isOpen || !appointment) return null;

  const formatDate = (dateString) => {
    if (!dateString) return "Not specified";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid date";
      return format(date, "PPP");
    } catch (error) {
      return "Invalid date";
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return "Not specified";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid time";
      return format(date, "p");
    } catch (error) {
      return "Invalid time";
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "Not specified";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid date/time";
      return format(date, "PPP 'at' p");
    } catch (error) {
      return "Invalid date/time";
    }
  };

  const getDuration = (startTime, endTime) => {
    if (!startTime || !endTime) return "Not specified";
    try {
      const start = new Date(startTime);
      const end = new Date(endTime);
      if (isNaN(start.getTime()) || isNaN(end.getTime())) return "Invalid duration";
      
      const diffMs = end - start;
      const diffMins = Math.round(diffMs / (1000 * 60));
      const hours = Math.floor(diffMins / 60);
      const minutes = diffMins % 60;
      
      if (hours > 0) {
        return `${hours}h ${minutes}m`;
      }
      return `${minutes}m`;
    } catch (error) {
      return "Invalid duration";
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Calendar className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              Appointment Details
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status and Type */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {getTypeIcon && getTypeIcon(appointment.type)}
              <span className="text-sm font-medium text-gray-600 capitalize">
                {appointment.type?.replace("_", " ") || "Appointment"}
              </span>
            </div>
            <Badge
              className={getStatusColor ? getStatusColor(appointment.status) : ""}
            >
              {appointment.status?.replace("_", " ") || "Unknown"}
            </Badge>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <Calendar className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm font-medium text-gray-900">Date</p>
                <p className="text-sm text-gray-600">
                  {formatDate(appointment.startTime)}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <Clock className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm font-medium text-gray-900">Time</p>
                <p className="text-sm text-gray-600">
                  {formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}
                </p>
              </div>
            </div>
          </div>

          {/* Duration */}
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <Clock className="h-5 w-5 text-gray-500" />
            <div>
              <p className="text-sm font-medium text-gray-900">Duration</p>
              <p className="text-sm text-gray-600">
                {getDuration(appointment.startTime, appointment.endTime)}
              </p>
            </div>
          </div>

          {/* Location */}
          {appointment.location && (
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <MapPin className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm font-medium text-gray-900">Location</p>
                <p className="text-sm text-gray-600">{appointment.location}</p>
              </div>
            </div>
          )}

          {/* Student Information */}
          {appointment.student && (
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-3">
                <User className="h-5 w-5 text-gray-500" />
                <h3 className="text-sm font-medium text-gray-900">Student Information</h3>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Name:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {appointment.student.name || "Not specified"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Email:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {appointment.student.email || "Not specified"}
                  </span>
                </div>
                {appointment.student.phone && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Phone:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {appointment.student.phone}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Notes */}
          {appointment.notes && (
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-3">
                <FileText className="h-5 w-5 text-gray-500" />
                <h3 className="text-sm font-medium text-gray-900">Notes</h3>
              </div>
              <p className="text-sm text-gray-600 whitespace-pre-wrap">
                {appointment.notes}
              </p>
            </div>
          )}

          {/* Meeting Link */}
          {appointment.meetingLink && (
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-3">
                <Users className="h-5 w-5 text-gray-500" />
                <h3 className="text-sm font-medium text-gray-900">Meeting Link</h3>
              </div>
              <a
                href={appointment.meetingLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:text-blue-800 underline break-all"
              >
                {appointment.meetingLink}
              </a>
            </div>
          )}

          {/* Timestamps */}
          <div className="border-t border-gray-200 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-500">
              <div>
                <span className="font-medium">Created:</span>{" "}
                {formatDateTime(appointment.createdAt)}
              </div>
              <div>
                <span className="font-medium">Updated:</span>{" "}
                {formatDateTime(appointment.updatedAt)}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AppointmentDetailModal; 