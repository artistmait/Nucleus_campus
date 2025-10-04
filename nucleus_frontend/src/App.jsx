import React from 'react'
import {createBrowserRouter, RouterProvider} from 'react-router-dom'
import RegisterPage from './components/auth/RegisterPage'
import LoginPage from './components/auth/LoginPage'
import StudentDashboard from './components/student/StudentDashboard'
import ExamSection from './components/student/exam/ExamSection'
import MarksheetCorrectionForm from './components/student/exam/MarksheetCorrectionForm'

function App() {

  const router = createBrowserRouter([
    {
      path :'/',
      element : <RegisterPage/>,
    },
    {
      path :'/auth/login',
      element : <LoginPage/>,
    },
    {
      path : '/student/dashboard',
      element : <StudentDashboard />
    },
    {
      path :'/student/exam-section',
      element: <ExamSection/>
    },
    {
      path:'/student/correction',
      element:<MarksheetCorrectionForm/>
    }
    ])
  return (
    <>
      <div>
        <RouterProvider router={router}/>
      </div>
    </>
  )
}

export default App
