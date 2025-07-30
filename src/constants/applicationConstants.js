// Application Status Options
export const APPLICATION_STATUS = {
  DRAFT: 'draft',
  IN_REVIEW: 'in_review',
  SUBMITTED: 'submitted',
  OFFERS_RECEIVED: 'offers_received',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
  VISA_APPLIED: 'visa_applied',
  COMPLETED: 'completed'
};

// Application Stage Options
export const APPLICATION_STAGE = {
  PROFILE_REVIEW: 'profile_review',
  UNIVERSITY_SELECTION: 'university_selection',
  DOCUMENT_PREPARATION: 'document_preparation',
  SUBMISSION: 'submission',
  OFFER_MANAGEMENT: 'offer_management',
  VISA_APPLICATION: 'visa_application',
  COMPLETED: 'completed'
};

// Status configuration for UI display
export const STATUS_CONFIG = {
  [APPLICATION_STATUS.DRAFT]: {
    label: 'Draft',
    color: 'text-gray-600',
    bg: 'bg-gray-100',
    border: 'border-gray-200'
  },
  [APPLICATION_STATUS.IN_REVIEW]: {
    label: 'In Review',
    color: 'text-blue-600',
    bg: 'bg-blue-100',
    border: 'border-blue-200'
  },
  [APPLICATION_STATUS.SUBMITTED]: {
    label: 'Submitted',
    color: 'text-yellow-600',
    bg: 'bg-yellow-100',
    border: 'border-yellow-200'
  },
  [APPLICATION_STATUS.OFFERS_RECEIVED]: {
    label: 'Offers Received',
    color: 'text-purple-600',
    bg: 'bg-purple-100',
    border: 'border-purple-200'
  },
  [APPLICATION_STATUS.ACCEPTED]: {
    label: 'Accepted',
    color: 'text-green-600',
    bg: 'bg-green-100',
    border: 'border-green-200'
  },
  [APPLICATION_STATUS.REJECTED]: {
    label: 'Rejected',
    color: 'text-red-600',
    bg: 'bg-red-100',
    border: 'border-red-200'
  },
  [APPLICATION_STATUS.VISA_APPLIED]: {
    label: 'Visa Applied',
    color: 'text-indigo-600',
    bg: 'bg-indigo-100',
    border: 'border-indigo-200'
  },
  [APPLICATION_STATUS.COMPLETED]: {
    label: 'Completed',
    color: 'text-teal-600',
    bg: 'bg-teal-100',
    border: 'border-teal-200'
  }
};

// Stage configuration for UI display
export const STAGE_CONFIG = {
  [APPLICATION_STAGE.PROFILE_REVIEW]: {
    label: 'Profile Review',
    color: 'text-blue-600',
    bg: 'bg-blue-100',
    border: 'border-blue-200'
  },
  [APPLICATION_STAGE.UNIVERSITY_SELECTION]: {
    label: 'University Selection',
    color: 'text-purple-600',
    bg: 'bg-purple-100',
    border: 'border-purple-200'
  },
  [APPLICATION_STAGE.DOCUMENT_PREPARATION]: {
    label: 'Document Preparation',
    color: 'text-yellow-600',
    bg: 'bg-yellow-100',
    border: 'border-yellow-200'
  },
  [APPLICATION_STAGE.SUBMISSION]: {
    label: 'Submission',
    color: 'text-orange-600',
    bg: 'bg-orange-100',
    border: 'border-orange-200'
  },
  [APPLICATION_STAGE.OFFER_MANAGEMENT]: {
    label: 'Offer Management',
    color: 'text-indigo-600',
    bg: 'bg-indigo-100',
    border: 'border-indigo-200'
  },
  [APPLICATION_STAGE.VISA_APPLICATION]: {
    label: 'Visa Application',
    color: 'text-teal-600',
    bg: 'bg-teal-100',
    border: 'border-teal-200'
  },
  [APPLICATION_STAGE.COMPLETED]: {
    label: 'Completed',
    color: 'text-green-600',
    bg: 'bg-green-100',
    border: 'border-green-200'
  }
};

// Status options for dropdowns
export const STATUS_OPTIONS = Object.entries(STATUS_CONFIG).map(([value, config]) => ({
  value,
  label: config.label
}));

// Stage options for dropdowns
export const STAGE_OPTIONS = Object.entries(STAGE_CONFIG).map(([value, config]) => ({
  value,
  label: config.label
})); 