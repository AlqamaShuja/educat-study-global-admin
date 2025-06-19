import React, { useState, useEffect } from 'react';
import useApi from '../../hooks/useApi';
import useAuth from '../../hooks/useAuth';
import usePermissions from '../../hooks/usePermissions';
import { validateInput } from '../../utils/validators';
import { Link } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Toast from '../../components/ui/Toast';
import DataTable from '../../components/tables/DataTable';
import BarChart from '../../components/charts/BarChart';
import {
  Calendar,
  Contact,
  Check,
  X,
  Search,
  UserCheck,
  Clock,
  Shield,
  Plus,
} from 'lucide-react';

const ReceptionistDashboard = () => {
  const { user } = useAuth();
  const { callApi, loading: apiLoading, error: apiError } = useApi();
  const { hasPermission } = usePermissions();
  const [metrics, setMetrics] = useState({
    totalAppointmentsToday: 0,
    pendingConfirmations: 0,
    newContacts: 0,
  });
  const [appointments, setAppointments] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [filters, setFilters] = useState({ search: '' });
  const [toast, setToast] = useState({
    show: false,
    message: '',
    type: 'success',
  });

  const appointmentStatuses = [
    {
      value: 'scheduled',
      label: 'Scheduled',
      color: 'bg-blue-100 text-blue-800',
    },
    {
      value: 'confirmed',
      label: 'Confirmed',
      color: 'bg-green-100 text-green-800',
    },
    { value: 'rejected', label: 'Rejected', color: 'bg-red-100 text-red-800' },
    {
      value: 'completed',
      label: 'Completed',
      color: 'bg-purple-100 text-purple-800',
    },
  ];

  useEffect(() => {
    if (user && hasPermission('view', 'dashboard')) {
      fetchDashboardData();
      fetchAppointments();
      fetchPendingContacts();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      const response = await callApi('GET', '/receptionist/dashboard');
      setMetrics({
        totalAppointmentsToday: response?.totalAppointmentsToday || 0,
        pendingConfirmations: response?.pendingConfirmations || 0,
        newContacts: response?.newContacts || 0,
      });
    } catch (error) {
      setToast({
        show: true,
        message: apiError || 'Failed to fetch dashboard data',
        type: 'error',
      });
    }
  };

  const fetchAppointments = async () => {
    try {
      const response = await callApi('GET', '/receptionist/appointments', {
        params: { upcoming: true, limit: 5 },
      });
      setAppointments(
        response?.map((appointment) => ({
          id: appointment.id,
          clientName: validateInput(appointment.clientName || 'Unknown'),
          consultantName: validateInput(
            appointment.consultantName || 'Unknown'
          ),
          startTime: appointment.startTime,
          endTime: appointment.endTime,
          status: appointment.status,
        })) || []
      );
    } catch (error) {
      setToast({
        show: true,
        message: apiError || 'Failed to fetch appointments',
        type: 'error',
      });
    }
  };

  const fetchPendingContacts = async () => {
    try {
      const response = await callApi('GET', '/receptionist/contacts', {
        params: { status: 'contact', limit: 5 },
      });
      setContacts(
        response?.map((contact) => ({
          id: contact.id,
          name: validateInput(contact.name || 'Unknown'),
          email: validateInput(contact.email || 'N/A'),
          phone: validateInput(contact.phone || 'N/A'),
          type: contact.type,
          status: contact.status,
        })) || []
      );
    } catch (error) {
      setToast({
        show: true,
        message: apiError || 'Failed to fetch contacts',
        type: 'error',
      });
    }
  };

  const handleConfirmAppointment = async (appointmentId) => {
    try {
      await callApi(
        'PUT',
        `/receptionist/appointments/${appointmentId}/confirm`
      );
      setAppointments((prev) =>
        prev.map((appointment) =>
          appointment.id === appointmentId
            ? { ...appointment, status: 'confirmed' }
            : appointment
        )
      );
      setMetrics((prev) => ({
        ...prev,
        pendingConfirmations: prev.pendingConfirmations - 1,
      }));
      setToast({
        show: true,
        message: 'Appointment confirmed successfully!',
        type: 'success',
      });
    } catch (error) {
      setToast({
        show: true,
        message: apiError || 'Failed to confirm appointment',
        type: 'error',
      });
    }
  };

  const handleRejectAppointment = async (appointmentId) => {
    if (!window.confirm('Are you sure you want to reject this appointment?'))
      return;

    try {
      await callApi(
        'PUT',
        `/receptionist/appointments/${appointmentId}/reject`,
        { reason: 'Rejected via dashboard' }
      );
      setAppointments((prev) =>
        prev.map((appointment) =>
          appointment.id === appointmentId
            ? { ...appointment, status: 'rejected' }
            : appointment
        )
      );
      setMetrics((prev) => ({
        ...prev,
        pendingConfirmations: prev.pendingConfirmations - 1,
      }));
      setToast({
        show: true,
        message: 'Appointment rejected successfully!',
        type: 'success',
      });
    } catch (error) {
      setToast({
        show: true,
        message: apiError || 'Failed to reject appointment',
        type: 'error',
      });
    }
  };

  const filteredAppointments = appointments.filter(
    (appointment) =>
      !filters.search ||
      appointment.clientName
        .toLowerCase()
        .includes(filters.search.toLowerCase()) ||
      appointment.consultantName
        .toLowerCase()
        .includes(filters.search.toLowerCase())
  );

  const filteredContacts = contacts.filter(
    (contact) =>
      !filters.search ||
      contact.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      contact.email.toLowerCase().includes(filters.search.toLowerCase())
  );

  const getStatusColor = (status) =>
    appointmentStatuses.find((s) => s.value === status)?.color ||
    'bg-gray-100 text-gray-800';

  const getChartData = () => {
    return {
      labels: ['Today', 'Yesterday', 'This Week'],
      datasets: [
        {
          label: 'Appointments',
          data: [
            metrics.totalAppointmentsToday,
            metrics.totalAppointmentsToday - 2,
            metrics.totalAppointmentsToday + 5,
          ],
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
        },
      ],
    };
  };

  const appointmentColumns = [
    {
      key: 'clientName',
      label: 'Client',
      render: (appointment) => (
        <div className='flex items-center'>
          <UserCheck className='h-4 w-4 text-gray-400 mr-2' />
          <span className='text-sm'>{appointment.clientName}</span>
        </div>
      ),
    },
    {
      key: 'consultantName',
      label: 'Consultant',
      render: (appointment) => (
        <div className='flex items-center'>
          <UserCheck className='h-4 w-4 text-gray-400 mr-2' />
          <span className='text-sm'>{appointment.consultantName}</span>
        </div>
      ),
    },
    {
      key: 'startTime',
      label: 'Start Time',
      render: (appointment) => (
        <div className='flex items-center text-sm text-gray-600'>
          <Clock className='h-4 w-4 mr-1' />
          {new Date(appointment.startTime).toLocaleString()}
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (appointment) => (
        <Badge className={getStatusColor(appointment.status)}>
          {
            appointmentStatuses.find((s) => s.value === appointment.status)
              ?.label
          }
        </Badge>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (appointment) => (
        <div className='flex space-x-2'>
          {appointment.status === 'scheduled' && (
            <>
              <Button
                size='sm'
                variant='outline'
                onClick={() => handleConfirmAppointment(appointment.id)}
                disabled={!hasPermission('edit', 'appointments')}
                className='border-green-300 text-green-600 hover:bg-green-50'
              >
                <Check className='h-4 w-4' />
              </Button>
              <Button
                size='sm'
                variant='outline'
                onClick={() => handleRejectAppointment(appointment.id)}
                disabled={!hasPermission('edit', 'appointments')}
                className='border-red-300 text-red-600 hover:bg-red-50'
              >
                <X className='h-4 w-4' />
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  const contactColumns = [
    {
      key: 'name',
      label: 'Name',
      render: (contact) => (
        <div className='flex items-center'>
          <UserCheck className='h-4 w-4 text-gray-400 mr-2' />
          <span className='text-sm'>{contact.name}</span>
        </div>
      ),
    },
    {
      key: 'email',
      label: 'Email',
      render: (contact) => <span className='text-sm'>{contact.email}</span>,
    },
    {
      key: 'phone',
      label: 'Phone',
      render: (contact) => <span className='text-sm'>{contact.phone}</span>,
    },
    {
      key: 'type',
      label: 'Type',
      render: (contact) => (
        <Badge
          className={
            contact.type === 'client'
              ? 'bg-blue-100 text-blue-800'
              : 'bg-yellow-100 text-yellow-800'
          }
        >
          {contact.type === 'client' ? 'Client' : 'Prospect'}
        </Badge>
      ),
    },
  ];

  if (apiLoading) {
    return (
      <div className='flex items-center justify-center h-64'>
        <LoadingSpinner size='lg' />
      </div>
    );
  }

  if (!hasPermission('view', 'dashboard')) {
    return (
      <div className='text-center py-8'>
        <Shield className='h-12 w-12 text-gray-400 mx-auto mb-4' />
        <h3 className='text-lg font-medium text-gray-900 mb-2'>
          Access Denied
        </h3>
        <p className='text-gray-600'>
          You do not have permission to view the dashboard.
        </p>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <Toast
        isOpen={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, show: false })}
      />

      {/* Header */}
      <div className='flex justify-between items-center'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>
            Receptionist Dashboard
          </h1>
          <p className='text-gray-600'>
            Overview of your tasks and key metrics.
          </p>
        </div>
      </div>

      {/* Metrics */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        <Card className='p-4'>
          <div className='flex items-center justify-between'>
            <div>
              <h3 className='text-lg font-semibold text-gray-900'>
                Appointments Today
              </h3>
              <p className='text-2xl font-bold text-indigo-600'>
                {metrics.totalAppointmentsToday}
              </p>
            </div>
            <Calendar className='h-8 w-8 text-indigo-600' />
          </div>
        </Card>
        <Card className='p-4'>
          <div className='flex items-center justify-between'>
            <div>
              <h3 className='text-lg font-semibold text-gray-900'>
                Pending Confirmations
              </h3>
              <p className='text-2xl font-bold text-yellow-600'>
                {metrics.pendingConfirmations}
              </p>
            </div>
            <Check className='h-8 w-8 text-yellow-600' />
          </div>
        </Card>
        <Card className='p-4'>
          <div className='flex items-center justify-between'>
            <div>
              <h3 className='text-lg font-semibold text-gray-900'>
                New Contacts
              </h3>
              <p className='text-2xl font-bold text-green-600'>
                {metrics.newContacts}
              </p>
            </div>
            <Contact className='h-8 w-8 text-green-600' />
          </div>
        </Card>
      </div>

      {/* Search */}
      <Card className='p-4'>
        <div className='relative'>
          <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
          <Input
            placeholder='Search appointments or contacts...'
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className='pl-10'
          />
        </div>
      </Card>

      {/* Quick Actions */}
      <Card className='p-4'>
        <h3 className='text-lg font-semibold mb-4'>Quick Actions</h3>
        <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
          <Link to='/receptionist/appointments/booking'>
            <Button className='w-full'>
              <Plus className='h-4 w-4 mr-2' />
              Book Appointment
            </Button>
          </Link>
          <Link to='/receptionist/appointments/confirmations'>
            <Button className='w-full'>
              <Check className='h-4 w-4 mr-2' />
              Confirm Appointments
            </Button>
          </Link>
          <Link to='/receptionist/consultant-calendars'>
            <Button className='w-full'>
              <Calendar className='h-4 w-4 mr-2' />
              View Calendars
            </Button>
          </Link>
          <Link to='/receptionist/contact-management'>
            <Button className='w-full'>
              <Contact className='h-4 w-4 mr-2' />
              Manage Contacts
            </Button>
          </Link>
        </div>
      </Card>

      {/* Appointments Chart */}
      <Card className='p-4'>
        <h3 className='text-lg font-semibold mb-4'>Appointment Trends</h3>
        <div className='h-64'>
          <BarChart data={getChartData()} />
        </div>
      </Card>

      {/* Upcoming Appointments */}
      <Card className='p-4'>
        <h3 className='text-lg font-semibold mb-4'>Upcoming Appointments</h3>
        {filteredAppointments.length === 0 ? (
          <div className='text-center py-8'>
            <Calendar className='h-12 w-12 text-gray-400 mx-auto mb-4' />
            <p className='text-gray-600'>No upcoming appointments found.</p>
          </div>
        ) : (
          <DataTable
            data={filteredAppointments}
            columns={appointmentColumns}
            pagination={false}
          />
        )}
      </Card>

      {/* Pending Contacts */}
      <Card className='p-4'>
        <h3 className='text-lg font-semibold mb-4'>Pending Contacts</h3>
        {filteredContacts.length === 0 ? (
          <div className='text-center py-8'>
            <Contact className='h-12 w-12 text-gray-400 mx-auto mb-4' />
            <p className='text-gray-600'>No pending contacts found.</p>
          </div>
        ) : (
          <DataTable
            data={filteredContacts}
            columns={contactColumns}
            pagination={false}
          />
        )}
      </Card>
    </div>
  );
};

export default ReceptionistDashboard;
