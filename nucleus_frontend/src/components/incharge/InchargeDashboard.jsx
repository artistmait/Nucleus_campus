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
  Pencil,
} from "lucide-react";
import Navbar from "../main/Navbar";
import Footer from "../main/Footer";
import Table from "../ui/ApprovalsTable";
import "react-toastify/dist/ReactToastify.css";

//Stat Card Component
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

//Department Overview Card
const DepartmentCard = ({
  title,
  description,
  pending,
  thisWeek,
  onViewDetails,
}) => (
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
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  const [selectedAppForNotes, setSelectedAppForNotes] = useState(null);
  const [noteText, setNoteText] = useState("");

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
          setPendingApplications(apps.filter((a) => a.status === "pending"));
          setCompletedApplications(apps.filter((a) => a.status !== "pending"));
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

  //Update Status
  const handleUpdateStatus = async (application_id, newStatus) => {
    try {
      const res = await axios.put(
        `http://localhost:5000/api/incharge/updateApplication/${application_id}`,
        { status: newStatus }
      );
      if (res.data.success) {
        toast.success(`Application ${newStatus}!`);
        setPendingApplications((prev) =>
          prev.filter((a) => a.application_id !== application_id)
        );
        setCompletedApplications((prev) => [...prev, res.data.application]);
      } else toast.error("Failed to update application");
    } catch (err) {
      console.error("Error updating status:", err);
      toast.error("Update failed.");
    }
  };

  const handleViewDetails = (appId) => {
    toast.info(`Viewing details for Application ID: ${appId}`);
  };

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
  const handleUpdateNotes = async (application_id, app_notes) => {
    try {
      const res = await axios.put(
        `http://localhost:5000/api/incharge/updateNotes/${application_id}`,
        { app_notes:app_notes }
      );
      if (res.data.success) {
        toast.success("Notes saved successfully!");
        // Optionally update local state
        setPendingApplications((prev) =>
          prev.map((a) =>
            a.application_id === application_id ? { ...a, app_notes } : a
          )
        );  
      }
    } catch (err) {
      console.error("Error saving notes:", err);
      toast.error("Failed to save notes");
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
  const openNotesModal = (application) => {
    setSelectedAppForNotes(application);
    setNoteText(application.notes || "");
    setIsNotesModalOpen(true);
  };

  const closeNotesModal = () => {
    setIsNotesModalOpen(false);
    setSelectedAppForNotes(null);
    setNoteText("");
  };

  const formatDate = (isoDate) => {
    if (!isoDate) return "—";
    const date = new Date(isoDate);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };
  //Columns for Table
  const pendingColumns = [
    { key: "application_id", header: "Application ID", sortable: true },
    { key: "moodle_id", header: "Student ID", sortable: true },
    { key: "student_name", header: "Student Name", sortable: true },
    {
      key: "created_at",
      header: "Application Submission Date",
      sortable: true,
      render: (val) => formatDate(val),
    },
    {
      key: "deadline",
      header: "Application Deadline",
      sortable: true,
      render: (val) => formatDate(val),
    },
    { key: "type", header: "Type" },
    {
      key: "priority",
      header: "Priority",
      render: (value) => (
        <span
          className={`px-2 inline-flex text-xs font-semibold rounded-full ${getPriorityColor(
            value
          )}`}
        >
          {value}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (_, row) => (
        <div className="flex space-x-2">
          <button
            onClick={() => window.open(row.cloudinary_url, "_blank")}
            className="text-gray-600 hover:text-blue-600"
          >
            <Eye className="h-5 w-5" />
          </button>

          <button
            onClick={() => handleUpdateStatus(row.application_id, "approved")}
            className="text-gray-600 hover:text-green-600"
          >
            <CheckCircleIcon className="h-5 w-5" />
          </button>
          <button
            onClick={() => handleUpdateStatus(row.application_id, "rejected")}
            className="text-gray-600 hover:text-red-600"
          >
            <XCircle className="h-5 w-5" />
          </button>
        </div>
      ),
    },
    {
      key: "notes",
      header: "Notes / Comments",
      render: (value, row) => (
        <button
          onClick={() => openNotesModal(row)}
          className="text-gray-600 hover:text-blue-600"
          title="Add or Edit Notes"
        >
          <Pencil className="h-5 w-5" />
        </button>
      ),
    },
  ];

  const completedColumns = [
    { key: "application_id", header: "App ID", sortable: true },
    { key: "moodle_id", header: "Student ID", sortable: true },
    { key: "student_name", header: "Student Name", sortable: true },
    {
      key: "status",
      header: "Status",
      render: (value) => (
        <span
          className={`px-2 inline-flex text-xs font-semibold rounded-full ${getStatusColor(
            value
          )}`}
        >
          {value}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (_, row) => (
        <div className="flex space-x-2">
          <button
            onClick={() => {
              const url = row.cloudinary_url;
              if (!url) return alert("No document available");

              const ext = url.split(".").pop().toLowerCase();
              if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext)) {
                // Open images directly
                window.open(url, "_blank");
              } else if (ext === "pdf") {
                // Open PDF directly
                window.open(url, "_blank");
              } else {
                // Fallback: Cloudinary might not show the file inline
                window.open(`${url}.pdf`, "_blank");
              }
            }}
            className="text-gray-600 hover:text-blue-600"
          >
            <Eye className="h-5 w-5" />
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

  //Department Overview Placeholder
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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[
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
                value: (
                  pendingApplications.length + completedApplications.length
                ).toString(),
                icon: FileText,
                iconBgColor: "bg-blue-100",
              },
              {
                title: "Avg. Processing Time",
                value: "2.1 days",
                icon: TrendingUp,
                iconBgColor: "bg-indigo-100",
              },
            ].map((stat, i) => (
              <StatCard key={i} {...stat} />
            ))}
          </div>

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

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            {loading ? (
              <p className="text-gray-500 text-center py-8">
                Loading applications...
              </p>
            ) : activeTab === "pending" ? (
              <Table data={pendingApplications} columns={pendingColumns} />
            ) : activeTab === "completed" ? (
              <Table data={completedApplications} columns={completedColumns} />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {departmentOverview.map((dept, i) => (
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
      </div>
      {/* {selectedDoc && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-xl p-4 max-w-3xl w-full shadow-lg relative">
            <button
              onClick={() => setSelectedDoc(null)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
            {selectedDoc.endsWith(".pdf") ? (
              <iframe
                src={selectedDoc}
                width="100%"
                height="500px"
                title="Student Document"
              ></iframe>
            ) : (
              <img
                src={selectedDoc}
                alt="Document"
                className="max-h-[500px] w-full object-contain"
              />
            )}
          </div>
        </div>
      )} */}
      {isNotesModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96 relative">
            <button
              onClick={closeNotesModal}
              className="absolute top-2 right-3 text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>

            <h3 className="text-lg font-semibold mb-3 text-gray-800">
              Add / Edit Notes
            </h3>
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Type your notes here..."
              className="w-full h-32 p-3 border rounded-md text-sm focus:ring focus:ring-blue-200 resize-none"
            />

            <div className="flex justify-end mt-4 space-x-2">
              <button
                onClick={closeNotesModal}
                className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  await handleUpdateNotes(
                    selectedAppForNotes.application_id,
                    noteText
                  );
                  closeNotesModal();
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
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
