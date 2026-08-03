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
//
// A value may run over as many lines as it needs — everything after a label,
// up to the next label, belongs to that label. So a long explanation typed with
// Enter, Tab and blank lines in Word keeps all of its lines and its layout.

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

// These two are short codes, not question text: they stay one plain line and are
// never turned into HTML. Everything else is rich text shown to students.
const PLAIN_FIELDS = new Set(["topic_slug", "answer"]);

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

// Own-property lookup only, so ordinary words like "constructor" or "toString"
// appearing in a question can never be mistaken for a label.
const lookupLabel = (normalized) =>
  Object.prototype.hasOwnProperty.call(LABEL_MAP, normalized)
    ? LABEL_MAP[normalized]
    : null;

// Same rule the backend uses to build subject/topic slugs, so "Coding Decoding"
// or "Simplification" in the file still finds the topic.
const slugify = (s) =>
  String(s || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

// Word, Google Docs and TextEdit all sneak invisible characters into a "plain
// text" export. Fold them all down to plain lines and plain spaces first, so the
// rest of the parser only ever sees "\n" and normal spaces.
function normalizeText(text) {
  return String(text)
    .replace(/\r\n?/g, "\n") // Windows / classic-Mac line endings
    .replace(/[\u2028\u2029]/g, "\n") // Word line/paragraph separators
    .replace(/\t/g, " ") // tabs used for indentation
    .replace(/[\u00A0\u2007\u202F]/g, " ") // non-breaking spaces
    .replace(/[\u200B-\u200D\uFEFF]/g, ""); // BOM + zero-width joiners
}

const escapeHtml = (s) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// Turns the lines collected under one label into the HTML the app stores.
// Blank lines become blank lines, every Enter becomes a line break, and any
// <, > or & the admin typed shows up literally instead of breaking the page.
// Formulas written between dollar signs pass through untouched.
function linesToHtml(lines) {
  const trimmed = lines.map((l) => l.trim());

  while (trimmed.length && trimmed[0] === "") trimmed.shift();
  while (trimmed.length && trimmed[trimmed.length - 1] === "") trimmed.pop();

  // a run of empty lines reads as one blank line
  const kept = trimmed.filter((l, i) => l !== "" || trimmed[i - 1] !== "");

  return kept.map(escapeHtml).join("<br>");
}

const firstLine = (lines) => (lines.find((l) => l.trim() !== "") || "").trim();

// Pull a single option letter out of whatever the user typed, e.g. "B", "b)",
// "Option B", "b - correct" all become "B". Stored uppercase to match how
// questions created through the normal form are stored.
function normalizeAnswer(raw) {
  const cleaned = String(raw || "").toLowerCase().replace(/^option\s+/, "");
  const m = cleaned.match(/(?:^|[^a-z])([a-d])(?:[^a-z]|$)/);
  return (m ? m[1] : cleaned.trim()).toUpperCase();
}

// A line that starts a new question, e.g. "### Question 1" or a bare
// "Question 1" / "Q2." typed without the hashes.
function isHeaderLine(line) {
  const s = line.trim();
  if (!s) return false;
  if (/^#{2,}/.test(s)) return true;
  return /^(?:question|q)\s*(?:no\.?|number)?\s*[-–—.:)]?\s*\d+\s*[-–—.:)]*$/i.test(s);
}

// Returns the field this line starts, or null if it is a continuation line.
// A label may carry its value inline ("Answer: B") or sit on its own line with
// the value underneath.
function labelOnLine(line) {
  const idx = line.indexOf(":");
  if (idx !== -1) {
    const key = lookupLabel(normalizeLabel(line.slice(0, idx)));
    if (key) return key;
  }
  return lookupLabel(normalizeLabel(line));
}

function blockToQuestion(lines) {
  const collected = {}; // internal key -> the lines belonging to it
  let currentKey = null;

  for (const line of lines) {
    const key = labelOnLine(line);

    // A label already seen in this question is treated as ordinary text — that
    // way a word like "Answer:" inside an explanation stays in the explanation
    // instead of silently overwriting the real answer.
    if (key && !collected[key]) {
      const idx = line.indexOf(":");
      collected[key] = [idx === -1 ? "" : line.slice(idx + 1)];
      currentKey = key;
      continue;
    }

    // Anything before the first label (stray notes under the header) is dropped.
    if (currentKey) collected[currentKey].push(line);
  }

  const out = {};
  FIELD_KEYS.forEach((k) => {
    const value = collected[k];
    if (!value) {
      out[k] = "";
      return;
    }
    out[k] = PLAIN_FIELDS.has(k) ? firstLine(value) : linesToHtml(value);
  });

  out.topic_slug = slugify(out.topic_slug);
  out.answer = normalizeAnswer(out.answer);
  return out;
}

export function parseDocQuestions(text) {
  const lines = normalizeText(text).split("\n");

  // Split into blocks: a header line begins a new question. Content before the
  // first header still counts as a block so a file without headers isn't
  // silently dropped.
  const blocks = [];
  let current = null;

  for (const line of lines) {
    if (isHeaderLine(line)) {
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
    reader.readAsText(file, "utf-8");
  });
}

// A ready-to-fill template with two example questions. The second one shows a
// multi-line explanation, since that is the most common thing people need.
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
Question (English): What number should be subtracted from (23/40 + 13/20 - 7/10) to get 3/8?
Question (Hindi): (23/40 + 13/20 - 7/10) में से कौन-सी संख्या घटाई जाए कि परिणाम 3/8 प्राप्त हो?
Option A (English): 17/20
Option A (Hindi): 17/20
Option B (English): 3/20
Option B (Hindi): 3/20
Option C (English): 19/40
Option C (Hindi): 19/40
Option D (English): 6/20
Option D (Hindi): 6/20
Answer: B
Explanation (English): According to the question,

23/40 + 13/20 - 7/10 = 21/40

Let the required number be x.

21/40 - x = 3/8
x = 21/40 - 3/8 = 21/40 - 15/40 = 6/40 = 3/20

Therefore, the correct answer is 3/20.
Explanation (Hindi): प्रश्न के अनुसार,

23/40 + 13/20 - 7/10 = 21/40

मान लीजिए घटाई जाने वाली संख्या x है।

21/40 - x = 3/8
x = 21/40 - 3/8 = 21/40 - 15/40 = 6/40 = 3/20

अतः सही उत्तर 3/20 है।
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
