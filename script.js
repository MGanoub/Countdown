import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  doc,
  onSnapshot,
  setDoc,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ===== 1. Paste your config from the Firebase console here =====
const firebaseConfig = {
  apiKey: "AIzaSyC28h1EaHuX9l95_PKzfRTXgQ1bZhf4kD0",
  authDomain: "countdown-49055.firebaseapp.com",
  projectId: "countdown-49055",
  storageBucket: "countdown-49055.firebasestorage.app",
  messagingSenderId: "758076170225",
  appId: "1:758076170225:web:adac9add33d3b6b493ae50",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const settingsRef = doc(db, "countdowns", "main"); // collection "countdowns", document "main"

// Used until someone saves for the first time
const FALLBACK = {
  title: "Countdown",
  date: "2027-01-01T00:00:00+01:00",
  color: "#FFB400",
};
const PRESETS = [
  "#FFB400",
  "#FF5A5F",
  "#2EC4B6",
  "#7B61FF",
  "#3A86FF",
  "#1D2B5C",
];

const $ = (id) => document.getElementById(id);
const pad = (n) => String(n).padStart(2, "0");
let current = FALLBACK;
let target, timer;

// ===== 2. Listen live: runs on page load AND every time anyone saves =====
onSnapshot(
  settingsRef,
  (snap) => {
    current = { ...FALLBACK, ...(snap.exists() ? snap.data() : {}) };
    render();
  },
  (err) => {
    console.error("Firestore read failed:", err);
    render();
  },
);

// ===== Color helpers =====
function textColorFor(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 150 ? "#1D2B5C" : "#FFFFFF";
}
function applyColor(c) {
  if (!/^#[0-9a-f]{6}$/i.test(c)) c = FALLBACK.color;
  const root = document.documentElement.style;
  root.setProperty("--accent", c);
  root.setProperty("--on-accent", textColorFor(c));
}

// Date -> "YYYY-MM-DDTHH:MM" in the viewer's local time (for the input)
function toLocalInput(date) {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

// ===== Page =====
function render() {
  target = new Date(current.date);
  $("title").textContent = current.title;
  document.title = current.title + " – countdown";
  $("target").textContent = isNaN(target)
    ? "Invalid date"
    : target.toLocaleString(undefined, {
        dateStyle: "full",
        timeStyle: "short",
      });
  applyColor(current.color);

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

// ===== Editor =====
const dlg = $("editor");
let pickedColor = current.color;

function selectSwatch(c) {
  pickedColor = c.toUpperCase();
  $("inColor").value = pickedColor;
  applyColor(pickedColor); // live preview
  document
    .querySelectorAll(".swatch")
    .forEach((b) =>
      b.setAttribute("aria-pressed", b.dataset.color === pickedColor),
    );
}

PRESETS.forEach((c) => {
  const b = document.createElement("button");
  b.type = "button";
  b.className = "swatch";
  b.style.background = c;
  b.dataset.color = c;
  b.setAttribute("aria-label", "Color " + c);
  b.addEventListener("click", () => selectSwatch(c));
  $("swatches").appendChild(b);
});
$("inColor").addEventListener("input", (e) => selectSwatch(e.target.value));

$("editBtn").addEventListener("click", () => {
  $("inTitle").value = current.title;
  const t = new Date(current.date);
  $("inDate").value = isNaN(t) ? "" : toLocalInput(t);
  selectSwatch(current.color);
  dlg.showModal();
});

$("cancel").addEventListener("click", () => {
  applyColor(current.color); // undo preview
  dlg.close();
});

// ===== 3. Save for everyone =====
$("form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const saveBtn = $("saveBtn");
  saveBtn.disabled = true;
  saveBtn.textContent = "Saving…";
  try {
    await setDoc(settingsRef, {
      title: $("inTitle").value.trim() || FALLBACK.title,
      // Local input -> exact moment in UTC, so everyone counts to the same second
      date: new Date($("inDate").value).toISOString(),
      color: pickedColor,
    });
    dlg.close(); // onSnapshot updates the page for everyone
  } catch (err) {
    console.error("Save failed:", err);
    alert("Could not save. Check the console (F12) for details.");
  } finally {
    saveBtn.disabled = false;
    saveBtn.textContent = "Save";
  }
});
