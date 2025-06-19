import React, { useState, useEffect } from "react";
import useApi from "../../hooks/useApi";
import useAuthStore from "../../stores/authStore";
import usePermissions from "../../hooks/usePermissions";
import { validateInput } from "../../utils/validators";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import Input from "../../components/ui/Input";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import Toast from "../../components/ui/Toast";
import DataTable from "../../components/tables/DataTable";
import { BarChart, LineChart } from "../../components/charts";
import {
  BarChart2,
  Download,
  Search,
  Users,
  Target,
  Shield,
} from "lucide-react";
import { saveAs } from "file-saver";
import Papa from "papaparse";

const ConsultantPerformance = () => {
  const { user } = useAuthStore();
  const { callApi, services, loading: apiLoading, error: apiError } = useApi();
  const { hasPermission } = usePermissions();
  const [performanceData, setPerformanceData] = useState([]);
  const [consultants, setConsultants] = useState([]);
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    consultantId: "",
  });
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  useEffect(() => {
    if (user && hasPermission("view", "performance")) {
      fetchConsultants();
      fetchPerformanceData();
    }
  }, [user, filters]);

  const fetchConsultants = async () => {
    try {
      const response = await callApi(services.user.getTeamMembers);
      setConsultants(
        response
          ?.filter((member) => member.role === "consultant")
          .map((member) => ({
            id: member.id,
            name: validateInput(member.name),
          })) || []
      );
    } catch (error) {
      setToast({
        show: true,
        message: apiError || "Failed to fetch consultants",
        type: "error",
      });
    }
  };

  const fetchPerformanceData = async () => {
    try {
      const params = {
        startDate: filters.startDate,
        endDate: filters.endDate,
        consultantId: filters.consultantId,
      };
      const response = await callApi(
        services.performance.getPerformance,
        params
      );
      setPerformanceData(
        response?.map((data) => ({
          consultantId: data.consultantId,
          name: validateInput(data.name || "Unknown"),
          leadsAssigned: data.leadsAssigned || 0,
          leadsConverted: data.leadsConverted || 0,
          tasksCompleted: data.tasksCompleted || 0,
          conversionRate: (
            (data.leadsConverted / (data.leadsAssigned || 1)) *
            100
          ).toFixed(1),
          scheduleAdherence: (data.scheduleAdherence || 0).toFixed(1),
          evaluationDate: new Date(data.evaluationDate).toLocaleDateString(),
        })) || []
      );
    } catch (error) {
      setToast({
        show: true,
        message: apiError || "Failed to fetch performance data",
        type: "error",
      });
    }
  };

  const handleExportCSV = () => {
    if (!performanceData.length) {
      setToast({ show: true, message: "No data to export", type: "error" });
      return;
    }

    const csvData = performanceData.map((data) => ({
      "Consultant Name": data.name,
      "Leads Assigned": data.leadsAssigned,
      "Leads Converted": data.leadsConverted,
      "Tasks Completed": data.tasksCompleted,
      "Conversion Rate (%)": data.conversionRate,
      "Schedule Adherence (%)": data.scheduleAdherence,
      "Evaluation Date": data.evaluationDate,
    }));

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(
      blob,
      `consultant_performance_${new Date().toISOString().slice(0, 10)}.csv`
    );
    setToast({
      show: true,
      message: "Performance data exported as CSV",
      type: "success",
    });
  };

  const getBarChartData = () => {
    return {
      labels: performanceData.map((data) => data.name),
      datasets: [
        {
          label: "Leads Converted",
          data: performanceData.map((data) => data.leadsConverted),
          backgroundColor: "rgba(75, 192, 192, 0.6)",
        },
        {
          label: "Tasks Completed",
          data: performanceData.map((data) => data.tasksCompleted),
          backgroundColor: "rgba(153, 102, 255, 0.6)",
        },
      ],
    };
  };

  const getLineChartData = () => {
    return {
      labels: performanceData.map((data) => data.evaluationDate),
      datasets: [
        {
          label: "Conversion Rate (%)",
          data: performanceData.map((data) => data.conversionRate),
          borderColor: "rgba(255, 99, 132, 1)",
          fill: false,
        },
        {
          label: "Schedule Adherence (%)",
          data: performanceData.map((data) => data.scheduleAdherence),
          borderColor: "rgba(54, 162, 235, 1)",
          fill: false,
        },
      ],
    };
  };

  const columns = [
    {
      key: "name",
      label: "Consultant",
      render: (data) => (
        <div className="flex items-center">
          <Users className="h-4 w-4 text-gray-400 mr-2" />
          <span className="text-sm">{data.name}</span>
        </div>
      ),
    },
    {
      key: "leadsAssigned",
      label: "Leads Assigned",
      render: (data) => <span className="text-sm">{data.leadsAssigned}</span>,
    },
    {
      key: "leadsConverted",
      label: "Leads Converted",
      render: (data) => <span className="text-sm">{data.leadsConverted}</span>,
    },
    {
      key: "tasksCompleted",
      label: "Tasks Completed",
      render: (data) => <span className="text-sm">{data.tasksCompleted}</span>,
    },
    {
      key: "conversionRate",
      label: "Conversion Rate (%)",
      render: (data) => (
        <Badge
          className={
            data.conversionRate > 50
              ? "bg-green-100 text-green-800"
              : "bg-yellow-100 text-yellow-800"
          }
        >
          {data.conversionRate}%
        </Badge>
      ),
    },
    {
      key: "scheduleAdherence",
      label: "Schedule Adherence (%)",
      render: (data) => (
        <Badge
          className={
            data.scheduleAdherence > 80
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }
        >
          {data.scheduleAdherence}%
        </Badge>
      ),
    },
    {
      key: "evaluationDate",
      label: "Evaluation Date",
      render: (data) => (
        <div className="flex items-center text-sm text-gray-600">
          <Target className="h-4 w-4 mr-1" />
          {data.evaluationDate}
        </div>
      ),
    },
  ];

  if (apiLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!hasPermission("view", "performance")) {
    return (
      <div className="text-center py-8">
        <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Access Denied
        </h3>
        <p className="text-gray-600">
          You do not have permission to view consultant performance.
        </p>
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
            Consultant Performance
          </h1>
          <p className="text-gray-600">
            Evaluate and analyze consultant performance metrics.
          </p>
        </div>
        <Button onClick={handleExportCSV} disabled={!performanceData.length}>
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search consultants..."
              value={filters.search}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value })
              }
              className="pl-10"
            />
          </div>
          <select
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            value={filters.consultantId}
            onChange={(e) =>
              setFilters({ ...filters, consultantId: e.target.value })
            }
          >
            <option value="">All Consultants</option>
            {consultants.map((consultant) => (
              <option key={consultant.id} value={consultant.id}>
                {consultant.name}
              </option>
            ))}
          </select>
          <Input
            type="date"
            value={filters.startDate}
            onChange={(e) =>
              setFilters({ ...filters, startDate: e.target.value })
            }
            placeholder="Start Date"
          />
          <Input
            type="date"
            value={filters.endDate}
            onChange={(e) =>
              setFilters({ ...filters, endDate: e.target.value })
            }
            placeholder="End Date"
          />
        </div>
      </Card>

      {/* Performance Visualizations */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">
          Performance Visualizations
        </h3>
        {performanceData.length > 0 ? (
          <div className="space-y-6">
            <div className="h-64">
              <BarChart data={getBarChartData()} />
            </div>
            <div className="h-64">
              <LineChart data={getLineChartData()} />
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <BarChart2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">
              No performance data available for the selected filters.
            </p>
          </div>
        )}
      </Card>

      {/* Performance Table */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">Consultant Performance</h3>
        {performanceData.length === 0 ? (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No performance data found
            </h3>
            <p className="text-gray-600">
              Adjust your filters to view available performance data.
            </p>
          </div>
        ) : (
          <DataTable
            data={performanceData}
            columns={columns}
            pagination={true}
            pageSize={10}
          />
        )}
      </Card>
    </div>
  );
};

export default ConsultantPerformance;
