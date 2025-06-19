import React, { useState, useEffect } from "react";
import useLeadStore from "../../stores/leadStore";
import useUserStore from "../../stores/userStore";
import useOfficeStore from "../../stores/officeStore";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Modal from "../../components/ui/Modal";
import Badge from "../../components/ui/Badge";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import DataTable from "../../components/tables/DataTable";
import TableFilters from "../../components/tables/TableFilters";
import BulkActions from "../../components/tables/BulkActions";
import {
  Search,
  Filter,
  UserPlus,
  Download,
  Upload,
  Eye,
  Edit,
  Trash2,
  RotateCcw,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";

const GlobalLeadManagement = () => {
  const {
    leads,
    isLoading,
    error,
    pagination,
    fetchAllLeads,
    reassignLead,
    assignLeadToConsultant,
    exportLeads,
    getLeadHistory,
    bulkAssignLeads,
  } = useLeadStore();

  const { users, fetchAllStaff } = useUserStore();
  const { offices, fetchAllOffices } = useOfficeStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLeads, setSelectedLeads] = useState([]);
  const [filters, setFilters] = useState({
    status: "",
    source: "",
    officeId: "",
    consultantId: "",
    dateRange: "30",
  });
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isBulkAssignModalOpen, setIsBulkAssignModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [leadHistory, setLeadHistory] = useState([]);
  const [isExporting, setIsExporting] = useState(false);
  const [assignmentData, setAssignmentData] = useState({
    consultantId: "",
    officeId: "",
  });

  useEffect(() => {
    loadData();
  }, [filters, searchTerm]);

  const loadData = async () => {
    try {
      await Promise.all([
        fetchAllLeads({
          search: searchTerm,
          ...filters,
          page: pagination.currentPage,
        }),
        fetchAllStaff(),
        fetchAllOffices(),
      ]);
    } catch (error) {
      console.error("Failed to load data:", error);
    }
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  const handleFilterChange = (filterName, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterName]: value,
    }));
  };

  const handleAssignLead = async (leadId, consultantId, officeId) => {
    try {
      await assignLeadToConsultant({ leadId, consultantId, officeId });
      setIsAssignModalOpen(false);
      setSelectedLead(null);
      setAssignmentData({ consultantId: "", officeId: "" });
      await loadData();
    } catch (error) {
      console.error("Failed to assign lead:", error);
    }
  };

  const handleBulkAssign = async () => {
    try {
      await bulkAssignLeads({
        leadIds: selectedLeads,
        consultantId: assignmentData.consultantId,
        officeId: assignmentData.officeId,
      });
      setIsBulkAssignModalOpen(false);
      setSelectedLeads([]);
      setAssignmentData({ consultantId: "", officeId: "" });
      await loadData();
    } catch (error) {
      console.error("Failed to bulk assign leads:", error);
    }
  };

  const handleViewHistory = async (lead) => {
    try {
      setSelectedLead(lead);
      const history = await getLeadHistory(lead.id);
      setLeadHistory(history);
      setIsHistoryModalOpen(true);
    } catch (error) {
      console.error("Failed to fetch lead history:", error);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await exportLeads({
        filters,
        search: searchTerm,
        format: "csv",
      });
    } catch (error) {
      console.error("Failed to export leads:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      new: { color: "blue", icon: AlertCircle },
      in_progress: { color: "yellow", icon: Clock },
      converted: { color: "green", icon: CheckCircle },
      lost: { color: "red", icon: XCircle },
    };

    const config = statusConfig[status] || statusConfig.new;
    const Icon = config.icon;

    return (
      <Badge color={config.color} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {status?.replace("_", " ")}
      </Badge>
    );
  };

  const getSourceBadge = (source) => {
    const colors = {
      walk_in: "purple",
      online: "blue",
      referral: "green",
    };

    return (
      <Badge color={colors[source] || "gray"}>
        {source?.replace("_", " ")}
      </Badge>
    );
  };

  const consultants = users?.filter((user) => user.role === "consultant") || [];
  const managers = users?.filter((user) => user.role === "manager") || [];

  const columns = [
    {
      key: "student.name",
      label: "Student Name",
      sortable: true,
      render: (lead) => (
        <div>
          <div className="font-medium">{lead.student?.name || "N/A"}</div>
          <div className="text-sm text-gray-500">{lead.student?.email}</div>
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (lead) => getStatusBadge(lead.status),
    },
    {
      key: "source",
      label: "Source",
      sortable: true,
      render: (lead) => getSourceBadge(lead.source),
    },
    {
      key: "office.name",
      label: "Office",
      sortable: true,
      render: (lead) => (
        <div>
          <div className="font-medium">{lead.office?.name || "Unassigned"}</div>
          <div className="text-sm text-gray-500">
            {lead.office?.address?.city}
          </div>
        </div>
      ),
    },
    {
      key: "consultant.name",
      label: "Consultant",
      sortable: true,
      render: (lead) => (
        <div>
          {lead.consultant ? (
            <>
              <div className="font-medium">{lead.consultant.name}</div>
              <div className="text-sm text-gray-500">
                {lead.consultant.email}
              </div>
            </>
          ) : (
            <Badge color="gray">Unassigned</Badge>
          )}
        </div>
      ),
    },
    {
      key: "studyPreferences.destination",
      label: "Destination",
      render: (lead) => lead.studyPreferences?.destination || "N/A",
    },
    {
      key: "createdAt",
      label: "Created",
      sortable: true,
      render: (lead) => new Date(lead.createdAt).toLocaleDateString(),
    },
    {
      key: "actions",
      label: "Actions",
      render: (lead) => (
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleViewHistory(lead)}
          >
            <Eye className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setSelectedLead(lead);
              setAssignmentData({
                consultantId: lead.assignedConsultant || "",
                officeId: lead.officeId || "",
              });
              setIsAssignModalOpen(true);
            }}
          >
            <UserPlus className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  const filterOptions = [
    {
      key: "status",
      label: "Status",
      type: "select",
      options: [
        { value: "", label: "All Statuses" },
        { value: "new", label: "New" },
        { value: "in_progress", label: "In Progress" },
        { value: "converted", label: "Converted" },
        { value: "lost", label: "Lost" },
      ],
    },
    {
      key: "source",
      label: "Source",
      type: "select",
      options: [
        { value: "", label: "All Sources" },
        { value: "walk_in", label: "Walk-in" },
        { value: "online", label: "Online" },
        { value: "referral", label: "Referral" },
      ],
    },
    {
      key: "officeId",
      label: "Office",
      type: "select",
      options: [
        { value: "", label: "All Offices" },
        ...(offices?.map((office) => ({
          value: office.id,
          label: office.name,
        })) || []),
      ],
    },
    {
      key: "consultantId",
      label: "Consultant",
      type: "select",
      options: [
        { value: "", label: "All Consultants" },
        { value: "unassigned", label: "Unassigned" },
        ...(consultants?.map((consultant) => ({
          value: consultant.id,
          label: consultant.name,
        })) || []),
      ],
    },
  ];

  const bulkActions = [
    {
      label: "Assign to Consultant",
      action: () => setIsBulkAssignModalOpen(true),
      icon: UserPlus,
      disabled: selectedLeads.length === 0,
    },
    {
      label: "Export Selected",
      action: () => handleExport(),
      icon: Download,
      disabled: selectedLeads.length === 0,
    },
  ];

  if (isLoading && !leads?.length) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Global Lead Management</h1>
          <p className="text-gray-600">
            Manage and oversee all leads across the organization
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleExport}
            disabled={isExporting}
          >
            <Download className="w-4 h-4 mr-2" />
            {isExporting ? "Exporting..." : "Export All"}
          </Button>
          <Button onClick={() => loadData()}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search by student name, email, or ID..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              icon={<Search className="w-4 h-4" />}
            />
          </div>
          <TableFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            options={filterOptions}
          />
        </div>
      </Card>

      {/* Bulk Actions */}
      {selectedLeads.length > 0 && (
        <BulkActions
          selectedCount={selectedLeads.length}
          actions={bulkActions}
          onClearSelection={() => setSelectedLeads([])}
        />
      )}

      {/* Leads Table */}
      <Card>
        <DataTable
          data={leads || []}
          columns={columns}
          selectable
          selectedRows={selectedLeads}
          onSelectionChange={setSelectedLeads}
          pagination={pagination}
          onPageChange={(page) =>
            fetchAllLeads({
              ...filters,
              search: searchTerm,
              page,
            })
          }
          loading={isLoading}
          emptyMessage="No leads found"
        />
      </Card>

      {/* Assignment Modal */}
      <Modal
        isOpen={isAssignModalOpen}
        onClose={() => {
          setIsAssignModalOpen(false);
          setSelectedLead(null);
          setAssignmentData({ consultantId: "", officeId: "" });
        }}
        title="Assign Lead"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">Student Information</h3>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="font-medium">{selectedLead?.student?.name}</p>
              <p className="text-sm text-gray-600">
                {selectedLead?.student?.email}
              </p>
              <p className="text-sm text-gray-600">
                Destination: {selectedLead?.studyPreferences?.destination}
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Select Office *
            </label>
            <select
              value={assignmentData.officeId}
              onChange={(e) =>
                setAssignmentData((prev) => ({
                  ...prev,
                  officeId: e.target.value,
                  consultantId: "", // Reset consultant when office changes
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select Office</option>
              {offices?.map((office) => (
                <option key={office.id} value={office.id}>
                  {office.name} - {office.address?.city}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Select Consultant *
            </label>
            <select
              value={assignmentData.consultantId}
              onChange={(e) =>
                setAssignmentData((prev) => ({
                  ...prev,
                  consultantId: e.target.value,
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={!assignmentData.officeId}
            >
              <option value="">Select Consultant</option>
              {consultants
                ?.filter((consultant) =>
                  consultant.consultantOffices?.some(
                    (office) => office.id === assignmentData.officeId
                  )
                )
                ?.map((consultant) => (
                  <option key={consultant.id} value={consultant.id}>
                    {consultant.name} - {consultant.email}
                  </option>
                ))}
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setIsAssignModalOpen(false);
                setSelectedLead(null);
                setAssignmentData({ consultantId: "", officeId: "" });
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() =>
                handleAssignLead(
                  selectedLead.id,
                  assignmentData.consultantId,
                  assignmentData.officeId
                )
              }
              disabled={
                !assignmentData.consultantId || !assignmentData.officeId
              }
            >
              Assign Lead
            </Button>
          </div>
        </div>
      </Modal>

      {/* Bulk Assignment Modal */}
      <Modal
        isOpen={isBulkAssignModalOpen}
        onClose={() => {
          setIsBulkAssignModalOpen(false);
          setAssignmentData({ consultantId: "", officeId: "" });
        }}
        title={`Bulk Assign ${selectedLeads.length} Leads`}
        size="md"
      >
        <div className="space-y-4">
          <div className="p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              You are about to assign {selectedLeads.length} leads to a
              consultant.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Select Office *
            </label>
            <select
              value={assignmentData.officeId}
              onChange={(e) =>
                setAssignmentData((prev) => ({
                  ...prev,
                  officeId: e.target.value,
                  consultantId: "",
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select Office</option>
              {offices?.map((office) => (
                <option key={office.id} value={office.id}>
                  {office.name} - {office.address?.city}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Select Consultant *
            </label>
            <select
              value={assignmentData.consultantId}
              onChange={(e) =>
                setAssignmentData((prev) => ({
                  ...prev,
                  consultantId: e.target.value,
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={!assignmentData.officeId}
            >
              <option value="">Select Consultant</option>
              {consultants
                ?.filter((consultant) =>
                  consultant.consultantOffices?.some(
                    (office) => office.id === assignmentData.officeId
                  )
                )
                ?.map((consultant) => (
                  <option key={consultant.id} value={consultant.id}>
                    {consultant.name} - {consultant.email}
                  </option>
                ))}
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setIsBulkAssignModalOpen(false);
                setAssignmentData({ consultantId: "", officeId: "" });
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleBulkAssign}
              disabled={
                !assignmentData.consultantId || !assignmentData.officeId
              }
            >
              Assign All Leads
            </Button>
          </div>
        </div>
      </Modal>

      {/* Lead History Modal */}
      <Modal
        isOpen={isHistoryModalOpen}
        onClose={() => {
          setIsHistoryModalOpen(false);
          setSelectedLead(null);
          setLeadHistory([]);
        }}
        title="Lead History"
        size="lg"
      >
        <div className="space-y-4">
          <div className="p-3 bg-gray-50 rounded-lg">
            <h3 className="font-medium">{selectedLead?.student?.name}</h3>
            <p className="text-sm text-gray-600">
              {selectedLead?.student?.email}
            </p>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {leadHistory.length > 0 ? (
              <div className="space-y-3">
                {leadHistory.map((entry, index) => (
                  <div
                    key={index}
                    className="border-l-2 border-blue-200 pl-4 pb-3"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">
                          {entry.action || entry.note}
                        </p>
                        {entry.userId && (
                          <p className="text-sm text-gray-600">
                            by User ID: {entry.userId}
                          </p>
                        )}
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(entry.timestamp).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">
                No history available for this lead
              </p>
            )}
          </div>
        </div>
      </Modal>

      {error && (
        <div className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
    </div>
  );
};

export default GlobalLeadManagement;
