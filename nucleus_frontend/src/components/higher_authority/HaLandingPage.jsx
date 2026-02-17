/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../main/Navbar";
import Footer from "../main/Footer";
import { Card, CardHeader, CardContent } from "../ui/Card";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  XAxis,
  LineChart,
  YAxis,
  Line,
} from "recharts";
import { useMemo } from "react";

export const HaLandingPage = () => {
  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  // const [feedbackData, setFeedbackData] = useState(null);

  const user = JSON.parse(localStorage.getItem("user"));
  const departmentId = user?.department_id;

  const departmentName = user?.department_name || "Department";

  const years = ["FE", "SE", "TE", "BE"];

  const COLORS = ["#10B981", "#F59E0B", "#EF4444"];

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/predict/feedbackanalytics`,
        );

        setDashboardData(res.data);
      } catch (error) {
        console.error("HA Dashboard Error:", error);
      } finally {
        setLoading(false);
      }
    };

    if (departmentId) fetchDashboard();
  }, [departmentId]);

const sentimentPieData = useMemo(() => {
  if (!dashboardData) return [];

  return dashboardData.sentimentDistribution.map((item) => ({
    name: item.sentiment_text,
    value: Number(item.count),
  }));
}, [dashboardData]);


  const feedbackTrendData = useMemo(() => {
    if (!dashboardData) return [];

    return dashboardData.feedbackTrend.map((item) => ({
      date: item.date,
      feedbacks: Number(item.total),
    }));
  }, [dashboardData]);

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gray-100 px-6 py-10">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {departmentName}
              </h1>
              <p className="text-gray-600 mt-1">Higher Authority Overview</p>
            </div>

            <button
              onClick={() => navigate("/higher-authority/dashboard")}
              className="px-5 py-2 bg-indigo-800 text-white rounded-full shadow hover:bg-blue-700 transition"
            >
              View All Applications
            </button>
          </div>

          {/* {!loading && dashboardData && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-gray-500 text-sm">Total Students</h3>
                  <p className="text-3xl font-bold text-gray-800 mt-2">
                    {dashboardData.totalStudents}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h3 className="text-gray-500 text-sm">Total Applications</h3>
                  <p className="text-3xl font-bold text-gray-800 mt-2">
                    {dashboardData.totalApplications}
                  </p>
                </CardContent>
              </Card>
            </div>
          )} */}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {years.map((year) => (
              <Card
                key={year}
                onClick={() => navigate("/higher-authority/dashboard")}
                className="cursor-pointer h-32 flex items-center justify-center hover:shadow-lg transition"
              >
                <h2 className="text-2xl font-bold text-gray-700">{year}</h2>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Sentiment Distribution</h3>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={sentimentPieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {sentimentPieData.map((entry, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Sentiment trend</h3>
            </CardHeader>
            <CardContent>
              {feedbackTrendData.length === 0 ? (
                <p className="text-center text-gray-500">No data available</p>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={feedbackTrendData}>
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="feedbacks"
                      stroke="#3B82F6"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default HaLandingPage;
