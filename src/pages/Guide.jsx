import { useState } from "react";

// In-app "How to use the Admin site" guide. Built as an accordion so the page
// stays calm and scannable instead of a wall of text. Content mirrors the real
// flows: Subjects → Topics → Questions → Sets → Packages, plus publish/lock
// rules, bulk upload, and troubleshooting.

/* ------------------------------------------------------------------ */
/* Styles (declared first so module-level content below can use them)  */
/* ------------------------------------------------------------------ */

const heroCard = {
  padding: "24px",
  borderRadius: "12px",
  background: "linear-gradient(135deg, #111827, #374151)",
  color: "white",
};

const card = {
  marginTop: "20px",
  padding: "20px 22px",
  border: "1px solid #e5e7eb",
  borderRadius: "12px",
  background: "#fff",
};

const h2 = { fontSize: "17px", fontWeight: 600, margin: "0 0 12px", color: "#111827" };
const h3 = { fontSize: "14px", fontWeight: 600, margin: "0 0 4px" };
const p = { margin: "0 0 12px", color: "#374151", fontSize: "14px", lineHeight: 1.6 };

const ladderWrap = { display: "flex", flexDirection: "column", gap: "8px" };
const ladderRow = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  padding: "10px 12px",
  border: "1px solid #eef2f7",
  borderRadius: "8px",
  background: "#f9fafb",
  fontSize: "14px",
};
const ladderNum = {
  flexShrink: 0,
  width: "24px",
  height: "24px",
  borderRadius: "50%",
  background: "#111827",
  color: "white",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "13px",
  fontWeight: 600,
};

const calloutInfo = {
  padding: "12px 14px",
  borderRadius: "8px",
  background: "#eff6ff",
  border: "1px solid #bfdbfe",
  color: "#1e3a8a",
  fontSize: "13.5px",
  lineHeight: 1.6,
  marginTop: "12px",
};

const ghostBtn = {
  padding: "6px 12px",
  background: "white",
  color: "#374151",
  border: "1px solid #d1d5db",
  borderRadius: "6px",
  cursor: "pointer",
  fontSize: "13px",
};

const accItem = { border: "1px solid #e5e7eb", borderRadius: "10px", overflow: "hidden", background: "#fff" };
const accHeader = {
  width: "100%",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "14px 16px",
  background: "#fff",
  border: "none",
  cursor: "pointer",
  textAlign: "left",
};
const accBody = { padding: "4px 18px 18px", borderTop: "1px solid #f3f4f6" };

const badge = {
  flexShrink: 0,
  width: "26px",
  height: "26px",
  borderRadius: "8px",
  background: "#eef2ff",
  color: "#4338ca",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "13px",
  fontWeight: 700,
};

const dosGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
  gap: "12px",
  marginTop: "12px",
};
const listBox = { padding: "12px 14px", border: "1px solid", borderRadius: "8px" };
const miniBox = { padding: "10px 14px", background: "#f9fafb", borderRadius: "6px" };
const ul = { margin: 0, paddingLeft: "18px" };
const li = { marginBottom: "6px", fontSize: "13.5px", color: "#374151", lineHeight: 1.55 };

const tbl = { width: "100%", borderCollapse: "collapse", fontSize: "13.5px" };
const th = { textAlign: "left", padding: "10px", background: "#f9fafb", borderBottom: "2px solid #e5e7eb", color: "#374151" };
const td = { padding: "10px", borderBottom: "1px solid #f3f4f6", color: "#374151", verticalAlign: "top", lineHeight: 1.55 };

/* ------------------------------------------------------------------ */
/* Small building blocks used inside section bodies                    */
/* ------------------------------------------------------------------ */

function Steps({ items }) {
  return (
    <ol style={{ margin: "0 0 4px", paddingLeft: "20px" }}>
      {items.map((s, i) => (
        <li key={i} style={{ marginBottom: "8px", lineHeight: 1.6, color: "#374151" }}>{s}</li>
      ))}
    </ol>
  );
}

function DoDont({ dos, donts }) {
  return (
    <div style={dosGrid}>
      <div style={{ ...miniBox, borderLeft: "4px solid #10b981" }}>
        <strong style={{ color: "#065f46", fontSize: "13px" }}>Do</strong>
        <ul style={{ ...ul, marginTop: "6px" }}>
          {dos.map((d, i) => <li key={i} style={li}>{d}</li>)}
        </ul>
      </div>
      <div style={{ ...miniBox, borderLeft: "4px solid #ef4444" }}>
        <strong style={{ color: "#991b1b", fontSize: "13px" }}>Don't</strong>
        <ul style={{ ...ul, marginTop: "6px" }}>
          {donts.map((d, i) => <li key={i} style={li}>{d}</li>)}
        </ul>
      </div>
    </div>
  );
}

function Note({ children }) {
  return <div style={calloutInfo}>{children}</div>;
}

/* ------------------------------------------------------------------ */
/* Content                                                             */
/* ------------------------------------------------------------------ */

const LADDER = [
  { title: "Subjects", desc: "broad areas, e.g. Maths, Reasoning, English." },
  { title: "Topics", desc: "sit inside a subject, e.g. Algebra under Maths." },
  { title: "Questions", desc: "each belongs to one subject + topic." },
  { title: "Sets (mock tests)", desc: "sections → subjects → questions pulled from your question bank." },
  { title: "Packages (Test Series)", desc: "bundle several published sets under one exam, e.g. \"SSC CGL Tier 1\"." },
];

const SECTIONS = [
  {
    title: "Logging in & finding your way around",
    body: (
      <>
        <Steps items={[
          "Open the admin site and sign in with your admin email and password.",
          "Use the left sidebar to move between sections: Dashboard, Subjects, Topics, Questions, Sets, and Packages.",
          "The Logout button is at the top-right of every page. Always log out on a shared computer.",
        ]} />
        <Note>
          New here? Follow the sections below in order (1 → 7). Each builds on the one before it.
        </Note>
      </>
    ),
  },
  {
    title: "Step 1 — Create Subjects",
    body: (
      <>
        <p style={p}>Subjects are the broadest buckets (Maths, Reasoning, English…).</p>
        <Steps items={[
          "Go to Subjects in the sidebar.",
          "Type the subject name in the box.",
          "Click Create Subject. The web address slug (used behind the scenes) is made for you automatically from the name.",
          "Your new subject appears in the table below.",
        ]} />
        <DoDont
          dos={[
            "Keep names short and clear (\"Maths\", not \"Mathematics for SSC 2025\").",
            "Create every subject you'll need before adding topics.",
          ]}
          donts={[
            "Don't create the same subject twice.",
            "Don't delete a subject that already has questions in a live test — its questions go with it.",
          ]}
        />
      </>
    ),
  },
  {
    title: "Step 2 — Add Topics",
    body: (
      <>
        <p style={p}>
          Topics live inside a subject (e.g. <em>Algebra</em> under <em>Maths</em>).
          Every question needs a topic.
        </p>
        <Steps items={[
          "Go to Topics.",
          "Pick the subject this topic belongs to from the dropdown.",
          "Type the topic name AND the slug. Unlike subjects, the topic slug is typed by you — keep it lowercase with hyphens, e.g. \"algebra\" or \"time-and-work\".",
          "Click Create Topic.",
        ]} />
        <Note>
          <strong>Remember the slug.</strong> You'll need the exact topic slug later if you use
          <strong> Bulk Upload</strong> for questions. It's always shown in the Topics table, so you can copy it from there.
        </Note>
        <DoDont
          dos={[
            "Use simple, consistent slugs (lowercase, hyphens, no spaces).",
            "Double-check you picked the right subject before creating.",
          ]}
          donts={[
            "Don't put spaces or capital letters in a slug.",
            "Don't reuse the same slug for two different topics in the same subject.",
          ]}
        />
      </>
    ),
  },
  {
    title: "Step 3 — Add Questions",
    body: (
      <>
        <p style={p}>Questions go into your question bank, ready to be used in any set.</p>
        <Steps items={[
          "Go to Questions.",
          "Choose the Subject, then the Topic.",
          "Write the question in both English and Hindi — both are required.",
          "Fill all four options in English and Hindi. You can add or remove options (minimum 2).",
          "Select the correct answer using the radio button next to it.",
          "Write the explanation in English and Hindi — both are required.",
          "Click Save Question. It now appears in the list below and is ready to add to sets.",
        ]} />

        <p style={{ ...p, margin: "10px 0 6px" }}><strong>Finding, editing & deleting</strong></p>
        <Steps items={[
          "The list under the form shows every question in the chosen topic, in pages — use the Search box to find one by its English text.",
          "Click Edit on a row to load it into the form, make changes, then click Update Question (Cancel edit backs out).",
          "Click Delete to remove a question. If it's only in draft sets, it's removed from those too and you'll be told how many.",
          "If a question is in a published set, you'll see a 🔒 lock showing which set(s) — you can't edit or delete it until you unpublish that set.",
        ]} />

        <Note>
          If you save a question whose text already exists in the same topic, you'll get a
          <strong> “create anyway?”</strong> prompt — so you don't add duplicates by accident.
        </Note>

        <DoDont
          dos={[
            "Fill every field in both languages — the question won't save otherwise.",
            "Pick exactly one correct answer.",
            "Use Edit to fix a question instead of deleting and re-adding it (that keeps its code).",
            "Unpublish a set first if you need to change a question locked inside it.",
          ]}
          donts={[
            "Don't leave the Hindi fields, any option, or the explanation blank — save will be rejected with a message telling you what's missing.",
            "Don't forget to select the correct option.",
          ]}
        />
        <Note>Got many questions to add? Skip the one-by-one form and use <strong>Bulk Upload</strong> (section 5).</Note>
      </>
    ),
  },
  {
    title: "Step 4 — Build a Set (a mock test)",
    body: (
      <>
        <p style={p}>
          A Set is one full mock test. It's made of <strong>sections</strong> (e.g. Maths section),
          each holding <strong>subjects</strong> with a fixed number of questions.
        </p>
        <Steps items={[
          "Go to Sets and click + Create Set. Give it a clear title.",
          "Inside the set, click + Section. Enter the section name, duration (minutes), and the positive & negative marks.",
          "In that section, click + Add Subject. Pick a subject and set Max Questions (how many questions this subject must have).",
          "Add questions to each subject — one by one with Add Question, or all at once with Bulk Upload.",
          "Fill every subject up to its Max Questions number. The set can't be published until they're all complete.",
          "When everything is full, click Publish.",
        ]} />
        <Note>
          Before publishing, the set shows a checklist like <em>“Maths → Algebra (8/10)”</em>. That means
          2 more questions are needed there. Publish unlocks only when every subject shows a full count.
        </Note>
        <DoDont
          dos={[
            "Give sections realistic durations and correct +/- marks.",
            "Fill each subject exactly to its Max Questions.",
            "Publish only after a final review.",
          ]}
          donts={[
            "Don't add the same subject to two sections of the same set — it's not allowed.",
            "Don't use a section name twice in the same set.",
            "Don't try to publish a half-filled set — it will be blocked.",
          ]}
        />
      </>
    ),
  },
  {
    title: "Step 5 — Bulk Upload questions (the fast, easy way)",
    body: (
      <>
        <p style={p}>
          Instead of adding questions one by one, write them in a simple text document and upload
          it — all the questions get added to a subject at once. No Excel or spreadsheets needed.
          You'll find the <strong>⇪ Bulk Upload</strong> button on each subject inside a set.
        </p>

        <p style={{ ...p, marginBottom: "6px" }}><strong>Which software can I use?</strong></p>
        <Steps items={[
          "Google Docs (free, in your browser) — the easiest option.",
          "Microsoft Word.",
          "Notepad (Windows) or TextEdit (Mac) — already a plain text file, nothing extra to do.",
        ]} />

        <p style={{ ...p, margin: "10px 0 6px" }}><strong>Step by step</strong></p>
        <Steps items={[
          "Open a set, find the subject you want to fill, and click ⇪ Bulk Upload.",
          "Click Download template (.txt) to get a ready-made example file.",
          "Open that template in Google Docs, Word, or Notepad and copy the pattern for each question.",
          "Start every question with a line like \"### Question 1\", then \"### Question 2\", and so on.",
          "Under each, fill one line per label: Topic, Question (English), Question (Hindi), the four Options in English and Hindi, Answer, and Explanation in both languages.",
          "For Answer, just write the correct letter — A, B, C, or D.",
          "For Topic, use the exact topic slug shown on the Topics page.",
          "Save it as a plain text (.txt) file (see the important note below), then choose it and click Upload.",
          "If anything is wrong, you'll get a clear list by question number — fix those and upload again.",
        ]} />

        <Note>
          <strong>Saving from Google Docs or Word:</strong> you must save as <strong>Plain Text (.txt)</strong>,
          not the normal document. In <strong>Google Docs</strong>: File → Download → <em>Plain text (.txt)</em>.
          In <strong>Word</strong>: File → Save As → choose <em>Plain Text (.txt)</em>. In{" "}
          <strong>Notepad / TextEdit</strong> it's already plain text. A normal <code>.docx</code> file
          can't be read — but don't worry, if you pick one by mistake the upload tells you exactly what to do.
        </Note>

        <Note>
          The upload is <strong>all-or-nothing</strong>: if even one question has a problem, nothing is added
          until you fix it. It also respects the subject's remaining slots — you can't overfill it.
        </Note>

        <DoDont
          dos={[
            "Start from the downloaded template and keep the labels exactly as they are.",
            "Begin each question with ### Question 1, ### Question 2, …",
            "Keep each label and its answer on a single line.",
            "Use the exact topic slug shown on the Topics page.",
            "Save as Plain Text (.txt) before uploading.",
          ]}
          donts={[
            "Don't upload a Word .docx or Google Doc directly — download it as plain text (.txt) first.",
            "Don't rename or delete the labels (Topic:, Question (English):, Answer:, …).",
            "Don't leave any line blank — every field is required.",
            "Don't put more questions than the subject's remaining slots.",
          ]}
        />
      </>
    ),
  },
  {
    title: "Step 6 — Bundle Sets into a Package (Test Series)",
    body: (
      <>
        <p style={p}>
          A Package groups several sets under one exam name so students see a tidy “Test Series”.
        </p>
        <Steps items={[
          "Go to Packages and click + Create Package. Enter a name and a type / exam group (e.g. \"SSC CGL Tier 1\").",
          "Open the package. Fill in the details — description and display order if you like.",
          "Under Mocks, pick a set from the dropdown and click Add mock. Repeat for each set you want in the series.",
          "When the series is ready, click Publish.",
        ]} />
        <Note>
          Only <strong>published</strong> sets show up to students inside the package. A draft set added
          to the package stays hidden until you publish that set too.
        </Note>
        <DoDont
          dos={[
            "Use a clear exam name so students recognise it on their dashboard.",
            "Publish the sets first, then publish the package.",
          ]}
          donts={[
            "Don't expect a draft mock to appear for students — publish it.",
            "Don't leave a package as a draft if you want students to see it.",
          ]}
        />
      </>
    ),
  },
  {
    title: "Step 7 — Publishing & the lock rule (very important)",
    body: (
      <>
        <p style={p}>
          Publishing makes something live for students. To protect live content, anything
          <strong> published is locked</strong>.
        </p>
        <Steps items={[
          "A published Set or Package cannot be edited or deleted.",
          "The questions inside a published set are locked too — on the Questions page they show a 🔒 with the set's name instead of Edit/Delete.",
          "To change any of this, click Unpublish first, make your changes, then Publish again.",
          "While a set/package is published, its edit and delete buttons are hidden or disabled on purpose.",
        ]} />
        <Note>
          Unpublishing hides the item from students while you edit. Republish as soon as you're done so
          students get it back.
        </Note>
        <Note>
          If you delete a question that a <em>draft</em> set was using, that set loses a question and drops
          below its Max — so it will need refilling before it can be published again. Publishing also blocks
          if a set still contains a deleted question.
        </Note>
        <DoDont
          dos={[
            "Unpublish → edit → republish when you must fix live content.",
            "Do your final review before publishing to avoid unpublishing later.",
          ]}
          donts={[
            "Don't panic if edit/delete buttons are missing — the item is just published (locked).",
            "Don't leave something unpublished for long if students are meant to be using it.",
          ]}
        />
      </>
    ),
  },
];

const MASTER_DOS = [
  "Build bottom-up: Subjects → Topics → Questions → Sets → Packages.",
  "Fill both English and Hindi for every question and explanation.",
  "Fill each subject in a set exactly to its Max Questions before publishing.",
  "Publish sets first, then the package that contains them.",
  "Unpublish before editing anything that's already live.",
  "For bulk upload, use the .txt template and save as Plain Text before uploading.",
  "Log out when you're done on a shared computer.",
];

const MASTER_DONTS = [
  "Don't add the same subject to two sections of one set.",
  "Don't reuse a section name within the same set.",
  "Don't try to publish a half-filled set.",
  "Don't expect draft sets/packages to be visible to students.",
  "Don't delete subjects/topics that are used by live tests.",
  "Don't use spaces or capitals in slugs.",
  "Don't upload a Word .docx for bulk upload — save it as Plain Text (.txt) first.",
];

const TROUBLE = [
  { q: "Publish button is greyed out on a set", a: "A subject isn't full yet. Check the checklist (e.g. \"8/10\") and add the missing questions." },
  { q: "\"Cannot modify a published…\" message", a: "The set or package is published and locked. Click Unpublish, make your change, then publish again." },
  { q: "Bulk upload rejected with a question list", a: "One or more questions have problems (missing line, wrong topic slug, bad answer). Fix those exact questions and upload again — nothing was added." },
  { q: "\"This is a Word file…\" on upload", a: "You picked a .docx/.doc. In Google Docs use File → Download → Plain text (.txt); in Word use Save As → Plain Text. Then upload that .txt file." },
  { q: "\"topic not found under this subject\"", a: "The topic_slug doesn't match a topic in this subject. Copy the exact slug from the Topics page." },
  { q: "\"Only N slot(s) left\" on bulk upload", a: "Your file has more questions than the subject can hold. Remove extra rows or raise the subject's Max Questions." },
  { q: "Question won't save", a: "A required field is empty. The message tells you which — fill the English + Hindi text, every option, a selected correct answer, and both explanations." },
  { q: "🔒 In: <set name> instead of Edit/Delete", a: "That question is used in a published set. Unpublish the named set to edit or delete the question." },
  { q: "\"...has N deleted question(s)\" when publishing a set", a: "A question the set used was deleted. Open the set, remove the empty slot(s), and add replacement questions, then publish." },
  { q: "Students can't see a mock", a: "Both the set AND its package must be published. Check that neither is a draft." },
  { q: "Edit / Delete buttons disappeared", a: "The item is published (locked). Unpublish to bring them back." },
];

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

function Guide() {
  // first section open by default; the rest collapsed
  const [open, setOpen] = useState({ 0: true });

  const toggle = (i) => setOpen((o) => ({ ...o, [i]: !o[i] }));
  const setAll = (val) => {
    const next = {};
    SECTIONS.forEach((_, i) => (next[i] = val));
    setOpen(next);
  };

  return (
    <div style={{ maxWidth: "860px", margin: "0 auto", paddingBottom: "60px" }}>
      {/* Intro */}
      <div style={heroCard}>
        <h1 style={{ margin: 0, fontSize: "26px" }}>Admin Guide</h1>
        <p style={{ margin: "10px 0 0", color: "#e5e7eb", fontSize: "15px", lineHeight: 1.6 }}>
          A simple, step-by-step walkthrough of how to run the TestPortal admin site —
          from adding your first subject to publishing a full test series for students.
          Take it in order the first time; after that, jump to any section you need.
        </p>
      </div>

      {/* Big picture */}
      <div style={card}>
        <h2 style={h2}>The big picture (read this first)</h2>
        <p style={p}>
          Everything is built in layers. Each layer sits on top of the one before it,
          so you build <strong>bottom-up</strong>:
        </p>
        <div style={ladderWrap}>
          {LADDER.map((step, i) => (
            <div key={i} style={ladderRow}>
              <span style={ladderNum}>{i + 1}</span>
              <div>
                <strong>{step.title}</strong>
                <span style={{ color: "#6b7280" }}> — {step.desc}</span>
              </div>
            </div>
          ))}
        </div>
        <div style={{ ...calloutInfo, marginTop: "16px" }}>
          <strong>Golden rule for visibility:</strong> a student can only see a mock test when
          the <strong>Set is Published</strong> <em>and</em> it sits inside a{" "}
          <strong>Package that is also Published</strong>. If either one is a draft, students
          won't see it.
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "24px 0 10px" }}>
        <h2 style={{ ...h2, margin: 0 }}>Step-by-step</h2>
        <div style={{ display: "flex", gap: "8px" }}>
          <button onClick={() => setAll(true)} style={ghostBtn}>Expand all</button>
          <button onClick={() => setAll(false)} style={ghostBtn}>Collapse all</button>
        </div>
      </div>

      {/* Accordion */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {SECTIONS.map((sec, i) => (
          <div key={i} style={accItem}>
            <button onClick={() => toggle(i)} style={accHeader}>
              <span style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span style={badge}>{i + 1}</span>
                <span style={{ fontWeight: 600, fontSize: "15px" }}>{sec.title}</span>
              </span>
              <span style={{ color: "#9ca3af", fontSize: "18px" }}>{open[i] ? "–" : "+"}</span>
            </button>

            {open[i] && <div style={accBody}>{sec.body}</div>}
          </div>
        ))}
      </div>

      {/* Master Do / Don't */}
      <div style={{ ...card, marginTop: "28px" }}>
        <h2 style={h2}>Dos &amp; Don'ts at a glance</h2>
        <div style={dosGrid}>
          <div style={{ ...listBox, borderColor: "#a7f3d0", background: "#f0fdf4" }}>
            <h3 style={{ ...h3, color: "#065f46" }}>✔ Do</h3>
            <ul style={ul}>
              {MASTER_DOS.map((d, i) => <li key={i} style={li}>{d}</li>)}
            </ul>
          </div>
          <div style={{ ...listBox, borderColor: "#fecaca", background: "#fef2f2" }}>
            <h3 style={{ ...h3, color: "#991b1b" }}>✘ Don't</h3>
            <ul style={ul}>
              {MASTER_DONTS.map((d, i) => <li key={i} style={li}>{d}</li>)}
            </ul>
          </div>
        </div>
      </div>

      {/* Troubleshooting */}
      <div style={{ ...card, marginTop: "20px" }}>
        <h2 style={h2}>Something went wrong? Quick fixes</h2>
        <div style={{ overflowX: "auto" }}>
          <table style={tbl}>
            <thead>
              <tr>
                <th style={th}>What you see</th>
                <th style={th}>What it means &amp; how to fix it</th>
              </tr>
            </thead>
            <tbody>
              {TROUBLE.map((t, i) => (
                <tr key={i}>
                  <td style={td}><strong>{t.q}</strong></td>
                  <td style={td}>{t.a}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Guide;
