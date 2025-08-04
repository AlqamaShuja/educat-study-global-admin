import React from 'react';
import { format, addHours } from 'date-fns';
import { UserCheck, Clock, Edit, Trash2 } from 'lucide-react';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import Card from '../ui/Card';

const ScheduleTableView = ({
  schedules = [],
  onView,
  onEdit,
  onDelete,
  getTypeColor,
  getStatusColor,
  loading = false,
  className = '',
}) => {
  if (loading) {
    return (
      <div className={`bg-white/90 backdrop-blur-sm rounded-lg shadow-lg ${className}`}>
        <div className="p-6">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-blue-100 rounded w-3/4 animate-pulse" />
                  <div className="h-3 bg-blue-100 rounded w-1/2 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={`bg-white/90 backdrop-blur-sm rounded-lg shadow-lg overflow-hidden ${className}`}>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-blue-100">
            <thead className="bg-gradient-to-r from-blue-50 to-purple-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Staff
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Start Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  End Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Notes
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white/70 backdrop-blur-sm divide-y divide-blue-100">
              {schedules.map((schedule) => (
                <tr key={schedule.id} className="hover:bg-blue-50/50 transition-colors duration-200">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                          <UserCheck className="h-5 w-5 text-blue-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {schedule.staffName || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-600">
                          {schedule.staffId || 'N/A'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 text-gray-400 mr-2" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {format(new Date(schedule.startTime), 'MMM dd, yyyy')}
                        </div>
                        <div className="text-sm text-gray-600">
                          {format(new Date(schedule.startTime), 'HH:mm')}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 text-gray-400 mr-2" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {schedule.endTime
                            ? format(new Date(schedule.endTime), 'MMM dd, yyyy')
                            : format(addHours(new Date(schedule.startTime), 1), 'MMM dd, yyyy')}
                        </div>
                        <div className="text-sm text-gray-600">
                          {schedule.endTime
                            ? format(new Date(schedule.endTime), 'HH:mm')
                            : format(addHours(new Date(schedule.startTime), 1), 'HH:mm')}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge className={getTypeColor(schedule.type)}>
                      {schedule.type?.replace('_', ' ').toUpperCase() || 'N/A'}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge
                      className={
                        new Date(
                          schedule.endTime ||
                            addHours(new Date(schedule.startTime), 1)
                        ) < new Date() && schedule.status === "scheduled"
                          ? getStatusColor("no_show")
                          : getStatusColor(schedule.status)
                      }
                    >
                      {new Date(
                        schedule.endTime ||
                          addHours(new Date(schedule.startTime), 1)
                      ) < new Date() && schedule.status === "scheduled"
                        ? "NO SHOW"
                        : schedule.status?.replace('_', ' ').toUpperCase() || 'N/A'}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {schedule.notes || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onView(schedule)}
                        className="p-1"
                        title="View details"
                      >
                        <UserCheck className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(schedule)}
                        className="p-1"
                        title="Edit schedule"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(schedule)}
                        className="p-1 text-red-600 hover:text-red-700"
                        title="Delete schedule"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {schedules.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mb-4">
              <UserCheck className="h-8 w-8 text-blue-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No schedules found
            </h3>
            <p className="text-gray-600">
              There are no schedules to display at the moment.
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default ScheduleTableView; 