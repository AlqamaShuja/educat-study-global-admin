import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import useApi from "../../hooks/useApi";
import useTasks from "../../hooks/useTasks";
import useAuthStore from "../../stores/authStore";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import Toast from "../../components/ui/Toast";
import DataTable from "../../components/tables/DataTable";
import BarChart from "../../components/charts/BarChart";
import {
  Users,
  Target,
  CheckSquare,
  AlertCircle,
  Plus,
  Edit,
  Calendar,
  TrendingUp,
  UserCheck,
} from "lucide-react";

const ManagerDashboard = () => {
  const { user } = useAuthStore();
  const { callApi, services, loading: apiLoading, error: apiError } = useApi();
  const { getTasks, loading: taskLoading, error: taskError } = useTasks();
  const [metrics, setMetrics] = useState({
    totalLeads: 0,
    activeTasks: 0,
    teamMembers: 0,
    conversionRate: 0,
  });
  const [recentTasks, setRecentTasks] = useState([]);
  const [teamPerformance, setTeamPerformance] = useState([]);
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const taskStatuses = [
    {
      value: "pending",
      label: "Pending",
      color: "bg-yellow-100 text-yellow-800",
    },
    {
      value: "in_progress",
      label: "In Progress",
      color: "bg-blue-100 text-blue-800",
    },
    {
      value: "completed",
      label: "Completed",
      color: "bg-green-100 text-green-800",
    },
    { value: "overdue", label: "Overdue", color: "bg-red-100 text-red-800" },
  ];

  useEffect(() => {
    if (user) {
      fetchMetrics();
      fetchRecentTasks();
      fetchTeamPerformance();
    }
  }, [user]);

  const fetchMetrics = async () => {
    try {
      const [leadsResponse, tasksResponse, teamResponse] = await Promise.all([
        callApi(services.lead.getLeads),
        callApi(services.task.getTasks),
        callApi(services.user.getTeamMembers), // Assuming endpoint for team data
      ]);
      setMetrics({
        totalLeads: leadsResponse?.length || 0,
        activeTasks:
          tasksResponse?.filter((task) => task.status !== "completed").length ||
          0,
        teamMembers: teamResponse?.length || 0,
        conversionRate: calculateConversionRate(leadsResponse) || 0,
      });
    } catch (error) {
      setToast({
        show: true,
        message: apiError || "Failed to fetch metrics",
        type: "error",
      });
    }
  };

  const fetchRecentTasks = async () => {
    try {
      const tasks = await getTasks();
      const tasksWithStatus = tasks
        .map((task) => ({
          ...task,
          status:
            new Date(task.dueDate) < new Date() && task.status !== "completed"
              ? "overdue"
              : task.status,
        }))
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5); // Limit to 5 recent tasks
      setRecentTasks(tasksWithStatus);
    } catch (error) {
      setToast({
        show: true,
        message: taskError || "Failed to fetch tasks",
        type: "error",
      });
    }
  };

  const fetchTeamPerformance = async () => {
    try {
      const response = await callApi(services.report.getConsultantPerformance); // Assuming endpoint
      setTeamPerformance(
        response?.map((member) => ({
          id: member.id,
          name: member.name,
          leadsAssigned: member.leadsAssigned || 0,
          leadsConverted: member.leadsConverted || 0,
          tasksCompleted: member.tasksCompleted || 0,
          conversionRate:
            ((member.leadsConverted / member.leadsAssigned) * 100).toFixed(1) ||
            0,
        })) || []
      );
    } catch (error) {
      setToast({
        show: true,
        message: apiError || "Failed to fetch team performance",
        type: "error",
      });
    }
  };

  const calculateConversionRate = (leads) => {
    if (!leads?.length) return 0;
    const converted = leads.filter(
      (lead) => lead.status === "converted"
    ).length;
    return ((converted / leads.length) * 100).toFixed(1);
  };

  const getStatusColor = (status) =>
    taskStatuses.find((s) => s.value === status)?.color ||
    "bg-gray-100 text-gray-800";

  const taskColumns = [
    {
      key: "title",
      label: "Task",
      render: (task) => (
        <div>
          <div className="font-medium text-gray-900">{task.title}</div>
          <div className="text-sm text-gray-500">{task.description}</div>
        </div>
      ),
    },
    {
      key: "student",
      label: "Student",
      render: (task) => (
        <div className="flex items-center">
          <UserCheck className="h-4 w-4 text-gray-400 mr-2" />
          <span className="text-sm">{task.studentName || "Unknown"}</span>
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (task) => (
        <Badge className={getStatusColor(task.status)}>
          {taskStatuses.find((s) => s.value === task.status)?.label}
        </Badge>
      ),
    },
    {
      key: "dueDate",
      label: "Due Date",
      render: (task) => {
        const dueDate = new Date(task.dueDate);
        const isOverdue = dueDate < new Date() && task.status !== "completed";
        return (
          <div
            className={`flex items-center text-sm ${
              isOverdue ? "text-red-600" : "text-gray-600"
            }`}
          >
            <Calendar className="h-4 w-4 mr-1" />
            {dueDate.toLocaleDateString()}
          </div>
        );
      },
    },
    {
      key: "actions",
      label: "Actions",
      render: (task) => (
        <Link to={`/manager/tasks/${task.id}`}>
          <Button size="sm" variant="outline">
            <Edit className="h-4 w-4" />
          </Button>
        </Link>
      ),
    },
  ];

  const teamColumns = [
    {
      key: "name",
      label: "Consultant",
      render: (member) => (
        <div className="flex items-center">
          <Users className="h-4 w-4 text-gray-400 mr-2" />
          <span className="text-sm">{member.name}</span>
        </div>
      ),
    },
    { key: "leadsAssigned", label: "Leads Assigned" },
    { key: "leadsConverted", label: "Leads Converted" },
    { key: "tasksCompleted", label: "Tasks Completed" },
    {
      key: "conversionRate",
      label: "Conversion Rate (%)",
      render: (member) => (
        <Badge
          className={
            member.conversionRate > 50
              ? "bg-green-100 text-green-800"
              : "bg-yellow-100 text-yellow-800"
          }
        >
          {member.conversionRate}%
        </Badge>
      ),
    },
  ];

  const chartData = {
    labels: teamPerformance.map((member) => member.name),
    datasets: [
      {
        label: "Leads Converted",
        data: teamPerformance.map((member) => member.leadsConverted),
        backgroundColor: "rgba(75, 192, 192, 0.6)",
      },
      {
        label: "Tasks Completed",
        data: teamPerformance.map((member) => member.tasksCompleted),
        backgroundColor: "rgba(153, 102, 255, 0.6)",
      },
    ],
  };

  if (apiLoading || taskLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Toast
        isOpen={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, show: false })}
      />

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Manager Dashboard
          </h1>
          <p className="text-gray-600">
            Welcome, {user?.name || "Manager"}! Overview of your office
            operations.
          </p>
        </div>
        <div className="flex space-x-3">
          <Link to="/manager/lead-assignment">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Assign Lead
            </Button>
          </Link>
          <Link to="/manager/task-management">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Task
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center">
            <Target className="h-8 w-8 text-blue-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total Leads</p>
              <p className="text-2xl font-bold text-gray-900">
                {metrics.totalLeads}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center">
            <CheckSquare className="h-8 w-8 text-yellow-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Active Tasks</p>
              <p className="text-2xl font-bold text-gray-900">
                {metrics.activeTasks}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-green-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Team Members</p>
              <p className="text-2xl font-bold text-gray-900">
                {metrics.teamMembers}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-purple-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">
                Conversion Rate
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {metrics.conversionRate}%
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Tasks */}
      <Card className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Recent Tasks</h3>
          <Link to="/manager/task-management">
            <Button variant="outline">View All Tasks</Button>
          </Link>
        </div>
        {recentTasks.length === 0 ? (
          <div className="text-center py-8">
            <CheckSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No recent tasks found.</p>
          </div>
        ) : (
          <DataTable
            data={recentTasks}
            columns={taskColumns}
            pagination={false}
          />
        )}
      </Card>

      {/* Team Performance */}
      <Card className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Team Performance</h3>
          <Link to="/manager/consultant-performance">
            <Button variant="outline">View Detailed Reports</Button>
          </Link>
        </div>
        {teamPerformance.length === 0 ? (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No team performance data available.</p>
          </div>
        ) : (
          <>
            <div className="h-64 mb-4">
              <BarChart data={chartData} />
            </div>
            <DataTable
              data={teamPerformance}
              columns={teamColumns}
              pagination={true}
              pageSize={5}
            />
          </>
        )}
      </Card>
    </div>
  );
};

export default ManagerDashboard;
