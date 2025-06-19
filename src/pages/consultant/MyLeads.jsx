// pages/consultant/MyLeads.jsx
import React, { useState, useEffect } from "react";
import useApi from "../../hooks/useApi";
import DataTable from "../../components/tables/DataTable";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import Modal from "../../components/ui/Modal";
import Input from "../../components/ui/Input";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { Eye, MessageSquare, Calendar, FileText, Plus } from "lucide-react";
import { Link } from "react-router-dom";

const MyLeads = () => {
  const { request, loading } = useApi();
  const [leads, setLeads] = useState([]);
  const [selectedLead, setSelectedLead] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [newNote, setNewNote] = useState("");
  const [filters, setFilters] = useState({
    status: "",
    search: "",
  });

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const response = await request("/consultant/leads");
      setLeads(response || []);
    } catch (error) {
      console.error("Error fetching leads:", error);
    }
  };

  const handleStatusUpdate = async () => {
    if (!selectedLead || !newStatus) return;

    try {
      await request(`/consultant/leads/${selectedLead.id}/status`, {
        method: "PUT",
        data: { status: newStatus },
      });

      setLeads(
        leads.map((lead) =>
          lead.id === selectedLead.id ? { ...lead, status: newStatus } : lead
        )
      );

      setShowStatusModal(false);
      setNewStatus("");
      setSelectedLead(null);
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleAddNote = async () => {
    if (!selectedLead || !newNote.trim()) return;

    try {
      await request(`/consultant/leads/${selectedLead.id}/notes`, {
        method: "POST",
        data: { note: newNote },
      });

      // Refresh leads to get updated notes
      fetchLeads();

      setShowNotesModal(false);
      setNewNote("");
      setSelectedLead(null);
    } catch (error) {
      console.error("Error adding note:", error);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      new: "bg-blue-100 text-blue-800",
      in_progress: "bg-yellow-100 text-yellow-800",
      converted: "bg-green-100 text-green-800",
      lost: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const filteredLeads = leads.filter((lead) => {
    const matchesStatus = !filters.status || lead.status === filters.status;
    const matchesSearch =
      !filters.search ||
      lead.student?.name
        ?.toLowerCase()
        .includes(filters.search.toLowerCase()) ||
      lead.student?.email?.toLowerCase().includes(filters.search.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  const columns = [
    {
      key: "student.name",
      label: "Student Name",
      render: (lead) => (
        <div>
          <div className="font-medium text-gray-900">
            {lead.student?.name || "N/A"}
          </div>
          <div className="text-sm text-gray-500">
            {lead.student?.email || "N/A"}
          </div>
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (lead) => (
        <Badge className={getStatusColor(lead.status)}>
          {lead.status?.replace("_", " ").toUpperCase()}
        </Badge>
      ),
    },
    {
      key: "source",
      label: "Source",
      render: (lead) => <span className="capitalize">{lead.source}</span>,
    },
    {
      key: "studyPreferences",
      label: "Study Preferences",
      render: (lead) => (
        <div className="text-sm">
          <div>Destination: {lead.studyPreferences?.destination || "N/A"}</div>
          <div>Level: {lead.studyPreferences?.level || "N/A"}</div>
        </div>
      ),
    },
    {
      key: "createdAt",
      label: "Created",
      render: (lead) => (
        <span className="text-sm text-gray-600">
          {new Date(lead.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (lead) => (
        <div className="flex space-x-2">
          <Link to={`/consultant/student-profiles/${lead.studentId}`}>
            <Button size="sm" variant="outline">
              <Eye className="h-4 w-4" />
            </Button>
          </Link>

          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setSelectedLead(lead);
              setNewStatus(lead.status);
              setShowStatusModal(true);
            }}
          >
            <FileText className="h-4 w-4" />
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setSelectedLead(lead);
              setShowNotesModal(true);
            }}
          >
            <MessageSquare className="h-4 w-4" />
          </Button>

          <Link to={`/consultant/students/${lead.studentId}/meetings`}>
            <Button size="sm" variant="outline">
              <Calendar className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Leads</h1>
          <p className="text-gray-600">
            Manage your assigned leads and track progress
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            placeholder="Search by name or email..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />

          <select
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          >
            <option value="">All Statuses</option>
            <option value="new">New</option>
            <option value="in_progress">In Progress</option>
            <option value="converted">Converted</option>
            <option value="lost">Lost</option>
          </select>

          <div className="text-sm text-gray-600 flex items-center">
            Total: {filteredLeads.length} leads
          </div>
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-white rounded-lg shadow">
        <DataTable
          data={filteredLeads}
          columns={columns}
          searchable={false}
          pagination={true}
          pageSize={10}
        />
      </div>

      {/* Status Update Modal */}
      <Modal
        isOpen={showStatusModal}
        onClose={() => {
          setShowStatusModal(false);
          setSelectedLead(null);
          setNewStatus("");
        }}
        title="Update Lead Status"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status for {selectedLead?.student?.name}
            </label>
            <select
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
            >
              <option value="new">New</option>
              <option value="in_progress">In Progress</option>
              <option value="converted">Converted</option>
              <option value="lost">Lost</option>
            </select>
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => {
                setShowStatusModal(false);
                setSelectedLead(null);
                setNewStatus("");
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleStatusUpdate}>Update Status</Button>
          </div>
        </div>
      </Modal>

      {/* Add Note Modal */}
      <Modal
        isOpen={showNotesModal}
        onClose={() => {
          setShowNotesModal(false);
          setSelectedLead(null);
          setNewNote("");
        }}
        title="Add Consultation Note"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Note for {selectedLead?.student?.name}
            </label>
            <textarea
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              rows={4}
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Enter your consultation notes..."
            />
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => {
                setShowNotesModal(false);
                setSelectedLead(null);
                setNewNote("");
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleAddNote}>Add Note</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default MyLeads;
