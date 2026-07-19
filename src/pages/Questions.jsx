import { useEffect, useState } from "react";
import { getSubjects } from "../api/subject.api";
import { getTopicsBySubject } from "../api/topic.api";
import {
  createQuestion,
  getQuestionsByTopic,
  updateQuestion,
  deleteQuestion
} from "../api/question.api";

const generateOptionKey = (index) => String.fromCharCode(65 + index); // A, B, C...
const PAGE_SIZE = 8;
const normalize = (t) => String(t || "").trim().toLowerCase().replace(/\s+/g, " ");

const blankOptions = () => [
  { key: "A", text: { en: "", hi: "" } },
  { key: "B", text: { en: "", hi: "" } },
  { key: "C", text: { en: "", hi: "" } },
  { key: "D", text: { en: "", hi: "" } }
];

function Questions() {
  const [subjects, setSubjects] = useState([]);
  const [topics, setTopics] = useState([]);
  const [questions, setQuestions] = useState([]);

  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("");

  const [questionText, setQuestionText] = useState({ en: "", hi: "" });
  const [explanation, setExplanation] = useState({ en: "", hi: "" });
  const [options, setOptions] = useState(blankOptions());
  const [correctAnswer, setCorrectAnswer] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    const res = await getSubjects();
    setSubjects(res.data);
  };

  const fetchTopics = async (subjectId) => {
    const res = await getTopicsBySubject(subjectId);
    setTopics(res.data);
  };

  const fetchQuestions = async (topicId) => {
    const res = await getQuestionsByTopic(topicId);
    setQuestions(res.data);
  };

  const resetForm = () => {
    setEditingId(null);
    setQuestionText({ en: "", hi: "" });
    setExplanation({ en: "", hi: "" });
    setCorrectAnswer("");
    setOptions(blankOptions());
  };

  const handleSubjectChange = async (e) => {
    const subjectId = e.target.value;
    setSelectedSubject(subjectId);
    setSelectedTopic("");
    setQuestions([]);
    setTopics([]);
    setSearch("");
    setPage(1);
    resetForm();
    if (subjectId) await fetchTopics(subjectId);
  };

  const handleTopicChange = async (e) => {
    const topicId = e.target.value;
    setSelectedTopic(topicId);
    setSearch("");
    setPage(1);
    resetForm();
    if (topicId) await fetchQuestions(topicId);
  };

  const handleOptionChange = (index, field, value) => {
    const updated = [...options];
    updated[index] = { ...updated[index], text: { ...updated[index].text, [field]: value } };
    setOptions(updated);
  };

  const addOption = () => {
    setOptions([...options, { key: generateOptionKey(options.length), text: { en: "", hi: "" } }]);
  };

  const removeOption = (index) => {
    if (options.length <= 2) return;
    const removedKey = options[index].key;
    const reassigned = options
      .filter((_, i) => i !== index)
      .map((opt, i) => ({ ...opt, key: generateOptionKey(i) }));
    setOptions(reassigned);
    if (correctAnswer === removedKey) setCorrectAnswer("");
  };

  const startEdit = (q) => {
    setEditingId(q._id);
    setQuestionText({ en: q.question?.en || "", hi: q.question?.hi || "" });
    setExplanation({ en: q.explanation?.en || "", hi: q.explanation?.hi || "" });
    setOptions((q.options || []).map((o) => ({ key: o.key, text: { en: o.text?.en || "", hi: o.text?.hi || "" } })));
    setCorrectAnswer(q.correctAnswer || "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async () => {
    if (!selectedSubject || !selectedTopic) return alert("Select subject and topic");

    if (!questionText.en.trim() || !questionText.hi.trim())
      return alert("Question is required in both English and Hindi");

    const incompleteOption = options.find((o) => !o.text.en.trim() || !o.text.hi.trim());
    if (incompleteOption)
      return alert(`Option ${incompleteOption.key} needs text in both English and Hindi`);

    if (!correctAnswer) return alert("Select the correct answer");

    if (!explanation.en.trim() || !explanation.hi.trim())
      return alert("Explanation is required in both English and Hindi");

    // Duplicate warning (only when creating) — checked within this topic.
    if (!editingId) {
      const dup = questions.find((q) => normalize(q.question?.en) === normalize(questionText.en));
      if (dup && !window.confirm("A question with the same text already exists in this topic. Create anyway?"))
        return;
    }

    const payload = {
      subjectId: selectedSubject,
      topicId: selectedTopic,
      question: questionText,
      options,
      correctAnswer,
      explanation
    };

    try {
      setSaving(true);
      if (editingId) {
        await updateQuestion(editingId, payload);
        alert("Question updated");
      } else {
        await createQuestion(payload);
        alert("Question created");
      }
      resetForm();
      fetchQuestions(selectedTopic);
    } catch (err) {
      alert(err.response?.data?.message || "Error saving question");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this question?")) return;
    try {
      const res = await deleteQuestion(id);
      if (editingId === id) resetForm();
      fetchQuestions(selectedTopic);
      if (res?.data?.message) alert(res.data.message);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete question");
    }
  };

  // ----- derived list (search + pagination) -----
  const filtered = questions.filter((q) =>
    normalize(q.question?.en).includes(normalize(search))
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <div style={{ maxWidth: "860px" }}>
      <h1 style={{ fontSize: "22px", fontWeight: 600, marginBottom: "16px" }}>Questions</h1>

      {/* Subject / Topic pickers */}
      <div style={card}>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <div>
            <label style={label}>Subject</label>
            <select value={selectedSubject} onChange={handleSubjectChange} style={input}>
              <option value="">Select Subject</option>
              {subjects.map((sub) => (
                <option key={sub._id} value={sub._id}>{sub.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={label}>Topic</label>
            <select value={selectedTopic} onChange={handleTopicChange} style={input} disabled={!selectedSubject}>
              <option value="">Select Topic</option>
              {topics.map((topic) => (
                <option key={topic._id} value={topic._id}>{topic.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {!selectedTopic ? (
        <div style={{ ...card, color: "#6b7280", fontSize: "14px" }}>
          Pick a subject and topic to add or manage its questions.
        </div>
      ) : (
        <>
          {/* Create / Edit form */}
          <div style={card}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 600 }}>
                {editingId ? "Edit Question" : "Create Question"}
              </h3>
              {editingId && (
                <button onClick={resetForm} style={btn("#6b7280")}>Cancel edit</button>
              )}
            </div>

            <label style={label}>Question (English)</label>
            <textarea style={textarea} value={questionText.en}
              onChange={(e) => setQuestionText({ ...questionText, en: e.target.value })} />

            <label style={label}>Question (Hindi)</label>
            <textarea style={textarea} value={questionText.hi}
              onChange={(e) => setQuestionText({ ...questionText, hi: e.target.value })} />

            <label style={{ ...label, marginTop: "10px" }}>Options (select the correct one)</label>
            {options.map((opt, index) => (
              <div key={index} style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                <input type="radio" checked={correctAnswer === opt.key}
                  onChange={() => setCorrectAnswer(opt.key)} title="Mark as correct" />
                <strong style={{ width: "16px" }}>{opt.key}</strong>
                <input style={{ ...input, flex: 1, margin: 0 }} placeholder="English"
                  value={opt.text.en} onChange={(e) => handleOptionChange(index, "en", e.target.value)} />
                <input style={{ ...input, flex: 1, margin: 0 }} placeholder="Hindi"
                  value={opt.text.hi} onChange={(e) => handleOptionChange(index, "hi", e.target.value)} />
                {options.length > 2 && (
                  <button onClick={() => removeOption(index)} style={btn("#b91c1c")}>✕</button>
                )}
              </div>
            ))}
            <button onClick={addOption} style={{ ...btn("#374151"), marginTop: "2px" }}>+ Add Option</button>

            <label style={{ ...label, marginTop: "14px" }}>Explanation (English)</label>
            <textarea style={textarea} value={explanation.en}
              onChange={(e) => setExplanation({ ...explanation, en: e.target.value })} />

            <label style={label}>Explanation (Hindi)</label>
            <textarea style={textarea} value={explanation.hi}
              onChange={(e) => setExplanation({ ...explanation, hi: e.target.value })} />

            <button onClick={handleSubmit} disabled={saving}
              style={{ ...btn("#2563eb"), marginTop: "12px" }}>
              {saving ? "Saving..." : editingId ? "Update Question" : "Save Question"}
            </button>
          </div>

          {/* Existing questions */}
          <div style={card}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
              <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 600 }}>
                Existing Questions ({filtered.length})
              </h3>
              <input
                placeholder="Search (English)…"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                style={{ ...input, margin: 0, width: "220px" }}
              />
            </div>

            {filtered.length === 0 ? (
              <p style={{ fontSize: "14px", color: "#6b7280", margin: 0 }}>
                {questions.length === 0 ? "No questions yet." : "No questions match your search."}
              </p>
            ) : (
              <>
                <table style={tbl}>
                  <thead>
                    <tr>
                      <th style={th}>English</th>
                      <th style={{ ...th, width: "70px" }}>Correct</th>
                      <th style={{ ...th, width: "180px" }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pageItems.map((q) => (
                      <tr key={q._id}>
                        <td style={td}>{q.question.en}</td>
                        <td style={td}>{q.correctAnswer}</td>
                        <td style={td}>
                          {q.locked ? (
                            <span
                              title={`Unpublish to change. Used in: ${(q.lockedInSets || []).join(", ")}`}
                              style={{ fontSize: "12px", color: "#92400e" }}
                            >
                              🔒 In: <strong>{(q.lockedInSets || []).join(", ")}</strong>
                            </span>
                          ) : (
                            <div style={{ display: "flex", gap: "6px" }}>
                              <button onClick={() => startEdit(q)} style={btn("#10b981")}>Edit</button>
                              <button onClick={() => handleDelete(q._id)} style={btn("#b91c1c")}>Delete</button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {totalPages > 1 && (
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", marginTop: "12px" }}>
                    <button onClick={() => setPage(currentPage - 1)} disabled={currentPage <= 1} style={btn("#374151")}>
                      ← Prev
                    </button>
                    <span style={{ fontSize: "13px", color: "#6b7280" }}>
                      Page {currentPage} of {totalPages}
                    </span>
                    <button onClick={() => setPage(currentPage + 1)} disabled={currentPage >= totalPages} style={btn("#374151")}>
                      Next →
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}

const card = {
  marginTop: "16px",
  padding: "18px",
  border: "1px solid #e5e7eb",
  borderRadius: "10px",
  background: "#fff"
};

const label = { display: "block", fontSize: "13px", color: "#374151", margin: "8px 0 4px" };

const input = {
  padding: "8px 10px",
  border: "1px solid #d1d5db",
  borderRadius: "6px",
  fontSize: "14px",
  minWidth: "200px",
  boxSizing: "border-box"
};

const textarea = {
  width: "100%",
  padding: "8px 10px",
  border: "1px solid #d1d5db",
  borderRadius: "6px",
  fontSize: "14px",
  minHeight: "56px",
  resize: "vertical",
  boxSizing: "border-box"
};

const btn = (bg) => ({
  padding: "6px 12px",
  background: bg,
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  fontSize: "13px"
});

const tbl = { width: "100%", borderCollapse: "collapse", fontSize: "13.5px" };
const th = { textAlign: "left", padding: "8px 10px", background: "#f9fafb", borderBottom: "2px solid #e5e7eb", color: "#374151" };
const td = { padding: "8px 10px", borderBottom: "1px solid #f3f4f6", color: "#374151", verticalAlign: "top", lineHeight: 1.5 };

export default Questions;
