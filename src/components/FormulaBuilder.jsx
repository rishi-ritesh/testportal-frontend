import { useEffect, useRef, useState } from "react";
import PALETTE from "../lib/mathPalette";
import { drawFormula } from "../lib/math";

const TAB_NAMES = Object.keys(PALETTE);

export default function FormulaBuilder({ initialCode = "", onInsert, onClose }) {
  const [code, setCode] = useState(initialCode);
  const [tab, setTab] = useState(TAB_NAMES[0]);
  const boxRef = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => boxRef.current?.focus(), 60);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) submit();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const submit = () => {
    const trimmed = code.trim();
    if (trimmed) onInsert(trimmed);
  };

  // Click a symbol -> write it at the cursor, or wrap the highlighted part.
  const clickSymbol = (snippet) => {
    const box = boxRef.current;
    const start = box ? box.selectionStart : code.length;
    const end = box ? box.selectionEnd : start;
    const highlighted = code.slice(start, end);

    let piece = snippet;
    let caret;

    if (highlighted && piece.includes("{}")) {
      piece = piece.replace("{}", "{" + highlighted + "}");
      caret = start + piece.length;
    } else {
      const hole = piece.indexOf("{}");
      caret = hole >= 0 ? start + hole + 1 : start + piece.length;
    }

    const next = code.slice(0, start) + piece + code.slice(end);
    setCode(next);

    requestAnimationFrame(() => {
      box?.focus();
      box?.setSelectionRange(caret, caret);
    });
  };

  const drawn = code.trim() ? drawFormula(code.trim(), true) : null;
  const set = PALETTE[tab];

  return (
    <div className="fx-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="fx-panel" onMouseDown={(e) => e.stopPropagation()}>
        <div className="fx-panel-head">
          <span>{initialCode ? "Edit formula" : "Insert formula"}</span>
          <button type="button" className="fx-x" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <div className="fx-preview">
          {!code.trim() ? (
            <span className="fx-muted">Pick symbols below — the formula appears here</span>
          ) : drawn ? (
            <span dangerouslySetInnerHTML={{ __html: drawn }} />
          ) : (
            <span className="fx-error">
              Not finished yet — check for an empty or unclosed &#123; &#125; bracket.
            </span>
          )}
        </div>

        <textarea
          ref={boxRef}
          className="fx-code"
          value={code}
          spellCheck={false}
          onChange={(e) => setCode(e.target.value)}
          aria-label="Formula code"
        />

        <div className="fx-tabs" role="tablist">
          {TAB_NAMES.map((name) => (
            <button
              key={name}
              type="button"
              role="tab"
              aria-selected={tab === name}
              className={"fx-tab" + (tab === name ? " is-on" : "")}
              onClick={() => setTab(name)}
            >
              {name}
            </button>
          ))}
        </div>

        <div className="fx-grid">
          {set.items.map(([show, snippet, title], i) => {
            const html = drawFormula(show, false);
            return (
              <button
                key={title + i}
                type="button"
                className="fx-sym"
                title={title}
                aria-label={title}
                onClick={() => clickSymbol(snippet)}
              >
                {html ? (
                  <span dangerouslySetInnerHTML={{ __html: html }} />
                ) : (
                  <span className="fx-muted">{title}</span>
                )}
              </button>
            );
          })}
        </div>

        <p className="fx-tip">{set.tip}</p>

        <div className="fx-actions">
          <button type="button" className="fx-btn fx-primary" onClick={submit}>
            {initialCode ? "Save formula" : "Add to question"}
          </button>
          <button type="button" className="fx-btn" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="fx-btn" onClick={() => setCode("")}>
            Clear
          </button>
          <span className="fx-shortcut">Ctrl + Enter to add</span>
        </div>
      </div>
    </div>
  );
}
