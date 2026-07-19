export function getValidationErrors(setData) {
  const errors = [];

  if (!setData.sections || setData.sections.length === 0) {
    errors.push("No sections added");
    return errors;
  }

  for (const section of setData.sections) {
    for (const subject of section.subjects) {
      const total = subject.questions?.length || 0;
      const max = subject.maxQuestions;

      if (max > 0 && total !== max) {
        errors.push(
          `${section.name} → ${subject.subjectId?.name} (${total}/${max})`
        );
      }
    }
  }

  return errors;
}