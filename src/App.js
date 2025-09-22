import React, { useContext } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import ForgotPassword from "./components/ForgotPassword";
import Dashboard from "./components/Dashboard";
import AddCourse from "./components/AddCourse";
import CertificatesPage from "./components/CertificatesPage";
import { AuthProvider, AuthContext } from "./context/AuthContext";
import CoursesList from "./components/CoursesList";
import Courses from "./components/Courses";
import Settings from "./components/Settings";
import AllUsers from "./components/AllUsers";

const ProtectedRoute = ({ element }) => {
  const { user } = useContext(AuthContext);
  return user ? element : <Navigate to="/" />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/dashboard" element={<ProtectedRoute element={<Dashboard />} />} />
          <Route path="/add-course" element={<ProtectedRoute element={<AddCourse />} />} />
          <Route path="/certificates" element={<ProtectedRoute element={<CertificatesPage />} />} />
          <Route path="/courses-list" element={<ProtectedRoute element={<CoursesList />} />} />
          <Route path="/courses" element={<ProtectedRoute element={<Courses />} />} />
          <Route path="/settings" element={<ProtectedRoute element={<Settings />} />} />
          <Route path="/all-users" element={<ProtectedRoute element={<AllUsers />} />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;