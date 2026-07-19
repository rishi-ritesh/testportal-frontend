import API from "../api/axios";
import { useEffect, useState } from "react";
import { searchQuestions, searchQuestionByCode } from "../api/set.api";
import DuplicateQuestionModal from "./DuplicateQuestionModal";
import RichTextEditor from "./RichTextEditor";

function QuestionModal({
  setId,
  sectionName,
  subjectId,
  maxQuestions = 0,
  currentCount = 0,
  onClose,
  onSuccess,
  editQuestion
}) {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [addingId, setAddingId] = useState(null);

  const [mode, setMode] = useState("create"); // create | existing

  const [duplicateData, setDuplicateData] = useState(null);

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
  const [searchMode, setSearchMode] = useState("text"); // text | code
  const [allQuestions, setAllQuestions] = useState([]);

  useEffect(() => {
    if (!editQuestion) return;

    // ✅ DEBUG (remove later)
    console.log("EDIT DATA:", editQuestion);

    // ❗ VERY IMPORTANT: wait until full data is present
    if (
      !editQuestion.question ||
      !editQuestion.options ||
      editQuestion.options.length === 0
    ) {
      return;
    }

    setMode("create");

    setForm({
      topicId:
        typeof editQuestion.topicId === "object"
          ? editQuestion.topicId?._id
          : editQuestion.topicId || "",

      questionEn: editQuestion.question?.en || "",
      questionHi: editQuestion.question?.hi || "",

      options: editQuestion.options.map((opt) => ({
        key: opt.key || "",
        en: opt.text?.en || "",
        hi: opt.text?.hi || ""
      })),

      correctAnswer: editQuestion.correctAnswer || "",

      explanationEn: editQuestion.explanation?.en || "",
      explanationHi: editQuestion.explanation?.hi || ""
    });

  }, [editQuestion]);

  useEffect(() => {
    console.log("FORM STATE:", form);
  }, [form]);

  useEffect(() => {
    setResults([]);
    setSelectedTopic("");
    setSearchText("");
  }, [searchMode]);

  useEffect(() => {
    if (!searchText.trim()) {
      setResults([]);
      return;
    }

    const delay = setTimeout(() => {
      handleSearch();
    }, 400);

    return () => clearTimeout(delay);
  }, [searchText, selectedTopic, status, searchMode]);

  /* ================= FETCH TOPICS ================= */

  useEffect(() => {
    if (!subjectId) return;

    const fetchTopics = async () => {
      try {
        const res = await API.get(`/api/admin/topics/${subjectId}`);
        setTopics(res.data);
      } catch (err) {
        console.error("Topic fetch failed", err);
      }
    };
    fetchTopics();
  }, [subjectId]);

  /* =================================================== */

  useEffect(() => {
    if (!subjectId || editQuestion) return;

    const fetchAll = async () => {
      try {
        const res = await searchQuestions({
          subjectId,
          q: "",
          status: ""
        });

        setAllQuestions(res.data);
        setResults(res.data);
      } catch (err) {
        console.error("Failed to load questions", err);
      }
    };

    fetchAll();
  }, [subjectId, editQuestion]);

  /* ================= OPTION HANDLING ================= */

  // const handleOptionChange = (index, field, value) => {
  //   const updated = [...form.options];
  //   updated[index][field] = value;
  //   setForm({ ...form, options: updated });
  // };

  const handleOptionChange = (index, field, value) => {
    setForm(prev => {
      const updated = [...prev.options];
      updated[index][field] = value;
      return { ...prev, options: updated };
    });
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

  /* ================= Validation Form ===================*/

  const validateForm = () => {
    if (!form.topicId) return "Please select topic";

    // if (!form.questionEn.trim() || !form.questionHi.trim()) {
    //   return "Both English and Hindi questions are required";
    // }

    const isEmptyHTML = (html) => {
      return !html || html.replace(/<[^>]*>/g, "").trim() === "";
    };

    if (isEmptyHTML(form.questionEn) || isEmptyHTML(form.questionHi)) {
      return "Both English and Hindi questions are required";
    }

    if (!form.correctAnswer) {
      return "Please select correct answer";
    }

    if (form.options.length < 2) {
      return "Minimum 2 options required";
    }

    // for (const opt of form.options) {
    //   if (!opt.en.trim() || !opt.hi.trim()) {
    //     return "All options must have English and Hindi text";
    //   }
    // }

    // for (const opt of form.options) {
    //   if (isEmptyHTML(opt.en) || !opt.hi.trim()) {
    //     return "All options must have English and Hindi text";
    //   }
    // }

    for (const opt of form.options) {
      if (isEmptyHTML(opt.en) || isEmptyHTML(opt.hi)) {
        return "All options must have English and Hindi text";
      }
    }

    if (isEmptyHTML(form.explanationEn) || isEmptyHTML(form.explanationHi)) {
      return "Explanation is required in both languages";
    }

    return null;
  };

  /* ================= CREATE & ADD ================= */

  const handleCreateSubmit = async () => {
    try {
      if (limitReached) return alert("Question limit reached");

      // ✅ STEP 1: VALIDATE FIRST
      const error = validateForm();
      if (error) {
        alert(error);
        return;
      }

      setLoading(true);

      // ✅ STEP 2: DUPLICATE CHECK (ONLY FOR CREATE)
      if (!editQuestion) {
        const checkRes = await API.post("/api/admin/set/check-duplicate", {
          setId,
          sectionName,
          subjectId,
          questionText: form.questionEn
        });

        if (checkRes.data.duplicate) {
          setDuplicateData({
            existing: checkRes.data.question,
            inputText: form.questionEn
          });
          setLoading(false);
          return;
        }
      }

      // ✅ STEP 3: EDIT OR CREATE
      if (editQuestion) {
        await updateQuestion();
      } else {
        await createAndAddNew();
      }

    } catch (err) {
      alert(err.response?.data?.message || "Error occurred");
    } finally {
      setLoading(false);
    }
  };

  /* ================= SEARCH EXISTING ================= */

  const handleSearch = async () => {

    if (!searchText.trim()) {
      setResults(allQuestions);
      return;
    }

    const text = searchText.toLowerCase();

    const filtered = allQuestions.filter((q) => {

      // 🔹 FILTER BY TOPIC (if selected)
      if (selectedTopic && q.topicId !== selectedTopic) {
        return false;
      }

      // 🔹 FILTER BY STATUS
      if (status === "active" && !q.isActive) return false;
      if (status === "inactive" && q.isActive) return false;

      if (searchMode === "code") {
        const code = q.questionCode?.toLowerCase() || "";
        return code.includes(text);
      } else {
        const questionText = q.question?.en?.toLowerCase() || "";
        return questionText.includes(text);
      }
    });

    setResults(filtered);
  };
  /* ================= ADD EXISTING ================= */

  const handleAddExisting = async (questionId) => {
    try {
      if (limitReached) return alert("Question limit reached");

      setAddingId(questionId);

      const res = await API.post(
        `/api/admin/set/${setId}/section/${sectionName}/subject/${subjectId}/question`,
        { questionId }
      );

      // 🔥 HANDLE DUPLICATE PROPERLY
      if (res.data?.requiresConfirmation) {
        const ok = window.confirm(res.data.message);

        if (!ok) {
          setAddingId(null);
          return;
        }

        // retry with force
        await API.post(
          `/api/admin/set/${setId}/section/${sectionName}/subject/${subjectId}/question`,
          { questionId, force: true }
        );
      }

      alert("Question added successfully");

      // ✅ refresh + close
      onSuccess();
      onClose();

    } catch (err) {
      // alert(err.response?.data?.message || "Error adding question");

      const msg = err.response?.data?.message;

      if (err.response?.data?.requiresConfirmation) {
        const ok = window.confirm(msg);

        if (ok) {
          await API.post(
            `/api/admin/set/${setId}/section/${sectionName}/subject/${subjectId}/question`,
            { questionId, force: true }
          );
          onSuccess();
          onClose();
        }
        return;
      }

      alert(msg || "Error occurred");

    } finally {
      setAddingId(null);
    }
  };

  /* ================= Create And Add New ================= */

  const createAndAddNew = async () => {
    setDuplicateData(null); // ✅ IMPORTANT

    const createRes = await API.post("/api/admin/question", {
      subjectId,
      topicId: form.topicId,
      question: {
        en: form.questionEn,
        hi: form.questionHi
      },
      options: form.options.map((opt) => ({
        key: opt.key,
        text: { en: opt.en, hi: opt.hi }
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
      { questionId, force: true }
    );

    alert("Question added");
    onSuccess();
    onClose();
  };

  // ========================== Update The Existing Question =========================

  const updateQuestion = async () => {
    await API.put(`/api/admin/question/${editQuestion._id}`, {
      subjectId,
      topicId: form.topicId,
      question: {
        en: form.questionEn,
        hi: form.questionHi
      },
      options: form.options.map((opt) => ({
        key: opt.key,
        text: { en: opt.en, hi: opt.hi }
      })),
      correctAnswer: form.correctAnswer,
      explanation: {
        en: form.explanationEn,
        hi: form.explanationHi
      }
    });

    alert("Question updated");

    onSuccess();
    onClose();
  };

  const useExistingQuestion = async () => {
    await API.post(
      `/api/admin/set/${setId}/section/${sectionName}/subject/${subjectId}/question`,
      { questionId: duplicateData.existing._id }
    );

    setDuplicateData(null);
    onSuccess();
    onClose();
  };

  /* ===================================================== */

  return (
    <>
      <div
        key={editQuestion?._id || "create"}
        style={{
          background: "white",
          width: "95vw",
          height: "95vh",
          borderRadius: "10px",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden"
        }}
      >
        {/* HEADER */}
        <div
          style={{
            padding: "15px 20px",
            borderBottom: "1px solid #eee",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}
        >
          <h2>{editQuestion ? "Edit Question" : "Add Question"}</h2>

          <div style={{ display: "flex", alignItems: "center" }}>
            <button
              onClick={() => !editQuestion && setMode("create")}
              style={{
                marginRight: "10px",
                padding: "6px 12px",
                background: mode === "create" ? "#2563eb" : "#e5e7eb",
                color: mode === "create" ? "white" : "black",
                border: "none",
                borderRadius: "4px"
              }}
            >
              Create
            </button>

            <button
              onClick={() => !editQuestion && setMode("existing")}
              style={{
                padding: "6px 12px",
                background: mode === "existing" ? "#2563eb" : "#e5e7eb",
                color: mode === "existing" ? "white" : "black",
                border: "none",
                borderRadius: "4px"
              }}
            >
              Existing
            </button>

            {/* CLOSE BUTTON */}
            <button
              onClick={onClose}
              style={{
                marginLeft: "15px",
                background: "transparent",
                border: "none",
                fontSize: "18px",
                cursor: "pointer"
              }}
            >
              ✖
            </button>
          </div>

        </div>

        {/* CONTENT */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "20px"
          }}
        >
          {limitReached && (
            <p style={{ color: "red", fontWeight: "bold" }}>
              Question limit reached
            </p>
          )}

          {/* ================= CREATE MODE ================= */}
          {mode === "create" && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "20px"
              }}
            >

              {/* LEFT COLUMN */}
              <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>

                {/* Question Section */}
                <div>
                  <label>Question (English)</label>
                  {/* <textarea
                    style={{ width: "100%", height: "80px" }}
                    onChange={(e) =>
                      setForm({ ...form, questionEn: e.target.value })
                    }
                  /> */}

                  <RichTextEditor
                    value={form.questionEn || ""}
                    onChange={(val) =>
                      setForm(prev => ({ ...prev, questionEn: val }))
                    }
                  />

                  <label>Question (Hindi)</label>
                  {/* <textarea
                    style={{ width: "100%", height: "80px" }}
                    onChange={(e) =>
                      setForm({ ...form, questionHi: e.target.value })
                    }
                  /> */}
                  <RichTextEditor
                    value={form.questionHi}
                    onChange={(val) =>
                      setForm(prev => ({ ...prev, questionHi: val }))
                    }
                  />
                </div>

                {/* Options Section (Scrollable) */}
                <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                  <h3>Options</h3>

                  {form.options.map((opt, index) => (
                    <div
                      key={opt.key}
                      style={{
                        display: "flex",
                        gap: "10px",
                        marginBottom: "10px",
                        alignItems: "center"
                      }}
                    >
                      <strong>{opt.key}</strong>

                      {/* <input
                        placeholder="English"
                        style={{ flex: 1 }}
                        onChange={(e) =>
                          handleOptionChange(index, "en", e.target.value)
                        }
                      /> */}

                      <div style={{ flex: 1 }}>
                        <RichTextEditor
                          value={opt.en}
                          minimal
                          onChange={(val) =>
                            handleOptionChange(index, "en", val)
                          }
                        />
                      </div>

                      {/* <input
                        placeholder="Hindi"
                        style={{ flex: 1 }}
                        onChange={(e) =>
                          handleOptionChange(index, "hi", e.target.value)
                        }
                      /> */}

                      <div style={{ flex: 1 }}>
                        <RichTextEditor
                          value={opt.hi}
                          minimal
                          onChange={(val) =>
                            handleOptionChange(index, "hi", val)
                          }
                        />
                      </div>

                      <input
                        type="radio"
                        name="correct"
                        value={opt.key}
                        checked={form.correctAnswer === opt.key}
                        onChange={() =>
                          setForm({ ...form, correctAnswer: opt.key })
                        }
                      />

                      {form.options.length > 2 && (
                        <button onClick={() => removeOption(index)}>❌</button>
                      )}
                    </div>
                  ))}

                  <button onClick={addOption}>+ Add Option</button>
                </div>
              </div>

              {/* RIGHT COLUMN */}
              <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>

                {/* Topic */}
                <div>
                  <label>Topic</label>
                  <select
                    value={form.topicId}
                    onChange={(e) =>
                      setForm({ ...form, topicId: e.target.value })
                    }
                    style={{ width: "100%" }}
                  >
                    <option value="">Select Topic</option>
                    {topics.map((t) => (
                      <option key={t._id} value={t._id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Explanation (Scrollable) */}
                <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                  <h3>Explanation</h3>

                  {/* <textarea
                    placeholder="Explanation (English)"
                    style={{ width: "100%", height: "100px" }}
                    onChange={(e) =>
                      setForm({ ...form, explanationEn: e.target.value })
                    }
                  /> */}

                  <RichTextEditor
                    value={form.explanationEn}
                    onChange={(val) =>
                      setForm(prev => ({ ...prev, explanationEn: val }))
                    }
                  />

                  {/* <textarea
                    placeholder="Explanation (Hindi)"
                    style={{ width: "100%", height: "100px", marginTop: "10px" }}
                    onChange={(e) =>
                      setForm({ ...form, explanationHi: e.target.value })
                    }
                  /> */}

                  <RichTextEditor
                    value={form.explanationHi}
                    onChange={(val) =>
                      setForm(prev => ({ ...prev, explanationHi: val }))
                    }
                  />


                </div>

              </div>

            </div>
          )}

          {/* ================= EXISTING MODE ================= */}
          {mode === "existing" && (
            <>
              <div style={{ marginBottom: "15px" }}>
                <input
                  placeholder="Search..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  style={{ width: "40%", marginRight: "10px" }}
                />

                <select
                  value={selectedTopic}
                  onChange={(e) => setSelectedTopic(e.target.value)}
                >
                  <option value="">All Topics</option>
                  {topics.map((t) => (
                    <option key={t._id} value={t._id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ maxHeight: "60vh", overflowY: "auto" }}>
                {results.map((q) => (
                  <div
                    key={q._id}
                    style={{
                      border: "1px solid #ddd",
                      padding: "10px",
                      marginBottom: "10px",
                      borderRadius: "6px"
                    }}
                  >
                    <p>
                      <b>{q.questionCode}</b> — {q.question?.en}
                    </p>

                    <button
                      disabled={limitReached || addingId === q._id}
                      onClick={() => handleAddExisting(q._id)}
                    >
                      {addingId === q._id ? "Adding..." : "Add"}
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* FOOTER (STICKY) */}
        {mode === "create" && (
          <div
            style={{
              padding: "15px",
              borderTop: "1px solid #eee",
              display: "flex",
              justifyContent: "space-between"
            }}
          >
            <button onClick={onClose}>Cancel</button>

            <button
              onClick={handleCreateSubmit}
              disabled={loading || limitReached}
            >
              {loading
                ? "Processing..."
                : editQuestion
                  ? "Update Question"
                  : "Create & Add"}
            </button>
          </div>
        )}
      </div >

      {/* Duplicate Modal */}
      {
        duplicateData && (
          <DuplicateQuestionModal
            existing={{
              ...duplicateData.existing,
              inputText: duplicateData.inputText
            }}
            onUseExisting={useExistingQuestion}
            onAddAnyway={createAndAddNew}
            onCancel={() => setDuplicateData(null)}
          />
        )
      }
    </>
  );
}

export default QuestionModal;