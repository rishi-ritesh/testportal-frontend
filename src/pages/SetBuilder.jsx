import { useParams } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import {
  getSetById,
  togglePublishSet,
  removeQuestionFromSet,
  addSectionToSet,
  addSubjectToSection
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

function SetBuilder() {
  const { id } = useParams();

  const [subjects, setSubjects] = useState([]);
  const [setData, setSetData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [removing, setRemoving] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);

  const [previewQuestion, setPreviewQuestion] = useState(null);
  const [previewLang, setPreviewLang] = useState("en");

  const [showSectionModal, setShowSectionModal] = useState(false);
  const [showSubjectModal, setShowSubjectModal] = useState(false);

  const [sectionForm, setSectionForm] = useState({
    name: "",
    duration: "",
    positiveMarks: "",
    negativeMarks: ""
  });

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

  // ---------------- Add Section ----------------
  const handleAddSection = async () => {
    const { name, duration, positiveMarks, negativeMarks } = sectionForm;

    if (!name || !duration || !positiveMarks || !negativeMarks) {
      alert("Please fill all fields");
      return;
    }

    try {
      await addSectionToSet(id, {
        name,
        duration: Number(duration),
        positiveMarks: Number(positiveMarks),
        negativeMarks: Number(negativeMarks)
      });

      setShowSectionModal(false);
      setSectionForm({
        name: "",
        duration: "",
        positiveMarks: "",
        negativeMarks: ""
      });

      await fetchSet();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to add section");
    }
  };

  // ---------------- Add Subject ----------------
  const openSubjectModal = (sectionName) => {
    setSubjectForm({
      sectionName,
      subjectId: "",
      maxQuestions: ""
    });
    setShowSubjectModal(true);
  };

  const handleAddSubject = async () => {
    const { sectionName, subjectId, maxQuestions } = subjectForm;

    if (!subjectId || !maxQuestions) {
      alert("Please select subject and enter max questions");
      return;
    }

    try {
      await addSubjectToSection(id, sectionName, {
        subjectId,
        maxQuestions: Number(maxQuestions)
      });

      setShowSubjectModal(false);
      await fetchSet();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to add subject");
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
    setEditingQuestion(null); // ✅ ADD THIS
  };

  // ✅ NEW: Stable handler (fix re-render issue)
  const handleQuestionAdded = async () => {
    closeModal();
    await fetchSet();
  };

  // ---------------- Editing Question -------------

  const handleEditQuestion = (question, sectionName, subjectId) => {
    setEditingQuestion(question);
    setSelectedSubject({ sectionName, subjectId }); // ✅ IMPORTANT
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

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto" }}>

      <SetHeader
        title={setData.title}
        onAddSection={() => {
          setSectionForm({
            name: "",
            duration: "",
            positiveMarks: "",
            negativeMarks: ""
          });
          setShowSectionModal(true);
        }}
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
          onAddSubject={() => openSubjectModal(section.name)}
          locked={locked}
        >
          {section.subjects?.length > 0 &&
            section.subjects.map((subject, subjectIndex) => (
              <SubjectCard
                key={subject.subjectId?._id || subjectIndex}
                subject={subject}
                sectionName={section.name}
                removing={removing}
                onPreview={(q) => setPreviewQuestion(q)}
                onRemove={handleRemoveQuestion}
                onAddQuestion={openModal}
                onEdit={handleEditQuestion}
                onBulkUpload={openBulkUpload}
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
        form={sectionForm}
        setForm={setSectionForm}
        onClose={() => setShowSectionModal(false)}
        onSave={handleAddSection}
      />

      <SubjectModal
        open={showSubjectModal}
        form={subjectForm}
        setForm={setSubjectForm}
        subjects={subjects}
        onClose={() => setShowSubjectModal(false)}
        onSave={handleAddSubject}
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