import React, { useState, useEffect } from 'react';
import useApi from '../../hooks/useApi';
import useAuth from '../../hooks/useAuth';
import usePermissions from '../../hooks/usePermissions';
import { validateContactForm, validateInput } from '../../utils/validators';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
// import Modal from "../../components/modal/Modal";
import Input from '../../components/ui/Input';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Toast from '../../components/ui/Toast';
import DataTable from '../../components/tables/DataTable';
import {
  Contact,
  Plus,
  Edit,
  Trash2,
  Search,
  User,
  Phone,
  Mail,
  Shield,
} from 'lucide-react';
import Modal from '../../components/ui/Modal';

const ContactManagement = () => {
  const { user } = useAuth();
  const { callApi, loading: apiLoading, error: apiError } = useApi();
  const { hasPermission } = usePermissions();
  const [contacts, setContacts] = useState([]);
  const [filters, setFilters] = useState({ search: '', type: '', status: '' });
  const [showModal, setShowModal] = useState({
    show: false,
    mode: 'add',
    contact: null,
  });
  const [formErrors, setFormErrors] = useState({});
  const [toast, setToast] = useState({
    show: false,
    message: '',
    type: 'success',
  });

  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    type: 'client',
    status: 'contact',
    notes: '',
  });

  const contactTypes = [
    { value: 'client', label: 'Client', color: 'bg-blue-100 text-blue-800' },
    {
      value: 'prospect',
      label: 'Prospect',
      color: 'bg-yellow-100 text-yellow-800',
    },
  ];

  const contactStatuses = [
    { value: 'active', label: 'Active', color: 'bg-green-100 text-green-800' },
    { value: 'inactive', label: 'Inactive', color: 'bg-red-100 text-red-800' },
    { value: 'contact', label: 'Contact', color: 'bg-blue-100 text-blue-800' },
  ];

  useEffect(() => {
    if (user && hasPermission('manage', 'contacts')) {
      fetchContacts();
    }
  }, [user]);

  const fetchContacts = async () => {
    try {
      const response = await callApi('GET', '/receptionist/contacts');
      setContacts(
        response?.map((contact) => ({
          id: contact.id,
          name: validateInput(contact.name || 'Unknown'),
          email: validateInput(contact.email || 'N/A'),
          phone: validateInput(contact.phone || 'N/A'),
          type: contact.type,
          status: contact.status,
          notes: validateInput(contact.notes || ''),
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

  const handleSaveContact = async () => {
    const validationErrors = validateContactForm(contactForm);
    if (Object.keys(validationErrors).length) {
      setFormErrors(validationErrors);
      return;
    }

    try {
      const payload = {
        ...contactForm,
        name: validateInput(contactForm.name),
        email: validateInput(contactForm.email),
        phone: validateInput(contactForm.phone),
        notes: validateInput(contactForm.notes),
      };

      if (showModal.mode === 'add') {
        const newContact = await callApi(
          'POST',
          '/receptionist/contacts',
          payload
        );
        setContacts((prev) => [...prev, newContact]);
        setToast({
          show: true,
          message: 'Contact added successfully!',
          type: 'success',
        });
      } else {
        const updatedContact = await callApi(
          'PUT',
          `/receptionist/contacts/${showModal.contact.id}`,
          payload
        );
        setContacts((prev) =>
          prev.map((contact) =>
            contact.id === updatedContact.id ? updatedContact : contact
          )
        );
        setToast({
          show: true,
          message: 'Contact updated successfully!',
          type: 'success',
        });
      }

      setShowModal({ show: false, mode: 'add', contact: null });
      resetForm();
    } catch (error) {
      setToast({
        show: true,
        message: apiError || 'Failed to save contact',
        type: 'error',
      });
    }
  };

  const handleDeleteContact = async (contactId) => {
    if (!window.confirm('Are you sure you want to delete this contact?'))
      return;

    try {
      await callApi('DELETE', `/receptionist/contacts/${contactId}`);
      setContacts((prev) => prev.filter((contact) => contact.id !== contactId));
      setToast({
        show: true,
        message: 'Contact deleted successfully!',
        type: 'success',
      });
    } catch (error) {
      setToast({
        show: true,
        message: apiError || 'Failed to delete contact',
        type: 'error',
      });
    }
  };

  const resetForm = () => {
    setContactForm({
      name: '',
      email: '',
      phone: '',
      type: 'client',
      status: 'contact',
      notes: '',
    });
    setFormErrors({});
  };

  const filteredContacts = contacts.filter((contact) => {
    const matchesSearch =
      !filters.search ||
      contact.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      contact.email.toLowerCase().includes(filters.search.toLowerCase()) ||
      contact.phone.includes(filters.search);
    const matchesType = !filters.type || contact.type === filters.type;
    const matchesStatus = !filters.status || contact.status === filters.status;
    return matchesSearch && matchesType && matchesStatus;
  });

  const getTypeColor = (type) =>
    contactTypes.find((t) => t.value === type)?.color ||
    'bg-gray-100 text-gray-800';

  const getStatusColor = (status) =>
    contactStatuses.find((s) => s.value === status)?.color ||
    'bg-gray-100 text-gray-800';

  const columns = [
    {
      key: 'name',
      label: 'Name',
      render: (contact) => (
        <div className='flex items-center'>
          <User className='h-4 w-4 text-gray-400 mr-2' />
          <span className='text-sm'>{contact.name}</span>
        </div>
      ),
    },
    {
      key: 'email',
      label: 'Email',
      render: (contact) => (
        <div className='flex items-center'>
          <Mail className='h-4 w-4 text-gray-400 mr-2' />
          <span className='text-sm'>{contact.email}</span>
        </div>
      ),
    },
    {
      key: 'phone',
      label: 'Phone',
      render: (contact) => (
        <div className='flex items-center'>
          <Phone className='h-4 w-4 text-gray-400 mr-2' />
          <span className='text-sm'>{contact.phone}</span>
        </div>
      ),
    },
    {
      key: 'type',
      label: 'Type',
      render: (contact) => (
        <Badge className={getTypeColor(contact.type)}>
          {contactTypes.find((t) => t.value === contact.type)?.label}
        </Badge>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (contact) => (
        <Badge className={getStatusColor(contact.status)}>
          {contactStatuses.find((s) => s.value === contact.status)?.label}
        </Badge>
      ),
    },
    {
      key: 'notes',
      label: 'Notes',
      render: (contact) => (
        <span className='text-sm'>{contact.notes || 'N/A'}</span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (contact) => (
        <div className='flex space-x-2'>
          <Button
            size='sm'
            variant='outline'
            onClick={() => {
              setShowModal({ show: true, mode: 'edit', contact });
              setContactForm({
                name: contact.name,
                email: contact.email,
                phone: contact.phone,
                type: contact.type,
                status: contact.status,
                notes: contact.notes,
              });
            }}
            disabled={!hasPermission('edit', 'contacts')}
          >
            <Edit className='h-4 w-4' />
          </Button>
          <Button
            size='sm'
            variant='outline'
            onClick={() => handleDeleteContact(contact.id)}
            className='border-red-300 text-red-600 hover:bg-red-50'
            disabled={!hasPermission('delete', 'contacts')}
          >
            <Trash2 className='h-4 w-4' />
          </Button>
        </div>
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

  if (!hasPermission('manage', 'contacts')) {
    return (
      <div className='text-center py-8'>
        <Shield className='h-12 w-12 text-gray-400 mx-auto mb-4' />
        <h3 className='text-lg font-medium text-gray-900 mb-2'>
          Access Denied
        </h3>
        <p className='text-gray-600'>
          You do not have permission to manage contacts.
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
            Contact Management
          </h1>
          <p className='text-gray-600'>
            Manage client and prospect contact information.
          </p>
        </div>
        <Button
          onClick={() =>
            setShowModal({ show: true, mode: 'add', contact: null })
          }
          disabled={!hasPermission('create', 'contacts')}
        >
          <Plus className='h-4 w-4 mr-2' />
          Add Contact
        </Button>
      </div>

      {/* Filters */}
      <Card className='p-4'>
        <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
          <div className='relative'>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
            <Input
              placeholder='Search by name, email or phone...'
              value={filters.search}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value })
              }
              className='pl-10'
            />
          </div>
          <select
            className='block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500'
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
          >
            <option value=''>All Types</option>
            {contactTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
          <select
            className='block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500'
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          >
            <option value=''>All Statuses</option>
            {contactStatuses.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
          <div className='text-sm text-gray-600 flex items-center'>
            {filteredContacts.length} of {contacts.length} contacts
          </div>
        </div>
      </Card>

      {/* Contacts Table */}
      <Card className='p-4'>
        <h3 className='text-lg font-semibold mb-4'>Contacts</h3>
        {filteredContacts.length === 0 ? (
          <div className='text-center py-8'>
            <Contact className='h-12 w-12 text-gray-400 mx-auto mb-4' />
            <h3 className='text-lg font-medium text-gray-900 mb-2'>
              No contacts found
            </h3>
            <p className='text-gray-600 mb-4'>
              {Object.values(filters).some((f) => f)
                ? 'No contacts match your current filters.'
                : 'Add your first contact to get started.'}
            </p>
            <Button
              onClick={() =>
                setShowModal({ show: true, mode: 'add', contact: null })
              }
              disabled={!hasPermission('create', 'contacts')}
            >
              <Plus className='h-4 w-4 mr-2' />
              Add First Contact
            </Button>
          </div>
        ) : (
          <DataTable
            data={filteredContacts}
            columns={columns}
            pagination={true}
            pageSize={10}
          />
        )}
      </Card>

      {/* Contact Modal */}
      <Modal
        isOpen={showModal.show}
        onClose={() => {
          setShowModal({ show: false, mode: 'add', contact: null });
          resetForm();
        }}
        title={showModal.mode === 'add' ? 'Add Contact' : 'Edit Contact'}
        size='lg'
      >
        <div className='space-y-4'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Name *
            </label>
            <Input
              value={contactForm.name}
              onChange={(e) =>
                setContactForm({ ...contactForm, name: e.target.value })
              }
              placeholder='Enter contact name'
              className={formErrors.name ? 'border-red-500' : ''}
            />
            {formErrors.name && (
              <p className='text-red-500 text-xs mt-1'>{formErrors.name}</p>
            )}
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Email *
            </label>
            <Input
              type='email'
              value={contactForm.email}
              onChange={(e) =>
                setContactForm({ ...contactForm, email: e.target.value })
              }
              placeholder='Enter contact email'
              className={formErrors.email ? 'border-red-500' : ''}
            />
            {formErrors.email && (
              <p className='text-red-500 text-xs mt-1'>{formErrors.email}</p>
            )}
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Phone
            </label>
            <Input
              type='tel'
              value={contactForm.phone}
              onChange={(e) =>
                setContactForm({ ...contactForm, phone: e.target.value })
              }
              placeholder='Enter contact phone'
              className={formErrors.phone ? 'border-red-500' : ''}
            />
            {formErrors.phone && (
              <p className='text-red-500 text-xs mt-1'>{formErrors.phone}</p>
            )}
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Type *
            </label>
            <select
              className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                formErrors.type ? 'border-red-500' : ''
              }`}
              value={contactForm.type}
              onChange={(e) =>
                setContactForm({ ...contactForm, type: e.target.value })
              }
            >
              {contactTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            {formErrors.type && (
              <p className='text-red-500 text-xs mt-1'>{formErrors.type}</p>
            )}
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Status *
            </label>
            <select
              className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                formErrors.status ? 'border-red-500' : ''
              }`}
              value={contactForm.status}
              onChange={(e) =>
                setContactForm({ ...contactForm, status: e.target.value })
              }
            >
              {contactStatuses.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
            {formErrors.status && (
              <p className='text-red-500 text-xs mt-1'>{formErrors.status}</p>
            )}
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Notes
            </label>
            <textarea
              className='block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500'
              rows={3}
              value={contactForm.notes}
              onChange={(e) =>
                setContactForm({ ...contactForm, notes: e.target.value })
              }
              placeholder='Enter any additional notes...'
            />
          </div>
          <div className='flex justify-end space-x-3'>
            <Button
              variant='outline'
              onClick={() => {
                setShowModal({ show: false, mode: 'add', contact: null });
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveContact}>
              {showModal.mode === 'add' ? 'Add Contact' : 'Update Contact'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ContactManagement;
