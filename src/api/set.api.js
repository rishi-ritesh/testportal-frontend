import API from "./axios";

export const getSetById = (id) =>
  API.get(`/api/admin/set/${id}`);

export const togglePublishSet = (id) =>
  API.patch(`/api/admin/set/${id}/publish`);

export const searchQuestions = (params) => {
  return API.get("/api/admin/questions/search", { params });
};

export const addQuestionToSet = (setId, sectionName, subjectId, questionId) => {
  return API.post(
    `/api/admin/set/${setId}/section/${sectionName}/subject/${subjectId}/question`,
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
    `/api/admin/set/${setId}/section/${sectionName}/subject/${subjectId}/question/${questionId}`
  );
};

export const createSet = (title) => {
  return API.post("/api/admin/set", { title });
};

export const addSectionToSet = (setId, data) => {
  return API.post(`/api/admin/set/${setId}/section`, data);
};

export const addSubjectToSection = (setId, sectionName, data) => {
  return API.post(
    `/api/admin/set/${setId}/section/${sectionName}/subject`,
    data
  );
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
    `/api/admin/set/${setId}/section/${sectionName}/subject/${subjectId}/questions/bulk`,
    { questions, force }
  );
};