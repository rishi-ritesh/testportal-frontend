import { useEffect, useState } from "react";
import { getSubjects, createSubject, deleteSubject } from "../api/subject.api";

function Subjects() {
  const [subjects, setSubjects] = useState([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

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
      await createSubject({ name });
      setName("");
      fetchSubjects();
    } catch (err) {
      console.error("Create failed", err);
      alert("Failed to create subject");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmCascade = window.confirm(
      "Do you also want to delete all topics under this subject?\n\nPress OK for YES.\nPress Cancel for NO."
    );

    try {
      await deleteSubject(id, confirmCascade);
      fetchSubjects();
    } catch (err) {
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
            subjects.map((sub) => (
              <tr key={sub._id}>
                <td>{sub.name}</td>
                <td>{sub.slug}</td>
                <td>
                  <button onClick={() => handleDelete(sub._id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default Subjects;
