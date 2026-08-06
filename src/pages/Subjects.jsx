import { useEffect, useState } from "react";
import {
  getSubjects,
  createSubject,
  updateSubject,
  deleteSubject
} from "../api/subject.api";

function Subjects() {
  const [subjects, setSubjects] = useState([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  // _id of the row being renamed inline, plus the value being typed.
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchSubjects = async () => {
    try {
      const res = await getSubjects();
      setSubjects(res.data);
    } catch (err) {
      console.error("Error fetching subjects", err);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  const handleCreate = async () => {
    if (!name.trim()) return alert("Subject name required");

    try {
      setLoading(true);

      const slug = name.toLowerCase().replace(/\s+/g, "-");

      await createSubject({
        name,
        slug
      });

      setName("");
      fetchSubjects();
    } catch (err) {
      console.error("Create failed", err);
      alert(err.response?.data?.message || "Failed to create subject");
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (subject) => {
    setEditingId(subject._id);
    setEditingName(subject.name);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingName("");
  };

  // Only the display name is editable here. The slug is baked into every
  // questionCode generated under this subject, so the API refuses to change it
  // once questions exist.
  const handleSaveEdit = async (id) => {
    if (!editingName.trim()) return alert("Subject name required");

    try {
      setSaving(true);
      await updateSubject(id, { name: editingName.trim() });
      cancelEdit();
      fetchSubjects();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to rename subject");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmCascade = window.confirm(
      "Do you also want to delete all topics under this subject?\n\nPress OK for YES.\nPress Cancel for NO."
    );

    try {
      await deleteSubject(id, confirmCascade);
      fetchSubjects();
    } catch {
      alert("Delete failed");
    }
  };

  return (
    <div>
      <h1>Subjects</h1>

      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Subject name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ padding: "8px", marginRight: "10px" }}
        />
        <button onClick={handleCreate} disabled={loading}>
          {loading ? "Creating..." : "Create Subject"}
        </button>
      </div>

      <table border="1" cellPadding="10">
        <thead>
          <tr>
            <th>Name</th>
            <th>Slug</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {subjects.length === 0 ? (
            <tr>
              <td colSpan="3">No subjects found</td>
            </tr>
          ) : (
            subjects.map((sub) => {
              const isEditing = editingId === sub._id;

              return (
                <tr key={sub._id}>
                  <td>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editingName}
                        autoFocus
                        onChange={(e) => setEditingName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSaveEdit(sub._id);
                          if (e.key === "Escape") cancelEdit();
                        }}
                        style={{ padding: "6px" }}
                      />
                    ) : (
                      sub.name
                    )}
                  </td>

                  <td title="Slug is fixed — question codes are built from it">
                    {sub.slug}
                  </td>

                  <td style={{ display: "flex", gap: "6px" }}>
                    {isEditing ? (
                      <>
                        <button
                          onClick={() => handleSaveEdit(sub._id)}
                          disabled={saving}
                        >
                          {saving ? "Saving..." : "Save"}
                        </button>
                        <button onClick={cancelEdit} disabled={saving}>
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => startEdit(sub)}>Rename</button>
                        <button onClick={() => handleDelete(sub._id)}>
                          Delete
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

export default Subjects;
