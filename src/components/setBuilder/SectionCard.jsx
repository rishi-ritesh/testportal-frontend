function SectionCard({ section, onAddSubject, children, locked }) {
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
      <h2 style={{ marginBottom: "10px" }}>{section.name}</h2>

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