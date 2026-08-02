// Turns formula code stored between dollar signs into drawn formulas, and back.
//
// Storage format stays exactly what it already is: normal HTML, with formulas
// written between dollar signs, e.g.
//     <p>यदि x = 4 है, तो $\sqrt{x}$ का मान क्या होगा?</p>
// So nothing in the database or the bulk upload changes.

import katex from "katex";
import "katex/contrib/mhchem"; // adds \ce{...} for chemical equations

const MATH_PATTERN = /\$([^$\n]+)\$/g;

// Draw one formula. Returns HTML, or null if the code is not finished/valid.
export function drawFormula(code, displayMode = false) {
  try {
    return katex.renderToString(code, {
      throwOnError: true,
      displayMode,
      strict: false, // needed so Hindi words inside \text{} are allowed
    });
  } catch {
    return null;
  }
}

// Walk every piece of text inside `root` and swap $...$ for whatever
// `makeNode(code)` returns.
function swapMathInText(root, makeNode) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
  const found = [];
  let node;
  while ((node = walker.nextNode())) {
    if (node.nodeValue && node.nodeValue.includes("$")) found.push(node);
  }

  found.forEach((textNode) => {
    const text = textNode.nodeValue;
    MATH_PATTERN.lastIndex = 0;
    if (!MATH_PATTERN.test(text)) return;

    MATH_PATTERN.lastIndex = 0;
    const frag = document.createDocumentFragment();
    let cursor = 0;
    let match;

    while ((match = MATH_PATTERN.exec(text))) {
      if (match.index > cursor) {
        frag.appendChild(document.createTextNode(text.slice(cursor, match.index)));
      }
      frag.appendChild(makeNode(match[1]));
      cursor = match.index + match[0].length;
    }
    if (cursor < text.length) {
      frag.appendChild(document.createTextNode(text.slice(cursor)));
    }
    textNode.replaceWith(frag);
  });
}

// A formula block as it appears inside the editor: one solid, clickable chunk.
export function makeFormulaChip(code) {
  const chip = document.createElement("span");
  chip.className = "fx-chip";
  chip.setAttribute("contenteditable", "false");
  chip.dataset.latex = code;
  const html = drawFormula(code, false);
  if (html) chip.innerHTML = html;
  else chip.textContent = "$" + code + "$";
  return chip;
}

// Load saved HTML into an editable area, drawing the formulas.
export function loadIntoEditor(el, html) {
  el.innerHTML = html || "";
  swapMathInText(el, (code) => makeFormulaChip(code));
}

// Read an editable area back out in the storage format.
export function readFromEditor(el) {
  const copy = el.cloneNode(true);
  copy.querySelectorAll(".fx-chip").forEach((chip) => {
    chip.replaceWith(document.createTextNode("$" + chip.dataset.latex + "$"));
  });
  return copy.innerHTML.replace(/\u00A0/g, " ").trim();
}

// For read-only display (preview screens): saved HTML in, drawn HTML out.
export function drawMathInHtml(html) {
  if (!html) return "";
  const holder = document.createElement("div");
  holder.innerHTML = html;
  swapMathInText(holder, (code) => {
    const span = document.createElement("span");
    const drawn = drawFormula(code, false);
    if (drawn) span.innerHTML = drawn;
    else span.textContent = "$" + code + "$";
    return span;
  });
  return holder.innerHTML;
}
