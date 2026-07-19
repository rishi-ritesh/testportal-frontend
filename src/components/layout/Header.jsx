import { useLocation, useNavigate } from "react-router-dom";

function Header() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login", { replace: true });
  };

  const getTitle = () => {
    const path = location.pathname;

    if (path === "/") return "Dashboard";
    if (path.includes("subjects")) return "Subjects";
    if (path.includes("topics")) return "Topics";
    if (path.includes("questions")) return "Questions";
    if (path.includes("packages")) return "Packages";
    if (path.includes("sets")) return "Sets";
    if (path.includes("guide")) return "Guide";

    return "Admin";
  };

  return (
    <div
      style={{
        height: "60px",
        background: "#ffffff",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 20px",
        borderBottom: "1px solid #e5e7eb"
      }}
    >
      {/* Left: Title */}
      <h3 style={{ fontSize: "16px", fontWeight: "600" }}>
        {getTitle()}
      </h3>

      {/* Right: Actions */}
      <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
        {/* Search */}
        <input
          placeholder="Search..."
          style={{
            padding: "6px 10px",
            borderRadius: "6px",
            border: "1px solid #ddd",
            fontSize: "14px"
          }}
        />

        {/* Quick Action */}
        <button
          style={{
            padding: "6px 12px",
            background: "#2563eb",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer"
          }}
        >
          + Add
        </button>

        {/* User */}
        <div style={{ fontSize: "14px", fontWeight: "500" }}>
          Admin
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          style={{
            padding: "6px 12px",
            background: "#111827",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "14px"
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
}

export default Header;