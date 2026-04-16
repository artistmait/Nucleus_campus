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

  // const barData = useMemo(() => {
  //   if (!dashboardData) return [];

  //   return dashboardData.applicationsByBranch.map((item) => ({
  //     name: item.branch,
  //     applications: Number(item.total_applications),
  //   }));
  // }, [dashboardData]);

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
        <div className="min-h-screen flex items-center justify-center text-gray-500 bg-[#f7f9fb]">
          Loading dashboard...
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-[#f7f9fb] px-4 sm:px-6 lg:px-10 py-8 lg:py-12 pb-24">
        <div className="max-w-7xl mx-auto space-y-10">
          {/* HEADER */}
          <div>
            <h1 className="text-3xl sm:text-4xl lg:text-[40px] font-bold text-[#191c1e] tracking-tight leading-tight">
              Incharge Dashboard
            </h1>
            <p className="text-[#464554] mt-2 text-lg">
              Branch-wise overview and analytics
            </p>
          </div>

          {/* BRANCH CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {branches.map((branch) => (
              <div
                key={branch}
                onClick={() =>
                  navigate(`/incharge/dashboard?branch=${encodeURIComponent(branch)}`)
                }
                className="
                  cursor-pointer
                  h-32 sm:h-36 lg:h-40
                  flex flex-col items-center justify-center
                  transition-all duration-300
                  rounded-[24px] bg-white
                  shadow-[0_4px_20px_rgba(49,46,129,0.04)]
                  hover:shadow-[0_12px_40px_rgba(49,46,129,0.06)] hover:-translate-y-1
                "
              >
                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-bold text-[#191c1e]">{branch}</h2>
                  <p className="text-[11px] font-semibold text-[#464554] uppercase tracking-[0.05em]">
                    View students & applications
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* VISUALIZATIONS */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
            <div className="grid grid-cols-1 gap-6 lg:gap-8">
              {/* PIE CHART */}
              <div className="bg-white rounded-[24px] p-6 sm:p-8 shadow-[0_4px_20px_rgba(49,46,129,0.04)]">
                <div className="mb-8 border-none">
                  <h3 className="text-xl font-bold text-[#191c1e]">
                    Students Distribution (Branch-wise)
                  </h3>
                </div>
                <div className="w-full">
                  {pieData.length === 0 ? (
                    <p className="text-center text-[#464554] py-10">
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
                          stroke="none"
                        />
                        <Tooltip contentStyle={{ backgroundColor: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(12px)', border: 'none', borderRadius: '12px', boxShadow: '0 4px 20px rgba(49,46,129,0.08)' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
              
              {/* SENTIMENT CHART */}
              <div className="bg-white rounded-[24px] p-6 sm:p-8 shadow-[0_4px_20px_rgba(49,46,129,0.04)]">
                <div className="mb-8 border-none">
                  <h3 className="text-xl font-bold text-[#191c1e]">
                    Sentiment Distribution
                  </h3>
                </div>
                <div className="w-full">
                  {sentimentPieData.length === 0 ? (
                    <p className="text-center text-[#464554] py-10">
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
                          stroke="none"
                        />
                        <Tooltip contentStyle={{ backgroundColor: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(12px)', border: 'none', borderRadius: '12px', boxShadow: '0 4px 20px rgba(49,46,129,0.08)' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-6 lg:gap-8 h-full">
              {/* LINE CHART */}
              <div className="bg-white rounded-[24px] p-6 sm:p-8 shadow-[0_4px_20px_rgba(49,46,129,0.04)] flex flex-col h-full min-h-[400px]">
                <div className="mb-8 border-none">
                  <h3 className="text-xl font-bold text-[#191c1e]">
                    Sentiment trend
                  </h3>
                </div>
                <div className="w-full flex-grow">
                  {feedbackTrendData.length === 0 ? (
                    <p className="text-center text-[#464554] py-10">
                      No data available
                    </p>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%" minHeight={300}>
                      <LineChart data={feedbackTrendData}>
                        <XAxis dataKey="date" stroke="#c7c4d7" tick={{fill: '#464554', fontSize: 12}} dy={10} />
                        <YAxis stroke="#c7c4d7" tick={{fill: '#464554', fontSize: 12}} dx={-10} />
                        <Tooltip contentStyle={{ backgroundColor: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(12px)', border: 'none', borderRadius: '12px', boxShadow: '0 4px 20px rgba(49,46,129,0.08)' }} />
                        <Line
                          type="monotone"
                          dataKey="feedbacks"
                          stroke="url(#colorUv)"
                          strokeWidth={4}
                          dot={{ r: 4, strokeWidth: 2, fill: "#ffffff", stroke: "#4338ca" }}
                          activeDot={{ r: 8, strokeWidth: 2, fill: "#ffffff", stroke: "#2a14b4" }}
                        />
                        <defs>
                          <linearGradient id="colorUv" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="5%" stopColor="#2a14b4" stopOpacity={1}/>
                            <stop offset="95%" stopColor="#4338ca" stopOpacity={1}/>
                          </linearGradient>
                        </defs>
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default IcLandingPage;
