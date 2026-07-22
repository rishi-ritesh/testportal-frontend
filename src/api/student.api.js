import API from "./axios";

export const getStudents = () => API.get("/api/admin/students");

export const toggleStudentActive = (id) =>
  API.patch(`/api/admin/student/${id}/active`);

export const deleteStudent = (id) =>
  API.delete(`/api/admin/student/${id}`);
