import React, { useState, useEffect, useMemo } from "react";
import {
  Calendar,
  Clock,
  User,
  MapPin,
  Video,
  Phone,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  AlertCircle,
  Loader2,
} from "lucide-react";
import {
  format,
  addDays,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
  isToday,
  isBefore,
  parseISO,
  addMinutes,
  isWithinInterval,
} from "date-fns";
import Button from "../ui/Button";
import Input from "../ui/Input";
import Modal from "../ui/Modal";
import Badge from "../ui/Badge";
import { useAppointmentStore } from "../../stores/appointmentStore";
import { useAuthStore } from "../../stores/authStore";

const AppointmentScheduler = ({
  consultantId,
  studentId,
  selectedDate,
  onAppointmentCreated,
  onClose,
  availabilityData = [],
  existingAppointments = [],
  className = "",
}) => {
  const [currentWeek, setCurrentWeek] = useState(selectedDate || new Date());
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [appointmentDetails, setAppointmentDetails] = useState({
    title: "",
    description: "",
    type: "consultation",
    location: "office",
    meetingLink: "",
    duration: 60,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const { user } = useAuthStore();
  const { createAppointment, getConsultantAvailability } =
    useAppointmentStore();

  // Generate week days
  const weekDays = useMemo(() => {
    const start = startOfWeek(currentWeek);
    const end = endOfWeek(currentWeek);
    return eachDayOfInterval({ start, end });
  }, [currentWeek]);

  // Time slots (9 AM to 6 PM in 30-minute intervals)
  const timeSlots = useMemo(() => {
    const slots = [];
    for (let hour = 9; hour < 18; hour++) {
      for (let minute of [0, 30]) {
        const time = `${hour.toString().padStart(2, "0")}:${minute
          .toString()
          .padStart(2, "0")}`;
        slots.push(time);
      }
    }
    return slots;
  }, []);

  // Check if a time slot is available
  const isSlotAvailable = (date, time) => {
    const slotDateTime = new Date(`${format(date, "yyyy-MM-dd")}T${time}:00`);
    const slotEndTime = addMinutes(slotDateTime, appointmentDetails.duration);

    // Check if slot is in the past
    if (isBefore(slotDateTime, new Date())) {
      return false;
    }

    // Check consultant availability
    const dayAvailability = availabilityData.find(
      (av) =>
        isSameDay(parseISO(av.date), date) && av.consultantId === consultantId
    );

    if (!dayAvailability || !dayAvailability.available) {
      return false;
    }

    // Check time slot is within working hours
    const workStart = parseISO(
      `${format(date, "yyyy-MM-dd")}T${dayAvailability.startTime || "09:00"}:00`
    );
    const workEnd = parseISO(
      `${format(date, "yyyy-MM-dd")}T${dayAvailability.endTime || "18:00"}:00`
    );

    if (!isWithinInterval(slotDateTime, { start: workStart, end: workEnd })) {
      return false;
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

  // Navigate weeks
  const navigateWeek = (direction) => {
    setCurrentWeek((prev) => addDays(prev, direction === "next" ? 7 : -7));
  };

  // Handle slot selection
  const handleSlotSelect = (date, time) => {
    if (!isSlotAvailable(date, time)) return;

    setSelectedSlot({ date, time });
  };

  // Handle appointment creation
  const handleCreateAppointment = async () => {
    if (!selectedSlot) return;

    setIsSubmitting(true);
    try {
      const appointmentData = {
        ...appointmentDetails,
        consultantId,
        studentId: studentId || user.id,
        date: format(selectedSlot.date, "yyyy-MM-dd"),
        startTime: selectedSlot.time,
        endTime: format(
          addMinutes(
            new Date(
              `${format(selectedSlot.date, "yyyy-MM-dd")}T${
                selectedSlot.time
              }:00`
            ),
            appointmentDetails.duration
          ),
          "HH:mm"
        ),
        status: "scheduled",
      };

      const result = await createAppointment(appointmentData);

      if (result.success) {
        setShowConfirmation(true);
        if (onAppointmentCreated) {
          onAppointmentCreated(result.appointment);
        }

        // Reset form
        setSelectedSlot(null);
        setAppointmentDetails({
          title: "",
          description: "",
          type: "consultation",
          location: "office",
          meetingLink: "",
          duration: 60,
        });
      }
    } catch (error) {
      console.error("Failed to create appointment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const appointmentTypes = [
    { value: "consultation", label: "Consultation", icon: User },
    { value: "follow_up", label: "Follow-up", icon: Phone },
    { value: "meeting", label: "Meeting", icon: Calendar },
    { value: "interview", label: "Interview", icon: User },
  ];

  const locationTypes = [
    { value: "office", label: "Office Visit", icon: MapPin },
    { value: "virtual", label: "Virtual Meeting", icon: Video },
    { value: "phone", label: "Phone Call", icon: Phone },
  ];

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg ${className}`}
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Schedule Appointment
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Select a date and time for your appointment
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateWeek("prev")}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium px-3">
              {format(currentWeek, "MMM d")} -{" "}
              {format(addDays(currentWeek, 6), "MMM d, yyyy")}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateWeek("next")}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar Grid */}
          <div className="lg:col-span-2">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              {/* Day Headers */}
              <div className="grid grid-cols-7 gap-2 mb-4">
                {weekDays.map((day, index) => (
                  <div
                    key={index}
                    className={`
                      text-center p-3 rounded-lg text-sm font-medium
                      ${
                        isToday(day)
                          ? "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
                          : "text-gray-700 dark:text-gray-300"
                      }
                    `}
                  >
                    <div>{format(day, "EEE")}</div>
                    <div className="text-lg">{format(day, "d")}</div>
                  </div>
                ))}
              </div>

              {/* Time Slots Grid */}
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {timeSlots.map((time) => (
                  <div
                    key={time}
                    className="grid grid-cols-8 gap-2 items-center"
                  >
                    <div className="text-xs font-medium text-gray-500 dark:text-gray-400 text-right">
                      {format(new Date(`2000-01-01T${time}:00`), "h:mm a")}
                    </div>
                    {weekDays.map((day, dayIndex) => {
                      const isAvailable = isSlotAvailable(day, time);
                      const isSelected =
                        selectedSlot &&
                        isSameDay(selectedSlot.date, day) &&
                        selectedSlot.time === time;

                      return (
                        <button
                          key={dayIndex}
                          onClick={() => handleSlotSelect(day, time)}
                          disabled={!isAvailable}
                          className={`
                            h-8 rounded text-xs font-medium transition-colors
                            ${
                              isAvailable
                                ? isSelected
                                  ? "bg-blue-600 text-white"
                                  : "bg-white dark:bg-gray-600 hover:bg-blue-50 dark:hover:bg-blue-900 border border-gray-200 dark:border-gray-500 text-gray-900 dark:text-gray-100"
                                : "bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed"
                            }
                          `}
                        >
                          {isAvailable ? (isSelected ? "✓" : "") : "×"}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Appointment Details Form */}
          <div className="space-y-6">
            {selectedSlot && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
                  <div>
                    <div className="font-medium text-blue-800 dark:text-blue-200">
                      {format(selectedSlot.date, "EEEE, MMMM d, yyyy")}
                    </div>
                    <div className="text-sm text-blue-600 dark:text-blue-400">
                      {format(
                        new Date(`2000-01-01T${selectedSlot.time}:00`),
                        "h:mm a"
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              {/* Appointment Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Appointment Title
                </label>
                <Input
                  placeholder="Enter appointment title"
                  value={appointmentDetails.title}
                  onChange={(e) =>
                    setAppointmentDetails((prev) => ({
                      ...prev,
                      title: e.target.value,
                    }))
                  }
                />
              </div>

              {/* Appointment Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {appointmentTypes.map((type) => {
                    const Icon = type.icon;
                    return (
                      <button
                        key={type.value}
                        onClick={() =>
                          setAppointmentDetails((prev) => ({
                            ...prev,
                            type: type.value,
                          }))
                        }
                        className={`
                          p-3 rounded-lg border text-sm font-medium transition-colors
                          ${
                            appointmentDetails.type === type.value
                              ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300"
                              : "bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"
                          }
                        `}
                      >
                        <Icon className="h-4 w-4 mx-auto mb-1" />
                        {type.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Duration */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Duration
                </label>
                <select
                  value={appointmentDetails.duration}
                  onChange={(e) =>
                    setAppointmentDetails((prev) => ({
                      ...prev,
                      duration: parseInt(e.target.value),
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value={30}>30 minutes</option>
                  <option value={60}>1 hour</option>
                  <option value={90}>1.5 hours</option>
                  <option value={120}>2 hours</option>
                </select>
              </div>

              {/* Location Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Location
                </label>
                <div className="space-y-2">
                  {locationTypes.map((location) => {
                    const Icon = location.icon;
                    return (
                      <label
                        key={location.value}
                        className="flex items-center p-3 border border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <input
                          type="radio"
                          name="location"
                          value={location.value}
                          checked={
                            appointmentDetails.location === location.value
                          }
                          onChange={(e) =>
                            setAppointmentDetails((prev) => ({
                              ...prev,
                              location: e.target.value,
                            }))
                          }
                          className="sr-only"
                        />
                        <div
                          className={`
                          flex items-center justify-center w-8 h-8 rounded-full mr-3
                          ${
                            appointmentDetails.location === location.value
                              ? "bg-blue-600 text-white"
                              : "bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-400"
                          }
                        `}
                        >
                          <Icon className="h-4 w-4" />
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {location.label}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Meeting Link (for virtual meetings) */}
              {appointmentDetails.location === "virtual" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Meeting Link
                  </label>
                  <Input
                    placeholder="Enter meeting link (optional)"
                    value={appointmentDetails.meetingLink}
                    onChange={(e) =>
                      setAppointmentDetails((prev) => ({
                        ...prev,
                        meetingLink: e.target.value,
                      }))
                    }
                  />
                </div>
              )}

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Add any additional details..."
                  value={appointmentDetails.description}
                  onChange={(e) =>
                    setAppointmentDetails((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-4">
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateAppointment}
                  disabled={
                    !selectedSlot || !appointmentDetails.title || isSubmitting
                  }
                  className="flex-1"
                >
                  {isSubmitting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Book Appointment
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <Modal
        isOpen={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        title="Appointment Booked!"
        className="max-w-md"
      >
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900 mb-4">
            <Check className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Your appointment has been successfully scheduled. You will receive a
            confirmation email shortly.
          </p>
          <Button
            onClick={() => {
              setShowConfirmation(false);
              if (onClose) onClose();
            }}
            className="w-full"
          >
            Done
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default AppointmentScheduler;
