import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api/axios";
import { createSet } from "../api/set.api";

function Sets() {
  const [sets, setSets] = useState([]);
  const [creating, setCreating] = useState(false);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const fetchSets = async () => {
    try {
      const res = await API.get("/api/admin/sets");
      setSets(res.data);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSet = async () => {
    const title = prompt("Enter set title"); // we’ll replace this later

    if (!title) return;

    try {
      setCreating(true);
      const res = await createSet(title);
      navigate(`/sets/${res.data._id}`);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create set");
    } finally {
      setCreating(false);
    }
  };

  useEffect(() => {
    fetchSets();
  }, []);

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={{ fontSize: "22px", fontWeight: "600" }}>Sets</h1>

        <button
          onClick={handleCreateSet}
          disabled={creating}
          style={{
            padding: "8px 16px",
            background: "#2563eb",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: creating ? "not-allowed" : "pointer"
          }}
        >
          {creating ? "Creating..." : "+ Create Set"}
        </button>
      </div>

      {/* Content */}
      <div style={{ marginTop: "20px" }}>
        {loading ? (
          <p>Loading sets...</p>
        ) : sets.length === 0 ? (
          <div style={{ padding: "20px", border: "1px dashed #ccc", borderRadius: "6px" }}>
            <p>No sets created yet.</p>
            <p style={{ fontSize: "14px", color: "#666" }}>
              Click "Create Set" to get started.
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {sets.map((set) => {
              const unassigned = !set.packages || set.packages.length === 0;

              return (
                <div
                  key={set._id}
                  style={{
                    padding: "12px 16px",
                    border: unassigned ? "1px dashed #d1d5db" : "1px solid #e5e7eb",
                    borderRadius: "6px",
                    background: unassigned ? "#fafafa" : "#ffffff",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <Link
                      to={`/sets/${set._id}`}
                      style={{ textDecoration: "none", fontWeight: "500", color: "#111827" }}
                    >
                      {set.title}
                    </Link>

                    {unassigned ? (
                      <span
                        style={{
                          fontSize: "12px",
                          fontStyle: "italic",
                          padding: "4px 8px",
                          borderRadius: "12px",
                          border: "1px dashed #d1d5db",
                          background: "transparent",
                          color: "#9ca3af"
                        }}
                      >
                        No package
                      </span>
                    ) : (
                      set.packages.map((name) => (
                        <span
                          key={name}
                          style={{
                            fontSize: "12px",
                            padding: "4px 8px",
                            borderRadius: "12px",
                            background: "#e0e7ff",
                            color: "#3730a3"
                          }}
                        >
                          {name}
                        </span>
                      ))
                    )}
                  </div>

                  <span
                    style={{
                      fontSize: "12px",
                      padding: "4px 8px",
                      borderRadius: "12px",
                      background: set.isPublished ? "#d1fae5" : "#fef3c7",
                      color: set.isPublished ? "#065f46" : "#92400e"
                    }}
                  >
                    {set.isPublished ? "Published" : "Draft"}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default Sets;