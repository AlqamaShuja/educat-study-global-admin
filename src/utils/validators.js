// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Phone validation regex (international format)
const PHONE_REGEX = /^\+?\d{10,15}$/;

// Password validation regex (at least 8 chars, 1 uppercase, 1 lowercase, 1 number)
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;

// URL validation regex
const URL_REGEX =
  /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/;

// Existing validators from your code
export const validateScheduleForm = (form) => {
  const errors = {};
  if (!form.staffId) errors.staffId = "Staff selection is required";
  if (!form.startTime) errors.startTime = "Start time is required";
  if (!form.endTime) errors.endTime = "End time is required";
  else if (new Date(form.endTime) <= new Date(form.startTime))
    errors.endTime = "End time must be after start time";
  if (!form.type) errors.type = "Type is required";
  if (!form.status) errors.status = "Status is required";
  return errors;
};

export const validateTeamMemberForm = (form) => {
  const errors = {};
  if (!form.name.trim()) errors.name = "Name is required";
  if (!form.email.trim()) errors.email = "Email is required";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
    errors.email = "Invalid email format";
  if (!form.role) errors.role = "Role is required";
  if (!form.status) errors.status = "Status is required";
  return errors;
};

export const validateInput = (input) => {
  const div = document.createElement("div");
  div.textContent = input;
  return div.innerHTML;
};

export const validateTaskForm = (form) => {
  const errors = {};
  if (!form.title.trim()) errors.title = "Task title is required";
  if (!form.studentId) errors.studentId = "Student selection is required";
  if (!form.dueDate) errors.dueDate = "Due date is required";
  return errors;
};

export const validateLeadForm = (form) => {
  const errors = {};
  if (!form.assignedTo) errors.assignedTo = "Consultant selection is required";
  if (!form.status) errors.status = "Status is required";
  return errors;
};

export const validateLeadAssignmentForm = (form) => {
  const errors = {};
  if (!form.assignedTo) errors.assignedTo = "Consultant selection is required";
  if (!form.status) errors.status = "Status is required";
  return errors;
};

export const validateAppointmentForm = (form) => {
  const errors = {};
  if (!form.clientId) errors.clientId = "Client selection is required";
  if (!form.consultantId)
    errors.consultantId = "Consultant selection is required";
  if (!form.startTime) errors.startTime = "Start time is required";
  if (!form.endTime) errors.endTime = "End time is required";
  else if (new Date(form.endTime) <= new Date(form.startTime))
    errors.endTime = "End time must be after start time";
  if (!form.status) errors.status = "Status is required";
  return errors;
};

export const validateRejectionForm = (form) => {
  const errors = {};
  if (!form.reason.trim()) errors.reason = "Rejection reason is required";
  return errors;
};

export const validateContactForm = (form) => {
  const errors = {};
  if (!form.name.trim()) errors.name = "Name is required";
  if (!form.email.trim()) errors.email = "Email is required";
  else if (!/\S+@\S+\.\S+/.test(form.email))
    errors.email = "Invalid email format";
  if (form.phone && !/^\+?\d{10,15}$/.test(form.phone.replace(/\s/g, "")))
    errors.phone = "Invalid phone number";
  if (!form.type) errors.type = "Type is required";
  if (!form.status) errors.status = "Status is required";
  return errors;
};

export const validateWaitingListForm = (form) => {
  const errors = {};
  if (!form.clientName.trim()) errors.clientName = "Client name is required";
  if (!form.email.trim()) errors.email = "Email is required";
  else if (!/\S+@\S+\.\S+/.test(form.email))
    errors.email = "Invalid email format";
  if (form.phone && !/^\+?\d{10,15}$/.test(form.phone.replace(/\s/g, "")))
    errors.phone = "Invalid phone number";
  if (!form.status) errors.status = "Status is required";
  return errors;
};

export const validateWalkInForm = (form) => {
  const errors = {};
  if (!form.clientName.trim()) errors.clientName = "Client name is required";
  if (!form.email.trim()) errors.email = "Email is required";
  else if (!/\S+@\S+\.\S+/.test(form.email))
    errors.email = "Invalid email format";
  if (form.phone && !/^\+?\d{10,15}$/.test(form.phone.replace(/\s/g, "")))
    errors.phone = "Invalid phone number";
  if (!form.purpose.trim()) errors.purpose = "Purpose of visit is required";
  if (!form.action) errors.action = "Action is required";
  return errors;
};

export const validateCourseForm = (form) => {
  const errors = {};
  if (!form.title.trim()) errors.title = "Title is required";
  if (!form.duration || form.duration <= 0)
    errors.duration = "Valid duration is required";
  if (!form.status) errors.status = "Status is required";
  return errors;
};

export const validateOfficeForm = (form) => {
  const errors = {};
  if (!form.name.trim()) errors.name = "Office name is required";
  if (!form.address.trim()) errors.address = "Address is required";
  if (!form.city.trim()) errors.city = "City is required";
  if (!form.state.trim()) errors.state = "State is required";
  if (!form.zipCode.trim()) errors.zipCode = "Zip code is required";
  if (form.phone && !/^\+?\d{10,15}$/.test(form.phone.replace(/\s/g, "")))
    errors.phone = "Invalid phone number";
  if (form.email && !/\S+@\S+\.\S+/.test(form.email))
    errors.email = "Invalid email format";
  return errors;
};

export const validateStaffForm = (form, isEdit) => {
  const errors = {};
  if (!form.name.trim()) errors.name = "Name is required";
  if (!form.email.trim()) errors.email = "Email is required";
  else if (!/\S+@\S+\.\S+/.test(form.email))
    errors.email = "Invalid email format";
  if (!isEdit && !form.password) errors.password = "Password is required";
  else if (!isEdit && form.password.length < 8)
    errors.password = "Password must be at least 8 characters";
  if (!form.role) errors.role = "Role is required";
  if (!form.status) errors.status = "Status is required";
  return errors;
};

// Additional comprehensive validators

/**
 * Validate authentication forms
 */
export const validateLoginForm = (form) => {
  const errors = {};
  if (!form.email?.trim()) {
    errors.email = "Email is required";
  } else if (!EMAIL_REGEX.test(form.email)) {
    errors.email = "Invalid email format";
  }

  if (!form.password) {
    errors.password = "Password is required";
  } else if (form.password.length < 6) {
    errors.password = "Password must be at least 6 characters";
  }

  return errors;
};

export const validateSignupForm = (form) => {
  const errors = {};

  if (!form.name?.trim()) {
    errors.name = "Full name is required";
  } else if (form.name.trim().length < 2) {
    errors.name = "Name must be at least 2 characters";
  }

  if (!form.email?.trim()) {
    errors.email = "Email is required";
  } else if (!EMAIL_REGEX.test(form.email)) {
    errors.email = "Invalid email format";
  }

  if (!form.password) {
    errors.password = "Password is required";
  } else if (form.password.length < 8) {
    errors.password = "Password must be at least 8 characters";
  } else if (!PASSWORD_REGEX.test(form.password)) {
    errors.password = "Password must contain uppercase, lowercase, and number";
  }

  if (form.confirmPassword !== form.password) {
    errors.confirmPassword = "Passwords do not match";
  }

  if (form.phone && !PHONE_REGEX.test(form.phone.replace(/[\s\-\(\)]/g, ""))) {
    errors.phone = "Invalid phone number format";
  }

  return errors;
};

export const validatePasswordResetForm = (form) => {
  const errors = {};

  if (!form.email?.trim()) {
    errors.email = "Email is required";
  } else if (!EMAIL_REGEX.test(form.email)) {
    errors.email = "Invalid email format";
  }

  return errors;
};

export const validateChangePasswordForm = (form) => {
  const errors = {};

  if (!form.currentPassword) {
    errors.currentPassword = "Current password is required";
  }

  if (!form.newPassword) {
    errors.newPassword = "New password is required";
  } else if (form.newPassword.length < 8) {
    errors.newPassword = "Password must be at least 8 characters";
  } else if (!PASSWORD_REGEX.test(form.newPassword)) {
    errors.newPassword =
      "Password must contain uppercase, lowercase, and number";
  }

  if (form.confirmPassword !== form.newPassword) {
    errors.confirmPassword = "Passwords do not match";
  }

  if (form.currentPassword === form.newPassword) {
    errors.newPassword = "New password must be different from current password";
  }

  return errors;
};

/**
 * Validate student profile forms
 */
export const validateStudentProfileForm = (form) => {
  const errors = {};

  // Personal Information
  if (!form.personalInfo?.name?.trim()) {
    errors["personalInfo.name"] = "Full name is required";
  }

  if (!form.personalInfo?.email?.trim()) {
    errors["personalInfo.email"] = "Email is required";
  } else if (!EMAIL_REGEX.test(form.personalInfo.email)) {
    errors["personalInfo.email"] = "Invalid email format";
  }

  if (!form.personalInfo?.dateOfBirth) {
    errors["personalInfo.dateOfBirth"] = "Date of birth is required";
  } else {
    const age =
      new Date().getFullYear() -
      new Date(form.personalInfo.dateOfBirth).getFullYear();
    if (age < 16 || age > 80) {
      errors["personalInfo.dateOfBirth"] = "Invalid age range";
    }
  }

  if (!form.personalInfo?.nationality?.trim()) {
    errors["personalInfo.nationality"] = "Nationality is required";
  }

  if (
    form.personalInfo?.phone &&
    !PHONE_REGEX.test(form.personalInfo.phone.replace(/[\s\-\(\)]/g, ""))
  ) {
    errors["personalInfo.phone"] = "Invalid phone number format";
  }

  // Educational Background
  if (!form.educationalBackground?.highestQualification?.trim()) {
    errors["educationalBackground.highestQualification"] =
      "Highest qualification is required";
  }

  if (!form.educationalBackground?.institution?.trim()) {
    errors["educationalBackground.institution"] =
      "Institution name is required";
  }

  if (!form.educationalBackground?.graduationYear) {
    errors["educationalBackground.graduationYear"] =
      "Graduation year is required";
  } else {
    const year = parseInt(form.educationalBackground.graduationYear);
    const currentYear = new Date().getFullYear();
    if (year < 1950 || year > currentYear + 10) {
      errors["educationalBackground.graduationYear"] =
        "Invalid graduation year";
    }
  }

  // Study Preferences
  if (!form.studyPreferences?.destination?.trim()) {
    errors["studyPreferences.destination"] = "Study destination is required";
  }

  if (!form.studyPreferences?.level?.trim()) {
    errors["studyPreferences.level"] = "Study level is required";
  }

  if (!form.studyPreferences?.fieldOfStudy?.trim()) {
    errors["studyPreferences.fieldOfStudy"] = "Field of study is required";
  }

  return errors;
};

/**
 * Validate lead management forms
 */
export const validateLeadCreationForm = (form) => {
  const errors = {};

  // Student Data
  if (!form.studentData?.name?.trim()) {
    errors["studentData.name"] = "Student name is required";
  }

  if (!form.studentData?.email?.trim()) {
    errors["studentData.email"] = "Student email is required";
  } else if (!EMAIL_REGEX.test(form.studentData.email)) {
    errors["studentData.email"] = "Invalid email format";
  }

  if (
    form.studentData?.phone &&
    !PHONE_REGEX.test(form.studentData.phone.replace(/[\s\-\(\)]/g, ""))
  ) {
    errors["studentData.phone"] = "Invalid phone number format";
  }

  // Study Preferences
  if (!form.studyPreferences?.destination?.trim()) {
    errors["studyPreferences.destination"] = "Study destination is required";
  }

  if (!form.studyPreferences?.level?.trim()) {
    errors["studyPreferences.level"] = "Study level is required";
  }

  // Source validation
  if (!form.source) {
    errors.source = "Lead source is required";
  }

  return errors;
};

export const validateLeadDistributionRuleForm = (form) => {
  const errors = {};

  if (!form.name?.trim()) {
    errors.name = "Rule name is required";
  }

  if (!form.priority || form.priority < 1 || form.priority > 5) {
    errors.priority = "Priority must be between 1 and 5";
  }

  if (!form.officeId) {
    errors.officeId = "Target office is required";
  }

  return errors;
};

/**
 * Validate office management forms
 */
export const validateOfficeCreationForm = (form) => {
  const errors = {};

  if (!form.name?.trim()) {
    errors.name = "Office name is required";
  }

  // Address validation
  if (!form.address?.street?.trim()) {
    errors["address.street"] = "Street address is required";
  }

  if (!form.address?.city?.trim()) {
    errors["address.city"] = "City is required";
  }

  if (!form.address?.country?.trim()) {
    errors["address.country"] = "Country is required";
  }

  // Contact validation
  if (!form.contact?.phone?.trim()) {
    errors["contact.phone"] = "Phone number is required";
  } else if (!PHONE_REGEX.test(form.contact.phone.replace(/[\s\-\(\)]/g, ""))) {
    errors["contact.phone"] = "Invalid phone number format";
  }

  if (!form.contact?.email?.trim()) {
    errors["contact.email"] = "Email is required";
  } else if (!EMAIL_REGEX.test(form.contact.email)) {
    errors["contact.email"] = "Invalid email format";
  }

  if (form.contact?.website && !URL_REGEX.test(form.contact.website)) {
    errors["contact.website"] = "Invalid website URL";
  }

  // Service capacity validation
  if (
    !form.serviceCapacity?.maxAppointments ||
    form.serviceCapacity.maxAppointments < 1
  ) {
    errors["serviceCapacity.maxAppointments"] =
      "Max appointments must be at least 1";
  }

  if (
    !form.serviceCapacity?.maxConsultants ||
    form.serviceCapacity.maxConsultants < 1
  ) {
    errors["serviceCapacity.maxConsultants"] =
      "Max consultants must be at least 1";
  }

  return errors;
};

/**
 * Validate appointment forms
 */
export const validateAppointmentCreationForm = (form) => {
  const errors = {};

  if (!form.studentId) {
    errors.studentId = "Student selection is required";
  }

  if (!form.consultantId) {
    errors.consultantId = "Consultant selection is required";
  }

  if (!form.dateTime) {
    errors.dateTime = "Date and time is required";
  } else {
    const appointmentDate = new Date(form.dateTime);
    const now = new Date();

    if (appointmentDate < now) {
      errors.dateTime = "Appointment cannot be scheduled in the past";
    }

    // Check if appointment is during business hours (9 AM - 6 PM)
    const hour = appointmentDate.getHours();
    if (hour < 9 || hour >= 18) {
      errors.dateTime =
        "Appointment must be scheduled during business hours (9 AM - 6 PM)";
    }

    // Check if appointment is on weekend
    const day = appointmentDate.getDay();
    if (day === 0 || day === 6) {
      errors.dateTime = "Appointments cannot be scheduled on weekends";
    }
  }

  if (!form.type) {
    errors.type = "Meeting type is required";
  }

  return errors;
};

/**
 * Validate university and course forms
 */
export const validateUniversityForm = (form) => {
  const errors = {};

  if (!form.name?.trim()) {
    errors.name = "University name is required";
  }

  if (!form.country?.trim()) {
    errors.country = "Country is required";
  }

  if (!form.city?.trim()) {
    errors.city = "City is required";
  }

  if (form.website && !URL_REGEX.test(form.website)) {
    errors.website = "Invalid website URL";
  }

  if (!form.mouStatus) {
    errors.mouStatus = "MOU status is required";
  }

  return errors;
};

export const validateCourseCreationForm = (form) => {
  const errors = {};

  if (!form.name?.trim()) {
    errors.name = "Course name is required";
  }

  if (!form.universityId) {
    errors.universityId = "University selection is required";
  }

  if (!form.level) {
    errors.level = "Course level is required";
  }

  if (!form.duration?.trim()) {
    errors.duration = "Course duration is required";
  }

  if (form.tuitionFee && (isNaN(form.tuitionFee) || form.tuitionFee < 0)) {
    errors.tuitionFee = "Invalid tuition fee amount";
  }

  return errors;
};

/**
 * Validate document upload forms
 */
export const validateDocumentUploadForm = (form) => {
  const errors = {};

  if (!form.files || form.files.length === 0) {
    errors.files = "At least one file is required";
  } else {
    // Validate file types and sizes
    const allowedTypes = ["pdf", "doc", "docx", "jpg", "jpeg", "png"];
    const maxSize = 10 * 1024 * 1024; // 10MB

    form.files.forEach((file, index) => {
      const extension = file.name.split(".").pop().toLowerCase();

      if (!allowedTypes.includes(extension)) {
        errors[`file_${index}`] = `Invalid file type: ${extension}`;
      }

      if (file.size > maxSize) {
        errors[`file_${index}`] = "File size must be less than 10MB";
      }
    });
  }

  if (!form.types || form.types.length === 0) {
    errors.types = "Document types are required";
  } else if (form.files && form.types.length !== form.files.length) {
    errors.types = "Number of types must match number of files";
  }

  return errors;
};

/**
 * Validate notification forms
 */
export const validateNotificationForm = (form) => {
  const errors = {};

  if (!form.type) {
    errors.type = "Notification type is required";
  }

  if (!form.message?.trim()) {
    errors.message = "Message is required";
  } else if (form.message.length < 10) {
    errors.message = "Message must be at least 10 characters";
  } else if (form.message.length > 1000) {
    errors.message = "Message cannot exceed 1000 characters";
  }

  if (form.type === "email" && !form.subject?.trim()) {
    errors.subject = "Email subject is required";
  }

  if (form.scheduledFor && new Date(form.scheduledFor) < new Date()) {
    errors.scheduledFor = "Scheduled time cannot be in the past";
  }

  return errors;
};

/**
 * Validate message forms
 */
export const validateMessageForm = (form) => {
  const errors = {};

  if (!form.message?.trim()) {
    errors.message = "Message is required";
  } else if (form.message.length < 1) {
    errors.message = "Message cannot be empty";
  } else if (form.message.length > 2000) {
    errors.message = "Message cannot exceed 2000 characters";
  }

  return errors;
};

/**
 * Validate search and filter forms
 */
export const validateSearchForm = (form) => {
  const errors = {};

  if (form.query && form.query.length < 2) {
    errors.query = "Search query must be at least 2 characters";
  }

  if (
    form.dateFrom &&
    form.dateTo &&
    new Date(form.dateFrom) > new Date(form.dateTo)
  ) {
    errors.dateTo = "End date must be after start date";
  }

  return errors;
};

/**
 * Generic field validators
 */
export const validateRequired = (value, fieldName = "Field") => {
  if (!value || (typeof value === "string" && !value.trim())) {
    return `${fieldName} is required`;
  }
  return null;
};

export const validateEmail = (email) => {
  if (!email) return "Email is required";
  if (!EMAIL_REGEX.test(email)) return "Invalid email format";
  return null;
};

export const validatePhone = (phone) => {
  if (!phone) return null; // Phone is usually optional
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, "");
  if (!PHONE_REGEX.test(cleanPhone)) return "Invalid phone number format";
  return null;
};

export const validatePassword = (password, isRequired = true) => {
  if (!password && isRequired) return "Password is required";
  if (!password) return null;

  if (password.length < 8) return "Password must be at least 8 characters";
  if (!PASSWORD_REGEX.test(password)) {
    return "Password must contain uppercase, lowercase, and number";
  }
  return null;
};

export const validateURL = (url) => {
  if (!url) return null; // URL is usually optional
  if (!URL_REGEX.test(url)) return "Invalid URL format";
  return null;
};

export const validateDateRange = (startDate, endDate) => {
  const errors = {};

  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start >= end) {
      errors.endDate = "End date must be after start date";
    }
  }

  return errors;
};

export const validateFileUpload = (file, options = {}) => {
  const {
    maxSize = 10 * 1024 * 1024, // 10MB default
    allowedTypes = ["pdf", "doc", "docx", "jpg", "jpeg", "png"],
    required = true,
  } = options;

  if (!file && required) return "File is required";
  if (!file) return null;

  const extension = file.name.split(".").pop().toLowerCase();

  if (!allowedTypes.includes(extension)) {
    return `Invalid file type. Allowed types: ${allowedTypes.join(", ")}`;
  }

  if (file.size > maxSize) {
    return `File size must be less than ${Math.round(
      maxSize / (1024 * 1024)
    )}MB`;
  }

  return null;
};

/**
 * Sanitize and validate input to prevent XSS
 */
export const validateAndSanitizeInput = (input, options = {}) => {
  const { allowHTML = false, maxLength = 1000 } = options;

  if (!input) return { isValid: true, sanitized: "", errors: [] };

  const errors = [];
  let sanitized = input;

  // Length validation
  if (sanitized.length > maxLength) {
    errors.push(`Input cannot exceed ${maxLength} characters`);
  }

  // HTML sanitization
  if (!allowHTML) {
    sanitized = sanitized
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#x27;")
      .replace(/\//g, "&#x2F;");
  }

  // Remove potentially dangerous characters
  sanitized = sanitized.replace(/[\x00-\x1F\x7F]/g, "");

  return {
    isValid: errors.length === 0,
    sanitized,
    errors,
  };
};

/**
 * Batch validation helper
 */
export const validateForm = (formData, validators) => {
  const errors = {};

  Object.keys(validators).forEach((field) => {
    const validator = validators[field];
    const value = formData[field];

    if (typeof validator === "function") {
      const error = validator(value);
      if (error) errors[field] = error;
    } else if (Array.isArray(validator)) {
      // Multiple validators for single field
      for (const v of validator) {
        const error = v(value);
        if (error) {
          errors[field] = error;
          break; // Stop at first error
        }
      }
    }
  });

  return errors;
};
