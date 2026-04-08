import { useParams } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import {
  getSetById,
  togglePublishSet,
  removeQuestionFromSet,
  addSectionToSet,
  addSubjectToSection
} from "../api/set.api";
import { getSubjects } from "../api/subject.api";
import QuestionModal from "../components/QuestionModal";

function SetBuilder() {
  const { id } = useParams();
  const [subjects, setSubjects] = useState([]);
  const [addingSubjectSection, setAddingSubjectSection] = useState(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [maxQuestionsInput, setMaxQuestionsInput] = useState("");
  const [setData, setSetData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [removing, setRemoving] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);

  const [previewQuestion, setPreviewQuestion] = useState(null);
  const [previewLang, setPreviewLang] = useState("en");

  // ---------------- Fetch Set ----------------
  const fetchSet = useCallback(async () => {
    try {
      setFetching(true);
      const res = await getSetById(id);
      setSetData(res.data);
    } catch (err) {
      alert("Failed to fetch set");
    } finally {
      setFetching(false);
    }
  }, [id]);

  useEffect(() => {
    fetchSet();
    fetchSubjects();
  }, [fetchSet]);

  //----------------- Fetch Subjects ----------------

  const fetchSubjects = async () => {
    try {
      const res = await getSubjects();
      setSubjects(res.data);
    } catch (err) {
      alert("Failed to load subjects");
    }
  };

  // ---------------- Publish Toggle ----------------
  const handleTogglePublish = async () => {
    try {
      setLoading(true);
      await togglePublishSet(id);
      await fetchSet();
    } catch (err) {
      alert(err.response?.data?.message || "Error toggling publish");
    } finally {
      setLoading(false);
    }
  };

  // ---------------- Remove Question ----------------
  const handleRemoveQuestion = async (
    sectionName,
    subjectId,
    questionId
  ) => {
    try {
      setRemoving(questionId);

      await removeQuestionFromSet(
        id,
        sectionName,
        subjectId,
        questionId
      );

      await fetchSet();
    } catch (err) {
      alert(err.response?.data?.message || "Error removing question");
    } finally {
      setRemoving(null);
    }
  };

  // ---------------- Add Section ----------------
  const handleAddSection = async () => {
    const name = prompt("Enter section name (example: Module 1)");
    if (!name) return;

    const duration = prompt("Enter duration in minutes");
    const positiveMarks = prompt("Positive marks per question");
    const negativeMarks = prompt("Negative marks per question");

    try {
      await addSectionToSet(id, {
        name,
        duration: Number(duration),
        positiveMarks: Number(positiveMarks),
        negativeMarks: Number(negativeMarks)
      });

      await fetchSet();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to add section");
    }
  };

  // ---------------- Add Subject ----------------
  const handleAddSubject = async (sectionName) => {
    if (!selectedSubjectId || !maxQuestionsInput) {
      alert("Please select subject and enter max questions");
      return;
    }

    try {
      await addSubjectToSection(id, sectionName, {
        subjectId: selectedSubjectId,
        maxQuestions: Number(maxQuestionsInput)
      });

      setSelectedSubjectId("");
      setMaxQuestionsInput("");
      setAddingSubjectSection(null);

      await fetchSet();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to add subject");
    }
  };

  // ---------------- Modal Control ----------------
  const openModal = (sectionName, subjectId) => {
    setSelectedSubject({ sectionName, subjectId });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedSubject(null);
  };

  // ---------------- Validate Before Publish ----------------
  const getValidationErrors = () => {
    const errors = [];

    if (!setData.sections || setData.sections.length === 0) {
      errors.push("No sections added");
      return errors;
    }

    for (const section of setData.sections) {
      for (const subject of section.subjects) {
        const total = subject.questions?.length || 0;
        const max = subject.maxQuestions || 0;

        if (max > 0 && total !== max) {
          errors.push(
            `${section.name} → ${subject.subjectId?.name} (${total}/${max})`
          );
        }
      }
    }

    return errors;
  };

  // ---------------- Render Guards ----------------
  if (fetching) return <div>Loading set...</div>;
  if (!setData) return <div>No data found</div>;

  const validationErrors = getValidationErrors();
  const canPublish = validationErrors.length === 0;

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto" }}>
      <h1 style={{ marginBottom: "10px" }}>{setData.title}</h1>

      <button
        onClick={handleAddSection}
        style={{
          padding: "8px 14px",
          marginBottom: "10px",
          background: "#6366f1",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer"
        }}
      >
        Add Section
      </button>

      <button
        onClick={handleTogglePublish}
        disabled={loading || (!setData.isPublished && !canPublish)}
        style={{
          padding: "8px 14px",
          cursor: loading ? "not-allowed" : "pointer",
          marginBottom: "20px",
          background: setData.isPublished ? "#f59e0b" : (!canPublish ? "#9ca3af" : "#10b981"),
          color: "white",
          border: "none",
          borderRadius: "4px"
        }}
      >
        {loading
          ? "Processing..."
          : setData.isPublished
            ? "Unpublish"
            : "Publish"}
      </button>

      {!setData.isPublished && validationErrors.length > 0 && (
        <div style={{ marginBottom: "15px", color: "red" }}>
          <strong>Complete all subjects before publishing:</strong>
          <ul>
            {validationErrors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {setData.sections?.map((section, sectionIndex) => {

        const usedSubjectIds = section.subjects.map(
          (s) => s.subjectId?._id
        );

        return (
          <div
            key={section._id || sectionIndex}
            style={{
              border: "1px solid #ddd",
              padding: "20px",
              marginBottom: "30px",
              borderRadius: "8px",
              background: "#fafafa"
            }}
          >
            <h2>{section.name}</h2>

            <button
              onClick={() => setAddingSubjectSection(section.name)}
              style={{
                padding: "6px 12px",
                marginBottom: "10px",
                background: "#10b981",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer"
              }}
            >
              Add Subject
            </button>

            {addingSubjectSection === section.name && (
              <div style={{ marginBottom: "10px" }}>
                <select
                  value={selectedSubjectId}
                  onChange={(e) => setSelectedSubjectId(e.target.value)}
                  style={{ marginRight: "10px", padding: "5px" }}
                >
                  <option value="">Select Subject</option>
                  {subjects
                    .filter((sub) => !usedSubjectIds.includes(sub._id))
                    .map((sub) => (
                      <option key={sub._id} value={sub._id}>
                        {sub.name}
                      </option>
                    ))}
                </select>

                <input
                  type="number"
                  placeholder="Max Questions"
                  value={maxQuestionsInput}
                  onChange={(e) => setMaxQuestionsInput(e.target.value)}
                  style={{ marginRight: "10px", padding: "5px", width: "120px" }}
                />

                <button
                  onClick={() => handleAddSubject(section.name)}
                  style={{
                    padding: "5px 10px",
                    background: "#3b82f6",
                    color: "white",
                    border: "none",
                    borderRadius: "4px"
                  }}
                >
                  Save
                </button>
              </div>
            )}

            <p>
              Duration: {section.duration} mins | Marks: +
              {section.positiveMarks} / -{section.negativeMarks}
            </p>

            {section.subjects?.map((subject, subjectIndex) => {

              const currentCount = subject.questions?.length || 0;
              const max = subject.maxQuestions || 0;
              const limitReached =
                max > 0 && currentCount >= max;

              return (
                <div
                  key={subject.subjectId?._id || subjectIndex}
                  style={{
                    border: "1px solid #ccc",
                    padding: "15px",
                    marginTop: "15px",
                    borderRadius: "6px",
                    background: limitReached
                      ? "#ffe5e5"
                      : "white"
                  }}
                >
                  <h3>{subject.subjectId?.name}</h3>

                  <p>
                    Questions: {currentCount}
                    {max > 0 && ` / ${max}`}
                  </p>

                  {limitReached && (
                    <p style={{ color: "red", fontWeight: "bold" }}>
                      Question limit reached
                    </p>
                  )}

                  {/* Question List */}
                  <ul style={{ paddingLeft: "20px" }}>
                    {subject.questions?.map((q, index) => (
                      <li
                        key={q.questionId?._id || index}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: "6px"
                        }}
                      >
                        <span style={{ flex: 1 }}>
                          {q.questionId?.question?.en}
                        </span>

                        <div style={{ display: "flex", gap: "6px" }}>
                          <button
                            onClick={() => setPreviewQuestion(q.questionId)}
                            style={{
                              background: "#6366f1",
                              color: "white",
                              border: "none",
                              padding: "4px 8px",
                              borderRadius: "4px",
                              cursor: "pointer"
                            }}
                          >
                            Preview
                          </button>

                          <button
                            onClick={() =>
                              handleRemoveQuestion(
                                section.name,
                                subject.subjectId._id,
                                q.questionId._id
                              )
                            }
                            disabled={removing === q.questionId._id}
                            style={{
                              background: "#ef4444",
                              color: "white",
                              border: "none",
                              padding: "4px 8px",
                              cursor:
                                removing === q.questionId._id
                                  ? "not-allowed"
                                  : "pointer",
                              borderRadius: "4px"
                            }}
                          >
                            {removing === q.questionId._id
                              ? "Removing..."
                              : "Remove"}
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>

                  {/* Add Question Button */}
                  <button
                    disabled={limitReached}
                    onClick={() =>
                      openModal(
                        section.name,
                        subject.subjectId?._id
                      )
                    }
                    style={{
                      marginTop: "10px",
                      padding: "6px 12px",
                      cursor: limitReached
                        ? "not-allowed"
                        : "pointer",
                      background: "#3b82f6",
                      color: "white",
                      border: "none",
                      borderRadius: "4px"
                    }}
                  >
                    Add Question
                  </button>
                </div>
              );
            })}
          </div>
        )
      })}

      {/* ---------------- Preview Modal ---------------- */}
      {previewQuestion && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 2000
          }}
        >
          <div
            style={{
              background: "white",
              padding: "20px",
              width: "700px",
              maxHeight: "90vh",
              overflowY: "auto",
              borderRadius: "8px"
            }}
          >
            <h2>Question Preview</h2>

            <button
              onClick={() =>
                setPreviewLang(previewLang === "en" ? "hi" : "en")
              }
              style={{
                marginBottom: "10px",
                padding: "5px 10px",
                background: "#3b82f6",
                color: "white",
                border: "none",
                borderRadius: "4px"
              }}
            >
              Switch to {previewLang === "en" ? "Hindi" : "English"}
            </button>

            <p>
              <strong>
                {previewQuestion.question?.[previewLang]}
              </strong>
            </p>

            <ul>
              {previewQuestion.options?.map((opt) => (
                <li key={opt.key}>
                  {opt.key}. {opt.text?.[previewLang]}
                </li>
              ))}
            </ul>

            <p>
              <strong>Correct Answer:</strong>{" "}
              {previewQuestion.correctAnswer}
            </p>

            <p>
              <strong>Explanation:</strong>{" "}
              {previewQuestion.explanation?.[previewLang]}
            </p>

            <button
              onClick={() => setPreviewQuestion(null)}
              style={{
                marginTop: "10px",
                padding: "6px 12px",
                background: "#ef4444",
                color: "white",
                border: "none",
                borderRadius: "4px"
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* ---------------- Modal ---------------- */}
      {showModal && selectedSubject && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000
          }}
        >
          <div
            style={{
              background: "white",
              padding: "20px",
              width: "700px",
              maxHeight: "90vh",
              overflowY: "auto",
              borderRadius: "8px"
            }}
          >
            <QuestionModal
              setId={id}
              sectionName={selectedSubject.sectionName}
              subjectId={selectedSubject.subjectId}
              onClose={closeModal}
              onSuccess={() => {
                closeModal();
                fetchSet();
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default SetBuilder;