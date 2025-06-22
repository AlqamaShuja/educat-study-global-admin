import React from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  GraduationCap,
  Award,
  Globe,
  Heart,
  Briefcase,
  DollarSign,
  Info,
  Star,
  BookOpen,
  Target,
  Home,
  Users,
  FileText,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

const LeadDetailsView = ({ lead }) => {
  const InfoCard = ({ icon: Icon, title, children, className = "" }) => (
    <div
      className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200 ${className}`}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center justify-center w-10 h-10 bg-blue-50 rounded-lg">
          <Icon className="w-5 h-5 text-blue-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      </div>
      {children}
    </div>
  );

  const InfoRow = ({ label, value, icon: Icon }) => (
    <div className="flex items-start gap-3 py-2">
      {Icon && (
        <div className="flex items-center justify-center w-5 h-5 mt-0.5">
          <Icon className="w-4 h-4 text-gray-400" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <dt className="text-sm font-medium text-gray-600">{label}</dt>
        <dd className="text-sm text-gray-900 mt-1 break-words">
          {value || <span className="text-gray-400 italic">Not provided</span>}
        </dd>
      </div>
    </div>
  );

  const StatusBadge = ({ status }) => {
    const getStatusColor = (status) => {
      switch (status?.toLowerCase()) {
        case "active":
          return "bg-green-100 text-green-800 border-green-200";
        case "pending":
          return "bg-yellow-100 text-yellow-800 border-yellow-200";
        case "inactive":
          return "bg-gray-100 text-gray-800 border-gray-200";
        case "closed":
          return "bg-red-100 text-red-800 border-red-200";
        default:
          return "bg-blue-100 text-blue-800 border-blue-200";
      }
    };

    return (
      <span
        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
          status
        )}`}
      >
        {status || "Unknown"}
      </span>
    );
  };

  const GradesList = ({ grades }) => (
    <div className="grid grid-cols-2 gap-2 mt-2">
      {grades?.map((grade, index) => (
        <div key={index} className="bg-gray-50 rounded-lg p-3">
          <div className="text-xs font-medium text-gray-600">
            {grade.subject}
          </div>
          <div className="text-sm font-semibold text-gray-900">
            {grade.grade}
          </div>
        </div>
      ))}
    </div>
  );

  const UniversityList = ({ universities }) => (
    <div className="space-y-2 mt-2">
      {universities?.map((uni, index) => (
        <div
          key={index}
          className="flex items-center gap-2 bg-blue-50 rounded-lg p-2"
        >
          <GraduationCap className="w-4 h-4 text-blue-600" />
          <span className="text-sm text-blue-900">{uni}</span>
        </div>
      ))}
    </div>
  );

  return (
    <div className="max-h-[80vh] overflow-y-auto bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Lead Details</h1>
              <p className="text-blue-100 mt-1">
                Complete lead information overview
              </p>
            </div>
            {/* <div className="text-right">
              <div className="text-sm text-blue-100">Lead ID</div>
              <div className="text-lg font-semibold">{lead.id || "N/A"}</div>
            </div> */}
          </div>
          <div className="flex items-center gap-4 mt-4">
            <StatusBadge status={lead.status} />
            {lead.source && (
              <div className="text-sm text-blue-100">
                Source: <span className="font-medium">{lead.source}</span>
              </div>
            )}
          </div>
        </div>

        {/* Student Basic Info */}
        <InfoCard icon={User} title="Student Information">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoRow label="Name" value={lead.student?.name} icon={User} />
            <InfoRow label="Email" value={lead.student?.email} icon={Mail} />
            <InfoRow label="Phone" value={lead.student?.phone} icon={Phone} />
            {/* <InfoRow
              label="Student ID"
              value={lead.student?.id}
              icon={FileText}
            /> */}
          </div>
        </InfoCard>

        {lead.student?.profile && (
          <>
            {/* Personal Information */}
            <InfoCard icon={User} title="Personal Information">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoRow
                  label="Full Name"
                  value={
                    lead.student.profile.personalInfo?.fullName
                      ? `${lead.student.profile.personalInfo.fullName.firstName} ${lead.student.profile.personalInfo.fullName.lastName}`
                      : null
                  }
                  icon={User}
                />
                <InfoRow
                  label="Father's Name"
                  value={lead.student.profile.personalInfo?.fatherName}
                  icon={Users}
                />
                <InfoRow
                  label="Date of Birth"
                  value={lead.student.profile.personalInfo?.dateOfBirth}
                  icon={Calendar}
                />
                <InfoRow
                  label="Gender"
                  value={lead.student.profile.personalInfo?.gender}
                />
                <InfoRow
                  label="Religion"
                  value={lead.student.profile.personalInfo?.religion}
                />
                <InfoRow
                  label="Sect"
                  value={lead.student.profile.personalInfo?.sect}
                />
                <InfoRow
                  label="Ethnicity"
                  value={lead.student.profile.personalInfo?.ethnicity}
                />
                <InfoRow
                  label="CNIC Number"
                  value={lead.student.profile.personalInfo?.cnicNumber}
                  icon={FileText}
                />
                <InfoRow
                  label="Country of Residence"
                  value={lead.student.profile.personalInfo?.residenceCountry}
                  icon={Globe}
                />
              </div>

              {/* Address Section */}
              {lead.student.profile.personalInfo?.permanentAddress && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Permanent Address
                  </h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <InfoRow
                        label="Street"
                        value={
                          lead.student.profile.personalInfo.permanentAddress
                            .street
                        }
                      />
                      <InfoRow
                        label="City"
                        value={
                          lead.student.profile.personalInfo.permanentAddress
                            .city
                        }
                      />
                      <InfoRow
                        label="Postal Code"
                        value={
                          lead.student.profile.personalInfo.permanentAddress
                            .postalCode
                        }
                      />
                      <InfoRow
                        label="Province"
                        value={
                          lead.student.profile.personalInfo.permanentAddress
                            .provinceOfDomicile
                        }
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Emergency Contact */}
              {lead.student.profile.personalInfo?.emergencyContact && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Emergency Contact
                  </h4>
                  <div className="bg-red-50 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <InfoRow
                        label="Name"
                        value={
                          lead.student.profile.personalInfo.emergencyContact
                            .name
                        }
                      />
                      <InfoRow
                        label="Phone"
                        value={
                          lead.student.profile.personalInfo.emergencyContact
                            .phone
                        }
                      />
                      <InfoRow
                        label="Relation"
                        value={
                          lead.student.profile.personalInfo.emergencyContact
                            .relation
                        }
                      />
                    </div>
                  </div>
                </div>
              )}
            </InfoCard>

            {/* Educational Background */}
            <InfoCard icon={GraduationCap} title="Educational Background">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <InfoRow
                  label="Study Level"
                  value={lead.student.profile.educationalBackground?.studyLevel}
                  icon={BookOpen}
                />
                <InfoRow
                  label="Admission Year"
                  value={
                    lead.student.profile.educationalBackground?.admissionYear
                  }
                  icon={Calendar}
                />
                <InfoRow
                  label="Educational Gap"
                  value={
                    lead.student.profile.educationalBackground?.educationalGap
                  }
                />
                <InfoRow
                  label="Additional Certification"
                  value={
                    lead.student.profile.educationalBackground
                      ?.additionalCertification
                      ? "Yes"
                      : "No"
                  }
                  icon={Award}
                />
              </div>

              {/* Matriculation */}
              {lead.student.profile.educationalBackground?.matriculation && (
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Award className="w-4 h-4" />
                    Matriculation
                  </h4>
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-3">
                      <InfoRow
                        label="Year"
                        value={
                          lead.student.profile.educationalBackground
                            .matriculation.year
                        }
                      />
                      <InfoRow
                        label="Board"
                        value={
                          lead.student.profile.educationalBackground
                            .matriculation.board
                        }
                      />
                      <InfoRow
                        label="Roll Number"
                        value={
                          lead.student.profile.educationalBackground
                            .matriculation.rollNumber
                        }
                      />
                      <InfoRow
                        label="Grading System"
                        value={
                          lead.student.profile.educationalBackground
                            .matriculation.gradingSystem
                        }
                      />
                      <InfoRow
                        label="Score Percentage"
                        value={
                          lead.student.profile.educationalBackground
                            .matriculation.scorePercentage
                        }
                      />
                      <InfoRow
                        label="Subjects"
                        value={
                          lead.student.profile.educationalBackground
                            .matriculation.subjects
                        }
                      />
                    </div>
                    {lead.student.profile.educationalBackground.matriculation
                      .grades && (
                      <div>
                        <div className="text-xs font-medium text-gray-600 mb-2">
                          Subject Grades
                        </div>
                        <GradesList
                          grades={
                            lead.student.profile.educationalBackground
                              .matriculation.grades
                          }
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Intermediate */}
              {lead.student.profile.educationalBackground?.intermediate && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <GraduationCap className="w-4 h-4" />
                    Intermediate
                  </h4>
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      <InfoRow
                        label="Year"
                        value={
                          lead.student.profile.educationalBackground
                            .intermediate.year
                        }
                      />
                      <InfoRow
                        label="Board"
                        value={
                          lead.student.profile.educationalBackground
                            .intermediate.board
                        }
                      />
                      <InfoRow
                        label="Roll Number"
                        value={
                          lead.student.profile.educationalBackground
                            .intermediate.rollNumber
                        }
                      />
                      <InfoRow
                        label="Grading System"
                        value={
                          lead.student.profile.educationalBackground
                            .intermediate.gradingSystem
                        }
                      />
                      <InfoRow
                        label="Score Percentage"
                        value={
                          lead.student.profile.educationalBackground
                            .intermediate.scorePercentage
                        }
                      />
                      <InfoRow
                        label="Stream"
                        value={
                          lead.student.profile.educationalBackground
                            .intermediate.preEngineeringOrPreMedical
                        }
                      />
                    </div>
                  </div>
                </div>
              )}
            </InfoCard>

            {/* Test Scores */}
            <InfoCard icon={Award} title="Test Scores & Experience">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoRow
                  label="Backlogs"
                  value={lead.student.profile.testScores?.backlogs}
                />
                <InfoRow
                  label="Part-Time Work"
                  value={
                    lead.student.profile.testScores?.partTimeWork ? "Yes" : "No"
                  }
                  icon={Briefcase}
                />
                <InfoRow
                  label="Work Experience"
                  value={lead.student.profile.testScores?.workExperience}
                  icon={Briefcase}
                />
              </div>

              {lead.student.profile.testScores?.duolingoScore && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    Duolingo Score
                  </h4>
                  <div className="bg-purple-50 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <InfoRow
                        label="Total Score"
                        value={
                          lead.student.profile.testScores.duolingoScore.total
                        }
                      />
                      <InfoRow
                        label="Test Date"
                        value={
                          lead.student.profile.testScores.duolingoScore.testDate
                        }
                      />
                    </div>
                  </div>
                </div>
              )}
            </InfoCard>

            {/* Study Preferences */}
            <InfoCard icon={Target} title="Study Preferences">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <InfoRow
                  label="Career Goals"
                  value={lead.student.profile.studyPreferences?.careerGoals}
                  icon={Target}
                />
                <InfoRow
                  label="Study Reason"
                  value={lead.student.profile.studyPreferences?.studyReason}
                />
                <InfoRow
                  label="Preferred Course"
                  value={lead.student.profile.studyPreferences?.preferredCourse}
                  icon={BookOpen}
                />
                <InfoRow
                  label="Specialization"
                  value={lead.student.profile.studyPreferences?.specialization}
                />
                <InfoRow
                  label="Preferred Country"
                  value={
                    lead.student.profile.studyPreferences?.preferredCountry
                  }
                  icon={Globe}
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <Heart
                    className={`w-5 h-5 mx-auto mb-1 ${
                      lead.student.profile.studyPreferences?.coOpInterest
                        ? "text-green-600"
                        : "text-gray-400"
                    }`}
                  />
                  <div className="text-xs font-medium text-gray-600">
                    Co-op Interest
                  </div>
                  <div className="text-sm font-semibold">
                    {lead.student.profile.studyPreferences?.coOpInterest
                      ? "Yes"
                      : "No"}
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <Users
                    className={`w-5 h-5 mx-auto mb-1 ${
                      lead.student.profile.studyPreferences?.familyAbroad
                        ? "text-green-600"
                        : "text-gray-400"
                    }`}
                  />
                  <div className="text-xs font-medium text-gray-600">
                    Family Abroad
                  </div>
                  <div className="text-sm font-semibold">
                    {lead.student.profile.studyPreferences?.familyAbroad
                      ? "Yes"
                      : "No"}
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <Award
                    className={`w-5 h-5 mx-auto mb-1 ${
                      lead.student.profile.studyPreferences?.scholarshipInterest
                        ? "text-green-600"
                        : "text-gray-400"
                    }`}
                  />
                  <div className="text-xs font-medium text-gray-600">
                    Scholarship
                  </div>
                  <div className="text-sm font-semibold">
                    {lead.student.profile.studyPreferences?.scholarshipInterest
                      ? "Yes"
                      : "No"}
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <Home
                    className={`w-5 h-5 mx-auto mb-1 ${
                      lead.student.profile.studyPreferences
                        ?.accommodationSupport
                        ? "text-green-600"
                        : "text-gray-400"
                    }`}
                  />
                  <div className="text-xs font-medium text-gray-600">
                    Accommodation
                  </div>
                  <div className="text-sm font-semibold">
                    {lead.student.profile.studyPreferences?.accommodationSupport
                      ? "Yes"
                      : "No"}
                  </div>
                </div>
              </div>

              {lead.student.profile.studyPreferences?.intendedIntake && (
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Intended Intake
                  </h4>
                  <div className="bg-yellow-50 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <InfoRow
                        label="Season"
                        value={
                          lead.student.profile.studyPreferences.intendedIntake
                            .season
                        }
                      />
                      <InfoRow
                        label="Year"
                        value={
                          lead.student.profile.studyPreferences.intendedIntake
                            .year
                        }
                      />
                    </div>
                  </div>
                </div>
              )}

              {lead.student.profile.studyPreferences?.preferredUniversities && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Star className="w-4 h-4" />
                    Preferred Universities
                  </h4>
                  <UniversityList
                    universities={
                      lead.student.profile.studyPreferences
                        .preferredUniversities
                    }
                  />
                </div>
              )}
            </InfoCard>

            {/* Additional Sections */}
            {(lead.student.profile.workExperience ||
              lead.student.profile.financialInfo ||
              lead.student.profile.additionalInfo) && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {lead.student.profile.workExperience && (
                  <InfoCard
                    icon={Briefcase}
                    title="Work Experience"
                    className="lg:col-span-1"
                  >
                    <div className="space-y-2">
                      {Object.entries(lead.student.profile.workExperience).map(
                        ([key, value]) => (
                          <InfoRow
                            key={key}
                            label={key.charAt(0).toUpperCase() + key.slice(1)}
                            value={
                              typeof value === "object"
                                ? JSON.stringify(value)
                                : value
                            }
                          />
                        )
                      )}
                    </div>
                  </InfoCard>
                )}

                {lead.student.profile.financialInfo && (
                  <InfoCard
                    icon={DollarSign}
                    title="Financial Information"
                    className="lg:col-span-1"
                  >
                    <div className="space-y-2">
                      {Object.entries(lead.student.profile.financialInfo).map(
                        ([key, value]) => (
                          <InfoRow
                            key={key}
                            label={key.charAt(0).toUpperCase() + key.slice(1)}
                            value={
                              typeof value === "object"
                                ? JSON.stringify(value)
                                : value
                            }
                          />
                        )
                      )}
                    </div>
                  </InfoCard>
                )}

                {lead.student.profile.additionalInfo && (
                  <InfoCard
                    icon={Info}
                    title="Additional Information"
                    className="lg:col-span-1"
                  >
                    <div className="space-y-2">
                      {Object.entries(lead.student.profile.additionalInfo).map(
                        ([key, value]) => (
                          <InfoRow
                            key={key}
                            label={key.charAt(0).toUpperCase() + key.slice(1)}
                            value={
                              typeof value === "object"
                                ? JSON.stringify(value)
                                : value
                            }
                          />
                        )
                      )}
                    </div>
                  </InfoCard>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default LeadDetailsView;

// // Sample data for preview
// const sampleLead = {
//   id: "LEAD-2024-001",
//   status: "active",
//   source: "Website Form",
//   student: {
//     name: "Ahmed Hassan",
//     email: "ahmed.hassan@example.com",
//     phone: "+92-300-1234567",
//     id: "STU-2024-001",
//     profile: {
//       personalInfo: {
//         fullName: {
//           firstName: "Ahmed",
//           lastName: "Hassan",
//         },
//         fatherName: "Muhammad Hassan",
//         dateOfBirth: "1998-05-15",
//         gender: "Male",
//         religion: "Islam",
//         sect: "Sunni",
//         ethnicity: "Punjabi",
//         cnicNumber: "12345-6789012-3",
//         residenceCountry: "Pakistan",
//         permanentAddress: {
//           street: "123 Main Street",
//           city: "Lahore",
//           postalCode: "54000",
//           provinceOfDomicile: "Punjab",
//         },
//         emergencyContact: {
//           name: "Fatima Hassan",
//           phone: "+92-300-9876543",
//           relation: "Mother",
//         },
//       },
//       educationalBackground: {
//         studyLevel: "Undergraduate",
//         admissionYear: "2024",
//         educationalGap: "No gap",
//         additionalCertification: true,
//         matriculation: {
//           year: "2016",
//           board: "BISE Lahore",
//           rollNumber: "123456",
//           gradingSystem: "Percentage",
//           scorePercentage: "85%",
//           subjects: "Science",
//           grades: [
//             { subject: "Mathematics", grade: "A+" },
//             { subject: "Physics", grade: "A" },
//             { subject: "Chemistry", grade: "A" },
//           ],
//         },
//         intermediate: {
//           year: "2018",
//           board: "BISE Lahore",
//           rollNumber: "789012",
//           gradingSystem: "Percentage",
//           scorePercentage: "82%",
//           preEngineeringOrPreMedical: "Pre-Engineering",
//         },
//       },
//       testScores: {
//         backlogs: "None",
//         partTimeWork: true,
//         workExperience: "2 years",
//         duolingoScore: {
//           total: "120",
//           testDate: "2024-01-15",
//         },
//       },
//       studyPreferences: {
//         careerGoals: "Software Engineer",
//         studyReason: "Career advancement",
//         coOpInterest: true,
//         familyAbroad: false,
//         scholarshipInterest: true,
//         accommodationSupport: true,
//         preferredCourse: "Computer Science",
//         specialization: "Artificial Intelligence",
//         preferredCountry: "Canada",
//         intendedIntake: {
//           season: "Fall",
//           year: "2024",
//         },
//         preferredUniversities: [
//           "University of Toronto",
//           "University of British Columbia",
//           "McGill University",
//         ],
//       },
//       workExperience: {
//         company: "Tech Solutions Ltd",
//         position: "Junior Developer",
//         duration: "2 years",
//       },
//       financialInfo: {
//         sponsor: "Self-sponsored",
//         budget: "$50,000 CAD",
//       },
//       additionalInfo: {
//         hobbies: "Reading, Coding",
//         languages: "English, Urdu, Punjabi",
//       },
//     },
//   },
// };

// export default function App() {
//   return <LeadDetailsView lead={sampleLead} />;
// }
