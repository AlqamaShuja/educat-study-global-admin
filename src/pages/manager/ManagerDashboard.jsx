import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useManagerStore from "../../stores/useManagerStore";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { Users, FileText, CheckCircle, Clock, Eye } from "lucide-react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ManagerDashboard = () => {
  const navigate = useNavigate();
  const { dashboard, leads, fetchDashboard, fetchLeads, loading, error } =
    useManagerStore();

  useEffect(() => {
    console.log("Fetching dashboard and leads...");
    fetchDashboard();
    fetchLeads();
  }, [fetchDashboard, fetchLeads]);

  useEffect(() => {
    if (error) {
      console.error("Dashboard error:", error);
      toast.error(error, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored",
      });
    }
  }, [error]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" className="text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 bg-gradient-to-br from-gray-50 to-indigo-50 min-h-screen">
      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Manager Dashboard
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Monitor office performance and manage leads at a glance
          </p>
        </div>
        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={() => navigate("/manager/performance")}
            className="border-blue-300 text-blue-500 hover:bg-indigo-50 transition-colors duration-200"
          >
            <Users className="h-4 w-4 mr-2" />
            Consultants
          </Button>
          <Button
            variant="primary"
            onClick={() => navigate("/manager/leads")}
            className="bg-blue-600 hover:bg-blue-800 text-white transition-colors duration-200"
          >
            <FileText className="h-4 w-4 mr-2" />
            Manage Leads
          </Button>
        </div>
      </header>

      {/* Dashboard Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card
          className="relative overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 animate-fade-in bg-white"
          title="Total Leads"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-blue-500" />
          <div className="flex items-center p-4">
            <FileText className="h-10 w-10 text-blue-500 mr-4 flex-shrink-0" />
            <div>
              <p className="text-3xl font-bold text-gray-900">
                {dashboard?.totalLeads || 0}
              </p>
              <p className="text-xs text-gray-500">All leads in pipeline</p>
            </div>
          </div>
        </Card>
        <Card
          className="relative overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 animate-fade-in bg-white"
          title="Converted Leads"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-green-500" />
          <div className="flex items-center p-4">
            <CheckCircle className="h-10 w-10 text-green-500 mr-4 flex-shrink-0" />
            <div>
              <p className="text-3xl font-bold text-gray-900">
                {dashboard?.convertedLeads || 0}
              </p>
              <p className="text-xs text-gray-500">Successful conversions</p>
            </div>
          </div>
        </Card>
        <Card
          className="relative overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 animate-fade-in bg-white"
          title="Conversion Rate"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-indigo-500" />
          <div className="flex items-center p-4">
            <CheckCircle className="h-10 w-10 text-indigo-500 mr-4 flex-shrink-0" />
            <div>
              <p className="text-3xl font-bold text-gray-900">
                {((dashboard?.conversionRate || 0) * 100).toFixed(2)}%
              </p>
              <p className="text-xs text-gray-500">Lead success rate</p>
            </div>
          </div>
        </Card>
        <Card
          className="relative overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 animate-fade-in bg-white"
          title="Pending Appointments"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-yellow-500" />
          <div className="flex items-center p-4">
            <Clock className="h-10 w-10 text-yellow-500 mr-4 flex-shrink-0" />
            <div>
              <p className="text-3xl font-bold text-gray-900">
                {dashboard?.pendingAppointments || 0}
              </p>
              <p className="text-xs text-gray-500">Upcoming meetings</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Leads */}
      <Card
        className="shadow-md hover:shadow-lg transition-shadow duration-300 animate-fade-in bg-white"
        title="Recent Leads"
      >
        {leads.length ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {leads.slice(0, 5).map((lead, index) => (
                  <tr
                    key={lead.id}
                    className={`hover:bg-indigo-50 transition-colors duration-200 ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50"
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {lead.student?.name || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {lead.student?.email || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge
                        className={`${
                          lead.status === "converted"
                            ? "bg-green-100 text-green-800"
                            : lead.status === "in_progress"
                            ? "bg-blue-100 text-blue-800"
                            : lead.status === "lost"
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-800"
                        } px-2 py-1 text-xs font-medium rounded-full`}
                      >
                        {lead.status
                          ? lead.status
                              .replace(/_/g, " ")
                              .replace(/\b\w/g, (c) => c.toUpperCase())
                          : "New"}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          navigate(`/manager/students/${lead.studentId}`)
                        }
                        className="border-indigo-300 text-blue-600 hover:bg-indigo-50 transition-colors duration-200"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-sm text-gray-500">No leads available</p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default ManagerDashboard;

// import React, { useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import useManagerStore from "../../stores/useManagerStore";
// import Card from "../../components/ui/Card";
// import Button from "../../components/ui/Button";
// import Badge from "../../components/ui/Badge";
// import LoadingSpinner from "../../components/ui/LoadingSpinner";
// import { Users, FileText, CheckCircle, Clock } from "lucide-react";
// import { toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";

// const ManagerDashboard = () => {
//   const navigate = useNavigate();
//   const { dashboard, leads, fetchDashboard, fetchLeads, loading, error } =
//     useManagerStore();

//   useEffect(() => {
//     console.log("Fetching dashboard and leads...");
//     fetchDashboard();
//     fetchLeads();
//   }, []);

//   useEffect(() => {
//     if (error) {
//       console.error("Dashboard error:", error);
//       toast.error(error);
//     }
//   }, [error]);

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center h-64">
//         <LoadingSpinner size="lg" />
//       </div>
//     );
//   }

//   return (
//     <div className="p-6 space-y-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
//       {/* Header */}
//       <div className="flex justify-between items-center">
//         <div>
//           <h1 className="text-2xl font-bold text-gray-900">
//             Manager Dashboard
//           </h1>
//           <p className="text-gray-600">
//             Overview of office performance and leads
//           </p>
//         </div>
//         <div className="flex space-x-3">
//           <Button
//             variant="outline"
//             onClick={() => navigate("/manager/performance")}
//           >
//             <Users className="h-4 w-4 mr-2" />
//             View Consultants
//           </Button>
//           <Button variant="outline" onClick={() => navigate("/manager/leads")}>
//             <FileText className="h-4 w-4 mr-2" />
//             Manage Leads
//           </Button>
//         </div>
//       </div>

//       {/* Dashboard Metrics */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//         <Card title="Total Leads">
//           <div className="flex items-center">
//             <FileText className="h-8 w-8 text-blue-500 mr-3" />
//             <p className="text-3xl font-bold text-gray-900">
//               {dashboard?.totalLeads || 0}
//             </p>
//           </div>
//         </Card>
//         <Card title="Converted Leads">
//           <div className="flex items-center">
//             <CheckCircle className="h-8 w-8 text-green-500 mr-3" />
//             <p className="text-3xl font-bold text-gray-900">
//               {dashboard?.convertedLeads || 0}
//             </p>
//           </div>
//         </Card>
//         <Card title="Conversion Rate">
//           <div className="flex items-center">
//             <CheckCircle className="h-8 w-8 text-blue-500 mr-3" />
//             <p className="text-3xl font-bold text-gray-900">
//               {((dashboard?.conversionRate || 0) * 100).toFixed(2)}%
//             </p>
//           </div>
//         </Card>
//         <Card title="Pending Appointments">
//           <div className="flex items-center">
//             <Clock className="h-8 w-8 text-yellow-500 mr-3" />
//             <p className="text-3xl font-bold text-gray-900">
//               {dashboard?.pendingAppointments || 0}
//             </p>
//           </div>
//         </Card>
//       </div>

//       {/* Recent Leads */}
//       <Card title="Recent Leads">
//         {leads.length ? (
//           <div className="space-y-4">
//             {leads.slice(0, 5).map((lead) => (
//               <div
//                 key={lead.id}
//                 className="flex items-center justify-between p-3 border-b border-gray-200"
//               >
//                 <div>
//                   <p className="text-sm font-medium text-gray-900">
//                     {lead.student?.name || "N/A"}
//                   </p>
//                   <p className="text-xs text-gray-500">
//                     {lead.student?.email || "N/A"}
//                   </p>
//                 </div>
//                 <div className="flex items-center space-x-2">
//                   <Badge
//                     className={
//                       lead.status === "converted"
//                         ? "bg-green-100 text-green-800"
//                         : lead.status === "in_progress"
//                         ? "bg-blue-100 text-blue-800"
//                         : lead.status === "lost"
//                         ? "bg-red-100 text-red-800"
//                         : "bg-gray-100 text-gray-800"
//                     }
//                   >
//                     {lead.status || "new"}
//                   </Badge>
//                   {/* <Button
//                     size="sm"
//                     variant="outline"
//                     onClick={() =>
//                       navigate(`/consultant/students/${lead.studentId}`)
//                     }
//                   >
//                     View Profile
//                   </Button> */}
//                 </div>
//               </div>
//             ))}
//           </div>
//         ) : (
//           <p className="text-gray-500 text-sm">No leads available</p>
//         )}
//       </Card>
//     </div>
//   );
// };

// export default ManagerDashboard;
