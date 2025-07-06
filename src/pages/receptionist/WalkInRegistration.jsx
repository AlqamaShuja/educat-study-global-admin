import React, { useState, useEffect } from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock,
  GraduationCap,
  DollarSign,
  Save,
  X,
  Plus,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Users,
  BookOpen,
} from "lucide-react";
import { toast } from "react-toastify";
import receptionistService from "../../services/receptionistService";
import useAuthStore from "../../stores/authStore";

const WalkInRegistration = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [consultants, setConsultants] = useState([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    studentData: {
      name: "",
      email: "",
      phone: "",
      address: "",
      dateOfBirth: "",
      nationality: "",
      emergencyContact: {
        name: "",
        phone: "",
        relationship: "",
      },
    },
    studyPreferences: {
      destination: "",
      level: "",
      fields: [],
      budget: "",
      startDate: "",
      duration: "",
      languageRequirement: "",
      notes: "",
    },
    appointmentData: {
      consultantId: "",
      dateTime: "",
      type: "in_person",
      notes: "",
      priority: "normal",
    },
    source: "walk_in",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Study destinations options
  const destinations = [
    "Canada",
    "UK",
    "Australia",
    "USA",
    "Germany",
    "France",
    "Netherlands",
    "New Zealand",
    "Ireland",
    "Sweden",
    "Norway",
    "Denmark",
  ];

  // Study levels
  const studyLevels = [
    "Foundation",
    "Diploma",
    "Bachelor's",
    "Master's",
    "PhD",
    "Certificate",
    "Professional",
  ];

  // Study fields
  const studyFields = [
    "Computer Science",
    "Engineering",
    "Business",
    "Medicine",
    "Law",
    "Arts & Design",
    "Psychology",
    "Education",
    "Economics",
    "Biology",
    "Chemistry",
    "Physics",
    "Mathematics",
    "Literature",
    "History",
  ];

  // Budget ranges
  const budgetRanges = [
    "Under $10,000",
    "$10,000 - $25,000",
    "$25,000 - $50,000",
    "$50,000 - $75,000",
    "$75,000 - $100,000",
    "Above $100,000",
  ];

  useEffect(() => {
    fetchConsultants();
  }, []);

  const fetchConsultants = async () => {
    try {
      const response = await receptionistService.getConsultantCalendars();
      // Extract unique consultants from calendar data
      const uniqueConsultants =
        response?.reduce((acc, appointment) => {
          if (
            appointment.consultant &&
            !acc.find((c) => c.id === appointment.consultant.id)
          ) {
            acc.push(appointment.consultant);
          }
          return acc;
        }, []) || [];
      setConsultants(uniqueConsultants);
    } catch (error) {
      console.error("Error fetching consultants:", error);
      toast.error("Failed to load consultants");
    }
  };

  const handleInputChange = (section, field, value) => {
    if (section === "emergencyContact") {
      setFormData((prev) => ({
        ...prev,
        studentData: {
          ...prev.studentData,
          emergencyContact: {
            ...prev.studentData.emergencyContact,
            [field]: value,
          },
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value,
        },
      }));
    }

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handleFieldToggle = (field) => {
    const currentFields = formData.studyPreferences.fields;
    const updatedFields = currentFields.includes(field)
      ? currentFields.filter((f) => f !== field)
      : [...currentFields, field];

    handleInputChange("studyPreferences", "fields", updatedFields);
  };

  const validateStep = (step) => {
    const newErrors = {};

    if (step === 1) {
      // Student Information Validation
      if (!formData.studentData.name.trim()) {
        newErrors.name = "Name is required";
      }
      if (!formData.studentData.email.trim()) {
        newErrors.email = "Email is required";
      } else if (!/\S+@\S+\.\S+/.test(formData.studentData.email)) {
        newErrors.email = "Email format is invalid";
      }
      if (!formData.studentData.phone.trim()) {
        newErrors.phone = "Phone number is required";
      }
      if (!formData.studentData.nationality.trim()) {
        newErrors.nationality = "Nationality is required";
      }
    } else if (step === 2) {
      // Study Preferences Validation
      if (!formData.studyPreferences.destination) {
        newErrors.destination = "Study destination is required";
      }
      if (!formData.studyPreferences.level) {
        newErrors.level = "Study level is required";
      }
      if (formData.studyPreferences.fields.length === 0) {
        newErrors.fields = "At least one field of study is required";
      }
      if (!formData.studyPreferences.budget) {
        newErrors.budget = "Budget range is required";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateStep(currentStep)) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare appointment data if consultant and time are selected
      const submitData = { ...formData };

      if (
        formData.appointmentData.consultantId &&
        formData.appointmentData.dateTime
      ) {
        // Include appointment data
        submitData.appointmentData = {
          ...formData.appointmentData,
          dateTime: new Date(formData.appointmentData.dateTime).toISOString(),
        };
      } else {
        // Remove appointment data if not complete
        delete submitData.appointmentData;
      }

      const response = await receptionistService.registerWalkIn(submitData);

      toast.success("Walk-in student registered successfully!");

      // Reset form or redirect
      setTimeout(() => {
        window.location.href = "/receptionist/dashboard";
      }, 2000);
    } catch (error) {
      console.error("Error registering walk-in student:", error);
      toast.error(error.message || "Failed to register student");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      <div className="flex items-center space-x-4">
        {[1, 2, 3].map((step) => (
          <div key={step} className="flex items-center">
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                currentStep >= step
                  ? "bg-blue-600 border-blue-600 text-white"
                  : "border-gray-300 text-gray-400"
              }`}
            >
              {currentStep > step ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                <span className="text-sm font-medium">{step}</span>
              )}
            </div>
            {step < 3 && (
              <div
                className={`w-12 h-0.5 mx-2 ${
                  currentStep > step ? "bg-blue-600" : "bg-gray-300"
                }`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Student Information
        </h2>
        <p className="text-gray-600">
          Please provide the student's basic information
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <User className="h-4 w-4 inline mr-1" />
            Full Name *
          </label>
          <input
            type="text"
            value={formData.studentData.name}
            onChange={(e) =>
              handleInputChange("studentData", "name", e.target.value)
            }
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.name ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Enter student's full name"
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Mail className="h-4 w-4 inline mr-1" />
            Email Address *
          </label>
          <input
            type="email"
            value={formData.studentData.email}
            onChange={(e) =>
              handleInputChange("studentData", "email", e.target.value)
            }
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.email ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Enter email address"
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email}</p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Phone className="h-4 w-4 inline mr-1" />
            Phone Number *
          </label>
          <input
            type="tel"
            value={formData.studentData.phone}
            onChange={(e) =>
              handleInputChange("studentData", "phone", e.target.value)
            }
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.phone ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Enter phone number"
          />
          {errors.phone && (
            <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
          )}
        </div>

        {/* Nationality */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <MapPin className="h-4 w-4 inline mr-1" />
            Nationality *
          </label>
          <input
            type="text"
            value={formData.studentData.nationality}
            onChange={(e) =>
              handleInputChange("studentData", "nationality", e.target.value)
            }
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.nationality ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Enter nationality"
          />
          {errors.nationality && (
            <p className="text-red-500 text-sm mt-1">{errors.nationality}</p>
          )}
        </div>

        {/* Date of Birth */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar className="h-4 w-4 inline mr-1" />
            Date of Birth
          </label>
          <input
            type="date"
            value={formData.studentData.dateOfBirth}
            onChange={(e) =>
              handleInputChange("studentData", "dateOfBirth", e.target.value)
            }
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Address */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <MapPin className="h-4 w-4 inline mr-1" />
            Address
          </label>
          <input
            type="text"
            value={formData.studentData.address}
            onChange={(e) =>
              handleInputChange("studentData", "address", e.target.value)
            }
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter address"
          />
        </div>
      </div>

      {/* Emergency Contact */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Emergency Contact (Optional)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contact Name
            </label>
            <input
              type="text"
              value={formData.studentData.emergencyContact.name}
              onChange={(e) =>
                handleInputChange("emergencyContact", "name", e.target.value)
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Emergency contact name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contact Phone
            </label>
            <input
              type="tel"
              value={formData.studentData.emergencyContact.phone}
              onChange={(e) =>
                handleInputChange("emergencyContact", "phone", e.target.value)
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Emergency contact phone"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Relationship
            </label>
            <select
              value={formData.studentData.emergencyContact.relationship}
              onChange={(e) =>
                handleInputChange(
                  "emergencyContact",
                  "relationship",
                  e.target.value
                )
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select relationship</option>
              <option value="Parent">Parent</option>
              <option value="Guardian">Guardian</option>
              <option value="Spouse">Spouse</option>
              <option value="Sibling">Sibling</option>
              <option value="Friend">Friend</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Study Preferences
        </h2>
        <p className="text-gray-600">
          Tell us about the student's study preferences
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Study Destination */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <MapPin className="h-4 w-4 inline mr-1" />
            Preferred Study Destination *
          </label>
          <select
            value={formData.studyPreferences.destination}
            onChange={(e) =>
              handleInputChange(
                "studyPreferences",
                "destination",
                e.target.value
              )
            }
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.destination ? "border-red-500" : "border-gray-300"
            }`}
          >
            <option value="">Select destination</option>
            {destinations.map((dest) => (
              <option key={dest} value={dest}>
                {dest}
              </option>
            ))}
          </select>
          {errors.destination && (
            <p className="text-red-500 text-sm mt-1">{errors.destination}</p>
          )}
        </div>

        {/* Study Level */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <GraduationCap className="h-4 w-4 inline mr-1" />
            Study Level *
          </label>
          <select
            value={formData.studyPreferences.level}
            onChange={(e) =>
              handleInputChange("studyPreferences", "level", e.target.value)
            }
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.level ? "border-red-500" : "border-gray-300"
            }`}
          >
            <option value="">Select study level</option>
            {studyLevels.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
          {errors.level && (
            <p className="text-red-500 text-sm mt-1">{errors.level}</p>
          )}
        </div>

        {/* Budget */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <DollarSign className="h-4 w-4 inline mr-1" />
            Budget Range *
          </label>
          <select
            value={formData.studyPreferences.budget}
            onChange={(e) =>
              handleInputChange("studyPreferences", "budget", e.target.value)
            }
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.budget ? "border-red-500" : "border-gray-300"
            }`}
          >
            <option value="">Select budget range</option>
            {budgetRanges.map((budget) => (
              <option key={budget} value={budget}>
                {budget}
              </option>
            ))}
          </select>
          {errors.budget && (
            <p className="text-red-500 text-sm mt-1">{errors.budget}</p>
          )}
        </div>

        {/* Preferred Start Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar className="h-4 w-4 inline mr-1" />
            Preferred Start Date
          </label>
          <input
            type="date"
            value={formData.studyPreferences.startDate}
            onChange={(e) =>
              handleInputChange("studyPreferences", "startDate", e.target.value)
            }
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Fields of Study */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          <BookOpen className="h-4 w-4 inline mr-1" />
          Fields of Study * (Select at least one)
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {studyFields.map((field) => (
            <button
              key={field}
              type="button"
              onClick={() => handleFieldToggle(field)}
              className={`p-3 text-sm rounded-lg border transition-colors ${
                formData.studyPreferences.fields.includes(field)
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-blue-50"
              }`}
            >
              {field}
            </button>
          ))}
        </div>
        {errors.fields && (
          <p className="text-red-500 text-sm mt-2">{errors.fields}</p>
        )}
      </div>

      {/* Additional Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Additional Notes
        </label>
        <textarea
          value={formData.studyPreferences.notes}
          onChange={(e) =>
            handleInputChange("studyPreferences", "notes", e.target.value)
          }
          rows={4}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Any additional information about study preferences..."
        />
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Appointment Scheduling
        </h2>
        <p className="text-gray-600">
          Optionally schedule an immediate appointment
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-start">
          <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 mr-3" />
          <div>
            <h3 className="text-sm font-medium text-blue-800">
              Appointment Scheduling
            </h3>
            <p className="text-sm text-blue-700 mt-1">
              You can either schedule an immediate appointment or skip this step
              and schedule later.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Consultant Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Users className="h-4 w-4 inline mr-1" />
            Select Consultant
          </label>
          <select
            value={formData.appointmentData.consultantId}
            onChange={(e) =>
              handleInputChange(
                "appointmentData",
                "consultantId",
                e.target.value
              )
            }
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select a consultant (optional)</option>
            {consultants.map((consultant) => (
              <option key={consultant.id} value={consultant.id}>
                {consultant.name}
              </option>
            ))}
          </select>
        </div>

        {/* Appointment Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Appointment Type
          </label>
          <select
            value={formData.appointmentData.type}
            onChange={(e) =>
              handleInputChange("appointmentData", "type", e.target.value)
            }
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="in_person">In-Person</option>
            <option value="virtual">Virtual</option>
          </select>
        </div>

        {/* Date and Time */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Clock className="h-4 w-4 inline mr-1" />
            Date & Time
          </label>
          <input
            type="datetime-local"
            value={formData.appointmentData.dateTime}
            onChange={(e) =>
              handleInputChange("appointmentData", "dateTime", e.target.value)
            }
            min={new Date().toISOString().slice(0, 16)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Priority */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Priority Level
          </label>
          <select
            value={formData.appointmentData.priority}
            onChange={(e) =>
              handleInputChange("appointmentData", "priority", e.target.value)
            }
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="normal">Normal</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>
      </div>

      {/* Appointment Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Appointment Notes
        </label>
        <textarea
          value={formData.appointmentData.notes}
          onChange={(e) =>
            handleInputChange("appointmentData", "notes", e.target.value)
          }
          rows={3}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Any specific notes for the appointment..."
        />
      </div>

      {/* Summary */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Registration Summary
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-700">Student:</span>
            <p className="text-gray-600">{formData.studentData.name}</p>
          </div>
          <div>
            <span className="font-medium text-gray-700">Email:</span>
            <p className="text-gray-600">{formData.studentData.email}</p>
          </div>
          <div>
            <span className="font-medium text-gray-700">
              Study Destination:
            </span>
            <p className="text-gray-600">
              {formData.studyPreferences.destination}
            </p>
          </div>
          <div>
            <span className="font-medium text-gray-700">Study Level:</span>
            <p className="text-gray-600">{formData.studyPreferences.level}</p>
          </div>
          <div>
            <span className="font-medium text-gray-700">Fields of Study:</span>
            <p className="text-gray-600">
              {formData.studyPreferences.fields.join(", ")}
            </p>
          </div>
          <div>
            <span className="font-medium text-gray-700">Budget:</span>
            <p className="text-gray-600">{formData.studyPreferences.budget}</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => window.history.back()}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Walk-In Student Registration
                </h1>
                <p className="text-gray-600 mt-1">
                  Register a new walk-in student
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">
                Receptionist: {user?.name}
              </p>
              <p className="text-xs text-gray-400">
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Main Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          {renderStepIndicator()}

          <form onSubmit={handleSubmit}>
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
              <div>
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={handlePrevious}
                    className="flex items-center px-6 py-3 text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Previous
                  </button>
                )}
              </div>

              <div className="flex items-center space-x-4">
                {currentStep < 3 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="flex items-center px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Next
                    <ArrowLeft className="h-4 w-4 ml-2 rotate-180" />
                  </button>
                ) : (
                  <div className="flex items-center space-x-3">
                    <button
                      type="button"
                      onClick={() => window.history.back()}
                      className="flex items-center px-6 py-3 text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex items-center px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Registering...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Register Student
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </form>
        </div>

        {/* Help Section */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mt-6">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-blue-900 mb-2">
                Registration Tips
              </h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>
                  • Ensure all required fields are completed before proceeding
                </li>
                <li>• Double-check email address for accuracy</li>
                <li>• Multiple fields of study can be selected</li>
                <li>• Appointment scheduling is optional but recommended</li>
                <li>
                  • Emergency contact information helps in case of urgent
                  matters
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <button
            onClick={() =>
              (window.location.href = "/receptionist/consultant-calendars")
            }
            className="flex items-center justify-center p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Calendar className="h-5 w-5 text-blue-600 mr-2" />
            <span className="text-sm font-medium text-gray-700">
              Check Consultant Availability
            </span>
          </button>

          <button
            onClick={() =>
              (window.location.href = "/receptionist/waiting-list")
            }
            className="flex items-center justify-center p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Clock className="h-5 w-5 text-orange-600 mr-2" />
            <span className="text-sm font-medium text-gray-700">
              View Waiting List
            </span>
          </button>

          <button
            onClick={() => (window.location.href = "/receptionist/dashboard")}
            className="flex items-center justify-center p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Users className="h-5 w-5 text-green-600 mr-2" />
            <span className="text-sm font-medium text-gray-700">
              Back to Dashboard
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default WalkInRegistration;

// import React, { useState, useEffect } from "react";
// import useApi from "../../hooks/useApi";
// import useAuth from "../../hooks/useAuth";
// import usePermissions from "../../hooks/usePermissions";
// import { validateWalkInForm, validateInput } from "../../utils/validators";
// import { Link } from "react-router-dom";
// import Card from "../../components/ui/Card";
// import Button from "../../components/ui/Button";
// import Badge from "../../components/ui/Badge";
// // import Modal from "../../components/modal/Modal";
// import Input from "../../components/ui/Input";
// import Select from "../../components/ui/Select";
// import LoadingSpinner from "../../components/ui/LoadingSpinner";
// import Toast from "../../components/ui/Toast";
// import DataTable from "../../components/tables/DataTable";
// import {
//   User,
//   Mail,
//   Phone,
//   Calendar,
//   Clock,
//   Plus,
//   Search,
//   Shield,
//   Edit,
//   Trash2,
// } from "lucide-react";
// import Modal from "../../components/ui/Modal";

// const WalkInRegistration = () => {
//   const { user } = useAuth();
//   const { callApi, loading: apiLoading, error: apiError } = useApi();
//   const { hasPermission } = usePermissions();
//   const [walkIns, setWalkIns] = useState([]);
//   const [consultants, setConsultants] = useState([]);
//   const [filters, setFilters] = useState({ search: "" });
//   const [showModal, setShowModal] = useState({
//     show: false,
//     mode: "register",
//     walkIn: null,
//   });
//   const [formErrors, setFormErrors] = useState({});
//   const [toast, setToast] = useState({
//     show: false,
//     message: "",
//     type: "success",
//   });

//   const [walkInForm, setWalkInForm] = useState({
//     clientName: "",
//     email: "",
//     phone: "",
//     preferredConsultantId: "",
//     purpose: "",
//     action: "contact", // Options: 'contact', 'appointment', 'waiting'
//   });

//   const walkInStatuses = [
//     {
//       value: "registered",
//       label: "Registered",
//       color: "bg-blue-100 text-blue-800",
//     },
//     {
//       value: "appointed",
//       label: "Appointed",
//       color: "bg-green-100 text-green-800",
//     },
//     {
//       value: "waiting",
//       label: "Waiting",
//       color: "bg-yellow-100 text-yellow-800",
//     },
//     { value: "canceled", label: "Canceled", color: "bg-red-100 text-red-800" },
//   ];

//   const actionOptions = [
//     { value: "contact", label: "Add to Contacts" },
//     { value: "appointment", label: "Book Appointment" },
//     { value: "waiting", label: "Add to Waiting List" },
//   ];

//   useEffect(() => {
//     if (user && hasPermission("manage", "walk-ins")) {
//       fetchConsultants();
//       fetchWalkIns();
//     }
//   }, [user]);

//   const fetchConsultants = async () => {
//     try {
//       const response = await callApi("GET", "/receptionist/consultants");
//       setConsultants(
//         response?.map((consultant) => ({
//           id: consultant.id,
//           name: validateInput(consultant.name),
//         })) || []
//       );
//     } catch (error) {
//       setToast({
//         show: true,
//         message: apiError || "Failed to fetch consultants",
//         type: "error",
//       });
//     }
//   };

//   const fetchWalkIns = async () => {
//     try {
//       const response = await callApi("GET", "/receptionist/walk-ins", {
//         params: { date: new Date().toISOString().slice(0, 10) },
//       });
//       setWalkIns(
//         response?.map((walkIn) => ({
//           id: walkIn.id,
//           clientName: validateInput(walkIn.clientName || "Unknown"),
//           email: validateInput(walkIn.email || "N/A"),
//           phone: validateInput(walkIn.phone || "N/A"),
//           preferredConsultantName: validateInput(
//             walkIn.preferredConsultantName || "None"
//           ),
//           purpose: validateInput(walkIn.purpose || "N/A"),
//           status: walkIn.status,
//           createdAt: walkIn.createdAt,
//         })) || []
//       );
//     } catch (error) {
//       setToast({
//         show: true,
//         message: apiError || "Failed to fetch walk-ins",
//         type: "error",
//       });
//     }
//   };

//   const handleRegisterWalkIn = async () => {
//     const validationErrors = validateWalkInForm(walkInForm);
//     if (Object.keys(validationErrors).length) {
//       setFormErrors(validationErrors);
//       return;
//     }

//     try {
//       const payload = {
//         ...walkInForm,
//         clientName: validateInput(walkInForm.clientName),
//         email: validateInput(walkInForm.email),
//         phone: validateInput(walkInForm.phone),
//         purpose: validateInput(walkInForm.purpose),
//       };

//       let newWalkIn;
//       if (showModal.mode === "register") {
//         newWalkIn = await callApi("POST", "/receptionist/walk-ins", payload);
//         setWalkIns((prev) => [...prev, newWalkIn]);
//       } else {
//         newWalkIn = await callApi(
//           "PUT",
//           `/receptionist/walk-ins/${showModal.walkIn.id}`,
//           payload
//         );
//         setWalkIns((prev) =>
//           prev.map((walkIn) =>
//             walkIn.id === newWalkIn.id ? newWalkIn : walkIn
//           )
//         );
//       }

//       // Handle action
//       if (walkInForm.action === "contact") {
//         await callApi("POST", "/receptionist/contacts", {
//           name: payload.clientName,
//           email: payload.email,
//           phone: payload.phone,
//           type: "prospect",
//           status: "contact",
//           notes: payload.purpose,
//         });
//         setToast({
//           show: true,
//           message: "Walk-in registered and added to contacts!",
//           type: "success",
//         });
//       } else if (walkInForm.action === "appointment") {
//         // Redirect to appointment booking with pre-filled data
//         setToast({
//           show: true,
//           message: "Redirecting to book appointment...",
//           type: "success",
//         });
//         // Note: Actual redirect handled via Link or navigation in UI
//       } else if (walkInForm.action === "waiting") {
//         await callApi("POST", "/receptionist/waiting-list", {
//           clientName: payload.clientName,
//           email: payload.email,
//           phone: payload.phone,
//           preferredConsultantId: payload.preferredConsultantId,
//           preferredDateTime: new Date().toISOString(),
//           status: "pending",
//           notes: payload.purpose,
//         });
//         setToast({
//           show: true,
//           message: "Walk-in registered and added to waiting list!",
//           type: "success",
//         });
//       }

//       setShowModal({ show: false, mode: "register", walkIn: null });
//       resetForm();
//     } catch (error) {
//       setToast({
//         show: true,
//         message: apiError || "Failed to register walk-in",
//         type: "error",
//       });
//     }
//   };

//   const handleDeleteWalkIn = async (walkInId) => {
//     if (
//       !window.confirm(
//         "Are you sure you want to delete this walk-in registration?"
//       )
//     )
//       return;

//     try {
//       await callApi("DELETE", `/receptionist/walk-ins/${walkInId}`);
//       setWalkIns((prev) => prev.filter((walkIn) => walkIn.id !== walkInId));
//       setToast({
//         show: true,
//         message: "Walk-in registration deleted!",
//         type: "success",
//       });
//     } catch (error) {
//       setToast({
//         show: true,
//         message: apiError || "Failed to delete walk-in",
//         type: "error",
//       });
//     }
//   };

//   const resetForm = () => {
//     setWalkInForm({
//       clientName: "",
//       email: "",
//       phone: "",
//       preferredConsultantId: "",
//       purpose: "",
//       action: "contact",
//     });
//     setFormErrors({});
//   };

//   const filteredWalkIns = walkIns.filter(
//     (walkIn) =>
//       !filters.search ||
//       walkIn.clientName.toLowerCase().includes(filters.search.toLowerCase()) ||
//       walkIn.email.toLowerCase().includes(filters.search.toLowerCase())
//   );

//   const getStatusColor = (status) =>
//     walkInStatuses.find((s) => s.value === status)?.color ||
//     "bg-gray-100 text-gray-800";

//   const columns = [
//     {
//       key: "clientName",
//       label: "Client",
//       render: (walkIn) => (
//         <div className="flex items-center">
//           <User className="h-4 w-4 text-gray-400 mr-2" />
//           <span className="text-sm">{walkIn.clientName}</span>
//         </div>
//       ),
//     },
//     {
//       key: "email",
//       label: "Email",
//       render: (walkIn) => (
//         <div className="flex items-center">
//           <Mail className="h-4 w-4 text-gray-400 mr-2" />
//           <span className="text-sm">{walkIn.email}</span>
//         </div>
//       ),
//     },
//     {
//       key: "phone",
//       label: "Phone",
//       render: (walkIn) => (
//         <div className="flex items-center">
//           <Phone className="h-4 w-4 text-gray-400 mr-2" />
//           <span className="text-sm">{walkIn.phone}</span>
//         </div>
//       ),
//     },
//     {
//       key: "preferredConsultantName",
//       label: "Consultant",
//       render: (walkIn) => (
//         <div className="flex items-center">
//           <User className="h-4 w-4 text-gray-400 mr-2" />
//           <span className="text-sm">{walkIn.preferredConsultantName}</span>
//         </div>
//       ),
//     },
//     {
//       key: "purpose",
//       label: "Purpose",
//       render: (walkIn) => <span className="text-sm">{walkIn.purpose}</span>,
//     },
//     {
//       key: "status",
//       label: "Status",
//       render: (walkIn) => (
//         <Badge className={getStatusColor(walkIn.status)}>
//           {walkInStatuses.find((s) => s.value === walkIn.status)?.label}
//         </Badge>
//       ),
//     },
//     {
//       key: "createdAt",
//       label: "Registered At",
//       render: (walkIn) => (
//         <div className="flex items-center text-sm text-gray-600">
//           <Clock className="h-4 w-4 mr-1" />
//           {new Date(walkIn.createdAt).toLocaleString()}
//         </div>
//       ),
//     },
//     {
//       key: "actions",
//       label: "Actions",
//       render: (walkIn) => (
//         <div className="flex space-x-2">
//           {walkIn.status === "registered" && (
//             <Link
//               to={`/receptionist/appointments/booking?clientName=${encodeURIComponent(
//                 walkIn.clientName
//               )}&consultantId=${walkIn.preferredConsultantId}`}
//             >
//               <Button
//                 size="sm"
//                 variant="outline"
//                 disabled={!hasPermission("create", "appointments")}
//                 className="border-blue-300 text-blue-600 hover:bg-blue-50"
//               >
//                 <Calendar className="h-4 w-4" />
//               </Button>
//             </Link>
//           )}
//           <Button
//             size="sm"
//             variant="outline"
//             onClick={() => {
//               setShowModal({ show: true, mode: "edit", walkIn });
//               setWalkInForm({
//                 clientName: walkIn.clientName,
//                 email: walkIn.email,
//                 phone: walkIn.phone,
//                 preferredConsultantId: walkIn.preferredConsultantId || "",
//                 purpose: walkIn.purpose,
//                 action: "contact",
//               });
//             }}
//             disabled={!hasPermission("edit", "walk-ins")}
//           >
//             <Edit className="h-4 w-4" />
//           </Button>
//           <Button
//             size="sm"
//             variant="outline"
//             onClick={() => handleDeleteWalkIn(walkIn.id)}
//             className="border-red-300 text-red-600 hover:bg-red-50"
//             disabled={!hasPermission("delete", "walk-ins")}
//           >
//             <Trash2 className="h-4 w-4" />
//           </Button>
//         </div>
//       ),
//     },
//   ];

//   if (apiLoading) {
//     return (
//       <div className="flex items-center justify-center h-64">
//         <LoadingSpinner size="lg" />
//       </div>
//     );
//   }

//   if (!hasPermission("manage", "walk-ins")) {
//     return (
//       <div className="text-center py-8">
//         <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
//         <h3 className="text-lg font-medium text-gray-900 mb-2">
//           Access Denied
//         </h3>
//         <p className="text-gray-600">
//           You do not have permission to manage walk-in registrations.
//         </p>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       <Toast
//         isOpen={toast.show}
//         message={toast.message}
//         type={toast.type}
//         onClose={() => setToast({ ...toast, show: false })}
//       />

//       {/* Header */}
//       <div className="flex justify-between items-center">
//         <div>
//           <h1 className="text-2xl font-bold text-gray-900">
//             Walk-In Registration
//           </h1>
//           <p className="text-gray-600">
//             Register walk-in clients and manage their actions.
//           </p>
//         </div>
//         <Button
//           onClick={() =>
//             setShowModal({ show: true, mode: "register", walkIn: null })
//           }
//           disabled={!hasPermission("create", "walk-ins")}
//         >
//           <Plus className="h-4 w-4 mr-2" />
//           Register Walk-In
//         </Button>
//       </div>

//       {/* Filters */}
//       <Card className="p-4">
//         <div className="relative">
//           <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
//           <Input
//             placeholder="Search by name or email..."
//             value={filters.search}
//             onChange={(e) => setFilters({ ...filters, search: e.target.value })}
//             className="pl-10"
//           />
//         </div>
//       </Card>

//       {/* Registration Form Modal */}
//       <Modal
//         isOpen={showModal.show}
//         onClose={() => {
//           setShowModal({ show: false, mode: "register", walkIn: null });
//           resetForm();
//         }}
//         title={
//           showModal.mode === "register"
//             ? "Register Walk-In Client"
//             : "Edit Walk-In Registration"
//         }
//         size="lg"
//       >
//         <div className="space-y-4">
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Client Name *
//             </label>
//             <Input
//               value={walkInForm.clientName}
//               onChange={(e) =>
//                 setWalkInForm({ ...walkInForm, clientName: e.target.value })
//               }
//               placeholder="Enter client name"
//               className={formErrors.clientName ? "border-red-500" : ""}
//             />
//             {formErrors.clientName && (
//               <p className="text-red-500 text-xs mt-1">
//                 {formErrors.clientName}
//               </p>
//             )}
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Email *
//             </label>
//             <Input
//               type="email"
//               value={walkInForm.email}
//               onChange={(e) =>
//                 setWalkInForm({ ...walkInForm, email: e.target.value })
//               }
//               placeholder="Enter client email"
//               className={formErrors.email ? "border-red-500" : ""}
//             />
//             {formErrors.email && (
//               <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>
//             )}
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Phone
//             </label>
//             <Input
//               type="tel"
//               value={walkInForm.phone}
//               onChange={(e) =>
//                 setWalkInForm({ ...walkInForm, phone: e.target.value })
//               }
//               placeholder="Enter client phone"
//               className={formErrors.phone ? "border-red-500" : ""}
//             />
//             {formErrors.phone && (
//               <p className="text-red-500 text-xs mt-1">{formErrors.phone}</p>
//             )}
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Preferred Consultant
//             </label>
//             <Select
//               options={[
//                 { value: "", label: "None" },
//                 ...consultants.map((consultant) => ({
//                   value: consultant.id,
//                   label: consultant.name,
//                 })),
//               ]}
//               value={walkInForm.preferredConsultantId}
//               onChange={(value) =>
//                 setWalkInForm({ ...walkInForm, preferredConsultantId: value })
//               }
//               className={
//                 formErrors.preferredConsultantId ? "border-red-500" : ""
//               }
//             />
//             {formErrors.preferredConsultantId && (
//               <p className="text-red-500 text-xs mt-1">
//                 {formErrors.preferredConsultantId}
//               </p>
//             )}
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Purpose of Visit *
//             </label>
//             <textarea
//               className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
//                 formErrors.purpose ? "border-red-500" : ""
//               }`}
//               rows={3}
//               value={walkInForm.purpose}
//               onChange={(e) =>
//                 setWalkInForm({ ...walkInForm, purpose: e.target.value })
//               }
//               placeholder="Enter purpose of visit..."
//             />
//             {formErrors.purpose && (
//               <p className="text-red-500 text-xs mt-1">{formErrors.purpose}</p>
//             )}
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Action *
//             </label>
//             <Select
//               options={actionOptions}
//               value={walkInForm.action}
//               onChange={(value) =>
//                 setWalkInForm({ ...walkInForm, action: value })
//               }
//               className={formErrors.action ? "border-red-500" : ""}
//             />
//             {formErrors.action && (
//               <p className="text-red-500 text-xs mt-1">{formErrors.action}</p>
//             )}
//           </div>
//           <div className="flex justify-end space-x-3">
//             <Button
//               variant="outline"
//               onClick={() => {
//                 setShowModal({ show: false, mode: "register", walkIn: null });
//                 resetForm();
//               }}
//             >
//               Cancel
//             </Button>
//             <Button onClick={handleRegisterWalkIn}>
//               {showModal.mode === "register"
//                 ? "Register Walk-In"
//                 : "Update Registration"}
//             </Button>
//           </div>
//         </div>
//       </Modal>

//       {/* Recent Walk-Ins Table */}
//       <Card className="p-4">
//         <h3 className="text-lg font-semibold mb-4">
//           Recent Walk-In Registrations
//         </h3>
//         {filteredWalkIns.length === 0 ? (
//           <div className="text-center py-8">
//             <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
//             <h3 className="text-lg font-medium text-gray-900 mb-2">
//               No walk-in registrations today
//             </h3>
//             <p className="text-gray-600 mb-4">
//               {filters.search
//                 ? "No registrations match your search."
//                 : "Register a walk-in client to get started."}
//             </p>
//             <Button
//               onClick={() =>
//                 setShowModal({ show: true, mode: "register", walkIn: null })
//               }
//               disabled={!hasPermission("create", "walk-ins")}
//             >
//               <Plus className="h-4 w-4 mr-2" />
//               Register First Walk-In
//             </Button>
//           </div>
//         ) : (
//           <DataTable
//             data={filteredWalkIns}
//             columns={columns}
//             pagination={true}
//             pageSize={10}
//           />
//         )}
//       </Card>
//     </div>
//   );
// };

// export default WalkInRegistration;
