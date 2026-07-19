import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  getPackages,
  createPackage,
  togglePublishPackage,
  deletePackage
} from "../api/package.api";

function Packages() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const navigate = useNavigate();

  const fetchPackages = async () => {
    try {
      const res = await getPackages();
      setPackages(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  const handleCreate = async () => {
    const name = prompt("Package name (e.g., SSC CGL Tier-1 Sectional Mocks)");
    if (!name) return;
    const type = prompt("Type / exam group (e.g., SSC CGL Tier 1)");
    if (!type) return;

    try {
      setCreating(true);
      const res = await createPackage({ name, type });
      navigate(`/packages/${res.data._id}`);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create package");
    } finally {
      setCreating(false);
    }
  };

  const handlePublish = async (id) => {
    try {
      await togglePublishPackage(id);
      fetchPackages();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to toggle publish");
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete package "${name}"? (mocks are not deleted)`)) return;
    try {
      await deletePackage(id);
      fetchPackages();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete package");
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={{ fontSize: "22px", fontWeight: "600" }}>Packages (Test Series)</h1>
        <button
          onClick={handleCreate}
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
          {creating ? "Creating..." : "+ Create Package"}
        </button>
      </div>

      <div style={{ marginTop: "20px" }}>
        {loading ? (
          <p>Loading packages...</p>
        ) : packages.length === 0 ? (
          <div style={{ padding: "20px", border: "1px dashed #ccc", borderRadius: "6px" }}>
            <p>No packages created yet.</p>
            <p style={{ fontSize: "14px", color: "#666" }}>
              Click "Create Package" to bundle mocks into a series.
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {packages.map((p) => (
              <div
                key={p._id}
                style={{
                  padding: "12px 16px",
                  border: "1px solid #e5e7eb",
                  borderRadius: "6px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "12px"
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <Link
                    to={`/packages/${p._id}`}
                    style={{ textDecoration: "none", fontWeight: "500", color: "#111827" }}
                  >
                    {p.name}
                  </Link>
                  <div style={{ fontSize: "13px", color: "#6b7280", marginTop: "2px" }}>
                    {p.type} · {p.mockCount} {p.mockCount === 1 ? "mock" : "mocks"}
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span
                    style={{
                      fontSize: "12px",
                      padding: "4px 8px",
                      borderRadius: "12px",
                      background: p.isPublished ? "#d1fae5" : "#fef3c7",
                      color: p.isPublished ? "#065f46" : "#92400e"
                    }}
                  >
                    {p.isPublished ? "Published" : "Draft"}
                  </span>

                  <button
                    onClick={() => handlePublish(p._id)}
                    style={btn("#111827")}
                  >
                    {p.isPublished ? "Unpublish" : "Publish"}
                  </button>

                  <button
                    onClick={() => handleDelete(p._id, p.name)}
                    disabled={p.isPublished}
                    title={p.isPublished ? "Unpublish the package before deleting it" : ""}
                    style={{
                      ...btn(p.isPublished ? "#9ca3af" : "#b91c1c"),
                      cursor: p.isPublished ? "not-allowed" : "pointer"
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const btn = (bg) => ({
  padding: "6px 12px",
  background: bg,
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  fontSize: "13px"
});

export default Packages;
