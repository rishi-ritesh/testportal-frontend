import { NavLink } from "react-router-dom";

function Sidebar() {
  const linkStyle = {
    display: "flex",
    alignItems: "center",
    padding: "10px 12px",
    borderRadius: "6px",
    textDecoration: "none",
    color: "#d1d5db",
    fontSize: "14px"
  };

  const activeStyle = {
    backgroundColor: "#374151",
    color: "#fff"
  };

  return (
    <div
      style={{
        width: "240px",
        background: "#111827",
        color: "white",
        padding: "20px",
        display: "flex",
        flexDirection: "column"
      }}
    >
      {/* Logo / Title */}
      <h2 style={{ fontSize: "18px", fontWeight: "600" }}>
        TestPortal Admin
      </h2>

      {/* Navigation */}
      <nav
        style={{
          marginTop: "30px",
          display: "flex",
          flexDirection: "column",
          gap: "6px"
        }}
      >
        {[
          { name: "Dashboard", path: "/" },
          { name: "Subjects", path: "/subjects" },
          { name: "Topics", path: "/topics" },
          { name: "Questions", path: "/questions" },
          { name: "Sets", path: "/sets" },
          { name: "Packages", path: "/packages" },
          { name: "Guide", path: "/guide" }
        ].map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            style={({ isActive }) =>
              isActive
                ? { ...linkStyle, ...activeStyle }
                : linkStyle
            }
          >
            {item.name}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

export default Sidebar;