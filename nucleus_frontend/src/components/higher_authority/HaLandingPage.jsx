import React from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../main/Navbar";
import Footer from "../main/Footer";
import { Card, CardHeader, CardContent } from "../ui/Card";

import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export const HaLandingPage = () => {
  const navigate = useNavigate();

  // 🔹 Static department name
  const departmentName = "Computer Engineering";

  // 🔹 Year cards
  const years = ["FE", "SE", "TE", "BE"];

  // 🔹 Dummy Pie Chart Data
  const pieData = [
    { name: "FE", value: 300 },
    { name: "SE", value: 280 },
    { name: "TE", value: 260 },
    { name: "BE", value: 220 },
  ];

  // Dummy Bar Chart Data
  const barData = [
    { name: "FE", applications: 120 },
    { name: "SE", applications: 95 },
    { name: "TE", applications: 80 },
    { name: "BE", applications: 60 },
  ];

  const COLORS = ["#3B82F6", "#8B5CF6", "#F59E0B", "#10B981"];

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gray-100 px-6 py-10">
        <div className="max-w-7xl mx-auto space-y-10">

          {/* 🔹 HEADER */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {departmentName}
            </h1>
            <p className="text-gray-600 mt-1">
              Higher Authority Overview
            </p>
          </div>

{/* 🔹 YEAR CARDS */}
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
  {years.map((year) => (
    <Card
      key={year}
      onClick={() => navigate("/higher-authority/dashboard")}
      className="
        cursor-pointer
        h-40
        flex
        items-center
        justify-center
        transition-all
        duration-300
        hover:shadow-xl
        hover:-translate-y-2
        hover:border-blue-500
        border-2
        bg-white
      "
    >
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-gray-800">
          {year}
        </h2>
        <p className="text-sm text-gray-500">
          View students & applications
        </p>
      </div>
    </Card>
  ))}
</div>


          {/* 🔹 CHARTS SECTION */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Pie Chart */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">
                  Students Distribution (Year-wise)
                </h3>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label
                    >
                      {pieData.map((entry, index) => (
                        <Cell
                          key={index}
                          fill={COLORS[index]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Bar Chart */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">
                  Applications by Year
                </h3>
              </CardHeader>
              <CardContent>
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
              </CardContent>
            </Card>

          </div>

        </div>
      </div>

      <Footer />
    </>
  );
};

export default HaLandingPage;
