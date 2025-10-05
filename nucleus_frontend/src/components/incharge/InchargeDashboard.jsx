/* eslint-disable no-unused-vars */
import React, { useState, useMemo, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import {
  FileText,
  Clock,
  CheckCircle as CheckCircleIcon,
  TrendingUp,
  Eye,
  XCircle,
} from "lucide-react";
import Navbar from "../main/Navbar";
import Footer from "../main/Footer";
import "react-toastify/dist/ReactToastify.css";

// ✅ Stat Card Component
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

// ✅ Department Overview Card
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

export default function InchargeDashboard() {
  const [activeTab, setActiveTab] = useState("pending");
  const [pendingApplications, setPendingApplications] = useState([]);
  const [completedApplications, setCompletedApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
        if (!user) {
          toast.error("Please log in to view your applications.");
          return;
        }
    const fetchApplications = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/incharge/getApplication/${user.id}`
        );
        if (res.data.success) {
          const apps = res.data.applications;
          setPendingApplications(apps.filter((a) => a.status === "Pending"));
          setCompletedApplications(apps.filter((a) => a.status !== "Pending"));
        } else toast.error("Failed to fetch applications");
      } catch (err) {
        console.error("Error fetching incharge applications:", err);
        toast.error("Server error. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
  }, []);

  // ✅ Update Status
  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const res = await axios.put(
        `http://localhost:5000/api/incharge/updateApplication/${id}`,
        { status: newStatus }
      );
      if (res.data.success) {
        toast.success(`Application ${newStatus}!`);
        setPendingApplications((prev) => prev.filter((a) => a.id !== id));
        setCompletedApplications((prev) => [...prev, res.data.application]);
      } else toast.error("Failed to update application");
    } catch (err) {
      console.error("Error updating status:", err);
      toast.error("Update failed.");
    }
  };

  // ✅ Update Priority
  const handlePriorityChange = async (id, newPriority) => {
    try {
      const res = await axios.put(
        `http://localhost:5000/api/incharge/updateApplication/${id}`,
        { priority: newPriority }
      );
      if (res.data.success) {
        toast.success("Priority updated!");
        setPendingApplications((prev) =>
          prev.map((a) => (a.id === id ? { ...a, priority: newPriority } : a))
        );
      }
    } catch (err) {
      console.error("Error updating priority:", err);
      toast.error("Failed to update priority.");
    }
  };

  // ✅ Utility: Badge Colors
  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return "bg-red-100 text-red-700";
      case "medium":
        return "bg-yellow-100 text-yellow-700";
      case "low":
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return "bg-green-100 text-green-700";
      case "rejected":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // ✅ Stats Section (Dynamic)
  const dynamicStats = [
    {
      title: "Pending Reviews",
      value: pendingApplications.length.toString(),
      icon: Clock,
      iconBgColor: "bg-yellow-100",
    },
    {
      title: "Completed This Week",
      value: completedApplications.length.toString(),
      icon: CheckCircleIcon,
      iconBgColor: "bg-green-100",
    },
    {
      title: "Total Applications",
      value: (pendingApplications.length + completedApplications.length).toString(),
      icon: FileText,
      iconBgColor: "bg-blue-100",
    },
    {
      title: "Avg. Processing Time",
      value: "2.1 days",
      icon: TrendingUp,
      iconBgColor: "bg-indigo-100",
    },
  ];

  const handleViewDetails = (appId) => {
    toast.info(`Viewing details for Application ID: ${appId}`);
  };

  // ✅ Filters
  const [searchId, setSearchId] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("All Departments");
  const [selectedPriority, setSelectedPriority] = useState("All Priorities");

  const departments = ["All Departments", ...new Set(pendingApplications.map((a) => a.department_name || "Unknown"))];
  const priorities = ["All Priorities", ...new Set(pendingApplications.map((a) => a.priority || "Unknown"))];

  const filteredPending = useMemo(() => {
    return pendingApplications.filter((a) => {
      const matchDept =
        selectedDepartment === "All Departments" || a.department_name === selectedDepartment;
      const matchPriority =
        selectedPriority === "All Priorities" || a.priority === selectedPriority;
      const matchId =
        searchId.trim() === "" || a.id.toString().toLowerCase().includes(searchId.toLowerCase());
      return matchDept && matchPriority && matchId;
    });
  }, [pendingApplications, selectedDepartment, selectedPriority, searchId]);

  // ✅ Department Overview Placeholder
  const departmentOverview = [
    {
      title: "Exam Section",
      description: "Grade changes, exam scheduling",
      pending: pendingApplications.length,
      thisWeek: completedApplications.length,
    },
  ];

  return (
    <>
      <Navbar />
      <ToastContainer position="top-center" />
      <div className="bg-gray-50 min-h-screen p-4 sm:p-6 lg:p-8 font-sans">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
            <div className="flex-grow">
              <h1 className="text-3xl font-bold text-gray-900">
                Incharge Dashboard
              </h1>
              <p className="text-md text-gray-600 mt-1">
                Review and process departmental applications
              </p>
            </div>
          </header>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {dynamicStats.map((stat, i) => (
              <StatCard key={i} {...stat} />
            ))}
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-6">
              {["pending", "completed", "overview"].map((tab) => (
                <button
                  key={tab}
                  className={`py-3 px-1 border-b-2 text-sm font-semibold ${
                    activeTab === tab
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)} Applications
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            {loading ? (
              <p className="text-gray-500 text-center py-8">Loading applications...</p>
            ) : activeTab === "pending" ? (
              <div className="overflow-x-auto">
                {filteredPending.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No pending applications.</p>
                ) : (
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">App ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredPending.map((a) => (
                        <tr key={a.id}>
                          <td className="px-6 py-4 text-sm text-gray-900">{a.id}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">{a.student_name}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">{a.type}</td>
                          <td className="px-6 py-4 text-sm">
                            <span className={`px-2 inline-flex text-xs font-semibold rounded-full ${getPriorityColor(a.priority)}`}>
                              {a.priority}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm font-medium flex space-x-2">
                            <button onClick={() => handleViewDetails(a.id)} className="text-gray-600 hover:text-blue-600">
                              <Eye className="h-5 w-5" />
                            </button>
                            <button onClick={() => handleUpdateStatus(a.id, "Approved")} className="text-gray-600 hover:text-green-600">
                              <CheckCircleIcon className="h-5 w-5" />
                            </button>
                            <button onClick={() => handleUpdateStatus(a.id, "Rejected")} className="text-gray-600 hover:text-red-600">
                              <XCircle className="h-5 w-5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            ) : activeTab === "completed" ? (
              <div className="overflow-x-auto">
                {completedApplications.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No completed applications.</p>
                ) : (
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">App ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {completedApplications.map((a) => (
                        <tr key={a.id}>
                          <td className="px-6 py-4 text-sm text-gray-900">{a.id}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">{a.student_name}</td>
                          <td className="px-6 py-4 text-sm">
                            <span className={`px-2 inline-flex text-xs font-semibold rounded-full ${getStatusColor(a.status)}`}>
                              {a.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {departmentOverview.map((dept, i) => (
                  <DepartmentCard key={i} {...dept} onViewDetails={() => toast.info(`Viewing ${dept.title}`)} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
