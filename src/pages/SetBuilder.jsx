import { useParams } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import {
  getSetById,
  updateSet,
  togglePublishSet,
  removeQuestionFromSet,
  addSectionToSet,
  updateSection,
  deleteSection,
  addSubjectToSection,
  updateSubjectInSection,
  removeSubjectFromSection,
  reorderSetItems
} from "../api/set.api";
import { getSubjects } from "../api/subject.api";

import SectionCard from "../components/setBuilder/SectionCard";
import SubjectCard from "../components/setBuilder/SubjectCard";
import SetHeader from "../components/setBuilder/SetHeader";
import PreviewModal from "../components/setBuilder/PreviewModal";
import SectionModal from "../components/setBuilder/SectionModal";
import SubjectModal from "../components/setBuilder/SubjectModal";
import QuestionSelectorModal from "../components/setBuilder/QuestionSelectorModal";
import BulkUploadModal from "../components/setBuilder/BulkUploadModal";

import { getValidationErrors } from "../utils/setValidation";

const EMPTY_SECTION_FORM = {
  name: "",
  duration: "",
  positiveMarks: "",
  negativeMarks: ""
};

function SetBuilder() {
  const { id } = useParams();

  const [subjects, setSubjects] = useState([]);
  const [setData, setSetData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [removing, setRemoving] = useState(null);

  // Blocks the reorder arrows while a move is in flight, so rapid clicks can't
  // race each other and land the list in an order nobody asked for.
  const [reordering, setReordering] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);

  const [previewQuestion, setPreviewQuestion] = useState(null);
  const [previewLang, setPreviewLang] = useState("en");

  const [showSectionModal, setShowSectionModal] = useState(false);
  const [showSubjectModal, setShowSubjectModal] = useState(false);

  // null while adding; while editing it holds the section's *original* name,
  // which is how the API addresses it even when the name is what changed.
  const [editingSectionName, setEditingSectionName] = useState(null);

  // null while adding; while editing it holds the slot being edited so we know
  // the original subjectId (the URL key) and how full it already is.
  const [editingSubject, setEditingSubject] = useState(null);

  const [sectionForm, setSectionForm] = useState(EMPTY_SECTION_FORM);

  const [subjectForm, setSubjectForm] = useState({
    sectionName: "",
    subjectId: "",
    maxQuestions: ""
  });

  const [editingQuestion, setEditingQuestion] = useState(null);

  const [bulkTarget, setBulkTarget] = useState(null);

  // ---------------- Fetch Set ----------------
  const fetchSet = useCallback(async () => {
    try {
      setFetching(true);
      const res = await getSetById(id);
      setSetData(res.data);
    } catch {
      alert("Failed to fetch set");
    } finally {
      setFetching(false);
    }
  }, [id]);

  // ---------------- Fetch Subjects ----------------
  const fetchSubjects = useCallback(async () => {
    try {
      const res = await getSubjects();
      setSubjects(res.data);
    } catch {
      alert("Failed to load subjects");
    }
  }, []);

  useEffect(() => {
    fetchSet();
    fetchSubjects();
  }, [fetchSet, fetchSubjects]);

  // ---------------- Publish Toggle ----------------
  const handleTogglePublish = async () => {
    try {
      setLoading(true);
      await togglePublishSet(id);
      await fetchSet();
    } catch (err) {
      alert(err.response?.data?.message || "Error toggling publish");
    } finally {
      setLoading(false);
    }
  };

  // ---------------- Rename Set ----------------
  const handleRenameSet = async () => {
    const title = prompt("Enter a new title for this set", setData.title);

    if (!title || title.trim() === setData.title) return;

    try {
      await updateSet(id, title.trim());
      await fetchSet();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to rename set");
    }
  };

  // ---------------- Remove Question ----------------
  const handleRemoveQuestion = async (sectionName, subjectId, questionId) => {
    try {
      setRemoving(questionId);
      await removeQuestionFromSet(id, sectionName, subjectId, questionId);
      await fetchSet();
    } catch (err) {
      alert(err.response?.data?.message || "Error removing question");
    } finally {
      setRemoving(null);
    }
  };

  // ---------------- Sections ----------------
  const openAddSection = () => {
    setEditingSectionName(null);
    setSectionForm(EMPTY_SECTION_FORM);
    setShowSectionModal(true);
  };

  const openEditSection = (section) => {
    setEditingSectionName(section.name);
    setSectionForm({
      name: section.name,
      duration: String(section.duration ?? ""),
      positiveMarks: String(section.positiveMarks ?? ""),
      negativeMarks: String(section.negativeMarks ?? "")
    });
    setShowSectionModal(true);
  };

  const handleSaveSection = async () => {
    const { name, duration, positiveMarks, negativeMarks } = sectionForm;

    if (!name || duration === "" || positiveMarks === "" || negativeMarks === "") {
      alert("Please fill all fields");
      return;
    }

    const payload = {
      name,
      duration: Number(duration),
      positiveMarks: Number(positiveMarks),
      negativeMarks: Number(negativeMarks)
    };

    try {
      if (editingSectionName) {
        await updateSection(id, editingSectionName, payload);
      } else {
        await addSectionToSet(id, payload);
      }

      setShowSectionModal(false);
      setEditingSectionName(null);
      setSectionForm(EMPTY_SECTION_FORM);

      await fetchSet();
    } catch (err) {
      alert(
        err.response?.data?.message ||
          `Failed to ${editingSectionName ? "update" : "add"} section`
      );
    }
  };

  const handleDeleteSection = async (section) => {
    const questionCount = (section.subjects || []).reduce(
      (sum, sub) => sum + (sub.questions?.length || 0),
      0
    );

    const warning = questionCount
      ? `\n\n${questionCount} question(s) will be unlinked from this set. The questions themselves stay in the question bank.`
      : "";

    if (!window.confirm(`Delete the section "${section.name}"?${warning}`)) {
      return;
    }

    try {
      await deleteSection(id, section.name);
      await fetchSet();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete section");
    }
  };

  // ---------------- Subjects ----------------
  const openAddSubject = (sectionName) => {
    setEditingSubject(null);
    setSubjectForm({
      sectionName,
      subjectId: "",
      maxQuestions: ""
    });
    setShowSubjectModal(true);
  };

  const openEditSubject = (sectionName, subject) => {
    setEditingSubject({
      sectionName,
      subjectId: subject.subjectId?._id,
      currentCount: subject.questions?.length || 0
    });
    setSubjectForm({
      sectionName,
      subjectId: subject.subjectId?._id || "",
      maxQuestions: String(subject.maxQuestions ?? "")
    });
    setShowSubjectModal(true);
  };

  const handleSaveSubject = async () => {
    const { sectionName, subjectId, maxQuestions } = subjectForm;

    if (!subjectId || !maxQuestions) {
      alert("Please select subject and enter max questions");
      return;
    }

    try {
      if (editingSubject) {
        await updateSubjectInSection(
          id,
          editingSubject.sectionName,
          editingSubject.subjectId,
          { subjectId, maxQuestions: Number(maxQuestions) }
        );
      } else {
        await addSubjectToSection(id, sectionName, {
          subjectId,
          maxQuestions: Number(maxQuestions)
        });
      }

      setShowSubjectModal(false);
      setEditingSubject(null);
      await fetchSet();
    } catch (err) {
      alert(
        err.response?.data?.message ||
          `Failed to ${editingSubject ? "update" : "add"} subject`
      );
    }
  };

  const handleRemoveSubject = async (sectionName, subject) => {
    const name = subject.subjectId?.name || "this subject";
    const questionCount = subject.questions?.length || 0;

    const warning = questionCount
      ? `\n\n${questionCount} question(s) will be unlinked from this set. The questions themselves stay in the question bank.`
      : "";

    if (!window.confirm(`Remove "${name}" from ${sectionName}?${warning}`)) {
      return;
    }

    try {
      await removeSubjectFromSection(id, sectionName, subject.subjectId?._id);
      await fetchSet();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to remove subject");
    }
  };

  // ---------------- Reorder ----------------
  const handleMove = async (payload) => {
    try {
      setReordering(true);
      await reorderSetItems(id, payload);
      await fetchSet();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to reorder");
    } finally {
      setReordering(false);
    }
  };

  // ---------------- Modal Control ----------------
  const openModal = (sectionName, subjectId) => {
    setSelectedSubject({ sectionName, subjectId });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedSubject(null);
    setEditingQuestion(null);
  };

  const handleQuestionAdded = async () => {
    closeModal();
    await fetchSet();
  };

  // ---------------- Editing Question -------------

  const handleEditQuestion = (question, sectionName, subjectId) => {
    setEditingQuestion(question);
    setSelectedSubject({ sectionName, subjectId });
    setShowModal(true);
  };

  // ---------------- Bulk Upload ----------------
  const openBulkUpload = (sectionName, subjectId, subjectName, remaining) => {
    setBulkTarget({ sectionName, subjectId, subjectName, remaining });
  };

  // ---------------- Render Guards ----------------
  if (fetching) return <div>Loading set...</div>;
  if (!setData) return <div>No data found</div>;

  const validationErrors = getValidationErrors(setData);
  const canPublish = validationErrors.length === 0;

  // A published set is locked — no editing until it's unpublished.
  const locked = setData.isPublished;

  const sectionCount = setData.sections?.length || 0;

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto" }}>

      <SetHeader
        title={setData.title}
        onAddSection={openAddSection}
        onRename={handleRenameSet}
        onTogglePublish={handleTogglePublish}
        loading={loading}
        isPublished={setData.isPublished}
        canPublish={canPublish}
        locked={locked}
      />

      {locked && (
        <div
          style={{
            marginBottom: "15px",
            padding: "10px 14px",
            borderRadius: "6px",
            background: "#ecfdf5",
            border: "1px solid #a7f3d0",
            color: "#065f46",
            fontSize: "14px"
          }}
        >
          🔒 This set is published and locked. Unpublish it to edit or delete its content.
        </div>
      )}

      {!setData.isPublished && validationErrors.length > 0 && (
        <div style={{ marginBottom: "15px", color: "red" }}>
          <strong>Complete all subjects before publishing:</strong>
          <ul>
            {validationErrors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {setData.sections?.map((section, sectionIndex) => (
        <SectionCard
          key={section._id || sectionIndex}
          section={section}
          index={sectionIndex}
          total={sectionCount}
          onAddSubject={() => openAddSubject(section.name)}
          onEdit={() => openEditSection(section)}
          onDelete={() => handleDeleteSection(section)}
          onMove={(from, to) =>
            handleMove({ type: "section", from, to })
          }
          reordering={reordering}
          locked={locked}
        >
          {section.subjects?.length > 0 &&
            section.subjects.map((subject, subjectIndex) => (
              <SubjectCard
                key={subject.subjectId?._id || subjectIndex}
                subject={subject}
                sectionName={section.name}
                index={subjectIndex}
                total={section.subjects.length}
                removing={removing}
                onPreview={(q) => setPreviewQuestion(q)}
                onRemove={handleRemoveQuestion}
                onAddQuestion={openModal}
                onEdit={handleEditQuestion}
                onBulkUpload={openBulkUpload}
                onEditSubject={() => openEditSubject(section.name, subject)}
                onRemoveSubject={() =>
                  handleRemoveSubject(section.name, subject)
                }
                onMoveSubject={(from, to) =>
                  handleMove({
                    type: "subject",
                    sectionName: section.name,
                    from,
                    to
                  })
                }
                onMoveQuestion={(from, to) =>
                  handleMove({
                    type: "question",
                    sectionName: section.name,
                    subjectId: subject.subjectId?._id,
                    from,
                    to
                  })
                }
                reordering={reordering}
                locked={locked}
              />
            ))}
        </SectionCard>
      ))}

      <PreviewModal
        question={previewQuestion}
        lang={previewLang}
        onClose={() => setPreviewQuestion(null)}
        onToggleLang={() =>
          setPreviewLang(previewLang === "en" ? "hi" : "en")
        }
      />

      <QuestionSelectorModal
        open={showModal}
        selectedSubject={selectedSubject}
        setId={id}
        onClose={closeModal}
        onSuccess={handleQuestionAdded}
        editQuestion={editingQuestion}
      />

      <SectionModal
        open={showSectionModal}
        mode={editingSectionName ? "edit" : "add"}
        form={sectionForm}
        setForm={setSectionForm}
        onClose={() => {
          setShowSectionModal(false);
          setEditingSectionName(null);
        }}
        onSave={handleSaveSection}
      />

      <SubjectModal
        open={showSubjectModal}
        mode={editingSubject ? "edit" : "add"}
        currentCount={editingSubject?.currentCount || 0}
        form={subjectForm}
        setForm={setSubjectForm}
        subjects={subjects}
        onClose={() => {
          setShowSubjectModal(false);
          setEditingSubject(null);
        }}
        onSave={handleSaveSubject}
      />

      <BulkUploadModal
        open={!!bulkTarget}
        setId={id}
        target={bulkTarget}
        onClose={() => setBulkTarget(null)}
        onUploaded={fetchSet}
      />
    </div>
  );
}

export default SetBuilder;
