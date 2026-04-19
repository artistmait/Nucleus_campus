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
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  LineChart,
  YAxis,
  Line,
} from "recharts";
import { useMemo } from "react";

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
      {subValue ? (
        <span className="text-sm text-[#464554]">{subValue}</span>
      ) : null}
    </div>
  </div>
);

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

    return dashboardData.sentimentDistribution.map((item) => {
      const name = String(item.sentiment_text || "").toLowerCase();
      const label = name ? `${name.charAt(0).toUpperCase()}${name.slice(1)}` : "Unknown";
      return {
        name,
        label,
        value: Number(item.count),
        color: SENTIMENT_COLORS[name] || "#cbd5e1",
      };
    });
  }, [dashboardData]);


  const feedbackTrendData = useMemo(() => {
    if (!dashboardData) return [];

    return dashboardData.feedbackTrend.map((item) => ({
      date: item.date,
      feedbacks: Number(item.total),
    }));
  }, [dashboardData]);

  const totalFeedbacks = useMemo(
    () => sentimentPieData.reduce((sum, item) => sum + item.value, 0),
    [sentimentPieData],
  );

  const sentimentSummary = useMemo(() => {
    if (totalFeedbacks === 0) return [];
    return sentimentPieData.map((item) => ({
      ...item,
      percent: Math.round((item.value / totalFeedbacks) * 100),
    }));
  }, [sentimentPieData, totalFeedbacks]);

  const sentimentBarData = useMemo(
    () => sentimentPieData.map((item) => ({
      label: item.label,
      count: item.value,
      color: item.color,
    })),
    [sentimentPieData],
  );

  const summaryCards = useMemo(() => {
    if (sentimentSummary.length > 0) return sentimentSummary;
    return [
      { label: "Positive", value: 0, percent: 0, color: SENTIMENT_COLORS.positive },
      { label: "Neutral", value: 0, percent: 0, color: SENTIMENT_COLORS.neutral },
      { label: "Negative", value: 0, percent: 0, color: SENTIMENT_COLORS.negative },
    ];
  }, [sentimentSummary]);

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-[#f7f9fb] px-4 sm:px-6 lg:px-10 py-8 lg:py-12 pb-24">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-[40px] font-bold text-[#191c1e] tracking-tight leading-tight mb-2">
                {departmentName}
              </h1>
              <p className="text-[#464554] text-lg">Higher Authority Overview</p>
            </div>

            <button
              onClick={() => navigate("/higher-authority/dashboard")}
              className="px-6 py-3 bg-gradient-to-br from-[#2a14b4] to-[#4338ca] text-white rounded-xl shadow-[0_4px_12px_rgba(42,20,180,0.3)] hover:shadow-[0_6px_20px_rgba(42,20,180,0.4)] hover:-translate-y-0.5 transition-all font-semibold"
            >
              View All Applications
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {years.map((year) => (
              <div
                key={year}
                onClick={() => navigate("/higher-authority/dashboard")}
                className="cursor-pointer h-32 flex flex-col items-center justify-center bg-white rounded-[24px] shadow-[0_4px_20px_rgba(49,46,129,0.04)] hover:shadow-[0_12px_40px_rgba(49,46,129,0.06)] hover:-translate-y-1 transition-all duration-300"
              >
                <h2 className="text-2xl font-bold text-[#191c1e] mb-1">{year}</h2>
                <p className="text-[11px] font-semibold text-[#464554] uppercase tracking-[0.05em]">Filter by batch</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            <SummaryCard
              title="Total Feedbacks"
              value={totalFeedbacks}
              subValue="Responses"
              accentClass="bg-[#4338ca]"
            />
            {summaryCards.map((item) => (
              <SummaryCard
                key={item.label}
                title={`${item.label} Sentiment`}
                value={`${item.percent}%`}
                subValue={`${item.value} responses`}
                accentClass=""
              />
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            {/* SENTIMENT DONUT */}
            <div className="bg-white rounded-[24px] p-6 sm:p-8 shadow-[0_4px_20px_rgba(49,46,129,0.04)]">
              <div className="mb-8 border-none">
                <h3 className="text-xl font-bold text-[#191c1e]">Sentiment Distribution</h3>
                <p className="text-sm text-[#464554] mt-1">Latest feedback mix</p>
              </div>
              <div className="w-full">
                <div className="relative">
                  <ResponsiveContainer width="100%" height={280}>
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
                    <span className="text-3xl font-bold text-[#191c1e]">{totalFeedbacks}</span>
                    <span className="text-[11px] uppercase tracking-[0.08em] text-[#464554]">Total Responses</span>
                  </div>
                </div>
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {summaryCards.map((item) => (
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
              </div>
            </div>

            {/* SENTIMENT COUNTS */}
            <div className="bg-white rounded-[24px] p-6 sm:p-8 shadow-[0_4px_20px_rgba(49,46,129,0.04)] flex flex-col">
              <div className="mb-8 border-none">
                <h3 className="text-xl font-bold text-[#191c1e]">Sentiment Counts</h3>
                <p className="text-sm text-[#464554] mt-1">Response volume by category</p>
              </div>
              <div className="w-full flex-grow">
                {sentimentBarData.length === 0 ? (
                  <p className="text-center text-[#464554] py-10">No data available</p>
                ) : (
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={sentimentBarData} barSize={36}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#eef1f6" />
                      <XAxis dataKey="label" stroke="#c7c4d7" tick={{ fill: "#464554", fontSize: 12 }} />
                      <YAxis stroke="#c7c4d7" tick={{ fill: "#464554", fontSize: 12 }} />
                      <Tooltip contentStyle={{ backgroundColor: "rgba(255,255,255,0.85)", backdropFilter: "blur(12px)", border: "none", borderRadius: "12px", boxShadow: "0 4px 20px rgba(49,46,129,0.08)" }} />
                      <Bar dataKey="count" radius={[10, 10, 0, 0]}>
                        {sentimentBarData.map((entry) => (
                          <Cell key={entry.label} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[24px] p-6 sm:p-8 shadow-[0_4px_20px_rgba(49,46,129,0.04)] flex flex-col">
            <div className="mb-8 border-none">
              <h3 className="text-xl font-bold text-[#191c1e]">Sentiment Trend</h3>
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
                      stroke="url(#colorUv2)"
                      strokeWidth={4}
                      dot={{ r: 4, strokeWidth: 2, fill: "#ffffff", stroke: "#4338ca" }}
                      activeDot={{ r: 8, strokeWidth: 2, fill: "#ffffff", stroke: "#2a14b4" }}
                    />
                    <defs>
                      <linearGradient id="colorUv2" x1="0" y1="0" x2="1" y2="0">
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

      <Footer />
    </>
  );
};

export default HaLandingPage;
