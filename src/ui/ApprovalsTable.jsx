// src/components/ui/ApprovalsTable.jsx

import React from 'react';
import { FiEye } from 'react-icons/fi';

const PriorityBadge = ({ priority }) => {
  let styles = "px-3 py-1 text-xs font-semibold rounded-full";

  switch (priority.toLowerCase()) {
    case 'critical': styles += " bg-red-100 text-red-700"; break;
    case 'high': styles += " bg-yellow-100 text-yellow-700"; break;
    case 'medium': styles += " bg-blue-100 text-blue-700"; break;
    default: styles += " bg-gray-100 text-gray-700";
  }

  return <span className={styles}>{priority}</span>;
};

const ApprovalsTable = ({ applications }) => {
  if (!applications || applications.length === 0) {
    return (
        <div className="bg-white p-6 rounded-lg shadow-sm mt-8 text-center">
            <p className="text-gray-500">No pending approvals for this department.</p>
        </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm mt-8">
      <div className="mb-4">
        <h3 className="text-xl font-bold text-gray-800">
          <span className="text-yellow-500 mr-2" aria-hidden="true">⚠️</span>
          Critical Approvals Pending
        </h3>
        <p className="text-sm text-gray-500 mt-1">High-priority applications requiring immediate attention</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-600">
          <thead className="text-xs text-gray-500 uppercase bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3">Application ID</th>
              <th scope="col" className="px-6 py-3">Student</th>
              <th scope="col" className="px-6 py-3">Request Type</th>
              <th scope="col" className="px-6 py-3">Department</th>
              <th scope="col" className="px-6 py-3">Approval Stage</th>
              <th scope="col" className="px-6 py-3">Priority</th>
              <th scope="col" className="px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {applications.map((app) => (
              <tr key={app.id} className="bg-white border-b hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900">{app.id}</td>
                <td className="px-6 py-4 text-blue-600 font-semibold">{app.student}</td>
                <td className="px-6 py-4">{app.requestType}</td>
                <td className="px-6 py-4">{app.department}</td>
                <td className="px-6 py-4 font-medium">{app.approvalStage}</td>
                <td className="px-6 py-4"><PriorityBadge priority={app.priority} /></td>
                <td className="px-6 py-4">
                  <button onClick={() => alert(`Viewing details for ${app.id}`)} className="text-gray-500 hover:text-blue-600" aria-label={`View details for application ${app.id}`}>
                    <FiEye size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ApprovalsTable;