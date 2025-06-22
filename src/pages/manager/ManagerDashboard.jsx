import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useManagerStore from "../../stores/useManagerStore";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { Users, FileText, CheckCircle, Clock } from "lucide-react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ManagerDashboard = () => {
  const navigate = useNavigate();
  const { dashboard, leads, fetchDashboard, fetchLeads, loading, error } =
    useManagerStore();

  useEffect(() => {
    console.log("Fetching dashboard and leads...");
    fetchDashboard();
    fetchLeads();
  }, []);

  useEffect(() => {
    if (error) {
      console.error("Dashboard error:", error);
      toast.error(error);
    }
  }, [error]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Manager Dashboard
          </h1>
          <p className="text-gray-600">
            Overview of office performance and leads
          </p>
        </div>
        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={() => navigate("/manager/performance")}
          >
            <Users className="h-4 w-4 mr-2" />
            View Consultants
          </Button>
          <Button variant="outline" onClick={() => navigate("/manager/leads")}>
            <FileText className="h-4 w-4 mr-2" />
            Manage Leads
          </Button>
        </div>
      </div>

      {/* Dashboard Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card title="Total Leads">
          <div className="flex items-center">
            <FileText className="h-8 w-8 text-blue-500 mr-3" />
            <p className="text-3xl font-bold text-gray-900">
              {dashboard?.totalLeads || 0}
            </p>
          </div>
        </Card>
        <Card title="Converted Leads">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-500 mr-3" />
            <p className="text-3xl font-bold text-gray-900">
              {dashboard?.convertedLeads || 0}
            </p>
          </div>
        </Card>
        <Card title="Conversion Rate">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-blue-500 mr-3" />
            <p className="text-3xl font-bold text-gray-900">
              {((dashboard?.conversionRate || 0) * 100).toFixed(2)}%
            </p>
          </div>
        </Card>
        <Card title="Pending Appointments">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-yellow-500 mr-3" />
            <p className="text-3xl font-bold text-gray-900">
              {dashboard?.pendingAppointments || 0}
            </p>
          </div>
        </Card>
      </div>

      {/* Recent Leads */}
      <Card title="Recent Leads">
        {leads.length ? (
          <div className="space-y-4">
            {leads.slice(0, 5).map((lead) => (
              <div
                key={lead.id}
                className="flex items-center justify-between p-3 border-b border-gray-200"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {lead.student?.name || "N/A"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {lead.student?.email || "N/A"}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge
                    className={
                      lead.status === "converted"
                        ? "bg-green-100 text-green-800"
                        : lead.status === "in_progress"
                        ? "bg-blue-100 text-blue-800"
                        : lead.status === "lost"
                        ? "bg-red-100 text-red-800"
                        : "bg-gray-100 text-gray-800"
                    }
                  >
                    {lead.status || "new"}
                  </Badge>
                  {/* <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      navigate(`/consultant/students/${lead.studentId}`)
                    }
                  >
                    View Profile
                  </Button> */}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No leads available</p>
        )}
      </Card>
    </div>
  );
};

export default ManagerDashboard;
