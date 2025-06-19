import React, { useState, useMemo } from "react";
import {
  Clock,
  Calendar,
  User,
  Check,
  X,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  format,
  addMinutes,
  parseISO,
  isWithinInterval,
  isBefore,
  isAfter,
} from "date-fns";
import Button from "../ui/Button";
import Badge from "../ui/Badge";

const TimeSlotSelector = ({
  date,
  consultantId,
  duration = 60,
  availability = [],
  existingAppointments = [],
  selectedSlot,
  onSlotSelect,
  timeFormat = "12h", // '12h' or '24h'
  slotInterval = 30, // minutes
  workingHours = { start: "09:00", end: "18:00" },
  breakTime = { start: "12:00", end: "13:00" },
  showUnavailableSlots = false,
  groupByHour = true,
  className = "",
}) => {
  const [expandedHours, setExpandedHours] = useState(new Set());

  // Generate time slots based on working hours and interval
  const timeSlots = useMemo(() => {
    const slots = [];
    const [startHour, startMinute] = workingHours.start.split(":").map(Number);
    const [endHour, endMinute] = workingHours.end.split(":").map(Number);

    const startTime = new Date();
    startTime.setHours(startHour, startMinute, 0, 0);

    const endTime = new Date();
    endTime.setHours(endHour, endMinute, 0, 0);

    let currentTime = new Date(startTime);

    while (currentTime < endTime) {
      const timeString = format(currentTime, "HH:mm");
      slots.push({
        time: timeString,
        display: format(currentTime, timeFormat === "12h" ? "h:mm a" : "HH:mm"),
        hour: currentTime.getHours(),
        date: currentTime,
      });
      currentTime = addMinutes(currentTime, slotInterval);
    }

    return slots;
  }, [workingHours, slotInterval, timeFormat]);

  // Check if a slot is available
  const isSlotAvailable = (slot) => {
    const slotDateTime = parseISO(
      `${format(date, "yyyy-MM-dd")}T${slot.time}:00`
    );
    const slotEndTime = addMinutes(slotDateTime, duration);

    // Check if slot is in the past
    if (isBefore(slotDateTime, new Date())) {
      return false;
    }

    // Check if within break time
    if (breakTime) {
      const breakStart = parseISO(
        `${format(date, "yyyy-MM-dd")}T${breakTime.start}:00`
      );
      const breakEnd = parseISO(
        `${format(date, "yyyy-MM-dd")}T${breakTime.end}:00`
      );

      if (
        isWithinInterval(slotDateTime, { start: breakStart, end: breakEnd }) ||
        isWithinInterval(slotEndTime, { start: breakStart, end: breakEnd })
      ) {
        return false;
      }
    }

    // Check consultant availability
    const dayAvailability = availability.find(
      (av) => av.consultantId === consultantId
    );
    if (dayAvailability && !dayAvailability.available) {
      return false;
    }

    // Check for specific time availability
    if (dayAvailability && dayAvailability.timeSlots) {
      const isTimeAvailable = dayAvailability.timeSlots.some((timeSlot) => {
        const slotStart = parseISO(
          `${format(date, "yyyy-MM-dd")}T${timeSlot.start}:00`
        );
        const slotEndSlot = parseISO(
          `${format(date, "yyyy-MM-dd")}T${timeSlot.end}:00`
        );

        return (
          isWithinInterval(slotDateTime, {
            start: slotStart,
            end: slotEndSlot,
          }) &&
          isWithinInterval(slotEndTime, { start: slotStart, end: slotEndSlot })
        );
      });

      if (!isTimeAvailable) {
        return false;
      }
    }

    // Check for conflicts with existing appointments
    const hasConflict = existingAppointments.some((apt) => {
      const aptStart = parseISO(apt.startTime);
      const aptEnd = parseISO(apt.endTime);

      return (
        (slotDateTime >= aptStart && slotDateTime < aptEnd) ||
        (slotEndTime > aptStart && slotEndTime <= aptEnd) ||
        (slotDateTime <= aptStart && slotEndTime >= aptEnd)
      );
    });

    return !hasConflict;
  };

  // Get slot status
  const getSlotStatus = (slot) => {
    const slotDateTime = parseISO(
      `${format(date, "yyyy-MM-dd")}T${slot.time}:00`
    );

    if (isBefore(slotDateTime, new Date())) {
      return { type: "past", label: "Past", variant: "secondary" };
    }

    if (!isSlotAvailable(slot)) {
      return {
        type: "unavailable",
        label: "Unavailable",
        variant: "destructive",
      };
    }

    // Check if there's a nearby appointment
    const hasNearbyAppointment = existingAppointments.some((apt) => {
      const aptStart = parseISO(apt.startTime);
      const timeDiff =
        Math.abs(slotDateTime.getTime() - aptStart.getTime()) / (1000 * 60);
      return timeDiff <= 30 && timeDiff > 0;
    });

    if (hasNearbyAppointment) {
      return { type: "limited", label: "Limited time", variant: "warning" };
    }

    return { type: "available", label: "Available", variant: "success" };
  };

  // Group slots by hour
  const groupedSlots = useMemo(() => {
    if (!groupByHour) return { all: timeSlots };

    return timeSlots.reduce((groups, slot) => {
      const hour = slot.hour;
      if (!groups[hour]) {
        groups[hour] = [];
      }
      groups[hour].push(slot);
      return groups;
    }, {});
  }, [timeSlots, groupByHour]);

  // Toggle hour expansion
  const toggleHourExpansion = (hour) => {
    const newExpanded = new Set(expandedHours);
    if (newExpanded.has(hour)) {
      newExpanded.delete(hour);
    } else {
      newExpanded.add(hour);
    }
    setExpandedHours(newExpanded);
  };

  // Handle slot selection
  const handleSlotSelect = (slot) => {
    if (!isSlotAvailable(slot)) return;

    const slotData = {
      time: slot.time,
      display: slot.display,
      date,
      duration,
      endTime: format(
        addMinutes(
          parseISO(`${format(date, "yyyy-MM-dd")}T${slot.time}:00`),
          duration
        ),
        "HH:mm"
      ),
    };

    onSlotSelect(slotData);
  };

  // Get available slots count
  const availableCount = timeSlots.filter((slot) =>
    isSlotAvailable(slot)
  ).length;
  const totalCount = timeSlots.length;

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 ${className}`}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Calendar className="h-5 w-5 text-gray-400" />
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">
                {format(date, "EEEE, MMMM d, yyyy")}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {duration} minute slots
              </p>
            </div>
          </div>

          <div className="text-right">
            <div className="text-sm font-medium text-gray-900 dark:text-white">
              {availableCount} / {totalCount}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Available slots
            </div>
          </div>
        </div>
      </div>

      {/* Time Slots */}
      <div className="p-4">
        {availableCount === 0 ? (
          <div className="text-center py-8">
            <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500 dark:text-gray-400 font-medium">
              No available slots
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500">
              Try selecting a different date
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {groupByHour ? (
              Object.entries(groupedSlots).map(([hour, slots]) => {
                const hourInt = parseInt(hour);
                const isExpanded = expandedHours.has(hourInt);
                const availableInHour = slots.filter((slot) =>
                  isSlotAvailable(slot)
                ).length;

                if (availableInHour === 0 && !showUnavailableSlots) {
                  return null;
                }

                return (
                  <div
                    key={hour}
                    className="border border-gray-200 dark:border-gray-600 rounded-lg"
                  >
                    <button
                      onClick={() => toggleHourExpansion(hourInt)}
                      className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="font-medium text-gray-900 dark:text-white">
                          {format(
                            new Date().setHours(hourInt, 0, 0, 0),
                            timeFormat === "12h" ? "h a" : "HH:00"
                          )}
                        </span>
                        <Badge
                          variant={
                            availableInHour > 0 ? "success" : "secondary"
                          }
                          className="text-xs"
                        >
                          {availableInHour} available
                        </Badge>
                      </div>

                      <div className="flex items-center space-x-2">
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4 text-gray-400" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="px-4 pb-4">
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                          {slots.map((slot, index) => {
                            const status = getSlotStatus(slot);
                            const isSelected =
                              selectedSlot && selectedSlot.time === slot.time;
                            const isAvailable =
                              status.type === "available" ||
                              status.type === "limited";

                            if (!showUnavailableSlots && !isAvailable) {
                              return null;
                            }

                            return (
                              <button
                                key={index}
                                onClick={() => handleSlotSelect(slot)}
                                disabled={!isAvailable}
                                className={`
                                  p-3 rounded-lg border text-sm font-medium transition-all duration-200
                                  ${
                                    isSelected
                                      ? "bg-blue-600 border-blue-600 text-white shadow-lg"
                                      : isAvailable
                                      ? "bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-600"
                                      : "bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-400 cursor-not-allowed"
                                  }
                                `}
                              >
                                <div className="flex flex-col items-center">
                                  <span>{slot.display}</span>
                                  {isSelected && (
                                    <Check className="h-3 w-3 mt-1" />
                                  )}
                                  {status.type === "limited" && !isSelected && (
                                    <AlertCircle className="h-3 w-3 mt-1 text-orange-500" />
                                  )}
                                  {!isAvailable && (
                                    <X className="h-3 w-3 mt-1" />
                                  )}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              // Flat view without grouping
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                {timeSlots.map((slot, index) => {
                  const status = getSlotStatus(slot);
                  const isSelected =
                    selectedSlot && selectedSlot.time === slot.time;
                  const isAvailable =
                    status.type === "available" || status.type === "limited";

                  if (!showUnavailableSlots && !isAvailable) {
                    return null;
                  }

                  return (
                    <button
                      key={index}
                      onClick={() => handleSlotSelect(slot)}
                      disabled={!isAvailable}
                      className={`
                        p-3 rounded-lg border text-sm font-medium transition-all duration-200
                        ${
                          isSelected
                            ? "bg-blue-600 border-blue-600 text-white shadow-lg"
                            : isAvailable
                            ? "bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-600"
                            : "bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-400 cursor-not-allowed"
                        }
                      `}
                    >
                      <div className="flex flex-col items-center">
                        <span>{slot.display}</span>
                        {isSelected && <Check className="h-3 w-3 mt-1" />}
                        {status.type === "limited" && !isSelected && (
                          <AlertCircle className="h-3 w-3 mt-1 text-orange-500" />
                        )}
                        {!isAvailable && <X className="h-3 w-3 mt-1" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
              <span className="text-gray-600 dark:text-gray-400">
                Available
              </span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-orange-500 rounded mr-2"></div>
              <span className="text-gray-600 dark:text-gray-400">
                Limited time
              </span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-gray-400 rounded mr-2"></div>
              <span className="text-gray-600 dark:text-gray-400">
                Unavailable
              </span>
            </div>
          </div>

          {selectedSlot && (
            <div className="text-right">
              <div className="font-medium text-gray-900 dark:text-white">
                Selected: {selectedSlot.display}
              </div>
              <div className="text-gray-500 dark:text-gray-400">
                Duration: {duration} minutes
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TimeSlotSelector;
