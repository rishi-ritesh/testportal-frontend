import { Link } from "react-router-dom";

function Sidebar() {
  return (
    <div
      style={{
        width: "220px",
        background: "#1f2937",
        color: "white",
        padding: "20px"
      }}
    >
      <h2>Admin Panel</h2>

      <nav style={{ marginTop: "20px", display: "flex", flexDirection: "column", gap: "10px" }}>
        <Link to="/" style={{ color: "white" }}>Dashboard</Link>
        <Link to="/subjects" style={{ color: "white" }}>Subjects</Link>
        <Link to="/topics" style={{ color: "white" }}>Topics</Link>
        <Link to="/questions" style={{ color: "white" }}>Questions</Link>
        <Link to="/mocks" style={{ color: "white" }}>Mocks</Link>
      </nav>
    </div>
  );
}

export default Sidebar;
