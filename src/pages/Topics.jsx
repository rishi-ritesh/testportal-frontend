import { useEffect, useState } from "react";
import { getSubjects } from "../api/subject.api";
import { getTopicsBySubject, createTopic, deleteTopic } from "../api/topic.api";

function Topics() {
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [topics, setTopics] = useState([]);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");

  // Fetch subjects on load
  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const res = await getSubjects();
      setSubjects(res.data);
    } catch (err) {
      console.error("Failed to fetch subjects");
    }
  };

  const fetchTopics = async (subjectId) => {
    try {
      const res = await getTopicsBySubject(subjectId);
      setTopics(res.data);
    } catch (err) {
      console.error("Failed to fetch topics");
    }
  };

  const handleSubjectChange = (e) => {
    const subjectId = e.target.value;
    setSelectedSubject(subjectId);
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
      alert("Failed to create topic");
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this topic?");
    if (!confirmDelete) return;

    try {
      await deleteTopic(id);
      fetchTopics(selectedSubject);
    } catch (err) {
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
              <td colSpan="2">No topics found</td>
            </tr>
          ) : (
            topics.map((topic) => (
              <tr key={topic._id}>
                <td>{topic.name}</td>
                <td>{topic.slug}</td>
                <td>
                  <button onClick={() => handleDelete(topic._id)}>
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

export default Topics;
