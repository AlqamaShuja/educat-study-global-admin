export const permissions = {
  super_admin: {
    users: {
      create: true,
      read: true,
      update: true,
      delete: true,
    },
    offices: {
      create: true,
      read: true,
      update: true,
      delete: true,
      assignStaff: true,
    },
    leads: {
      read: true,
      update: true,
      assign: true,
      reassign: true,
      import: true,
      export: true,
    },
    appointments: {
      read: true,
      update: true,
    },
    documents: {
      read: true,
      upload: true,
      delete: true,
    },
    universities: {
      create: true,
      read: true,
      update: true,
      delete: true,
    },
    courses: {
      create: true,
      read: true,
      update: true,
      delete: true,
    },
    reports: {
      generate: true,
      export: true,
    },
    settings: {
      update: true,
    },
    notifications: {
      send: true,
      read: true,
    },
  },
  manager: {
    users: {
      create: false,
      read: true, // Limited to office staff
      update: true, // Limited to office staff
      delete: false,
    },
    offices: {
      create: false,
      read: true, // Limited to assigned office
      update: true, // Limited to assigned office
      delete: false,
      assignStaff: true, // Within office
    },
    leads: {
      read: true, // Limited to office
      update: true, // Limited to office
      assign: true, // Within office
      reassign: true, // Within office
      import: false,
      export: true,
    },
    appointments: {
      read: true, // Office staff
      update: true, // Office staff
    },
    documents: {
      read: true, // Office leads
      upload: true,
      delete: false,
    },
    universities: {
      read: true,
    },
    courses: {
      read: true,
    },
    reports: {
      generate: true, // Office-specific
      export: true,
    },
    notifications: {
      send: true, // Office-specific
      read: true,
    },
  },
  consultant: {
    users: {
      read: true, // Own profile only
      update: true, // Own profile only
    },
    offices: {
      read: true, // Assigned office
    },
    leads: {
      read: true, // Assigned leads
      update: true, // Assigned leads
      assign: false,
      reassign: false,
    },
    appointments: {
      read: true, // Own appointments
      update: true, // Own appointments
    },
    documents: {
      read: true, // Assigned leads
      upload: true,
      delete: false,
    },
    universities: {
      read: true,
    },
    courses: {
      read: true,
    },
    reports: {
      generate: true, // Personal performance
    },
    notifications: {
      send: true, // To assigned students
      read: true,
    },
  },
  receptionist: {
    users: {
      read: true, // Limited to contact info
      update: true, // Contact info only
    },
    offices: {
      read: true, // Assigned office
    },
    leads: {
      read: true, // Office leads
      update: true, // Contact info
      assign: false,
    },
    appointments: {
      read: true, // Office appointments
      update: true, // Booking and confirmations
    },
    documents: {
      read: true, // Office leads
      upload: true,
    },
    notifications: {
      send: true, // Appointment-related
      read: true,
    },
  },
  student: {
    users: {
      read: true, // Own profile
      update: true, // Own profile
    },
    leads: {
      read: true, // Own lead
    },
    appointments: {
      read: true, // Own appointments
      update: true, // Booking only
    },
    documents: {
      read: true, // Own documents
      upload: true,
    },
    universities: {
      read: true,
    },
    courses: {
      read: true,
    },
    notifications: {
      read: true,
    },
  },
};

// Utility to check if a user has a specific permission
export const hasPermission = (role, resource, action) => {
  return permissions[role]?.[resource]?.[action] || false;
};
