import React, { useState, useEffect } from "react";
import useManagerStore from "../../stores/useManagerStore";
import usePermissions from "../../hooks/usePermissions";
import managerService from "../../services/managerService";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import AddOrEditConsultantModal from "../../components/manager/AddOrEditConsultantModal";
import { UserPlus, Edit, Trash2, Users, Shield, X } from "lucide-react";
import { toast } from "react-toastify";

const TeamManagement = () => {
  const {
    fetchOfficeReceptionist,
    receptionists,
    setReceptionists,
    consultants,
    loading,
    error,
  } = useManagerStore();
  //   const { hasPermission } = usePermissions();
  //   const [receptionists, setReceptionists] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedReceptionist, setSelectedReceptionist] = useState(null);
  const [receptionistToDelete, setReceptionistToDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    // Fetch staff members and filter for receptionists
    fetchOfficeReceptionist();
  }, []);

  useEffect(() => {
    if (error) {
      toast.error(error, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored",
      });
    }
  }, [error]);

  const handleAddOrEditReceptionist = async (formData) => {
    console.log(formData, "acakscnasncasjncs:1");

    try {
      // Create new receptionist
      const newReceptionist = await managerService.createStaffMember({
        ...formData,
        role: "receptionist",
      });
      console.log(newReceptionist, "acakscnasncasjncs:2");
      await fetchOfficeReceptionist();
    } catch {
      toast.error("Failed to add or update Receptionist");
    }
  };

  const handleDeleteReceptionist = async () => {
    try {
      await managerService.disconnectStaffMember(receptionistToDelete.id);
      const updatedReceptionist = receptionists.filter(
        (rec) => rec.id !== receptionistToDelete.id
      );
      setReceptionists(updatedReceptionist);
      setShowDeleteModal(false);
      setReceptionistToDelete(null);
      toast.success("Receptionist deleted successfully", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored",
      });
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to delete receptionist",
        {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "colored",
        }
      );
    }
  };

  const openDeleteModal = (receptionist) => {
    setReceptionistToDelete(receptionist);
    setShowDeleteModal(true);
  };

  // Pagination
  const totalPages = Math.ceil(receptionists.length / pageSize);
  const paginatedReceptionists = receptionists.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" className="text-blue-600" />
      </div>
    );
  }

  //   if (!hasPermission("manage", "receptionists")) {
  //     return (
  //       <div className="text-center py-8">
  //         <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
  //         <h3 className="text-lg font-medium text-gray-900 mb-2">
  //           Access Denied
  //         </h3>
  //         <p className="text-gray-600">
  //           You do not have permission to manage receptionists.
  //         </p>
  //       </div>
  //     );
  //   }

  return (
    <div className="p-6 space-y-8 bg-gradient-to-br from-gray-50 to-indigo-50 min-h-screen">
      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Receptionist Management
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage your office receptionists
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => setShowAddModal(true)}
          //   disabled={!hasPermission("create", "receptionists")}
          className="bg-blue-600 hover:bg-blue-700 text-white transition-colors duration-200"
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Add Receptionist
        </Button>
      </header>

      {/* Receptionists Table */}
      <Card className="shadow-md hover:shadow-lg transition-shadow duration-300 animate-fade-in bg-white">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 px-6 pt-4">
          Receptionists
        </h3>
        {receptionists.length === 0 ? (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No receptionists found
            </h3>
            <p className="text-gray-600 mb-4">
              Add your first receptionist to get started.
            </p>
            <Button
              variant="primary"
              onClick={() => setShowAddModal(true)}
              //   disabled={!hasPermission("create", "receptionists")}
              className="bg-blue-600 hover:bg-blue-700 text-white transition-colors duration-200"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Add First Receptionist
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedReceptionists.map((receptionist, index) => (
                  <tr
                    key={receptionist.id}
                    className={`hover:bg-indigo-50 transition-colors duration-200 ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50"
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {receptionist.name || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {receptionist.email || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {receptionist.phone || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedReceptionist(receptionist);
                            setShowEditModal(true);
                          }}
                          //   disabled={!hasPermission("edit", "receptionists")}
                          className="border-blue-300 text-blue-600 hover:bg-blue-50 transition-colors duration-200"
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openDeleteModal(receptionist)}
                          //   disabled={!hasPermission("delete", "receptionists")}
                          className="border-red-300 text-red-600 hover:bg-red-50 transition-colors duration-200"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-4 flex justify-between items-center px-6 pb-4">
                <Button
                  variant="outline"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                >
                  Previous
                </Button>
                <span className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Add Receptionist Modal */}
      <AddOrEditConsultantModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddOrEditReceptionist}
        role="receptionist"
      />

      {/* Edit Receptionist Modal */}
      <AddOrEditConsultantModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedReceptionist(null);
        }}
        consultant={selectedReceptionist}
        onSubmit={handleAddOrEditReceptionist}
        role="receptionist"
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteReceptionist}
        receptionistName={receptionistToDelete?.name}
      />
    </div>
  );
};

const DeleteConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  receptionistName,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Confirm Deletion</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Are you sure you want to delete the receptionist{" "}
          <span className="font-medium text-gray-900">
            {receptionistName || "this user"}
          </span>
          ? This action cannot be undone.
        </p>
        <div className="flex justify-end space-x-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors duration-200"
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700 text-white transition-colors duration-200"
          >
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TeamManagement;
