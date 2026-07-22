import { useEffect, useMemo, useState } from "react";
import {
  getStudents,
  toggleStudentActive,
  deleteStudent,
} from "../api/student.api";

const PAGE_SIZE = 12;

const formatDate = (value) => {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleDateString(undefined, {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "—";
  }
};

function Students() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const fetchStudents = async () => {
    try {
      const res = await getStudents();
      setStudents(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return students;
    return students.filter(
      (s) =>
        s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q)
    );
  }, [students, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const handleToggle = async (s) => {
    try {
      setBusyId(s._id);
      const res = await toggleStudentActive(s._id);
      setStudents((list) =>
        list.map((x) =>
          x._id === s._id ? { ...x, isActive: res.data.isActive } : x
        )
      );
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update student");
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (s) => {
    if (
      !window.confirm(
        `Delete "${s.name}"? This permanently removes the student and all their attempts. This cannot be undone.`
      )
    )
      return;
    try {
      setBusyId(s._id);
      await deleteStudent(s._id);
      setStudents((list) => list.filter((x) => x._id !== s._id));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete student");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px" }}>
        <h1 style={{ fontSize: "22px", fontWeight: 600 }}>
          Students{" "}
          <span style={{ fontSize: "14px", color: "#6b7280", fontWeight: 400 }}>
            ({students.length})
          </span>
        </h1>
        <input
          placeholder="Search by name or email…"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          style={input}
        />
      </div>

      <div style={{ marginTop: "20px" }}>
        {loading ? (
          <p>Loading students...</p>
        ) : filtered.length === 0 ? (
          <div style={{ padding: "20px", border: "1px dashed #ccc", borderRadius: "6px" }}>
            <p>{students.length === 0 ? "No students yet." : "No students match your search."}</p>
          </div>
        ) : (
          <div style={{ overflowX: "auto", border: "1px solid #e5e7eb", borderRadius: "8px" }}>
            <table style={tbl}>
              <thead>
                <tr>
                  <th style={th}>Name</th>
                  <th style={th}>Email</th>
                  <th style={th}>Attempts</th>
                  <th style={th}>Joined</th>
                  <th style={th}>Status</th>
                  <th style={{ ...th, textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pageItems.map((s) => (
                  <tr key={s._id}>
                    <td style={td}>{s.name}</td>
                    <td style={td}>{s.email}</td>
                    <td style={td}>{s.attemptCount}</td>
                    <td style={td}>{formatDate(s.createdAt)}</td>
                    <td style={td}>
                      <span
                        style={{
                          fontSize: "12px",
                          padding: "3px 8px",
                          borderRadius: "12px",
                          background: s.isActive ? "#d1fae5" : "#fee2e2",
                          color: s.isActive ? "#065f46" : "#991b1b",
                        }}
                      >
                        {s.isActive ? "Active" : "Blocked"}
                      </span>
                    </td>
                    <td style={{ ...td, textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: "8px" }}>
                        <button
                          onClick={() => handleToggle(s)}
                          disabled={busyId === s._id}
                          style={btn(s.isActive ? "#b45309" : "#16a34a")}
                        >
                          {s.isActive ? "Block" : "Unblock"}
                        </button>
                        <button
                          onClick={() => handleDelete(s)}
                          disabled={busyId === s._id}
                          style={btn("#b91c1c")}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "12px", marginTop: "16px" }}>
            <button onClick={() => setPage(currentPage - 1)} disabled={currentPage <= 1} style={pageBtn}>
              ← Prev
            </button>
            <span style={{ fontSize: "13px", color: "#6b7280" }}>
              Page {currentPage} of {totalPages}
            </span>
            <button onClick={() => setPage(currentPage + 1)} disabled={currentPage >= totalPages} style={pageBtn}>
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const input = {
  padding: "8px 10px",
  border: "1px solid #d1d5db",
  borderRadius: "6px",
  fontSize: "14px",
  width: "260px",
};

const tbl = { width: "100%", borderCollapse: "collapse", fontSize: "14px", background: "#fff" };
const th = {
  textAlign: "left",
  padding: "10px 12px",
  background: "#f9fafb",
  borderBottom: "1px solid #e5e7eb",
  color: "#374151",
  fontWeight: 600,
};
const td = { padding: "10px 12px", borderBottom: "1px solid #f3f4f6", color: "#374151" };

const btn = (bg) => ({
  padding: "6px 12px",
  background: bg,
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  fontSize: "13px",
});

const pageBtn = {
  padding: "6px 12px",
  background: "white",
  color: "#374151",
  border: "1px solid #d1d5db",
  borderRadius: "6px",
  cursor: "pointer",
  fontSize: "13px",
};

export default Students;
