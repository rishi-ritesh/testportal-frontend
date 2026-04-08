import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api/axios";
import { createSet } from "../api/set.api";

function Sets() {
  const [sets, setSets] = useState([]);

  const [creating, setCreating] = useState(false);
  const navigate = useNavigate();

  const fetchSets = async () => {
    const res = await API.get("/api/admin/sets");
    setSets(res.data);
  };

  const handleCreateSet = async () => {
    const title = prompt("Enter set title");

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
      <h1>Sets</h1>

      <button
        onClick={handleCreateSet}
        disabled={creating}
        style={{
          padding: "8px 14px",
          background: "#10b981",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: creating ? "not-allowed" : "pointer",
          marginBottom: "15px"
        }}
      >
        {creating ? "Creating..." : "Create Set"}
      </button>
      
      <ul>
        {sets.map((set) => (
          <li key={set._id}>
            <Link to={`/sets/${set._id}`}>
              {set.title}
            </Link>
            {" "}
            {set.isPublished ? "(Published)" : "(Draft)"}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Sets;
