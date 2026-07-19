import { Link, useLocation } from "react-router-dom";

// Shown for any admin URL that doesn't match a real route. Makes a wrong/stale
// link obvious instead of silently falling back to the Dashboard.
function NotFound() {
  const location = useLocation();

  return (
    <div
      style={{
        minHeight: "60vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        color: "#374151"
      }}
    >
      <div style={{ fontSize: "56px", fontWeight: 700, color: "#111827" }}>404</div>
      <h1 style={{ fontSize: "20px", margin: "8px 0 6px" }}>Page not found</h1>
      <p style={{ fontSize: "14px", color: "#6b7280", margin: 0 }}>
        There's no admin page at{" "}
        <code style={{ background: "#f3f4f6", padding: "2px 6px", borderRadius: "4px" }}>
          {location.pathname}
        </code>
        .
      </p>
      <p style={{ fontSize: "13px", color: "#9ca3af", margin: "6px 0 20px" }}>
        Check the address, or use the sidebar to get back on track.
      </p>
      <Link
        to="/"
        style={{
          padding: "9px 16px",
          background: "#111827",
          color: "white",
          borderRadius: "6px",
          textDecoration: "none",
          fontSize: "14px"
        }}
      >
        ← Back to Dashboard
      </Link>
    </div>
  );
}

export default NotFound;
