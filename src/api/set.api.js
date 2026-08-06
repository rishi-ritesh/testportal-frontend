import API from "./axios";

// Sections are addressed by name, and names contain spaces ("General
// Awareness") and can contain any character an admin types, so every name that
// goes into a URL is encoded.
const seg = (value) => encodeURIComponent(value);

export const getSetById = (id) =>
  API.get(`/api/admin/set/${id}`);

export const updateSet = (id, title) =>
  API.patch(`/api/admin/set/${id}`, { title });

export const togglePublishSet = (id) =>
  API.patch(`/api/admin/set/${id}/publish`);

export const searchQuestions = (params) => {
  return API.get("/api/admin/questions/search", { params });
};

export const addQuestionToSet = (setId, sectionName, subjectId, questionId) => {
  return API.post(
    `/api/admin/set/${setId}/section/${seg(sectionName)}/subject/${subjectId}/question`,
    { questionId }
  );
};

export const removeQuestionFromSet = (
  setId,
  sectionName,
  subjectId,
  questionId
) => {
  return API.delete(
    `/api/admin/set/${setId}/section/${seg(sectionName)}/subject/${subjectId}/question/${questionId}`
  );
};

export const createSet = (title) => {
  return API.post("/api/admin/set", { title });
};

export const addSectionToSet = (setId, data) => {
  return API.post(`/api/admin/set/${setId}/section`, data);
};

export const updateSection = (setId, sectionName, data) => {
  return API.patch(
    `/api/admin/set/${setId}/section/${seg(sectionName)}`,
    data
  );
};

export const deleteSection = (setId, sectionName) => {
  return API.delete(`/api/admin/set/${setId}/section/${seg(sectionName)}`);
};

export const addSubjectToSection = (setId, sectionName, data) => {
  return API.post(
    `/api/admin/set/${setId}/section/${seg(sectionName)}/subject`,
    data
  );
};

export const updateSubjectInSection = (setId, sectionName, subjectId, data) => {
  return API.patch(
    `/api/admin/set/${setId}/section/${seg(sectionName)}/subject/${subjectId}`,
    data
  );
};

export const removeSubjectFromSection = (setId, sectionName, subjectId) => {
  return API.delete(
    `/api/admin/set/${setId}/section/${seg(sectionName)}/subject/${subjectId}`
  );
};

// Moves one item within its list. `payload` is
// { type: "section" | "subject" | "question", sectionName?, subjectId?, from, to }.
export const reorderSetItems = (setId, payload) => {
  return API.patch(`/api/admin/set/${setId}/reorder`, payload);
};

export const searchQuestionByCode = (params) => {
  return API.get("/api/admin/questions/search-by-code", { params });
};

export const bulkAddQuestionsToSubject = (
  setId,
  sectionName,
  subjectId,
  questions,
  force = false
) => {
  return API.post(
    `/api/admin/set/${setId}/section/${seg(sectionName)}/subject/${subjectId}/questions/bulk`,
    { questions, force }
  );
};