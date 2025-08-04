import React from 'react';
import { format, addHours } from 'date-fns';
import { UserCheck, Clock, Calendar, FileText, AlertCircle } from 'lucide-react';
import Modal from '../ui/Modal';
import Badge from '../ui/Badge';

const ScheduleDetailModal = ({ isOpen, onClose, schedule, getTypeColor, getStatusColor }) => {
  if (!schedule) return null;

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid Date';
      return format(date, 'PPP');
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const formatTime = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid Time';
      return format(date, 'HH:mm');
    } catch (error) {
      return 'Invalid Time';
    }
  };

  const getEndTime = () => {
    if (schedule.endTime) {
      return new Date(schedule.endTime);
    }
    return addHours(new Date(schedule.startTime), 1);
  };

  const scheduleTypes = [
    { value: "shift", label: "Shift" },
    { value: "meeting", label: "Meeting" },
    { value: "training", label: "Training" },
    { value: "leave", label: "Leave" },
  ];

  const scheduleStatuses = [
    { value: "scheduled", label: "Scheduled" },
    { value: "completed", label: "Completed" },
    { value: "canceled", label: "Canceled" },
    { value: "no_show", label: "No Show" },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Schedule Details" size="lg">
      <div className="space-y-6">
        {/* Staff Information */}
        <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
          <UserCheck className="h-5 w-5 text-blue-600" />
          <div>
            <h3 className="font-medium text-gray-900">{schedule.staffName || 'Unknown Staff'}</h3>
            <p className="text-sm text-gray-600">Staff Member</p>
          </div>
        </div>

        {/* Schedule Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
              <Badge className={getTypeColor(schedule.type)}>
                {scheduleTypes.find(t => t.value === schedule.type)?.label || schedule.type}
              </Badge>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <Badge className={getStatusColor(schedule.status)}>
                {scheduleStatuses.find(s => s.value === schedule.status)?.label || schedule.status}
              </Badge>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span className="text-gray-900">{formatDate(schedule.startTime)}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-gray-400" />
                <span className="text-gray-900">{formatTime(schedule.startTime)}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-gray-400" />
                <span className="text-gray-900">{formatTime(getEndTime())}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-gray-400" />
                <span className="text-gray-900">
                  {Math.round((getEndTime() - new Date(schedule.startTime)) / (1000 * 60))} minutes
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        {schedule.notes && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
            <div className="flex items-start space-x-2">
              <FileText className="h-4 w-4 text-gray-400 mt-0.5" />
              <p className="text-gray-900 bg-gray-50 p-3 rounded-lg flex-1">
                {schedule.notes}
              </p>
            </div>
          </div>
        )}

        {/* Student Information (if available) */}
        {schedule.studentName && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Student</label>
            <div className="flex items-center space-x-2">
              <UserCheck className="h-4 w-4 text-gray-400" />
              <span className="text-gray-900">{schedule.studentName}</span>
            </div>
          </div>
        )}

        {/* Additional Information */}
        {/* <div className="border-t pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Created:</span>
              <span className="ml-2 text-gray-900">
                {formatDate(schedule.createdAt)}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Last Updated:</span>
              <span className="ml-2 text-gray-900">
                {formatDate(schedule.updatedAt)}
              </span>
            </div>
          </div>
        </div> */}

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ScheduleDetailModal; 