import QuestionModal from "../QuestionModal"

function QuestionSelectorModal({
  open,
  selectedSubject,
  setId,
  onClose,
  onSuccess,
  editQuestion
}) {
  if (!open || !selectedSubject) return null;

  return (
    <div className="fx-host" style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.5)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 1000
    }}>
      <div className="fx-shrink" style={{
        background: "white",
        padding: "20px",
        width: "95vw",
        height: "95vh",
        overflowY: "auto",
        borderRadius: "8px"
      }}>
        <QuestionModal
          setId={setId}
          sectionName={selectedSubject.sectionName}
          subjectId={selectedSubject.subjectId}
          onClose={onClose}
          onSuccess={onSuccess}
          editQuestion={editQuestion}
        />
      </div>
    </div>
  );
}

export default QuestionSelectorModal;