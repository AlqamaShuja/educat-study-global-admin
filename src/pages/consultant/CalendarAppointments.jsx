import React, { useState, useEffect } from "react";
import Card from "../../components/ui/Card";
import AppointmentCalendarView from "../../components/appointments/AppointmentCalendarView";
import AppointmentDetailModal from "../../components/appointments/AppointmentDetailModal";
import { Calendar, Clock, Users } from "lucide-react";

const CalendarAppointments = () => {
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [localAppointments, setLocalAppointments] = useState([]);
  const [hasInitialized, setHasInitialized] = useState(false);

  // Generate mock appointments (fallback for demo)
  const generateMockAppointments = () => {
    const mockAppointments = [
      {
        id: "apt-1",
        studentId: "e3701205-af3b-46b5-b059-a8d1bc4ff3ba",
        student: {
          id: "e3701205-af3b-46b5-b059-a8d1bc4ff3ba",
          name: "John Doe",
          email: "john@example.com",
          phone: "+1234567890",
        },
        startTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
        endTime: new Date(Date.now() + 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(), // Tomorrow + 1 hour
        type: "virtual",
        status: "scheduled",
        notes: "Initial consultation about study abroad programs",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "apt-2",
        studentId: "student-2",
        student: {
          id: "student-2",
          name: "Jane Smith",
          email: "jane@example.com",
          phone: "+1234567891",
        },
        startTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // Day after tomorrow
        endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(), // Day after tomorrow + 1 hour
        type: "in_person",
        status: "scheduled",
        notes: "Follow-up meeting to discuss application progress",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "apt-3",
        studentId: "student-3",
        student: {
          id: "student-3",
          name: "Mike Johnson",
          email: "mike@example.com",
          phone: "+1234567892",
        },
        startTime: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Yesterday
        endTime: new Date(Date.now() - 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(), // Yesterday + 1 hour
        type: "virtual",
        status: "completed",
        notes: "Discussed university options and requirements",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
    setLocalAppointments(mockAppointments);
  };

  useEffect(() => {
    if (hasInitialized) return; // Prevent multiple calls
    
    setHasInitialized(true);
    
    // Skip API call for now and just show mock data
    generateMockAppointments();
  }, []); // Empty dependency array - only run once

  // Use local appointments directly
  const allAppointments = localAppointments;

  const getStatusColor = (status) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "canceled":
        return "bg-red-100 text-red-800";
      case "no_show":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "consultation":
        return <Users className="h-4 w-4" />;
      case "follow_up":
        return <Clock className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };



  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
        <div className="flex items-center space-x-3 mb-4">
          <Calendar className="h-8 w-8 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Calendar Appointments</h1>
        </div>
        <p className="text-gray-600 text-lg leading-relaxed">
          View and manage all your appointments in a comprehensive calendar view. 
          Click on any appointment to see detailed information including student details, 
          meeting notes, and status updates. This calendar provides a clear overview 
          of your daily, weekly, and monthly schedule to help you stay organized 
          and provide excellent service to your students.
        </p>
        <div className="mt-4 flex items-center space-x-6 text-sm text-gray-500">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span>Scheduled</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span>Completed</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span>Canceled</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-yellow-500 rounded"></div>
            <span>No Show</span>
          </div>
        </div>
      </div>

      {/* Calendar View */}
      <Card>
        <AppointmentCalendarView
          appointments={allAppointments}
          onAppointmentClick={(appointment) => {
            setSelectedAppointment(appointment);
            setShowViewModal(true);
          }}
          getStatusColor={getStatusColor}
          getTypeIcon={getTypeIcon}
        />
      </Card>

      {/* Appointment Detail Modal */}
      <AppointmentDetailModal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false);
          setSelectedAppointment(null);
        }}
        appointment={selectedAppointment}
        getStatusColor={getStatusColor}
        getTypeIcon={getTypeIcon}
      />
    </div>
  );
};

export default CalendarAppointments; 