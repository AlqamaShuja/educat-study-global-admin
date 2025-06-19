import React, { useState, useEffect } from "react";
import { useAuthStore } from "../../stores/authStore";
import { useReportStore } from "../../stores/reportStore";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner";
import { Tabs } from "../../components/ui/Tabs";
import { LineChart } from "../../components/charts/LineChart";
import { BarChart } from "../../components/charts/BarChart";
import { PieChart } from "../../components/charts/PieChart";
import { MetricsWidget } from "../../components/charts/MetricsWidget";
import { DashboardCard } from "../../components/charts/DashboardCard";
import {
  TrendingUp,
  Users,
  Target,
  FileText,
  Calendar,
  Download,
  Filter,
  RefreshCw,
} from "lucide-react";

const AnalyticsPage = () => {
  const { user } = useAuthStore();
  const {
    reports,
    metrics,
    isLoading,
    error,
    fetchReports,
    createReport,
    exportReport,
    fetchMetrics,
  } = useReportStore();

  const [activeTab, setActiveTab] = useState("overview");
  const [dateRange, setDateRange] = useState("30");
  const [selectedOffice, setSelectedOffice] = useState("all");
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    loadAnalytics();
  }, [dateRange, selectedOffice]);

  const loadAnalytics = async () => {
    try {
      await Promise.all([
        fetchMetrics({ dateRange, officeId: selectedOffice }),
        fetchReports(),
      ]);
    } catch (error) {
      console.error("Failed to load analytics:", error);
    }
  };

  const handleExportReport = async (reportType, format = "pdf") => {
    setIsExporting(true);
    try {
      await exportReport(reportType, {
        format,
        dateRange,
        officeId: selectedOffice,
      });
    } catch (error) {
      console.error("Failed to export report:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleCreateReport = async (reportData) => {
    try {
      await createReport({
        ...reportData,
        parameters: {
          dateRange,
          officeId: selectedOffice,
        },
      });
      await fetchReports();
    } catch (error) {
      console.error("Failed to create report:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="p-6 text-center">
          <p className="text-red-600 mb-4">Failed to load analytics</p>
          <Button onClick={loadAnalytics}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </Card>
      </div>
    );
  }

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricsWidget
          title="Total Leads"
          value={metrics?.totalLeads || 0}
          change={metrics?.leadsChange || 0}
          icon={<Users className="w-6 h-6" />}
          color="blue"
        />
        <MetricsWidget
          title="Conversion Rate"
          value={`${metrics?.conversionRate || 0}%`}
          change={metrics?.conversionChange || 0}
          icon={<Target className="w-6 h-6" />}
          color="green"
        />
        <MetricsWidget
          title="Active Consultants"
          value={metrics?.activeConsultants || 0}
          change={metrics?.consultantsChange || 0}
          icon={<Users className="w-6 h-6" />}
          color="purple"
        />
        <MetricsWidget
          title="Pending Appointments"
          value={metrics?.pendingAppointments || 0}
          change={metrics?.appointmentsChange || 0}
          icon={<Calendar className="w-6 h-6" />}
          color="orange"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Lead Generation Trend</h3>
          <LineChart
            data={metrics?.leadTrend || []}
            xKey="date"
            yKey="leads"
            height={300}
          />
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Lead Sources</h3>
          <PieChart
            data={metrics?.leadSources || []}
            dataKey="value"
            nameKey="source"
            height={300}
          />
        </Card>
      </div>

      {/* Performance by Office */}
      {(user.role === "super_admin" || user.role === "manager") && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Office Performance</h3>
          <BarChart
            data={metrics?.officePerformance || []}
            xKey="office"
            yKey="conversions"
            height={400}
          />
        </Card>
      )}
    </div>
  );

  const renderLeadsTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <DashboardCard
          title="New Leads"
          value={metrics?.newLeads || 0}
          subtitle="This month"
          trend={metrics?.newLeadsTrend}
        />
        <DashboardCard
          title="Converted Leads"
          value={metrics?.convertedLeads || 0}
          subtitle="This month"
          trend={metrics?.convertedTrend}
        />
        <DashboardCard
          title="Lost Leads"
          value={metrics?.lostLeads || 0}
          subtitle="This month"
          trend={metrics?.lostTrend}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">
            Lead Status Distribution
          </h3>
          <PieChart
            data={metrics?.leadStatusDistribution || []}
            dataKey="count"
            nameKey="status"
            height={300}
          />
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Conversion Funnel</h3>
          <BarChart
            data={metrics?.conversionFunnel || []}
            xKey="stage"
            yKey="count"
            height={300}
          />
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">
          Lead Performance Over Time
        </h3>
        <LineChart
          data={metrics?.leadPerformance || []}
          xKey="date"
          lines={[
            { key: "new", name: "New Leads", color: "#3B82F6" },
            { key: "converted", name: "Converted", color: "#10B981" },
            { key: "lost", name: "Lost", color: "#EF4444" },
          ]}
          height={400}
        />
      </Card>
    </div>
  );

  const renderConsultantsTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <DashboardCard
          title="Active Consultants"
          value={metrics?.activeConsultants || 0}
          subtitle="Currently working"
        />
        <DashboardCard
          title="Avg. Leads per Consultant"
          value={metrics?.avgLeadsPerConsultant || 0}
          subtitle="This month"
        />
        <DashboardCard
          title="Top Performer"
          value={metrics?.topPerformer?.name || "N/A"}
          subtitle={`${metrics?.topPerformer?.conversions || 0} conversions`}
        />
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Consultant Performance</h3>
        <BarChart
          data={metrics?.consultantPerformance || []}
          xKey="name"
          yKey="conversions"
          height={400}
        />
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Workload Distribution</h3>
          <PieChart
            data={metrics?.workloadDistribution || []}
            dataKey="leads"
            nameKey="consultant"
            height={300}
          />
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Response Times</h3>
          <BarChart
            data={metrics?.responseTimes || []}
            xKey="consultant"
            yKey="avgResponseTime"
            height={300}
          />
        </Card>
      </div>
    </div>
  );

  const renderReportsTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Generated Reports</h2>
        <div className="flex gap-2">
          <Button
            onClick={() => handleCreateReport({ type: "performance" })}
            disabled={isLoading}
          >
            <FileText className="w-4 h-4 mr-2" />
            Generate Report
          </Button>
          <Button
            variant="outline"
            onClick={() => handleExportReport("summary", "pdf")}
            disabled={isExporting}
          >
            <Download className="w-4 h-4 mr-2" />
            {isExporting ? "Exporting..." : "Export PDF"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {reports?.map((report) => (
          <Card key={report.id} className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-semibold">{report.title}</h3>
                <p className="text-sm text-gray-600">
                  Created: {new Date(report.createdAt).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-600">
                  Type: {report.type} | Status: {report.status}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleExportReport(report.id, "pdf")}
                >
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  const tabs = [
    { id: "overview", label: "Overview", content: renderOverviewTab },
    { id: "leads", label: "Leads Analytics", content: renderLeadsTab },
    ...(user.role !== "student"
      ? [
          {
            id: "consultants",
            label: "Consultants",
            content: renderConsultantsTab,
          },
        ]
      : []),
    { id: "reports", label: "Reports", content: renderReportsTab },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Analytics & Reports</h1>
          <p className="text-gray-600">
            Comprehensive insights and performance metrics
          </p>
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 3 months</option>
            <option value="365">Last year</option>
          </select>

          {user.role === "super_admin" && (
            <select
              value={selectedOffice}
              onChange={(e) => setSelectedOffice(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Offices</option>
              {/* Add office options dynamically */}
            </select>
          )}

          <Button
            variant="outline"
            onClick={loadAnalytics}
            disabled={isLoading}
          >
            <RefreshCw
              className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
            />
          </Button>
        </div>
      </div>

      {/* Analytics Content */}
      <Tabs
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        className="min-h-[600px]"
      />
    </div>
  );
};

export default AnalyticsPage;
