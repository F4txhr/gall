const app = document.getElementById("app");
let state = { me: null, data: null, flameOn: true, online: [], telegramStatus: null };

function nextAnnual(dateStr) {
  const d = new Date(dateStr);
  const now = new Date();
  let next = new Date(Date.UTC(now.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  if (next < now) next = new Date(Date.UTC(now.getUTCFullYear() + 1, d.getUTCMonth(), d.getUTCDate()));
  return next;
}

function diffToText(target) {
  const now = new Date();
  const ms = target - now;
  if (ms <= 0) return "Hari ini!";
  const d = Math.floor(ms / (1000 * 60 * 60 * 24));
  const h = Math.floor((ms / (1000 * 60 * 60)) % 24);
  return `${d} hari ${h} jam lagi`;
}

function daysSince(start) {
  return Math.floor((new Date() - new Date(start)) / (1000 * 60 * 60 * 24));
}

function calcAge(dateStr) {
  const birth = new Date(dateStr);
  const now = new Date();
  let age = now.getUTCFullYear() - birth.getUTCFullYear();
  const m = now.getUTCMonth() - birth.getUTCMonth();
  if (m < 0 || (m === 0 && now.getUTCDate() < birth.getUTCDate())) age--;
  return age;
}

async function api(url, method = "GET", body, isForm = false) {
  const res = await fetch(url, {
    method,
    headers: isForm ? {} : { "Content-Type": "application/json" },
    body: body ? (isForm ? body : JSON.stringify(body)) : undefined
  });
  if (!res.ok) throw new Error((await res.json()).error || "Gagal");
  return res.json();
}

function renderTelegramBadge() {
  const st = state.telegramStatus;
  if (!st) return "🤖 Status bot: mengecek...";
  if (!st.configured) return "⚠️ Bot belum aktif";
  if (!st.connected) return `⚠️ Bot belum terhubung${st.error ? ` (${st.error})` : ""}`;
  return `✅ Bot siap @${st.botUsername || "telegram_bot"}`;
}

function makeHearts() {
  return Array.from({ length: 12 }).map((_, i) => `<span class="heart" style="--i:${i + 1}">❤</span>`).join("");
}

function renderLogin(err = "") {
  app.innerHTML = `
    <div class="auth-wrap">
      <div class="card auth-card">
        <h2>Masuk ke Cinta Kita 💘</h2>
        ${err ? `<p style="color:#d1005f">${err}</p>` : ""}
        <input id="u" placeholder="username" />
        <input id="p" placeholder="password" type="password" />
        <button id="login">Masuk</button>
      </div>
    </div>`;
  document.getElementById("login").onclick = async () => {
    try {
      await api("/api/login", "POST", { username: u.value, password: p.value });
      bootstrap();
    } catch (e) {
      renderLogin(e.message);
    }
  };
}

function isSpecialDay(dateStr) {
  const d = new Date(dateStr);
  const n = new Date();
  return d.getUTCDate() === n.getUTCDate() && d.getUTCMonth() === n.getUTCMonth();
}

async function attachMicBlow() {
  const btn = document.getElementById("micBlow");
  if (!btn) return;
  btn.onclick = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const ctx = new AudioContext();
      const src = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      src.connect(analyser);
      const arr = new Uint8Array(analyser.frequencyBinCount);
      btn.textContent = "Mendengarkan hembusan...";

      const timer = setInterval(() => {
        analyser.getByteFrequencyData(arr);
        const avg = arr.reduce((a, b) => a + b, 0) / arr.length;
        if (avg > 50) {
          clearInterval(timer);
          stream.getTracks().forEach(t => t.stop());
          state.flameOn = false;
          renderDashboard();
        }
      }, 180);

      setTimeout(() => {
        clearInterval(timer);
        stream.getTracks().forEach(t => t.stop());
      }, 12000);
    } catch {
      alert("Mikrofon tidak tersedia/ditolak.");
    }
  };
}

function renderDashboard() {
  const s = state.data.settings;
  const anniv = diffToText(nextAnnual(s.anniversaryDate));
  const ownBirthday = state.me.role === "me" ? s.myBirthday : s.partnerBirthday;
  const partnerBirthday = state.me.role === "me" ? s.partnerBirthday : s.myBirthday;
  const ownName = state.me.role === "me" ? s.meName : s.partnerName;
  const partnerName = state.me.role === "me" ? s.partnerName : s.meName;
  const ownBirthdayCountdown = diffToText(nextAnnual(ownBirthday));
  const partnerBirthdayCountdown = diffToText(nextAnnual(partnerBirthday));
  const relationDays = daysSince(s.relationshipStart);
  const simMode = state.data.simulation?.mode || "off";
  const isSimulated = simMode === "ultah" || simMode === "anniv";
  const todayCake = isSimulated || isSpecialDay(s.myBirthday) || isSpecialDay(s.partnerBirthday) || isSpecialDay(s.anniversaryDate);
  const otherOnline = state.online.includes(state.me.role === "me" ? "partner" : "me");

  app.innerHTML = `
    <div class="floating-hearts">${makeHearts()}</div>
    <div class="container long-scroll">
      <section class="card hero">
        <div>
          <h1>Cinta Kita</h1>
          <p class="small">Antarmuka romantis, modern, lembut, dan smooth ✨</p>
        </div>
        <div class="couple-pics">
          <div class="avatar">${s.meName[0] || "A"}</div>
          <div class="avatar">${s.partnerName[0] || "K"}</div>
        </div>
        <div class="badges">
          <span class="badge" id="telegramBadge">${renderTelegramBadge()}</span>
          ${isSimulated ? `<span class="badge">🧪 Simulasi: ${simMode}</span>` : ""}
        </div>
        <button class="secondary" id="logout">Logout</button>
      </section>

      <section class="card feature-card">
        <h2>Hari-hari Bersama</h2>
        <p class="big-number">${relationDays.toLocaleString("id-ID")} Hari</p>
        <p class="small">Countdown Anniversary: ${anniv}</p>
      </section>

      <section class="card feature-card">
        <h2>Ulang Tahun ${partnerName}!</h2>
        <p><strong>Tanggal:</strong> ${partnerBirthday}</p>
        <p><strong>Usia:</strong> ${calcAge(partnerBirthday)} Tahun</p>
        <p class="small">Countdown ${ownName}: ${ownBirthdayCountdown} • Countdown ${partnerName}: ${partnerBirthdayCountdown}</p>
      </section>

      <section class="card">
        <h2>Perjalanan Kita</h2>
        <p class="small">Timeline foto vertikal: tanggal, lokasi, dan caption singkat.</p>
        <input id="title" placeholder="Judul momen (contoh: Pertemuan Pertama di Jakarta!)" />
        <input id="location" placeholder="Lokasi (opsional, contoh: Jakarta)" />
        <textarea id="description" placeholder="Caption singkat (opsional)"></textarea>
        <input id="takenAt" type="date" />
        <input id="photo" type="file" accept="image/*" />
        <button id="addTimeline">Upload ke Timeline</button>
        <div id="timelineList"></div>
      </section>

      ${todayCake ? `
      <section class="card">
        <h2>Tiup Lilin & Rayakan!</h2>
        <p class="small">Ketuk Lilin untuk Meniup! / Meniup ke Mikrofon untuk Memadamkan!</p>
        <div class="cake-stand-wrap">
          <div class="cake-stand"></div>
          <div class="cake">
            <div class="layer"></div>
            <div class="deco deco-1"></div><div class="deco deco-2"></div><div class="deco deco-3"></div>
            <div class="candle c1"></div><div class="candle c2"></div><div class="candle c3"></div>
            <div class="flame ${state.flameOn ? "" : "off"}" id="flame"></div>
          </div>
        </div>
        <div class="grid">
          <button id="blow">Sentuh untuk Memadamkan!</button>
          <button id="micBlow" class="secondary">Meniup ke Mikrofon</button>
        </div>
        <p id="wish">${state.flameOn ? "Ayo tiup lilinnya dulu, sayang~" : (simMode === "anniv" ? "Selamat Anniversary! Semoga makin lengket selamanya 💞" : "Selamat Ulang Tahun! Semoga semua doa terbaik terkabul 🎂")}</p>
        <button>${simMode === "anniv" ? "Selamat Anniversary!" : "Selamat Ulang Tahun!"}</button>
        <div class="silhouette">${otherOnline ? `🧍 ${partnerName} lagi lihat kamu!` : `...${partnerName} belum online`}</div>
      </section>` : ""}

      <section class="card"><h2>Pengaturan via Telegram</h2><p class="small">/setanniv, /setultah, /setname, /setuser, /setpass, /sim ultah|anniv|off, /cekconfig.</p></section>
    </div>
  `;

  document.getElementById("logout").onclick = async () => {
    await api("/api/logout", "POST", {});
    renderLogin();
  };

  if (todayCake) {
    document.getElementById("blow").onclick = () => {
      state.flameOn = false;
      renderDashboard();
    };
    document.getElementById("flame")?.addEventListener("click", () => {
      state.flameOn = false;
      renderDashboard();
    });
    attachMicBlow();
  }

  document.getElementById("addTimeline").onclick = async () => {
    const form = new FormData();
    form.append("title", document.getElementById("title").value);
    form.append("location", document.getElementById("location").value);
    form.append("description", document.getElementById("description").value);
    form.append("takenAt", document.getElementById("takenAt").value);
    const file = document.getElementById("photo").files[0];
    if (file) form.append("photo", file);
    await api("/api/timeline", "POST", form, true);
    await loadData();
    renderDashboard();
  };

  const list = document.getElementById("timelineList");
  list.innerHTML = state.data.timeline.map(item => `
    <div class="timeline-item">
      ${item.imageUrl ? `<img src="${item.imageUrl}" loading="lazy"/>` : "<div></div>"}
      <div>
        <span class="tag">${item.takenAt || "tanpa tanggal"}</span>
        ${item.location ? `<span class="tag">📍 ${item.location}</span>` : ""}
        <span class="tag">${item.uploadedBy}</span>
        <h3>${item.title}</h3>
        <p>${item.description || ""}</p>
        <button data-id="${item.id}" class="secondary del">Hapus</button>
      </div>
    </div>
  `).join("");

  document.querySelectorAll(".del").forEach(btn => {
    btn.onclick = async () => {
      await api(`/api/timeline/${btn.dataset.id}`, "DELETE");
      await loadData();
      renderDashboard();
    };
  });
}

async function loadData() {
  state.data = await api("/api/data");
  state.telegramStatus = await api("/api/telegram-status");
}

async function bootstrap() {
  try {
    state.me = await api("/api/me");
    await loadData();
    renderDashboard();

    const socket = io();
    socket.on("presence", users => {
      state.online = users;
      renderDashboard();
    });

    if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js");
  } catch {
    renderLogin();
  }
}

bootstrap();
