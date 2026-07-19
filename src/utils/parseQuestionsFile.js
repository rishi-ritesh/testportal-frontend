// Parses a bulk-question "doc" file into an array of plain question objects the
// bulk-add endpoint understands. We use a simple, human-friendly TEXT format
// (not CSV) so anyone can write it in Google Docs, MS Word, or Notepad and save
// as plain text (.txt) — no spreadsheets, columns, or commas to get wrong.
//
// Format — start each question with "### Question N", then one label per line:
//
//   ### Question 1
//   Topic: algebra
//   Question (English): What is 2 + 2?
//   Question (Hindi): 2 + 2 कितना है?
//   Option A (English): 3
//   Option A (Hindi): ३
//   ... B, C, D ...
//   Answer: B
//   Explanation (English): Because 2 + 2 = 4.
//   Explanation (Hindi): क्योंकि 2 + 2 = 4 होता है।

const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5 MB

// The internal keys the backend expects (kept stable).
const FIELD_KEYS = [
  "topic_slug",
  "question_en",
  "question_hi",
  "option_a_en",
  "option_b_en",
  "option_c_en",
  "option_d_en",
  "option_a_hi",
  "option_b_hi",
  "option_c_hi",
  "option_d_hi",
  "answer",
  "explanation_en",
  "explanation_hi"
];

// Maps a normalized label (lowercase, letters only) → internal key. Several
// spellings map to the same key so small differences don't break the upload.
const LABEL_MAP = {
  topic: "topic_slug",
  topicslug: "topic_slug",

  questionenglish: "question_en",
  questionen: "question_en",
  question: "question_en",
  questionhindi: "question_hi",
  questionhi: "question_hi",

  optionaenglish: "option_a_en",
  optionaen: "option_a_en",
  optionahindi: "option_a_hi",
  optionahi: "option_a_hi",
  optionbenglish: "option_b_en",
  optionben: "option_b_en",
  optionbhindi: "option_b_hi",
  optionbhi: "option_b_hi",
  optioncenglish: "option_c_en",
  optioncen: "option_c_en",
  optionchindi: "option_c_hi",
  optionchi: "option_c_hi",
  optiondenglish: "option_d_en",
  optionden: "option_d_en",
  optiondhindi: "option_d_hi",
  optiondhi: "option_d_hi",

  answer: "answer",
  correctanswer: "answer",

  explanationenglish: "explanation_en",
  explanationen: "explanation_en",
  explanation: "explanation_en",
  explanationhindi: "explanation_hi",
  explanationhi: "explanation_hi"
};

const normalizeLabel = (s) => s.toLowerCase().replace(/[^a-z]/g, "");

// Pull a single option letter out of whatever the user typed, e.g. "B", "b)",
// "Option B", "b - correct" all become "B". Stored uppercase to match how
// questions created through the normal form are stored.
function normalizeAnswer(raw) {
  const cleaned = String(raw || "").toLowerCase().replace(/^option\s+/, "");
  const m = cleaned.match(/(?:^|[^a-z])([a-d])(?:[^a-z]|$)/);
  return (m ? m[1] : cleaned.trim()).toUpperCase();
}

function blockToQuestion(lines) {
  const out = {};
  FIELD_KEYS.forEach((k) => (out[k] = ""));

  for (const line of lines) {
    const idx = line.indexOf(":");
    if (idx === -1) continue; // ignore stray lines without a label
    const key = LABEL_MAP[normalizeLabel(line.slice(0, idx))];
    if (key) out[key] = line.slice(idx + 1).trim();
  }

  out.answer = normalizeAnswer(out.answer);
  return out;
}

export function parseDocQuestions(text) {
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1); // strip BOM
  const lines = text.split(/\r?\n/);

  // Split into blocks: a line starting with "##" (e.g. "### Question 1") begins
  // a new question. Content before the first header still counts as a block so
  // a file without headers isn't silently dropped.
  const blocks = [];
  let current = null;

  for (const line of lines) {
    if (/^\s*#{2,}/.test(line)) {
      if (current) blocks.push(current);
      current = [];
      continue;
    }
    if (current === null) {
      if (line.trim() === "") continue;
      current = [];
    }
    current.push(line);
  }
  if (current) blocks.push(current);

  const questions = blocks
    .filter((blk) => blk.some((l) => l.trim() !== ""))
    .map(blockToQuestion);

  if (!questions.length) {
    return {
      error:
        'No questions found. Start each question with a line like "### Question 1", then a label on each line (Topic:, Question (English):, ...).'
    };
  }
  return { questions };
}

// Reads a File and returns { questions } or { error }.
export function readQuestionsFile(file) {
  return new Promise((resolve) => {
    if (!file) return resolve({ error: "No file selected." });

    const name = file.name.toLowerCase();

    // A real Word file can't be read as text — guide the user to export it.
    if (name.endsWith(".docx") || name.endsWith(".doc")) {
      return resolve({
        error:
          "This is a Word file, which can't be read directly. Open it, then use " +
          "File → Download (Google Docs) or Save As (Word) → Plain Text (.txt), and upload that .txt file."
      });
    }

    const isText = name.endsWith(".txt") || name.endsWith(".text");
    if (!isText) {
      return resolve({ error: "Please upload a plain text (.txt) file." });
    }
    if (file.size > MAX_FILE_BYTES) {
      return resolve({ error: "File is too large (max 5 MB)." });
    }

    const reader = new FileReader();
    reader.onerror = () => resolve({ error: "Could not read the file." });
    reader.onload = () => {
      const text = String(reader.result || "");
      if (!text.trim()) return resolve({ error: "The file is empty." });
      resolve(parseDocQuestions(text));
    };
    reader.readAsText(file);
  });
}

// A ready-to-fill template with two example questions.
export const TEMPLATE_TXT = `### Question 1
Topic: algebra
Question (English): What is 2 + 2?
Question (Hindi): 2 + 2 कितना है?
Option A (English): 3
Option A (Hindi): ३
Option B (English): 4
Option B (Hindi): ४
Option C (English): 5
Option C (Hindi): ५
Option D (English): 6
Option D (Hindi): ६
Answer: B
Explanation (English): Because 2 + 2 = 4.
Explanation (Hindi): क्योंकि 2 + 2 = 4 होता है।

### Question 2
Topic: algebra
Question (English): What is 5 - 3?
Question (Hindi): 5 - 3 कितना है?
Option A (English): 1
Option A (Hindi): १
Option B (English): 2
Option B (Hindi): २
Option C (English): 3
Option C (Hindi): ३
Option D (English): 4
Option D (Hindi): ४
Answer: B
Explanation (English): 5 - 3 = 2.
Explanation (Hindi): 5 - 3 = 2 होता है।
`;

// Human-readable list of the labels each question needs (shown in the modal).
export const FIELD_LABELS = [
  "Topic",
  "Question (English)",
  "Question (Hindi)",
  "Option A/B/C/D (English)",
  "Option A/B/C/D (Hindi)",
  "Answer",
  "Explanation (English)",
  "Explanation (Hindi)"
];

// Triggers a download of the ready-to-fill .txt template.
export function downloadTemplate() {
  const blob = new Blob([TEMPLATE_TXT], { type: "text/plain;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "question_template.txt";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
