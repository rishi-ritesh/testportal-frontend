import { useEffect, useState } from "react";
import { getSubjects } from "../api/subject.api";
import { getTopicsBySubject } from "../api/topic.api";
import {
  createQuestion,
  getQuestionsByTopic,
  deleteQuestion
} from "../api/question.api";

const generateOptionKey = (index) =>
  String.fromCharCode(65 + index); // A, B, C...

function Questions() {
  const [subjects, setSubjects] = useState([]);
  const [topics, setTopics] = useState([]);
  const [questions, setQuestions] = useState([]);

  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("");

  const [questionText, setQuestionText] = useState({ en: "", hi: "" });
  const [explanation, setExplanation] = useState({ en: "", hi: "" });

  const [options, setOptions] = useState([
    { key: "A", text: { en: "", hi: "" } },
    { key: "B", text: { en: "", hi: "" } },
    { key: "C", text: { en: "", hi: "" } },
    { key: "D", text: { en: "", hi: "" } }
  ]);

  const [correctAnswer, setCorrectAnswer] = useState("");

  // Fetch subjects
  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    const res = await getSubjects();
    setSubjects(res.data);
  };

  const fetchTopics = async (subjectId) => {
    const res = await getTopicsBySubject(subjectId);
    setTopics(res.data);
  };

  const fetchQuestions = async (topicId) => {
    const res = await getQuestionsByTopic(topicId);
    setQuestions(res.data);
  };

  // Subject change
  const handleSubjectChange = async (e) => {
    const subjectId = e.target.value;
    setSelectedSubject(subjectId);
    setSelectedTopic("");
    setQuestions([]);
    if (subjectId) {
      await fetchTopics(subjectId);
    }
  };

  // Topic change
  const handleTopicChange = async (e) => {
    const topicId = e.target.value;
    setSelectedTopic(topicId);
    if (topicId) {
      await fetchQuestions(topicId);
    }
  };

  const handleOptionChange = (index, field, value) => {
    const updated = [...options];
    updated[index].text[field] = value;
    setOptions(updated);
  };

  const addOption = () => {
    const newIndex = options.length;
    const newKey = generateOptionKey(newIndex);

    setOptions([
      ...options,
      { key: newKey, text: { en: "", hi: "" } }
    ]);
  };

  const removeOption = (index) => {
    if (options.length <= 2) return;

    const updated = options.filter((_, i) => i !== index);

    // Reassign keys
    const reassigned = updated.map((opt, i) => ({
      ...opt,
      key: generateOptionKey(i)
    }));

    setOptions(reassigned);
    setCorrectAnswer("");
  };

  const handleSubmit = async () => {
    if (!selectedSubject || !selectedTopic)
      return alert("Select subject and topic");

    if (!questionText.en || !questionText.hi)
      return alert("Question required in both languages");

    if (!correctAnswer)
      return alert("Select correct answer");

    try {
      await createQuestion({
        subjectId: selectedSubject,
        topicId: selectedTopic,
        question: questionText,
        options,
        correctAnswer,
        explanation
      });

      alert("Question created");

      setQuestionText({ en: "", hi: "" });
      setExplanation({ en: "", hi: "" });
      setCorrectAnswer("");
      setOptions([
        { key: "A", text: { en: "", hi: "" } },
        { key: "B", text: { en: "", hi: "" } },
        { key: "C", text: { en: "", hi: "" } },
        { key: "D", text: { en: "", hi: "" } }
      ]);

      fetchQuestions(selectedTopic);

    } catch (err) {
      alert(err.response?.data?.message || "Error creating question");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this question?")) return;
    await deleteQuestion(id);
    fetchQuestions(selectedTopic);
  };

  return (
    <div>
      <h1>Questions</h1>

      {/* Subject Dropdown */}
      <select value={selectedSubject} onChange={handleSubjectChange}>
        <option value="">Select Subject</option>
        {subjects.map((sub) => (
          <option key={sub._id} value={sub._id}>
            {sub.name}
          </option>
        ))}
      </select>

      {/* Topic Dropdown */}
      <select value={selectedTopic} onChange={handleTopicChange}>
        <option value="">Select Topic</option>
        {topics.map((topic) => (
          <option key={topic._id} value={topic._id}>
            {topic.name}
          </option>
        ))}
      </select>

      <hr />

      <h3>Create Question</h3>

      <textarea
        placeholder="Question (English)"
        value={questionText.en}
        onChange={(e) =>
          setQuestionText({ ...questionText, en: e.target.value })
        }
      />

      <textarea
        placeholder="Question (Hindi)"
        value={questionText.hi}
        onChange={(e) =>
          setQuestionText({ ...questionText, hi: e.target.value })
        }
      />

      <h4>Options</h4>

      {options.map((opt, index) => (
        <div key={index}>
          <input
            type="radio"
            checked={correctAnswer === opt.key}
            onChange={() => setCorrectAnswer(opt.key)}
          />
          <strong>{opt.key}</strong>

          <input
            placeholder="English"
            value={opt.text.en}
            onChange={(e) =>
              handleOptionChange(index, "en", e.target.value)
            }
          />

          <input
            placeholder="Hindi"
            value={opt.text.hi}
            onChange={(e) =>
              handleOptionChange(index, "hi", e.target.value)
            }
          />

          {options.length > 2 && (
            <button onClick={() => removeOption(index)}>Remove</button>
          )}
        </div>
      ))}

      <button onClick={addOption}>Add Option</button>

      <h4>Explanation</h4>

      <textarea
        placeholder="Explanation (English)"
        value={explanation.en}
        onChange={(e) =>
          setExplanation({ ...explanation, en: e.target.value })
        }
      />

      <textarea
        placeholder="Explanation (Hindi)"
        value={explanation.hi}
        onChange={(e) =>
          setExplanation({ ...explanation, hi: e.target.value })
        }
      />

      <button onClick={handleSubmit}>Save Question</button>

      <hr />

      <h3>Existing Questions</h3>

      <table border="1" cellPadding="8">
        <thead>
          <tr>
            <th>English</th>
            <th>Correct</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {questions.map((q) => (
            <tr key={q._id}>
              <td>{q.question.en}</td>
              <td>{q.correctAnswer}</td>
              <td>
                <button onClick={() => handleDelete(q._id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Questions;
