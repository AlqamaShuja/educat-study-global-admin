import React, { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Filter,
  Settings,
  Edit2,
  Trash2,
  ArrowUp,
  ArrowDown,
  History,
  AlertTriangle,
} from "lucide-react";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Modal from "../../components/ui/Modal";
import LeadRuleForm from "../../components/forms/LeadRuleForm";
import useOfficeStore from "../../stores/officeStore";
import useUserStore from "../../stores/userStore";
import useLeadRuleStore from "../../stores/useLeadRuleStore";

const LeadDistributionRules = () => {
  const [formLoading, setFormLoading] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [selectedRule, setSelectedRule] = useState(null);
  const [ruleHistory, setRuleHistory] = useState([]);

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [officeFilter, setOfficeFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");

  const {
    leadRules,
    loading,
    fetchLeadRules,
    createLeadRule,
    updateLeadRule,
    deleteLeadRule,
    getLeadRuleHistory,
  } = useLeadRuleStore();

  console.log(leadRules, "sacksancancsancs");
  

  const { offices, fetchOffices } = useOfficeStore();
  const { users, fetchConsultants } = useUserStore();

  // Fetch data on component mount
  useEffect(() => {
    fetchLeadRules();
    fetchOffices();
    fetchConsultants();
  }, []);

  const handleOpenForm = (rule = null) => {
    setEditingRule(rule);
    setIsFormModalOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormModalOpen(false);
    setEditingRule(null);
  };

  const handleFormSubmit = async (formData) => {
    try {
      setFormLoading(true);

      if (editingRule) {
        await updateLeadRule(editingRule.id, formData);
      } else {
        await createLeadRule(formData);
      }

      handleCloseForm();
    } catch (error) {
      console.error("Error saving lead rule:", error);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id, priority) => {
    if (
      window.confirm(
        `Are you sure you want to delete rule with priority ${priority}?`
      )
    ) {
      try {
        await deleteLeadRule(id);
      } catch (error) {
        console.error("Error deleting lead rule:", error);
      }
    }
  };

  const handleViewHistory = async (rule) => {
    try {
      setSelectedRule(rule);
      const history = await getLeadRuleHistory(rule.id);
      setRuleHistory(history);
      setIsHistoryModalOpen(true);
    } catch (error) {
      console.error("Error fetching rule history:", error);
    }
  };

  // Get unique offices for filter
  const uniqueOffices = [
    ...new Set(leadRules?.map((r) => r.officeId)?.filter(Boolean)),
  ];

  // Filter rules
  const filteredRules = leadRules?.filter((rule) => {
    const matchesSearch =
      rule.criteria?.studyDestination
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      rule.criteria?.leadSource
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      rule.priority?.toString().includes(searchTerm);

    const matchesOffice = !officeFilter || rule.officeId === officeFilter;

    let matchesPriority = true;
    if (priorityFilter === "high") {
      matchesPriority = rule.priority <= 10;
    } else if (priorityFilter === "medium") {
      matchesPriority = rule.priority > 10 && rule.priority <= 50;
    } else if (priorityFilter === "low") {
      matchesPriority = rule.priority > 50;
    }

    return matchesSearch && matchesOffice && matchesPriority;
  });

  // Sort rules by priority
  const sortedRules = [...filteredRules]?.sort(
    (a, b) => a.priority - b.priority
  );

  const getPriorityBadgeColor = (priority) => {
    if (priority <= 10) return "bg-red-100 text-red-800";
    if (priority <= 50) return "bg-yellow-100 text-yellow-800";
    return "bg-green-100 text-green-800";
  };

  const getPriorityLabel = (priority) => {
    if (priority <= 10) return "High";
    if (priority <= 50) return "Medium";
    return "Low";
  };

  const getOfficeName = (officeId) => {
    const office = offices.find((o) => o.id === officeId);
    return office
      ? `${office.name} - ${office.address?.city}`
      : "Unknown Office";
  };

  const getConsultantName = (consultantId) => {
    const consultant = users.find((u) => u.id === consultantId);
    return consultant ? consultant.name : "Any Consultant";
  };

  const formatCriteria = (criteria) => {
    const parts = [];
    if (criteria?.studyDestination)
      parts.push(`Destination: ${criteria.studyDestination}`);
    if (criteria?.leadSource) parts.push(`Source: ${criteria.leadSource}`);
    if (criteria?.officeId) {
      const office = offices.find((o) => o.id === criteria.officeId);
      if (office) parts.push(`From: ${office.name}`);
    }
    return parts?.length > 0 ? parts.join(", ") : "Any lead";
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header Section */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Settings className="h-7 w-7 text-blue-600" />
            Lead Distribution Rules
          </h1>
          <p className="text-gray-600 mt-1">
            Configure automatic lead assignment rules based on criteria and
            priorities
          </p>
        </div>
        <div className="flex gap-2">
          <div className="bg-white rounded-lg border p-3">
            <div className="text-sm text-gray-500">Total Rules</div>
            <div className="text-2xl font-bold text-gray-900">
              {leadRules?.length}
            </div>
          </div>
          <div className="bg-white rounded-lg border p-3">
            <div className="text-sm text-gray-500">High Priority</div>
            <div className="text-2xl font-bold text-red-600">
              {leadRules?.filter((r) => r.priority <= 10)?.length}
            </div>
          </div>
          <Button
            onClick={() => handleOpenForm()}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Rule
          </Button>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <div className="flex">
          <AlertTriangle className="h-5 w-5 text-blue-400 mr-2 mt-0.5" />
          <div className="text-sm text-blue-700">
            <p className="font-medium">How Lead Distribution Works:</p>
            <p className="mt-1">
              Rules are processed in priority order (lowest number first). The
              first matching rule will assign the lead. Create specific rules
              with high priority for special cases, and general rules with low
              priority as fallbacks.
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search by destination, source, or priority..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Office Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <select
              value={officeFilter}
              onChange={(e) => setOfficeFilter(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
            >
              <option value="">All Offices</option>
              {uniqueOffices?.map((officeId) => {
                const office = offices.find((o) => o.id === officeId);
                return office ? (
                  <option key={officeId} value={officeId}>
                    {office.name}
                  </option>
                ) : null;
              })}
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
            >
              <option value="">All Priorities</option>
              <option value="high">High Priority (1-10)</option>
              <option value="medium">Medium Priority (11-50)</option>
              <option value="low">Low Priority (51+)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Rules List */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Distribution Rules ({sortedRules?.length})
          </h2>
        </div>

        {sortedRules?.length === 0 ? (
          <div className="p-12 text-center">
            <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No rules found
            </h3>
            <p className="text-gray-600">
              {searchTerm || officeFilter || priorityFilter
                ? "Try adjusting your search criteria"
                : "Create your first lead distribution rule to automate lead assignments"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Criteria
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assigns To
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedRules?.map((rule, index) => (
                  <tr key={rule.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-gray-900">
                          {rule.priority}
                        </span>
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityBadgeColor(
                            rule.priority
                          )}`}
                        >
                          {getPriorityLabel(rule.priority)}
                        </span>
                        {index === 0 && (
                          <ArrowUp
                            className="h-4 w-4 text-green-500"
                            title="Highest Priority"
                          />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {formatCriteria(rule.criteria)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        <div className="font-medium">
                          {getOfficeName(rule.officeId)}
                        </div>
                        <div className="text-gray-500">
                          {getConsultantName(rule.consultantId)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(rule.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenForm(rule)}
                        className="flex items-center gap-1"
                      >
                        <Edit2 className="h-3 w-3" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewHistory(rule)}
                        className="flex items-center gap-1 text-blue-600 border-blue-200 hover:bg-blue-50"
                      >
                        <History className="h-3 w-3" />
                        History
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(rule.id, rule.priority)}
                        className="flex items-center gap-1 text-red-600 border-red-200 hover:bg-red-50"
                      >
                        <Trash2 className="h-3 w-3" />
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Rule Form Modal */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={handleCloseForm}
        title={
          editingRule
            ? "Edit Lead Distribution Rule"
            : "Create New Lead Distribution Rule"
        }
        size="xl"
      >
        <LeadRuleForm
          rule={editingRule}
          onSubmit={handleFormSubmit}
          onCancel={handleCloseForm}
          loading={formLoading}
          mode={editingRule ? "edit" : "create"}
          offices={offices}
          consultants={users?.filter((u) => u.role === "consultant")}
        />
      </Modal>

      {/* Rule History Modal */}
      <Modal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        title="Rule History"
        size="lg"
      >
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Rule Information
            </h3>
            <div className="text-sm text-gray-600">
              <div>
                <strong>Priority:</strong> {selectedRule?.priority}
              </div>
              <div>
                <strong>Criteria:</strong>{" "}
                {formatCriteria(selectedRule?.criteria)}
              </div>
              <div>
                <strong>Assigns To:</strong>{" "}
                {getOfficeName(selectedRule?.officeId)} -{" "}
                {getConsultantName(selectedRule?.consultantId)}
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-3">History</h4>
            {ruleHistory?.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                No history available
              </p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {ruleHistory?.map((entry, index) => (
                  <div
                    key={index}
                    className="bg-white p-3 rounded border text-sm"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="font-medium">{entry.action}</div>
                        {entry.details && (
                          <div className="text-gray-600 mt-1">
                            {entry.details}
                          </div>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 ml-2">
                        {formatDate(entry.timestamp)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default LeadDistributionRules;
