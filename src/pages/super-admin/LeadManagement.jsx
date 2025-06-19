import React, { useState, useEffect } from 'react';
import { Search, Filter, Users, Eye, UserCheck, Building } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
// import StudentDetailsModal from "../../components/super-admin/student/StudentDetailsModal";
// import AssignmentModal from '../../components/super-admin/student/AssignmentModal';
import useOfficeStore from '../../stores/officeStore';
import useUserStore from '../../stores/userStore';
import StudentDetailsModal from '../../components/super-admin/Student/StudentDetailsModal';
import AssignmentModal from '../../components/super-admin/Student/AssignmentModal';

const LeadManagement = () => {
  const {
    students,
    isLoading: loading,
    error,
    fetchStudents,
    fetchConsultants,
    users,
  } = useUserStore();

  const { offices, fetchOffices } = useOfficeStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [officeFilter, setOfficeFilter] = useState('');

  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);

  useEffect(() => {
    fetchStudents();
    fetchConsultants();
    fetchOffices();
  }, [fetchStudents, fetchConsultants, fetchOffices]);

  console.log(students, 'asjcasjjscnascnsancsa');

  // Get all leads from students
  const getAllLeads = () => {
    const leads = [];
    students.forEach((student) => {
      if (student.studentLeads && student.studentLeads.length > 0) {
        student.studentLeads.forEach((lead) => {
          leads.push({
            ...lead,
            student: {
              id: student.id,
              name: student.name,
              email: student.email,
              phone: student.phone,
              profile: student.profile,
            },
          });
        });
      }
    });
    return leads;
  };

  const allLeads = getAllLeads();

  // Filter leads
  const filteredLeads = allLeads.filter((lead) => {
    const matchesSearch =
      lead.student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.student.phone?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = !statusFilter || lead.status === statusFilter;
    const matchesSource = !sourceFilter || lead.source === sourceFilter;
    const matchesOffice = !officeFilter || lead.officeId === officeFilter;

    return matchesSearch && matchesStatus && matchesSource && matchesOffice;
  });

  const getStatusBadgeColor = (status) => {
    const colors = {
      new: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-yellow-100 text-yellow-800',
      converted: 'bg-green-100 text-green-800',
      lost: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getSourceBadgeColor = (source) => {
    const colors = {
      walk_in: 'bg-purple-100 text-purple-800',
      online: 'bg-indigo-100 text-indigo-800',
      referral: 'bg-orange-100 text-orange-800',
      'Google OAuth': 'bg-red-100 text-red-800',
      'Facebook OAuth': 'bg-blue-100 text-blue-800',
    };
    return colors[source] || 'bg-gray-100 text-gray-800';
  };

  const getOfficeName = (officeId) => {
    const office = offices.find((o) => o.id === officeId);
    return office ? `${office.name} - ${office.address?.city}` : 'No Office';
  };

  const getConsultantName = (consultantId) => {
    const consultant = users.find((u) => u.id === consultantId);
    return consultant ? consultant.name : 'Unassigned';
  };

  const handleViewDetails = (lead) => {
    setSelectedStudent(lead.student);
    setSelectedLead(lead);
    setIsDetailsModalOpen(true);
  };

  const handleAssignLead = (lead) => {
    setSelectedLead(lead);
    setIsAssignmentModalOpen(true);
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center h-64'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
      </div>
    );
  }

  return (
    <div className='p-6 space-y-6'>
      {/* Header Section */}
      <div className='flex justify-between items-start'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900 flex items-center gap-2'>
            <Users className='h-7 w-7 text-blue-600' />
            Lead Management
          </h1>
          <p className='text-gray-600 mt-1'>
            Manage student leads, assignments, and track conversion progress
          </p>
        </div>
        <div className='flex gap-2'>
          <div className='bg-white rounded-lg border p-3'>
            <div className='text-sm text-gray-500'>Total Leads</div>
            <div className='text-2xl font-bold text-gray-900'>
              {allLeads.length}
            </div>
          </div>
          <div className='bg-white rounded-lg border p-3'>
            <div className='text-sm text-gray-500'>Converted</div>
            <div className='text-2xl font-bold text-green-600'>
              {allLeads.filter((l) => l.status === 'converted').length}
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className='bg-white rounded-lg border border-gray-200 p-4'>
        <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
          {/* Search */}
          <div className='relative'>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4' />
            <Input
              placeholder='Search by name, email, or phone...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className='pl-10'
            />
          </div>

          {/* Status Filter */}
          <div className='relative'>
            <Filter className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4' />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className='w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white'
            >
              <option value=''>All Status</option>
              <option value='new'>New</option>
              <option value='in_progress'>In Progress</option>
              <option value='converted'>Converted</option>
              <option value='lost'>Lost</option>
            </select>
          </div>

          {/* Source Filter */}
          <div>
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white'
            >
              <option value=''>All Sources</option>
              <option value='walk_in'>Walk In</option>
              <option value='online'>Online</option>
              <option value='referral'>Referral</option>
              <option value='Google OAuth'>Google OAuth</option>
              <option value='Facebook OAuth'>Facebook OAuth</option>
            </select>
          </div>

          {/* Office Filter */}
          <div>
            <select
              value={officeFilter}
              onChange={(e) => setOfficeFilter(e.target.value)}
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white'
            >
              <option value=''>All Offices</option>
              {offices.map((office) => (
                <option key={office.id} value={office.id}>
                  {office.name} - {office.address?.city}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Leads List */}
      <div className='bg-white rounded-lg border border-gray-200'>
        <div className='px-6 py-4 border-b border-gray-200'>
          <h2 className='text-lg font-semibold text-gray-900'>
            Student Leads ({filteredLeads.length})
          </h2>
        </div>

        {filteredLeads.length === 0 ? (
          <div className='p-12 text-center'>
            <Users className='h-12 w-12 text-gray-400 mx-auto mb-4' />
            <h3 className='text-lg font-medium text-gray-900 mb-2'>
              No leads found
            </h3>
            <p className='text-gray-600'>
              {searchTerm || statusFilter || sourceFilter || officeFilter
                ? 'Try adjusting your search criteria'
                : 'No student leads available'}
            </p>
          </div>
        ) : (
          <div className='overflow-x-auto'>
            <table className='w-full'>
              <thead className='bg-gray-50'>
                <tr>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Student
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Status
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Source
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Consultant
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Office
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Study Preferences
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className='bg-white divide-y divide-gray-200'>
                {filteredLeads.map((lead) => (
                  <tr key={lead.id} className='hover:bg-gray-50'>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <div>
                        <div className='text-sm font-medium text-gray-900'>
                          {lead.student.name}
                        </div>
                        <div className='text-sm text-gray-500'>
                          {lead.student.email}
                        </div>
                        {lead.student.phone && (
                          <div className='text-sm text-gray-500'>
                            {lead.student.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(
                          lead.status
                        )}`}
                      >
                        {lead.status
                          ?.replace('_', ' ')
                          .replace(/\b\w/g, (l) => l.toUpperCase())}
                      </span>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSourceBadgeColor(
                          lead.source
                        )}`}
                      >
                        {lead.source?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                      {getConsultantName(lead.assignedConsultant)}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                      {getOfficeName(lead.officeId)}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                      <div className='max-w-xs'>
                        <div className='text-sm'>
                          <strong>Destination:</strong>{' '}
                          {lead.studyPreferences?.destination || 'N/A'}
                        </div>
                        <div className='text-sm text-gray-500'>
                          <strong>Level:</strong>{' '}
                          {lead.studyPreferences?.level || 'N/A'}
                        </div>
                      </div>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2'>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => handleViewDetails(lead)}
                        className='flex items-center gap-1'
                      >
                        <Eye className='h-3 w-3' />
                        View
                      </Button>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => handleAssignLead(lead)}
                        className='flex items-center gap-1'
                      >
                        <UserCheck className='h-3 w-3' />
                        Assign
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Student Details Modal */}
      <StudentDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        student={selectedStudent}
        lead={selectedLead}
        offices={offices}
        consultants={users.filter((u) => u.role === 'consultant')}
      />

      {/* Assignment Modal */}
      <AssignmentModal
        isOpen={isAssignmentModalOpen}
        onClose={() => setIsAssignmentModalOpen(false)}
        lead={selectedLead}
        offices={offices}
        consultants={users.filter((u) => u.role === 'consultant')}
        onAssignmentComplete={() => {
          setIsAssignmentModalOpen(false);
          fetchStudents(); // Refresh data
        }}
      />
    </div>
  );
};

export default LeadManagement;
