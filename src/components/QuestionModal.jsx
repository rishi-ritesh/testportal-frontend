import { useEffect, useState } from "react";
import API from "../api/axios";

function QuestionModal({
  setId,
  sectionName,
  subjectId,
  maxQuestions = 0,
  currentCount = 0,
  onClose,
  onSuccess
}) {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [addingId, setAddingId] = useState(null);

  const [mode, setMode] = useState("create"); // create | existing

  const limitReached = maxQuestions > 0 && currentCount >= maxQuestions;

  /* ================= CREATE FORM STATE ================= */

  const [form, setForm] = useState({
    topicId: "",
    questionEn: "",
    questionHi: "",
    options: [
      { key: "A", en: "", hi: "" },
      { key: "B", en: "", hi: "" },
      { key: "C", en: "", hi: "" },
      { key: "D", en: "", hi: "" }
    ],
    correctAnswer: "",
    explanationEn: "",
    explanationHi: ""
  });

  /* ================= EXISTING SEARCH STATE ================= */

  const [searchText, setSearchText] = useState("");
  const [status, setStatus] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("");
  const [results, setResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  /* ================= FETCH TOPICS ================= */

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const res = await API.get(`/api/admin/topics/${subjectId}`);
        setTopics(res.data);
      } catch {
        alert("Failed to fetch topics");
      }
    };
    fetchTopics();
  }, [subjectId]);

  /* ================= OPTION HANDLING ================= */

  const handleOptionChange = (index, field, value) => {
    const updated = [...form.options];
    updated[index][field] = value;
    setForm({ ...form, options: updated });
  };

  const addOption = () => {
    const nextKey = String.fromCharCode(65 + form.options.length);
    setForm({
      ...form,
      options: [...form.options, { key: nextKey, en: "", hi: "" }]
    });
  };

  const removeOption = (index) => {
    const updated = form.options.filter((_, i) => i !== index);
    setForm({ ...form, options: updated });
  };

  /* ================= CREATE & ADD ================= */

  const handleCreateSubmit = async () => {
    try {
      if (limitReached) return alert("Question limit reached");

      setLoading(true);

      const createRes = await API.post("/api/admin/question", {
        subjectId,
        topicId: form.topicId,
        question: {
          en: form.questionEn,
          hi: form.questionHi
        },
        options: form.options.map((opt) => ({
          key: opt.key,
          text: {
            en: opt.en,
            hi: opt.hi
          }
        })),
        correctAnswer: form.correctAnswer,
        explanation: {
          en: form.explanationEn,
          hi: form.explanationHi
        }
      });

      const questionId = createRes.data._id;

      await API.post(
        `/api/admin/set/${setId}/section/${sectionName}/subject/${subjectId}/question`,
        { questionId }
      );

      alert("Question created and added successfully");

      onSuccess();
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || "Error occurred");
    } finally {
      setLoading(false);
    }
  };

  /* ================= SEARCH EXISTING ================= */

  const handleSearch = async () => {
    try {
      setSearchLoading(true);

      const res = await API.get("/api/admin/questions/search", {
        params: {
          subjectId,
          topicId: selectedTopic,
          q: searchText,
          status
        }
      });

      setResults(res.data);
    } catch {
      alert("Search failed");
    } finally {
      setSearchLoading(false);
    }
  };

  /* ================= ADD EXISTING ================= */

  const handleAddExisting = async (questionId) => {
    try {
      if (limitReached) return alert("Question limit reached");

      setAddingId(questionId);

      await API.post(
        `/api/admin/set/${setId}/section/${sectionName}/subject/${subjectId}/question`,
        { questionId }
      );

      alert("Question added successfully");

      onSuccess();
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || "Error adding question");
    } finally {
      setAddingId(null);
    }
  };

  /* ===================================================== */

  return (
    <div
      style={{
        background: "white",
        padding: "30px",
        width: "850px",
        maxHeight: "90vh",
        overflowY: "auto",
        borderRadius: "10px"
      }}
    >
      <h2 style={{ marginBottom: "20px" }}>Add Question</h2>

      {/* Mode Toggle */}
      <div style={{ marginBottom: "25px" }}>
        <button
          onClick={() => setMode("create")}
          style={{
            marginRight: "10px",
            padding: "8px 14px",
            background: mode === "create" ? "#2563eb" : "#e5e7eb",
            color: mode === "create" ? "white" : "black",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer"
          }}
        >
          Create New
        </button>

        <button
          onClick={() => setMode("existing")}
          style={{
            padding: "8px 14px",
            background: mode === "existing" ? "#2563eb" : "#e5e7eb",
            color: mode === "existing" ? "white" : "black",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer"
          }}
        >
          Add Existing
        </button>
      </div>

      {limitReached && (
        <p style={{ color: "red", fontWeight: "bold" }}>
          Question limit reached for this subject
        </p>
      )}

      {/* ================= CREATE MODE ================= */}
      {mode === "create" && (
        <>
          <label>Topic</label>
          <select
            value={form.topicId}
            onChange={(e) =>
              setForm({ ...form, topicId: e.target.value })
            }
            style={{ width: "100%", marginBottom: "20px" }}
          >
            <option value="">Select Topic</option>
            {topics.map((topic) => (
              <option key={topic._id} value={topic._id}>
                {topic.name}
              </option>
            ))}
          </select>

          <label>Question (English)</label>
          <textarea
            style={{ width: "100%", marginBottom: "10px" }}
            onChange={(e) =>
              setForm({ ...form, questionEn: e.target.value })
            }
          />

          <label>Question (Hindi)</label>
          <textarea
            style={{ width: "100%", marginBottom: "20px" }}
            onChange={(e) =>
              setForm({ ...form, questionHi: e.target.value })
            }
          />

          <h3>Options</h3>

          {form.options.map((opt, index) => (
            <div key={opt.key} style={{ marginBottom: "10px" }}>
              <strong>{opt.key}</strong>

              <input
                placeholder="English"
                style={{ marginLeft: "10px", width: "28%" }}
                onChange={(e) =>
                  handleOptionChange(index, "en", e.target.value)
                }
              />

              <input
                placeholder="Hindi"
                style={{ marginLeft: "10px", width: "28%" }}
                onChange={(e) =>
                  handleOptionChange(index, "hi", e.target.value)
                }
              />

              <input
                type="radio"
                name="correct"
                value={opt.key}
                style={{ marginLeft: "10px" }}
                onChange={() =>
                  setForm({ ...form, correctAnswer: opt.key })
                }
              />

              {form.options.length > 2 && (
                <button
                  onClick={() => removeOption(index)}
                  style={{ marginLeft: "10px" }}
                >
                  Remove
                </button>
              )}
            </div>
          ))}

          <button onClick={addOption}>Add Option</button>

          <h3 style={{ marginTop: "20px" }}>Explanation</h3>

          <textarea
            placeholder="Explanation (English)"
            style={{ width: "100%", marginBottom: "10px" }}
            onChange={(e) =>
              setForm({ ...form, explanationEn: e.target.value })
            }
          />

          <textarea
            placeholder="Explanation (Hindi)"
            style={{ width: "100%", marginBottom: "20px" }}
            onChange={(e) =>
              setForm({ ...form, explanationHi: e.target.value })
            }
          />

          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <button onClick={onClose}>Cancel</button>

            <button
              onClick={handleCreateSubmit}
              disabled={loading || limitReached}
            >
              {loading ? "Processing..." : "Create & Add"}
            </button>
          </div>
        </>
      )}

      {/* ================= EXISTING MODE ================= */}
      {mode === "existing" && (
        <>
          <div style={{ marginBottom: "20px" }}>
            <input
              placeholder="Search English question..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: "40%", marginRight: "10px" }}
            />

            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              style={{ marginRight: "10px" }}
            >
              <option value="">All Topics</option>
              {topics.map((topic) => (
                <option key={topic._id} value={topic._id}>
                  {topic.name}
                </option>
              ))}
            </select>

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              style={{ marginRight: "10px" }}
            >
              <option value="">Both</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            <button onClick={handleSearch}>
              {searchLoading ? "Searching..." : "Search"}
            </button>
          </div>

          {results.map((q) => (
            <div
              key={q._id}
              style={{
                border: "1px solid #ddd",
                padding: "12px",
                marginBottom: "12px",
                borderRadius: "6px"
              }}
            >
              <p style={{ fontWeight: "bold" }}>
                {q.question?.en}
              </p>

              <button
                disabled={limitReached || addingId === q._id}
                onClick={() => handleAddExisting(q._id)}
              >
                {addingId === q._id
                  ? "Adding..."
                  : limitReached
                  ? "Limit Reached"
                  : "Add"}
              </button>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

export default QuestionModal;