import React, { useState, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Filter,
  Calendar as CalendarIcon,
  Clock,
  Users,
} from "lucide-react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
  parseISO,
} from "date-fns";
import CalendarEvent from "./CalendarEvent";
import Button from "../ui/Button";
import Badge from "../ui/Badge";

const Calendar = ({
  events = [],
  selectedDate,
  onDateSelect,
  onEventClick,
  onEventCreate,
  onEventUpdate,
  onEventDelete,
  view = "month", // 'month', 'week', 'day'
  showFilter = true,
  showCreateButton = true,
  eventFilters = {},
  className = "",
}) => {
  const [currentDate, setCurrentDate] = useState(selectedDate || new Date());
  const [showFilters, setShowFilters] = useState(showFilter);
  const [activeFilters, setActiveFilters] = useState({
    status: "all",
    type: "all",
    consultant: "all",
  });

  // Generate calendar days for month view
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);

    return eachDayOfInterval({
      start: calendarStart,
      end: calendarEnd,
    });
  }, [currentDate]);

  // Filter events based on active filters
  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      if (
        activeFilters.status !== "all" &&
        event.status !== activeFilters.status
      ) {
        return false;
      }
      if (activeFilters.type !== "all" && event.type !== activeFilters.type) {
        return false;
      }
      if (
        activeFilters.consultant !== "all" &&
        event.consultantId !== activeFilters.consultant
      ) {
        return false;
      }
      return true;
    });
  }, [events, activeFilters]);

  // Get events for a specific date
  const getEventsForDate = (date) => {
    return filteredEvents.filter((event) => {
      const eventDate =
        typeof event.date === "string" ? parseISO(event.date) : event.date;
      return isSameDay(eventDate, date);
    });
  };

  // Navigation functions
  const navigateMonth = (direction) => {
    setCurrentDate((prev) =>
      direction === "next" ? addMonths(prev, 1) : subMonths(prev, 1)
    );
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Event handlers
  const handleDateClick = (date) => {
    if (onDateSelect) {
      onDateSelect(date);
    }
  };

  const handleEventClick = (event) => {
    if (onEventClick) {
      onEventClick(event);
    }
  };

  const handleCreateEvent = (date) => {
    if (onEventCreate) {
      onEventCreate(date);
    }
  };

  // Get unique values for filters
  const getFilterOptions = () => {
    const statuses = [...new Set(events.map((e) => e.status))];
    const types = [...new Set(events.map((e) => e.type))];
    const consultants = [...new Set(events.map((e) => e.consultantId))];

    return { statuses, types, consultants };
  };

  const { statuses, types, consultants } = getFilterOptions();

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg ${className}`}
    >
      {/* Calendar Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {format(currentDate, "MMMM yyyy")}
            </h2>
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigateMonth("prev")}
                className="p-2"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigateMonth("next")}
                className="p-2"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Button variant="outline" size="sm" onClick={goToToday}>
              Today
            </Button>

            {showFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className={showFilters ? "bg-gray-100 dark:bg-gray-700" : ""}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            )}

            {showCreateButton && (
              <Button size="sm" onClick={() => handleCreateEvent(currentDate)}>
                <Plus className="h-4 w-4 mr-2" />
                New Event
              </Button>
            )}
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status
                </label>
                <select
                  value={activeFilters.status}
                  onChange={(e) =>
                    setActiveFilters((prev) => ({
                      ...prev,
                      status: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="all">All Statuses</option>
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Type
                </label>
                <select
                  value={activeFilters.type}
                  onChange={(e) =>
                    setActiveFilters((prev) => ({
                      ...prev,
                      type: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="all">All Types</option>
                  {types.map((type) => (
                    <option key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Consultant
                </label>
                <select
                  value={activeFilters.consultant}
                  onChange={(e) =>
                    setActiveFilters((prev) => ({
                      ...prev,
                      consultant: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="all">All Consultants</option>
                  {consultants.map((consultantId) => (
                    <option key={consultantId} value={consultantId}>
                      Consultant {consultantId}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Calendar Grid */}
      <div className="p-6">
        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-1 mb-4">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div
              key={day}
              className="p-3 text-center text-sm font-medium text-gray-500 dark:text-gray-400"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, index) => {
            const dayEvents = getEventsForDate(day);
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isSelected = selectedDate && isSameDay(day, selectedDate);
            const isCurrentDay = isToday(day);

            return (
              <div
                key={index}
                className={`
                  min-h-[120px] p-2 border border-gray-200 dark:border-gray-700 cursor-pointer
                  transition-colors duration-200 hover:bg-gray-50 dark:hover:bg-gray-700
                  ${
                    !isCurrentMonth
                      ? "bg-gray-50 dark:bg-gray-900 text-gray-400"
                      : "bg-white dark:bg-gray-800"
                  }
                  ${isSelected ? "ring-2 ring-blue-500" : ""}
                  ${isCurrentDay ? "bg-blue-50 dark:bg-blue-900/20" : ""}
                `}
                onClick={() => handleDateClick(day)}
              >
                {/* Date Number */}
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`
                      text-sm font-medium
                      ${
                        isCurrentDay
                          ? "text-blue-600 dark:text-blue-400 font-bold"
                          : ""
                      }
                      ${
                        !isCurrentMonth
                          ? "text-gray-400"
                          : "text-gray-900 dark:text-white"
                      }
                    `}
                  >
                    {format(day, "d")}
                  </span>
                  {dayEvents.length > 0 && (
                    <Badge variant="secondary" className="text-xs px-1 py-0">
                      {dayEvents.length}
                    </Badge>
                  )}
                </div>

                {/* Events */}
                <div className="space-y-1">
                  {dayEvents.slice(0, 3).map((event, eventIndex) => (
                    <CalendarEvent
                      key={event.id || eventIndex}
                      event={event}
                      onClick={() => handleEventClick(event)}
                      compact
                    />
                  ))}
                  {dayEvents.length > 3 && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                      +{dayEvents.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Calendar Legend */}
      <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center">
              <CalendarIcon className="h-4 w-4 mr-2" />
              <span>{filteredEvents.length} events this month</span>
            </div>
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              <span>Click dates to create events</span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
              <div className="w-3 h-3 bg-blue-500 rounded mr-2"></div>
              <span>Appointments</span>
            </div>
            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
              <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
              <span>Meetings</span>
            </div>
            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
              <div className="w-3 h-3 bg-purple-500 rounded mr-2"></div>
              <span>Tasks</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calendar;
