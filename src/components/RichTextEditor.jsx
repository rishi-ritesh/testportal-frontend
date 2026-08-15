import { useEffect, useRef, useState, useCallback, useId } from "react";
import FormulaBuilder from "./FormulaBuilder";
import { loadIntoEditor, readFromEditor, makeFormulaChip } from "../lib/math";
import API from "../api/axios";
import "katex/dist/katex.min.css";
import "./editor.css";

// Same props as before: value, onChange, minimal.
// Nothing that uses this component needs to change.
export default function RichTextEditor({
  value,
  onChange,
  minimal = false,
  placeholder = "Type here…",
}) {
  const boxId = useId();
  const areaRef = useRef(null);
  const lastSent = useRef(null); // what we last handed to onChange
  const savedRange = useRef(null); // where the cursor was before the panel opened
  const [builder, setBuilder] = useState(null); // { code, chip } | null
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  // ---- keep the box in step with the value coming from the form ----
  useEffect(() => {
    const el = areaRef.current;
    if (!el) return;
    const incoming = value || "";
    if (incoming === lastSent.current) return; // our own edit, ignore
    loadIntoEditor(el, incoming);
    lastSent.current = incoming;
    markEmpty();
  }, [value]);

  const markEmpty = useCallback(() => {
    const el = areaRef.current;
    if (!el) return;
    const blank = el.textContent.trim() === "" && !el.querySelector(".fx-chip");
    el.dataset.empty = blank ? "true" : "false";
  }, []);

  const emit = useCallback(() => {
    const el = areaRef.current;
    if (!el) return;
    const html = readFromEditor(el);
    lastSent.current = html;
    onChange(html);
    markEmpty();
  }, [onChange, markEmpty]);

  // ---- remember the cursor so a formula lands where they were typing ----
  const rememberCursor = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount && areaRef.current?.contains(sel.anchorNode)) {
      savedRange.current = sel.getRangeAt(0).cloneRange();
    }
  };

  const runCommand = (cmd) => {
    areaRef.current?.focus();
    if (savedRange.current) {
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(savedRange.current);
    }
    document.execCommand(cmd, false, null);
    rememberCursor();
    emit();
  };

  // ---- opening the formula panel ----
  // Only one panel may be docked at a time — the others step aside.
  const openBuilder = (chip = null) => {
    rememberCursor();
    window.dispatchEvent(new CustomEvent("fx-builder-open", { detail: boxId }));
    setBuilder({ code: chip ? chip.dataset.latex : "", chip });
  };

  useEffect(() => {
    const onOther = (e) => {
      if (e.detail !== boxId) setBuilder(null);
    };
    window.addEventListener("fx-builder-open", onOther);
    return () => window.removeEventListener("fx-builder-open", onOther);
  }, [boxId]);

  // The panel is docked at the side, so the page reflows into the space left
  // over. Bring this box back into view once that has happened.
  useEffect(() => {
    if (!builder) return;
    const t = setTimeout(
      () => areaRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" }),
      80
    );
    return () => clearTimeout(t);
  }, [builder]);

  const handleAreaClick = (e) => {
    const chip = e.target.closest?.(".fx-chip");
    if (chip && areaRef.current.contains(chip)) openBuilder(chip);
  };

  // Drop any element into the text, where the cursor last was.
  const insertAtCursor = (node) => {
    const el = areaRef.current;
    el.focus();
    const sel = window.getSelection();
    if (savedRange.current) {
      sel.removeAllRanges();
      sel.addRange(savedRange.current);
    }
    const range = sel.rangeCount ? sel.getRangeAt(0) : null;

    if (range && el.contains(range.startContainer)) {
      range.deleteContents();
      range.insertNode(node);
      const gap = document.createTextNode("\u00A0");
      node.after(gap);
      const after = document.createRange();
      after.setStartAfter(gap);
      after.collapse(true);
      sel.removeAllRanges();
      sel.addRange(after);
      savedRange.current = after.cloneRange();
    } else {
      el.appendChild(node);
      el.appendChild(document.createTextNode("\u00A0"));
    }
  };

  const insertFormula = (code) => {
    if (builder?.chip) {
      builder.chip.replaceWith(makeFormulaChip(code));
    } else {
      insertAtCursor(makeFormulaChip(code));
    }
    setBuilder(null);
    emit();
  };

  // ---- pictures ----
  const pickImage = () => {
    rememberCursor();
    fileRef.current?.click();
  };

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // so picking the same file twice still fires
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("That image is larger than 2 MB. Please compress it first.");
      return;
    }

    const body = new FormData();
    body.append("image", file);

    setUploading(true);
    try {
      const { data } = await API.post("/api/admin/upload-image", body);
      const img = document.createElement("img");
      img.src = data.url;
      img.alt = "";
      img.setAttribute("loading", "lazy");
      insertAtCursor(img);
      emit();
    } catch (err) {
      alert(err.response?.data?.message || "Could not upload the image. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  // Paste as plain text so Word formatting doesn't leak into the question.
  const handlePaste = (e) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain");
    document.execCommand("insertText", false, text);
  };

  return (
    <>
      <div className={"fx-editor" + (builder ? " is-editing" : "")}>
        <div className="fx-toolbar">
          <button type="button" className="fx-btn" title="Bold" onClick={() => runCommand("bold")}>
            <b>B</b>
          </button>

          {!minimal && (
            <>
              <button type="button" className="fx-btn" title="Italic" onClick={() => runCommand("italic")}>
                <i>I</i>
              </button>
              <button
                type="button"
                className="fx-btn"
                title="Bullet list"
                onClick={() => runCommand("insertUnorderedList")}
              >
                •
              </button>
              <button
                type="button"
                className="fx-btn"
                title="Numbered list"
                onClick={() => runCommand("insertOrderedList")}
              >
                1.
              </button>
            </>
          )}

          <span className="fx-divider" />

          <button
            type="button"
            className="fx-btn fx-primary"
            title="Insert a formula, symbol or chemical equation"
            onClick={() => openBuilder(null)}
          >
            ∑ Formula
          </button>

          <button
            type="button"
            className="fx-btn"
            title="Insert a picture or diagram"
            onClick={pickImage}
            disabled={uploading}
          >
            {uploading ? "Uploading…" : "\u{1F5BC} Image"}
          </button>

          <input
            ref={fileRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
            style={{ display: "none" }}
            onChange={handleFile}
          />
        </div>

        <div
          ref={areaRef}
          className={"fx-area" + (minimal ? " is-minimal" : "")}
          contentEditable
          suppressContentEditableWarning
          spellCheck={false}
          data-placeholder={placeholder}
          data-empty="true"
          onInput={() => {
            rememberCursor();
            emit();
          }}
          onKeyUp={rememberCursor}
          onMouseUp={rememberCursor}
          onBlur={rememberCursor}
          onClick={handleAreaClick}
          onPaste={handlePaste}
        />
      </div>

      {builder && (
        <FormulaBuilder
          initialCode={builder.code}
          onInsert={insertFormula}
          onClose={() => setBuilder(null)}
        />
      )}
    </>
  );
}
