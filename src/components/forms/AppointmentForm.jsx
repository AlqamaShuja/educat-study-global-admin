import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import Input from "../ui/Input";
import Select from "../ui/Select";
import Button from "../ui/Button";
import Card from "../ui/Card";
import { useUserStore } from "../../stores/userStore";

const AppointmentForm = ({
  appointment = null,
  onSubmit,
  onCancel,
  loading = false,
  mode = "create",
  preselectedStudent = null,
  preselectedConsultant = null,
}) => {
  const { students, consultants, fetchStudents, fetchConsultants } =
    useUserStore();
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [availableSlots, setAvailableSlots] = useState([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm({
    defaultValues: {
      studentId: preselectedStudent?.id || appointment?.studentId || "",
      consultantId:
        preselectedConsultant?.id || appointment?.consultantId || "",
      type: appointment?.type || "in_person",
      notes: appointment?.notes || "",
      dateTime: appointment?.dateTime
        ? new Date(appointment.dateTime).toISOString().slice(0, 16)
        : "",
    },
  });

  useEffect(() => {
    fetchStudents();
    fetchConsultants();
  }, [fetchStudents, fetchConsultants]);

  useEffect(() => {
    if (appointment && mode === "edit") {
      const appointmentDateTime = new Date(appointment.dateTime);
      const dateStr = appointmentDateTime.toISOString().split("T")[0];
      const timeStr = appointmentDateTime.toTimeString().slice(0, 5);

      reset({
        studentId: appointment.studentId,
        consultantId: appointment.consultantId,
        type: appointment.type,
        notes: appointment.notes || "",
        dateTime: appointment.dateTime
          ? new Date(appointment.dateTime).toISOString().slice(0, 16)
          : "",
      });

      setSelectedDate(dateStr);
      setSelectedTime(timeStr);
    }
  }, [appointment, mode, reset]);

  // Generate time slots
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour <= 17; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeStr = `${hour.toString().padStart(2, "0")}:${minute
          .toString()
          .padStart(2, "0")}`;
        slots.push({
          value: timeStr,
          label: timeStr,
        });
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  const typeOptions = [
    { value: "in_person", label: "In Person" },
    { value: "virtual", label: "Virtual Meeting" },
  ];

  const studentOptions = students.map((student) => ({
    value: student.id,
    label: `${student.name} (${student.email})`,
  }));

  const consultantOptions = consultants.map((consultant) => ({
    value: consultant.id,
    label: consultant.name,
  }));

  const handleDateChange = (date) => {
    setSelectedDate(date);
    // Here you would typically fetch available slots for the selected date and consultant
    // For now, we'll just set all slots as available
    setAvailableSlots(timeSlots);
  };

  const handleTimeChange = (time) => {
    setSelectedTime(time);
    // Combine date and time for the datetime-local input
    if (selectedDate && time) {
      const dateTimeString = `${selectedDate}T${time}`;
      setValue("dateTime", dateTimeString);
    }
  };

  const onFormSubmit = (data) => {
    const formData = {
      studentId: data.studentId,
      consultantId: data.consultantId,
      dateTime: new Date(data.dateTime).toISOString(),
      type: data.type,
      notes: data.notes || "",
    };

    onSubmit(formData);
  };

  // Get minimum date (today)
  const today = new Date().toISOString().split("T")[0];

  return (
    <Card title={`${mode === "create" ? "Schedule" : "Edit"} Appointment`}>
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
        {/* Student Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Student <span className="text-red-500">*</span>
          </label>
          <Select
            options={studentOptions}
            value={studentOptions.find(
              (option) => option.value === watch("studentId")
            )}
            onChange={(option) => setValue("studentId", option.value)}
            placeholder="Select student"
            disabled={!!preselectedStudent}
            searchable
          />
          {errors.studentId && (
            <p className="text-sm text-red-600 mt-1">
              {errors.studentId.message}
            </p>
          )}
          <input
            type="hidden"
            {...register("studentId", { required: "Student is required" })}
          />
        </div>

        {/* Consultant Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Consultant <span className="text-red-500">*</span>
          </label>
          <Select
            options={consultantOptions}
            value={consultantOptions.find(
              (option) => option.value === watch("consultantId")
            )}
            onChange={(option) => setValue("consultantId", option.value)}
            placeholder="Select consultant"
            disabled={!!preselectedConsultant}
          />
          {errors.consultantId && (
            <p className="text-sm text-red-600 mt-1">
              {errors.consultantId.message}
            </p>
          )}
          <input
            type="hidden"
            {...register("consultantId", {
              required: "Consultant is required",
            })}
          />
        </div>

        {/* Date and Time */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => handleDateChange(e.target.value)}
              min={today}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Time <span className="text-red-500">*</span>
            </label>
            <Select
              options={availableSlots}
              value={availableSlots.find(
                (option) => option.value === selectedTime
              )}
              onChange={(option) => handleTimeChange(option.value)}
              placeholder="Select time"
              disabled={!selectedDate}
            />
          </div>
        </div>

        {/* Hidden datetime input for form submission */}
        <input
          type="hidden"
          {...register("dateTime", { required: "Date and time are required" })}
        />
        {errors.dateTime && (
          <p className="text-sm text-red-600">{errors.dateTime.message}</p>
        )}

        {/* Meeting Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Meeting Type <span className="text-red-500">*</span>
          </label>
          <Select
            options={typeOptions}
            value={typeOptions.find((option) => option.value === watch("type"))}
            onChange={(option) => setValue("type", option.value)}
            placeholder="Select meeting type"
          />
          <input
            type="hidden"
            {...register("type", { required: "Meeting type is required" })}
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes
          </label>
          <textarea
            {...register("notes")}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows="3"
            placeholder="Enter any notes for this appointment..."
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-6 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" loading={loading} disabled={loading}>
            {mode === "create" ? "Schedule Appointment" : "Update Appointment"}
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default AppointmentForm;
