import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  Filter,
  Search,
  Plus,
  Download,
  RefreshCw,
  BarChart3,
  Calendar,
  User,
  CheckCircle,
  Clock,
  AlertTriangle,
  TrendingUp,
  Users,
} from "lucide-react";
import useApplicationStore from "../../stores/applicationStore";
import {
  STATUS_OPTIONS,
  STAGE_OPTIONS,
} from "../../constants/applicationConstants";
import ApplicationsTable from "../../components/applications/ApplicationsTable";
import ApplicationDetailModal from "../../components/applications/ApplicationDetailModal";
import ApplicationReviewModal from "../../components/applications/ApplicationReviewModal";
import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";

const ApplicationsPage = () => {
  const navigate = useNavigate();
  const {
    applications,
    loading,
    error,
    filters,
    fetchConsultantApplications,
         reviewApplication,
     updateApplicationStatus,
     deleteApplication,
     setFilters,
  } = useApplicationStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    fetchConsultantApplications();
  }, [fetchConsultantApplications]);

  const handleView = (application) => {
    setSelectedApplication(application);
    setShowDetailModal(true);
  };

  const handleEdit = (application) => {
    setSelectedApplication(application);
    setShowReviewModal(true);
  };

  const handleDelete = (application) => {
    setSelectedApplication(application);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (selectedApplication) {
      try {
        await deleteApplication(selectedApplication.id);
        setShowDeleteModal(false);
        setSelectedApplication(null);
      } catch (error) {
        console.error("Failed to delete application:", error);
      }
    }
  };

  const handleReview = async (applicationId, reviewData) => {
    try {
      await reviewApplication(applicationId, reviewData);
    } catch (error) {
      console.error("Failed to review application:", error);
    }
  };

  const handleStatusUpdate = async (applicationId, statusData) => {
    try {
      await updateApplicationStatus(applicationId, statusData);
    } catch (error) {
      console.error("Failed to update application status:", error);
    }
  };

     // Consultants cannot delete applications - they can only review and update status

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
      app.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = !filters.status || app.status === filters.status;
    const matchesStage = !filters.stage || app.stage === filters.stage;

    return matchesSearch && matchesStatus && matchesStage;
  });

  const getStatusCount = (status) => {
    return applications.filter((app) => app.status === status).length;
  };

  const getStageCount = (stage) => {
    return applications.filter((app) => app.stage === stage).length;
  };

  const statusStats = [
    {
      label: "Draft",
      count: getStatusCount("draft"),
      color: "from-gray-50 to-gray-100",
      textColor: "text-gray-700",
      icon: FileText,
      iconColor: "text-gray-500",
    },
    {
      label: "In Review",
      count: getStatusCount("in_review"),
      color: "from-blue-50 to-blue-100",
      textColor: "text-blue-700",
      icon: Clock,
      iconColor: "text-blue-500",
    },
    {
      label: "Submitted",
      count: getStatusCount("submitted"),
      color: "from-yellow-50 to-yellow-100",
      textColor: "text-yellow-700",
      icon: TrendingUp,
      iconColor: "text-yellow-500",
    },
    {
      label: "Offers Received",
      count: getStatusCount("offers_received"),
      color: "from-purple-50 to-purple-100",
      textColor: "text-purple-700",
      icon: BarChart3,
      iconColor: "text-purple-500",
    },
    {
      label: "Accepted",
      count: getStatusCount("accepted"),
      color: "from-green-50 to-green-100",
      textColor: "text-green-700",
      icon: CheckCircle,
      iconColor: "text-green-500",
    },
    {
      label: "Completed",
      count: getStatusCount("completed"),
      color: "from-teal-50 to-teal-100",
      textColor: "text-teal-700",
      icon: Users,
      iconColor: "text-teal-500",
    },
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
                  My Applications
                </h1>
                                 <p className="text-gray-600 text-lg">
                   Review and update applications assigned to you by the system administrator
                 </p>
              </div>
                             <div className="flex items-center space-x-4">
                 <Button
                   variant="outline"
                   onClick={() => fetchConsultantApplications()}
                   disabled={loading}
                   className="border-blue-200 text-blue-600 hover:bg-blue-50 transition-all duration-200"
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          {statusStats.map((stat) => {
            const IconComponent = stat.icon;
            return (
              <Card
                key={stat.label}
                className="group hover:shadow-xl transition-all duration-300 border-0 overflow-hidden"
              >
                <div
                  className={`h-full bg-gradient-to-br ${stat.color} p-6 relative`}
                >
                  <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div
                        className={`p-3 rounded-xl bg-white/50 ${stat.iconColor} group-hover:scale-110 transition-transform duration-200`}
                      >
                        <IconComponent className="h-5 w-5" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-gray-600">
                        {stat.label}
                      </p>
                      <p className={`text-3xl font-bold ${stat.textColor}`}>
                        {stat.count}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Filters and Search */}
        <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm overflow-hidden">
          <div className="bg-gradient-to-r from-blue-50/50 to-purple-50/50 p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-gray-900">
                  Applications Dashboard
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
                  Filters
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearFilters}
                  className="border-purple-300 text-purple-700 hover:bg-purple-50 transition-all duration-200"
                >
                  Clear All
                </Button>
              </div>
            </div>

            {/* Search */}
            <div className="mb-6">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                <Input
                  placeholder="Search applications by student name, email, or ID..."
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
                      Clear Filters
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
             onEdit={handleEdit}
             onDelete={handleDelete}
             onReview={handleReview}
             showConsultant={false}
             showActions={true}
             showDelete={false} // Consultants cannot delete applications
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
                      Error Occurred
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
                     ? "No applications match your current filters. Try adjusting your search criteria."
                     : "You don't have any applications assigned yet. Applications will be assigned to you by the system administrator."}
                 </p>
              {searchTerm || filters.status || filters.stage ? (
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="border-blue-300 text-blue-700 hover:bg-blue-50 px-8 py-3 rounded-xl transition-all duration-200"
                >
                  Clear Filters
                </Button>
              ) : (
                                 <div className="text-gray-500 text-sm">
                   Applications will be assigned to you by the system administrator.
                 </div>
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

       {/* Application Review Modal */}
       {showReviewModal && selectedApplication && (
         <ApplicationReviewModal
           application={selectedApplication}
           isOpen={showReviewModal}
           onClose={() => {
             setShowReviewModal(false);
             setSelectedApplication(null);
           }}
           onSave={handleReview}
         />
       )}

       {/* Delete Confirmation Modal */}
       {showDeleteModal && selectedApplication && (
         <Modal
           isOpen={showDeleteModal}
           onClose={() => {
             setShowDeleteModal(false);
             setSelectedApplication(null);
           }}
           title="Delete Application"
         >
           <div className="space-y-4">
             <p className="text-gray-600">
               Are you sure you want to delete this application? This action cannot be undone.
             </p>
             <div className="flex justify-end space-x-3">
               <Button
                 variant="outline"
                 onClick={() => {
                   setShowDeleteModal(false);
                   setSelectedApplication(null);
                 }}
               >
                 Cancel
               </Button>
               <Button variant="destructive" onClick={confirmDelete}>
                 Delete
               </Button>
             </div>
           </div>
         </Modal>
       )}
     </div>
   </div>
 );
};

export default ApplicationsPage;
