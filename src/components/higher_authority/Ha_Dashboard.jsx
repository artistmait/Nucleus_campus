import React, { useState, useMemo } from 'react';
import ApprovalsTable from '../../ui/ApprovalsTable';
import StatCard from '../../ui/StatCard';
import Navbar from '../main/Navbar';
import Footer from '../main/Footer';
import { FiUsers, FiCpu, FiClock, FiCheckCircle } from 'react-icons/fi';

// Mock Data
const statsData = [
  { title: 'Total Active Users', value: '1,247', change: '+12%', changeType: 'positive', icon: <FiUsers size={24} /> },
  { title: 'System Performance', value: '99.2%', change: '+0.3%', changeType: 'positive', icon: <FiCpu size={24} /> },
  { title: 'Avg Processing Time', value: '3.2 days', change: '0.8 days', changeType: 'negative', icon: <FiClock size={24} /> },
  { title: 'Completion Rate', value: '94.7%', change: '+2.1%', changeType: 'positive', icon: <FiCheckCircle size={24} /> },
];

const applicationsData = [
  { id: 'APP008', student: 'Emily Davis', requestType: 'Degree Certificate - Emergency', department: 'CS', approvalStage: 'Requires Principal Signature', priority: 'Critical' },
  { id: 'APP009', student: 'Michael Brown', requestType: 'Official Transcript - Job Application', department: 'IT', approvalStage: 'Registrar Review', priority: 'High' },
  { id: 'APP010', student: 'Sarah Wilson', requestType: 'Character Certificate', department: 'AIML', approvalStage: 'Final Authorization', priority: 'Medium' },
  { id: 'APP011', student: 'David Lee', requestType: 'Leave of Absence', department: 'IT', approvalStage: 'HOD Approval', priority: 'High' },
  { id: 'APP012', student: 'Jessica Garcia', requestType: 'Fee Concession', department: 'CS', approvalStage: 'Finance Department', priority: 'Medium' },
];

const Ha_Dashboard = () => {
  const [selectedDepartment, setSelectedDepartment] = useState('All Departments');
  const [searchId, setSearchId] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('All Priorities');

  const departments = ['All Departments', ...new Set(applicationsData.map(app => app.department))];
  const priorities = ['All Priorities', ...new Set(applicationsData.map(app => app.priority))];

  const filteredApplications = useMemo(() => {
    return applicationsData.filter(app => {
      const matchDept =
        selectedDepartment === 'All Departments' || app.department === selectedDepartment;
      const matchId =
        searchId.trim() === '' || app.id.toLowerCase().includes(searchId.toLowerCase());
      const matchPriority =
        selectedPriority === 'All Priorities' || app.priority === selectedPriority;

      return matchDept && matchId && matchPriority;
    });
  }, [selectedDepartment, searchId, selectedPriority]);

  return (
    <>
      <Navbar />
      <div className="bg-gray-100 min-h-screen p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
              <p className="text-md text-gray-500 mt-1">System oversight and performance monitoring</p>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center w-full sm:w-auto">
              <input
                type="text"
                placeholder="Search by Application ID"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                className="bg-white border border-gray-300 text-gray-700 rounded-md py-2 px-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <select
                aria-label="Filter by department"
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="bg-white border border-gray-300 text-gray-700 rounded-md py-2 px-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>

              <select
                aria-label="Filter by priority"
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                className="bg-white border border-gray-300 text-gray-700 rounded-md py-2 px-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {priorities.map(pri => (
                  <option key={pri} value={pri}>{pri}</option>
                ))}
              </select>

              <button
                onClick={() => { setSelectedDepartment('All Departments'); setSearchId(''); setSelectedPriority('All Priorities'); }}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300"
              >
                Clear
              </button>
            </div>
          </header>

          {/* Stats Cards */}
          <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-6">
            {statsData.map((stat, index) => <StatCard key={index} {...stat} />)}
          </section>

          {/* Approvals Table */}
          <section>
            <ApprovalsTable applications={filteredApplications} />
          </section>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Ha_Dashboard;
