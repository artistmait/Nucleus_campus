import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Navbar from "../../main/Navbar";
import Footer from "../../main/Footer";
import ApprovalsTable from "../../ui/ApprovalsTable";
import StatCard from "../../ui/StatCard";
import { FileText, Clock, AlertCircle } from "lucide-react";

export default function MyApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

    const getPriorityColor = (priority) => {
    const value = (priority || "");
    switch (value) {
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
    const value = (status || "");
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


  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
      toast.error("Please log in to view your applications.");
      return;
    }

    const fetchApplications = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/student/getApplications/${user.id}`
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
  const pending = applications.filter((a) => a.status === "pending").length;
  const critical = applications.filter(
    (a) => a.priority === "critical" || a.priority === "high"
  ).length;

  return (
    <div className="w-full min-h-screen flex flex-col bg-gray-50">
      <ToastContainer position="top-center" />
      <Navbar />

      <main className="flex-grow w-full max-w-6xl mx-auto px-6 md:px-10 lg:px-14 py-12">
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

            {/* Applications Table */}
            <ApprovalsTable
              applications={applications.map((app) => ({
                id: app.application_id,
                student:`You`,
                requestType: app.type.replace("_", " "),
                department: app.department_name || "IT",
                approvalStage: (
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                      app.status
                    )}`}
                  >
                    {app.status}
                  </span>
                ),
                priority: (
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${getPriorityColor(
                      app.priority
                    )}`}
                  >
                    {app.priority}
                  </span>
                ),
              }))}
            />
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
