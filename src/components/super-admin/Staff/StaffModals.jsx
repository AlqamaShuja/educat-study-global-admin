
import Button from "../../ui/Button";
import Modal from "../../ui/Modal";

export const ImportCSVModal = ({
  isOpen,
  onClose,
  importFile,
  setImportFile,
  handleImportCSV,
}) => (
  <Modal
    isOpen={isOpen}
    onClose={() => {
      onClose();
      setImportFile(null);
    }}
    title="Import Staff from CSV"
    size="md"
  >
    <div className="space-y-4">
      <div className="p-4 bg-blue-50 rounded-lg">
        <h4 className="font-medium mb-2">CSV Format Requirements</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Headers: name, email, password, phone, role, officeId</li>
          <li>• Role values: manager, consultant, receptionist</li>
          <li>• officeId should match existing office IDs</li>
          <li>• All fields are required except phone and officeId</li>
        </ul>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Select CSV File
        </label>
        <input
          type="file"
          accept=".csv"
          onChange={(e) => setImportFile(e.target.files[0])}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button
          variant="outline"
          onClick={() => {
            onClose();
            setImportFile(null);
          }}
        >
          Cancel
        </Button>
        <Button onClick={handleImportCSV} disabled={!importFile}>
          Import Staff
        </Button>
      </div>
    </div>
  </Modal>
);

export const BulkUpdateModal = ({
  isOpen,
  onClose,
  selectedStaff,
  bulkUpdateData,
  setBulkUpdateData,
  handleBulkUpdate,
  offices,
}) => (
  <Modal
    isOpen={isOpen}
    onClose={() => {
      onClose();
      setBulkUpdateData({ role: "", officeId: "", isActive: "" });
    }}
    title={`Bulk Update ${selectedStaff.length} Staff Members`}
    size="md"
  >
    <div className="space-y-4">
      <div className="p-3 bg-orange-50 rounded-lg">
        <p className="text-sm text-orange-800">
          You are about to update {selectedStaff.length} staff members. Only
          filled fields will be updated.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Change Role</label>
        <select
          value={bulkUpdateData.role}
          onChange={(e) =>
            setBulkUpdateData((prev) => ({
              ...prev,
              role: e.target.value,
            }))
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Keep Current Role</option>
          <option value="manager">Manager</option>
          <option value="consultant">Consultant</option>
          <option value="receptionist">Receptionist</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Change Office Assignment
        </label>
        <select
          value={bulkUpdateData.officeId}
          onChange={(e) =>
            setBulkUpdateData((prev) => ({
              ...prev,
              officeId: e.target.value,
            }))
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Keep Current Office</option>
          <option value="null">Remove Office Assignment</option>
          {offices?.map((office) => (
            <option key={office.id} value={office.id}>
              {office.name} - {office.address?.city}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Change Status</label>
        <select
          value={bulkUpdateData.isActive}
          onChange={(e) =>
            setBulkUpdateData((prev) => ({
              ...prev,
              isActive: e.target.value,
            }))
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Keep Current Status</option>
          <option value="true">Activate</option>
          <option value="false">Deactivate</option>
        </select>
      </div>

      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button
          variant="outline"
          onClick={() => {
            onClose();
            setBulkUpdateData({ role: "", officeId: "", isActive: "" });
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleBulkUpdate}
          disabled={
            !bulkUpdateData.role &&
            !bulkUpdateData.officeId &&
            !bulkUpdateData.isActive
          }
        >
          Update Selected Staff
        </Button>
      </div>
    </div>
  </Modal>
);

export const StaffLogsModal = ({
  isOpen,
  onClose,
  selectedUser,
  staffLogs,
  setSelectedUser,
  setStaffLogs,
}) => (
  <Modal
    isOpen={isOpen}
    onClose={() => {
      onClose();
      setSelectedUser(null);
      setStaffLogs([]);
    }}
    title="Staff Activity Logs"
    size="lg"
  >
    <div className="space-y-4">
      <div className="p-3 bg-gray-50 rounded-lg">
        <h3 className="font-medium">{selectedUser?.name}</h3>
        <p className="text-sm text-gray-600">{selectedUser?.email}</p>
        <p className="text-sm text-gray-600">Role: {selectedUser?.role}</p>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {staffLogs.length > 0 ? (
          <div className="space-y-3">
            {staffLogs.map((log, index) => (
              <div key={index} className="border-l-2 border-blue-200 pl-4 pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{log.action}</p>
                    {log.details && (
                      <p className="text-sm text-gray-600 mt-1">
                        {log.details}
                      </p>
                    )}
                    {log.ipAddress && (
                      <p className="text-sm text-gray-500">
                        IP: {log.ipAddress}
                      </p>
                    )}
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 py-8">
            No activity logs available for this staff member
          </p>
        )}
      </div>

      <div className="flex justify-end pt-4 border-t">
        <Button
          variant="outline"
          onClick={() => {
            onClose();
            setSelectedUser(null);
            setStaffLogs([]);
          }}
        >
          Close
        </Button>
      </div>
    </div>
  </Modal>
);
