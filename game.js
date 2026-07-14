// The Hollowbrook Files -- a serialized detective/logic-deduction game.
// Each case: a set of suspects, a sequence of clues (each eliminates and/or
// reinstates suspects from the "still suspected" set), and a solution.
// Clues apply in order; note fields carry narrative beats (e.g. dead ends).

const CASES = [
  {
    id: "ledger",
    title: "The Missing Ledger",
    location: "Hollowbrook Antiques",
    intro: "The shop's ledger -- the one recording every under-the-table deal Marlin Voss ever made -- is gone. The back window was found open. Four people were in the building that night.",
    suspects: [
      { id: "mara", name: "Mara Voss", role: "Assistant", height: "Medium", wore: "Green scarf", alibi: "Back room" },
      { id: "denny", name: "Denny Cole", role: "Delivery driver", height: "Tall", wore: "Brown jacket", alibi: "Loading dock" },
      { id: "iris", name: "Iris Chen", role: "Regular customer", height: "Short", wore: "Red coat", alibi: "Front counter" },
      { id: "walt", name: "Walt Ferro", role: "Rival dealer", height: "Tall", wore: "Grey suit", alibi: "\"Across town\"" },
    ],
    clues: [
      { text: "A neighbor saw the thief slip out back -- definitely not wearing anything red or green.", eliminate: ["iris", "mara"] },
      { text: "Store cameras caught a silhouette by the window: tall. Both remaining suspects fit.", eliminate: [], note: "Doesn't narrow it down alone -- keep going." },
      { text: "The delivery log is timestamped and confirmed by two other drivers: Denny never left the loading dock all evening.", eliminate: ["denny"] },
    ],
    solution: "walt",
    solvedExplain: "Walt Ferro. The color eliminated Iris and Mara, and Denny's alibi checked out on paper -- leaving only Walt, whose \"across town\" story nobody could confirm.",
    fragment: "Tucked in Walt's coat pocket when he was brought in: a business card for a company that doesn't officially exist. Just three words on it -- \"The Ledger Keeper.\"",
  },
  {
    id: "gallery",
    title: "The Locked Gallery",
    location: "The Ashford Private Gallery",
    intro: "A painting vanished from a locked room during a party of forty guests. The lock wasn't broken -- it was picked. Five people had reason to want it gone.",
    suspects: [
      { id: "priya", name: "Priya Nair", role: "Art critic", height: "Medium", wore: "Blue dress", hand: "Right-handed", alibi: "Garden" },
      { id: "oscar", name: "Oscar Lund", role: "Owner's nephew", height: "Tall", wore: "Black tux", hand: "Left-handed", alibi: "Bar" },
      { id: "ruth", name: "Ruth Okafor", role: "Security guard", height: "Medium", wore: "Grey uniform", hand: "Right-handed", alibi: "Front door" },
      { id: "theo", name: "Theo Marsh", role: "Photographer", height: "Short", wore: "Black tux", hand: "Right-handed", alibi: "Garden" },
      { id: "vale", name: "Vale Kim", role: "Caterer", height: "Tall", wore: "White uniform", hand: "Left-handed", alibi: "Kitchen" },
    ],
    clues: [
      { text: "Whoever picked the lock was tall enough to reach the high bolt without a chair.", eliminate: ["priya", "ruth", "theo"] },
      { text: "Scratch marks on the lock curve the way a left-handed pick would leave them. Both remaining suspects are left-handed.", eliminate: [], note: "Still tied. One more thread to pull." },
      { text: "Three kitchen staff swear Vale never once left their sight all night.", eliminate: ["vale"] },
      { text: "The painting turned up the next morning hidden in a garden hedge -- right where Priya said she'd been standing.", eliminate: [], note: "Suspicious-sounding, but Priya was already cleared by height. A scene doesn't undo a fact." },
    ],
    solution: "oscar",
    solvedExplain: "Oscar Lund. Height narrowed it to two left-handed suspects, Vale's alibi held up under witness, and the garden hedge was a red herring -- Priya was already out of the running.",
    fragment: "Oscar's phone had one recent contact with no name attached. Just a number, and a single word saved as the label: \"Keeper.\"",
  },
  {
    id: "partner",
    title: "The Silent Partner",
    location: "Hollowbrook Holdings",
    intro: "Company funds are missing and the bookkeeper is being blamed publicly. She swears it isn't her. Six people had some form of access that night -- but the truth doesn't add up the way it first looks.",
    suspects: [
      { id: "lena", name: "Lena Brook", role: "Bookkeeper (accused)", access: "None recorded", alibi: "Office" },
      { id: "marcus", name: "Marcus Wren", role: "Co-owner", access: "Temporary audit access", alibi: "Golf course" },
      { id: "sofia", name: "Sofia Diaz", role: "Auditor", access: "None recorded", alibi: "Office" },
      { id: "tobias", name: "Tobias Kane", role: "Investor", access: "None recorded", alibi: "Airport" },
      { id: "nadia", name: "Nadia Farrow", role: "IT admin", access: "Full server access", alibi: "Server room" },
      { id: "gil", name: "Gil Ashby", role: "Co-owner's brother", access: "None recorded", alibi: "\"Home alone\"" },
    ],
    clues: [
      { text: "The transfer used an admin override -- only IT staff or someone with temporary audit access could have triggered it.", eliminate: ["lena", "sofia", "tobias", "gil"], note: "That leaves Marcus and Nadia." },
      { text: "Security footage places both Marcus and Nadia in a first-floor meeting for the entire window of the breach.", eliminate: ["marcus", "nadia"], note: "That clears everyone we've got. If neither of them did it... someone else must have had access nobody logged." },
      { text: "A maintenance log turns up something the official records missed: Gil was quietly given server access two days earlier -- arranged informally by his brother Marcus, off the books.", reinstate: ["gil"], note: "Gil is back in the running." },
      { text: "Gil's alibi was 'home alone' -- but phone tower records place his phone near the office at 11pm that night.", eliminate: [] },
      { text: "A pawnshop receipt in Gil's car trunk, dated three days after the breach, matches a rare item missing from the company safe.", eliminate: [] },
    ],
    solution: "gil",
    solvedExplain: "Gil Ashby. He wasn't on the official access list at all -- which is exactly why he wasn't a suspect at first. His brother's off-the-books favor was the thread that unraveled it, and the alibi and pawnshop receipt sealed it. Lena was never involved.",
    fragment: "The pawnshop's buyer records list a shell company as the purchaser of Gil's stolen goods. Same registered agent as the business card from the antiques case. The Ledger Keeper isn't a person working alone.",
  },
];

const STORAGE_KEY = "hollowbrook.progress";

function loadProgress() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || { solved: [] };
  } catch {
    return { solved: [] };
  }
}
function saveProgress(p) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
}

let progress = loadProgress();
let view = { screen: "home" };

const app = document.getElementById("app");

function isUnlocked(index) {
  return index === 0 || progress.solved.includes(CASES[index - 1].id);
}

function render() {
  if (view.screen === "home") renderHome();
  else if (view.screen === "case") renderCase();
  else if (view.screen === "result") renderResult();
}

function renderHome() {
  const fragments = CASES.filter(c => progress.solved.includes(c.id)).map(c => c.fragment);
  let html = `
    <div class="eyebrow">A Hollowbrook Files Mystery</div>
    <h1>The Hollowbrook Files</h1>
    <div class="sub">Every case you close pulls back another layer of who's really running this town.</div>
  `;
  CASES.forEach((c, i) => {
    const unlocked = isUnlocked(i);
    const done = progress.solved.includes(c.id);
    html += `
      <div class="card case-list-item ${unlocked ? "" : "locked"} ${done ? "done" : ""}" data-case="${unlocked ? i : ""}">
        <div>
          <h2>${i + 1}. ${c.title}</h2>
          <div class="sub" style="margin:0">${c.location}</div>
        </div>
        <div class="badge">${done ? "Solved" : unlocked ? "Open" : "Locked"}</div>
      </div>
    `;
  });
  if (fragments.length) {
    html += `<h2 style="margin-top:24px">Case Board</h2>`;
    fragments.forEach(f => { html += `<div class="fragment">${f}</div>`; });
  }
  app.innerHTML = html;
  app.querySelectorAll("[data-case]").forEach(el => {
    const idx = el.getAttribute("data-case");
    if (idx === "") return;
    el.addEventListener("click", () => openCase(parseInt(idx, 10)));
  });
}

function openCase(index) {
  const c = CASES[index];
  view = {
    screen: "case",
    caseIndex: index,
    cluesRevealed: 1,
    suspected: new Set(c.suspects.map(s => s.id)),
    accusing: null,
  };
  render();
}

function applyCluesUpTo(c, count) {
  const suspected = new Set(c.suspects.map(s => s.id));
  for (let i = 0; i < count; i++) {
    const clue = c.clues[i];
    (clue.eliminate || []).forEach(id => suspected.delete(id));
    (clue.reinstate || []).forEach(id => suspected.add(id));
  }
  return suspected;
}

function renderCase() {
  const c = CASES[view.caseIndex];
  view.suspected = applyCluesUpTo(c, view.cluesRevealed);

  let html = `
    <div class="eyebrow">Case ${view.caseIndex + 1} &middot; ${c.location}</div>
    <h1>${c.title}</h1>
    <div class="sub">${c.intro}</div>
    <h2>Suspects</h2>
    <div class="suspect-grid">
  `;
  c.suspects.forEach(s => {
    const cleared = !view.suspected.has(s.id);
    const accusing = view.accusing === s.id;
    const meta = Object.entries(s).filter(([k]) => !["id", "name", "role"].includes(k))
      .map(([, v]) => v).join(" &middot; ");
    html += `
      <div class="suspect ${cleared ? "cleared" : ""} ${accusing ? "accusing" : ""}" data-suspect="${s.id}">
        <div class="name">${s.name}</div>
        <div class="meta">${s.role}</div>
        <div class="meta">${meta}</div>
      </div>
    `;
  });
  html += `</div><h2>Clues</h2>`;
  for (let i = 0; i < view.cluesRevealed; i++) {
    const clue = c.clues[i];
    html += `<div class="clue">${clue.text}${clue.note ? `<div class="note">${clue.note}</div>` : ""}</div>`;
  }

  const moreClues = view.cluesRevealed < c.clues.length;
  html += `<div class="row">`;
  if (moreClues) html += `<button class="btn secondary" id="nextClue">Reveal next clue (${c.clues.length - view.cluesRevealed} left)</button>`;
  html += `<button class="btn danger" id="accuseBtn" ${view.accusing ? "" : "disabled"}>Make your accusation</button>`;
  html += `<button class="btn secondary" id="backBtn">Back to case board</button>`;
  html += `</div>`;

  app.innerHTML = html;
  app.querySelectorAll("[data-suspect]").forEach(el => {
    el.addEventListener("click", () => {
      const id = el.getAttribute("data-suspect");
      view.accusing = view.accusing === id ? null : id;
      renderCase();
    });
  });
  const nextBtn = document.getElementById("nextClue");
  if (nextBtn) nextBtn.addEventListener("click", () => { view.cluesRevealed++; renderCase(); });
  document.getElementById("accuseBtn").addEventListener("click", resolveCase);
  document.getElementById("backBtn").addEventListener("click", () => { view = { screen: "home" }; render(); });
}

function rankFor(cluesUsed, total) {
  const frac = cluesUsed / total;
  if (frac <= 0.5) return "Master Detective";
  if (frac < 1) return "Sharp Eye";
  return "Case Closed (barely)";
}

function resolveCase() {
  const c = CASES[view.caseIndex];
  const correct = view.accusing === c.solution;
  if (correct && !progress.solved.includes(c.id)) {
    progress.solved.push(c.id);
    saveProgress(progress);
  }
  view = { screen: "result", caseIndex: view.caseIndex, correct, cluesUsed: view.cluesRevealed };
  render();
}

function renderResult() {
  const c = CASES[view.caseIndex];
  const html = `
    <div class="card result ${view.correct ? "" : "fail"}">
      <h2>${view.correct ? "Case Closed" : "Wrong Call"}</h2>
      ${view.correct ? `<div class="rank">${rankFor(view.cluesUsed, c.clues.length)}</div>` : ""}
      <p>${view.correct ? c.solvedExplain : "That's not who did it. Take another look at the clues -- the answer's in there."}</p>
      ${view.correct ? `<div class="fragment">${c.fragment}</div>` : ""}
      <div class="row">
        ${view.correct ? `<button class="btn" id="continueBtn">Continue</button>` : `<button class="btn" id="retryBtn">Try again</button>`}
      </div>
    </div>
  `;
  app.innerHTML = html;
  const cont = document.getElementById("continueBtn");
  if (cont) cont.addEventListener("click", () => { view = { screen: "home" }; render(); });
  const retry = document.getElementById("retryBtn");
  if (retry) retry.addEventListener("click", () => openCase(view.caseIndex));
}

render();
