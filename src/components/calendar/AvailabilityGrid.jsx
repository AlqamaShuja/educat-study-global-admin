import React, { useState, useMemo } from "react";
import {
  Clock,
  Calendar,
  User,
  Edit,
  Save,
  X,
  Plus,
  Trash2,
  Copy,
  RotateCcw,
} from "lucide-react";
import {
  format,
  addDays,
  startOfWeek,
  eachDayOfInterval,
  isSameDay,
  isToday,
} from "date-fns";
import Button from "../ui/Button";
import Input from "../ui/Input";
import Badge from "../ui/Badge";

const AvailabilityGrid = ({
  consultantId,
  weekDate = new Date(),
  availability = [],
  onUpdateAvailability,
  onCopyWeek,
  readOnly = false,
  showConsultantName = true,
  className = "",
}) => {
  const [editingDay, setEditingDay] = useState(null);
  const [editingSlots, setEditingSlots] = useState([]);
  const [unsavedChanges, setUnsavedChanges] = useState(false);

  // Generate week days
  const weekDays = useMemo(() => {
    const start = startOfWeek(weekDate);
    return eachDayOfInterval({ start, end: addDays(start, 6) });
  }, [weekDate]);

  // Default time slots
  const defaultTimeSlots = [
    { start: "09:00", end: "12:00", type: "work" },
    { start: "13:00", end: "18:00", type: "work" },
  ];

  // Get availability for a specific day
  const getDayAvailability = (date) => {
    return (
      availability.find(
        (av) =>
          av.consultantId === consultantId && isSameDay(new Date(av.date), date)
      ) || {
        date: format(date, "yyyy-MM-dd"),
        consultantId,
        available: false,
        timeSlots: [],
      }
    );
  };

  // Start editing a day
  const startEditing = (date) => {
    if (readOnly) return;

    const dayAvailability = getDayAvailability(date);
    setEditingDay(date);
    setEditingSlots(
      dayAvailability.timeSlots.length > 0
        ? [...dayAvailability.timeSlots]
        : [...defaultTimeSlots]
    );
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingDay(null);
    setEditingSlots([]);
    setUnsavedChanges(false);
  };

  // Save availability
  const saveAvailability = async () => {
    if (!editingDay) return;

    const dayAvailability = {
      date: format(editingDay, "yyyy-MM-dd"),
      consultantId,
      available: editingSlots.length > 0,
      timeSlots: editingSlots.filter((slot) => slot.start && slot.end),
    };

    try {
      await onUpdateAvailability(dayAvailability);
      setEditingDay(null);
      setEditingSlots([]);
      setUnsavedChanges(false);
    } catch (error) {
      console.error("Failed to save availability:", error);
    }
  };

  // Add time slot
  const addTimeSlot = () => {
    setEditingSlots((prev) => [...prev, { start: "", end: "", type: "work" }]);
    setUnsavedChanges(true);
  };

  // Remove time slot
  const removeTimeSlot = (index) => {
    setEditingSlots((prev) => prev.filter((_, i) => i !== index));
    setUnsavedChanges(true);
  };

  // Update time slot
  const updateTimeSlot = (index, field, value) => {
    setEditingSlots((prev) =>
      prev.map((slot, i) => (i === index ? { ...slot, [field]: value } : slot))
    );
    setUnsavedChanges(true);
  };

  // Toggle day availability
  const toggleDayAvailability = async (date) => {
    if (readOnly) return;

    const dayAvailability = getDayAvailability(date);
    const newAvailability = {
      ...dayAvailability,
      available: !dayAvailability.available,
      timeSlots:
        !dayAvailability.available && dayAvailability.timeSlots.length === 0
          ? defaultTimeSlots
          : dayAvailability.timeSlots,
    };

    try {
      await onUpdateAvailability(newAvailability);
    } catch (error) {
      console.error("Failed to toggle availability:", error);
    }
  };

  // Copy week availability
  const copyWeek = () => {
    if (onCopyWeek) {
      onCopyWeek(weekDate, consultantId);
    }
  };

  // Reset week to default
  const resetWeek = async () => {
    if (readOnly) return;

    const weekAvailability = weekDays.map((date) => ({
      date: format(date, "yyyy-MM-dd"),
      consultantId,
      available: ![0, 6].includes(date.getDay()), // Skip weekends
      timeSlots: ![0, 6].includes(date.getDay()) ? defaultTimeSlots : [],
    }));

    try {
      for (const dayAvailability of weekAvailability) {
        await onUpdateAvailability(dayAvailability);
      }
    } catch (error) {
      console.error("Failed to reset week:", error);
    }
  };

  // Calculate total hours for a day
  const calculateDayHours = (timeSlots) => {
    return timeSlots.reduce((total, slot) => {
      if (!slot.start || !slot.end) return total;

      const start = new Date(`2000-01-01T${slot.start}:00`);
      const end = new Date(`2000-01-01T${slot.end}:00`);
      const hours = (end - start) / (1000 * 60 * 60);

      return total + hours;
    }, 0);
  };

  // Get week total hours
  const weekTotalHours = useMemo(() => {
    return weekDays.reduce((total, date) => {
      const dayAvailability = getDayAvailability(date);
      return total + calculateDayHours(dayAvailability.timeSlots);
    }, 0);
  }, [weekDays, availability]);

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg ${className}`}
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Weekly Availability
            </h3>
            {showConsultantName && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Consultant ID: {consultantId}
              </p>
            )}
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
              Week of {format(weekDays[0], "MMM d")} -{" "}
              {format(weekDays[6], "MMM d, yyyy")}
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Badge variant="secondary">
              {weekTotalHours.toFixed(1)}h total
            </Badge>

            {!readOnly && (
              <>
                <Button variant="outline" size="sm" onClick={copyWeek}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Week
                </Button>

                <Button variant="outline" size="sm" onClick={resetWeek}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Availability Grid */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
          {weekDays.map((date, index) => {
            const dayAvailability = getDayAvailability(date);
            const isEditing = editingDay && isSameDay(editingDay, date);
            const dayHours = calculateDayHours(dayAvailability.timeSlots);
            const isWeekend = [0, 6].includes(date.getDay());

            return (
              <div
                key={index}
                className={`
                  border rounded-lg transition-all duration-200
                  ${
                    isToday(date)
                      ? "border-blue-300 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-600"
                      : "border-gray-200 dark:border-gray-700"
                  }
                  ${
                    isWeekend
                      ? "bg-gray-50 dark:bg-gray-900"
                      : "bg-white dark:bg-gray-800"
                  }
                `}
              >
                {/* Day Header */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {format(date, "EEE")}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {format(date, "MMM d")}
                      </p>
                    </div>

                    <div className="flex items-center space-x-2">
                      {dayHours > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          {dayHours}h
                        </Badge>
                      )}

                      {!readOnly && (
                        <button
                          onClick={() =>
                            isEditing ? cancelEditing() : startEditing(date)
                          }
                          className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                          {isEditing ? (
                            <X className="h-4 w-4" />
                          ) : (
                            <Edit className="h-4 w-4" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Availability Toggle */}
                  {!readOnly && (
                    <div className="mt-3">
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={dayAvailability.available}
                          onChange={() => toggleDayAvailability(date)}
                          className="sr-only"
                        />
                        <div
                          className={`
                          relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                          ${
                            dayAvailability.available
                              ? "bg-blue-600"
                              : "bg-gray-200 dark:bg-gray-700"
                          }
                        `}
                        >
                          <span
                            className={`
                            inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                            ${
                              dayAvailability.available
                                ? "translate-x-6"
                                : "translate-x-1"
                            }
                          `}
                          />
                        </div>
                        <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                          Available
                        </span>
                      </label>
                    </div>
                  )}
                </div>

                {/* Time Slots */}
                <div className="p-4">
                  {isEditing ? (
                    <div className="space-y-3">
                      {editingSlots.map((slot, slotIndex) => (
                        <div
                          key={slotIndex}
                          className="flex items-center space-x-2"
                        >
                          <Input
                            type="time"
                            value={slot.start}
                            onChange={(e) =>
                              updateTimeSlot(slotIndex, "start", e.target.value)
                            }
                            className="text-xs"
                          />
                          <span className="text-gray-400">-</span>
                          <Input
                            type="time"
                            value={slot.end}
                            onChange={(e) =>
                              updateTimeSlot(slotIndex, "end", e.target.value)
                            }
                            className="text-xs"
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeTimeSlot(slotIndex)}
                            className="p-1 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}

                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={addTimeSlot}
                          className="flex-1 text-xs"
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Add Slot
                        </Button>
                        <Button
                          size="sm"
                          onClick={saveAvailability}
                          className="flex-1 text-xs"
                        >
                          <Save className="h-3 w-3 mr-1" />
                          Save
                        </Button>
                      </div>

                      {unsavedChanges && (
                        <p className="text-xs text-orange-600 dark:text-orange-400">
                          Unsaved changes
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {dayAvailability.available &&
                      dayAvailability.timeSlots.length > 0 ? (
                        dayAvailability.timeSlots.map((slot, slotIndex) => (
                          <div
                            key={slotIndex}
                            className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded text-xs"
                          >
                            <div className="flex items-center">
                              <Clock className="h-3 w-3 text-green-600 dark:text-green-400 mr-1" />
                              <span className="text-green-800 dark:text-green-200">
                                {format(
                                  new Date(`2000-01-01T${slot.start}:00`),
                                  "h:mm a"
                                )}{" "}
                                -{" "}
                                {format(
                                  new Date(`2000-01-01T${slot.end}:00`),
                                  "h:mm a"
                                )}
                              </span>
                            </div>
                          </div>
                        ))
                      ) : dayAvailability.available ? (
                        <div className="text-center py-4">
                          <Calendar className="h-6 w-6 text-gray-400 mx-auto mb-2" />
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Available but no time slots set
                          </p>
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <X className="h-6 w-6 text-gray-400 mx-auto mb-2" />
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Not available
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Summary */}
      <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
              <span className="text-gray-600 dark:text-gray-400">
                Available
              </span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-gray-400 rounded mr-2"></div>
              <span className="text-gray-600 dark:text-gray-400">
                Unavailable
              </span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-500 rounded mr-2"></div>
              <span className="text-gray-600 dark:text-gray-400">Today</span>
            </div>
          </div>

          <div className="text-gray-600 dark:text-gray-400">
            Total: {weekTotalHours.toFixed(1)} hours this week
          </div>
        </div>
      </div>
    </div>
  );
};

export default AvailabilityGrid;
