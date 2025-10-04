import React, { useState, useMemo } from 'react';
import {
  FileText, Clock, CheckCircle, TrendingUp,
  Eye, XCircle, CheckCircle as CheckCircleIcon,
} from 'lucide-react';
import Navbar from '../main/Navbar';
import Footer from '../main/Footer';

// --- Reusable Components ---
const StatCard = ({ title, value, icon: Icon, iconBgColor }) => (
  <div className="bg-white p-5 rounded-xl border border-gray-200 flex justify-between items-center">
    <div>
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-3xl font-bold text-gray-800">{value}</p>
    </div>
    <div className={`p-3 rounded-full ${iconBgColor}`}>
      <Icon className="h-6 w-6 text-gray-700" />
    </div>
  </div>
);

const DepartmentCard = ({ title, description, pending, thisWeek, onViewDetails }) => (
  <div className="bg-white p-6 rounded-xl border border-gray-200 flex flex-col">
    <div className="flex-grow">
      <h3 className="font-bold text-lg text-gray-800">{title}</h3>
      <p className="text-sm text-gray-500 mb-6">{description}</p>
      <div className="space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Pending</span>
          <span className="font-semibold text-gray-800">{pending}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">This Week</span>
          <span className="font-semibold text-gray-800">{thisWeek}</span>
        </div>
      </div>
    </div>
    <button
      onClick={onViewDetails}
      className="mt-6 w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded-lg transition-colors"
    >
      View Details
    </button>
  </div>
);

const InchargeDashboard = () => {
  const [activeTab, setActiveTab] = useState('pending');

  // --- Filters ---
  const [searchId, setSearchId] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('All Departments');
  const [selectedPriority, setSelectedPriority] = useState('All Priorities');

  // --- Applications State ---
  const [pendingApplications, setPendingApplications] = useState([
    { id: 'APP005', studentId: 'STU001', studentName: 'John Doe', title: 'Grade Change Request', department: 'CS', priority: 'High', submitted: '2024-01-22' },
    { id: 'APP006', studentId: 'STU007', studentName: 'Jane Smith', title: 'Exam Rescheduling', department: 'IT', priority: 'Medium', submitted: '2024-01-21' },
    { id: 'APP007', studentId: 'STU003', studentName: 'Bob Johnson', title: 'Additional Attempt', department: 'AIML', priority: 'Low', submitted: '2024-01-20' },
  ]);

  const [completedApplications, setCompletedApplications] = useState([
    { id: 'APP004', studentId: 'STU004', studentName: 'Alice Brown', title: 'Mark Verification', status: 'Approved', completionDate: '2024-01-18', processingTime: '2 days' },
    { id: 'APP003', studentId: 'STU005', studentName: 'Charlie Wilson', title: 'Course Registration', status: 'Rejected', completionDate: '2024-01-18', processingTime: '1 day' },
  ]);

  const departmentOverview = [
    { title: 'Exam Section', description: 'Grade changes, exam scheduling', pending: 8, thisWeek: 15 },
    { title: 'Library Section', description: 'Book requests, renewals', pending: 3, thisWeek: 12 },
    { title: 'Admin Office', description: 'Transcripts, certificates', pending: 5, thisWeek: 9 },
  ];

  const departments = ['All Departments', ...new Set(pendingApplications.map(app => app.department))];
  const priorities = ['All Priorities', ...new Set(pendingApplications.map(app => app.priority))];

  // --- Filtered Pending Applications ---
  const filteredPending = useMemo(() => {
    return pendingApplications.filter(app => {
      const matchDept = selectedDepartment === 'All Departments' || app.department === selectedDepartment;
      const matchPriority = selectedPriority === 'All Priorities' || app.priority === selectedPriority;
      const matchId = searchId.trim() === '' || app.id.toLowerCase().includes(searchId.toLowerCase());
      return matchDept && matchPriority && matchId;
    });
  }, [pendingApplications, selectedDepartment, selectedPriority, searchId]);

  // --- Action Handlers ---
  const handleViewDetails = (appId) => alert(`Viewing details for Application ID: ${appId}`);
  const handleApprove = (appId) => {
    const app = pendingApplications.find(a => a.id === appId);
    if (!app) return;
    setPendingApplications(prev => prev.filter(a => a.id !== appId));
    setCompletedApplications(prev => [...prev, { ...app, status: 'Approved', completionDate: new Date().toISOString().slice(0,10), processingTime: 'N/A' }]);
    alert(`Application ${appId} Approved!`);
  };
  const handleReject = (appId) => {
    const app = pendingApplications.find(a => a.id === appId);
    if (!app) return;
    setPendingApplications(prev => prev.filter(a => a.id !== appId));
    setCompletedApplications(prev => [...prev, { ...app, status: 'Rejected', completionDate: new Date().toISOString().slice(0,10), processingTime: 'N/A' }]);
    alert(`Application ${appId} Rejected!`);
  };
  const handleDepartmentViewDetails = (title) => alert(`View details for department: ${title}`);

  const getPriorityColor = (priority) => {
    switch(priority){
      case 'High': return 'bg-red-100 text-red-700';
      case 'Medium': return 'bg-yellow-100 text-yellow-700';
      case 'Low': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };
  const getStatusColor = (status) => {
    switch(status){
      case 'Approved': return 'bg-green-100 text-green-700';
      case 'Rejected': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const dynamicStats = [
    { title: 'New Requests Today', value: '8', icon: FileText, iconBgColor: 'bg-blue-100' },
    { title: 'Pending Reviews', value: pendingApplications.length.toString(), icon: Clock, iconBgColor: 'bg-yellow-100' },
    { title: 'Completed This Week', value: completedApplications.length.toString(), icon: CheckCircleIcon, iconBgColor: 'bg-green-100' },
    { title: 'Avg. Processing Time', value: '2.1 days', icon: TrendingUp, iconBgColor: 'bg-indigo-100' },
  ];

  return (
    <>
      <Navbar />
      <div className="bg-gray-50 min-h-screen p-4 sm:p-6 lg:p-8 font-sans">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
            <div className="flex-grow">
              <h1 className="text-3xl font-bold text-gray-900">Incharge Dashboard</h1>
              <p className="text-md text-gray-600 mt-1">Review and process departmental applications</p>
            </div>
            <div className="text-right mt-4 sm:mt-0 flex items-center gap-4">
              <div>
                <p className="font-semibold text-gray-800">Dr. Manjulata</p>
                <p className="text-sm text-gray-500">Exam Cell Incharge</p>
              </div>
            </div>
          </header>

          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {dynamicStats.map((stat, index) => <StatCard key={index} {...stat} />)}
          </div>

          {/* Filters (Pending Applications Tab) */}
          {activeTab === 'pending' && (
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <input
                type="text"
                placeholder="Search by Application ID"
                value={searchId}
                onChange={e => setSearchId(e.target.value)}
                className="bg-white border border-gray-300 text-gray-700 rounded-md py-2 px-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={selectedDepartment}
                onChange={e => setSelectedDepartment(e.target.value)}
                className="bg-white border border-gray-300 text-gray-700 rounded-md py-2 px-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {departments.map(dep => <option key={dep} value={dep}>{dep}</option>)}
              </select>
              <select
                value={selectedPriority}
                onChange={e => setSelectedPriority(e.target.value)}
                className="bg-white border border-gray-300 text-gray-700 rounded-md py-2 px-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {priorities.map(pri => <option key={pri} value={pri}>{pri}</option>)}
              </select>
              <button
                onClick={() => { setSearchId(''); setSelectedDepartment('All Departments'); setSelectedPriority('All Priorities'); }}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300"
              >
                Clear
              </button>
            </div>
          )}

          {/* Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-6">
              <button className={`py-3 px-1 border-b-2 text-sm font-semibold ${activeTab==='pending'? 'border-blue-600 text-blue-600':'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`} onClick={()=>setActiveTab('pending')}>Pending Applications</button>
              <button className={`py-3 px-1 border-b-2 text-sm font-semibold ${activeTab==='completed'? 'border-blue-600 text-blue-600':'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`} onClick={()=>setActiveTab('completed')}>Completed Applications</button>
              <button className={`py-3 px-1 border-b-2 text-sm font-semibold ${activeTab==='overview'? 'border-blue-600 text-blue-600':'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`} onClick={()=>setActiveTab('overview')}>Department Overview</button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            {activeTab==='pending' && (
              <div className="overflow-x-auto">
                {filteredPending.length===0 ? <p className="text-gray-500 py-8 text-center">No pending applications.</p> : (
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Application ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredPending.map(app=>(
                        <tr key={app.id}>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">{app.id}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">{app.studentName}<div className="text-gray-500">{app.studentId}</div></td>
                          <td className="px-6 py-4 text-sm text-gray-900">{app.title}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">{app.department}</td>
                          <td className="px-6 py-4 text-sm"><span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityColor(app.priority)}`}>{app.priority}</span></td>
                          <td className="px-6 py-4 text-sm text-gray-500">{app.submitted}</td>
                          <td className="px-6 py-4 text-sm font-medium flex space-x-2">
                            <button onClick={()=>handleViewDetails(app.id)} title="View Details" className="text-gray-600 hover:text-blue-600"><Eye className="h-5 w-5"/></button>
                            <button onClick={()=>handleApprove(app.id)} title="Approve" className="text-gray-600 hover:text-green-600"><CheckCircleIcon className="h-5 w-5"/></button>
                            <button onClick={()=>handleReject(app.id)} title="Reject" className="text-gray-600 hover:text-red-600"><XCircle className="h-5 w-5"/></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {activeTab==='completed' && (
              <div className="overflow-x-auto">
                {completedApplications.length===0 ? <p className="text-gray-500 py-8 text-center">No completed applications.</p> : (
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Application ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completion Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Processing Time</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {completedApplications.map(app=>(
                        <tr key={app.id}>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">{app.id}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">{app.studentName}<div className="text-gray-500">{app.studentId}</div></td>
                          <td className="px-6 py-4 text-sm text-gray-900">{app.title}</td>
                          <td className="px-6 py-4 text-sm"><span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(app.status)}`}>{app.status}</span></td>
                          <td className="px-6 py-4 text-sm text-gray-500">{app.completionDate}</td>
                          <td className="px-6 py-4 text-sm text-gray-500">{app.processingTime}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {activeTab==='overview' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {departmentOverview.map((dept,index)=>(
                  <DepartmentCard key={index} {...dept} onViewDetails={()=>handleDepartmentViewDetails(dept.title)} />
                ))}
              </div>
            )}

          </div>
        </div>
      </div>
      <Footer/>
    </>
  );
};

export default InchargeDashboard;
