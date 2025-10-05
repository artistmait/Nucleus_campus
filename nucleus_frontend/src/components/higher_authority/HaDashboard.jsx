import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import ApprovalsTable from "../ui/ApprovalsTable";
import StatCard from "../ui/StatCard";
import Navbar from "../main/Navbar";
import Footer from "../main/Footer";
import { CircleCheck, Clock, CpuIcon, User2Icon } from "lucide-react";
import { useCallback } from "react";

const HaDashboard = () => {
  const [applications, setApplications] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState("All Departments");
  const [searchId, setSearchId] = useState("");
  const [selectedPriority, setSelectedPriority] = useState("All Priorities");

  // Get department_id from localStorage (assuming you stored it after login)
  const user = JSON.parse(localStorage.getItem("user"));
  const department_id = user?.department_id;

   const fetchApplications = useCallback(async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/higher-authority/getApplications/${department_id}`
      );
      if (res.data.success) {
        setApplications(res.data.applications);
      } else {
        toast.error("Failed to load applications");
      }
    } catch (error) {
      console.error("Error fetching department applications:", error);
      toast.error("Server error while loading applications");
    }
  }, [department_id]); // depends on department_id only

  //
  useEffect(() => {
    if (department_id) fetchApplications();
  }, [department_id, fetchApplications]);

  const departments = ["All Departments", ...new Set(applications.map(app => app.department_name))];
  const priorities = ["All Priorities", ...new Set(applications.map(app => app.priority))];

  const filteredApplications = useMemo(() => {
    return applications.filter(app => {
      const matchDept =
        selectedDepartment === "All Departments" || app.department_name === selectedDepartment;
      const matchId =
        searchId.trim() === "" || app.id.toString().toLowerCase().includes(searchId.toLowerCase());
      const matchPriority =
        selectedPriority === "All Priorities" || app.priority === selectedPriority;

      return matchDept && matchId && matchPriority;
    });
  }, [applications, selectedDepartment, searchId, selectedPriority]);

  // Optional sample stats (replace with dynamic later)
  const statsData = [
    { title: "Total Applications", value: applications.length, icon: <User2Icon size={24} /> },
    { title: "Pending", value: applications.filter(a => a.status === "Pending").length, icon: <Clock size={24} /> },
    { title: "Approved", value: applications.filter(a => a.status === "Approved").length, icon: <CircleCheck size={24} /> },
  ];

  return (
    <>
      <Navbar />
      <div className="bg-gray-100 min-h-screen p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Higher Authority Dashboard</h1>
              <p className="text-md text-gray-500 mt-1">View all applications from your department</p>
            </div>

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
                onClick={() => {
                  setSelectedDepartment("All Departments");
                  setSearchId("");
                  setSelectedPriority("All Priorities");
                }}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300"
              >
                Clear
              </button>
            </div>
          </header>

          <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-6">
            {statsData.map((stat, index) => <StatCard key={index} {...stat} />)}
          </section>

          <section>
            <ApprovalsTable applications={filteredApplications} />
          </section>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default HaDashboard;
