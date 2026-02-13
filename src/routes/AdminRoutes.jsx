import { Routes, Route } from "react-router-dom";
import Dashboard from "../pages/Dashboard";
import Subjects from "../pages/Subjects";
import Topics from "../pages/Topics";
import Questions from "../pages/Questions";
import Mocks from "../pages/Mocks";

import Sidebar from "../components/layout/Sidebar";
import Header from "../components/layout/Header";
import { Navigate } from "react-router-dom";
import Login from "../pages/Login";

const isAuthenticated = () => {
  return !!localStorage.getItem("token");
};

function AdminRoutes() {
  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <Sidebar />

      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <Header />

        <div style={{ padding: "20px", flex: 1 }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/subjects" element={<Subjects />} />
            <Route path="/topics" element={<Topics />} />
            <Route path="/questions" element={<Questions />} />
            <Route path="/mocks" element={<Mocks />} />
            <Route path="/login" element={<Login />} />
            <Route path="/*" element={
              isAuthenticated() ? (
                <Dashboard />
              ) : (
                <Navigate to="/login" />
              )
            } />
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default AdminRoutes;
