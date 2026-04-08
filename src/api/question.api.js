import API from "./axios";

export const createQuestion = (data) =>
  API.post("/api/admin/question", data);

export const getQuestionsByTopic = (topicId) =>
  API.get(`/api/admin/questions/${topicId}`);

export const deleteQuestion = (id) =>
  API.delete(`/api/admin/question/${id}`);
