import React, { useState } from "react";
import Button from "../../components/ui/Button";
import { X, ArrowLeft } from "lucide-react";
import LeadDetailsView from "./LeadDetailsView";

const ConsultantLeadsModal = ({ isOpen, onClose, consultant }) => {
  const [selectedLead, setSelectedLead] = useState(null);

  if (!isOpen || !consultant) return null;

  const handleViewDetails = (lead) => {
    setSelectedLead(lead);
  };

  const handleBack = () => {
    setSelectedLead(null);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-3xl">
        <div className="flex justify-between items-center mb-4">
          {selectedLead ? (
            <div className="flex items-center">
              <button
                onClick={handleBack}
                className="text-gray-500 hover:text-gray-700 mr-2"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <h2 className="text-xl font-bold text-gray-900">Lead Details</h2>
            </div>
          ) : (
            <h2 className="text-xl font-bold text-gray-900">
              Leads for {consultant.name || "Consultant"}
            </h2>
          )}
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {selectedLead ? (
          <LeadDetailsView lead={selectedLead} />
        ) : (
          <div className="overflow-x-auto max-h-[70vh] overflow-y-auto">
            {consultant.leads.length > 0 ? (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Phone
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Source
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {consultant.leads.map((lead) => (
                    <tr key={lead.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {lead.student?.name || "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {lead.student?.email || "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {lead.student?.phone || "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {lead.status || "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {lead.source || "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewDetails(lead)}
                        >
                          View Details
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-gray-500 text-sm p-4">
                No leads available for this consultant
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ConsultantLeadsModal;

// import React, { useState } from "react";
// import Button from "../../components/ui/Button";
// import { X, ArrowLeft, Eye } from "lucide-react";

// const ConsultantLeadsModal = ({ isOpen, onClose, consultant }) => {
//   const [selectedLead, setSelectedLead] = useState(null);

//   if (!isOpen || !consultant) return null;

//   const handleViewDetails = (lead) => {
//     setSelectedLead(lead);
//   };

//   const handleBack = () => {
//     setSelectedLead(null);
//   };

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//       <div className="bg-white rounded-lg p-6 w-full max-w-3xl">
//         <div className="flex justify-between items-center mb-4">
//           {selectedLead ? (
//             <div className="flex items-center">
//               <button
//                 onClick={handleBack}
//                 className="text-gray-500 hover:text-gray-700 mr-2"
//               >
//                 <ArrowLeft className="h-5 w-5" />
//               </button>
//               <h2 className="text-xl font-bold text-gray-900">Lead Details</h2>
//             </div>
//           ) : (
//             <h2 className="text-xl font-bold text-gray-900">
//               Leads for {consultant.name || "Consultant"}
//             </h2>
//           )}
//           <button
//             onClick={onClose}
//             className="text-gray-500 hover:text-gray-700"
//           >
//             <X className="h-5 w-5" />
//           </button>
//         </div>

//         {selectedLead ? (
//           <div className="space-y-4 max-h-[70vh] overflow-y-auto">
//             <div>
//               <h3 className="text-lg font-semibold text-gray-900">
//                 Lead Information
//               </h3>
//               <div className="grid grid-cols-2 gap-4 mt-2">
//                 <div>
//                   <span className="text-sm font-medium text-gray-700">
//                     Lead ID:
//                   </span>
//                   <p className="text-sm text-gray-900">{selectedLead.id}</p>
//                 </div>
//                 <div>
//                   <span className="text-sm font-medium text-gray-700">
//                     Status:
//                   </span>
//                   <p className="text-sm text-gray-900">
//                     {selectedLead.status || "N/A"}
//                   </p>
//                 </div>
//                 <div>
//                   <span className="text-sm font-medium text-gray-700">
//                     Source:
//                   </span>
//                   <p className="text-sm text-gray-900">
//                     {selectedLead.source || "N/A"}
//                   </p>
//                 </div>
//               </div>
//             </div>

//             <div>
//               <h3 className="text-lg font-semibold text-gray-900">
//                 Student Information
//               </h3>
//               <div className="grid grid-cols-2 gap-4 mt-2">
//                 <div>
//                   <span className="text-sm font-medium text-gray-700">
//                     Name:
//                   </span>
//                   <p className="text-sm text-gray-900">
//                     {selectedLead.student?.name || "N/A"}
//                   </p>
//                 </div>
//                 <div>
//                   <span className="text-sm font-medium text-gray-700">
//                     Email:
//                   </span>
//                   <p className="text-sm text-gray-900">
//                     {selectedLead.student?.email || "N/A"}
//                   </p>
//                 </div>
//                 <div>
//                   <span className="text-sm font-medium text-gray-700">
//                     Phone:
//                   </span>
//                   <p className="text-sm text-gray-900">
//                     {selectedLead.student?.phone || "N/A"}
//                   </p>
//                 </div>
//                 <div>
//                   <span className="text-sm font-medium text-gray-700">
//                     Student ID:
//                   </span>
//                   <p className="text-sm text-gray-900">
//                     {selectedLead.student?.id || "N/A"}
//                   </p>
//                 </div>
//               </div>
//             </div>

//             {selectedLead.student?.profile && (
//               <div>
//                 <h3 className="text-lg font-semibold text-gray-900">
//                   Profile Information
//                 </h3>
//                 <div className="space-y-4 mt-2">
//                   <div>
//                     <span className="text-sm font-medium text-gray-700">
//                       Personal Info:
//                     </span>
//                     <pre className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
//                       {JSON.stringify(
//                         selectedLead.student.profile.personalInfo || {},
//                         null,
//                         2
//                       )}
//                     </pre>
//                   </div>
//                   <div>
//                     <span className="text-sm font-medium text-gray-700">
//                       Educational Background:
//                     </span>
//                     <pre className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
//                       {JSON.stringify(
//                         selectedLead.student.profile.educationalBackground ||
//                           {},
//                         null,
//                         2
//                       )}
//                     </pre>
//                   </div>
//                   <div>
//                     <span className="text-sm font-medium text-gray-700">
//                       Test Scores:
//                     </span>
//                     <pre className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
//                       {JSON.stringify(
//                         selectedLead.student.profile.testScores || {},
//                         null,
//                         2
//                       )}
//                     </pre>
//                   </div>
//                   <div>
//                     <span className="text-sm font-medium text-gray-700">
//                       Study Preferences:
//                     </span>
//                     <pre className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
//                       {JSON.stringify(
//                         selectedLead.student.profile.studyPreferences || {},
//                         null,
//                         2
//                       )}
//                     </pre>
//                   </div>
//                   <div>
//                     <span className="text-sm font-medium text-gray-700">
//                       Work Experience:
//                     </span>
//                     <pre className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
//                       {JSON.stringify(
//                         selectedLead.student.profile.workExperience || {},
//                         null,
//                         2
//                       )}
//                     </pre>
//                   </div>
//                   <div>
//                     <span className="text-sm font-medium text-gray-700">
//                       Financial Info:
//                     </span>
//                     <pre className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
//                       {JSON.stringify(
//                         selectedLead.student.profile.financialInfo || {},
//                         null,
//                         2
//                       )}
//                     </pre>
//                   </div>
//                   <div>
//                     <span className="text-sm font-medium text-gray-700">
//                       Additional Info:
//                     </span>
//                     <pre className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
//                       {JSON.stringify(
//                         selectedLead.student.profile.additionalInfo || {},
//                         null,
//                         2
//                       )}
//                     </pre>
//                   </div>
//                 </div>
//               </div>
//             )}
//           </div>
//         ) : (
//           <div className="overflow-x-auto max-h-[70vh] overflow-y-auto">
//             {consultant.leads.length > 0 ? (
//               <table className="min-w-full divide-y divide-gray-200">
//                 <thead className="bg-gray-50">
//                   <tr>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Student Name
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Email
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Phone
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Status
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Source
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Actions
//                     </th>
//                   </tr>
//                 </thead>
//                 <tbody className="bg-white divide-y divide-gray-200">
//                   {consultant.leads.map((lead) => (
//                     <tr key={lead.id}>
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <div className="text-sm text-gray-900">
//                           {lead.student?.name || "N/A"}
//                         </div>
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <div className="text-sm text-gray-500">
//                           {lead.student?.email || "N/A"}
//                         </div>
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <div className="text-sm text-gray-500">
//                           {lead.student?.phone || "N/A"}
//                         </div>
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <div className="text-sm text-gray-900">
//                           {lead.status || "N/A"}
//                         </div>
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <div className="text-sm text-gray-900">
//                           {lead.source || "N/A"}
//                         </div>
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
//                         <Button
//                           size="sm"
//                           variant="outline"
//                           onClick={() => handleViewDetails(lead)}
//                         >
//                           View Details
//                         </Button>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             ) : (
//               <p className="text-gray-500 text-sm p-4">
//                 No leads available for this consultant
//               </p>
//             )}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default ConsultantLeadsModal;
