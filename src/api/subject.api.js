import API from "./axios";

export const getSubjects = () => API.get("api/admin/subjects");

export const createSubject = (data) => API.post("api/admin/subjects", data);

// export const deleteSubject = (id) => API.delete(`/subjects/${id}`);

export const deleteSubject = (id, cascade) =>
  API.delete(`/api/admin/subject/${id}?cascade=${cascade}`);
