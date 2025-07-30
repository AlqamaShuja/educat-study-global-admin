import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  Filter,
  Search,
  Plus,
  // Download, // Commented out for admin
  RefreshCw,
  BarChart3,
  Calendar,
  User,
  CheckCircle,
  Clock,
  AlertTriangle,
  TrendingUp,
  Users,
  Building,
  Eye,
  EyeOff,
  Award,
  Globe,
  Target,
  Activity,
  Database,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import useApplicationStore from "../../stores/applicationStore";
import {
  STATUS_OPTIONS,
  STAGE_OPTIONS,
} from "../../constants/applicationConstants";
import ApplicationsTable from "../../components/applications/ApplicationsTable";
import ApplicationDetailModal from "../../components/applications/ApplicationDetailModal";
// import ApplicationReviewModal from '../../components/applications/ApplicationReviewModal'; // Commented out for admin
// import Modal from '../../components/ui/Modal'; // Commented out for admin
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";

const ApplicationsPage = () => {
  const navigate = useNavigate();
  const {
    applications,
    statistics,
    loading,
    error,
    filters,
    fetchAllApplications,
    fetchStatistics,
    // updateApplication, // Commented out for admin
    // deleteApplication, // Commented out for admin
    setFilters,
  } = useApplicationStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [showCharts, setShowCharts] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  // const [showReviewModal, setShowReviewModal] = useState(false); // Commented out for admin
  // const [showDeleteModal, setShowDeleteModal] = useState(false); // Commented out for admin

  useEffect(() => {
    fetchAllApplications();
    fetchStatistics();
  }, [fetchAllApplications, fetchStatistics]);

  const handleView = (application) => {
    setSelectedApplication(application);
    setShowDetailModal(true);
  };

  // const handleEdit = (application) => {
  //   setSelectedApplication(application);
  //   setShowReviewModal(true);
  // };

  // const handleDelete = (application) => {
  //   setSelectedApplication(application);
  //   setShowDeleteModal(true);
  // };

  // const confirmDelete = async () => {
  //   if (selectedApplication) {
  //     try {
  //       await deleteApplication(selectedApplication.id);
  //       setShowDeleteModal(false);
  //       setSelectedApplication(null);
  //     } catch (error) {
  //       console.error('Failed to delete application:', error);
  //     }
  //   }
  // };

  // const handleUpdate = async (applicationId, updateData) => {
  //   try {
  //     await updateApplication(applicationId, updateData);
  //   } catch (error) {
  //     console.error('Failed to update application:', error);
  //   }
  // };

  const handleFilterChange = (key, value) => {
    setFilters({ [key]: value });
  };

  const clearFilters = () => {
    setFilters({ status: "", stage: "" });
    setSearchTerm("");
  };

  const filteredApplications = applications.filter((app) => {
    const matchesSearch =
      searchTerm === "" ||
      app.student?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.student?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.consultant?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = !filters.status || app.status === filters.status;
    const matchesStage = !filters.stage || app.stage === filters.stage;

    return matchesSearch && matchesStatus && matchesStage;
  });

  // These functions are no longer needed since we use statistics data directly
  // const getStatusCount = (status) => {
  //   return applications.filter(app => app.status === status).length;
  // };

  // const getStageCount = (stage) => {
  //   return applications.filter(app => app.stage === stage).length;
  // };

  const statusStats = [
    {
      label: "Total",
      count: statistics?.total || applications.length,
      color: "from-slate-50 to-gray-100",
      textColor: "text-gray-700",
      icon: Database,
      iconColor: "text-gray-500",
    },
    {
      label: "Draft",
      count:
        statistics?.byStatus?.find((s) => s.status === "draft")?.count || 0,
      color: "from-gray-50 to-slate-100",
      textColor: "text-gray-700",
      icon: FileText,
      iconColor: "text-gray-500",
    },
    {
      label: "In Review",
      count:
        statistics?.byStatus?.find((s) => s.status === "in_review")?.count || 0,
      color: "from-blue-50 to-blue-100",
      textColor: "text-blue-700",
      icon: Clock,
      iconColor: "text-blue-500",
    },
    {
      label: "Submitted",
      count:
        statistics?.byStatus?.find((s) => s.status === "submitted")?.count || 0,
      color: "from-amber-50 to-yellow-100",
      textColor: "text-amber-700",
      icon: TrendingUp,
      iconColor: "text-amber-500",
    },
    {
      label: "Offers",
      count:
        statistics?.byStatus?.find((s) => s.status === "offers_received")
          ?.count || 0,
      color: "from-purple-50 to-purple-100",
      textColor: "text-purple-700",
      icon: Award,
      iconColor: "text-purple-500",
    },
    {
      label: "Accepted",
      count:
        statistics?.byStatus?.find((s) => s.status === "accepted")?.count || 0,
      color: "from-green-50 to-emerald-100",
      textColor: "text-green-700",
      icon: CheckCircle,
      iconColor: "text-green-500",
    },
    {
      label: "Completed",
      count:
        statistics?.byStatus?.find((s) => s.status === "completed")?.count || 0,
      color: "from-teal-50 to-cyan-100",
      textColor: "text-teal-700",
      icon: Target,
      iconColor: "text-teal-500",
    },
  ];

  // Chart data
  const statusChartData =
    statistics?.byStatus?.map((item) => ({
      name:
        STATUS_OPTIONS.find((opt) => opt.value === item.status)?.label ||
        item.status,
      value: parseInt(item.count) || 0,
      color:
        STATUS_OPTIONS.find((opt) => opt.value === item.status)?.color ||
        "#6B7280",
    })) || [];

  const stageChartData =
    statistics?.byStage?.map((item) => ({
      name:
        STAGE_OPTIONS.find((opt) => opt.value === item.stage)?.label ||
        item.stage,
      value: parseInt(item.count) || 0,
      color:
        STAGE_OPTIONS.find((opt) => opt.value === item.stage)?.color ||
        "#6B7280",
    })) || [];

  const COLORS = [
    "#3B82F6",
    "#8B5CF6",
    "#10B981",
    "#F59E0B",
    "#EF4444",
    "#6366F1",
    "#14B8A6",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-2xl"></div>
          <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 shadow-lg p-8">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Application Management
                </h1>
                <p className="text-gray-600 text-lg">
                  Monitor and manage all student applications across the system
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    fetchAllApplications();
                    fetchStatistics();
                  }}
                  disabled={loading}
                  className="border-gray-200 text-gray-600 hover:bg-gray-50 transition-all duration-200"
                >
                  <RefreshCw
                    className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
                  />
                  Refresh
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {statusStats.map((stat) => {
            const IconComponent = stat.icon;
            return (
              <Card
                key={stat.label}
                className="group hover:shadow-lg transition-all duration-300 border-0 overflow-hidden"
              >
                <div
                  className={`h-full bg-gradient-to-br ${stat.color} p-4 relative`}
                >
                  <div className="absolute top-0 right-0 w-12 h-12 bg-white/10 rounded-full -mr-6 -mt-6"></div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-3">
                      <div
                        className={`p-2 rounded-lg bg-white/50 ${stat.iconColor} group-hover:scale-110 transition-transform duration-200`}
                      >
                        <IconComponent className="h-4 w-4" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-gray-600">
                        {stat.label}
                      </p>
                      <p className={`text-2xl font-bold ${stat.textColor}`}>
                        {stat.count}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Charts */}
        {showCharts && statistics && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Status Distribution Chart */}
            <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm overflow-hidden">
              <div className="bg-gradient-to-r from-blue-50/50 to-indigo-50/50 p-6 border-b border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-blue-100 rounded-xl">
                    <BarChart3 className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      Status Distribution
                    </h3>
                    <p className="text-gray-600">
                      Application status breakdown
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) =>
                          `${name} ${(percent * 100).toFixed(0)}%`
                        }
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {statusChartData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </Card>

            {/* Stage Distribution Chart */}
            <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm overflow-hidden">
              <div className="bg-gradient-to-r from-purple-50/50 to-pink-50/50 p-6 border-b border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-purple-100 rounded-xl">
                    <Activity className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      Stage Distribution
                    </h3>
                    <p className="text-gray-600">Application stage breakdown</p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stageChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) =>
                          `${name} ${(percent * 100).toFixed(0)}%`
                        }
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {stageChartData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Filters and Search */}
        <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm overflow-hidden">
          <div className="bg-gradient-to-r from-blue-50/50 to-purple-50/50 p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-gray-900">
                  Apply Filters on Applications
                </h3>
                <p className="text-gray-600">
                  {filteredApplications.length} application
                  {filteredApplications.length !== 1 ? "s" : ""} found
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className={`transition-all duration-200 ${
                    showFilters
                      ? "bg-blue-100 border-blue-300 text-blue-700"
                      : "border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Advanced Filters
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearFilters}
                  className="border-purple-300 text-purple-700 hover:bg-purple-50 transition-all duration-200"
                >
                  Clear All
                </Button>
                {/* Export button hidden for admin */}
                {/* <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    console.log('Export applications');
                  }}
                  className="border-green-300 text-green-700 hover:bg-green-50 transition-all duration-200"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export Data
                </Button> */}
              </div>
            </div>

            {/* Search */}
            <div className="mb-6">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                <Input
                  placeholder="Search applications by student name, consultant name, email, or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 py-4 text-lg border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/70 backdrop-blur-sm shadow-lg"
                />
              </div>
            </div>

            {/* Filters */}
            {showFilters && (
              <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-white/50 p-6 shadow-lg">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Status Filter
                    </label>
                    <Select
                      value={filters.status}
                      onChange={(e) =>
                        handleFilterChange("status", e.target.value)
                      }
                      className="w-full rounded-lg border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm"
                    >
                      <option value="">All Statuses</option>
                      {STATUS_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Stage Filter
                    </label>
                    <Select
                      value={filters.stage}
                      onChange={(e) =>
                        handleFilterChange("stage", e.target.value)
                      }
                      className="w-full rounded-lg border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white shadow-sm"
                    >
                      <option value="">All Stages</option>
                      {STAGE_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <Button
                      variant="outline"
                      onClick={clearFilters}
                      className="w-full py-3 border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg transition-all duration-200"
                    >
                      Reset Filters
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Applications Table */}
        <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm overflow-hidden">
          <ApplicationsTable
            applications={filteredApplications}
            loading={loading}
            onView={handleView}
            // onEdit={handleEdit}  // Commented out for admin
            // onDelete={handleDelete}  // Commented out for admin
            // onReview={handleUpdate}  // Commented out for admin
            showConsultant={true}
            showActions={true} // Keep true to show view button
            showEdit={false} // Keep true to show view button
            showDelete={false} // Hide delete for admin
          />
        </Card>

        {/* Error Display */}
        {error && (
          <Card className="border-0 shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-red-50 to-pink-50 border-l-4 border-red-400">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-red-100 rounded-full mr-4">
                    <AlertTriangle className="h-6 w-6 text-red-500" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-red-800 mb-1">
                      System Error
                    </h4>
                    <p className="text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Empty State */}
        {!loading && filteredApplications.length === 0 && (
          <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm overflow-hidden">
            <div className="text-center py-16 px-8">
              <div className="mx-auto w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mb-6">
                <FileText className="h-12 w-12 text-blue-500" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                No applications found
              </h3>
              <p className="text-gray-600 mb-8 text-lg max-w-md mx-auto">
                {searchTerm || filters.status || filters.stage
                  ? "No applications match your current search criteria. Try adjusting your filters."
                  : "There are no applications in the system yet. Start by creating your first application."}
              </p>
              {searchTerm || filters.status || filters.stage ? (
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="border-blue-300 text-blue-700 hover:bg-blue-50 px-8 py-3 rounded-xl transition-all duration-200"
                >
                  Clear All Filters
                </Button>
              ) : (
                <Button
                  onClick={() => navigate("/super-admin/applications/new")}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl px-8 py-3 rounded-xl transition-all duration-200"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Create First Application
                </Button>
              )}
            </div>
          </Card>
        )}

        {/* Application Detail Modal */}
        {showDetailModal && selectedApplication && (
          <ApplicationDetailModal
            application={selectedApplication}
            isOpen={showDetailModal}
            onClose={() => {
              setShowDetailModal(false);
              setSelectedApplication(null);
            }}
          />
        )}

        {/* Application Review Modal - Commented out for admin */}
        {/* {showReviewModal && selectedApplication && (
          <ApplicationReviewModal
            application={selectedApplication}
            isOpen={showReviewModal}
            onClose={() => {
              setShowReviewModal(false);
              setSelectedApplication(null);
            }}
            onSave={handleUpdate}
          />
        )} */}

        {/* Delete Confirmation Modal - Commented out for admin */}
        {/* {showDeleteModal && selectedApplication && (
          <Modal
            isOpen={showDeleteModal}
            onClose={() => {
              setShowDeleteModal(false);
              setSelectedApplication(null);
            }}
            title=""
          >
            <div className="bg-white">
              <div className="bg-gradient-to-r from-red-50 to-pink-50 px-6 py-6 border-b border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-red-900">
                      Delete Application
                    </h2>
                    <p className="text-red-700">
                      This action cannot be undone
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <p className="text-gray-600">
                  Are you sure you want to delete the application for <strong>{selectedApplication?.student?.name}</strong>? 
                  All associated data will be permanently removed from the system.
                </p>
                <div className="flex justify-end space-x-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowDeleteModal(false);
                      setSelectedApplication(null);
                    }}
                    className="px-6 py-2 border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={confirmDelete}
                    className="px-6 py-2 bg-red-600 text-white hover:bg-red-700 shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    Delete Application
                  </Button>
                </div>
              </div>
            </div>
          </Modal>
        )} */}
      </div>
    </div>
  );
};

export default ApplicationsPage;
