// pages/consultant/ConsultantDashboard.jsx
import React, { useState, useEffect } from "react";
import useAuthStore from "../../stores/authStore";
import useApi from "../../hooks/useApi";
import StatsCard from "../../components/widgets/StatsCard";
import RecentActivity from "../../components/widgets/RecentActivity";
import QuickActions from "../../components/widgets/QuickActions";
import TaskList from "../../components/widgets/TaskList";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { Users, CheckCircle, Clock, TrendingUp } from "lucide-react";

const ConsultantDashboard = () => {
  const { user } = useAuthStore();
  const { request, loading } = useApi();
  const [dashboardData, setDashboardData] = useState({
    leads: [],
    appointments: [],
    tasks: [],
    stats: {
      totalLeads: 0,
      activeLeads: 0,
      completedTasks: 0,
      upcomingAppointments: 0,
    },
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [leadsResponse, appointmentsResponse] = await Promise.all([
        request("/consultant/leads"),
        request("/consultant/appointments"),
      ]);

      const leads = leadsResponse.data || [];
      const appointments = appointmentsResponse.data || [];

      const stats = {
        totalLeads: leads.length,
        activeLeads: leads.filter((lead) => lead.status === "in_progress")
          .length,
        completedTasks: 0, // This would come from a tasks endpoint
        upcomingAppointments: appointments.filter(
          (apt) => new Date(apt.dateTime) > new Date()
        ).length,
      };

      setDashboardData({
        leads,
        appointments,
        tasks: [], // This would come from a tasks endpoint
        stats,
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    }
  };

  const quickActions = [
    {
      title: "View My Leads",
      description: "Manage assigned leads",
      icon: Users,
      href: "/consultant/my-leads",
      color: "bg-blue-500",
    },
    {
      title: "Schedule Meeting",
      description: "Book new appointment",
      icon: Clock,
      href: "/consultant/meeting-scheduler",
      color: "bg-green-500",
    },
    {
      title: "Student Profiles",
      description: "Review student information",
      icon: CheckCircle,
      href: "/consultant/student-profiles",
      color: "bg-purple-500",
    },
    {
      title: "Communication",
      description: "Message students",
      icon: TrendingUp,
      href: "/consultant/communication-history",
      color: "bg-orange-500",
    },
  ];

  const recentActivities = dashboardData.leads.slice(0, 5).map((lead) => ({
    id: lead.id,
    title: `Lead updated: ${lead.student?.name || "Unknown"}`,
    description: `Status changed to ${lead.status}`,
    time: lead.updatedAt,
    type: "lead",
  }));

  const upcomingTasks = [
    ...dashboardData.appointments
      .filter((apt) => new Date(apt.dateTime) > new Date())
      .slice(0, 3)
      .map((apt) => ({
        id: apt.id,
        title: `Meeting with ${apt.student?.name || "Student"}`,
        dueDate: apt.dateTime,
        priority: "high",
        status: "pending",
      })),
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.name}!
        </h1>
        <p className="text-gray-600 mt-1">
          Here's what's happening with your students today.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Leads"
          value={dashboardData.stats.totalLeads}
          icon={Users}
          trend={{ value: 12, isPositive: true }}
          color="blue"
        />
        <StatsCard
          title="Active Leads"
          value={dashboardData.stats.activeLeads}
          icon={TrendingUp}
          trend={{ value: 8, isPositive: true }}
          color="green"
        />
        <StatsCard
          title="Upcoming Meetings"
          value={dashboardData.stats.upcomingAppointments}
          icon={Clock}
          trend={{ value: 3, isPositive: false }}
          color="purple"
        />
        <StatsCard
          title="Completed Tasks"
          value={dashboardData.stats.completedTasks}
          icon={CheckCircle}
          trend={{ value: 15, isPositive: true }}
          color="orange"
        />
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
            tasks={upcomingTasks}
            title="Upcoming Tasks"
            onTaskClick={(task) => {
              // Handle task click
              console.log("Task clicked:", task);
            }}
          />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentActivity
          activities={recentActivities}
          title="Recent Lead Activities"
        />

        {/* Today's Schedule */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Today's Schedule
            </h3>
          </div>
          <div className="p-6">
            {dashboardData.appointments.filter((apt) => {
              const aptDate = new Date(apt.dateTime);
              const today = new Date();
              return aptDate.toDateString() === today.toDateString();
            }).length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                No appointments scheduled for today
              </p>
            ) : (
              <div className="space-y-3">
                {dashboardData.appointments
                  .filter((apt) => {
                    const aptDate = new Date(apt.dateTime);
                    const today = new Date();
                    return aptDate.toDateString() === today.toDateString();
                  })
                  .map((apt) => (
                    <div
                      key={apt.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-gray-900">
                          {apt.student?.name || "Student"}
                        </p>
                        <p className="text-sm text-gray-600">
                          {new Date(apt.dateTime).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          apt.type === "virtual"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {apt.type}
                      </span>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsultantDashboard;

// import React, { useState, useEffect } from "react";
// import {
//   Users,
//   Calendar,
//   FileText,
//   TrendingUp,
//   Clock,
//   CheckCircle,
//   AlertCircle,
//   MessageCircle,
//   Plus,
//   Eye,
//   Filter,
//   Download,
// } from "lucide-react";
// import { useAuthStore } from "../../stores/authStore";
// import { useLeadStore } from "../../stores/leadStore";
// import { useAppointmentStore } from "../../stores/appointmentStore";
// import StatsCard from "../../components/widgets/StatsCard";
// import RecentActivity from "../../components/widgets/RecentActivity";
// import QuickActions from "../../components/widgets/QuickActions";
// import ProgressTracker from "../../components/widgets/ProgressTracker";
// import TaskList from "../../components/widgets/TaskList";
// import LineChart from "../../components/charts/LineChart";
// import PieChart from "../../components/charts/PieChart";
// import Card from "../../components/ui/Card";
// import Button from "../../components/ui/Button";
// import Badge from "../../components/ui/Badge";

// const ConsultantDashboard = () => {
//   const { user } = useAuthStore();
//   const {
//     leads,
//     myLeads,
//     isLoading: leadsLoading,
//     fetchMyLeads,
//     getLeadStats,
//   } = useLeadStore();
//   const {
//     appointments,
//     todayAppointments,
//     isLoading: appointmentsLoading,
//     fetchMyAppointments,
//   } = useAppointmentStore();

//   const [selectedPeriod, setSelectedPeriod] = useState("week");
//   const [dashboardData, setDashboardData] = useState({
//     totalStudents: 0,
//     activeApplications: 0,
//     upcomingAppointments: 0,
//     completedTasks: 0,
//     conversionRate: 0,
//     responseTime: "2.5 hours",
//   });

//   useEffect(() => {
//     fetchMyLeads();
//     fetchMyAppointments();
//   }, [fetchMyLeads, fetchMyAppointments]);

//   useEffect(() => {
//     // Calculate dashboard metrics
//     const stats = getLeadStats(user?.id);
//     setDashboardData((prev) => ({
//       ...prev,
//       totalStudents: myLeads?.length || 0,
//       activeApplications:
//         myLeads?.filter((lead) => lead.status === "in_progress")?.length || 0,
//       upcomingAppointments: todayAppointments?.length || 0,
//       conversionRate: stats?.conversionRate || 0,
//     }));
//   }, [myLeads, todayAppointments, user?.id, getLeadStats]);

//   // Sample data for charts
//   const performanceData = [
//     { date: "2024-01-01", leads: 12, appointments: 8, conversions: 3 },
//     { date: "2024-01-02", leads: 15, appointments: 12, conversions: 5 },
//     { date: "2024-01-03", leads: 18, appointments: 14, conversions: 4 },
//     { date: "2024-01-04", leads: 22, appointments: 16, conversions: 6 },
//     { date: "2024-01-05", leads: 20, appointments: 18, conversions: 8 },
//     { date: "2024-01-06", leads: 25, appointments: 20, conversions: 7 },
//     { date: "2024-01-07", leads: 28, appointments: 22, conversions: 9 },
//   ];

//   const leadStatusData = [
//     { name: "New", value: 15, color: "#3B82F6" },
//     { name: "In Progress", value: 25, color: "#F59E0B" },
//     { name: "Converted", value: 12, color: "#10B981" },
//     { name: "Lost", value: 8, color: "#EF4444" },
//   ];

//   const recentActivities = [
//     {
//       id: 1,
//       type: "appointment_completed",
//       title: "Consultation completed",
//       description: "Meeting with Sarah Johnson about UK universities",
//       user: { name: "Sarah Johnson", avatar: null },
//       timestamp: "2024-01-15T10:30:00Z",
//       metadata: { duration: "45 minutes" },
//     },
//     {
//       id: 2,
//       type: "document_uploaded",
//       title: "Document received",
//       description: "IELTS certificate uploaded by Mike Chen",
//       user: { name: "Mike Chen", avatar: null },
//       timestamp: "2024-01-15T09:15:00Z",
//       metadata: { fileName: "IELTS_Certificate.pdf" },
//     },
//     {
//       id: 3,
//       type: "lead_assigned",
//       title: "New lead assigned",
//       description: "Emma Wilson interested in Canadian programs",
//       user: { name: "Emma Wilson", avatar: null },
//       timestamp: "2024-01-15T08:45:00Z",
//     },
//   ];

//   const quickActions = [
//     {
//       id: "book_appointment",
//       title: "Book Appointment",
//       description: "Schedule meeting with student",
//       icon: Calendar,
//       color: "blue",
//       category: "appointments",
//       shortcut: "Ctrl+Shift+A",
//     },
//     {
//       id: "add_student",
//       title: "Add Student",
//       description: "Register new student",
//       icon: Users,
//       color: "green",
//       category: "students",
//       shortcut: "Ctrl+Shift+S",
//     },
//     {
//       id: "review_applications",
//       title: "Review Applications",
//       description: "Check pending applications",
//       icon: FileText,
//       color: "purple",
//       category: "applications",
//     },
//     {
//       id: "send_message",
//       title: "Send Message",
//       description: "Contact student or colleague",
//       icon: MessageCircle,
//       color: "indigo",
//       category: "communication",
//     },
//   ];

//   const progressItems = [
//     {
//       id: 1,
//       title: "Complete John Doe Application",
//       description: "Finalize university application documents",
//       status: "in_progress",
//       progress: 75,
//       dueDate: "2024-01-20T00:00:00Z",
//       priority: "high",
//       assignee: "John Doe",
//     },
//     {
//       id: 2,
//       title: "Schedule UK University Fair",
//       description: "Organize student information session",
//       status: "pending",
//       progress: 30,
//       dueDate: "2024-01-25T00:00:00Z",
//       priority: "medium",
//     },
//     {
//       id: 3,
//       title: "Review Scholarship Applications",
//       description: "Evaluate 5 scholarship applications",
//       status: "completed",
//       progress: 100,
//       completedDate: "2024-01-14T00:00:00Z",
//       priority: "normal",
//     },
//   ];

//   const upcomingTasks = [
//     {
//       id: 1,
//       title: "Call Sarah about visa documentation",
//       description: "Follow up on missing documents",
//       status: "pending",
//       priority: "high",
//       dueDate: "2024-01-16T14:00:00Z",
//       assignee: "Sarah Johnson",
//       category: "follow_up",
//     },
//     {
//       id: 2,
//       title: "Prepare university presentation",
//       description: "Create slides for Cambridge info session",
//       status: "pending",
//       priority: "medium",
//       dueDate: "2024-01-17T10:00:00Z",
//       category: "preparation",
//     },
//     {
//       id: 3,
//       title: "Review IELTS scores",
//       description: "Verify submitted test results",
//       status: "in_progress",
//       priority: "normal",
//       dueDate: "2024-01-18T16:00:00Z",
//       category: "review",
//     },
//   ];

//   return (
//     <div className="p-6 max-w-7xl mx-auto">
//       {/* Header */}
//       <div className="mb-8">
//         <div className="flex items-center justify-between">
//           <div>
//             <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
//               Welcome back, {user?.firstName}!
//             </h1>
//             <p className="text-gray-600 dark:text-gray-400 mt-1">
//               Here's what's happening with your students today
//             </p>
//           </div>

//           <div className="flex items-center space-x-3">
//             <select
//               value={selectedPeriod}
//               onChange={(e) => setSelectedPeriod(e.target.value)}
//               className="text-sm border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700"
//             >
//               <option value="today">Today</option>
//               <option value="week">This Week</option>
//               <option value="month">This Month</option>
//               <option value="quarter">This Quarter</option>
//             </select>

//             <Button variant="outline" size="sm">
//               <Download className="h-4 w-4 mr-2" />
//               Export Report
//             </Button>
//           </div>
//         </div>
//       </div>

//       {/* Stats Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
//         <StatsCard
//           title="Total Students"
//           value={dashboardData.totalStudents}
//           subtitle="Active consultations"
//           icon={Users}
//           trend="up"
//           trendValue={12}
//           color="blue"
//         />

//         <StatsCard
//           title="Active Applications"
//           value={dashboardData.activeApplications}
//           subtitle="In progress"
//           icon={FileText}
//           trend="up"
//           trendValue={8}
//           color="green"
//         />

//         <StatsCard
//           title="Today's Appointments"
//           value={dashboardData.upcomingAppointments}
//           subtitle="Scheduled meetings"
//           icon={Calendar}
//           trend="flat"
//           trendValue={0}
//           color="purple"
//         />

//         <StatsCard
//           title="Conversion Rate"
//           value={`${dashboardData.conversionRate}%`}
//           subtitle="This month"
//           icon={TrendingUp}
//           trend="up"
//           trendValue={5.2}
//           color="yellow"
//         />
//       </div>

//       {/* Main Content Grid */}
//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
//         {/* Performance Chart */}
//         <div className="lg:col-span-2">
//           <LineChart
//             title="Performance Overview"
//             subtitle="Your leads and conversions over time"
//             data={performanceData}
//             lines={[
//               { dataKey: "leads", stroke: "#3B82F6", name: "New Leads" },
//               {
//                 dataKey: "appointments",
//                 stroke: "#10B981",
//                 name: "Appointments",
//               },
//               {
//                 dataKey: "conversions",
//                 stroke: "#F59E0B",
//                 name: "Conversions",
//               },
//             ]}
//             height={300}
//             showTrend={true}
//           />
//         </div>

//         {/* Lead Status Distribution */}
//         <div>
//           <PieChart
//             title="Lead Status Distribution"
//             subtitle="Current pipeline status"
//             data={leadStatusData}
//             height={300}
//             showValueList={true}
//           />
//         </div>
//       </div>

//       {/* Secondary Content Grid */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
//         {/* Quick Actions */}
//         <QuickActions
//           title="Quick Actions"
//           actions={quickActions}
//           layout="grid"
//           columns={2}
//           onActionClick={(action) => console.log("Action clicked:", action)}
//         />

//         {/* Recent Activity */}
//         <RecentActivity
//           title="Recent Activity"
//           activities={recentActivities}
//           maxItems={5}
//           showTimestamps={true}
//           groupByDate={false}
//         />
//       </div>

//       {/* Progress and Tasks */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//         {/* Progress Tracker */}
//         <ProgressTracker
//           title="Current Projects"
//           items={progressItems}
//           type="milestones"
//           showProgress={true}
//           showTimeline={false}
//           onItemClick={(item) => console.log("Progress item clicked:", item)}
//         />

//         {/* Task List */}
//         <TaskList
//           title="Upcoming Tasks"
//           tasks={upcomingTasks}
//           maxItems={5}
//           showFilters={false}
//           groupBy="none"
//           onTaskClick={(task) => console.log("Task clicked:", task)}
//           onTaskComplete={(task) => console.log("Task completed:", task)}
//         />
//       </div>

//       {/* Today's Schedule */}
//       <div className="mt-8">
//         <Card className="p-6">
//           <div className="flex items-center justify-between mb-6">
//             <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
//               Today's Schedule
//             </h2>
//             <Button variant="outline" size="sm">
//               <Plus className="h-4 w-4 mr-2" />
//               Add Appointment
//             </Button>
//           </div>

//           {todayAppointments && todayAppointments.length > 0 ? (
//             <div className="space-y-4">
//               {todayAppointments.map((appointment) => (
//                 <div
//                   key={appointment.id}
//                   className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
//                 >
//                   <div className="flex items-center space-x-4">
//                     <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
//                       <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
//                     </div>
//                     <div>
//                       <h3 className="font-medium text-gray-900 dark:text-white">
//                         {appointment.title}
//                       </h3>
//                       <p className="text-sm text-gray-600 dark:text-gray-400">
//                         {appointment.studentName} • {appointment.time}
//                       </p>
//                     </div>
//                   </div>

//                   <div className="flex items-center space-x-3">
//                     <Badge
//                       variant={
//                         appointment.status === "confirmed"
//                           ? "success"
//                           : appointment.status === "pending"
//                           ? "warning"
//                           : "secondary"
//                       }
//                     >
//                       {appointment.status}
//                     </Badge>

//                     <Button variant="ghost" size="sm">
//                       <Eye className="h-4 w-4" />
//                     </Button>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           ) : (
//             <div className="text-center py-8">
//               <Calendar className="h-8 w-8 text-gray-400 mx-auto mb-2" />
//               <p className="text-gray-500 dark:text-gray-400">
//                 No appointments scheduled for today
//               </p>
//               <Button variant="outline" size="sm" className="mt-2">
//                 Schedule an appointment
//               </Button>
//             </div>
//           )}
//         </Card>
//       </div>
//     </div>
//   );
// };

// export default ConsultantDashboard;
