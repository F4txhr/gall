/*
  Connected Anniversary Tracker
  - Uses backend /api/me, /api/data, /api/telegram-status
*/

let appState = {
  me: null,
  data: null,
  telegramStatus: null
};

let audioCtx;
let oscillator;
let gainNode;
let musicPlaying = false;

async function api(url, method = "GET", body) {
  const res = await fetch(url, {
    method,
    headers: body ? { "Content-Type": "application/json" } : {},
    body: body ? JSON.stringify(body) : undefined
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Gagal request" }));
    throw new Error(err.error || "Request error");
  }
  return res.json();
}

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
    row.innerHTML = "";
    for (let i = 0; i < 20; i += 1) {
      row.appendChild(document.createElement("span"));
    }
  });
}

function telegramStatusText() {
  const t = appState.telegramStatus;
  if (!t) return "Bot: mengecek...";
  if (!t.configured) return "Bot: belum dikonfigurasi";
  if (!t.connected) return `Bot: belum terhubung${t.error ? ` (${t.error})` : ""}`;
  return `Bot: terhubung @${t.botUsername || "telegram_bot"} (${t.chatIdsCount} chat)`;
}

function buildMemoryGrid() {
  const grid = document.getElementById("memoryGrid");
  const items = (appState.data?.timeline || []).slice(0, 4);
  if (!items.length) {
    grid.innerHTML = '<p style="color:#9ca8b9;font-size:12px">Belum ada memori. Upload lewat endpoint timeline atau versi dashboard lama.</p>';
    return;
  }

  grid.innerHTML = items
    .map(
      (item) => `
        <article class="memory-item">
          <div class="memory-photo" style="background-image:url('${item.imageUrl || ""}');background-size:cover;background-position:center"></div>
          <small>${item.takenAt || "-"} • ${item.title || "Memory"}</small>
        </article>
      `
    )
    .join("");
}

function updateCounters() {
  const s = appState.data.settings;
  const relationStart = s.relationshipStart;
  const partnerBirthday = appState.me.role === "me" ? s.partnerBirthday : s.myBirthday;
  const anniv = s.anniversaryDate;

  document.getElementById("daysTogether").textContent = daysSince(relationStart).toLocaleString("id-ID");
  document.getElementById("annivCountdown").textContent = countdownText(nextAnnual(anniv));
  document.getElementById("birthdayCountdown").textContent = countdownText(nextAnnual(partnerBirthday));
  document.getElementById("vaultStatus").textContent = telegramStatusText();
}

function toggleMusic() {
  const btn = document.getElementById("musicBtn");
  if (!musicPlaying) {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    oscillator = audioCtx.createOscillator();
    gainNode = audioCtx.createGain();
    oscillator.type = "triangle";
    oscillator.frequency.value = 329.63;
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
  const s = appState.data.settings;
  const sim = appState.data.simulation?.mode;
  if (sim === "ultah" || sim === "anniv") return true;
  return isToday(s.myBirthday) || isToday(s.partnerBirthday);
}

function initBirthdayOverlay() {
  const overlay = document.getElementById("birthdayOverlay");
  if (!shouldShowBirthdayOverlay()) return;
  overlay.classList.remove("hidden");
  document.getElementById("musicBtn").addEventListener("click", toggleMusic);
  document.getElementById("blowBtn").addEventListener("click", handleBlowCandle);
}

function renderLogin(errorMsg = "") {
  document.body.innerHTML = `
    <main style="min-height:100vh;display:grid;place-items:center;background:#121212;color:#fff;font-family:Inter,sans-serif;padding:16px">
      <section style="width:min(380px,100%);border:1px solid rgba(212,175,55,.35);border-radius:16px;padding:16px;background:rgba(255,255,255,.07);backdrop-filter:blur(12px)">
        <h2 style="margin-top:0">Masuk ke Anniversary Vault</h2>
        ${errorMsg ? `<p style="color:#ffcccb">${errorMsg}</p>` : ""}
        <input id="loginUser" placeholder="username" style="width:100%;margin-bottom:8px;padding:10px;border-radius:10px;border:1px solid #334" />
        <input id="loginPass" placeholder="password" type="password" style="width:100%;margin-bottom:8px;padding:10px;border-radius:10px;border:1px solid #334" />
        <button id="loginBtn" style="width:100%;padding:10px;border-radius:10px;border:none;background:#D4AF37;color:#111;font-weight:700">Login</button>
      </section>
    </main>
  `;

  document.getElementById("loginBtn").onclick = async () => {
    try {
      await api("/api/login", "POST", {
        username: document.getElementById("loginUser").value,
        password: document.getElementById("loginPass").value
      });
      location.reload();
    } catch (e) {
      renderLogin(e.message);
    }
  };
}

async function init() {
  try {
    await api("/api/me");
    const [data, tg] = await Promise.all([api("/api/data"), api("/api/telegram-status")]);
    appState.data = data;
    appState.telegramStatus = tg;
    appState.me = await api("/api/me");

    buildFilmRows();
    buildMemoryGrid();
    updateCounters();
    initBirthdayOverlay();

    setInterval(async () => {
      appState.data = await api("/api/data");
      appState.telegramStatus = await api("/api/telegram-status");
      updateCounters();
      buildMemoryGrid();
    }, 60_000);
  } catch {
    renderLogin("Silakan login dulu supaya data & bot terkoneksi.");
  }
}

init();
