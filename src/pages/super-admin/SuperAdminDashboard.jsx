import React, { useState, useEffect } from "react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import BarChart from "../../components/charts/BarChart";
import PieChart from "../../components/charts/PieChart";
import {
  Users,
  Building,
  Book,
  UserPlus,
  Activity,
  Calendar,
  TrendingUp,
  GraduationCap,
  Target,
  Briefcase,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  MapPin,
  Globe,
} from "lucide-react";
import useUserStore from "../../stores/userStore";
import useOfficeStore from "../../stores/officeStore";
import { REGIONS } from "../../utils/helpers";

const SuperAdminDashboard = () => {
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    filter: "", // 'branch', 'region', 'office', or ''
    filterValue: "", // region value or office ID
  });

  const {
    fetchSuperAdminDashboard,
    dashboard: dashboardData,
    loading,
  } = useUserStore();

  const { offices, fetchOffices } = useOfficeStore();

  useEffect(() => {
    // Load offices for the filter dropdown
    fetchOffices();
  }, []);

  useEffect(() => {
    // Fetch dashboard data whenever filters change
    fetchDashboardData();
  }, [filters]);

  const fetchDashboardData = async () => {
    try {
      const queryParams = {};

      if (filters.filter) {
        queryParams.filter = filters.filter;
        if (filters.filterValue) {
          queryParams.filterValue = filters.filterValue;
        }
      }

      await fetchSuperAdminDashboard(queryParams);
    } catch (err) {
      setError(err.message || "Failed to fetch dashboard data");
    }
  };

  const handleFilterChange = (filterType, value) => {
    setFilters({
      filter: filterType,
      filterValue: value,
    });
  };

  const clearFilters = () => {
    setFilters({
      filter: "",
      filterValue: "",
    });
  };

  const getFilterLabel = () => {
    if (!filters.filter) return "All Data";

    switch (filters.filter) {
      case "branch":
        return "Branch Offices Only";
      case "region":
        const region = REGIONS.find((r) => r.value === filters.filterValue);
        return `Region: ${region?.label || filters.filterValue}`;
      case "office":
        const office = offices?.find((o) => o.id === filters.filterValue);
        return `Office: ${office?.name || "Selected Office"}`;
      default:
        return "All Data";
    }
  };

  // Get unique regions from offices
  const getAvailableRegions = () => {
    if (!offices) return [];
    const regions = offices
      .map((office) => office.region)
      .filter((region) => region)
      .map((region) => REGIONS.find((r) => r.value === region))
      .filter((region) => region);

    return [...new Map(regions.map((r) => [r.value, r])).values()];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-3 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
        <div className="max-w-md mx-auto mt-20">
          <div className="bg-red-50 border border-red-200 text-red-800 px-6 py-4 rounded-xl shadow-sm">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium">Error loading dashboard</h3>
                <p className="mt-1 text-sm">{error}</p>
              </div>
            </div>
          </div>
          <Button
            onClick={fetchDashboardData}
            className="w-full mt-4 bg-red-600 hover:bg-red-700"
          >
            <Activity className="h-4 w-4 mr-2" />
            Retry Loading
          </Button>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-200 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Activity className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Data Available
          </h3>
          <p className="text-gray-500">
            Dashboard data is currently unavailable
          </p>
        </div>
      </div>
    );
  }

  const {
    totalOffices,
    totalStaff,
    totalStudents,
    totalCourses,
    totalLeads,
    totalUniversities,
    conversionRate,
    totalConversions,
    activeOffices,
    inactiveOffices,
    leadStatusBreakdown,
    officePerformance,
    recentActivities,
    monthlyGrowth,
  } = dashboardData;

  // Prepare chart data with updated status mapping
  const leadStatusChartData = Object.entries(leadStatusBreakdown || {}).map(
    ([status, count]) => {
      // Map status to more readable names for the new status values
      const statusDisplayNames = {
        lead: "Leads",
        opportunity: "Opportunities",
        project: "Projects",
        done: "Done",
        deal: "Deal",
      };

      return {
        name:
          statusDisplayNames[status] ||
          status.charAt(0).toUpperCase() + status.slice(1),
        value: count,
      };
    }
  );

  const officePerformanceChartData = (officePerformance || [])
    .slice(0, 6)
    .map((office) => ({
      name: office.officeName,
      leads: office.leadsCount,
      conversions: office.conversionsCount,
    }));

  const statsCards = [
    {
      title: "Total Offices",
      value: totalOffices,
      subtitle: `${activeOffices} active`,
      icon: Building,
      gradient: "from-blue-500 to-blue-600",
      bgGradient: "from-blue-50 to-blue-100",
      change: monthlyGrowth?.offices,
    },
    {
      title: "Total Staff",
      value: totalStaff,
      subtitle: "Active members",
      icon: Users,
      gradient: "from-emerald-500 to-emerald-600",
      bgGradient: "from-emerald-50 to-emerald-100",
      change: "+5.2%",
    },
    {
      title: "Total Students",
      value: totalStudents,
      subtitle: "Registered users",
      icon: GraduationCap,
      gradient: "from-purple-500 to-purple-600",
      bgGradient: "from-purple-50 to-purple-100",
      change: "+12.3%",
    },
    {
      title: "Total Courses",
      value: totalCourses,
      subtitle: "Available programs",
      icon: Book,
      gradient: "from-orange-500 to-orange-600",
      bgGradient: "from-orange-50 to-orange-100",
      change: "+2.1%",
    },
    {
      title: "Total Leads",
      value: totalLeads,
      subtitle: "All inquiries",
      icon: UserPlus,
      gradient: "from-pink-500 to-pink-600",
      bgGradient: "from-pink-50 to-pink-100",
      change: monthlyGrowth?.leads,
    },
    {
      title: "Universities",
      value: totalUniversities,
      subtitle: "Partner institutions",
      icon: Briefcase,
      gradient: "from-cyan-500 to-cyan-600",
      bgGradient: "from-cyan-50 to-cyan-100",
      change: "+1.8%",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="p-6 space-y-8">
        {/* Header with glassmorphism effect */}
        <div className="bg-white/70 backdrop-blur-lg border border-white/20 rounded-2xl p-6 shadow-xl">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                  <Activity className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Super Admin Dashboard
                </h1>
              </div>
              <p className="text-gray-600 text-lg">
                Comprehensive overview of system activities and performance
                metrics
              </p>

              {/* Filter Display */}
              <div className="mt-3 flex items-center gap-2">
                <span className="text-sm text-gray-500">Viewing:</span>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  {getFilterLabel()}
                </span>
                {filters.filter && (
                  <Button
                    onClick={clearFilters}
                    size="sm"
                    variant="outline"
                    className="text-xs px-2 py-1"
                  >
                    Clear Filter
                  </Button>
                )}
              </div>
            </div>

            <div className="flex gap-4">
              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-4 text-white shadow-lg min-w-[140px]">
                <div className="text-sm opacity-90">Conversion Rate</div>
                <div className="text-3xl font-bold">{conversionRate}%</div>
                <div className="flex items-center gap-1 text-sm opacity-90">
                  <ArrowUpRight className="h-3 w-3" />
                  {monthlyGrowth?.conversions}
                </div>
              </div>
              <Button
                onClick={fetchDashboardData}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl shadow-lg transition-all duration-200 hover:shadow-xl"
              >
                <Activity className="h-4 w-4 mr-2" />
                Refresh Stats
              </Button>
            </div>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="bg-white/80 backdrop-blur-lg border border-white/20 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <Filter className="h-5 w-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Dashboard Filters
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Filter Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter Type
              </label>
              <select
                value={filters.filter}
                onChange={(e) => {
                  const newFilter = e.target.value;
                  setFilters({
                    filter: newFilter,
                    filterValue: "",
                  });
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">All Data</option>
                <option value="branch">Branch Offices Only</option>
                <option value="region">Filter by Region</option>
                <option value="office">Specific Office</option>
              </select>
            </div>

            {/* Region Filter */}
            {filters.filter === "region" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Region
                </label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <select
                    value={filters.filterValue}
                    onChange={(e) =>
                      handleFilterChange("region", e.target.value)
                    }
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="">Select Region</option>
                    {getAvailableRegions().map((region) => (
                      <option key={region.value} value={region.value}>
                        {region.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Office Filter */}
            {filters.filter === "office" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Office
                </label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <select
                    value={filters.filterValue}
                    onChange={(e) =>
                      handleFilterChange("office", e.target.value)
                    }
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="">Select Office</option>
                    {(offices || []).map((office) => (
                      <option key={office.id} value={office.id}>
                        {office.name} - {office.address?.city}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Apply Button */}
            <div className="flex items-end">
              <Button
                onClick={fetchDashboardData}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                Apply Filters
              </Button>
            </div>
          </div>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {statsCards.map((stat, index) => (
            <div
              key={index}
              className="group relative bg-white/80 backdrop-blur-lg border border-white/20 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${stat.bgGradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-2xl`}
              ></div>
              <div className="relative">
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={`p-3 bg-gradient-to-br ${stat.gradient} rounded-xl shadow-lg`}
                  >
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                  {stat.change && (
                    <div
                      className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                        stat.change.startsWith("+")
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {stat.change.startsWith("+") ? (
                        <ArrowUpRight className="h-3 w-3" />
                      ) : (
                        <ArrowDownRight className="h-3 w-3" />
                      )}
                      {stat.change}
                    </div>
                  )}
                </div>
                <div className="space-y-1">
                  <h3 className="text-3xl font-bold text-gray-900">
                    {stat.value?.toLocaleString()}
                  </h3>
                  <p className="text-sm font-medium text-gray-700">
                    {stat.title}
                  </p>
                  <p className="text-xs text-gray-500">{stat.subtitle}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* NEW: Lead Status Overview Cards */}
        <div className="bg-white/80 backdrop-blur-lg border border-white/20 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl">
              <Target className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">
              Lead Status Overview
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700">Leads</p>
                  <p className="text-2xl font-bold text-blue-900">
                    {leadStatusBreakdown?.lead || 0}
                  </p>
                  <p className="text-xs text-blue-600">
                    {totalLeads > 0
                      ? (
                          (leadStatusBreakdown?.lead / totalLeads) *
                          100
                        ).toFixed(1)
                      : 0}
                    % of total
                  </p>
                </div>
                <div className="p-2 bg-blue-500 rounded-lg">
                  <UserPlus className="h-5 w-5 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-4 border border-yellow-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-700">
                    Opportunities
                  </p>
                  <p className="text-2xl font-bold text-yellow-900">
                    {leadStatusBreakdown?.opportunity || 0}
                  </p>
                  <p className="text-xs text-yellow-600">
                    {totalLeads > 0
                      ? (
                          (leadStatusBreakdown?.opportunity / totalLeads) *
                          100
                        ).toFixed(1)
                      : 0}
                    % of total
                  </p>
                </div>
                <div className="p-2 bg-yellow-500 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-700">
                    Projects
                  </p>
                  <p className="text-2xl font-bold text-purple-900">
                    {leadStatusBreakdown?.project || 0}
                  </p>
                  <p className="text-xs text-purple-600">
                    {totalLeads > 0
                      ? (
                          (leadStatusBreakdown?.project / totalLeads) *
                          100
                        ).toFixed(1)
                      : 0}
                    % of total
                  </p>
                </div>
                <div className="p-2 bg-purple-500 rounded-lg">
                  <Briefcase className="h-5 w-5 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-700">Done</p>
                  <p className="text-2xl font-bold text-green-900">
                    {leadStatusBreakdown?.done || 0}
                  </p>
                  <p className="text-xs text-green-600">
                    {totalLeads > 0
                      ? (
                          (leadStatusBreakdown?.done / totalLeads) *
                          100
                        ).toFixed(1)
                      : 0}
                    % of total
                  </p>
                </div>
                <div className="p-2 bg-green-500 rounded-lg">
                  <Target className="h-5 w-5 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl p-4 border border-pink-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-pink-700">Deals</p>
                  <p className="text-2xl font-bold text-pink-900">
                    {leadStatusBreakdown?.deal || 0}
                  </p>
                  <p className="text-xs text-pink-600">
                    {totalLeads > 0
                      ? (
                          ((leadStatusBreakdown?.deal || 0) / totalLeads) *
                          100
                        ).toFixed(1)
                      : 0}
                    % of total
                  </p>
                </div>
                <div className="p-2 bg-pink-500 rounded-lg">
                  <UserPlus className="h-5 w-5 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Metrics with better layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white/80 backdrop-blur-lg border border-white/20 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                Lead Conversions
              </h3>
              <div className="p-2 bg-gradient-to-br from-green-500 to-green-600 rounded-xl">
                <Target className="h-5 w-5 text-white" />
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600 font-medium">
                  Total Conversions
                </span>
                <span className="text-2xl font-bold text-gray-900">
                  {totalConversions}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600 font-medium">
                  Conversion Rate
                </span>
                <span className="text-2xl font-bold text-green-600">
                  {conversionRate}%
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600 font-medium">
                  Monthly Growth
                </span>
                <span className="text-lg font-bold text-blue-600">
                  {monthlyGrowth?.conversions}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-lg border border-white/20 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Office Status</h3>
              <div className="p-2 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl">
                <Building className="h-5 w-5 text-white" />
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600 font-medium">
                  Active Offices
                </span>
                <span className="text-2xl font-bold text-green-600">
                  {activeOffices}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600 font-medium">
                  Inactive Offices
                </span>
                <span className="text-2xl font-bold text-red-600">
                  {inactiveOffices}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600 font-medium">
                  Utilization Rate
                </span>
                <span className="text-lg font-bold text-blue-600">
                  {totalOffices > 0
                    ? Math.round((activeOffices / totalOffices) * 100)
                    : 0}
                  %
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-lg border border-white/20 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">System Health</h3>
              <div className="p-2 bg-gradient-to-br from-green-500 to-green-600 rounded-xl">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600 font-medium">Active Users</span>
                <span className="text-2xl font-bold text-gray-900">
                  {(totalStudents + totalStaff)?.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600 font-medium">System Load</span>
                <span className="text-lg font-bold text-green-600">Normal</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600 font-medium">Uptime</span>
                <span className="text-lg font-bold text-green-600">99.9%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Charts Section */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="bg-white/80 backdrop-blur-lg border border-white/20 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
                <Activity className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">
                Lead Status Distribution
              </h3>
            </div>
            {leadStatusChartData.length > 0 ? (
              <PieChart
                data={leadStatusChartData}
                colors={["#3B82F6", "#FBBF24", "#8B5CF6", "#10B981"]}
                height={300}
              />
            ) : (
              <div className="flex items-center justify-center h-64 bg-gray-50/50 rounded-xl">
                <div className="text-center">
                  <Activity className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">
                    No lead data available
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white/80 backdrop-blur-lg border border-white/20 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl">
                <Building className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">
                Office Performance
              </h3>
            </div>
            {officePerformanceChartData.length > 0 ? (
              <div className="bg-gray-50/50 rounded-xl p-4">
                <BarChart
                  data={officePerformanceChartData}
                  keys={["leads", "conversions"]}
                  colors={["#3B82F6", "#10B981"]}
                  height={300}
                />
              </div>
            ) : (
              <div className="flex items-center justify-center h-64 bg-gray-50/50 rounded-xl">
                <div className="text-center">
                  <Building className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">
                    No office performance data available
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Recent Activities */}
        <div className="bg-white/80 backdrop-blur-lg border border-white/20 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl">
              <Calendar className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">
              Recent Activities
            </h3>
          </div>

          {recentActivities && recentActivities.length > 0 ? (
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {recentActivities.map((activity, index) => (
                <div
                  key={activity.id}
                  className="group flex items-start gap-4 p-4 bg-gray-50/50 hover:bg-gray-50 rounded-xl transition-all duration-200 hover:shadow-md"
                >
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-sm group-hover:shadow-md transition-shadow">
                    <Activity className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 leading-relaxed">
                      {activity.description}
                    </p>
                    <p className="text-xs text-gray-500 mt-1 font-medium">
                      {new Date(activity.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      #{String(index + 1).padStart(2, "0")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50/30 rounded-xl">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <Activity className="h-8 w-8 text-gray-400" />
              </div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">
                No Recent Activities
              </h4>
              <p className="text-gray-500">
                System activities will appear here when available.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;

// import React, { useState, useEffect } from "react";
// import Card from "../../components/ui/Card";
// import Button from "../../components/ui/Button";
// import BarChart from "../../components/charts/BarChart";
// import PieChart from "../../components/charts/PieChart";
// import {
//   Users,
//   Building,
//   Book,
//   UserPlus,
//   Activity,
//   Calendar,
//   TrendingUp,
//   GraduationCap,
//   Target,
//   Briefcase,
//   ArrowUpRight,
//   ArrowDownRight,
//   Filter,
//   MapPin,
//   Globe,
// } from "lucide-react";
// import useUserStore from "../../stores/userStore";
// import useOfficeStore from "../../stores/officeStore";
// import { REGIONS } from "../../utils/helpers";

// const SuperAdminDashboard = () => {
//   const [error, setError] = useState("");
//   const [filters, setFilters] = useState({
//     filter: "", // 'branch', 'region', 'office', or ''
//     filterValue: "", // region value or office ID
//   });

//   const {
//     fetchSuperAdminDashboard,
//     dashboard: dashboardData,
//     loading,
//   } = useUserStore();

//   const { offices, fetchOffices } = useOfficeStore();

//   useEffect(() => {
//     // Load offices for the filter dropdown
//     fetchOffices();
//   }, []);

//   useEffect(() => {
//     // Fetch dashboard data whenever filters change
//     fetchDashboardData();
//   }, [filters]);

//   const fetchDashboardData = async () => {
//     try {
//       const queryParams = {};

//       if (filters.filter) {
//         queryParams.filter = filters.filter;
//         if (filters.filterValue) {
//           queryParams.filterValue = filters.filterValue;
//         }
//       }

//       await fetchSuperAdminDashboard(queryParams);
//     } catch (err) {
//       setError(err.message || "Failed to fetch dashboard data");
//     }
//   };

//   const handleFilterChange = (filterType, value) => {
//     setFilters({
//       filter: filterType,
//       filterValue: value,
//     });
//   };

//   const clearFilters = () => {
//     setFilters({
//       filter: "",
//       filterValue: "",
//     });
//   };

//   const getFilterLabel = () => {
//     if (!filters.filter) return "All Data";

//     switch (filters.filter) {
//       case "branch":
//         return "Branch Offices Only";
//       case "region":
//         const region = REGIONS.find((r) => r.value === filters.filterValue);
//         return `Region: ${region?.label || filters.filterValue}`;
//       case "office":
//         const office = offices?.find((o) => o.id === filters.filterValue);
//         return `Office: ${office?.name || "Selected Office"}`;
//       default:
//         return "All Data";
//     }
//   };

//   // Get unique regions from offices
//   const getAvailableRegions = () => {
//     if (!offices) return [];
//     const regions = offices
//       .map((office) => office.region)
//       .filter((region) => region)
//       .map((region) => REGIONS.find((r) => r.value === region))
//       .filter((region) => region);

//     return [...new Map(regions.map((r) => [r.value, r])).values()];
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-3 border-blue-600 mx-auto"></div>
//           <p className="text-gray-600 mt-4 font-medium">Loading dashboard...</p>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
//         <div className="max-w-md mx-auto mt-20">
//           <div className="bg-red-50 border border-red-200 text-red-800 px-6 py-4 rounded-xl shadow-sm">
//             <div className="flex items-center">
//               <div className="flex-shrink-0">
//                 <svg
//                   className="h-5 w-5 text-red-400"
//                   viewBox="0 0 20 20"
//                   fill="currentColor"
//                 >
//                   <path
//                     fillRule="evenodd"
//                     d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
//                     clipRule="evenodd"
//                   />
//                 </svg>
//               </div>
//               <div className="ml-3">
//                 <h3 className="text-sm font-medium">Error loading dashboard</h3>
//                 <p className="mt-1 text-sm">{error}</p>
//               </div>
//             </div>
//           </div>
//           <Button
//             onClick={fetchDashboardData}
//             className="w-full mt-4 bg-red-600 hover:bg-red-700"
//           >
//             <Activity className="h-4 w-4 mr-2" />
//             Retry Loading
//           </Button>
//         </div>
//       </div>
//     );
//   }

//   if (!dashboardData) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
//         <div className="text-center">
//           <div className="w-16 h-16 bg-gray-200 rounded-xl flex items-center justify-center mx-auto mb-4">
//             <Activity className="h-8 w-8 text-gray-400" />
//           </div>
//           <h3 className="text-lg font-medium text-gray-900 mb-2">
//             No Data Available
//           </h3>
//           <p className="text-gray-500">
//             Dashboard data is currently unavailable
//           </p>
//         </div>
//       </div>
//     );
//   }

//   const {
//     totalOffices,
//     totalStaff,
//     totalStudents,
//     totalCourses,
//     totalLeads,
//     totalUniversities,
//     conversionRate,
//     totalConversions,
//     activeOffices,
//     inactiveOffices,
//     leadStatusBreakdown,
//     officePerformance,
//     recentActivities,
//     monthlyGrowth,
//   } = dashboardData;

//   // Prepare chart data
//   const leadStatusChartData = Object.entries(leadStatusBreakdown || {}).map(
//     ([status, count]) => ({
//       name: status.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase()),
//       value: count,
//     })
//   );

//   const officePerformanceChartData = (officePerformance || [])
//     .slice(0, 6)
//     .map((office) => ({
//       name: office.officeName,
//       leads: office.leadsCount,
//       conversions: office.conversionsCount,
//     }));

//   const statsCards = [
//     {
//       title: "Total Offices",
//       value: totalOffices,
//       subtitle: `${activeOffices} active`,
//       icon: Building,
//       gradient: "from-blue-500 to-blue-600",
//       bgGradient: "from-blue-50 to-blue-100",
//       change: monthlyGrowth?.offices,
//     },
//     {
//       title: "Total Staff",
//       value: totalStaff,
//       subtitle: "Active members",
//       icon: Users,
//       gradient: "from-emerald-500 to-emerald-600",
//       bgGradient: "from-emerald-50 to-emerald-100",
//       change: "+5.2%",
//     },
//     {
//       title: "Total Students",
//       value: totalStudents,
//       subtitle: "Registered users",
//       icon: GraduationCap,
//       gradient: "from-purple-500 to-purple-600",
//       bgGradient: "from-purple-50 to-purple-100",
//       change: "+12.3%",
//     },
//     {
//       title: "Total Courses",
//       value: totalCourses,
//       subtitle: "Available programs",
//       icon: Book,
//       gradient: "from-orange-500 to-orange-600",
//       bgGradient: "from-orange-50 to-orange-100",
//       change: "+2.1%",
//     },
//     {
//       title: "Total Leads",
//       value: totalLeads,
//       subtitle: "All inquiries",
//       icon: UserPlus,
//       gradient: "from-pink-500 to-pink-600",
//       bgGradient: "from-pink-50 to-pink-100",
//       change: monthlyGrowth?.leads,
//     },
//     {
//       title: "Universities",
//       value: totalUniversities,
//       subtitle: "Partner institutions",
//       icon: Briefcase,
//       gradient: "from-cyan-500 to-cyan-600",
//       bgGradient: "from-cyan-50 to-cyan-100",
//       change: "+1.8%",
//     },
//   ];

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
//       <div className="p-6 space-y-8">
//         {/* Header with glassmorphism effect */}
//         <div className="bg-white/70 backdrop-blur-lg border border-white/20 rounded-2xl p-6 shadow-xl">
//           <div className="flex justify-between items-start">
//             <div>
//               <div className="flex items-center gap-3 mb-2">
//                 <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
//                   <Activity className="h-6 w-6 text-white" />
//                 </div>
//                 <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
//                   Super Admin Dashboard
//                 </h1>
//               </div>
//               <p className="text-gray-600 text-lg">
//                 Comprehensive overview of system activities and performance
//                 metrics
//               </p>

//               {/* Filter Display */}
//               <div className="mt-3 flex items-center gap-2">
//                 <span className="text-sm text-gray-500">Viewing:</span>
//                 <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
//                   {getFilterLabel()}
//                 </span>
//                 {filters.filter && (
//                   <Button
//                     onClick={clearFilters}
//                     size="sm"
//                     variant="outline"
//                     className="text-xs px-2 py-1"
//                   >
//                     Clear Filter
//                   </Button>
//                 )}
//               </div>
//             </div>

//             <div className="flex gap-4">
//               <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-4 text-white shadow-lg min-w-[140px]">
//                 <div className="text-sm opacity-90">Conversion Rate</div>
//                 <div className="text-3xl font-bold">{conversionRate}%</div>
//                 <div className="flex items-center gap-1 text-sm opacity-90">
//                   <ArrowUpRight className="h-3 w-3" />
//                   {monthlyGrowth?.conversions}
//                 </div>
//               </div>
//               <Button
//                 onClick={fetchDashboardData}
//                 className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl shadow-lg transition-all duration-200 hover:shadow-xl"
//               >
//                 <Activity className="h-4 w-4 mr-2" />
//                 Refresh Stats
//               </Button>
//             </div>
//           </div>
//         </div>

//         {/* Filter Controls */}
//         <div className="bg-white/80 backdrop-blur-lg border border-white/20 rounded-2xl p-6 shadow-lg">
//           <div className="flex items-center gap-3 mb-4">
//             <Filter className="h-5 w-5 text-gray-600" />
//             <h3 className="text-lg font-semibold text-gray-900">
//               Dashboard Filters
//             </h3>
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//             {/* Filter Type Selection */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Filter Type
//               </label>
//               <select
//                 value={filters.filter}
//                 onChange={(e) => {
//                   const newFilter = e.target.value;
//                   setFilters({
//                     filter: newFilter,
//                     filterValue: "",
//                   });
//                 }}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
//               >
//                 <option value="">All Data</option>
//                 <option value="branch">Branch Offices Only</option>
//                 <option value="region">Filter by Region</option>
//                 <option value="office">Specific Office</option>
//               </select>
//             </div>

//             {/* Region Filter */}
//             {filters.filter === "region" && (
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Select Region
//                 </label>
//                 <div className="relative">
//                   <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
//                   <select
//                     value={filters.filterValue}
//                     onChange={(e) =>
//                       handleFilterChange("region", e.target.value)
//                     }
//                     className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
//                   >
//                     <option value="">Select Region</option>
//                     {getAvailableRegions().map((region) => (
//                       <option key={region.value} value={region.value}>
//                         {region.label}
//                       </option>
//                     ))}
//                   </select>
//                 </div>
//               </div>
//             )}

//             {/* Office Filter */}
//             {filters.filter === "office" && (
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Select Office
//                 </label>
//                 <div className="relative">
//                   <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
//                   <select
//                     value={filters.filterValue}
//                     onChange={(e) =>
//                       handleFilterChange("office", e.target.value)
//                     }
//                     className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
//                   >
//                     <option value="">Select Office</option>
//                     {(offices || []).map((office) => (
//                       <option key={office.id} value={office.id}>
//                         {office.name} - {office.address?.city}
//                       </option>
//                     ))}
//                   </select>
//                 </div>
//               </div>
//             )}

//             {/* Apply Button */}
//             <div className="flex items-end">
//               <Button
//                 onClick={fetchDashboardData}
//                 className="w-full bg-blue-600 hover:bg-blue-700 text-white"
//               >
//                 Apply Filters
//               </Button>
//             </div>
//           </div>
//         </div>

//         {/* Enhanced Stats Cards */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//           {statsCards.map((stat, index) => (
//             <div
//               key={index}
//               className="group relative bg-white/80 backdrop-blur-lg border border-white/20 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
//             >
//               <div
//                 className={`absolute inset-0 bg-gradient-to-br ${stat.bgGradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-2xl`}
//               ></div>
//               <div className="relative">
//                 <div className="flex items-start justify-between mb-4">
//                   <div
//                     className={`p-3 bg-gradient-to-br ${stat.gradient} rounded-xl shadow-lg`}
//                   >
//                     <stat.icon className="h-6 w-6 text-white" />
//                   </div>
//                   {stat.change && (
//                     <div
//                       className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
//                         stat.change.startsWith("+")
//                           ? "bg-green-100 text-green-700"
//                           : "bg-red-100 text-red-700"
//                       }`}
//                     >
//                       {stat.change.startsWith("+") ? (
//                         <ArrowUpRight className="h-3 w-3" />
//                       ) : (
//                         <ArrowDownRight className="h-3 w-3" />
//                       )}
//                       {stat.change}
//                     </div>
//                   )}
//                 </div>
//                 <div className="space-y-1">
//                   <h3 className="text-3xl font-bold text-gray-900">
//                     {stat.value?.toLocaleString()}
//                   </h3>
//                   <p className="text-sm font-medium text-gray-700">
//                     {stat.title}
//                   </p>
//                   <p className="text-xs text-gray-500">{stat.subtitle}</p>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>

//         {/* Performance Metrics with better layout */}
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//           <div className="bg-white/80 backdrop-blur-lg border border-white/20 rounded-2xl p-6 shadow-lg">
//             <div className="flex items-center justify-between mb-6">
//               <h3 className="text-xl font-bold text-gray-900">
//                 Lead Conversions
//               </h3>
//               <div className="p-2 bg-gradient-to-br from-green-500 to-green-600 rounded-xl">
//                 <Target className="h-5 w-5 text-white" />
//               </div>
//             </div>
//             <div className="space-y-4">
//               <div className="flex justify-between items-center py-2 border-b border-gray-100">
//                 <span className="text-gray-600 font-medium">
//                   Total Conversions
//                 </span>
//                 <span className="text-2xl font-bold text-gray-900">
//                   {totalConversions}
//                 </span>
//               </div>
//               <div className="flex justify-between items-center py-2 border-b border-gray-100">
//                 <span className="text-gray-600 font-medium">
//                   Conversion Rate
//                 </span>
//                 <span className="text-2xl font-bold text-green-600">
//                   {conversionRate}%
//                 </span>
//               </div>
//               <div className="flex justify-between items-center py-2">
//                 <span className="text-gray-600 font-medium">
//                   Monthly Growth
//                 </span>
//                 <span className="text-lg font-bold text-blue-600">
//                   {monthlyGrowth?.conversions}
//                 </span>
//               </div>
//             </div>
//           </div>

//           <div className="bg-white/80 backdrop-blur-lg border border-white/20 rounded-2xl p-6 shadow-lg">
//             <div className="flex items-center justify-between mb-6">
//               <h3 className="text-xl font-bold text-gray-900">Office Status</h3>
//               <div className="p-2 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl">
//                 <Building className="h-5 w-5 text-white" />
//               </div>
//             </div>
//             <div className="space-y-4">
//               <div className="flex justify-between items-center py-2 border-b border-gray-100">
//                 <span className="text-gray-600 font-medium">
//                   Active Offices
//                 </span>
//                 <span className="text-2xl font-bold text-green-600">
//                   {activeOffices}
//                 </span>
//               </div>
//               <div className="flex justify-between items-center py-2 border-b border-gray-100">
//                 <span className="text-gray-600 font-medium">
//                   Inactive Offices
//                 </span>
//                 <span className="text-2xl font-bold text-red-600">
//                   {inactiveOffices}
//                 </span>
//               </div>
//               <div className="flex justify-between items-center py-2">
//                 <span className="text-gray-600 font-medium">
//                   Utilization Rate
//                 </span>
//                 <span className="text-lg font-bold text-blue-600">
//                   {totalOffices > 0
//                     ? Math.round((activeOffices / totalOffices) * 100)
//                     : 0}
//                   %
//                 </span>
//               </div>
//             </div>
//           </div>

//           <div className="bg-white/80 backdrop-blur-lg border border-white/20 rounded-2xl p-6 shadow-lg">
//             <div className="flex items-center justify-between mb-6">
//               <h3 className="text-xl font-bold text-gray-900">System Health</h3>
//               <div className="p-2 bg-gradient-to-br from-green-500 to-green-600 rounded-xl">
//                 <TrendingUp className="h-5 w-5 text-white" />
//               </div>
//             </div>
//             <div className="space-y-4">
//               <div className="flex justify-between items-center py-2 border-b border-gray-100">
//                 <span className="text-gray-600 font-medium">Active Users</span>
//                 <span className="text-2xl font-bold text-gray-900">
//                   {(totalStudents + totalStaff)?.toLocaleString()}
//                 </span>
//               </div>
//               <div className="flex justify-between items-center py-2 border-b border-gray-100">
//                 <span className="text-gray-600 font-medium">System Load</span>
//                 <span className="text-lg font-bold text-green-600">Normal</span>
//               </div>
//               <div className="flex justify-between items-center py-2">
//                 <span className="text-gray-600 font-medium">Uptime</span>
//                 <span className="text-lg font-bold text-green-600">99.9%</span>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Enhanced Charts Section */}
//         <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
//           <div className="bg-white/80 backdrop-blur-lg border border-white/20 rounded-2xl p-6 shadow-lg">
//             <div className="flex items-center gap-3 mb-6">
//               <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
//                 <Activity className="h-5 w-5 text-white" />
//               </div>
//               <h3 className="text-xl font-bold text-gray-900">
//                 Lead Status Distribution
//               </h3>
//             </div>
//             {leadStatusChartData.length > 0 ? (
//               <PieChart
//                 data={leadStatusChartData}
//                 colors={["#3B82F6", "#FBBF24", "#10B981", "#EF4444"]}
//                 height={300}
//               />
//             ) : (
//               <div className="flex items-center justify-center h-64 bg-gray-50/50 rounded-xl">
//                 <div className="text-center">
//                   <Activity className="h-12 w-12 text-gray-300 mx-auto mb-3" />
//                   <p className="text-gray-500 font-medium">
//                     No lead data available
//                   </p>
//                 </div>
//               </div>
//             )}
//           </div>

//           <div className="bg-white/80 backdrop-blur-lg border border-white/20 rounded-2xl p-6 shadow-lg">
//             <div className="flex items-center gap-3 mb-6">
//               <div className="p-2 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl">
//                 <Building className="h-5 w-5 text-white" />
//               </div>
//               <h3 className="text-xl font-bold text-gray-900">
//                 Office Performance
//               </h3>
//             </div>
//             {officePerformanceChartData.length > 0 ? (
//               <div className="bg-gray-50/50 rounded-xl p-4">
//                 <BarChart
//                   data={officePerformanceChartData}
//                   keys={["leads", "conversions"]}
//                   colors={["#3B82F6", "#10B981"]}
//                   height={300}
//                 />
//               </div>
//             ) : (
//               <div className="flex items-center justify-center h-64 bg-gray-50/50 rounded-xl">
//                 <div className="text-center">
//                   <Building className="h-12 w-12 text-gray-300 mx-auto mb-3" />
//                   <p className="text-gray-500 font-medium">
//                     No office performance data available
//                   </p>
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Enhanced Recent Activities */}
//         <div className="bg-white/80 backdrop-blur-lg border border-white/20 rounded-2xl p-6 shadow-lg">
//           <div className="flex items-center gap-3 mb-6">
//             <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl">
//               <Calendar className="h-5 w-5 text-white" />
//             </div>
//             <h3 className="text-xl font-bold text-gray-900">
//               Recent Activities
//             </h3>
//           </div>

//           {recentActivities && recentActivities.length > 0 ? (
//             <div className="space-y-3 max-h-80 overflow-y-auto">
//               {recentActivities.map((activity, index) => (
//                 <div
//                   key={activity.id}
//                   className="group flex items-start gap-4 p-4 bg-gray-50/50 hover:bg-gray-50 rounded-xl transition-all duration-200 hover:shadow-md"
//                 >
//                   <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-sm group-hover:shadow-md transition-shadow">
//                     <Activity className="h-4 w-4 text-white" />
//                   </div>
//                   <div className="flex-1 min-w-0">
//                     <p className="text-sm font-medium text-gray-900 leading-relaxed">
//                       {activity.description}
//                     </p>
//                     <p className="text-xs text-gray-500 mt-1 font-medium">
//                       {new Date(activity.createdAt).toLocaleString()}
//                     </p>
//                   </div>
//                   <div className="flex-shrink-0">
//                     <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
//                       #{String(index + 1).padStart(2, "0")}
//                     </span>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           ) : (
//             <div className="text-center py-12 bg-gray-50/30 rounded-xl">
//               <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
//                 <Activity className="h-8 w-8 text-gray-400" />
//               </div>
//               <h4 className="text-lg font-medium text-gray-900 mb-2">
//                 No Recent Activities
//               </h4>
//               <p className="text-gray-500">
//                 System activities will appear here when available.
//               </p>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default SuperAdminDashboard;
