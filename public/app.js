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
let celebrated = false;

function toast(message, type = "success") {
  const root = document.getElementById("toastRoot");
  if (!root) return;
  const item = document.createElement("div");
  item.className = `toast ${type}`;
  item.textContent = message;
  root.appendChild(item);
  setTimeout(() => item.remove(), 2400);
}

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

async function apiForm(url, formData) {
  const res = await fetch(url, { method: "POST", body: formData });
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
    grid.innerHTML = '<p style="color:#9ca8b9;font-size:12px">Belum ada memori. Klik tombol <b>Tambah Memory</b> untuk mulai.</p>';
    return;
  }

  grid.innerHTML = items
    .map(
      (item) => `
        <article class="memory-item">
          <div class="memory-photo" style="background-image:url('${item.imageUrl || ""}');background-size:cover;background-position:center"></div>
          <small>${item.takenAt || "-"} • ${item.location || "Unknown"} • ${item.title || "Memory"}</small>
          <button class="delete-memory" data-id="${item.id}">Hapus</button>
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
  if (celebrated) return;
  celebrated = true;
  document.getElementById("flame").classList.add("hidden");
  throwGoldConfetti();
  document.getElementById("romanticMessage").classList.remove("hidden");
  document.getElementById("blowBtn").disabled = true;
  document.getElementById("blowBtn").textContent = "Wish granted ✨";
}

function shouldShowBirthdayOverlay() {
  const s = appState.data.settings;
  const sim = appState.data.simulation?.mode;
  const todayKey = new Date().toISOString().slice(0, 10);
  if (localStorage.getItem("birthday_overlay_dismissed") === todayKey) return false;
  if (sim === "ultah" || sim === "anniv") return true;
  return isToday(s.myBirthday) || isToday(s.partnerBirthday);
}

function initBirthdayOverlay() {
  const overlay = document.getElementById("birthdayOverlay");
  if (!shouldShowBirthdayOverlay()) return;
  overlay.classList.remove("hidden");
  document.getElementById("closeOverlayBtn").addEventListener("click", () => {
    const todayKey = new Date().toISOString().slice(0, 10);
    localStorage.setItem("birthday_overlay_dismissed", todayKey);
    overlay.classList.add("hidden");
  });
  document.getElementById("musicBtn").addEventListener("click", toggleMusic);
  document.getElementById("blowBtn").addEventListener("click", handleBlowCandle);
}

function initNavActiveState() {
  const links = [...document.querySelectorAll(".top-nav a")];
  const sections = links
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const id = `#${entry.target.id}`;
      links.forEach((l) => l.classList.toggle("active", l.getAttribute("href") === id));
    });
  }, { threshold: 0.45 });

  sections.forEach((s) => observer.observe(s));
}

function initMemoryModal() {
  const modal = document.getElementById("memoryModal");
  const openBtn = document.getElementById("openMemoryModal");
  const closeBtn = document.getElementById("cancelMemoryBtn");
  const saveBtn = document.getElementById("saveMemoryBtn");

  openBtn.onclick = () => modal.classList.remove("hidden");
  closeBtn.onclick = () => modal.classList.add("hidden");
  modal.addEventListener("click", (e) => {
    if (e.target.id === "memoryModal") modal.classList.add("hidden");
  });

  saveBtn.onclick = async () => {
    const form = new FormData();
    form.append("title", document.getElementById("memoryTitle").value);
    form.append("location", document.getElementById("memoryLocation").value);
    form.append("description", document.getElementById("memoryDesc").value);
    form.append("takenAt", document.getElementById("memoryDate").value);
    const file = document.getElementById("memoryPhoto").files[0];
    if (file) form.append("photo", file);

    saveBtn.disabled = true;
    saveBtn.textContent = "Menyimpan...";
    try {
      await apiForm("/api/timeline", form);
      appState.data = await api("/api/data");
      buildMemoryGrid();
      modal.classList.add("hidden");
      toast("Memory berhasil ditambahkan 💛", "success");
    } catch (e) {
      toast(`Gagal simpan memory: ${e.message}`, "error");
    } finally {
      saveBtn.disabled = false;
      saveBtn.textContent = "Simpan";
    }
  };
}

function renderLogin(errorMsg = "") {
  const existing = document.getElementById("loginOverlay");
  if (existing) existing.remove();
  const overlay = document.createElement("section");
  overlay.id = "loginOverlay";
  overlay.className = "login-overlay";
  overlay.innerHTML = `
    <section class="login-card glass">
      <h2>Masuk ke Anniversary Vault</h2>
      ${errorMsg ? `<p class="login-error">${errorMsg}</p>` : ""}
      <input id="loginUser" placeholder="username" />
      <input id="loginPass" placeholder="password" type="password" />
      <button id="loginBtn" class="accent">Login</button>
    </section>
  `;
  document.body.appendChild(overlay);

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
    initNavActiveState();
    initMemoryModal();
    initBirthdayOverlay();

    document.addEventListener("click", async (e) => {
      const btn = e.target.closest(".delete-memory");
      if (!btn) return;
      const ok = confirm("Hapus memory ini?");
      if (!ok) return;
      await api(`/api/timeline/${btn.dataset.id}`, "DELETE");
      appState.data = await api("/api/data");
      buildMemoryGrid();
      toast("Memory dihapus", "success");
    });

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
