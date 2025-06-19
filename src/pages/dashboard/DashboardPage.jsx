// pages/dashboard/DashboardPage.jsx
import React, { useState, useEffect } from "react";
import { useAuthStore } from "../../stores/authStore";
import { useApi } from "../../hooks/useApi";
import StatsCard from "../../components/widgets/StatsCard";
import RecentActivity from "../../components/widgets/RecentActivity";
import QuickActions from "../../components/widgets/QuickActions";
import TaskList from "../../components/widgets/TaskList";
import MetricsWidget from "../../components/charts/MetricsWidget";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import {
  Users,
  FileText,
  Calendar,
  TrendingUp,
  CheckCircle,
  Clock,
  AlertCircle,
  Target,
  MessageSquare,
  Bell,
  Settings,
  Plus,
  Eye,
  BarChart3,
} from "lucide-react";

const DashboardPage = () => {
  const { user } = useAuthStore();
  const { request, loading } = useApi();
  const [dashboardData, setDashboardData] = useState({
    stats: {},
    recentActivity: [],
    upcomingTasks: [],
    notifications: [],
    chartData: {},
  });
  const [timeRange, setTimeRange] = useState("7d"); // 7d, 30d, 90d

  useEffect(() => {
    fetchDashboardData();
  }, [timeRange]);

  const fetchDashboardData = async () => {
    try {
      let data = {};

      // Fetch different data based on user role
      switch (user.role) {
        case "super_admin":
          data = await fetchSuperAdminData();
          break;
        case "manager":
          data = await fetchManagerData();
          break;
        case "consultant":
          data = await fetchConsultantData();
          break;
        case "receptionist":
          data = await fetchReceptionistData();
          break;
        case "student":
          data = await fetchStudentData();
          break;
        default:
          data = await fetchDefaultData();
      }

      setDashboardData(data);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    }
  };

  const fetchSuperAdminData = async () => {
    // Mock data for super admin - replace with actual API calls
    return {
      stats: {
        totalUsers: 1247,
        totalOffices: 12,
        totalLeads: 3456,
        conversionRate: 23.5,
        activeStudents: 892,
        pendingApplications: 156,
      },
      recentActivity: [
        {
          id: "1",
          title: "New office created in Toronto",
          description: "Toronto Branch office has been established",
          time: "2 hours ago",
          type: "office",
          icon: "building",
        },
        {
          id: "2",
          title: "Manager assigned to Vancouver office",
          description: "John Smith has been assigned as manager",
          time: "4 hours ago",
          type: "staff",
          icon: "user",
        },
        {
          id: "3",
          title: "50 new leads generated",
          description: "Marketing campaign generated new leads",
          time: "6 hours ago",
          type: "leads",
          icon: "trending-up",
        },
      ],
      upcomingTasks: [
        {
          id: "1",
          title: "Review monthly reports",
          dueDate: "2024-06-20T10:00:00Z",
          priority: "high",
          status: "pending",
        },
        {
          id: "2",
          title: "Staff performance evaluation",
          dueDate: "2024-06-22T14:00:00Z",
          priority: "medium",
          status: "pending",
        },
      ],
      chartData: {
        leadsOverTime: [
          { month: "Jan", leads: 120, conversions: 25 },
          { month: "Feb", leads: 150, conversions: 35 },
          { month: "Mar", leads: 180, conversions: 42 },
          { month: "Apr", leads: 210, conversions: 58 },
          { month: "May", leads: 240, conversions: 67 },
          { month: "Jun", leads: 280, conversions: 78 },
        ],
        officePerformance: [
          { office: "Toronto", leads: 450, conversions: 95 },
          { office: "Vancouver", leads: 380, conversions: 82 },
          { office: "Montreal", leads: 320, conversions: 65 },
        ],
      },
    };
  };

  const fetchManagerData = async () => {
    const response = await request("/manager/dashboard");

    return {
      stats: {
        totalLeads: response?.totalLeads || 234,
        convertedLeads: response?.convertedLeads || 56,
        conversionRate: response?.conversionRate || 23.9,
        pendingAppointments: response?.pendingAppointments || 12,
        teamMembers: response?.teamMembers || 8,
        officePerformance: response?.officePerformance || 92,
      },
      recentActivity: [
        {
          id: "1",
          title: "New lead assigned to John",
          description: "Lead from website inquiry",
          time: "1 hour ago",
          type: "lead",
          icon: "user-plus",
        },
        {
          id: "2",
          title: "Consultant completed application",
          description: "Sarah completed student application",
          time: "3 hours ago",
          type: "application",
          icon: "check-circle",
        },
      ],
      upcomingTasks: [
        {
          id: "1",
          title: "Team meeting",
          dueDate: "2024-06-19T09:00:00Z",
          priority: "high",
          status: "pending",
        },
      ],
      chartData: {
        teamPerformance: [
          { consultant: "John Doe", leads: 45, conversions: 12 },
          { consultant: "Sarah Smith", leads: 38, conversions: 15 },
          { consultant: "Mike Johnson", leads: 42, conversions: 9 },
        ],
      },
    };
  };

  const fetchConsultantData = async () => {
    const response = await request("/consultant/leads");

    const leads = response || [];
    const stats = {
      totalLeads: leads.length,
      activeLeads: leads.filter((lead) => lead.status === "in_progress").length,
      convertedLeads: leads.filter((lead) => lead.status === "converted")
        .length,
      upcomingMeetings: 3, // This would come from appointments endpoint
      pendingTasks: 5,
      thisWeekProgress: 78,
    };

    return {
      stats,
      recentActivity: [
        {
          id: "1",
          title: "Student profile updated",
          description: "Emma Wilson updated her academic records",
          time: "30 minutes ago",
          type: "profile",
          icon: "edit",
        },
        {
          id: "2",
          title: "Document submitted",
          description: "IELTS certificate received from David Chen",
          time: "2 hours ago",
          type: "document",
          icon: "file-text",
        },
      ],
      upcomingTasks: [
        {
          id: "1",
          title: "Follow up with Emma Wilson",
          dueDate: "2024-06-19T15:00:00Z",
          priority: "high",
          status: "pending",
        },
        {
          id: "2",
          title: "Review David's application",
          dueDate: "2024-06-20T10:00:00Z",
          priority: "medium",
          status: "pending",
        },
      ],
      chartData: {
        leadProgress: [
          { status: "New", count: 5 },
          { status: "In Progress", count: 12 },
          { status: "Converted", count: 8 },
          { status: "Lost", count: 2 },
        ],
      },
    };
  };

  const fetchReceptionistData = async () => {
    return {
      stats: {
        todayAppointments: 8,
        checkedInStudents: 5,
        waitingStudents: 2,
        scheduledMeetings: 12,
        walkInLeads: 3,
        callsHandled: 15,
      },
      recentActivity: [
        {
          id: "1",
          title: "Walk-in student registered",
          description: "New student Maria Garcia registered",
          time: "45 minutes ago",
          type: "registration",
          icon: "user-plus",
        },
        {
          id: "2",
          title: "Appointment rescheduled",
          description: "John's meeting moved to tomorrow",
          time: "1 hour ago",
          type: "appointment",
          icon: "calendar",
        },
      ],
      upcomingTasks: [
        {
          id: "1",
          title: "Prepare for afternoon appointments",
          dueDate: "2024-06-18T13:00:00Z",
          priority: "medium",
          status: "pending",
        },
      ],
    };
  };

  const fetchStudentData = async () => {
    const [profileResponse, tasksResponse, appointmentsResponse] =
      await Promise.all([
        request("/student/profile").catch(() => null),
        request("/student/tasks").catch(() => []),
        request("/student/appointments").catch(() => []),
      ]);

    return {
      stats: {
        applicationProgress: 65,
        completedTasks: 8,
        totalTasks: 12,
        upcomingDeadlines: 3,
        documentsUploaded: 5,
        nextMeeting: appointmentsResponse?.[0] || null,
      },
      recentActivity: [
        {
          id: "1",
          title: "Document approved",
          description: "Your transcript has been approved",
          time: "2 hours ago",
          type: "document",
          icon: "check-circle",
        },
        {
          id: "2",
          title: "New message from consultant",
          description: "Sarah sent you an update about your application",
          time: "4 hours ago",
          type: "message",
          icon: "message-square",
        },
      ],
      upcomingTasks: tasksResponse.slice(0, 3) || [],
    };
  };

  const fetchDefaultData = async () => {
    return {
      stats: {},
      recentActivity: [],
      upcomingTasks: [],
      chartData: {},
    };
  };

  const getQuickActions = () => {
    const actions = {
      super_admin: [
        {
          title: "Create Office",
          description: "Add a new office location",
          icon: Plus,
          href: "/super-admin/offices/create",
          color: "bg-blue-500",
        },
        {
          title: "Manage Staff",
          description: "View and manage staff members",
          icon: Users,
          href: "/super-admin/staff",
          color: "bg-green-500",
        },
        {
          title: "System Reports",
          description: "View system-wide reports",
          icon: BarChart3,
          href: "/super-admin/reports",
          color: "bg-purple-500",
        },
        {
          title: "Lead Rules",
          description: "Configure lead distribution",
          icon: Settings,
          href: "/super-admin/lead-rules",
          color: "bg-orange-500",
        },
      ],
      manager: [
        {
          title: "Team Performance",
          description: "View team metrics",
          icon: TrendingUp,
          href: "/manager/staff/reports",
          color: "bg-blue-500",
        },
        {
          title: "Assign Leads",
          description: "Distribute leads to consultants",
          icon: Users,
          href: "/manager/leads",
          color: "bg-green-500",
        },
        {
          title: "Office Leads",
          description: "Manage office leads",
          icon: Target,
          href: "/manager/leads",
          color: "bg-purple-500",
        },
      ],
      consultant: [
        {
          title: "My Leads",
          description: "View assigned leads",
          icon: Users,
          href: "/consultant/my-leads",
          color: "bg-blue-500",
        },
        {
          title: "Schedule Meeting",
          description: "Book student appointment",
          icon: Calendar,
          href: "/consultant/meeting-scheduler",
          color: "bg-green-500",
        },
        {
          title: "Task Management",
          description: "Manage your tasks",
          icon: CheckCircle,
          href: "/consultant/task-management",
          color: "bg-purple-500",
        },
        {
          title: "Document Collection",
          description: "Manage student documents",
          icon: FileText,
          href: "/consultant/document-collection",
          color: "bg-orange-500",
        },
      ],
      receptionist: [
        {
          title: "Walk-in Registration",
          description: "Register new walk-in students",
          icon: Plus,
          href: "/receptionist/walk-in-registration",
          color: "bg-blue-500",
        },
        {
          title: "Appointment Booking",
          description: "Schedule appointments",
          icon: Calendar,
          href: "/receptionist/appointment-booking",
          color: "bg-green-500",
        },
        {
          title: "Waiting List",
          description: "Manage waiting students",
          icon: Clock,
          href: "/receptionist/waiting-list",
          color: "bg-purple-500",
        },
      ],
      student: [
        {
          title: "My Profile",
          description: "Update your profile",
          icon: Users,
          href: "/student/profile",
          color: "bg-blue-500",
        },
        {
          title: "Book Appointment",
          description: "Schedule with consultant",
          icon: Calendar,
          href: "/student/appointments",
          color: "bg-green-500",
        },
        {
          title: "Upload Documents",
          description: "Submit required documents",
          icon: FileText,
          href: "/student/documents",
          color: "bg-purple-500",
        },
        {
          title: "Application Status",
          description: "Check your progress",
          icon: Target,
          href: "/student/application-status",
          color: "bg-orange-500",
        },
      ],
    };

    return actions[user.role] || [];
  };

  const getStatsCards = () => {
    const { stats } = dashboardData;

    switch (user.role) {
      case "super_admin":
        return [
          {
            title: "Total Users",
            value: stats.totalUsers || 0,
            icon: Users,
            trend: { value: 12, isPositive: true },
            color: "blue",
          },
          {
            title: "Total Offices",
            value: stats.totalOffices || 0,
            icon: Target,
            trend: { value: 2, isPositive: true },
            color: "green",
          },
          {
            title: "Total Leads",
            value: stats.totalLeads || 0,
            icon: TrendingUp,
            trend: { value: 8, isPositive: true },
            color: "purple",
          },
          {
            title: "Conversion Rate",
            value: `${stats.conversionRate || 0}%`,
            icon: Target,
            trend: { value: 3.2, isPositive: true },
            color: "orange",
          },
        ];

      case "manager":
        return [
          {
            title: "Office Leads",
            value: stats.totalLeads || 0,
            icon: Users,
            trend: { value: 5, isPositive: true },
            color: "blue",
          },
          {
            title: "Converted",
            value: stats.convertedLeads || 0,
            icon: CheckCircle,
            trend: { value: 12, isPositive: true },
            color: "green",
          },
          {
            title: "Conversion Rate",
            value: `${stats.conversionRate || 0}%`,
            icon: TrendingUp,
            trend: { value: 2.1, isPositive: true },
            color: "purple",
          },
          {
            title: "Team Members",
            value: stats.teamMembers || 0,
            icon: Users,
            trend: { value: 1, isPositive: true },
            color: "orange",
          },
        ];

      case "consultant":
        return [
          {
            title: "My Leads",
            value: stats.totalLeads || 0,
            icon: Users,
            trend: { value: 3, isPositive: true },
            color: "blue",
          },
          {
            title: "Active Leads",
            value: stats.activeLeads || 0,
            icon: TrendingUp,
            trend: { value: 2, isPositive: true },
            color: "green",
          },
          {
            title: "Converted",
            value: stats.convertedLeads || 0,
            icon: CheckCircle,
            trend: { value: 1, isPositive: true },
            color: "purple",
          },
          {
            title: "Pending Tasks",
            value: stats.pendingTasks || 0,
            icon: Clock,
            trend: { value: -2, isPositive: false },
            color: "orange",
          },
        ];

      case "receptionist":
        return [
          {
            title: "Today's Appointments",
            value: stats.todayAppointments || 0,
            icon: Calendar,
            trend: { value: 2, isPositive: true },
            color: "blue",
          },
          {
            title: "Checked In",
            value: stats.checkedInStudents || 0,
            icon: CheckCircle,
            trend: { value: 3, isPositive: true },
            color: "green",
          },
          {
            title: "Waiting",
            value: stats.waitingStudents || 0,
            icon: Clock,
            trend: { value: -1, isPositive: false },
            color: "purple",
          },
          {
            title: "Walk-ins",
            value: stats.walkInLeads || 0,
            icon: Users,
            trend: { value: 1, isPositive: true },
            color: "orange",
          },
        ];

      case "student":
        return [
          {
            title: "Application Progress",
            value: `${stats.applicationProgress || 0}%`,
            icon: Target,
            trend: { value: 15, isPositive: true },
            color: "blue",
          },
          {
            title: "Completed Tasks",
            value: `${stats.completedTasks || 0}/${stats.totalTasks || 0}`,
            icon: CheckCircle,
            trend: { value: 2, isPositive: true },
            color: "green",
          },
          {
            title: "Documents Uploaded",
            value: stats.documentsUploaded || 0,
            icon: FileText,
            trend: { value: 1, isPositive: true },
            color: "purple",
          },
          {
            title: "Upcoming Deadlines",
            value: stats.upcomingDeadlines || 0,
            icon: AlertCircle,
            trend: { value: 0, isPositive: true },
            color: "orange",
          },
        ];

      default:
        return [];
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const statsCards = getStatsCards();
  const quickActions = getQuickActions();

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {user?.name}!
            </h1>
            <p className="text-gray-600 mt-1">
              Here's what's happening with your{" "}
              {user?.role === "student" ? "application" : "work"} today.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <select
              className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>

            <Button variant="outline">
              <Eye className="h-4 w-4 mr-2" />
              View Details
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => (
          <StatsCard
            key={index}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            trend={stat.trend}
            color={stat.color}
          />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-2">
          <QuickActions actions={quickActions} />
        </div>

        {/* Task List */}
        <div>
          <TaskList
            tasks={dashboardData.upcomingTasks}
            title="Upcoming Tasks"
            onTaskClick={(task) => {
              // Handle task click based on user role
              console.log("Task clicked:", task);
            }}
          />
        </div>
      </div>

      {/* Charts and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <RecentActivity
          activities={dashboardData.recentActivity}
          title="Recent Activity"
        />

        {/* Metrics Widget */}
        {dashboardData.chartData &&
          Object.keys(dashboardData.chartData).length > 0 && (
            <MetricsWidget
              data={dashboardData.chartData}
              title="Performance Metrics"
              type={user.role}
            />
          )}
      </div>

      {/* Role-specific additional content */}
      {user.role === "student" && dashboardData.stats.nextMeeting && (
        <Card>
          <Card.Header>
            <h3 className="text-lg font-semibold flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Next Appointment
            </h3>
          </Card.Header>
          <Card.Content>
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">
                  Meeting with{" "}
                  {dashboardData.stats.nextMeeting.consultant?.name ||
                    "Your Consultant"}
                </p>
                <p className="text-sm text-gray-600">
                  {new Date(
                    dashboardData.stats.nextMeeting.dateTime
                  ).toLocaleDateString()}{" "}
                  at{" "}
                  {new Date(
                    dashboardData.stats.nextMeeting.dateTime
                  ).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              <Button size="sm">Join Meeting</Button>
            </div>
          </Card.Content>
        </Card>
      )}
    </div>
  );
};

export default DashboardPage;
