import { useEffect, useState } from "react";
import { getSubjects } from "../api/subject.api";
import {
  getTopicsBySubject,
  createTopic,
  updateTopic,
  deleteTopic
} from "../api/topic.api";

function Topics() {
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [topics, setTopics] = useState([]);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");

  // _id of the row being renamed inline, plus the value being typed.
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState("");
  const [saving, setSaving] = useState(false);

  // Fetch subjects on load
  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const res = await getSubjects();
      setSubjects(res.data);
    } catch {
      console.error("Failed to fetch subjects");
    }
  };

  const fetchTopics = async (subjectId) => {
    try {
      const res = await getTopicsBySubject(subjectId);
      setTopics(res.data);
    } catch {
      console.error("Failed to fetch topics");
    }
  };

  const handleSubjectChange = (e) => {
    const subjectId = e.target.value;
    setSelectedSubject(subjectId);
    cancelEdit();
    if (subjectId) {
      fetchTopics(subjectId);
    } else {
      setTopics([]);
    }
  };

  const handleCreate = async () => {
    if (!selectedSubject) return alert("Select subject first");
    if (!name.trim() || !slug.trim()) return alert("All fields required");

    try {
      await createTopic({
        subjectId: selectedSubject,
        name,
        slug
      });

      setName("");
      setSlug("");
      fetchTopics(selectedSubject);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create topic");
    }
  };

  const startEdit = (topic) => {
    setEditingId(topic._id);
    setEditingName(topic.name);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingName("");
  };

  // Only the display name is editable. The slug is baked into every
  // questionCode generated under this topic, so the API refuses to change it
  // once questions exist.
  const handleSaveEdit = async (id) => {
    if (!editingName.trim()) return alert("Topic name required");

    try {
      setSaving(true);
      await updateTopic(id, { name: editingName.trim() });
      cancelEdit();
      fetchTopics(selectedSubject);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to rename topic");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this topic?");
    if (!confirmDelete) return;

    try {
      await deleteTopic(id);
      fetchTopics(selectedSubject);
    } catch {
      alert("Failed to delete topic");
    }
  };


  return (
    <div>
      <h1>Topics</h1>

      {/* Subject Dropdown */}
      <div style={{ marginBottom: "20px" }}>
        <select
          value={selectedSubject}
          onChange={handleSubjectChange}
        >
          <option value="">Select Subject</option>
          {subjects.map((sub) => (
            <option key={sub._id} value={sub._id}>
              {sub.name}
            </option>
          ))}
        </select>
      </div>

      {/* Create Topic */}
      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Topic name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          type="text"
          placeholder="Slug"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
        />

        <button onClick={handleCreate}>Create Topic</button>
      </div>

      {/* Topics Table */}
      <table border="1" cellPadding="10">
        <thead>
          <tr>
            <th>Name</th>
            <th>Slug</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {topics.length === 0 ? (
            <tr>
              <td colSpan="3">No topics found</td>
            </tr>
          ) : (
            topics.map((topic) => {
              const isEditing = editingId === topic._id;

              return (
                <tr key={topic._id}>
                  <td>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editingName}
                        autoFocus
                        onChange={(e) => setEditingName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSaveEdit(topic._id);
                          if (e.key === "Escape") cancelEdit();
                        }}
                        style={{ padding: "6px" }}
                      />
                    ) : (
                      topic.name
                    )}
                  </td>

                  <td title="Slug is fixed — question codes are built from it">
                    {topic.slug}
                  </td>

                  <td style={{ display: "flex", gap: "6px" }}>
                    {isEditing ? (
                      <>
                        <button
                          onClick={() => handleSaveEdit(topic._id)}
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
                        <button onClick={() => startEdit(topic)}>Rename</button>
                        <button onClick={() => handleDelete(topic._id)}>
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

export default Topics;
