import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Mail, Phone, MapPin, Calendar, Shield, ToggleLeft, ArrowLeft } from 'lucide-react';
import Button from '../../components/ui/Button';
import useUserStore from '../../stores/userStore';
import { toast } from 'react-toastify';

const StaffDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const { getStaffById, currentStaff } = useUserStore();

  useEffect(() => {
    const fetchStaffDetails = async () => {
      try {
        setLoading(true);
        await getStaffById(id);
      } catch (error) {
        toast.error('Failed to fetch staff details');
        console.error('Error fetching staff details:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchStaffDetails();
    }
  }, [id, getStaffById]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!currentStaff) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-lg text-gray-600 mb-4">Staff member not found</p>
        <Button onClick={() => navigate('/super-admin/staff')} variant="outline" className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Staff List
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <Button 
          onClick={() => navigate('/super-admin/staff')} 
          variant="outline" 
          className="mb-6 flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Staff List
        </Button>

        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8 p-6">
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-3xl font-bold text-primary">
                {currentStaff.name?.charAt(0)?.toUpperCase()}
              </span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">{currentStaff.name}</h1>
              <p className="text-gray-600">{currentStaff.role}</p>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="text-gray-900">{currentStaff.email}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="text-gray-900">{currentStaff.phone || 'Not provided'}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm text-gray-500">Office</p>
                  <p className="text-gray-900">{currentStaff.office?.name || 'Not Assigned'}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Shield className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm text-gray-500">Role</p>
                  <p className="text-gray-900 capitalize">{currentStaff.role?.replace('_', ' ')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Account Status */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Status</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center space-x-3">
                <ToggleLeft className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <p className={`text-gray-900 ${currentStaff.isActive ? 'text-green-600' : 'text-red-600'}`}>
                    {currentStaff.isActive ? 'Active' : 'Inactive'}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm text-gray-500">Join Date</p>
                  <p className="text-gray-900">
                    {currentStaff.createdAt 
                      ? new Date(currentStaff.createdAt).toLocaleDateString()
                      : 'Not available'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffDetails;