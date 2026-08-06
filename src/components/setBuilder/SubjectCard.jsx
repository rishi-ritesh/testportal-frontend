import ReorderButtons from "./ReorderButtons";

// Stored question text is HTML. For the one-line list summary we want the plain
// words: drop the tags and turn entities like &amp; or &nbsp; back into the
// characters the admin actually typed.
const toSummary = (html) => {
  const holder = document.createElement("div");
  holder.innerHTML = String(html || "").replace(/<br\s*\/?>/gi, " ");
  return (holder.textContent || "").replace(/\s+/g, " ").trim();
};

function SubjectCard({
  subject,
  sectionName,
  index,
  total,
  onPreview,
  onRemove,
  onAddQuestion,
  onEdit,
  onBulkUpload,
  onEditSubject,
  onRemoveSubject,
  onMoveSubject,
  onMoveQuestion,
  reordering,
  removing,
  locked
}) {
  const currentCount = subject.questions?.length || 0;
  const max = subject.maxQuestions;
  const limitReached = max > 0 && currentCount >= max;
  const remaining = max > 0 ? Math.max(max - currentCount, 0) : 0;

  return (
    <div
      style={{
        border: "1px solid #ccc",
        padding: "15px",
        marginTop: "15px",
        borderRadius: "6px",
        background: limitReached ? "#ffe5e5" : "white"
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: "10px"
        }}
      >
        <h3 style={{ margin: 0 }}>{subject.subjectId?.name}</h3>

        {!locked && (
          <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
            <ReorderButtons
              index={index}
              total={total}
              onMove={onMoveSubject}
              disabled={reordering}
              label="subject"
            />

            <button
              onClick={onEditSubject}
              title="Change the subject or its question limit"
              style={{
                background: "#10b981",
                color: "white",
                border: "none",
                padding: "4px 10px",
                borderRadius: "4px",
                cursor: "pointer"
              }}
            >
              Edit
            </button>

            <button
              onClick={onRemoveSubject}
              title="Remove this subject from the section"
              style={{
                background: "#ef4444",
                color: "white",
                border: "none",
                padding: "4px 10px",
                borderRadius: "4px",
                cursor: "pointer"
              }}
            >
              Remove
            </button>
          </div>
        )}
      </div>

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
        {subject.questions?.map((q, questionIndex) => (
          <li
            key={q.questionId?._id || questionIndex}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "6px"
            }}
          >
            <span style={{ flex: 1 }}>
              <strong style={{ color: "#2563eb" }}>
                {q.questionId?.questionCode}
              </strong>
              {" — "}
              {(() => {
                const text = toSummary(q.questionId?.question?.en);
                return text.length > 80 ? `${text.slice(0, 80)}...` : text;
              })()}
            </span>

            <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
              {!locked && (
                <ReorderButtons
                  index={questionIndex}
                  total={currentCount}
                  onMove={onMoveQuestion}
                  disabled={reordering}
                  label="question"
                />
              )}

              <button
                onClick={() => onPreview(q.questionId)}
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

              {!locked && (
                <button
                  onClick={() =>
                    onEdit(q.questionId, sectionName, subject.subjectId._id)
                  }
                  style={{
                    background: "#10b981",
                    color: "white",
                    border: "none",
                    padding: "4px 8px",
                    borderRadius: "4px",
                    cursor: "pointer"
                  }}
                >
                  Edit
                </button>
              )}

              {!locked && (
                <button
                  onClick={() =>
                    onRemove(
                      sectionName,
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
              )}

            </div>
          </li>
        ))}
      </ul>

      {!locked && (
        <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
          <button
            disabled={limitReached}
            onClick={() =>
              onAddQuestion(sectionName, subject.subjectId?._id)
            }
            style={{
              padding: "6px 12px",
              cursor: limitReached ? "not-allowed" : "pointer",
              background: "#3b82f6",
              color: "white",
              border: "none",
              borderRadius: "4px"
            }}
          >
            Add Question
          </button>

          <button
            disabled={limitReached}
            title={limitReached ? "Subject is full" : "Upload many questions from a file"}
            onClick={() =>
              onBulkUpload(
                sectionName,
                subject.subjectId?._id,
                subject.subjectId?.name,
                remaining
              )
            }
            style={{
              padding: "6px 12px",
              cursor: limitReached ? "not-allowed" : "pointer",
              background: limitReached ? "#9ca3af" : "#7c3aed",
              color: "white",
              border: "none",
              borderRadius: "4px"
            }}
          >
            ⇪ Bulk Upload
          </button>
        </div>
      )}
    </div>
  );
}

export default SubjectCard;
