import React, { useState, useEffect, useMemo, useCallback } from "react";
import api from "../../config/api";
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
  BellRing,
} from "lucide-react";
import Navbar from "../main/Navbar";
import Footer from "../main/Footer";
import Table from "../ui/ApprovalsTable";
import "react-toastify/dist/ReactToastify.css";

//Stat Card Component
const StatCard = ({ title, icon: IconComponent, value, iconBgColor, iconColor }) => (
  <div className="bg-white p-5 rounded-xl border border-gray-200 flex justify-between items-center">
    <div>
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-3xl font-bold text-gray-800">{value}</p>
    </div>
    <div className={`p-3 rounded-full ${iconBgColor || ''}`}>
      {IconComponent ? (
        <IconComponent className={`h-6 w-6 ${iconColor || 'text-gray-700'}`} />
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
      const res = await api.get(
        `/api/higher-authority/getApplications/${department_id}`,
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
            title="Edit Priority"
            className="text-indigo-800 hover:text-indigo-600 transition-colors"
          >
            <Edit className="h-5 w-5" />
          </button>
          {row.status === 'pending' && (
              <button
                onClick={() => handleQuickEscalate(row.application_id)}
                title="Immediate AI Escalation"
                className="text-red-600 hover:text-red-800 transition-colors"
              >
                <BellRing className="h-5 w-5" />
              </button>
          )}
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
      const res = await api.put(
        `/api/higher-authority/updatePriority/${selectedApplication.application_id}`,
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

  const handleQuickEscalate = async (appId) => {
    try {
      const res = await api.put(
        `/api/higher-authority/updatePriority/${appId}`,
        { priority: "critical" },
      );

      if (res.data.success) {
        toast.error("Urgent Escalation Triggered! In-Charge notified immediately.");
        fetchApplications();
      }
    } catch (error) {
      console.error("Error escalating:", error);
      toast.error("Failed to escalate application");
    }
  };

  return (
    <>
      <Navbar />
      <ToastContainer position="top-center" />
      <div className="min-h-screen bg-[#f7f9fb] px-4 sm:px-6 lg:px-10 py-8 lg:py-12 pb-24 font-sans">
        <div className="max-w-7xl mx-auto space-y-10">
          <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <button
                onClick={() => navigate(-1)}
                className="px-5 py-2.5 bg-transparent text-[#464554] font-semibold rounded-xl hover:bg-[#e0e3e5] transition-colors"
              >
                ← Back
              </button>

              <div>
                <h1 className="text-3xl sm:text-4xl lg:text-[40px] font-bold text-[#191c1e] tracking-tight leading-tight">
                  Head of Department Dashboard
                </h1>
                <p className="text-[#464554] mt-2 text-lg">
                  Manage and review applications from your department
                </p>
              </div>
            </div>
          </header>

          {/* Stats Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {[
              {
                title: "Total Applications",
                value: applications.length.toString(),
                icon: FileText,
              },
              {
                title: "Pending",
                value: pendingApplications.length.toString(),
                icon: Clock,
              },
              {
                title: "Approved",
                value: completedApplications
                  .filter((a) => a.status === "Approved")
                  .length.toString(),
                icon: CheckCircleIcon,
                iconColor: "text-[#10B981]",
              },
              {
                title: "Rejected",
                value: completedApplications
                  .filter((a) => a.status === "Rejected")
                  .length.toString(),
                icon: XCircle,
                iconColor: "text-[#e11d48]",
              },
            ].map((stat, i) => (
              <StatCard key={i} {...stat} />
            ))}
          </div>

          {/* Tabs */}
          <div className="flex space-x-2 border-b-2 border-[#e0e3e5] mb-8 overflow-x-auto no-scrollbar">
              {["pending", "completed", "overview"].map((tab) => (
                <button
                  key={tab}
                  className={`py-3 px-6 font-semibold whitespace-nowrap transition-colors duration-200 capitalize ${
                    activeTab === tab
                      ? "text-[#4338ca] border-b-2 border-[#4338ca] -mb-[2px]"
                      : "text-[#464554] hover:text-[#191c1e]"
                  }`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
          </div>

          {/* Tab Content */}
          <div className="bg-white rounded-[24px] p-6 lg:p-8 shadow-[0_4px_20px_rgba(49,46,129,0.04)] overflow-hidden border-none text-[#191c1e]">
            {loading ? (
              <p className="text-[#464554] text-center py-8 animate-pulse font-medium text-lg">
                Loading applications...
              </p>
            ) : activeTab === "pending" ? (
              <Table data={pendingApplications} columns={columns} />
            ) : activeTab === "completed" ? (
              <Table data={completedApplications} columns={columns} />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
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
          <div className="fixed inset-0 flex items-center justify-center bg-[#191c1e]/20 backdrop-blur-md z-50 transition-opacity">
            <div className="bg-white rounded-[24px] shadow-[0_12px_40px_rgba(49,46,129,0.12)] p-8 w-[400px] border border-[#ffffff]">
              <h2 className="text-xl font-bold text-[#191c1e] tracking-tight mb-6">
                Change Priority
              </h2>

              <select
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value)}
                className="w-full border-2 border-dashed border-[#c7c4d7] rounded-xl p-4 mb-8 text-[#464554] bg-[#f7f9fb] font-semibold transition-all focus:border-[#4338ca] focus:ring-4 focus:ring-[#4338ca]/10 outline-none"
              >
                <option value="low">Low Priority</option>
                <option value="high">High Priority</option>
                <option value="critical">Critical Priority</option>
              </select>

              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setShowPriorityModal(false)}
                  className="px-5 py-2.5 bg-transparent text-[#464554] font-semibold rounded-xl hover:bg-[#f2f4f6]"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePriorityUpdate}
                  className="px-6 py-2.5 bg-gradient-to-br from-[#2a14b4] to-[#4338ca] text-white font-semibold rounded-xl hover:shadow-[0_4px_12px_rgba(67,56,202,0.4)] hover:-translate-y-0.5 transition-all"
                >
                  Update Priority
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
