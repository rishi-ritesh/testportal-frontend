function SetHeader({
  title,
  onAddSection,
  onTogglePublish,
  loading,
  isPublished,
  canPublish,
  locked
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "20px",
        paddingBottom: "10px",
        borderBottom: "1px solid #e5e7eb"
      }}
    >
      {/* Left */}
      <div>
        <h1 style={{ margin: 0 }}>{title}</h1>
        <p style={{ margin: 0, color: "#6b7280", fontSize: "14px" }}>
          Manage sections and questions
        </p>
      </div>

      {/* Right */}
      <div style={{ display: "flex", gap: "10px" }}>
        {!locked && (
          <button
            onClick={onAddSection}
            style={{
              padding: "8px 14px",
              background: "#6366f1",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer"
            }}
          >
            + Section
          </button>
        )}

        <button
          onClick={onTogglePublish}
          disabled={loading || (!isPublished && !canPublish)}
          style={{
            padding: "8px 14px",
            background: isPublished
              ? "#f59e0b"
              : !canPublish
              ? "#9ca3af"
              : "#10b981",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: loading ? "not-allowed" : "pointer"
          }}
        >
          {loading
            ? "Processing..."
            : isPublished
            ? "Unpublish"
            : "Publish"}
        </button>
      </div>
    </div>
  );
}

export default SetHeader;