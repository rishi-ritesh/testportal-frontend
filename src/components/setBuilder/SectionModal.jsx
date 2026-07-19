function SectionModal({ open, form, setForm, onClose, onSave }) {
  if (!open) return null;

  return (
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
          width: "400px",
          borderRadius: "8px"
        }}
      >
        <h2 style={{ marginBottom: "15px" }}>Add Section</h2>

        {/* Name */}
        <input
          placeholder="Section Name"
          value={form.name}
          onChange={(e) =>
            setForm({ ...form, name: e.target.value })
          }
          style={{ width: "100%", marginBottom: "10px", padding: "8px" }}
        />

        {/* Duration */}
        <input
          type="number"
          placeholder="Duration (minutes)"
          value={form.duration}
          onChange={(e) =>
            setForm({ ...form, duration: e.target.value })
          }
          style={{ width: "100%", marginBottom: "10px", padding: "8px" }}
        />

        {/* Positive Marks */}
        <input
          type="number"
          placeholder="Positive Marks"
          value={form.positiveMarks}
          onChange={(e) =>
            setForm({ ...form, positiveMarks: e.target.value })
          }
          style={{ width: "100%", marginBottom: "10px", padding: "8px" }}
        />

        {/* Negative Marks */}
        <input
          type="number"
          placeholder="Negative Marks"
          value={form.negativeMarks}
          onChange={(e) =>
            setForm({ ...form, negativeMarks: e.target.value })
          }
          style={{ width: "100%", marginBottom: "15px", padding: "8px" }}
        />

        {/* Actions */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
          <button
            onClick={onClose}
            style={{
              padding: "6px 12px",
              background: "#e5e7eb",
              border: "none",
              borderRadius: "4px"
            }}
          >
            Cancel
          </button>

          <button
            onClick={onSave}
            style={{
              padding: "6px 12px",
              background: "#2563eb",
              color: "white",
              border: "none",
              borderRadius: "4px"
            }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

export default SectionModal;