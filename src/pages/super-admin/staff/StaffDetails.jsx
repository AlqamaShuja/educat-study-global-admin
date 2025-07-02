import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  User,
  Briefcase,
  Clock,
  Shield,
  Award,
  TrendingUp,
  Users,
  FileText,
  Activity,
} from "lucide-react";
import Button from "../../../components/ui/Button";

const StaffDetails = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const staff = location.state?.staff;

  const handleBack = () => {
    navigate("/super-admin/staff");
  };

  // Generate dummy data for staff member
  const generateDummyData = (baseStaff) => {
    const dummyData = {
      ...baseStaff,
      // Personal Information
      fullName: baseStaff.name || "John Doe",
      personalInfo: {
        dateOfBirth: "1990-05-15",
        gender: "Male",
        nationality: "Pakistani",
        address: {
          street: "123 Main Street",
          city: "Karachi",
          state: "Sindh",
          zipCode: "75400",
          country: "Pakistan",
        },
        emergencyContact: {
          name: "Jane Doe",
          relationship: "Spouse",
          phone: "+92-300-1234567",
        },
      },

      // Professional Information
      professionalInfo: {
        employeeId:
          "EMP-" +
          Math.floor(Math.random() * 10000)
            .toString()
            .padStart(4, "0"),
        department:
          baseStaff.role === "consultant"
            ? "Student Counseling"
            : baseStaff.role === "manager"
            ? "Operations"
            : baseStaff.role === "receptionist"
            ? "Front Desk"
            : "Administration",
        designation:
          baseStaff.role === "consultant"
            ? "Senior Education Consultant"
            : baseStaff.role === "manager"
            ? "Branch Manager"
            : baseStaff.role === "receptionist"
            ? "Front Desk Executive"
            : "Super Administrator",
        joiningDate: "2023-01-15",
        salary:
          baseStaff.role === "consultant"
            ? "₨85,000"
            : baseStaff.role === "manager"
            ? "₨120,000"
            : baseStaff.role === "receptionist"
            ? "₨45,000"
            : "₨200,000",
        experience: "3 years",
        reportingTo:
          baseStaff.role === "consultant"
            ? "Branch Manager"
            : baseStaff.role === "receptionist"
            ? "Branch Manager"
            : "CEO",
        workingHours: "9:00 AM - 6:00 PM",
        workingDays: "Monday - Friday",
      },

      // Education & Qualifications
      education: [
        {
          degree: "Master's in Business Administration",
          institution: "Karachi University",
          year: "2020",
          grade: "A",
        },
        {
          degree: "Bachelor's in Education",
          institution: "NED University",
          year: "2018",
          grade: "A+",
        },
      ],

      // Certifications
      certifications: [
        {
          name: "Certified Education Counselor",
          issuedBy: "International Association of Educational Consultants",
          issuedDate: "2022-06-15",
          expiryDate: "2025-06-15",
        },
        {
          name: "Customer Service Excellence",
          issuedBy: "Customer Service Institute",
          issuedDate: "2023-03-10",
          expiryDate: "2026-03-10",
        },
      ],

      // Performance Metrics
      performance: {
        currentRating: 4.5,
        totalStudentsHelped: 156,
        averageResponseTime: "2.3 hours",
        customerSatisfaction: "94%",
        tasksCompleted: 892,
        monthlyTargets: {
          achieved: 23,
          total: 25,
        },
      },

      // Skills
      skills: [
        "Student Counseling",
        "Communication",
        "Problem Solving",
        "Time Management",
        "Microsoft Office",
        "CRM Systems",
        "Multi-lingual (English, Urdu, Hindi)",
      ],

      // Recent Activities
      recentActivities: [
        {
          action: "Helped student with university application",
          date: "2025-07-01",
          type: "student_assistance",
        },
        {
          action: "Completed monthly training session",
          date: "2025-06-30",
          type: "training",
        },
        {
          action: "Updated student profile information",
          date: "2025-06-29",
          type: "data_update",
        },
        {
          action: "Attended team meeting",
          date: "2025-06-28",
          type: "meeting",
        },
      ],

      // Leave Balance
      leaveBalance: {
        annual: { used: 8, total: 25 },
        sick: { used: 2, total: 12 },
        casual: { used: 3, total: 10 },
      },

      // Documents
      documents: [
        { name: "Resume", status: "Uploaded", date: "2023-01-10" },
        { name: "CNIC Copy", status: "Verified", date: "2023-01-10" },
        {
          name: "Educational Certificates",
          status: "Verified",
          date: "2023-01-12",
        },
        { name: "Medical Certificate", status: "Pending", date: "2023-01-15" },
      ],
    };

    return dummyData;
  };

  if (!staff) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <div className="text-center">
            <div className="text-6xl mb-4">😕</div>
            <h4 className="text-xl font-semibold mb-4 text-gray-800">
              Staff member not found
            </h4>
            <p className="text-gray-600 mb-6">
              The staff member you're looking for doesn't exist or has been
              removed.
            </p>
            <Button onClick={handleBack} className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Go Back to Staff List
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const staffData = generateDummyData(staff);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getRoleColor = (role) => {
    switch (role?.toLowerCase()) {
      case "super_admin":
        return "bg-purple-100 text-purple-800";
      case "manager":
        return "bg-blue-100 text-blue-800";
      case "consultant":
        return "bg-green-100 text-green-800";
      case "receptionist":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const InfoCard = ({ icon: Icon, title, children, className = "" }) => (
    <div
      className={`bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow ${className}`}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Icon className="h-5 w-5 text-blue-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
      </div>
      {children}
    </div>
  );

  const StatCard = ({ icon: Icon, label, value, color = "blue" }) => (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{label}</p>
          <p className="text-2xl font-bold text-gray-800">{value}</p>
        </div>
        <div className={`p-3 bg-${color}-100 rounded-lg`}>
          <Icon className={`h-6 w-6 text-${color}-600`} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <Button
          onClick={handleBack}
          variant="outline"
          className="flex items-center gap-2 hover:bg-gray-100"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Staff List
        </Button>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="relative">
            {/* Cover Background */}
            <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-600 rounded-t-lg"></div>

            {/* Profile Content */}
            <div className="relative px-6 pb-6">
              {/* Avatar */}
              <div className="absolute -top-16 left-6">
                <div className="w-32 h-32 bg-white rounded-full p-2 shadow-lg">
                  <div className="w-full h-full bg-gray-100 rounded-full flex items-center justify-center text-4xl">
                    👤
                  </div>
                </div>
              </div>

              {/* Profile Info */}
              <div className="pt-20 flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-800 mb-2">
                    {staffData.fullName}
                  </h1>
                  <p className="text-lg text-gray-600 mb-3">
                    {staffData.professionalInfo.designation}
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(
                        staffData.status
                      )}`}
                    >
                      {staffData.status?.toUpperCase() || "ACTIVE"}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${getRoleColor(
                        staffData.role
                      )}`}
                    >
                      {staffData.role?.replace("_", " ").toUpperCase()}
                    </span>
                    {/* <span className="px-3 py-1 rounded-full text-sm font-semibold bg-gray-100 text-gray-800">
                      ID: {staffData.professionalInfo.employeeId}
                    </span> */}
                  </div>
                </div>

                <div className="mt-4 md:mt-0 flex gap-3">
                  {/* <Button variant="outline" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Send Message
                  </Button>
                  <Button className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Edit Profile
                  </Button> */}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <StatCard
            icon={TrendingUp}
            label="Performance Rating"
            value={`${staffData.performance.currentRating}/5`}
            color="green"
          />
          <StatCard
            icon={Users}
            label="Students Helped"
            value={staffData.performance.totalStudentsHelped}
            color="blue"
          />
          <StatCard
            icon={Clock}
            label="Avg Response Time"
            value={staffData.performance.averageResponseTime}
            color="purple"
          />
          <StatCard
            icon={Award}
            label="Customer Satisfaction"
            value={staffData.performance.customerSatisfaction}
            color="yellow"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact Information */}
            <InfoCard icon={Mail} title="Contact Information">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium">{staffData.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="font-medium">
                      {staffData.phone ||
                        staffData.personalInfo.emergencyContact.phone}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Address</p>
                    <p className="font-medium">
                      {staffData.personalInfo.address.city},{" "}
                      {staffData.personalInfo.address.state}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Emergency Contact</p>
                    <p className="font-medium">
                      {staffData.personalInfo.emergencyContact.name}
                    </p>
                  </div>
                </div>
              </div>
            </InfoCard>

            {/* Professional Information */}
            <InfoCard icon={Briefcase} title="Professional Information">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Department</p>
                  <p className="font-medium">
                    {staffData.professionalInfo.department}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Joining Date</p>
                  <p className="font-medium">
                    {new Date(
                      staffData.professionalInfo.joiningDate
                    ).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Experience</p>
                  <p className="font-medium">
                    {staffData.professionalInfo.experience}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Salary</p>
                  <p className="font-medium">
                    {staffData.professionalInfo.salary}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Working Hours</p>
                  <p className="font-medium">
                    {staffData.professionalInfo.workingHours}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Reporting To</p>
                  <p className="font-medium">
                    {staffData.professionalInfo.reportingTo}
                  </p>
                </div>
              </div>
            </InfoCard>

            {/* Education & Certifications */}
            <InfoCard icon={Award} title="Education & Certifications">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">Education</h4>
                  {staffData.education.map((edu, index) => (
                    <div
                      key={index}
                      className="border-l-4 border-blue-500 pl-4 py-2"
                    >
                      <p className="font-medium">{edu.degree}</p>
                      <p className="text-sm text-gray-600">
                        {edu.institution} • {edu.year} • Grade: {edu.grade}
                      </p>
                    </div>
                  ))}
                </div>
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">
                    Certifications
                  </h4>
                  {staffData.certifications.map((cert, index) => (
                    <div
                      key={index}
                      className="border-l-4 border-green-500 pl-4 py-2"
                    >
                      <p className="font-medium">{cert.name}</p>
                      <p className="text-sm text-gray-600">
                        {cert.issuedBy} • Valid until{" "}
                        {new Date(cert.expiryDate).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </InfoCard>

            {/* Skills */}
            <InfoCard icon={TrendingUp} title="Skills & Expertise">
              <div className="flex flex-wrap gap-2">
                {staffData.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </InfoCard>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <InfoCard icon={Activity} title="Performance Overview">
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-600">
                      Monthly Targets
                    </span>
                    <span className="text-sm font-medium">
                      {staffData.performance.monthlyTargets.achieved}/
                      {staffData.performance.monthlyTargets.total}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{
                        width: `${
                          (staffData.performance.monthlyTargets.achieved /
                            staffData.performance.monthlyTargets.total) *
                          100
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Tasks Completed</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {staffData.performance.tasksCompleted}
                  </p>
                </div>
              </div>
            </InfoCard>

            {/* Leave Balance */}
            <InfoCard icon={Calendar} title="Leave Balance">
              <div className="space-y-3">
                {Object.entries(staffData.leaveBalance).map(
                  ([type, balance]) => (
                    <div key={type}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm text-gray-600 capitalize">
                          {type} Leave
                        </span>
                        <span className="text-sm font-medium">
                          {balance.total - balance.used}/{balance.total}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{
                            width: `${
                              ((balance.total - balance.used) / balance.total) *
                              100
                            }%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  )
                )}
              </div>
            </InfoCard>

            {/* Recent Activities */}
            <InfoCard icon={Activity} title="Recent Activities">
              <div className="space-y-3">
                {staffData.recentActivities
                  .slice(0, 5)
                  .map((activity, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">
                          {activity.action}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(activity.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </InfoCard>

            {/* Documents */}
            <InfoCard icon={FileText} title="Documents">
              <div className="space-y-2">
                {staffData.documents.map((doc, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 border border-gray-200 rounded"
                  >
                    <span className="text-sm text-gray-800">{doc.name}</span>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        doc.status === "Verified"
                          ? "bg-green-100 text-green-800"
                          : doc.status === "Pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {doc.status}
                    </span>
                  </div>
                ))}
              </div>
            </InfoCard>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffDetails;

// import React from 'react';
// import { useNavigate, useLocation } from 'react-router-dom';
// import Button from '../../../components/ui/Button';

// const StaffDetails = () => {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const staff = location.state?.staff;

//   const handleBack = () => {
//     navigate('/super-admin/staff');
//   };

//   if (!staff) {
//     return (
//       <div className="bg-white rounded-lg shadow p-8">
//         <div className="text-center">
//           <h4 className="text-xl font-semibold mb-4">Staff member not found</h4>
//           <Button onClick={handleBack}>
//             ← Go Back
//           </Button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="p-6">
//       <div className="mb-6">
//         <Button onClick={handleBack}>
//           ← Back to Staff List
//         </Button>
//       </div>

//       <div className="bg-white rounded-lg shadow p-8">
//         <div className="text-center mb-8">
//           <div className="text-6xl text-blue-500 mb-4">
//             👤
//           </div>
//           <h2 className="text-2xl font-bold mb-2">{staff.name}</h2>
//           <span className={`px-3 py-1 rounded-full text-sm font-semibold ${staff.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
//             {staff.status?.toUpperCase()}
//           </span>
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           <div className="border rounded p-4">
//             <div className="text-gray-600 mb-1">Email</div>
//             <div className="flex items-center">
//               ✉️ {staff.email}
//             </div>
//           </div>
//           <div className="border rounded p-4">
//             <div className="text-gray-600 mb-1">Phone</div>
//             <div className="flex items-center">
//               📱 {staff.phone || 'N/A'}
//             </div>
//           </div>
//           <div className="border rounded p-4">
//             <div className="text-gray-600 mb-1">Role</div>
//             <div className="flex items-center">
//               <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
//                 {staff.role?.toUpperCase()}
//               </span>
//             </div>
//           </div>
//           <div className="border rounded p-4">
//             <div className="text-gray-600 mb-1">Office</div>
//             <div>{staff.office?.name || 'N/A'}</div>
//           </div>
//           <div className="border rounded p-4">
//             <div className="text-gray-600 mb-1">Created At</div>
//             <div>{new Date(staff.createdAt).toLocaleDateString()}</div>
//           </div>
//           <div className="border rounded p-4">
//             <div className="text-gray-600 mb-1">Last Updated</div>
//             <div>{new Date(staff.updatedAt).toLocaleDateString()}</div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default StaffDetails;
