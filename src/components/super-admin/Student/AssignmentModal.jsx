import React, { useState, useEffect } from "react";
import Modal from "../../../components/ui/Modal";
import Button from "../../../components/ui/Button";
import { User, Building, AlertCircle, CheckCircle } from "lucide-react";
import useUserStore from "../../../stores/userStore";

const AssignmentModal = ({
  isOpen,
  onClose,
  lead,
  offices,
  consultants,
  onAssignmentComplete,
}) => {
  const [selectedOfficeId, setSelectedOfficeId] = useState("");
  const [selectedConsultantId, setSelectedConsultantId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Filter consultants based on selected office
  const [availableConsultants, setAvailableConsultants] = useState([]);

  //
  const { updateLeadAssign } = useUserStore();

  useEffect(() => {
    if (lead) {
      setSelectedOfficeId(lead.officeId || "");
      setSelectedConsultantId(lead.assignedConsultant || "");
      setError("");
      setSuccess("");
    }
  }, [lead, isOpen]);

  useEffect(() => {
    if (selectedOfficeId) {
      // Filter consultants who belong to the selected office
      const officeConsultants = consultants.filter(
        (consultant) => {
            const ids = consultant.consultantOffices.map(off => off.id);
            console.log(selectedOfficeId, "vsaasnjcasjcsnsanca", ids, "sacmkacacma", consultant.consultantOffices);
            
            return ids.includes(selectedOfficeId);
        }
      );
      console.log(officeConsultants, "ascknkncjsansancsn", consultants);
      
      setAvailableConsultants(officeConsultants);

      // Clear consultant selection if current consultant doesn't belong to new office
      if (selectedConsultantId) {
        const isConsultantInOffice = officeConsultants.some(
          (c) => c.id === selectedConsultantId
        );
        if (!isConsultantInOffice) {
          setSelectedConsultantId("");
        }
      }
    } else {
      setAvailableConsultants(consultants);
    }
  }, [selectedOfficeId, consultants]);

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const assignmentData = {
        leadId: lead.id,
        consultantId: selectedConsultantId,
        officeId: selectedOfficeId,
      };

      await updateLeadAssign(assignmentData);

      setSuccess("Lead assigned successfully!");
      setTimeout(() => {
        onAssignmentComplete();
        onClose();
      }, 1500);
    } catch (error) {
      setError(error.message || "An error occurred while assigning the lead");
    } finally {
      setLoading(false);
    }
  };

  const getOfficeName = (officeId) => {
    const office = offices.find((o) => o.id === officeId);
    return office
      ? `${office.name} - ${office.address?.city}`
      : "Unknown Office";
  };

  const getConsultantName = (consultantId) => {
    const consultant = consultants.find((c) => c.id === consultantId);
    return consultant ? consultant.name : "Unknown Consultant";
  };

  const isAssigned = lead?.assignedConsultant || lead?.officeId;
  const hasChanges =
    selectedOfficeId !== (lead?.officeId || "") ||
    selectedConsultantId !== (lead?.assignedConsultant || "");

  if (!lead) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Assign Lead" size="lg">
      <div className="space-y-6">
        {/* Current Assignment Status */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-3">
            Current Assignment
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-500">Student</div>
              <div className="font-medium">{lead.student?.name}</div>
              <div className="text-sm text-gray-500">{lead.student?.email}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Lead Status</div>
              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                {lead.status
                  ?.replace("_", " ")
                  .replace(/\b\w/g, (l) => l.toUpperCase())}
              </span>
            </div>
            <div>
              <div className="text-sm text-gray-500">Current Office</div>
              <div className="font-medium">
                {lead.officeId ? getOfficeName(lead.officeId) : "Not Assigned"}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Current Consultant</div>
              <div className="font-medium">
                {lead.assignedConsultant
                  ? getConsultantName(lead.assignedConsultant)
                  : "Not Assigned"}
              </div>
            </div>
          </div>
        </div>

        {/* Assignment Form */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">
            {isAssigned ? "Reassign Lead" : "Assign Lead"}
          </h3>

          {/* Office Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Building className="inline h-4 w-4 mr-1" />
              Select Office
            </label>
            <select
              value={selectedOfficeId}
              onChange={(e) => setSelectedOfficeId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            >
              <option value="">Select an office</option>
              {offices.map((office) => (
                <option key={office.id} value={office.id}>
                  {office.name} - {office.address?.city}
                </option>
              ))}
            </select>
          </div>

          {/* Consultant Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <User className="inline h-4 w-4 mr-1" />
              Select Consultant
            </label>
            <select
              value={selectedConsultantId}
              onChange={(e) => setSelectedConsultantId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading || !selectedOfficeId}
            >
              <option value="">
                {selectedOfficeId
                  ? "Select a consultant"
                  : "Please select an office first"}
              </option>
              {availableConsultants.map((consultant) => (
                <option key={consultant.id} value={consultant.id}>
                  {consultant.name} ({consultant.email})
                </option>
              ))}
            </select>
            {selectedOfficeId && availableConsultants.length === 0 && (
              <p className="text-sm text-yellow-600 mt-1">
                No consultants available in the selected office
              </p>
            )}
          </div>

          {/* Information Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-blue-400 mr-2 mt-0.5" />
              <div className="text-sm text-blue-700">
                <p className="font-medium">Assignment Rules:</p>
                <ul className="mt-1 list-disc list-inside space-y-1">
                  <li>
                    Consultants can only be assigned if they belong to the
                    selected office
                  </li>
                  <li>Both office and consultant assignment are optional</li>
                  <li>
                    You can assign to office only, consultant only, or both
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <div className="flex items-center">
              <AlertCircle className="h-4 w-4 mr-2" />
              {error}
            </div>
          </div>
        )}

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 mr-2" />
              {success}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              loading ||
              !hasChanges ||
              (!selectedOfficeId && !selectedConsultantId)
            }
            className="min-w-[120px]"
          >
            {loading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                {isAssigned ? "Reassigning..." : "Assigning..."}
              </div>
            ) : isAssigned ? (
              "Reassign Lead"
            ) : (
              "Assign Lead"
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default AssignmentModal;
