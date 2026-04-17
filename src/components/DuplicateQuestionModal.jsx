import React from "react";

function DuplicateQuestionModal({
  existing,
  onUseExisting,
  onAddAnyway,
  onCancel
}) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 2000
      }}
    >
      <div
        style={{
          background: "white",
          padding: "24px",
          width: "650px",
          maxHeight: "85vh",
          overflowY: "auto",
          borderRadius: "10px",
          boxShadow: "0 10px 25px rgba(0,0,0,0.2)"
        }}
      >
        {/* Header */}
        <h2 style={{ marginBottom: "10px", color: "#b91c1c" }}>
          ⚠️ Similar Question Found
        </h2>

        <p style={{ marginBottom: "20px", color: "#555" }}>
          A similar question already exists in this subject. Choose what you want to do:
        </p>

        {/* Existing Question */}
        <div
          style={{
            border: "1px solid #e5e7eb",
            borderRadius: "6px",
            padding: "12px",
            marginBottom: "15px",
            background: "#f9fafb"
          }}
        >
          <h4 style={{ marginBottom: "8px", color: "#111827" }}>
            Existing Question
          </h4>
          <p style={{ fontWeight: "bold" }}>
            {existing?.question?.en}
          </p>
        </div>

        {/* New Question */}
        <div
          style={{
            border: "1px solid #e5e7eb",
            borderRadius: "6px",
            padding: "12px",
            marginBottom: "20px",
            background: "#fefce8"
          }}
        >
          <h4 style={{ marginBottom: "8px", color: "#92400e" }}>
            Your Question
          </h4>
          <p style={{ fontWeight: "bold" }}>
            {existing?.inputText}
          </p>
        </div>

        {/* Actions */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "10px"
          }}
        >
          <button
            onClick={onCancel}
            style={{
              padding: "8px 14px",
              background: "#e5e7eb",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer"
            }}
          >
            Cancel
          </button>

          <button
            onClick={onUseExisting}
            style={{
              padding: "8px 14px",
              background: "#2563eb",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer"
            }}
          >
            Use Existing
          </button>

          <button
            onClick={onAddAnyway}
            style={{
              padding: "8px 14px",
              background: "#f59e0b",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer"
            }}
          >
            Add Anyway
          </button>
        </div>
      </div>
    </div>
  );
}

export default DuplicateQuestionModal;