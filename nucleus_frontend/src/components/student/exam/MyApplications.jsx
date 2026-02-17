import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Navbar from "../../main/Navbar";
import Footer from "../../main/Footer";
import Table from "../../ui/ApprovalsTable";
import StatCard from "../../ui/StatCard";
import { FileText, Clock, AlertCircle, Pencil } from "lucide-react";
import { DialogBox } from "../../ui/DialogBox";
// import { useNavigate } from "react-router-dom";

export default function MyApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);
  const [newFile, setNewFile] = useState(null);

  const getPriorityColor = (priority) => {
    const value = (priority || "").toLowerCase();
    switch (value) {
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
    const value = (status || "").toLowerCase();
    switch (value) {
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

  const getStageColor = (stage) => {
    const value = (stage || "").toLowerCase();
    switch (value) {
      case "submitted":
        return "bg-yellow-700 text-white";
      case "reviewed":
        return "bg-purple-700 text-white";
      case "completed":
        return "bg-green-700 text-white";
      default:
        return "bg-red-700 text-white";
    }
  };

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
      toast.error("Please log in to view your applications.");
      return;
    }

    const fetchApplications = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/student/getApplications/${user.id}`,
        );

        if (res.data.success) {
          setApplications(res.data.applications);
          toast.success("Applications loaded successfully!");
        } else {
          toast.error(res.data.message || "Failed to fetch applications.");
        }
      } catch (err) {
        console.error("Error fetching applications:", err);
        toast.error("Server error. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  const totalApps = applications.length;
  const pending = applications.filter(
    (a) =>
      a.status === "pending" ||
      a.stage === "reviewed" ||
      a.stage === "submitted",
  ).length;
  const critical = applications.filter(
    (a) => a.priority === "critical" || a.priority === "high",
  ).length;

  const formatDate = (isoDate) => {
    if (!isoDate) return "—";
    const date = new Date(isoDate);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const openUploadModal = (application) => {
    setSelectedApp(application);
    setIsUploadModalOpen(true);
  };

  const closeUploadModal = () => {
    setIsUploadModalOpen(false);
    setSelectedApp(null);
    setNewFile(null);
  };

  const handleFileChange = (e) => {
    setNewFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!newFile || !selectedApp) return toast.error("Please select a file.");

    const formData = new FormData();
    formData.append("documents", newFile);

    try {
      const res = await axios.put(
        `http://localhost:5000/api/student/updateDocument/${selectedApp.application_id}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );

      if (res.data.success) {
        toast.success("Document updated successfully!");
        setApplications((prev) =>
          prev.map((app) =>
            app.application_id === selectedApp.application_id
              ? { ...app, cloudinary_url: res.data.newUrl }
              : app,
          ),
        );
        closeUploadModal();
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      console.error(err);
      toast.error("Upload failed.");
    }
  };

  const sendFeedback = async (feedbackText) => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));

      await axios.post("http://localhost:5000/api/predict/feedback", {
        user_id: user.id,
        feedbackText: feedbackText,
      });

      toast.success("Thank you for your feedback!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to submit feedback.");
    }
  };

  const columns = [
    { key: "application_id", header: "Application ID", sortable: true },
    { key: "type", header: "Request Type", sortable: true },
    { key: "incharge_id", header: "Incharge assigned ID", sortable: true },
    {
      key: "deadline",
      header: "Deadline",
      sortable: true,
      render: (val) => formatDate(val),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (val) => (
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
            val,
          )}`}
        >
          {val}
        </span>
      ),
    },
    {
      key: "stage",
      header: "Application Stage",
      sortable: true,
      render: (val) => (
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${getStageColor(
            val,
          )}`}
        >
          {val}
        </span>
      ),
    },
    {
      key: "priority",
      header: "Priority",
      sortable: true,
      render: (val) => (
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${getPriorityColor(
            val,
          )}`}
        >
          {val}
        </span>
      ),
    },
    {
      key: "app_notes",
      header: "Incharge Notes",
      render: (value) => (
        <p className="text-gray-700 text-sm">{value || "No notes added"}</p>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (value, application) => {
        const isCompleted = application.stage === "completed";

        return (
          <button
            onClick={() => {
              if (!isCompleted) openUploadModal(application);
            }}
            disabled={isCompleted}
            className={`${
              isCompleted
                ? "text-gray-400 cursor-not-allowed"
                : "text-blue-600 hover:text-blue-800"
            }`}
          >
            <Pencil className="h-5 w-5" />
          </button>
        );
      },
    },
  ];

  return (
    <div className="w-full min-h-screen flex flex-col bg-gray-50">
      <ToastContainer position="top-center" />
      <Navbar />

      <main className="flex-grow w-full max-w-6xl mx-auto px-6 md:px-10 lg:px-14 py-12">
        {/* <button
                onClick={() => navigate(-1)}
                className="mt-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
              >
                ← Back
              </button> */}
        <h1 className="text-4xl font-bold text-indigo-900 mb-8">
          My Applications
        </h1>

        {loading ? (
          <div className="flex items-center justify-center h-60">
            <p className="text-gray-600 animate-pulse">
              Loading your applications...
            </p>
          </div>
        ) : totalApps === 0 ? (
          <div className="bg-white p-6 rounded-lg shadow text-center text-gray-500">
            No applications submitted yet.
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
              <StatCard
                icon={<FileText size={24} />}
                title="Total Applications"
                value={totalApps}
                change={`${totalApps} submitted`}
                changeType="positive"
              />
              <StatCard
                icon={<Clock size={24} />}
                title="Pending Approvals"
                value={pending}
                change={`${pending} awaiting review`}
                changeType={pending > 0 ? "negative" : "positive"}
              />
              <StatCard
                icon={<AlertCircle size={24} />}
                title="High Priority"
                value={critical}
                change={`${critical} urgent`}
                changeType={critical > 0 ? "negative" : "positive"}
              />
            </div>

            {/* Reusable Table Component */}
            <Table
              data={applications}
              columns={columns}
              searchPlaceholder="Search applications..."
              defaultItemsPerPage={10}
            />
            {applications.some((app) => app.stage === "completed") && (
              <div className="w-auto justify-center">
                <div className="shadow-2xl p-8 mt-2 text-center flex flex-col items-center justify-center rounded-2xl">
                  <p className="font-semibold text-2xl text-gray-400 p-4">
                    Please let us know how you find our service
                  </p>
                  <DialogBox onSubmit={sendFeedback} />
                </div>
              </div>
            )}
          </>
        )}
      </main>
      {isUploadModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 bg-opacity-40 backdrop-blur-sm z-50">
          <div className="bg-white rounded-xl p-6 shadow-lg w-96">
            <h2 className="text-xl font-semibold mb-4 text-indigo-900">
              Upload New Document
            </h2>

            <input
              type="file"
              accept=".pdf,.jpg,.png"
              onChange={handleFileChange}
              className="block w-full border border-gray-300 rounded-md p-2 mb-4"
            />

            <div className="flex justify-end space-x-3">
              <button
                onClick={closeUploadModal}
                className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                className="px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700"
              >
                Upload
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
