function PreviewModal({ question, lang, onClose, onToggleLang }) {
  if (!question) return null;

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.5)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 2000
    }}>
      <div style={{
        background: "white",
        padding: "20px",
        width: "700px",
        maxHeight: "90vh",
        overflowY: "auto",
        borderRadius: "8px"
      }}>
        <h2>Question Preview</h2>

        <button onClick={onToggleLang}>
          Switch to {lang === "en" ? "Hindi" : "English"}
        </button>

        {/* <p><strong>{question.question?.[lang]}</strong></p> */}

        <div
          dangerouslySetInnerHTML={{
            __html: question.question?.[lang]
          }}
        />

        <ul>
          {question.options?.map(opt => (
            // <li key={opt.key}>
            //   {opt.key}. {opt.text?.[lang]}
            // </li>

            <li key={opt.key}>
              <strong>{opt.key}.</strong>
              <span
                dangerouslySetInnerHTML={{
                  __html: opt.text?.[lang]
                }}
              />
            </li>
          ))}
        </ul>

        <p><strong>Correct:</strong> {question.correctAnswer}</p>

        {/* <p><strong>Explanation:</strong> {question.explanation?.[lang]}</p> */}

        <div>
          <strong>Explanation:</strong>
          <div
            dangerouslySetInnerHTML={{
              __html: question.explanation?.[lang]
            }}
          />
        </div>

        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

export default PreviewModal;