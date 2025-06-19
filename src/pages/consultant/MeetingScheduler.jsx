// pages/consultant/MeetingScheduler.jsx
import React, { useState, useEffect } from "react";
import useApi from "../../hooks/useApi";
import useAuthStore from "../../stores/authStore";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import Modal from "../../components/ui/Modal";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import Calendar from "../../components/calendar/Calendar";
import TimeSlotSelector from "../../components/calendar/TimeSlotSelector";
import {
  Calendar as CalendarIcon,
  Clock,
  Video,
  MapPin,
  User,
  Plus,
  Save,
  Send,
} from "lucide-react";

const MeetingScheduler = () => {
  const { user } = useAuthStore();
  const { request, loading } = useApi();

  const [students, setStudents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [availability, setAvailability] = useState([]);
  const [bookedSlots, setBookedSlots] = useState([]);

  const [meetingForm, setMeetingForm] = useState({
    studentId: "",
    title: "",
    description: "",
    type: "virtual",
    duration: 60,
    reminderTime: 15,
  });

  useEffect(() => {
    fetchStudents();
    fetchAvailability();
    fetchBookedSlots();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await request("/consultant/leads");
      const leads = response || [];

      const studentsData = leads.map((lead) => ({
        id: lead.studentId,
        name: lead.student?.name || "Unknown",
        email: lead.student?.email || "N/A",
        status: lead.status,
      }));

      setStudents(studentsData);
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  const fetchAvailability = async () => {
    // Mock availability data - in real app this would come from backend
    const mockAvailability = [
      {
        day: "monday",
        slots: ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"],
      },
      {
        day: "tuesday",
        slots: ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"],
      },
      {
        day: "wednesday",
        slots: ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"],
      },
      {
        day: "thursday",
        slots: ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"],
      },
      { day: "friday", slots: ["09:00", "10:00", "11:00", "14:00", "15:00"] },
    ];

    setAvailability(mockAvailability);
  };

  const fetchBookedSlots = async () => {
    // Mock booked slots - in real app this would come from backend
    const mockBookedSlots = [
      {
        date: new Date().toISOString().split("T")[0],
        time: "10:00",
        studentName: "John Doe",
      },
      {
        date: new Date().toISOString().split("T")[0],
        time: "15:00",
        studentName: "Jane Smith",
      },
    ];

    setBookedSlots(mockBookedSlots);
  };

  const getAvailableSlots = (date) => {
    const dayName = date.toLocaleDateString("en-US", { weekday: "lowercase" });
    const dayAvailability = availability.find((av) => av.day === dayName);

    if (!dayAvailability) return [];

    const dateString = date.toISOString().split("T")[0];
    const bookedTimesForDate = bookedSlots
      .filter((slot) => slot.date === dateString)
      .map((slot) => slot.time);

    return dayAvailability.slots.filter(
      (slot) => !bookedTimesForDate.includes(slot)
    );
  };

  const handleScheduleMeeting = async () => {
    if (!meetingForm.studentId || !selectedDate || !selectedTimeSlot) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      const meetingDateTime = new Date(selectedDate);
      const [hours, minutes] = selectedTimeSlot.split(":");
      meetingDateTime.setHours(parseInt(hours), parseInt(minutes));

      await request(`/consultant/students/${meetingForm.studentId}/meetings`, {
        method: "POST",
        data: {
          dateTime: meetingDateTime.toISOString(),
          type: meetingForm.type,
          notes: `${meetingForm.title}\n\n${meetingForm.description}`,
        },
      });

      // Reset form and close modal
      setMeetingForm({
        studentId: "",
        title: "",
        description: "",
        type: "virtual",
        duration: 60,
        reminderTime: 15,
      });
      setSelectedTimeSlot(null);
      setShowScheduleModal(false);

      // Refresh booked slots
      fetchBookedSlots();

      alert("Meeting scheduled successfully!");
    } catch (error) {
      console.error("Error scheduling meeting:", error);
      alert("Error scheduling meeting. Please try again.");
    }
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setSelectedTimeSlot(null);
  };

  const handleTimeSlotSelect = (time) => {
    setSelectedTimeSlot(time);
    setShowScheduleModal(true);
  };

  const availableSlots = getAvailableSlots(selectedDate);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Meeting Scheduler
          </h1>
          <p className="text-gray-600">Schedule meetings with your students</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2">
          <Card>
            <Card.Header>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center">
                  <CalendarIcon className="h-5 w-5 mr-2" />
                  Select Date
                </h3>
                <div className="text-sm text-gray-600">
                  {selectedDate.toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </div>
              </div>
            </Card.Header>
            <Card.Content>
              <Calendar
                selectedDate={selectedDate}
                onDateSelect={handleDateSelect}
                showTimeSlots={false}
                minDate={new Date()}
                maxDate={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)} // 30 days from now
              />
            </Card.Content>
          </Card>

          {/* Today's Schedule */}
          <Card className="mt-6">
            <Card.Header>
              <h3 className="text-lg font-semibold flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Today's Schedule
              </h3>
            </Card.Header>
            <Card.Content>
              {bookedSlots.filter(
                (slot) => slot.date === new Date().toISOString().split("T")[0]
              ).length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  No appointments scheduled for today
                </p>
              ) : (
                <div className="space-y-3">
                  {bookedSlots
                    .filter(
                      (slot) =>
                        slot.date === new Date().toISOString().split("T")[0]
                    )
                    .map((slot, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 text-gray-400 mr-3" />
                          <div>
                            <p className="font-medium text-gray-900">
                              {slot.time}
                            </p>
                            <p className="text-sm text-gray-600">
                              {slot.studentName}
                            </p>
                          </div>
                        </div>
                        <Badge className="bg-blue-100 text-blue-800">
                          Scheduled
                        </Badge>
                      </div>
                    ))}
                </div>
              )}
            </Card.Content>
          </Card>
        </div>

        {/* Time Slots & Booking */}
        <div className="space-y-6">
          {/* Available Time Slots */}
          <Card>
            <Card.Header>
              <h3 className="text-lg font-semibold flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Available Times
              </h3>
            </Card.Header>
            <Card.Content>
              {availableSlots.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  No available time slots for selected date
                </p>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {availableSlots.map((time) => (
                    <Button
                      key={time}
                      variant={
                        selectedTimeSlot === time ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => handleTimeSlotSelect(time)}
                      className="justify-center"
                    >
                      {time}
                    </Button>
                  ))}
                </div>
              )}
            </Card.Content>
          </Card>

          {/* Quick Schedule */}
          <Card>
            <Card.Header>
              <h3 className="text-lg font-semibold">Quick Schedule</h3>
            </Card.Header>
            <Card.Content>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Student
                  </label>
                  <select
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    value={meetingForm.studentId}
                    onChange={(e) =>
                      setMeetingForm({
                        ...meetingForm,
                        studentId: e.target.value,
                      })
                    }
                  >
                    <option value="">Select a student</option>
                    {students.map((student) => (
                      <option key={student.id} value={student.id}>
                        {student.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meeting Type
                  </label>
                  <div className="flex space-x-2">
                    <Button
                      variant={
                        meetingForm.type === "virtual" ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() =>
                        setMeetingForm({ ...meetingForm, type: "virtual" })
                      }
                      className="flex-1"
                    >
                      <Video className="h-4 w-4 mr-1" />
                      Virtual
                    </Button>
                    <Button
                      variant={
                        meetingForm.type === "in_person" ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() =>
                        setMeetingForm({ ...meetingForm, type: "in_person" })
                      }
                      className="flex-1"
                    >
                      <MapPin className="h-4 w-4 mr-1" />
                      In Person
                    </Button>
                  </div>
                </div>

                <Button
                  onClick={() => setShowScheduleModal(true)}
                  disabled={
                    !meetingForm.studentId || !selectedDate || !selectedTimeSlot
                  }
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Schedule Meeting
                </Button>
              </div>
            </Card.Content>
          </Card>

          {/* Meeting Statistics */}
          <Card>
            <Card.Header>
              <h3 className="text-lg font-semibold">This Week</h3>
            </Card.Header>
            <Card.Content>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Meetings</span>
                  <span className="font-semibold">12</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Completed</span>
                  <span className="font-semibold text-green-600">8</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Upcoming</span>
                  <span className="font-semibold text-blue-600">4</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Virtual</span>
                  <span className="font-semibold">7</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">In Person</span>
                  <span className="font-semibold">5</span>
                </div>
              </div>
            </Card.Content>
          </Card>
        </div>
      </div>

      {/* Schedule Meeting Modal */}
      <Modal
        isOpen={showScheduleModal}
        onClose={() => {
          setShowScheduleModal(false);
          setMeetingForm({
            studentId: "",
            title: "",
            description: "",
            type: "virtual",
            duration: 60,
            reminderTime: 15,
          });
        }}
        title="Schedule Meeting"
        size="lg"
      >
        <div className="space-y-4">
          {/* Meeting Summary */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Meeting Details</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <p>
                <strong>Date:</strong> {selectedDate.toLocaleDateString()}
              </p>
              <p>
                <strong>Time:</strong> {selectedTimeSlot}
              </p>
              <p>
                <strong>Student:</strong>{" "}
                {students.find((s) => s.id === meetingForm.studentId)?.name ||
                  "Not selected"}
              </p>
              <p>
                <strong>Type:</strong> {meetingForm.type.replace("_", " ")}
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Meeting Title
            </label>
            <Input
              value={meetingForm.title}
              onChange={(e) =>
                setMeetingForm({
                  ...meetingForm,
                  title: e.target.value,
                })
              }
              placeholder="Enter meeting title..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              rows={3}
              value={meetingForm.description}
              onChange={(e) =>
                setMeetingForm({
                  ...meetingForm,
                  description: e.target.value,
                })
              }
              placeholder="Enter meeting description..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duration (minutes)
              </label>
              <select
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                value={meetingForm.duration}
                onChange={(e) =>
                  setMeetingForm({
                    ...meetingForm,
                    duration: parseInt(e.target.value),
                  })
                }
              >
                <option value={30}>30 minutes</option>
                <option value={60}>1 hour</option>
                <option value={90}>1.5 hours</option>
                <option value={120}>2 hours</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reminder
              </label>
              <select
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                value={meetingForm.reminderTime}
                onChange={(e) =>
                  setMeetingForm({
                    ...meetingForm,
                    reminderTime: parseInt(e.target.value),
                  })
                }
              >
                <option value={5}>5 minutes before</option>
                <option value={15}>15 minutes before</option>
                <option value={30}>30 minutes before</option>
                <option value={60}>1 hour before</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => {
                setShowScheduleModal(false);
                setMeetingForm({
                  studentId: "",
                  title: "",
                  description: "",
                  type: "virtual",
                  duration: 60,
                  reminderTime: 15,
                });
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleScheduleMeeting}>
              <Save className="h-4 w-4 mr-2" />
              Schedule Meeting
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default MeetingScheduler;
