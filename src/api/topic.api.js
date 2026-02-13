import API from "./axios";

export const getTopicsBySubject = (subjectId) =>
  API.get(`/api/admin/topics/${subjectId}`);

export const createTopic = (data) =>
  API.post("/api/admin/topic", data);

export const deleteTopic = (id) =>
  API.delete(`/api/admin/topic/${id}`);
