import React, { useState, useEffect } from "react";
import {
  Calendar,
  Users,
  Clock,
  UserPlus,
  CheckCircle,
  AlertCircle,
  Phone,
  Mail,
  MapPin,
  TrendingUp,
  Activity,
  ArrowRight,
  Bell,
  Search,
  Filter,
} from "lucide-react";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { toast } from "react-toastify";
import receptionistService from "../../services/receptionistService";
import useAuthStore from "../../stores/authStore";

const ReceptionistDashboard = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    todayAppointments: [],
    waitingList: [],
    consultantCalendars: [],
    recentActivities: [],
    stats: {
      todayAppointments: 0,
      waitingList: 0,
      completedToday: 0,
      totalStudents: 0,
    },
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch multiple data sources concurrently
      const [waitingList, consultantCalendars] = await Promise.all([
        receptionistService.getWaitingList(),
        receptionistService.getConsultantCalendars(),
      ]);

      // Filter today's appointments
      const today = new Date().toDateString();
      const todayAppointments = consultantCalendars?.filter(
        (appointment) => new Date(appointment.dateTime).toDateString() === today
      );

      // Calculate stats
      const stats = {
        todayAppointments: todayAppointments?.length || 0,
        waitingList: waitingList?.length || 0,
        completedToday:
          todayAppointments?.filter((apt) => apt.status === "completed")
            ?.length || 0,
        totalStudents:
          new Set(todayAppointments?.map((apt) => apt.studentId)).size || 0,
      };

      // Generate recent activities
      const recentActivities = [
        {
          id: 1,
          type: "appointment_booked",
          message: "New appointment booked for John Doe",
          time: "10 minutes ago",
          icon: Calendar,
          color: "text-blue-500",
        },
        {
          id: 2,
          type: "student_checkin",
          message: "Sarah Johnson checked in",
          time: "25 minutes ago",
          icon: CheckCircle,
          color: "text-green-500",
        },
        {
          id: 3,
          type: "walk_in",
          message: "Walk-in student registered: Mike Chen",
          time: "1 hour ago",
          icon: UserPlus,
          color: "text-purple-500",
        },
        {
          id: 4,
          type: "reminder_sent",
          message: "Appointment reminder sent to 3 students",
          time: "2 hours ago",
          icon: Bell,
          color: "text-orange-500",
        },
      ];

      setDashboardData({
        todayAppointments: todayAppointments || [],
        waitingList: waitingList || [],
        consultantCalendars: consultantCalendars || [],
        recentActivities,
        stats,
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickCheckIn = async (appointmentId) => {
    try {
      await receptionistService.checkInStudent(appointmentId);
      toast.success("Student checked in successfully");
      fetchDashboardData(); // Refresh data
    } catch (error) {
      console.error("Error checking in student:", error);
      toast.error("Failed to check in student");
    }
  };

  const handleQuickAction = (path) => {
    window.location.href = path;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">
                Welcome back, {user?.name || "Receptionist"}!
              </h1>
              <p className="mt-2 opacity-90">
                Here's what's happening at your office today
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm opacity-75">
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
              <div className="text-2xl font-semibold">
                {new Date().toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Today's Appointments */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-600">
                  Today's Appointments
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {dashboardData.stats.todayAppointments}
                </p>
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-600 font-medium">+5%</span>
              <span className="text-gray-500 ml-1">from yesterday</span>
            </div>
          </div>

          {/* Waiting List */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-3 bg-orange-100 rounded-lg">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-600">
                  Waiting List
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {dashboardData.stats.waitingList}
                </p>
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <AlertCircle className="h-4 w-4 text-orange-500 mr-1" />
              <span className="text-gray-600">
                {dashboardData.stats.waitingList > 0
                  ? "Needs attention"
                  : "All clear"}
              </span>
            </div>
          </div>

          {/* Completed Today */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-600">
                  Completed Today
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {dashboardData.stats.completedToday}
                </p>
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-600 font-medium">
                {Math.round(
                  (dashboardData.stats.completedToday /
                    Math.max(dashboardData.stats.todayAppointments, 1)) *
                    100
                )}
                %
              </span>
              <span className="text-gray-500 ml-1">completion rate</span>
            </div>
          </div>

          {/* Students Today */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-600">
                  Students Today
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {dashboardData.stats.totalStudents}
                </p>
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <Users className="h-4 w-4 text-purple-500 mr-1" />
              <span className="text-gray-600">Unique students</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Register Walk-in */}
            <button
              onClick={() =>
                handleQuickAction("/receptionist/walk-in-registration")
              }
              className="group bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg p-6 transition-all duration-200 transform hover:scale-105"
            >
              <div className="flex flex-col items-center text-center">
                <div className="p-3 bg-white bg-opacity-20 rounded-lg mb-3">
                  <UserPlus className="h-8 w-8" />
                </div>
                <h3 className="font-semibold text-lg mb-1">Register Walk-in</h3>
                <p className="text-blue-100 text-sm">
                  Register a new walk-in student
                </p>
                <ArrowRight className="h-5 w-5 mt-3 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>

            {/* Book Appointment */}
            <button
              onClick={() =>
                handleQuickAction("/receptionist/appointment-booking")
              }
              className="group bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg p-6 transition-all duration-200 transform hover:scale-105"
            >
              <div className="flex flex-col items-center text-center">
                <div className="p-3 bg-white bg-opacity-20 rounded-lg mb-3">
                  <Calendar className="h-8 w-8" />
                </div>
                <h3 className="font-semibold text-lg mb-1">Book Appointment</h3>
                <p className="text-green-100 text-sm">
                  Schedule new appointment
                </p>
                <ArrowRight className="h-5 w-5 mt-3 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>

            {/* View Calendars */}
            <button
              onClick={() =>
                handleQuickAction("/receptionist/consultant-calendars")
              }
              className="group bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-lg p-6 transition-all duration-200 transform hover:scale-105"
            >
              <div className="flex flex-col items-center text-center">
                <div className="p-3 bg-white bg-opacity-20 rounded-lg mb-3">
                  <Clock className="h-8 w-8" />
                </div>
                <h3 className="font-semibold text-lg mb-1">View Calendars</h3>
                <p className="text-purple-100 text-sm">
                  Check consultant availability
                </p>
                <ArrowRight className="h-5 w-5 mt-3 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>

            {/* Waiting List */}
            <button
              onClick={() => handleQuickAction("/receptionist/waiting-list")}
              className="group bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-lg p-6 transition-all duration-200 transform hover:scale-105"
            >
              <div className="flex flex-col items-center text-center">
                <div className="p-3 bg-white bg-opacity-20 rounded-lg mb-3">
                  <Users className="h-8 w-8" />
                </div>
                <h3 className="font-semibold text-lg mb-1">Waiting List</h3>
                <p className="text-orange-100 text-sm">
                  Manage waiting students
                </p>
                <ArrowRight className="h-5 w-5 mt-3 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Today's Schedule */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Today's Schedule
              </h2>
              <button
                onClick={() =>
                  handleQuickAction("/receptionist/consultant-calendars")
                }
                className="text-blue-600 hover:text-blue-800 text-sm font-medium hover:underline"
              >
                View All →
              </button>
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto">
              {dashboardData?.todayAppointments?.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Calendar className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No appointments today
                  </h3>
                  <p className="text-gray-500">
                    Your schedule is clear for today
                  </p>
                </div>
              ) : (
                dashboardData?.todayAppointments?.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div
                        className={`w-4 h-4 rounded-full ${
                          appointment.status === "completed"
                            ? "bg-green-500"
                            : appointment.status === "in_progress"
                            ? "bg-blue-500"
                            : "bg-gray-300"
                        }`}
                      />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium text-gray-900">
                            {appointment.student?.name || "Unknown Student"}
                          </h4>
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${
                              appointment.status === "completed"
                                ? "bg-green-100 text-green-700"
                                : appointment.status === "in_progress"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {appointment.status.replace("_", " ")}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          with {appointment.consultant?.name || "Consultant"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {new Date(appointment.dateTime).toLocaleTimeString(
                            "en-US",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </p>
                        <p className="text-xs text-gray-500 capitalize">
                          {appointment.type.replace("_", " ")}
                        </p>
                      </div>

                      {appointment.status === "scheduled" && (
                        <button
                          onClick={() => handleQuickCheckIn(appointment.id)}
                          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                          Check In
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Waiting List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Waiting List
                </h3>
                <button
                  onClick={() =>
                    handleQuickAction("/receptionist/waiting-list")
                  }
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium hover:underline"
                >
                  View All →
                </button>
              </div>

              <div className="space-y-3">
                {dashboardData.waitingList?.length === 0 ? (
                  <div className="text-center py-6 text-gray-500">
                    <Clock className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-sm font-medium text-gray-900 mb-1">
                      No students waiting
                    </p>
                    <p className="text-xs text-gray-500">
                      All students are scheduled
                    </p>
                  </div>
                ) : (
                  dashboardData?.waitingList?.slice(0, 3)?.map((student) => (
                    <div
                      key={student.studentId}
                      className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {student.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          Waiting since{" "}
                          {new Date(student.requestedTime).toLocaleTimeString()}
                        </p>
                      </div>
                      <AlertCircle className="h-5 w-5 text-orange-500" />
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center mb-4">
                <Activity className="h-5 w-5 text-gray-400 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Recent Activity
                </h3>
              </div>

              <div className="space-y-4">
                {dashboardData.recentActivities?.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div
                      className={`p-2 rounded-lg ${
                        activity.color === "text-blue-500"
                          ? "bg-blue-100"
                          : activity.color === "text-green-500"
                          ? "bg-green-100"
                          : activity.color === "text-purple-500"
                          ? "bg-purple-100"
                          : "bg-orange-100"
                      }`}
                    >
                      <activity.icon className={`h-4 w-4 ${activity.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Emergency Contacts */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            Emergency Contacts
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Phone className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Office Manager</p>
                <p className="text-sm text-gray-500">+1 (555) 123-4567</p>
              </div>
            </div>
            <div className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="p-3 bg-green-100 rounded-lg">
                <Mail className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Support Email</p>
                <p className="text-sm text-gray-500">support@company.com</p>
              </div>
            </div>
            <div className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="p-3 bg-red-100 rounded-lg">
                <MapPin className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Emergency Services</p>
                <p className="text-sm text-gray-500">911 / Local Emergency</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReceptionistDashboard;
