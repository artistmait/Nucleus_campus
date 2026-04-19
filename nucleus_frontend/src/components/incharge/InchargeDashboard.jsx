/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import api, { buildApiUrl } from "../../config/api";
import { toast, ToastContainer } from "react-toastify";
import {
  FileText,
  Clock,
  CheckCircle as CheckCircleIcon,
  TrendingUp,
  Eye,
  XCircle,
  Edit,
} from "lucide-react";
import Navbar from "../main/Navbar";
import Footer from "../main/Footer";
import Table from "../ui/ApprovalsTable";
import "react-toastify/dist/ReactToastify.css";

/* ================= STAT CARD ================= */
const StatCard = ({ title, value, icon: Icon, color, iconColor }) => (
  <div className="bg-white p-6 rounded-[24px] shadow-[0_4px_20px_rgba(49,46,129,0.04)] flex justify-between items-center transition-all duration-300 hover:shadow-[0_12px_40px_rgba(49,46,129,0.06)] hover:-translate-y-1">
    <div className="space-y-1">
      <p className="text-[13px] font-medium text-[#464554] uppercase tracking-[0.05em]">{title}</p>
      <p className="text-4xl font-bold text-[#191c1e]">{value}</p>
    </div>
    <div className={`p-4 rounded-full ${color}`}>
      <Icon className={`h-7 w-7 ${iconColor || "text-gray-700"}`} />
    </div>
  </div>
);

export default function InchargeDashboard() {
  const [searchParams] = useSearchParams();
  const branchFilter = searchParams.get("branch");

  const [activeTab, setActiveTab] = useState("submitted");

  const [submittedApps, setSubmittedApps] = useState([]);
  const [reviewedApps, setReviewedApps] = useState([]);
  const [completedApps, setCompletedApps] = useState([]);
  const [closedApps, setClosedApps] = useState([]);
  const [allApps, setAllApps] = useState([]);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);
  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(true);

  const getPriorityColor = (priority) => {
    const value = (priority || "").toLowerCase();
    switch (value) {
      case "critical":
        return "bg-purple-800 text-white";
      case "high":
        return "bg-red-100 text-red-700";
      case "low":
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) return;

    const fetchApplications = async () => {
      try {
        const res = await api.get(
          `/api/incharge/getApplication/${user.id}`,
        );

        if (res.data.success) {
          let apps = res.data.applications;


          if (branchFilter) {
            apps = apps.filter((a) => a.branch === branchFilter);
          }

          setAllApps(apps);

          setSubmittedApps(apps.filter((a) => a.stage === "submitted"));
          setReviewedApps(apps.filter((a) => a.stage === "reviewed"));
          setCompletedApps(apps.filter((a) => a.stage === "completed"));
          setClosedApps(apps.filter((a) => a.stage === "closed"));
        }
      } catch (err) {
        toast.error("Error fetching applications");
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();

    // Auto-listen to AI Agent SLA updates strictly for refreshing this dashboard seamlessly
    const eventSource = new EventSource(
      buildApiUrl(`/api/notifications/stream/${user.id}`),
    );
    eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'critical') {
            // Automatically refresh the table data when HOD intervenes or SLA Agent fires
            fetchApplications();
        }
    };

    return () => eventSource.close();
  }, [branchFilter]);


  const handleNotesUpdate = async () => {
    try {
      const res = await api.put(
        `/api/incharge/updateNotes/${selectedApp.application_id}`,
        { app_notes: notes },
      );

      if (res.data.success) {
        toast.success("Notes updated successfully");
        setShowNotesModal(false);
        window.location.reload();
      }
    } catch (error) {
      toast.error("Failed to update notes");
    }
  };

  const pendingCount = useMemo(() => {
    return submittedApps.length + reviewedApps.length;
  }, [submittedApps, reviewedApps]);

  const averageProcessingTime = useMemo(() => {
    if (completedApps.length === 0) return 0;

    const totalDays = completedApps.reduce((sum, app) => {
      const created = new Date(app.created_at);
      const now = new Date();
      const diff = (now - created) / (1000 * 60 * 60 * 24);
      return sum + diff;
    }, 0);

    return (totalDays / completedApps.length).toFixed(1);
  }, [completedApps]);

  const handleStageUpdate = async (application_id, payload) => {
    try {
      const res = await api.put(
        `/api/incharge/updateApplication/${application_id}`,
        payload,
      );

      if (res.data.success) {
        toast.success("Application updated!");

        if (payload.markCompleted === true) {
          await api.post(
            `/api/incharge/notify/${application_id}`,
          );
          toast.success("Student notified via email!");
        }

        window.location.reload();
      }
    } catch (err) {
      toast.error("Update failed");
    }
  };

  const viewDocument = (url) => {
    if (!url) return alert("No document available");
    window.open(url, "_blank");
  };

  /* ================= COLUMNS (unchanged) ================= */
  const submittedColumns = [
    { key: "application_id", header: "Application ID" },
    { key: "student_name", header: "Student Name" },
    { key: "type", header: "Type" },
    {
      key: "priority",
      header: "Priority",
      render: (_, row) => (
        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getPriorityColor(row.priority)} ${row.priority === 'critical' ? 'animate-pulse border border-purple-400' : ''}`}>
           {row.priority ? row.priority.toUpperCase() : 'NORMAL'}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (_, row) => (
        <div className="flex space-x-3">
          <button onClick={() => viewDocument(row.cloudinary_url)}>
            <Eye className="h-5 w-5 text-blue-600" />
          </button>
          <button
            onClick={() =>
              handleStageUpdate(row.application_id, {
                stage: "reviewed",
                status: "approved",
              })
            }
          >
            <CheckCircleIcon className="h-5 w-5 text-green-600" />
          </button>
          <button
            onClick={() =>
              handleStageUpdate(row.application_id, {
                stage: "closed",
                status: "rejected",
              })
            }
          >
            <XCircle className="h-5 w-5 text-red-600" />
          </button>
        </div>
      ),
    },
    { key: "Add Notes", 
      header: "Add Notes",
    render: (_, row) => (
        <div className="flex space-x-3">
          <button
            onClick={() => {
              setSelectedApp(row);
              setNotes(row.app_notes || "");
              setShowNotesModal(true);
            }}
          >
            <Edit className="h-5 w-5 text-indigo-600" />
          </button>
          </div>)},
  ];

  const reviewedColumns = [
    { key: "application_id", header: "Application ID" },
    { key: "student_name", header: "Student Name" },
    { key: "type", header: "Type" },
    {
      key: "priority",
      header: "Priority",
      render: (_, row) => (
        <span className={`px-3 py-1 text-xs font-extrabold tracking-wider rounded-md ${row.priority === 'critical' ? 'bg-red-50 text-red-600 border border-red-200 animate-pulse' : 'bg-gray-50 text-gray-500'}`}>
           {row.priority ? row.priority.toUpperCase() : 'NORMAL'}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (_, row) => (
        <div className="flex space-x-3">
          <button onClick={() => viewDocument(row.cloudinary_url)}>
            <Eye className="h-5 w-5 text-blue-600" />
          </button>
          <button
            onClick={() =>
              handleStageUpdate(row.application_id, {
                markCompleted: true,
              })
            }
          >
            <CheckCircleIcon className="h-5 w-5 text-green-600" />
          </button>
        </div>
      ),
    },
  ];

  const completedColumns = [
    { key: "application_id", header: "Application ID" },
    { key: "student_name", header: "Student Name" },
    { key: "status", header: "Status" },
    {
      key: "actions",
      header: "Actions",
      render: (_, row) => (
        <button onClick={() => viewDocument(row.cloudinary_url)}>
          <Eye className="h-5 w-5 text-blue-600" />
        </button>
      ),
    },
  ];

  const closedColumns = [
    { key: "application_id", header: "Application ID" },
    { key: "student_name", header: "Student Name" },
    { key: "status", header: "Status" },
  ];

  return (
    <>
      <Navbar />
      <ToastContainer position="top-center" />

      <div className="bg-[#f7f9fb] min-h-screen px-4 sm:px-6 lg:px-10 py-8 lg:py-12 pb-24">
        <div className="max-w-7xl mx-auto space-y-10">
          <div>
            <h1 className="text-3xl sm:text-4xl lg:text-[40px] font-bold text-[#191c1e] tracking-tight leading-tight mb-2">
              Incharge Dashboard
            </h1>
            <p className="text-[#464554] text-lg">
              Manage operations and applications
            </p>
          </div>

          {/* ===== STATUS CARDS ===== */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            <StatCard
              title="Total Applications"
              value={allApps.length}
              icon={FileText}
              color="bg-[#e3dfff]"
              iconColor="text-[#2a14b4]"
            />
            <StatCard
              title="Pending Applications"
              value={pendingCount}
              icon={Clock}
              color="bg-amber-100"
              iconColor="text-amber-600"
            />
            <StatCard
              title="Completed Applications"
              value={completedApps.length}
              icon={CheckCircleIcon}
              color="bg-[#ecfdf5]"
              iconColor="text-[#10B981]"
            />
            <StatCard
              title="Avg Processing Time (Days)"
              value={averageProcessingTime}
              icon={TrendingUp}
              color="bg-[#e0e3e5]"
               iconColor="text-[#464554]"
            />
          </div>

          {/* TABS */}
          <div className="flex space-x-2 border-b-2 border-[#e0e3e5] mb-6 overflow-x-auto pb-1">
            {["submitted", "reviewed", "completed", "closed"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-3 text-[14px] font-semibold uppercase tracking-wider rounded-t-xl transition-all duration-300 ${
                  activeTab === tab
                    ? "text-[#4338ca] bg-[#ffffff] shadow-[0_-4px_12px_rgba(49,46,129,0.04)] border-b-2 border-[#4338ca]"
                    : "text-[#464554] hover:bg-[#ffffff]/50 hover:text-[#191c1e]"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* TABLES */}
          <div className="bg-white rounded-[24px] shadow-[0_4px_20px_rgba(49,46,129,0.04)] p-6 lg:p-8">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <p className="text-[#464554] font-medium text-lg">Loading data...</p>
              </div>
            ) : activeTab === "submitted" ? (
              <Table data={submittedApps} columns={submittedColumns} />
            ) : activeTab === "reviewed" ? (
              <Table data={reviewedApps} columns={reviewedColumns} />
            ) : activeTab === "completed" ? (
              <Table data={completedApps} columns={completedColumns} />
            ) : (
              <Table data={closedApps} columns={closedColumns} />
            )}
          </div>
        </div>
      </div>
      
      {/* NOTES MODAL */}
      {showNotesModal && (
        <div className="fixed inset-0 flex items-center justify-center backdrop-blur-md bg-[#191c1e]/20 z-50 transition-opacity">
          <div className="bg-white p-8 rounded-[24px] shadow-[0_12px_40px_rgba(49,46,129,0.12)] w-[400px] border border-[#ffffff]">
            <h2 className="text-xl font-bold text-[#191c1e] tracking-tight mb-6">Update Notes</h2>

            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className="w-full bg-[#f7f9fb] border-none rounded-xl p-4 mb-6 text-[#191c1e] placeholder:text-[#outline-variant] focus:ring-2 focus:ring-[#4338ca] focus:outline-none transition-all shadow-inner"
              placeholder="Enter comprehensive notes..."
            />

            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowNotesModal(false)}
                className="px-5 py-2.5 bg-transparent text-[#464554] font-semibold rounded-xl hover:bg-[#f2f4f6] transition-colors"
              >
                Cancel
              </button>

              <button
                onClick={handleNotesUpdate}
                className="px-6 py-2.5 bg-gradient-to-br from-[#2a14b4] to-[#4338ca] text-white font-semibold rounded-xl hover:shadow-[0_4px_12px_rgba(67,56,202,0.4)] hover:-translate-y-0.5 transition-all"
              >
                Save Note
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}
