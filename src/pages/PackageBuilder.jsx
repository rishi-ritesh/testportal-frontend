import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  getPackageById,
  getAllSets,
  updatePackage,
  togglePublishPackage,
  addSetToPackage,
  removeSetFromPackage
} from "../api/package.api";

// student portal runs on its pinned dev port (see vite.config.js)
const STUDENT_PORTAL_URL = "http://localhost:5173";

function PackageBuilder() {
  const { id } = useParams();

  const [pkg, setPkg] = useState(null);
  const [allSets, setAllSets] = useState([]);
  const [form, setForm] = useState({ name: "", type: "", description: "", order: 0 });
  const [selectedSet, setSelectedSet] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const [pkgRes, setsRes] = await Promise.all([getPackageById(id), getAllSets()]);
    const p = pkgRes.data;
    setPkg(p);
    setForm({
      name: p.name || "",
      type: p.type || "",
      description: p.description || "",
      order: p.order || 0
    });
    setAllSets(setsRes.data || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [id]);

  const handleSave = async () => {
    try {
      setSaving(true);
      await updatePackage(id, form);
      await load();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    try {
      await togglePublishPackage(id);
      await load();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to toggle publish");
    }
  };

  const handleAdd = async () => {
    if (!selectedSet) return;
    try {
      await addSetToPackage(id, selectedSet);
      setSelectedSet("");
      await load();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to add mock");
    }
  };

  const handleRemove = async (setId) => {
    try {
      await removeSetFromPackage(id, setId);
      await load();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to remove mock");
    }
  };

  if (loading) return <p>Loading package...</p>;
  if (!pkg) return <p>Package not found.</p>;

  // A published package is locked — no editing until it's unpublished.
  const locked = pkg.isPublished;

  const inPackageIds = new Set((pkg.setPapers || []).map((s) => s._id));
  const available = allSets.filter((s) => !inPackageIds.has(s._id));

  return (
    <div style={{ maxWidth: "760px" }}>
      <Link to="/packages" style={{ fontSize: "14px", color: "#6b7280", textDecoration: "none" }}>
        ← Back to Packages
      </Link>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "12px" }}>
        <h1 style={{ fontSize: "22px", fontWeight: "600" }}>Edit Package</h1>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <span
            style={{
              fontSize: "12px", padding: "4px 8px", borderRadius: "12px",
              background: pkg.isPublished ? "#d1fae5" : "#fef3c7",
              color: pkg.isPublished ? "#065f46" : "#92400e"
            }}
          >
            {pkg.isPublished ? "Published" : "Draft"}
          </span>

          <a
            href={`${STUDENT_PORTAL_URL}/packages/${id}`}
            target="_blank"
            rel="noreferrer"
            title={pkg.isPublished ? "Open this series in the student portal" : "Publish the package to make it visible to students"}
            style={{
              ...btn("#374151"),
              textDecoration: "none",
              opacity: pkg.isPublished ? 1 : 0.55
            }}
          >
            View in student portal ↗
          </a>

          <button onClick={handlePublish} style={btn("#111827")}>
            {pkg.isPublished ? "Unpublish" : "Publish"}
          </button>
        </div>
      </div>

      {locked && (
        <div
          style={{
            marginTop: "14px",
            padding: "10px 14px",
            borderRadius: "6px",
            background: "#ecfdf5",
            border: "1px solid #a7f3d0",
            color: "#065f46",
            fontSize: "14px"
          }}
        >
          🔒 This package is published and locked. Unpublish it to edit details or change its mocks.
        </div>
      )}

      {/* Details */}
      <div style={card}>
        <Field label="Name">
          <input style={input} value={form.name} disabled={locked} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </Field>
        <Field label="Type / exam group">
          <input style={input} value={form.type} disabled={locked} onChange={(e) => setForm({ ...form, type: e.target.value })} />
        </Field>
        <Field label="Description">
          <textarea
            style={{ ...input, height: "70px", resize: "vertical" }}
            value={form.description}
            disabled={locked}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </Field>
        <Field label="Order (lower shows first)">
          <input
            type="number" style={{ ...input, width: "120px" }}
            value={form.order}
            disabled={locked}
            onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
          />
        </Field>
        {!locked && (
          <button onClick={handleSave} disabled={saving} style={{ ...btn("#2563eb"), marginTop: "6px" }}>
            {saving ? "Saving..." : "Save details"}
          </button>
        )}
      </div>

      {/* Mocks */}
      <div style={card}>
        <h2 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "12px" }}>
          Mocks in this package ({(pkg.setPapers || []).length})
          <span style={{ fontSize: "13px", fontWeight: 400, color: "#6b7280", marginLeft: "8px" }}>
            {(pkg.setPapers || []).filter((s) => s.isPublished && s.isActive).length} live to students
          </span>
        </h2>

        {(pkg.setPapers || []).length === 0 ? (
          <p style={{ fontSize: "14px", color: "#6b7280" }}>No mocks added yet.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {pkg.setPapers.map((s) => (
              <div
                key={s._id}
                style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "10px 12px", border: "1px solid #e5e7eb", borderRadius: "6px"
                }}
              >
                <span style={{ fontWeight: 500 }}>
                  {s.title}
                  {!s.isPublished && (
                    <span style={{ marginLeft: "8px", fontSize: "12px", color: "#92400e" }}>
                      (draft — hidden from students)
                    </span>
                  )}
                </span>
                {!locked && (
                  <button onClick={() => handleRemove(s._id)} style={btn("#b91c1c")}>Remove</button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Add mock */}
        {!locked && (
          <>
            <div style={{ display: "flex", gap: "8px", marginTop: "14px" }}>
              <select
                value={selectedSet}
                onChange={(e) => setSelectedSet(e.target.value)}
                style={{ ...input, flex: 1 }}
              >
                <option value="">Select a mock to add…</option>
                {available.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.title}{s.isPublished ? "" : " (draft)"}
                  </option>
                ))}
              </select>
              <button onClick={handleAdd} disabled={!selectedSet} style={btn("#16a34a")}>
                Add mock
              </button>
            </div>
            {available.length === 0 && (
              <p style={{ fontSize: "13px", color: "#6b7280", marginTop: "8px" }}>
                All sets are already in this package.
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: "14px" }}>
      <label style={{ display: "block", fontSize: "13px", color: "#374151", marginBottom: "4px" }}>{label}</label>
      {children}
    </div>
  );
}

const card = {
  marginTop: "16px",
  padding: "18px",
  border: "1px solid #e5e7eb",
  borderRadius: "8px",
  background: "#fff"
};

const input = {
  width: "100%",
  padding: "8px 10px",
  border: "1px solid #d1d5db",
  borderRadius: "6px",
  fontSize: "14px",
  boxSizing: "border-box"
};

const btn = (bg) => ({
  padding: "8px 14px",
  background: bg,
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  fontSize: "14px"
});

export default PackageBuilder;
