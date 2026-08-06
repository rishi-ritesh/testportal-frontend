// Up/down arrows for moving one item within its list. Deliberately not
// drag-and-drop: this needs no extra dependency, and it works with a keyboard
// and on touch without any extra handling.
//
// `onMove(from, to)` is called with plain array indexes; the list is hidden
// entirely when there is nothing to reorder.
function ReorderButtons({ index, total, onMove, disabled = false, label = "item" }) {
  if (total < 2) return null;

  const atTop = index === 0;
  const atBottom = index === total - 1;

  const style = (isEdge) => ({
    background: "transparent",
    border: "1px solid #d1d5db",
    borderRadius: "4px",
    padding: "2px 6px",
    lineHeight: 1.2,
    fontSize: "12px",
    color: isEdge || disabled ? "#d1d5db" : "#4b5563",
    cursor: isEdge || disabled ? "not-allowed" : "pointer"
  });

  return (
    <span style={{ display: "inline-flex", gap: "4px" }}>
      <button
        type="button"
        onClick={() => onMove(index, index - 1)}
        disabled={disabled || atTop}
        title={`Move ${label} up`}
        aria-label={`Move ${label} up`}
        style={style(atTop)}
      >
        ▲
      </button>

      <button
        type="button"
        onClick={() => onMove(index, index + 1)}
        disabled={disabled || atBottom}
        title={`Move ${label} down`}
        aria-label={`Move ${label} down`}
        style={style(atBottom)}
      >
        ▼
      </button>
    </span>
  );
}

export default ReorderButtons;
