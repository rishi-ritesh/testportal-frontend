function SubjectModal({
  open,
  form,
  setForm,
  subjects,
  onClose,
  onSave
}) {
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
        <h2 style={{ marginBottom: "15px" }}>Add Subject</h2>

        {/* Subject Dropdown */}
        <select
          value={form.subjectId}
          onChange={(e) =>
            setForm({ ...form, subjectId: e.target.value })
          }
          style={{ width: "100%", marginBottom: "10px", padding: "8px" }}
        >
          <option value="">Select Subject</option>
          {subjects.map((sub) => (
            <option key={sub._id} value={sub._id}>
              {sub.name}
            </option>
          ))}
        </select>

        {/* Max Questions */}
        <input
          type="number"
          min="1"
          placeholder="Max Questions"
          value={form.maxQuestions}
          onChange={(e) =>
            setForm({ ...form, maxQuestions: e.target.value })
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

export default SubjectModal;