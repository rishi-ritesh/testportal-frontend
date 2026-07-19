import { useState } from "react";
import { bulkAddQuestionsToSubject } from "../../api/set.api";
import {
  readQuestionsFile,
  downloadTemplate,
  FIELD_LABELS
} from "../../utils/parseQuestionsFile";

// Modal for uploading many questions into one subject slot of a set at once.
// `target` = { sectionName, subjectId, subjectName, remaining }.
function BulkUploadModal({ open, setId, target, onClose, onUploaded }) {
  const [fileName, setFileName] = useState("");
  const [questions, setQuestions] = useState([]);
  const [parseError, setParseError] = useState("");
  const [rowErrors, setRowErrors] = useState([]);
  const [confirmMsg, setConfirmMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!open || !target) return null;

  const reset = () => {
    setFileName("");
    setQuestions([]);
    setParseError("");
    setRowErrors([]);
    setConfirmMsg("");
    setSubmitting(false);
  };

  const close = () => {
    reset();
    onClose();
  };

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    // reset previous parse/submit state whenever a new file is chosen
    setQuestions([]);
    setParseError("");
    setRowErrors([]);
    setConfirmMsg("");

    if (!file) {
      setFileName("");
      return;
    }
    setFileName(file.name);

    const { questions: parsed, error } = await readQuestionsFile(file);
    if (error) {
      setParseError(error);
      return;
    }
    if (!parsed.length) {
      setParseError("No question rows found in the file.");
      return;
    }
    setQuestions(parsed);
  };

  const submit = async (force) => {
    setSubmitting(true);
    setRowErrors([]);
    setConfirmMsg("");
    try {
      const res = await bulkAddQuestionsToSubject(
        setId,
        target.sectionName,
        target.subjectId,
        questions,
        force
      );

      // server asks whether to proceed despite in-set duplicates
      if (res.data?.requiresConfirmation) {
        setConfirmMsg(res.data.message || "Some questions may be duplicates. Upload anyway?");
        setSubmitting(false);
        return;
      }

      alert(res.data?.message || "Questions added.");
      onUploaded();
      close();
    } catch (err) {
      const data = err.response?.data;
      if (Array.isArray(data?.errors)) {
        setRowErrors(data.errors);
      }
      setParseError(data?.message || "Upload failed.");
      setSubmitting(false);
    }
  };

  const overCapacity = questions.length > target.remaining;
  const canSubmit = questions.length > 0 && !overCapacity && !submitting;

  return (
    <div style={overlay}>
      <div style={panel}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ fontSize: "18px", fontWeight: 600, margin: 0 }}>
            Bulk upload — {target.subjectName}
          </h2>
          <button onClick={close} style={{ ...btn("#6b7280"), padding: "4px 10px" }}>
            ✕
          </button>
        </div>

        <p style={{ fontSize: "13px", color: "#6b7280", marginTop: "6px" }}>
          {target.remaining} slot(s) left in this subject. Upload a simple{" "}
          <strong>text (.txt)</strong> file — every question is created and added to this
          subject in one go.
        </p>

        {/* Format help */}
        <div style={helpBox}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px" }}>
            <strong style={{ fontSize: "13px" }}>How to write the file</strong>
            <button onClick={downloadTemplate} style={{ ...btn("#2563eb"), padding: "5px 10px", fontSize: "12px" }}>
              ↓ Download template (.txt)
            </button>
          </div>

          <p style={{ fontSize: "12.5px", color: "#374151", margin: "8px 0 0", lineHeight: 1.6 }}>
            Download the template and fill it in <strong>Google Docs</strong>,{" "}
            <strong>MS Word</strong>, or <strong>Notepad / TextEdit</strong>. Start every question
            with <code>### Question 1</code>, <code>### Question 2</code>, … and put one label per line:
          </p>
          <code style={{ display: "block", fontSize: "12px", color: "#374151", marginTop: "8px", lineHeight: 1.7 }}>
            {FIELD_LABELS.join(" · ")}
          </code>

          <p style={{ fontSize: "12px", color: "#92400e", background: "#fffbeb", border: "1px solid #fde68a", borderRadius: "6px", padding: "8px 10px", margin: "10px 0 0", lineHeight: 1.6 }}>
            <strong>Important:</strong> after typing in Google Docs or Word, save it as{" "}
            <strong>Plain Text (.txt)</strong> before uploading —
            in Google Docs use <em>File → Download → Plain text (.txt)</em>; in Word use{" "}
            <em>File → Save As → Plain Text</em>. A normal <code>.docx</code> file can't be read.
          </p>
        </div>

        {/* File picker */}
        <div style={{ marginTop: "14px" }}>
          <input type="file" accept=".txt,text/plain" onChange={handleFile} />
          {fileName && !parseError && questions.length > 0 && (
            <p style={{ fontSize: "13px", color: "#065f46", marginTop: "8px" }}>
              Parsed <strong>{questions.length}</strong> question(s) from{" "}
              <em>{fileName}</em>.
            </p>
          )}
        </div>

        {/* Capacity warning */}
        {questions.length > 0 && overCapacity && (
          <div style={errBox}>
            The file has {questions.length} question(s) but only {target.remaining} slot(s)
            remain in this subject. Reduce the file or raise the subject limit.
          </div>
        )}

        {/* Parse / server message */}
        {parseError && <div style={errBox}>{parseError}</div>}

        {/* Per-row server errors */}
        {rowErrors.length > 0 && (
          <div style={{ ...errBox, maxHeight: "180px", overflowY: "auto" }}>
            <strong>Fix these questions and re-upload:</strong>
            <ul style={{ margin: "6px 0 0", paddingLeft: "18px" }}>
              {rowErrors.map((e) => (
                <li key={e.row} style={{ fontSize: "13px" }}>
                  Question {e.row}: {e.message}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Duplicate confirmation */}
        {confirmMsg && (
          <div style={{ ...warnBox }}>
            <p style={{ margin: 0, fontSize: "13px" }}>{confirmMsg}</p>
            <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
              <button onClick={() => submit(true)} disabled={submitting} style={btn("#b45309")}>
                {submitting ? "Uploading..." : "Upload anyway"}
              </button>
              <button onClick={() => setConfirmMsg("")} disabled={submitting} style={btn("#6b7280")}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Actions */}
        {!confirmMsg && (
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "18px" }}>
            <button onClick={close} disabled={submitting} style={btn("#6b7280")}>
              Cancel
            </button>
            <button onClick={() => submit(false)} disabled={!canSubmit} style={btn(canSubmit ? "#16a34a" : "#9ca3af")}>
              {submitting ? "Uploading..." : `Upload ${questions.length || ""} question(s)`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const overlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.5)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000
};

const panel = {
  background: "white",
  padding: "22px",
  width: "min(640px, 92vw)",
  maxHeight: "90vh",
  overflowY: "auto",
  borderRadius: "10px"
};

const helpBox = {
  marginTop: "14px",
  padding: "12px 14px",
  border: "1px solid #e5e7eb",
  borderRadius: "8px",
  background: "#f9fafb"
};

const errBox = {
  marginTop: "12px",
  padding: "10px 14px",
  border: "1px solid #fecaca",
  borderRadius: "8px",
  background: "#fef2f2",
  color: "#991b1b",
  fontSize: "13px"
};

const warnBox = {
  marginTop: "12px",
  padding: "12px 14px",
  border: "1px solid #fde68a",
  borderRadius: "8px",
  background: "#fffbeb",
  color: "#92400e"
};

const btn = (bg) => ({
  padding: "8px 14px",
  background: bg,
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  fontSize: "14px"
});

export default BulkUploadModal;
