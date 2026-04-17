/*
  Anniversary & Birthday Tracker
  - Pure Vanilla JS logic
  - Handles counters, filmstrip generation, birthday overlay interactions
*/

const CONFIG = {
  relationshipStart: "2023-04-17",
  anniversaryDate: "2023-04-17",
  myBirthday: "1997-11-11",
  partnerBirthday: "1999-07-15",
  memoryPlaceholders: [
    "First Date",
    "Coffee Night",
    "Beach Sunset",
    "Road Trip"
  ]
};

let audioCtx;
let oscillator;
let gainNode;
let musicPlaying = false;

function daysSince(dateStr) {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24));
}

function nextAnnual(dateStr) {
  const src = new Date(dateStr);
  const now = new Date();
  let next = new Date(now.getFullYear(), src.getMonth(), src.getDate());
  if (next < now) next = new Date(now.getFullYear() + 1, src.getMonth(), src.getDate());
  return next;
}

function countdownText(targetDate) {
  const ms = targetDate.getTime() - Date.now();
  if (ms <= 0) return "Hari ini";
  const d = Math.floor(ms / (1000 * 60 * 60 * 24));
  const h = Math.floor((ms / (1000 * 60 * 60)) % 24);
  return `${d} hari ${h} jam lagi`;
}

function isToday(dateStr) {
  const d = new Date(dateStr);
  const n = new Date();
  return d.getDate() === n.getDate() && d.getMonth() === n.getMonth();
}

function buildFilmRows() {
  document.querySelectorAll(".film-row").forEach((row) => {
    for (let i = 0; i < 20; i += 1) {
      const frame = document.createElement("span");
      row.appendChild(frame);
    }
  });
}

function buildMemoryGrid() {
  const grid = document.getElementById("memoryGrid");
  grid.innerHTML = CONFIG.memoryPlaceholders
    .map(
      (label) => `
        <article class="memory-item">
          <div class="memory-photo" role="img" aria-label="Placeholder memory ${label}"></div>
          <small>${label}</small>
        </article>
      `
    )
    .join("");
}

function updateCounters() {
  document.getElementById("daysTogether").textContent = daysSince(CONFIG.relationshipStart).toLocaleString("id-ID");
  document.getElementById("annivCountdown").textContent = countdownText(nextAnnual(CONFIG.anniversaryDate));
  document.getElementById("birthdayCountdown").textContent = countdownText(nextAnnual(CONFIG.partnerBirthday));
}

function toggleMusic() {
  const btn = document.getElementById("musicBtn");

  if (!musicPlaying) {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    oscillator = audioCtx.createOscillator();
    gainNode = audioCtx.createGain();

    oscillator.type = "triangle";
    oscillator.frequency.value = 329.63; // E4
    gainNode.gain.value = 0.03;

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    oscillator.start();

    musicPlaying = true;
    btn.textContent = "Pause Music";
  } else {
    oscillator.stop();
    oscillator.disconnect();
    gainNode.disconnect();
    musicPlaying = false;
    btn.textContent = "Play Music";
  }
}

function throwGoldConfetti() {
  if (!window.confetti) return;
  window.confetti({
    particleCount: 180,
    spread: 78,
    origin: { y: 0.78 },
    colors: ["#D4AF37", "#C89D2E", "#F1E2A3", "#ffffff"]
  });
}

function handleBlowCandle() {
  document.getElementById("flame").classList.add("hidden");
  throwGoldConfetti();
  document.getElementById("romanticMessage").classList.remove("hidden");
}

function shouldShowBirthdayOverlay() {
  return isToday(CONFIG.myBirthday) || isToday(CONFIG.partnerBirthday);
}

function initBirthdayOverlay() {
  const overlay = document.getElementById("birthdayOverlay");
  if (!shouldShowBirthdayOverlay()) return;

  overlay.classList.remove("hidden");
  document.getElementById("musicBtn").addEventListener("click", toggleMusic);
  document.getElementById("blowBtn").addEventListener("click", handleBlowCandle);
}

function init() {
  buildFilmRows();
  buildMemoryGrid();
  updateCounters();
  initBirthdayOverlay();
  setInterval(updateCounters, 60_000);
}

init();
