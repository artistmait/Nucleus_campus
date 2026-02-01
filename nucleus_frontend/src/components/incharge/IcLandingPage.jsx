import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../main/Navbar";
import Footer from "../main/Footer";
import { Card, CardHeader, CardContent } from "../ui/Card";

import {
  PieChart,
  Pie,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

import axios from "axios";

export const IcLandingPage = () => {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [feedbackData, setFeedbackData] = useState(null);
  const navigate = useNavigate();

  const COLORS = useMemo(
    () => ["#3B82F6", "#8B5CF6", "#10B981", "#F59E0B", "#EF4444", "#6366F1"],
    [],
  );

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await axios.get(
          "http://localhost:5000/api/incharge/getInchargeDashboard",
        );
        const f_res = await axios.get(
          "http://localhost:5000/api/predict/feedbackanalytics",
        );
        setDashboardData(res.data);
        setFeedbackData(f_res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const branches = useMemo(() => {
    if (!dashboardData) return [];
    return dashboardData.studentsByBranch.map((item) => item.branch);
  }, [dashboardData]);

  const pieData = useMemo(() => {
    if (!dashboardData) return [];

    return dashboardData.studentsByBranch.map((item, index) => ({
      name: item.branch,
      value: Number(item.total_students),
      fill: COLORS[index % COLORS.length],
    }));
  }, [COLORS, dashboardData]);

  const barData = useMemo(() => {
    if (!dashboardData) return [];

    return dashboardData.applicationsByBranch.map((item) => ({
      name: item.branch,
      applications: Number(item.total_applications),
    }));
  }, [dashboardData]);

  const sentimentPieData = useMemo(() => {
    if (!feedbackData) return [];

    return feedbackData.sentimentDistribution.map((item) => ({
      name: item.sentiment_text,
      value: Number(item.count),
      fill:
        item.sentiment_text === "positive"
          ? "#10B981"
          : item.sentiment_text === "neutral"
            ? "#F59E0B"
            : "#EF4444",
    }));
  }, [feedbackData]);

  const feedbackTrendData = useMemo(() => {
    if (!feedbackData) return [];

    return feedbackData.feedbackTrend.map((item) => ({
      date: item.date,
      feedbacks: Number(item.total),
    }));
  }, [feedbackData]);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center text-gray-500">
          Loading dashboard...
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gray-100 px-4 sm:px-6 lg:px-10 py-6 sm:py-10">
        <div className="max-w-7xl mx-auto space-y-10">
          {/* HEADER */}
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
              Incharge Dashboard
            </h1>
            <p className="text-gray-600 mt-1">
              Branch-wise overview and analytics
            </p>
          </div>

          {/* BRANCH CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {branches.map((branch) => (
              <Card
                key={branch}
                onClick={() =>
                  navigate(`/incharge/dashboard?branch=${encodeURIComponent(branch)}`)
                }
                className="
                  cursor-pointer
                  h-32 sm:h-36 lg:h-40
                  flex items-center justify-center
                  transition-all duration-300
                  hover:shadow-xl hover:-translate-y-2
                  hover:border-blue-500
                  border-2 bg-white
                "
              >
                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-bold text-gray-800">{branch}</h2>
                  <p className="text-sm text-gray-500">
                    View students & applications
                  </p>
                </div>
              </Card>
            ))}
          </div>

          {/* VISUALIZATIONS */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="grid grid-cols-1 xl:grid-rows-2 gap-6">
              {/* PIE CHART */}
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold">
                    Students Distribution (Branch-wise)
                  </h3>
                </CardHeader>
                <CardContent>
                  {pieData.length === 0 ? (
                    <p className="text-center text-gray-500">
                      No data available
                    </p>
                  ) : (
                    <ResponsiveContainer width="100%" height={280}>
                      <PieChart>
                        <Pie
                          data={pieData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          label
                        />
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold">
                    Sentiment Distribution
                  </h3>
                </CardHeader>
                <CardContent>
                  {sentimentPieData.length === 0 ? (
                    <p className="text-center text-gray-500">
                      No data available
                    </p>
                  ) : (
                    <ResponsiveContainer width="100%" height={280}>
                      <PieChart>
                        <Pie
                          data={sentimentPieData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          label
                        />
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </div>
            <div className="grid grid-cols-1 xl:grid-rows-2 gap-6">
              {/* BAR CHART */}
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold">
                    Applications by Branch
                  </h3>
                </CardHeader>
                <CardContent>
                  {barData.length === 0 ? (
                    <p className="text-center text-gray-500">
                      No data available
                    </p>
                  ) : (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={barData}>
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar
                          dataKey="applications"
                          fill="#3B82F6"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
              {/* line chart */}
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold">
                    Sentiment trend
                  </h3>
                </CardHeader>
                <CardContent>
                  {feedbackTrendData.length === 0 ? (
                    <p className="text-center text-gray-500">
                      No data available
                    </p>
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
        </div>
      </div>

      <Footer />
    </>
  );
};

export default IcLandingPage;
