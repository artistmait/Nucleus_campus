/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
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
const StatCard = ({ title, value, icon: Icon, color }) => (
  <div className="bg-white p-5 rounded-xl border border-gray-200 flex justify-between items-center shadow-sm">
    <div>
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-3xl font-bold text-gray-800">{value}</p>
    </div>
    <div className={`p-3 rounded-full ${color}`}>
      <Icon className="h-6 w-6 text-gray-700" />
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

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) return;

    const fetchApplications = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/incharge/getApplication/${user.id}`,
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
  }, [branchFilter]);

  const handleNotesUpdate = async () => {
    try {
      const res = await axios.put(
        `http://localhost:5000/api/incharge/updateNotes/${selectedApp.application_id}`,
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
      const res = await axios.put(
        `http://localhost:5000/api/incharge/updateApplication/${application_id}`,
        payload,
      );

      if (res.data.success) {
        toast.success("Application updated!");

        if (payload.markCompleted === true) {
          await axios.post(
            `http://localhost:5000/api/incharge/notify/${application_id}`,
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

      <div className="bg-gray-50 min-h-screen p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Incharge Dashboard</h1>

          {/* ===== STATUS CARDS ===== */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Total Applications"
              value={allApps.length}
              icon={FileText}
              color="bg-blue-100"
            />
            <StatCard
              title="Pending Applications"
              value={pendingCount}
              icon={Clock}
              color="bg-yellow-100"
            />
            <StatCard
              title="Completed Applications"
              value={completedApps.length}
              icon={CheckCircleIcon}
              color="bg-green-100"
            />
            <StatCard
              title="Avg Processing Time (Days)"
              value={averageProcessingTime}
              icon={TrendingUp}
              color="bg-indigo-100"
            />
          </div>

          {/* TABS */}
          <div className="flex space-x-6 border-b mb-6">
            {["submitted", "reviewed", "completed", "closed"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 font-semibold capitalize ${
                  activeTab === tab
                    ? "border-b-2 border-indigo-600 text-indigo-600"
                    : "text-gray-500"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* TABLES */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            {loading ? (
              <p>Loading...</p>
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
      {showNotesModal && (
        <div className="fixed inset-0 flex items-center justify-center backdrop-blur-lg bg-opacity-40 z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl w-96">
            <h2 className="text-lg font-semibold mb-4">Update Notes</h2>

            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className="w-full border border-gray-300 rounded-lg p-2 mb-4"
              placeholder="Enter notes..."
            />

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowNotesModal(false)}
                className="px-4 py-2 bg-gray-200 rounded-lg"
              >
                Cancel
              </button>

              <button
                onClick={handleNotesUpdate}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}
