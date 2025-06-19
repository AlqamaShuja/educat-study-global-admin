import React, { useState } from "react";
import {
  Clock,
  User,
  MapPin,
  Phone,
  Video,
  Calendar,
  Edit,
  Trash2,
  Check,
  X,
  AlertCircle,
  Users,
} from "lucide-react";
import { format } from "date-fns";
import Badge from "../ui/Badge";
import Button from "../ui/Button";
import Modal from "../ui/Modal";

const CalendarEvent = ({
  event,
  onClick,
  onEdit,
  onDelete,
  onStatusChange,
  compact = false,
  showActions = true,
  className = "",
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  // Event type configurations
  const eventTypeConfig = {
    appointment: {
      color: "bg-blue-500",
      textColor: "text-blue-700",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      icon: Calendar,
    },
    meeting: {
      color: "bg-green-500",
      textColor: "text-green-700",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      icon: Users,
    },
    consultation: {
      color: "bg-purple-500",
      textColor: "text-purple-700",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
      icon: User,
    },
    follow_up: {
      color: "bg-orange-500",
      textColor: "text-orange-700",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200",
      icon: Phone,
    },
    virtual: {
      color: "bg-indigo-500",
      textColor: "text-indigo-700",
      bgColor: "bg-indigo-50",
      borderColor: "border-indigo-200",
      icon: Video,
    },
  };

  // Status configurations
  const statusConfig = {
    scheduled: {
      variant: "info",
      label: "Scheduled",
      icon: Clock,
    },
    confirmed: {
      variant: "success",
      label: "Confirmed",
      icon: Check,
    },
    completed: {
      variant: "success",
      label: "Completed",
      icon: Check,
    },
    cancelled: {
      variant: "destructive",
      label: "Cancelled",
      icon: X,
    },
    no_show: {
      variant: "warning",
      label: "No Show",
      icon: AlertCircle,
    },
    rescheduled: {
      variant: "warning",
      label: "Rescheduled",
      icon: Clock,
    },
  };

  const config = eventTypeConfig[event.type] || eventTypeConfig.appointment;
  const statusInfo = statusConfig[event.status] || statusConfig.scheduled;
  const StatusIcon = statusInfo.icon;
  const TypeIcon = config.icon;

  const handleClick = (e) => {
    e.stopPropagation();
    if (onClick) {
      onClick(event);
    } else {
      setShowDetails(true);
    }
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(event);
    }
    setShowDetails(false);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    setShowConfirmDelete(true);
  };

  const confirmDelete = () => {
    if (onDelete) {
      onDelete(event);
    }
    setShowConfirmDelete(false);
    setShowDetails(false);
  };

  const handleStatusChange = (newStatus) => {
    if (onStatusChange) {
      onStatusChange(event, newStatus);
    }
  };

  // Compact view for calendar grid
  if (compact) {
    return (
      <>
        <div
          onClick={handleClick}
          className={`
            p-2 rounded text-xs cursor-pointer transition-all duration-200
            hover:shadow-sm border-l-2 ${config.borderColor} ${config.bgColor}
            ${className}
          `}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center min-w-0 flex-1">
              <div
                className={`w-2 h-2 rounded-full ${config.color} mr-2 flex-shrink-0`}
              />
              <span className={`font-medium truncate ${config.textColor}`}>
                {event.title}
              </span>
            </div>
            <Badge variant={statusInfo.variant} className="text-xs ml-2">
              {statusInfo.label}
            </Badge>
          </div>

          {event.time && (
            <div className="flex items-center mt-1 text-gray-600 dark:text-gray-400">
              <Clock className="h-3 w-3 mr-1" />
              <span>{event.time}</span>
            </div>
          )}

          {event.participant && (
            <div className="flex items-center mt-1 text-gray-600 dark:text-gray-400">
              <User className="h-3 w-3 mr-1" />
              <span className="truncate">{event.participant}</span>
            </div>
          )}
        </div>

        {/* Event Details Modal */}
        <Modal
          isOpen={showDetails}
          onClose={() => setShowDetails(false)}
          title="Event Details"
          className="max-w-md"
        >
          <EventDetailsContent
            event={event}
            config={config}
            statusInfo={statusInfo}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onStatusChange={handleStatusChange}
            showActions={showActions}
          />
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={showConfirmDelete}
          onClose={() => setShowConfirmDelete(false)}
          title="Confirm Deletion"
          className="max-w-sm"
        >
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900 mb-4">
              <Trash2 className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to delete this event? This action cannot be
              undone.
            </p>
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowConfirmDelete(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDelete}
                className="flex-1"
              >
                Delete
              </Button>
            </div>
          </div>
        </Modal>
      </>
    );
  }

  // Full view for event lists or detailed displays
  return (
    <div
      className={`
        p-4 rounded-lg border transition-all duration-200 cursor-pointer
        hover:shadow-md ${config.bgColor} ${config.borderColor}
        ${className}
      `}
      onClick={handleClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          <div className={`p-2 rounded-full ${config.color}`}>
            <TypeIcon className="h-4 w-4 text-white" />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className={`font-semibold ${config.textColor}`}>
              {event.title}
            </h3>

            {event.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {event.description}
              </p>
            )}

            <div className="flex items-center flex-wrap gap-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
              {event.time && (
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>{event.time}</span>
                </div>
              )}

              {event.participant && (
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-1" />
                  <span>{event.participant}</span>
                </div>
              )}

              {event.location && (
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>{event.location}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-start space-x-2 ml-4">
          <Badge variant={statusInfo.variant}>
            <StatusIcon className="h-3 w-3 mr-1" />
            {statusInfo.label}
          </Badge>

          {showActions && (
            <div className="flex space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleEdit}
                className="p-1"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                className="p-1 text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Event Details Content Component
const EventDetailsContent = ({
  event,
  config,
  statusInfo,
  onEdit,
  onDelete,
  onStatusChange,
  showActions,
}) => {
  const TypeIcon = config.icon;
  const StatusIcon = statusInfo.icon;

  return (
    <div className="space-y-4">
      {/* Event Header */}
      <div className="flex items-start space-x-3">
        <div className={`p-3 rounded-full ${config.color}`}>
          <TypeIcon className="h-5 w-5 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {event.title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {event.type.charAt(0).toUpperCase() +
              event.type.slice(1).replace("_", " ")}
          </p>
        </div>
        <Badge variant={statusInfo.variant}>
          <StatusIcon className="h-3 w-3 mr-1" />
          {statusInfo.label}
        </Badge>
      </div>

      {/* Event Details */}
      <div className="space-y-3">
        {event.description && (
          <div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
              Description
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {event.description}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-3">
          {event.date && (
            <div className="flex items-center">
              <Calendar className="h-4 w-4 text-gray-400 mr-3" />
              <span className="text-sm text-gray-900 dark:text-white">
                {format(new Date(event.date), "EEEE, MMMM d, yyyy")}
              </span>
            </div>
          )}

          {event.time && (
            <div className="flex items-center">
              <Clock className="h-4 w-4 text-gray-400 mr-3" />
              <span className="text-sm text-gray-900 dark:text-white">
                {event.time}
              </span>
            </div>
          )}

          {event.participant && (
            <div className="flex items-center">
              <User className="h-4 w-4 text-gray-400 mr-3" />
              <span className="text-sm text-gray-900 dark:text-white">
                {event.participant}
              </span>
            </div>
          )}

          {event.location && (
            <div className="flex items-center">
              <MapPin className="h-4 w-4 text-gray-400 mr-3" />
              <span className="text-sm text-gray-900 dark:text-white">
                {event.location}
              </span>
            </div>
          )}

          {event.meetingLink && (
            <div className="flex items-center">
              <Video className="h-4 w-4 text-gray-400 mr-3" />
              <a
                href={event.meetingLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
              >
                Join Meeting
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Quick Status Change */}
      {onStatusChange && (
        <div>
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
            Quick Actions
          </h4>
          <div className="flex flex-wrap gap-2">
            {Object.entries(statusConfig).map(([status, config]) => (
              <Button
                key={status}
                variant={event.status === status ? "default" : "outline"}
                size="sm"
                onClick={() => onStatusChange(status)}
                className="text-xs"
              >
                <config.icon className="h-3 w-3 mr-1" />
                {config.label}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      {showActions && (
        <div className="flex space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button variant="outline" onClick={onEdit} className="flex-1">
            <Edit className="h-4 w-4 mr-2" />
            Edit Event
          </Button>
          <Button variant="destructive" onClick={onDelete} className="flex-1">
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      )}
    </div>
  );
};

export default CalendarEvent;
