import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import RegisterPage from "./components/auth/RegisterPage";
import LoginPage from "./components/auth/LoginPage";
import StudentDashboard from "./components/student/StudentDashboard";
import ExamSection from "./components/student/exam/ExamSection";
import MarksheetCorrectionForm from "./components/student/exam/MarksheetCorrectionForm";
import HaDashboard from "./components/higher_authority/HaDashboard";
import InchargeDashboard from "./components/incharge/InchargeDashboard";
import ProtectedRoute from "./components/main/ProtectedRoutes";
import MyApplications from "./components/student/exam/MyApplications";
import KTFormSubmission from "./components/student/exam/KTFormSubmission";
import { IcLandingPage } from "./components/incharge/IcLandingPage";
import { HaLandingPage } from "./components/higher_authority/HaLandingPage";

function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <RegisterPage />,
    },
    {
      path: "/auth/login",
      element: <LoginPage />,
    },
    {
      element: <ProtectedRoute allowedRoles={[1,4]} />,
      children: [
        { path: "/student/dashboard", element: <StudentDashboard /> },
        {
          path: "/student/exam-section",
          element: <ExamSection />,
        },
        {
          path: "/student/correction",
          element: <MarksheetCorrectionForm />,
        },
        {
          path: "/student/ktsubmission",
          element: <KTFormSubmission />,
        },
        {
          path: "/student/myapplications",
          element: <MyApplications />,
        },
      ],
    },
    {
      element: <ProtectedRoute allowedRoles={[2]} />,
      children: [
         {
          path: "/incharge/landingpage",
          element: <IcLandingPage />,
        },
        {
          path: "/incharge/dashboard",
          element: <InchargeDashboard />,
        },
      ],
    },
    {
      element: <ProtectedRoute allowedRoles={[3]} />,
      children: [
        {
          path: "/higher-authority/dashboard",
          element: <HaDashboard />,
        },
        {
          path: "/higher-authority/landingpage",
          element: <HaLandingPage />,
        },
      ],
    },
  ]);
  return (
    <>
      <div>
        <RouterProvider router={router} />
      </div>
    </>
  );
}

export default App;
