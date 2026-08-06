import ReorderButtons from "./ReorderButtons";

function SectionCard({
  section,
  index,
  total,
  onAddSubject,
  onEdit,
  onDelete,
  onMove,
  reordering,
  children,
  locked
}) {
  return (
    <div
      style={{
        border: "1px solid #e5e7eb",
        padding: "20px",
        marginBottom: "25px",
        borderRadius: "10px",
        background: "white",
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: "10px",
          marginBottom: "10px"
        }}
      >
        <h2 style={{ margin: 0 }}>{section.name}</h2>

        {!locked && (
          <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
            <ReorderButtons
              index={index}
              total={total}
              onMove={onMove}
              disabled={reordering}
              label="section"
            />

            <button
              onClick={onEdit}
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
              onClick={onDelete}
              style={{
                background: "#ef4444",
                color: "white",
                border: "none",
                padding: "4px 10px",
                borderRadius: "4px",
                cursor: "pointer"
              }}
            >
              Delete
            </button>
          </div>
        )}
      </div>

      <p style={{ marginBottom: "10px", color: "#555" }}>
        Duration: {section.duration} mins | Marks: +{section.positiveMarks} / -{section.negativeMarks}
      </p>

      {!locked && (
        <button
          onClick={onAddSubject}
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
          + Add Subject
        </button>
      )}

      {children}
    </div>
  );
}

export default SectionCard;
