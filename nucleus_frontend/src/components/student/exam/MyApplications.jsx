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

  const sendFeedback = async (feedbackData) => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user?.id) {
        toast.error("Please log in to submit feedback.");
        return;
      }

      const res = await axios.post("http://localhost:5000/api/predict/feedback", {
        user_id: user.id,
        ...feedbackData,
      });

      const sentiment = res.data?.feedback?.sentiment_text;
      toast.success(
        sentiment
          ? `Thank you for your feedback!`
          : "Thank you for your feedback!",
      );
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
    <div className="w-full min-h-screen flex flex-col bg-[#f7f9fb]">
      <ToastContainer position="top-center" />
      <Navbar />

      <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-8 lg:py-12 pb-24">
        {/* <button
                onClick={() => navigate(-1)}
                className="mt-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
              >
                ← Back
              </button> */}
        <h1 className="text-3xl sm:text-4xl lg:text-[40px] font-bold text-[#191c1e] tracking-tight leading-tight mb-8">
          My Applications
        </h1>

        {loading ? (
          <div className="flex items-center justify-center h-60">
            <p className="text-[#464554] font-medium text-lg animate-pulse">
              Loading your applications...
            </p>
          </div>
        ) : totalApps === 0 ? (
          <div className="bg-white p-8 rounded-[24px] shadow-[0_4px_20px_rgba(49,46,129,0.04)] text-center text-[#464554] text-lg">
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
            <div className="bg-white rounded-[24px] shadow-[0_4px_20px_rgba(49,46,129,0.04)] p-6 lg:p-8">
              <Table
                data={applications}
                columns={columns}
                searchPlaceholder="Search applications..."
                defaultItemsPerPage={10}
              />
            </div>
            {applications.some((app) => app.stage === "completed") && (
              <div className="w-auto flex justify-center mt-12">
                <div className="bg-white shadow-[0_4px_20px_rgba(49,46,129,0.04)] p-8 text-center flex flex-col items-center justify-center rounded-[24px]">
                  <p className="font-semibold text-xl text-[#464554] mb-4">
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
        <div className="fixed inset-0 flex items-center justify-center bg-[#191c1e]/20 backdrop-blur-md z-50 transition-opacity">
          <div className="bg-white rounded-[24px] shadow-[0_12px_40px_rgba(49,46,129,0.12)] p-8 w-[400px] border border-[#ffffff]">
            <h2 className="text-xl font-bold text-[#191c1e] tracking-tight mb-6">
              Upload New Document
            </h2>

            <input
              type="file"
              accept=".pdf,.jpg,.png"
              onChange={handleFileChange}
              className="block w-full border-2 border-dashed border-[#c7c4d7] rounded-xl p-4 mb-8 text-[#464554] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#e3dfff] file:text-[#2a14b4] hover:file:bg-[#c3c0ff] cursor-pointer"
            />

            <div className="flex justify-end space-x-4">
              <button
                onClick={closeUploadModal}
                className="px-5 py-2.5 bg-transparent text-[#464554] font-semibold rounded-xl hover:bg-[#f2f4f6]"
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                className="px-6 py-2.5 bg-gradient-to-br from-[#2a14b4] to-[#4338ca] text-white font-semibold rounded-xl hover:shadow-[0_4px_12px_rgba(67,56,202,0.4)] hover:-translate-y-0.5 transition-all"
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
