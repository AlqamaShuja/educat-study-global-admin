import React, { useState } from 'react';
import { format } from 'date-fns';
import {
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  User,
  Calendar,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { STATUS_CONFIG, STAGE_CONFIG } from '../../constants/applicationConstants';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import Modal from '../ui/Modal';
import ApplicationDetailModal from './ApplicationDetailModal';
import ApplicationReviewModal from './ApplicationReviewModal';

const ApplicationsTable = ({
  applications = [],
  loading = false,
  onView,
  onEdit,
  onDelete,
  onReview,
  showConsultant = false,
  showActions = true,
  showEdit = true,
  showDelete = true, // New prop to control delete button visibility
  className = ''
}) => {
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleView = (application) => {
    setSelectedApplication(application);
    setShowDetailModal(true);
    onView?.(application);
  };

  const handleEdit = (application) => {
    setSelectedApplication(application);
    setShowReviewModal(true);
    onEdit?.(application);
  };

  const handleDelete = (application) => {
    setSelectedApplication(application);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (selectedApplication) {
      await onDelete?.(selectedApplication.id);
      setShowDeleteModal(false);
      setSelectedApplication(null);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'in_review':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'submitted':
        return <FileText className="h-4 w-4 text-yellow-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStageIcon = (stage) => {
    switch (stage) {
      case 'profile_review':
        return <User className="h-4 w-4 text-blue-500" />;
      case 'university_selection':
        return <Calendar className="h-4 w-4 text-purple-500" />;
      case 'document_preparation':
        return <FileText className="h-4 w-4 text-yellow-500" />;
      case 'submission':
        return <CheckCircle className="h-4 w-4 text-orange-500" />;
      case 'offer_management':
        return <CheckCircle className="h-4 w-4 text-indigo-500" />;
      case 'visa_application':
        return <FileText className="h-4 w-4 text-teal-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className={`bg-white/90 backdrop-blur-sm rounded-lg shadow-lg ${className}`}>
        <div className="p-6">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-blue-100 rounded w-3/4 animate-pulse" />
                  <div className="h-3 bg-blue-100 rounded w-1/2 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

    return (
    <>
      <div className={`bg-white/90 backdrop-blur-sm rounded-lg shadow-lg overflow-hidden ${className}`}>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-blue-100">
            <thead className="bg-gradient-to-r from-blue-50 to-purple-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Student
                </th>
                {showConsultant && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Consultant
                  </th>
                )}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Stage
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Submission Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Updated
                </th>
                {showActions && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white/70 backdrop-blur-sm divide-y divide-blue-100">
              {applications.map((application) => (
                <tr key={application.id} className="hover:bg-blue-50/50 transition-colors duration-200">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                          <User className="h-5 w-5 text-blue-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {application.student?.name || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-600">
                          {application.student?.email || 'N/A'}
                        </div>
                      </div>
                    </div>
                  </td>
                  {showConsultant && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {application.consultant?.name || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-600">
                        {application.consultant?.email || 'N/A'}
                      </div>
                    </td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getStatusIcon(application.status)}
                      <Badge
                        variant="outline"
                        className={`ml-2 text-xs ${STATUS_CONFIG[application.status]?.color || 'text-gray-600'}`}
                      >
                        {STATUS_CONFIG[application.status]?.label || application.status}
                      </Badge>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getStageIcon(application.stage)}
                      <Badge
                        variant="outline"
                        className={`ml-2 text-xs ${STAGE_CONFIG[application.stage]?.color || 'text-gray-600'}`}
                      >
                        {STAGE_CONFIG[application.stage]?.label || application.stage}
                      </Badge>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {application.submissionDate
                      ? (() => {
                          try {
                            const date = new Date(application.submissionDate);
                            return isNaN(date.getTime()) ? 'Invalid date' : format(date, 'MMM dd, yyyy');
                          } catch (error) {
                            return 'Invalid date';
                          }
                        })()
                      : 'Not submitted'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {application.updatedAt
                      ? (() => {
                          try {
                            const date = new Date(application.updatedAt);
                            return isNaN(date.getTime()) ? 'Invalid date' : format(date, 'MMM dd, yyyy');
                          } catch (error) {
                            return 'Invalid date';
                          }
                        })()
                      : 'N/A'}
                  </td>
                  {showActions && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleView(application)}
                          className="p-1"
                          title="View details"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {showEdit && <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(application)}
                          className="p-1"
                          title="Edit application"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>}
                        {showDelete && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(application)}
                            className="p-1 text-red-600 hover:text-red-700"
                            title="Delete application"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" className="p-1">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {applications.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mb-4">
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No applications found
            </h3>
            <p className="text-gray-600">
              There are no applications to display at the moment.
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default ApplicationsTable; 