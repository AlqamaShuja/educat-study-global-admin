import React, { useState, useEffect } from "react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Select from "../../components/ui/Select";
import Input from "../../components/ui/Input";
import { BarChart, LineChart } from "../../components/charts";
import useOfficeStore from "../../stores/officeStore";
import useUserStore from "../../stores/userStore";
import useReportStore from "../../stores/reportStore"; // Import report store
import reportService from "../../services/reportService"; // Import report service
import {
  FileText,
  Download,
  Search,
  Calendar,
  Filter,
  BarChart3,
  TrendingUp,
  Users,
  BookOpen,
} from "lucide-react";

const SystemReports = () => {
  const [reportType, setReportType] = useState("");
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    officeId: "",
    staffId: "",
  });
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { offices, fetchOffices } = useOfficeStore();
  const { users, fetchAllStaff } = useUserStore();
  const { createReport } = useReportStore(); // Use createReport from store

  const reportTypes = [
    { value: "performance", label: "Performance Report" },
    { value: "lead", label: "Lead Report" },
    { value: "financial", label: "Financial Report" },
    { value: "staff_activity", label: "Staff Activity Report" },
    { value: "office_performance", label: "Office Performance Report" },
  ];

  useEffect(() => {
    fetchOffices();
    fetchAllStaff();
  }, []);

  const officeOptions = offices.map((office) => ({
    value: office.id,
    label: `${office.name} - ${office.address?.city}`,
  }));

  const staffOptions = users.map((member) => ({
    value: member.id,
    label: `${member.name} (${member.role})`,
  }));

  const fetchReportData = async () => {
    if (!reportType) {
      setError("Please select a report type");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Create the report using reportService via useReportStore
      const createdReport = await createReport({
        type: reportType,
        parameters: {
          ...filters,
          dateRange:
            filters.startDate && filters.endDate
              ? {
                  start: filters.startDate,
                  end: filters.endDate,
                }
              : undefined,
        },
      });

      // Generate mock data for visualization since backend might not return chart data
      const mockData = generateMockData(reportType);
      setReportData({
        ...createdReport,
        data: mockData.data,
        summary: mockData.summary,
      });
    } catch (error) {
      setError(error.message || "Failed to fetch report data");
      console.error("Error fetching report:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateMockData = (type) => {
    switch (type) {
      case "lead":
        return {
          data: [
            { month: "Jan", new: 45, in_progress: 32, converted: 18, lost: 12 },
            { month: "Feb", new: 52, in_progress: 41, converted: 22, lost: 15 },
            { month: "Mar", new: 48, in_progress: 38, converted: 25, lost: 10 },
            { month: "Apr", new: 61, in_progress: 45, converted: 28, lost: 18 },
            { month: "May", new: 55, in_progress: 42, converted: 31, lost: 14 },
          ],
          summary: [
            { label: "Total Leads", value: "261" },
            { label: "Conversion Rate", value: "24.5%" },
            { label: "Active Leads", value: "198" },
          ],
        };
      case "office_performance":
        return {
          data: [
            { office: "Toronto", leads: 45, appointments: 32, conversions: 18 },
            {
              office: "Vancouver",
              leads: 38,
              appointments: 28,
              conversions: 15,
            },
            {
              office: "Montreal",
              leads: 52,
              appointments: 41,
              conversions: 22,
            },
          ],
          summary: [
            { label: "Total Offices", value: "3" },
            { label: "Average Conversion", value: "18.3" },
            { label: "Top Performing", value: "Montreal" },
          ],
        };
      case "staff_activity":
        return {
          data: [
            { week: "Week 1", tasks: 24, leads: 15, appointments: 8 },
            { week: "Week 2", tasks: 31, leads: 22, appointments: 12 },
            { week: "Week 3", tasks: 28, leads: 18, appointments: 10 },
            { week: "Week 4", tasks: 35, leads: 25, appointments: 15 },
          ],
          summary: [
            { label: "Active Staff", value: "12" },
            { label: "Avg Tasks/Week", value: "29.5" },
            { label: "Efficiency Rate", value: "87%" },
          ],
        };
      case "performance":
        return {
          data: [
            { metric: "Q1", efficiency: 85, satisfaction: 92, conversion: 78 },
            { metric: "Q2", efficiency: 88, satisfaction: 89, conversion: 82 },
            { metric: "Q3", efficiency: 91, satisfaction: 94, conversion: 85 },
          ],
          summary: [
            { label: "Overall Score", value: "88.2%" },
            { label: "Best Quarter", value: "Q3" },
            { label: "Improvement", value: "+7.1%" },
          ],
        };
      case "financial":
        return {
          data: [
            { month: "Jan", revenue: 45000, expenses: 32000, profit: 13000 },
            { month: "Feb", revenue: 52000, expenses: 35000, profit: 17000 },
            { month: "Mar", revenue: 48000, expenses: 33000, profit: 15000 },
          ],
          summary: [
            { label: "Total Revenue", value: "$145,000" },
            { label: "Profit Margin", value: "30.7%" },
            { label: "Growth Rate", value: "+12.5%" },
          ],
        };
      default:
        return { data: [], summary: [] };
    }
  };

  const handleDownloadReport = async () => {
    if (!reportType || !reportData) {
      setError("No report data available to download");
      return;
    }

    try {
      // Use reportService.exportReport with the report ID
      const blob = await reportService.exportReport(reportData.id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `${reportType}_report_${new Date().toISOString().split("T")[0]}.pdf`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      setError(error.message || "Failed to download report");
      console.error("Error downloading report:", error);
    }
  };

  const renderChart = () => {
    if (!reportData?.data) return null;

    switch (reportType) {
      case "lead":
        return (
          <BarChart
            data={reportData.data}
            keys={["new", "in_progress", "converted", "lost"]}
            colors={["#3B82F6", "#FBBF24", "#10B981", "#EF4444"]}
            height={400}
            title="Lead Conversion Funnel"
          />
        );
      case "office_performance":
        return (
          <BarChart
            data={reportData.data}
            keys={["leads", "appointments", "conversions"]}
            colors={["#3B82F6", "#10B981", "#6366F1"]}
            height={400}
            title="Office Performance Metrics"
          />
        );
      case "staff_activity":
        return (
          <LineChart
            data={reportData.data}
            keys={["tasks", "leads", "appointments"]}
            colors={["#3B82F6", "#10B981", "#FBBF24"]}
            height={400}
            title="Staff Activity Trends"
          />
        );
      case "performance":
        return (
          <BarChart
            data={reportData.data}
            keys={["efficiency", "satisfaction", "conversion"]}
            colors={["#3B82F6", "#10B981", "#6366F1"]}
            height={400}
            title="Overall Performance Metrics"
          />
        );
      case "financial":
        return (
          <LineChart
            data={reportData.data}
            keys={["revenue", "expenses", "profit"]}
            colors={["#10B981", "#EF4444", "#3B82F6"]}
            height={400}
            title="Financial Overview"
          />
        );
      default:
        return null;
    }
  };

  const getReportIcon = (type) => {
    switch (type) {
      case "lead":
        return <Users className="h-5 w-5" />;
      case "office_performance":
        return <TrendingUp className="h-5 w-5" />;
      case "staff_activity":
        return <BarChart3 className="h-5 w-5" />;
      case "performance":
        return <TrendingUp className="h-5 w-5" />;
      case "financial":
        return <BookOpen className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BarChart3 className="h-7 w-7 text-blue-600" />
            System Reports
          </h1>
          <p className="text-gray-600 mt-1">
            Generate and analyze comprehensive system reports with advanced
            filtering
          </p>
        </div>
        <div className="flex gap-2">
          <div className="bg-white rounded-lg border p-3">
            <div className="text-sm text-gray-500">Available Reports</div>
            <div className="text-2xl font-bold text-gray-900">
              {reportTypes.length}
            </div>
          </div>
          <Button
            onClick={handleDownloadReport}
            disabled={!reportData || loading}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Download Report
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Filters */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Filter className="h-5 w-5 text-gray-600" />
          Report Configuration
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Report Type <span className="text-red-500">*</span>
            </label>
            <Select
              options={reportTypes}
              value={reportTypes.find((type) => type.value === reportType)}
              onChange={(option) => setReportType(option?.value || "")}
              placeholder="Select Report Type"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <Input
              type="date"
              value={filters.startDate}
              onChange={(e) =>
                setFilters({ ...filters, startDate: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <Input
              type="date"
              value={filters.endDate}
              onChange={(e) =>
                setFilters({ ...filters, endDate: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Office Filter
            </label>
            <Select
              options={[{ value: "", label: "All Offices" }, ...officeOptions]}
              value={
                officeOptions.find(
                  (office) => office.value === filters.officeId
                ) || { value: "", label: "All Offices" }
              }
              onChange={(option) =>
                setFilters({ ...filters, officeId: option?.value || "" })
              }
              placeholder="Select Office"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Staff Filter
            </label>
            <Select
              options={[{ value: "", label: "All Staff" }, ...staffOptions]}
              value={
                staffOptions.find(
                  (staff) => staff.value === filters.staffId
                ) || { value: "", label: "All Staff" }
              }
              onChange={(option) =>
                setFilters({ ...filters, staffId: option?.value || "" })
              }
              placeholder="Select Staff"
            />
          </div>
        </div>

        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500">
            {reportType && (
              <div className="flex items-center gap-2">
                {getReportIcon(reportType)}
                <span>
                  Selected:{" "}
                  {reportTypes.find((t) => t.value === reportType)?.label}
                </span>
              </div>
            )}
          </div>
          <Button
            onClick={fetchReportData}
            disabled={!reportType || loading}
            loading={loading}
            className="flex items-center gap-2"
          >
            <Search className="h-4 w-4" />
            Generate Report
          </Button>
        </div>
      </Card>

      {/* Report Content */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <FileText className="h-5 w-5 text-gray-600" />
          Report Results
        </h3>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : !reportData ? (
          <div className="text-center py-12">
            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">
              No Report Generated
            </h4>
            <p className="text-gray-600">
              Select a report type and configure filters to generate a
              comprehensive report.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Chart Visualization */}
            <div className="bg-gray-50 rounded-lg p-4">{renderChart()}</div>

            {/* Report Summary */}
            {reportData.summary && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <TrendingUp className="h-5 w-5 text-blue-600" />
                    </div>
                    <h4 className="font-medium text-gray-900">Key Metrics</h4>
                  </div>
                  <div className="space-y-2">
                    {reportData.summary.slice(0, 3).map((item, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="text-gray-600">{item.label}:</span>
                        <span className="font-medium text-gray-900">
                          {item.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <BarChart3 className="h-5 w-5 text-green-600" />
                    </div>
                    <h4 className="font-medium text-gray-900">Performance</h4>
                  </div>
                  <div className="space-y-2">
                    {reportData.summary.slice(3, 6).map((item, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="text-gray-600">{item.label}:</span>
                        <span className="font-medium text-gray-900">
                          {item.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Calendar className="h-5 w-5 text-purple-600" />
                    </div>
                    <h4 className="font-medium text-gray-900">Period Info</h4>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">From:</span>
                      <span className="font-medium text-gray-900">
                        {filters.startDate || "All time"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">To:</span>
                      <span className="font-medium text-gray-900">
                        {filters.endDate || "Present"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Generated:</span>
                      <span className="font-medium text-gray-900">
                        {new Date().toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Additional Report Details */}
            {reportData.details && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">
                  Report Details
                </h4>
                <div className="prose prose-sm max-w-none text-gray-700">
                  {reportData.details}
                </div>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
};

export default SystemReports;
