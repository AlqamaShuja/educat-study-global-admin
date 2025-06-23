import React, { useState, useEffect } from "react";
import {
  GraduationCap,
  MapPin,
  Globe,
  Calendar,
  Users,
  Award,
  Clock,
  DollarSign,
  BookOpen,
  Building,
  Star,
  CheckCircle,
  XCircle,
  Loader,
  AlertCircle,
  Home,
  Trophy,
  Zap,
  Target,
  FileText,
  CreditCard,
} from "lucide-react";
import { useLocation, useParams } from "react-router-dom";

// Import your university service
// import universityService from '../services/universityService';

const UniversityDetails = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { universityId } = useParams();
  const location = useLocation();
  const universityData = location.state;

  useEffect(() => {
    if (universityId) {
      fetchCourses();
    }
  }, [universityId]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      // Replace with your actual service call
      // const response = await universityService.getUniversityCourses(universityId);
      // setCourses(response.data);

      // Mock data for demonstration - remove this when implementing
      setTimeout(() => {
        setCourses([
          {
            id: "3e15e8d4-e77d-4dee-b084-e881c70f084b",
            name: "Algorithm & Basic Programming",
            duration: "4 Month",
            creditHour: "3",
            level: "bachelor",
            tuitionFee: null,
            universityId: "76ca3983-038d-486c-8fba-ffe8dc8ab033",
            details: {},
            createdAt: "2025-06-13T20:08:44.567Z",
            updatedAt: "2025-06-13T20:38:04.636Z",
          },
          {
            id: "3381e711-45a3-4dd5-8390-02b24bfd261c",
            name: "UI/UX Designing",
            duration: "3 month",
            creditHour: "20",
            level: "certificate",
            tuitionFee: "10000",
            universityId: "76ca3983-038d-486c-8fba-ffe8dc8ab033",
            details: {
              modules: [
                {
                  name: "Basic",
                  credits: "5",
                  description: "test description",
                },
              ],
              prerequisites: "",
              careerProspects: "",
              entryRequirements: "no requirement",
              englishRequirements: "IELTS 6.5",
              applicationDeadline: "2025-10-08",
              startDates: ["october", "may"],
              scholarships: "",
              fees: {
                tuition: "10000",
                application: "1000",
                deposit: "1500",
                other: "0",
              },
              duration: {
                years: "0",
                months: "3",
                fullTime: false,
                partTime: true,
              },
            },
            createdAt: "2025-06-19T12:42:39.792Z",
            updatedAt: "2025-06-19T12:45:52.581Z",
          },
        ]);
        setLoading(false);
      }, 1000);
    } catch (err) {
      setError("Failed to fetch courses");
      setLoading(false);
    }
  };

  if (!universityData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 mb-4">
            <GraduationCap size={64} className="mx-auto" />
          </div>
          <h2 className="text-xl font-semibold text-gray-700">
            No University Data Available
          </h2>
          <p className="text-gray-500 mt-2">
            Please select a university to view details.
          </p>
        </div>
      </div>
    );
  }

  const getMouStatusBadge = (status) => {
    const statusConfig = {
      direct: {
        color: "bg-green-100 text-green-800",
        icon: CheckCircle,
        label: "Direct Partnership",
      },
      indirect: {
        color: "bg-yellow-100 text-yellow-800",
        icon: AlertCircle,
        label: "Indirect Partnership",
      },
      none: {
        color: "bg-gray-100 text-gray-800",
        icon: XCircle,
        label: "No Partnership",
      },
    };

    const config = statusConfig[status] || statusConfig.none;
    const IconComponent = config.icon;

    return (
      <span
        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${config.color}`}
      >
        <IconComponent size={14} />
        {config.label}
      </span>
    );
  };

  const getLevelBadge = (level) => {
    const levelConfig = {
      bachelor: "bg-blue-100 text-blue-800",
      master: "bg-purple-100 text-purple-800",
      phd: "bg-red-100 text-red-800",
      diploma: "bg-orange-100 text-orange-800",
      certificate: "bg-green-100 text-green-800",
    };

    return (
      <span
        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
          levelConfig[level] || "bg-gray-100 text-gray-800"
        }`}
      >
        {level?.charAt(0).toUpperCase() + level?.slice(1)}
      </span>
    );
  };

  const InfoCard = ({ icon: Icon, title, children, className = "" }) => (
    <div
      className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200 ${className}`}
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

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-8 text-white mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <GraduationCap className="text-white" size={32} />
                </div>
                <div>
                  <h1 className="text-3xl font-bold mb-2">
                    {universityData.name}
                  </h1>
                  <div className="flex items-center gap-4 text-blue-100">
                    {universityData.country && (
                      <div className="flex items-center gap-1">
                        <MapPin size={16} />
                        <span>
                          {universityData.city
                            ? `${universityData.city}, `
                            : ""}
                          {universityData.country}
                        </span>
                      </div>
                    )}
                    {universityData.website && (
                      <div className="flex items-center gap-1">
                        <Globe size={16} />
                        <a
                          href={`https://${universityData.website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-white transition-colors"
                        >
                          {universityData.website}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              {getMouStatusBadge(universityData.mouStatus)}
            </div>
            <div className="text-sm text-blue-100">
              <p>
                Established: {universityData.details?.establishedYear || "N/A"}
              </p>
              <p>
                Updated:{" "}
                {new Date(universityData.updatedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* University Details - Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <InfoCard icon={Building} title="University Overview">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoRow
                  label="Student Population"
                  value={universityData.details?.studentPopulation}
                  icon={Users}
                />
                <InfoRow
                  label="International Students"
                  value={universityData.details?.internationalStudents}
                  icon={Globe}
                />
                <InfoRow
                  label="Number of Campuses"
                  value={universityData.details?.campuses}
                  icon={Building}
                />
                <InfoRow
                  label="World Ranking"
                  value={universityData.details?.ranking}
                  icon={Trophy}
                />
                <InfoRow
                  label="Accreditation"
                  value={universityData.details?.accreditation}
                  icon={Award}
                />
                <InfoRow
                  label="Established Year"
                  value={universityData.details?.establishedYear}
                  icon={Calendar}
                />
              </div>
            </InfoCard>

            {/* Programs & Facilities */}
            <InfoCard icon={BookOpen} title="Programs & Facilities">
              {universityData.details?.programs && (
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">
                    Available Programs
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {universityData.details.programs.map((program, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium"
                      >
                        {program.charAt(0).toUpperCase() + program.slice(1)}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {universityData.details?.facilities && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">
                    Campus Facilities
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {universityData.details.facilities.map(
                      (facility, index) => {
                        const facilityIcons = {
                          library: BookOpen,
                          labs: Zap,
                          sports: Trophy,
                          hostel: Home,
                        };
                        const IconComponent =
                          facilityIcons[facility] || CheckCircle;

                        return (
                          <div
                            key={index}
                            className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg"
                          >
                            <IconComponent
                              className="text-green-600"
                              size={16}
                            />
                            <span className="text-sm font-medium text-gray-700 capitalize">
                              {facility}
                            </span>
                          </div>
                        );
                      }
                    )}
                  </div>
                </div>
              )}
            </InfoCard>

            {/* Additional Information */}
            {(universityData.details?.admissionRequirements ||
              universityData.details?.scholarships) && (
              <InfoCard icon={FileText} title="Admission & Financial Aid">
                {universityData.details?.admissionRequirements && (
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">
                      Admission Requirements
                    </h4>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {universityData.details.admissionRequirements.length > 300
                        ? `${universityData.details.admissionRequirements.substring(
                            0,
                            300
                          )}...`
                        : universityData.details.admissionRequirements}
                    </p>
                  </div>
                )}

                {universityData.details?.scholarships && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">
                      Scholarships
                    </h4>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {universityData.details.scholarships.length > 300
                        ? `${universityData.details.scholarships.substring(
                            0,
                            300
                          )}...`
                        : universityData.details.scholarships}
                    </p>
                  </div>
                )}

                {universityData.details?.applicationDeadlines && (
                  <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Calendar className="text-yellow-600" size={16} />
                      <span className="text-sm font-medium text-yellow-800">
                        Application Deadline:{" "}
                        {universityData.details.applicationDeadlines}
                      </span>
                    </div>
                  </div>
                )}
              </InfoCard>
            )}
          </div>

          {/* Right Column - Stats & Courses */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Quick Stats
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <BookOpen className="text-blue-600" size={16} />
                    <span className="text-sm font-medium text-blue-800">
                      Total Courses
                    </span>
                  </div>
                  <span className="text-lg font-bold text-blue-600">
                    {courses.length}
                  </span>
                </div>

                {universityData.details?.studentPopulation && (
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Users className="text-green-600" size={16} />
                      <span className="text-sm font-medium text-green-800">
                        Students
                      </span>
                    </div>
                    <span className="text-lg font-bold text-green-600">
                      {parseInt(
                        universityData.details.studentPopulation
                      ).toLocaleString()}
                    </span>
                  </div>
                )}

                {universityData.details?.ranking && (
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Star className="text-purple-600" size={16} />
                      <span className="text-sm font-medium text-purple-800">
                        World Rank
                      </span>
                    </div>
                    <span className="text-lg font-bold text-purple-600">
                      #{universityData.details.ranking}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Courses Section */}
        <div className="mt-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <BookOpen className="text-blue-600" size={24} />
                Available Courses ({courses.length})
              </h2>
              <button
                onClick={fetchCourses}
                disabled={loading}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                {loading ? <Loader className="animate-spin" size={16} /> : null}
                Refresh
              </button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Loader
                    className="animate-spin text-blue-600 mx-auto mb-4"
                    size={48}
                  />
                  <p className="text-gray-500">Loading courses...</p>
                </div>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <AlertCircle className="text-red-400 mx-auto mb-4" size={48} />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  Error Loading Courses
                </h3>
                <p className="text-gray-500 mb-4">{error}</p>
                <button
                  onClick={fetchCourses}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Try Again
                </button>
              </div>
            ) : courses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course) => (
                  <div
                    key={course.id}
                    className="bg-gray-50 rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {course.name}
                        </h3>
                        <div className="flex items-center gap-2 mb-3">
                          {getLevelBadge(course.level)}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock size={14} />
                        <span>Duration: {course.duration}</span>
                      </div>

                      {course.creditHour && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Award size={14} />
                          <span>Credits: {course.creditHour}</span>
                        </div>
                      )}

                      {course.tuitionFee && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <DollarSign size={14} />
                          <span>
                            Fee: ${parseInt(course.tuitionFee).toLocaleString()}
                          </span>
                        </div>
                      )}

                      {course.details?.englishRequirements && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Globe size={14} />
                          <span>{course.details.englishRequirements}</span>
                        </div>
                      )}

                      {course.details?.applicationDeadline && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar size={14} />
                          <span>
                            Deadline:{" "}
                            {new Date(
                              course.details.applicationDeadline
                            ).toLocaleDateString()}
                          </span>
                        </div>
                      )}

                      {course.details?.startDates && (
                        <div className="mt-3">
                          <div className="text-xs font-medium text-gray-500 mb-1">
                            Start Dates:
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {course.details.startDates.map((date, index) => (
                              <span
                                key={index}
                                className="inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                              >
                                {date.charAt(0).toUpperCase() + date.slice(1)}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {course.details?.fees && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="text-xs font-medium text-gray-500 mb-2">
                          Fee Breakdown:
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Tuition:</span>
                            <span className="font-medium">
                              ${course.details.fees.tuition}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Application:</span>
                            <span className="font-medium">
                              ${course.details.fees.application}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <BookOpen className="text-gray-300 mx-auto mb-4" size={48} />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  No Courses Available
                </h3>
                <p className="text-gray-500">
                  This university hasn't published any courses yet.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UniversityDetails;
