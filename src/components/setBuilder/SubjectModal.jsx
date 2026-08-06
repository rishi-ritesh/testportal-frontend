// Used for both "Add Subject" and "Edit Subject". In edit mode `currentCount`
// is how many questions the slot already holds: the subject itself can only be
// swapped while the slot is empty, and the limit can never drop below what is
// already in there.
function SubjectModal({
  open,
  form,
  setForm,
  subjects,
  onClose,
  onSave,
  mode = "add",
  currentCount = 0
}) {
  if (!open) return null;

  const isEdit = mode === "edit";
  const subjectLocked = isEdit && currentCount > 0;

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
        <h2 style={{ marginBottom: "15px" }}>
          {isEdit ? "Edit Subject" : "Add Subject"}
        </h2>

        {/* Subject Dropdown */}
        <select
          value={form.subjectId}
          disabled={subjectLocked}
          onChange={(e) =>
            setForm({ ...form, subjectId: e.target.value })
          }
          style={{
            width: "100%",
            marginBottom: subjectLocked ? "4px" : "10px",
            padding: "8px",
            background: subjectLocked ? "#f3f4f6" : "white",
            cursor: subjectLocked ? "not-allowed" : "pointer"
          }}
        >
          <option value="">Select Subject</option>
          {subjects.map((sub) => (
            <option key={sub._id} value={sub._id}>
              {sub.name}
            </option>
          ))}
        </select>

        {subjectLocked && (
          <p style={{ margin: "0 0 10px", fontSize: "12px", color: "#6b7280" }}>
            Remove all {currentCount} question(s) to change the subject.
          </p>
        )}

        {/* Max Questions */}
        <input
          type="number"
          min={isEdit ? Math.max(currentCount, 1) : 1}
          placeholder="Max Questions"
          value={form.maxQuestions}
          onChange={(e) =>
            setForm({ ...form, maxQuestions: e.target.value })
          }
          style={{ width: "100%", marginBottom: isEdit ? "4px" : "15px", padding: "8px" }}
        />

        {isEdit && (
          <p style={{ margin: "0 0 15px", fontSize: "12px", color: "#6b7280" }}>
            {currentCount} question(s) already added — the limit cannot go below
            that.
          </p>
        )}

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
            {isEdit ? "Save Changes" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default SubjectModal;
