import React, { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  Clock,
  CheckCircle as CheckCircleIcon,
  TrendingUp,
  Eye,
  XCircle,
  User2Icon,
  Edit,
} from "lucide-react";
import Navbar from "../main/Navbar";
import Footer from "../main/Footer";
import Table from "../ui/ApprovalsTable";
import "react-toastify/dist/ReactToastify.css";

//Stat Card Component
const StatCard = ({ title, icon: IconComponent, value, iconBgColor }) => (
  <div className="bg-white p-5 rounded-xl border border-gray-200 flex justify-between items-center">
    <div>
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-3xl font-bold text-gray-800">{value}</p>
    </div>
    <div className={`p-3 rounded-full ${iconBgColor}`}>
      {IconComponent ? (
        <IconComponent className="h-6 w-6 text-gray-700" />
      ) : null}
    </div>
  </div>
);

//Department Overview Card
const DepartmentCard = ({
  title,
  pending,
  approved,
  rejected,
  total,
  onViewDetails,
}) => (
  <div className="bg-white p-6 rounded-xl border border-gray-200 flex flex-col">
    <div className="flex-grow">
      <h3 className="font-bold text-lg text-gray-800">{title}</h3>
      <div className="space-y-3 text-sm mt-4">
        <div className="flex justify-between">
          <span className="text-gray-600">Total</span>
          <span className="font-semibold text-gray-800">{total}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Pending</span>
          <span className="font-semibold text-yellow-600">{pending}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Approved</span>
          <span className="font-semibold text-green-600">{approved}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Rejected</span>
          <span className="font-semibold text-red-600">{rejected}</span>
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

export default function HodDashboard() {
  const [activeTab, setActiveTab] = useState("pending");
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPriorityModal, setShowPriorityModal] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [newPriority, setNewPriority] = useState("");

  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));
  const department_id = user?.department_id;

  const fetchApplications = useCallback(async () => {
    if (!department_id) return;
    try {
      const res = await axios.get(
        `http://localhost:5000/api/higher-authority/getApplications/${department_id}`,
      );
      if (res.data.success) {
        setApplications(res.data.applications);
      } else {
        toast.error("Failed to load department applications");
      }
    } catch (error) {
      console.error("Error fetching department applications:", error);
      toast.error("Server error while loading applications");
    } finally {
      setLoading(false);
    }
  }, [department_id]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const pendingApplications = useMemo(
    () =>
      applications.filter(
        (a) => a.status === "pending" || a.stage === "submitted",
      ),
    [applications],
  );
  const completedApplications = useMemo(
    () =>
      applications.filter(
        (a) =>
          a.status !== "pending" ||
          a.stage === "completed" ||
          a.stage === "closed",
      ),
    [applications],
  );

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return "bg-red-100 text-red-700";
      case "critical":
        return "bg-purple-800 text-white";
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
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const formatDate = (isoDate) => {
    if (!isoDate) return "—";
    const date = new Date(isoDate);
    return date.toLocaleDateString("en-GB");
  };

  //Columns
  const columns = [
    { key: "application_id", header: "Application ID" },
    { key: "username", header: "Student Name" },
    { key: "document_type", header: "Document Type" },
    { key: "incharge_name", header: "Assigned Incharge Name" },
    { key: "incharge_id", header: "Incharge ID" },
    {
      key: "priority",
      header: "Priority",
      render: (val) => (
        <span
          className={`px-2 inline-flex text-xs font-semibold rounded-full ${getPriorityColor(
            val,
          )}`}
        >
          {val}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (val) => (
        <span
          className={`px-2 inline-flex text-xs font-semibold rounded-full ${getStatusColor(
            val,
          )}`}
        >
          {val}
        </span>
      ),
    },
    {
      key: "created_at",
      header: "Date Submitted",
      render: (val) => formatDate(val),
    },
    {
      key: "actions",
      header: "Actions",
      render: (_, row) => (
        <div className="flex space-x-3">
          <button
            onClick={() => {
              const url = row.cloudinary_url;
              if (!url) return toast.error("No document available");
              window.open(url, "_blank");
            }}
            className="text-blue-600 hover:text-blue-100"
          >
            <Eye className="h-5 w-5" />
          </button>
          <button
            onClick={() => {
              setSelectedApplication(row);
              setNewPriority(row.priority);
              setShowPriorityModal(true);
            }}
            className="text-indigo-800 hover:text-indigo-100"
          >
            <Edit className="h-5 w-5" />
          </button>
        </div>
      ),
    },
    {
      key: "app_notes",
      header: "Incharge Notes",
      render: (value) => (
        <p className="text-gray-700 text-sm">{value || "No notes added"}</p>
      ),
    },
  ];

  //Department summary for overview tab
  const departmentStats = useMemo(() => {
    const grouped = {};
    applications.forEach((app) => {
      const dept = app.department_name || "Unknown";
      if (!grouped[dept])
        grouped[dept] = { total: 0, pending: 0, approved: 0, rejected: 0 };
      grouped[dept].total++;
      grouped[dept][app.status.toLowerCase()]++;
    });
    return Object.entries(grouped).map(([dept, stats]) => ({
      title: dept,
      ...stats,
    }));
  }, [applications]);

  const handlePriorityUpdate = async () => {
    try {
      const res = await axios.put(
        `http://localhost:5000/api/higher-authority/updatePriority/${selectedApplication.application_id}`,
        { priority: newPriority },
      );

      if (res.data.success) {
        toast.success("Priority updated successfully");
        setShowPriorityModal(false);
        fetchApplications(); // refresh table
      }
    } catch (error) {
      console.error("Error updating priority:", error);
      toast.error("Failed to update priority");
    }
  };

  return (
    <>
      <Navbar />
      <ToastContainer position="top-center" />
      <div className="bg-gray-50 min-h-screen p-4 sm:p-6 lg:p-8 font-sans">
        <div className="max-w-7xl mx-auto">
          <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
            <div className="flex items-start gap-4">
              {/* Back Button */}
              <button
                onClick={() => navigate(-1)}
                className="mt-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
              >
                ← Back
              </button>

              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Head of Department Dashboard
                </h1>
                <p className="text-md text-gray-600 mt-1">
                  Manage and review applications from your department
                </p>
              </div>
            </div>
          </header>

          {/* Stats Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[
              {
                title: "Total Applications",
                value: applications.length.toString(),
                icon: FileText,
                iconBgColor: "bg-blue-100",
              },
              {
                title: "Pending",
                value: pendingApplications.length.toString(),
                icon: Clock,
                iconBgColor: "bg-yellow-100",
              },
              {
                title: "Approved",
                value: completedApplications
                  .filter((a) => a.status === "Approved")
                  .length.toString(),
                icon: CheckCircleIcon,
                iconBgColor: "bg-green-100",
              },
              {
                title: "Rejected",
                value: completedApplications
                  .filter((a) => a.status === "Rejected")
                  .length.toString(),
                icon: XCircle,
                iconBgColor: "bg-red-100",
              },
            ].map((stat, i) => (
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
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            {loading ? (
              <p className="text-gray-500 text-center py-8">
                Loading applications...
              </p>
            ) : activeTab === "pending" ? (
              <Table data={pendingApplications} columns={columns} />
            ) : activeTab === "completed" ? (
              <Table data={completedApplications} columns={columns} />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {departmentStats.map((dept, i) => (
                  <DepartmentCard
                    key={i}
                    {...dept}
                    onViewDetails={() => toast.info(`Viewing ${dept.title}`)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
        {showPriorityModal && (
          <div className="fixed inset-0 flex items-center justify-center backdrop-blur-lg bg-opacity-40 z-50">
            <div className="bg-white p-6 rounded-xl shadow-xl w-96">
              <h2 className="text-lg font-semibold mb-4">Change Priority</h2>

              <select
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2 mb-4"
              >
                <option value="low">Low</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowPriorityModal(false)}
                  className="px-4 py-2 bg-gray-200 rounded-lg"
                >
                  Cancel
                </button>

                <button
                  onClick={handlePriorityUpdate}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Update
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}
