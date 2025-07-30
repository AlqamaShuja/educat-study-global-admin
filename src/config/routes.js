import { lazy } from "react";

// Lazy-loaded page components
const LoginPage = lazy(() => import("../pages/auth/LoginPage"));
const SignupPage = lazy(() => import("../pages/auth/SignupPage"));
const ForgotPasswordPage = lazy(() =>
  import("../pages/auth/ForgotPasswordPage")
);
const ResetPasswordPage = lazy(() => import("../pages/auth/ResetPasswordPage"));

const SuperAdminDashboard = lazy(() =>
  import("../pages/super-admin/SuperAdminDashboard")
);
const OfficeManagement = lazy(() =>
  import("../pages/super-admin/OfficeManagement")
);
const CreateOffice = lazy(() => import("../pages/super-admin/CreateOffice"));
const EditOffice = lazy(() => import("../pages/super-admin/EditOffice"));
const StaffManagement = lazy(() =>
  import("../pages/super-admin/StaffManagement")
);
const StaffDetails = lazy(() =>
  import("../pages/super-admin/staff/StaffDetails")
);
const CreateStaff = lazy(() => import("../pages/super-admin/CreateStaff"));
const EditStaff = lazy(() => import("../pages/super-admin/EditStaff"));
const SystemReports = lazy(() => import("../pages/super-admin/SystemReports"));
const LeadDistributionRules = lazy(() =>
  import("../pages/super-admin/LeadDistributionRules")
);
const UniversityManagement = lazy(() =>
  import("../pages/super-admin/UniversityManagement")
);
const CourseManagement = lazy(() =>
  import("../pages/super-admin/CourseManagement")
);
const GlobalLeadManagement = lazy(() =>
  import("../pages/super-admin/GlobalLeadManagement")
);
const SystemSettings = lazy(() =>
  import("../pages/super-admin/SystemSettings")
);
const LeadManagement = lazy(() =>
  import("../pages/super-admin/LeadManagement")
);
const SuperAdminApplicationsPage = lazy(() =>
  import("../pages/super-admin/ApplicationsPage")
);

const ManagerDashboard = lazy(() =>
  import("../pages/manager/ManagerDashboard")
);
const TeamManagement = lazy(() => import("../pages/manager/TeamManagement"));
const OfficeLeads = lazy(() => import("../pages/manager/OfficeLeads"));
const StaffSchedules = lazy(() => import("../pages/manager/StaffSchedules"));
const OfficeReports = lazy(() => import("../pages/manager/OfficeReports"));
const ConsultantPerformance = lazy(() =>
  import("../pages/manager/ConsultantPerformance")
);
const LeadAssignment = lazy(() => import("../pages/manager/LeadAssignment"));

const ConsultantDashboard = lazy(() =>
  import("../pages/consultant/ConsultantDashboard")
);
const MyLeads = lazy(() => import("../pages/consultant/MyLeads"));
const StudentProfiles = lazy(() =>
  import("../pages/consultant/StudentProfiles")
);
const AppointmentManagement = lazy(() =>
  import("../pages/consultant/AppointmentManagement")
);
const DocumentCollection = lazy(() =>
  import("../pages/consultant/DocumentCollection")
);
const TaskManagement = lazy(() => import("../pages/consultant/TaskManagement"));
const ApplicationProgress = lazy(() =>
  import("../pages/consultant/ApplicationProgress")
);
const ApplicationsPage = lazy(() =>
  import("../pages/consultant/ApplicationsPage")
);
const MeetingScheduler = lazy(() =>
  import("../pages/consultant/MeetingScheduler")
);

const ReceptionistDashboard = lazy(() =>
  import("../pages/receptionist/ReceptionistDashboard")
);
const WalkInRegistration = lazy(() =>
  import("../pages/receptionist/WalkInRegistration")
);
const AppointmentBooking = lazy(() =>
  import("../pages/receptionist/AppointmentBooking")
);
const ConsultantCalendars = lazy(() =>
  import("../pages/receptionist/ConsultantCalendars")
);
const ContactManagement = lazy(() =>
  import("../pages/receptionist/ContactManagement")
);
const WaitingList = lazy(() => import("../pages/receptionist/WaitingList"));
const AppointmentConfirmations = lazy(() =>
  import("../pages/receptionist/AppointmentConfirmations")
);

const ChatPage = lazy(() =>
  import("../pages/common/ChatPage")
);

const StudentDashboard = lazy(() =>
  import("../pages/student/StudentDashboard")
);
const MyProfile = lazy(() => import("../pages/student/MyProfile"));
const ApplicationStatus = lazy(() =>
  import("../pages/student/ApplicationStatus")
);
const DocumentUpload = lazy(() => import("../pages/student/DocumentUpload"));
const StudentAppointmentBooking = lazy(() =>
  import("../pages/student/AppointmentBooking")
);
const CommunicationCenter = lazy(() =>
  import("../pages/student/CommunicationCenter")
);
const TaskChecklist = lazy(() => import("../pages/student/TaskChecklist"));
const DeadlineCalendar = lazy(() =>
  import("../pages/student/DeadlineCalendar")
);
const MeetingJoin = lazy(() => import("../pages/student/MeetingJoin"));
const ApplicationSummary = lazy(() =>
  import("../pages/student/ApplicationSummary")
);

const NotFoundPage = lazy(() => import("../pages/common/NotFoundPage"));
const UnauthorizedPage = lazy(() => import("../pages/common/UnauthorizedPage"));
const ProfilePage = lazy(() => import("../pages/common/ProfilePage"));
const SettingsPage = lazy(() => import("../pages/common/SettingsPage"));
const NotificationsPage = lazy(() =>
  import("../pages/common/NotificationsPage")
);
const OfficeDetailsPage = lazy(() => import("../pages/common/OfficeDetails"));
const UniversityDetailsPage = lazy(() =>
  import("../pages/common/UniversityDetails")
);

export const routes = [
  // Public Routes
  {
    path: "/login",
    component: LoginPage,
    isPublic: true,
  },
  {
    path: "/signup",
    component: SignupPage,
    isPublic: true,
  },
  {
    path: "/forgot-password",
    component: ForgotPasswordPage,
    isPublic: true,
  },
  {
    path: "/reset-password",
    component: ResetPasswordPage,
    isPublic: true,
  },
  // office for all
  // {
  //   path: '/office',
  //   component: OfficeDetailsPage,
  //   isPublic: true,
  // },

  // Super Admin Routes
  {
    path: "/super-admin/dashboard",
    component: SuperAdminDashboard,
    roles: ["super_admin"],
  },
  {
    path: "/super-admin/offices",
    component: OfficeManagement,
    roles: ["super_admin"],
  },
  {
    path: "/super-admin/offices/create",
    component: CreateOffice,
    roles: ["super_admin"],
  },
  {
    path: "/super-admin/offices/edit/:id",
    component: EditOffice,
    roles: ["super_admin"],
  },
  {
    path: "/super-admin/staff",
    component: StaffManagement,
    roles: ["super_admin"],
  },
  {
    path: "/super-admin/staff/details/:id",
    component: StaffDetails,
    roles: ["super_admin"],
  },
  {
    path: "/super-admin/staff/create",
    component: CreateStaff,
    roles: ["super_admin"],
  },
  {
    path: "/super-admin/staff/edit/:id",
    component: EditStaff,
    roles: ["super_admin"],
  },
  {
    path: "/super-admin/reports",
    component: SystemReports,
    roles: ["super_admin"],
  },
  {
    path: "/super-admin/lead-distribution",
    component: LeadDistributionRules,
    roles: ["super_admin"],
  },
  {
    path: "/super-admin/universities",
    component: UniversityManagement,
    roles: ["super_admin"],
  },
  {
    path: "/super-admin/courses",
    component: CourseManagement,
    roles: ["super_admin"],
  },
  //   {
  //     path: '/super-admin/leads',
  //     component: GlobalLeadManagement,
  //     roles: ['super_admin'],
  //   },
  {
    path: "/super-admin/settings",
    component: SystemSettings,
    roles: ["super_admin"],
  },
  {
    path: "/super-admin/lead",
    component: LeadManagement,
    roles: ["super_admin"],
  },
  {
    path: "/super-admin/applications",
    component: SuperAdminApplicationsPage,
    roles: ["super_admin"],
  },
  {
    path: "/super-admin/office/:officeId",
    component: OfficeDetailsPage,
    roles: ["super_admin"],
  },
  {
    path: "/super-admin/university/:universityId",
    component: UniversityDetailsPage,
    roles: ["super_admin"],
  },

  // Manager Routes
  {
    path: "/manager/dashboard",
    component: ManagerDashboard,
    roles: ["manager"],
  },
  {
    path: "/manager/receptionist",
    component: TeamManagement,
    roles: ["manager"],
  },
  {
    path: "/manager/leads",
    component: OfficeLeads,
    roles: ["manager"],
  },
  {
    path: "/manager/schedules",
    component: StaffSchedules,
    roles: ["manager"],
  },
  {
    path: "/manager/reports",
    component: OfficeReports,
    roles: ["manager"],
  },
  {
    path: "/manager/performance",
    component: ConsultantPerformance,
    roles: ["manager"],
  },
  {
    path: "/manager/lead-assignment",
    component: LeadAssignment,
    roles: ["manager"],
  },

  // Consultant Routes
  {
    path: "/consultant/dashboard",
    component: ConsultantDashboard,
    roles: ["consultant"],
  },
  {
    path: "/consultant/leads",
    component: MyLeads,
    roles: ["consultant"],
  },
  {
    path: `/consultant/students/:studentId`,
    component: StudentProfiles,
    roles: ["consultant", "manager"],
  },
  {
    path: "/consultant/appointments",
    component: AppointmentManagement,
    roles: ["consultant"],
  },
  {
    path: "/consultant/documents",
    component: DocumentCollection,
    roles: ["consultant"],
  },
  {
    path: "/consultant/tasks",
    component: TaskManagement,
    roles: ["consultant"],
  },
  {
    path: "/consultant/applications",
    component: ApplicationsPage,
    roles: ["consultant"],
  },
  {
    path: "/consultant/scheduler",
    component: MeetingScheduler,
    roles: ["consultant"],
  },

  // Receptionist Routes
  {
    path: "/receptionist/dashboard",
    component: ReceptionistDashboard,
    roles: ["receptionist"],
  },
  {
    path: "/receptionist/walk-in",
    component: WalkInRegistration,
    roles: ["receptionist"],
  },
  {
    path: "/receptionist/appointments",
    component: AppointmentBooking,
    roles: ["receptionist"],
  },
  {
    path: "/receptionist/calendars",
    component: ConsultantCalendars,
    roles: ["receptionist"],
  },
  {
    path: "/receptionist/contacts",
    component: ContactManagement,
    roles: ["receptionist"],
  },
  {
    path: "/receptionist/waiting-list",
    component: WaitingList,
    roles: ["receptionist"],
  },
  {
    path: "/receptionist/confirmations",
    component: AppointmentConfirmations,
    roles: ["receptionist"],
  },

  // Student Routes
  {
    path: "/student/dashboard",
    component: StudentDashboard,
    roles: ["student"],
  },
  {
    path: "/student/profile",
    component: MyProfile,
    roles: ["student"],
  },
  {
    path: "/student/application-status",
    component: ApplicationStatus,
    roles: ["student"],
  },
  {
    path: "/student/documents",
    component: DocumentUpload,
    roles: ["student"],
  },
  {
    path: "/student/appointments",
    component: StudentAppointmentBooking,
    roles: ["student"],
  },
  {
    path: "/student/communication",
    component: CommunicationCenter,
    roles: ["student"],
  },
  {
    path: "/student/tasks",
    component: TaskChecklist,
    roles: ["student"],
  },
  {
    path: "/student/calendar",
    component: DeadlineCalendar,
    roles: ["student"],
  },
  {
    path: "/student/meetings",
    component: MeetingJoin,
    roles: ["student"],
  },
  {
    path: "/student/summary",
    component: ApplicationSummary,
    roles: ["student"],
  },

  // Common Routes
  {
    path: "/profile",
    component: ProfilePage,
    roles: ["super_admin", "manager", "consultant", "receptionist", "student"],
  },
  {
    path: "/settings",
    component: SettingsPage,
    roles: ["super_admin", "manager", "consultant", "receptionist", "student"],
  },
  {
    path: "/notifications",
    component: NotificationsPage,
    roles: ["super_admin", "manager", "consultant", "receptionist", "student"],
  },

  // chat routes
  {
    path: "/chat",
    component: ChatPage,
    roles: ["consultant", "receptionist", "manager", "super_admin"],
    title: "Messages",
  },

  {
    path: "/unauthorized",
    component: UnauthorizedPage,
    isPublic: true,
  },
  {
    path: "*",
    component: NotFoundPage,
    isPublic: true,
  },
];

export const getDefaultRouteByRole = (role) => {
  switch (role) {
    case "super_admin":
      return "/super-admin/dashboard";
    case "manager":
      return "/manager/dashboard";
    case "consultant":
      return "/consultant/dashboard";
    case "receptionist":
      return "/receptionist/dashboard";
    case "student":
      return "/student/dashboard";
    default:
      return "/login";
  }
};
