import React, { useState, useEffect } from "react";
import useApi from "../../hooks/useApi";
import useAuth from "../../hooks/useAuth";
import usePermissions from "../../hooks/usePermissions";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import Toast from "../../components/ui/Toast";
import BarChart from "../../components/charts/BarChart";
import PieChart from "../../components/charts/PieChart";
import {
  Users,
  Building,
  Book,
  UserPlus,
  Shield,
  Activity,
  Calendar,
} from "lucide-react";

const SuperAdminDashboard = () => {
  const { user } = useAuth();
  const { callApi, loading: apiLoading, error: apiError } = useApi();
  const { hasPermission } = usePermissions();
  const [stats, setStats] = useState({
    totalOffices: 0,
    totalStaff: 0,
    totalCourses: 0,
    totalLeads: 0,
    recentActivities: [],
  });
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  useEffect(() => {
    if (user && hasPermission("view", "dashboard")) {
      fetchDashboardStats();
    }
  }, [user]);

  const fetchDashboardStats = async () => {
    try {
      const [offices, staff, courses, leads, activities] = await Promise.all([
        callApi("GET", "/super-admin/offices"),
        callApi("GET", "/super-admin/staff"),
        callApi("GET", "/super-admin/courses"),
        callApi("GET", "/super-admin/leads"),
        callApi("GET", "/super-admin/activities", { params: { limit: 5 } }),
      ]);

      setStats({
        totalOffices: offices?.length || 0,
        totalStaff: staff?.length || 0,
        totalCourses: courses?.length || 0,
        totalLeads: leads?.length || 0,
        recentActivities: activities || [],
      });
    } catch (error) {
      setToast({
        show: true,
        message: apiError || "Failed to fetch dashboard stats",
        type: "error",
      });
    }
  };

  if (apiLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!hasPermission("view", "dashboard")) {
    return (
      <div className="text-center py-8">
        <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Access Denied
        </h3>
        <p className="text-gray-600">
          You do not have permission to view the dashboard.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* <Toast
        isOpen={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, show: false })}
      /> */}

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Super Admin Dashboard
          </h1>
          <p className="text-gray-600">
            Overview of system activities and statistics.
          </p>
        </div>
        <Button onClick={fetchDashboardStats}>
          <Activity className="h-4 w-4 mr-2" />
          Refresh Stats
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center">
            <Building className="h-8 w-8 text-indigo-500 mr-3" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {stats.totalOffices}
              </h3>
              <p className="text-sm text-gray-600">Total Offices</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-green-500 mr-3" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {stats.totalStaff}
              </h3>
              <p className="text-sm text-gray-600">Total Staff</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center">
            <Book className="h-8 w-8 text-blue-500 mr-3" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {stats.totalCourses}
              </h3>
              <p className="text-sm text-gray-600">Total Courses</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center">
            <UserPlus className="h-8 w-8 text-purple-500 mr-3" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {stats.totalLeads}
              </h3>
              <p className="text-sm text-gray-600">Total Leads</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-4">
            Lead Status Distribution
          </h3>
          <PieChart
            data={[
              { name: "New", value: stats.totalLeads * 0.3 },
              { name: "Contacted", value: stats.totalLeads * 0.3 },
              { name: "Qualified", value: stats.totalLeads * 0.2 },
              { name: "Converted", value: stats.totalLeads * 0.1 },
              { name: "Lost", value: stats.totalLeads * 0.1 },
            ]}
            colors={["#3B82F6", "#FBBF24", "#10B981", "#6366F1", "#EF4444"]}
            height={300}
          />
        </Card>
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-4">Office Activity</h3>
          <BarChart
            data={[
              { name: "Office A", leads: 50, appointments: 30 },
              { name: "Office B", leads: 40, appointments: 25 },
              { name: "Office C", leads: 60, appointments: 35 },
              { name: "Office D", leads: 30, appointments: 20 },
            ]}
            keys={["leads", "appointments"]}
            colors={["#3B82F6", "#10B981"]}
            height={300}
          />
        </Card>
      </div>

      {/* Recent Activities */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">Recent Activities</h3>
        {stats.recentActivities.length === 0 ? (
          <div className="text-center py-4">
            <Activity className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600">No recent activities to display.</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {stats.recentActivities.map((activity) => (
              <li
                key={activity.id}
                className="flex items-center text-sm text-gray-700"
              >
                <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                <span>
                  {activity.description} -{" "}
                  {new Date(activity.createdAt).toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
};

export default SuperAdminDashboard;
