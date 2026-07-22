import { Routes, Route } from "react-router-dom";
import Dashboard from "../pages/Dashboard";
import Subjects from "../pages/Subjects";
import Topics from "../pages/Topics";
import Questions from "../pages/Questions";

import Sidebar from "../components/layout/Sidebar";
import Header from "../components/layout/Header";
import { Navigate } from "react-router-dom";
import Login from "../pages/Login";

import Sets from "../pages/Sets";
import SetBuilder from "../pages/SetBuilder";
import Packages from "../pages/Packages";
import PackageBuilder from "../pages/PackageBuilder";
import Guide from "../pages/Guide";
import Students from "../pages/Students";
import NotFound from "../pages/NotFound";

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
            <Route path="/sets" element={<Sets />} />
            <Route path="/sets/:id" element={<SetBuilder />} />
            <Route path="/packages" element={<Packages />} />
            <Route path="/packages/:id" element={<PackageBuilder />} />
            <Route path="/students" element={<Students />} />
            <Route path="/guide" element={<Guide />} />

            <Route path="/login" element={<Login />} />
            <Route path="/*" element={
              isAuthenticated() ? (
                <NotFound />
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
