import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createSet } from "../api/set.api";

function CreateSet() {
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleCreate = async () => {
    if (!title.trim()) {
      alert("Title is required");
      return;
    }

    try {
      setLoading(true);

      const res = await createSet(title);

      alert("Set created successfully");

      navigate(`/set/${res.data._id}`);
    } catch (err) {
      alert(err.response?.data?.message || "Error creating set");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "500px", margin: "80px auto" }}>
      <h2>Create New Set</h2>

      <input
        type="text"
        placeholder="Enter set title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        style={{
          width: "100%",
          padding: "10px",
          marginBottom: "10px",
          border: "1px solid #ccc",
          borderRadius: "4px"
        }}
      />

      <button
        onClick={handleCreate}
        disabled={loading}
        style={{
          padding: "10px 16px",
          background: "#3b82f6",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: loading ? "not-allowed" : "pointer"
        }}
      >
        {loading ? "Creating..." : "Create Set"}
      </button>
    </div>
  );
}

export default CreateSet;