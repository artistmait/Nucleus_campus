import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../main/Navbar";
import Footer from "../main/Footer";

import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

import api from "../../config/api";

const SENTIMENT_COLORS = {
  positive: "#10B981",
  neutral: "#F59E0B",
  negative: "#EF4444",
};

const SummaryCard = ({ title, value, subValue, accentClass }) => (
  <div className="bg-white rounded-[20px] p-5 shadow-[0_4px_20px_rgba(49,46,129,0.04)] border border-[#eef1f6]">
    <div className="flex items-center gap-2">
      <span className={`h-2.5 w-2.5 rounded-full ${accentClass}`} />
      <p className="text-[12px] font-semibold text-[#464554] uppercase tracking-[0.05em]">
        {title}
      </p>
    </div>
    <div className="mt-3 flex items-baseline gap-2">
      <span className="text-2xl font-bold text-[#191c1e]">{value}</span>
      {subValue ? <span className="text-sm text-[#464554]">{subValue}</span> : null}
    </div>
  </div>
);

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
        const res = await api.get(
          "/api/incharge/getInchargeDashboard",
        );
        const f_res = await api.get(
          "/api/predict/feedbackanalytics",
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

  const branchColorMap = useMemo(() => {
    if (!dashboardData) return {};
    return dashboardData.studentsByBranch.reduce((acc, item, index) => {
      acc[item.branch] = COLORS[index % COLORS.length];
      return acc;
    }, {});
  }, [COLORS, dashboardData]);

  const pieData = useMemo(() => {
    if (!dashboardData) return [];

    return dashboardData.studentsByBranch.map((item, index) => ({
      name: item.branch,
      value: Number(item.total_students),
      color: branchColorMap[item.branch] || COLORS[index % COLORS.length],
    }));
  }, [COLORS, branchColorMap, dashboardData]);

  const applicationBarData = useMemo(() => {
    if (!dashboardData) return [];

    return dashboardData.applicationsByBranch.map((item) => ({
      label: item.branch,
      count: Number(item.total_applications),
      color: branchColorMap[item.branch] || COLORS[0],
    }));
  }, [COLORS, branchColorMap, dashboardData]);

  const sentimentPieData = useMemo(() => {
    if (!feedbackData) return [];

    return feedbackData.sentimentDistribution.map((item) => {
      const name = String(item.sentiment_text || "").toLowerCase();
      const label = name
        ? `${name.charAt(0).toUpperCase()}${name.slice(1)}`
        : "Unknown";
      return {
        name,
        label,
        value: Number(item.count),
        color: SENTIMENT_COLORS[name] || "#cbd5e1",
      };
    });
  }, [feedbackData]);

  const feedbackTrendData = useMemo(() => {
    if (!feedbackData) return [];

    return feedbackData.feedbackTrend.map((item) => ({
      date: item.date,
      feedbacks: Number(item.total),
    }));
  }, [feedbackData]);

  const totalStudents = useMemo(
    () => pieData.reduce((sum, item) => sum + item.value, 0),
    [pieData],
  );

  const totalApplications = useMemo(
    () => applicationBarData.reduce((sum, item) => sum + item.count, 0),
    [applicationBarData],
  );

  const totalFeedbacks = useMemo(
    () => sentimentPieData.reduce((sum, item) => sum + item.value, 0),
    [sentimentPieData],
  );

  const branchSummary = useMemo(() => {
    if (totalStudents === 0) return [];
    return pieData.map((item) => ({
      ...item,
      percent: Math.round((item.value / totalStudents) * 100),
    }));
  }, [pieData, totalStudents]);

  const sentimentSummary = useMemo(() => {
    if (totalFeedbacks === 0) return [];
    return sentimentPieData.map((item) => ({
      ...item,
      percent: Math.round((item.value / totalFeedbacks) * 100),
    }));
  }, [sentimentPieData, totalFeedbacks]);

  const summaryCards = useMemo(
    () => [
      {
        title: "Branches",
        value: branches.length,
        subValue: "Departments",
        accentClass: "bg-[#3B82F6]",
      },
      {
        title: "Students",
        value: totalStudents,
        subValue: "Total enrolled",
        accentClass: "bg-[#10B981]",
      },
      {
        title: "Applications",
        value: totalApplications,
        subValue: "Assigned",
        accentClass: "bg-[#F59E0B]",
      },
      {
        title: "Feedbacks",
        value: totalFeedbacks,
        subValue: "Responses",
        accentClass: "bg-[#4338ca]",
      },
    ],
    [branches.length, totalApplications, totalFeedbacks, totalStudents],
  );

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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {summaryCards.map((item) => (
              <SummaryCard
                key={item.title}
                title={item.title}
                value={item.value}
                subValue={item.subValue}
                accentClass={item.accentClass}
              />
            ))}
          </div>

          {/* VISUALIZATIONS */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
            <div className="bg-white rounded-[24px] p-6 sm:p-8 shadow-[0_4px_20px_rgba(49,46,129,0.04)]">
              <div className="mb-8 border-none">
                <h3 className="text-xl font-bold text-[#191c1e]">
                  Students Distribution (Branch-wise)
                </h3>
                <p className="text-sm text-[#464554] mt-1">
                  Enrollment share by branch
                </p>
              </div>
              <div className="w-full">
                {pieData.length === 0 ? (
                  <p className="text-center text-[#464554] py-10">No data available</p>
                ) : (
                  <div className="relative">
                    <ResponsiveContainer width="100%" height={260}>
                      <PieChart>
                        <Pie
                          data={pieData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={70}
                          outerRadius={100}
                          stroke="none"
                        >
                          {pieData.map((entry) => (
                            <Cell key={entry.name} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: "rgba(255,255,255,0.85)", backdropFilter: "blur(12px)", border: "none", borderRadius: "12px", boxShadow: "0 4px 20px rgba(49,46,129,0.08)" }} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-3xl font-bold text-[#191c1e]">
                        {totalStudents}
                      </span>
                      <span className="text-[11px] uppercase tracking-[0.08em] text-[#464554]">
                        Total Students
                      </span>
                    </div>
                  </div>
                )}
              </div>
              {branchSummary.length > 0 ? (
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-48 overflow-y-auto pr-1">
                  {branchSummary.map((item) => (
                    <div key={item.name} className="flex items-center gap-3">
                      <span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.08em] text-[#464554]">
                          {item.name}
                        </p>
                        <p className="text-sm font-semibold text-[#191c1e]">
                          {item.value} ({item.percent}%)
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="bg-white rounded-[24px] p-6 sm:p-8 shadow-[0_4px_20px_rgba(49,46,129,0.04)] flex flex-col">
              <div className="mb-8 border-none">
                <h3 className="text-xl font-bold text-[#191c1e]">
                  Applications by Branch
                </h3>
                <p className="text-sm text-[#464554] mt-1">
                  Assigned application volume
                </p>
              </div>
              <div className="w-full flex-grow">
                {applicationBarData.length === 0 ? (
                  <p className="text-center text-[#464554] py-10">No data available</p>
                ) : (
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={applicationBarData} barSize={32}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#eef1f6" />
                      <XAxis dataKey="label" stroke="#c7c4d7" tick={{ fill: "#464554", fontSize: 12 }} />
                      <YAxis stroke="#c7c4d7" tick={{ fill: "#464554", fontSize: 12 }} />
                      <Tooltip contentStyle={{ backgroundColor: "rgba(255,255,255,0.85)", backdropFilter: "blur(12px)", border: "none", borderRadius: "12px", boxShadow: "0 4px 20px rgba(49,46,129,0.08)" }} />
                      <Bar dataKey="count" radius={[10, 10, 0, 0]}>
                        {applicationBarData.map((entry) => (
                          <Cell key={entry.label} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
            <div className="bg-white rounded-[24px] p-6 sm:p-8 shadow-[0_4px_20px_rgba(49,46,129,0.04)]">
              <div className="mb-8 border-none">
                <h3 className="text-xl font-bold text-[#191c1e]">
                  Sentiment Distribution
                </h3>
                <p className="text-sm text-[#464554] mt-1">Latest feedback mix</p>
              </div>
              <div className="w-full">
                {sentimentPieData.length === 0 ? (
                  <p className="text-center text-[#464554] py-10">No data available</p>
                ) : (
                  <div className="relative">
                    <ResponsiveContainer width="100%" height={260}>
                      <PieChart>
                        <Pie
                          data={sentimentPieData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={70}
                          outerRadius={100}
                          stroke="none"
                        >
                          {sentimentPieData.map((entry) => (
                            <Cell key={entry.name} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: "rgba(255,255,255,0.85)", backdropFilter: "blur(12px)", border: "none", borderRadius: "12px", boxShadow: "0 4px 20px rgba(49,46,129,0.08)" }} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-3xl font-bold text-[#191c1e]">
                        {totalFeedbacks}
                      </span>
                      <span className="text-[11px] uppercase tracking-[0.08em] text-[#464554]">
                        Total Responses
                      </span>
                    </div>
                  </div>
                )}
              </div>
              {sentimentSummary.length > 0 ? (
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {sentimentSummary.map((item) => (
                    <div key={item.label} className="flex items-center gap-3">
                      <span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.08em] text-[#464554]">
                          {item.label}
                        </p>
                        <p className="text-sm font-semibold text-[#191c1e]">
                          {item.value} ({item.percent}%)
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="bg-white rounded-[24px] p-6 sm:p-8 shadow-[0_4px_20px_rgba(49,46,129,0.04)] flex flex-col">
              <div className="mb-8 border-none">
                <h3 className="text-xl font-bold text-[#191c1e]">
                  Sentiment Trend
                </h3>
                <p className="text-sm text-[#464554] mt-1">Daily feedback volume</p>
              </div>
              <div className="w-full flex-grow">
                {feedbackTrendData.length === 0 ? (
                  <p className="text-center text-[#464554] py-10">No data available</p>
                ) : (
                  <ResponsiveContainer width="100%" height={320}>
                    <LineChart data={feedbackTrendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#eef1f6" />
                      <XAxis dataKey="date" stroke="#c7c4d7" tick={{ fill: "#464554", fontSize: 12 }} dy={10} />
                      <YAxis stroke="#c7c4d7" tick={{ fill: "#464554", fontSize: 12 }} dx={-10} />
                      <Tooltip contentStyle={{ backgroundColor: "rgba(255,255,255,0.85)", backdropFilter: "blur(12px)", border: "none", borderRadius: "12px", boxShadow: "0 4px 20px rgba(49,46,129,0.08)" }} />
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
                          <stop offset="5%" stopColor="#2a14b4" stopOpacity={1} />
                          <stop offset="95%" stopColor="#4338ca" stopOpacity={1} />
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

      <Footer />
    </>
  );
};

export default IcLandingPage;
