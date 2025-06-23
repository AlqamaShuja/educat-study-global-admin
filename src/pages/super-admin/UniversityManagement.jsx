import React, { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Filter,
  GraduationCap,
  Edit2,
  Trash2,
  Globe,
  MapPin,
  Building,
  Eye,
} from "lucide-react";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Modal from "../../components/ui/Modal";
import UniversityForm from "../../components/forms/UniversityForm";
import useUniversityStore from "../../stores/universityStore";
import { useNavigate } from "react-router-dom";

const UniversityManagement = () => {
  //   const [universities, setUniversities] = useState([]);
  //   const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingUniversity, setEditingUniversity] = useState(null);
  const navigate = useNavigate();

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [countryFilter, setCountryFilter] = useState("");
  const [mouStatusFilter, setMouStatusFilter] = useState("");

  const {
    universities,
    loading,
    fetchUniversities,
    createUniversity,
    updateUniversity,
    deleteUniversity,
  } = useUniversityStore();

  // Fetch universities on component mount
  useEffect(() => {
    fetchUniversities();
  }, []);

  const handleOpenForm = (university = null) => {
    setEditingUniversity(university);
    setIsFormModalOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormModalOpen(false);
    setEditingUniversity(null);
  };

  const handleFormSubmit = async (formData) => {
    try {
      setFormLoading(true);

      if (editingUniversity) {
        await updateUniversity(editingUniversity.id, formData);
      } else {
        await createUniversity(formData);
      }

      handleCloseForm();
    } catch (error) {
      console.error("Error saving university:", error);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      try {
        await deleteUniversity(id);
      } catch (error) {
        console.error("Error deleting university:", error);
      }
    }
  };

  // Get unique countries for filter
  const uniqueCountries = [
    ...new Set(universities?.map((u) => u.country)?.filter(Boolean)),
  ];

  // Filter universities
  const filteredUniversities = universities?.filter((university) => {
    const matchesSearch =
      university.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      university.city?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCountry =
      !countryFilter || university.country === countryFilter;
    const matchesMouStatus =
      !mouStatusFilter || university.mouStatus === mouStatusFilter;

    return matchesSearch && matchesCountry && matchesMouStatus;
  });

  const getMouStatusBadgeColor = (status) => {
    const colors = {
      none: "bg-gray-100 text-gray-800",
      direct: "bg-green-100 text-green-800",
      third_party: "bg-blue-100 text-blue-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getMouStatusLabel = (status) => {
    const labels = {
      none: "No MOU",
      direct: "Direct Partnership",
      third_party: "Third Party",
    };
    return labels[status] || status;
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
            <GraduationCap className="h-7 w-7 text-blue-600" />
            University Management
          </h1>
          <p className="text-gray-600 mt-1">
            Manage university partnerships, details, and course offerings
          </p>
        </div>
        <div className="flex gap-2">
          <div className="bg-white rounded-lg border p-3">
            <div className="text-sm text-gray-500">Total Universities</div>
            <div className="text-2xl font-bold text-gray-900">
              {universities?.length}
            </div>
          </div>
          <div className="bg-white rounded-lg border p-3">
            <div className="text-sm text-gray-500">Partnerships</div>
            <div className="text-2xl font-bold text-green-600">
              {universities?.filter((u) => u.mouStatus !== "none")?.length}
            </div>
          </div>
          <Button
            onClick={() => handleOpenForm()}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add University
          </Button>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search by university name or city..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Country Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <select
              value={countryFilter}
              onChange={(e) => setCountryFilter(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
            >
              <option value="">All Countries</option>
              {uniqueCountries?.map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </select>
          </div>

          {/* MOU Status Filter */}
          <div>
            <select
              value={mouStatusFilter}
              onChange={(e) => setMouStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
            >
              <option value="">All MOU Status</option>
              <option value="none">No MOU</option>
              <option value="direct">Direct Partnership</option>
              <option value="third_party">Third Party</option>
            </select>
          </div>
        </div>
      </div>

      {/* Universities List */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Universities ({filteredUniversities?.length})
          </h2>
        </div>

        {filteredUniversities?.length === 0 ? (
          <div className="p-12 text-center">
            <GraduationCap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No universities found
            </h3>
            <p className="text-gray-600">
              {searchTerm || countryFilter || mouStatusFilter
                ? "Try adjusting your search criteria"
                : "Get started by adding your first university"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    University
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    MOU Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUniversities?.map((university) => (
                  <tr key={university.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {university.name}
                        </div>
                        {university.website && (
                          <div className="text-sm text-gray-500 flex items-center gap-1">
                            <Globe className="h-3 w-3" />
                            <a
                              href={university.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800"
                            >
                              {university.website.replace(/(^\w+:|^)\/\//, "")}
                            </a>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1 text-sm text-gray-900">
                        <MapPin className="h-3 w-3 text-gray-400" />
                        {university.city && `${university.city}, `}
                        {university.country}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getMouStatusBadgeColor(
                          university.mouStatus
                        )}`}
                      >
                        {getMouStatusLabel(university.mouStatus)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="space-y-1">
                        {university.details?.establishedYear && (
                          <div className="flex items-center gap-1">
                            <Building className="h-3 w-3" />
                            Est. {university.details.establishedYear}
                          </div>
                        )}
                        {university.details?.studentPopulation && (
                          <div>
                            {parseInt(
                              university.details.studentPopulation
                            ).toLocaleString()}{" "}
                            students
                          </div>
                        )}
                        {university.details?.ranking && (
                          <div className="text-xs text-blue-600">
                            {university.details.ranking}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          navigate(
                            `/super-admin/university/${university?.id}`,
                            { state: university }
                          )
                        }
                        className="flex items-center gap-1"
                      >
                        <Eye className="h-3 w-3" />
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenForm(university)}
                        className="flex items-center gap-1"
                      >
                        <Edit2 className="h-3 w-3" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handleDelete(university.id, university.name)
                        }
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

      {/* University Form Modal */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={handleCloseForm}
        title={editingUniversity ? "Edit University" : "Add New University"}
        size="xl"
      >
        <UniversityForm
          university={editingUniversity}
          onSubmit={handleFormSubmit}
          onCancel={handleCloseForm}
          loading={formLoading}
          mode={editingUniversity ? "edit" : "create"}
        />
      </Modal>
    </div>
  );
};

export default UniversityManagement;
