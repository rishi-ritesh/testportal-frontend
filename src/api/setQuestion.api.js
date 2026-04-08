import API from "./axios";

export const addQuestionToSet = (
  setId,
  sectionName,
  subjectId,
  questionId
) =>
  API.post(
    `/api/admin/set/${setId}/section/${sectionName}/subject/${subjectId}/question`,
    { questionId }
  );
