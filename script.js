// ===== Defaults: edit these to set your own countdown =====
const DEFAULT_TITLE = "memo & ror vacation";
const DEFAULT_DATE = "2026-12-20T00:00"; // local time, YYYY-MM-DDTHH:MM
const DEFAULT_COLOR = "#FFB400";

// Quick-pick colors shown in the editor
const PRESETS = [
  "#FFB400",
  "#FF5A5F",
  "#2EC4B6",
  "#7B61FF",
  "#3A86FF",
  "#1D2B5C",
];

// URL params override defaults: ?title=Trip&date=2026-12-20T08:00&color=FF5A5F
const params = new URLSearchParams(location.search);
let title = params.get("title") || DEFAULT_TITLE;
let dateStr = params.get("date") || DEFAULT_DATE;
let color = cleanColor(params.get("color")) || DEFAULT_COLOR;

const $ = (id) => document.getElementById(id);
const pad = (n) => String(n).padStart(2, "0");
let target, timer;

// Accepts "FF5A5F" or "#ff5a5f", returns "#FF5A5F" or null
function cleanColor(c) {
  if (!c) return null;
  c = c.replace("#", "");
  return /^[0-9a-f]{6}$/i.test(c) ? "#" + c.toUpperCase() : null;
}

// Dark text on light colors, white text on dark colors
function textColorFor(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 150 ? "#1D2B5C" : "#FFFFFF";
}

function applyColor(c) {
  const root = document.documentElement.style;
  root.setProperty("--accent", c);
  root.setProperty("--on-accent", textColorFor(c));
}

function render() {
  target = new Date(dateStr);
  $("title").textContent = title;
  document.title = title + " – countdown";
  $("target").textContent = isNaN(target)
    ? "Set a valid date with “Change countdown”."
    : target.toLocaleString(undefined, {
        dateStyle: "full",
        timeStyle: "short",
      });
  applyColor(color);

  clearInterval(timer);
  document.body.classList.remove("is-done");
  tick();
  timer = setInterval(tick, 1000);
}

function tick() {
  if (isNaN(target)) return;
  let diff = Math.floor((target - Date.now()) / 1000);
  if (diff <= 0) {
    document.body.classList.add("is-done");
    clearInterval(timer);
    return;
  }
  const d = Math.floor(diff / 86400);
  diff %= 86400;
  const h = Math.floor(diff / 3600);
  diff %= 3600;
  const m = Math.floor(diff / 60);
  const s = diff % 60;

  $("d").textContent = d;
  $("dl").textContent = d === 1 ? "day" : "days";
  $("h").textContent = pad(h);
  $("m").textContent = pad(m);
  $("s").textContent = pad(s);
}

// ===== Editor dialog =====
const dlg = $("editor");
let pickedColor = color;

function selectSwatch(c) {
  pickedColor = c;
  $("inColor").value = c;
  applyColor(c); // live preview behind the dialog
  document
    .querySelectorAll(".swatch")
    .forEach((btn) =>
      btn.setAttribute("aria-pressed", btn.dataset.color === c),
    );
}

// Build the swatch buttons once
PRESETS.forEach((c) => {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "swatch";
  btn.style.background = c;
  btn.dataset.color = c;
  btn.setAttribute("aria-label", "Color " + c);
  btn.addEventListener("click", () => selectSwatch(c));
  $("swatches").appendChild(btn);
});

$("inColor").addEventListener("input", (e) =>
  selectSwatch(e.target.value.toUpperCase()),
);

$("editBtn").addEventListener("click", () => {
  $("inTitle").value = title;
  $("inDate").value = dateStr.slice(0, 16);
  selectSwatch(color);
  dlg.showModal();
});

$("cancel").addEventListener("click", () => {
  applyColor(color); // undo the preview
  dlg.close();
});

$("form").addEventListener("submit", () => {
  title = $("inTitle").value.trim() || DEFAULT_TITLE;
  dateStr = $("inDate").value || DEFAULT_DATE;
  color = pickedColor;
  const p = new URLSearchParams({
    title,
    date: dateStr,
    color: color.slice(1),
  });
  history.replaceState(null, "", "?" + p.toString());
  render();
});

render();
