import React, { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import Card from '../ui/Card';

const AppointmentCalendarView = ({
  appointments = [],
  onAppointmentClick,
  getStatusColor,
  getTypeIcon,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  // Get calendar days for current month
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get appointments for a specific day
  const getAppointmentsForDay = (day) => {
    return appointments.filter(appointment => {
      const appointmentDate = new Date(appointment.dateTime);
      return isSameDay(appointmentDate, day);
    });
  };

  // Get event color based on status
  const getEventColor = (status) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-500';
      case 'completed':
        return 'bg-green-500';
      case 'cancelled':
        return 'bg-red-500';
      case 'no_show':
        return 'bg-amber-500';
      default:
        return 'bg-gray-500';
    }
  };

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  return (
    <Card>
      <div className="p-4">
        <div className="mb-4">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Calendar View
          </h3>
          <p className="text-sm text-gray-600">
            Click on any appointment to view details
          </p>
        </div>
        
        <div className="bg-white rounded-lg border">
          {/* Calendar Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <button
              onClick={prevMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            
            <h2 className="text-lg font-semibold text-gray-900">
              {format(currentDate, 'MMMM yyyy')}
            </h2>
            
            <button
              onClick={nextMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-px bg-gray-200">
            {/* Day Headers */}
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="bg-gray-50 p-2 text-center text-sm font-medium text-gray-700">
                {day}
              </div>
            ))}

            {/* Calendar Days */}
            {calendarDays.map((day, index) => {
              const dayAppointments = getAppointmentsForDay(day);
              const isCurrentMonth = isSameMonth(day, currentDate);
              const isToday = isSameDay(day, new Date());

              return (
                <div
                  key={index}
                  className={`min-h-[120px] p-2 bg-white ${
                    !isCurrentMonth ? 'text-gray-400' : 'text-gray-900'
                  } ${isToday ? 'bg-blue-50' : ''}`}
                >
                  <div className="text-sm font-medium mb-1">
                    {format(day, 'd')}
                  </div>
                  
                  <div className="space-y-1">
                    {dayAppointments.slice(0, 3).map((appointment) => {
                      const IconComponent = getTypeIcon(appointment.type);
                      return (
                        <div
                          key={appointment.id}
                          onClick={() => onAppointmentClick(appointment)}
                          className={`p-1 rounded text-xs cursor-pointer hover:opacity-80 transition-opacity ${getEventColor(appointment.status)} text-white`}
                          title={`${appointment.student?.name || 'Unknown'} - ${appointment.type.replace('_', ' ')}`}
                        >
                          <div className="flex items-center">
                            <IconComponent className="h-2 w-2 mr-1" />
                            <span className="truncate">
                              {appointment.student?.name || 'Unknown'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                    
                    {dayAppointments.length > 3 && (
                      <div className="text-xs text-gray-500 text-center">
                        +{dayAppointments.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-4 flex flex-wrap gap-4 text-sm">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-500 rounded mr-2"></div>
            <span>Scheduled</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
            <span>Completed</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-500 rounded mr-2"></div>
            <span>Cancelled</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-amber-500 rounded mr-2"></div>
            <span>No Show</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default AppointmentCalendarView; 