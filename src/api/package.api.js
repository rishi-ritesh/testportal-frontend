import API from "./axios";

export const getPackages = () => API.get("/api/admin/packages");

export const getPackageById = (id) => API.get(`/api/admin/package/${id}`);

export const createPackage = (data) => API.post("/api/admin/package", data);

export const updatePackage = (id, data) =>
  API.patch(`/api/admin/package/${id}`, data);

export const deletePackage = (id) => API.delete(`/api/admin/package/${id}`);

export const togglePublishPackage = (id) =>
  API.patch(`/api/admin/package/${id}/publish`);

export const addSetToPackage = (id, setId) =>
  API.post(`/api/admin/package/${id}/set/${setId}`);

export const removeSetFromPackage = (id, setId) =>
  API.delete(`/api/admin/package/${id}/set/${setId}`);

// all admin sets (to choose mocks from)
export const getAllSets = () => API.get("/api/admin/sets");
