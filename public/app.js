const app = document.getElementById("app");
let state = { me: null, data: null, flameOn: true, online: [], telegramStatus: null };

function toast(message, type = "ok") {
  const el = document.createElement("div");
  el.className = `toast ${type}`;
  el.textContent = message;
  document.body.appendChild(el);
  const live = document.getElementById("liveRegion");
  if (live) live.textContent = message;
  setTimeout(() => el.classList.add("show"), 10);
  setTimeout(() => {
    el.classList.remove("show");
    setTimeout(() => el.remove(), 280);
  }, 2200);
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme || "soft";
  localStorage.setItem("theme", theme || "soft");
}

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
  const yearsTogether = Math.floor(relationDays / 365);
  const partnerAge = calcAge(partnerBirthday);
  const showOnboarding = !localStorage.getItem("onboarding_done");

  app.innerHTML = `
    <div id="liveRegion" class="sr-only" aria-live="polite"></div>
    ${showOnboarding ? `<section class="onboarding card"><h3>Mulai Cepat 💞</h3><p class="small">1) Atur nama/tanggal di Telegram • 2) Upload momen pertama • 3) Rayakan bersama 🎉</p><button id="finishOnboarding">Siap, Lanjut!</button></section>` : ""}
    <div class="container">
      <section class="card hero animate__animated animate__zoomIn">
        <div class="photo-wrap">
          <div class="avatar">${partnerName[0] || "A"}</div>
          <div class="heart-float">💖</div>
        </div>
        <h1 class="font-romance">Hai ${ownName} 💖</h1>
        <p class="small">Pasanganmu: ${partnerName} • Sejak ${s.relationshipStart} • ${yearsTogether}+ tahun bersama</p>
        <div class="grid-2" style="width:100%; margin-top:16px">
          <div class="stat"><b>${relationDays.toLocaleString("id-ID")}</b><span class="small">Hari Jadian</span></div>
          <div class="stat"><b>${partnerBirthdayCountdown.replace(' hari', '')}</b><span class="small">Hari ke Ultah ${partnerName} (${partnerAge} th)</span></div>
        </div>
      </section>

      <section class="card">
        <h2 class="font-romance">Ayang Lagi Apa?</h2>
        <div class="grid-2">
          <div class="stat"><div>🧑‍🍳</div><b style="font-size:14px">${ownName}</b><span class="small">Lagi buka web ini</span></div>
          <div class="stat"><div>👑</div><b style="font-size:14px">${partnerName}</b><span class="small">${otherOnline ? "Lagi lihat kamu" : "Belum online"}</span></div>
        </div>
      </section>

      <section class="card">
        <h2 class="font-romance">Perjalanan Kita</h2>
        <input id="title" placeholder="Judul momen" />
        <input id="location" placeholder="Lokasi (opsional)" />
        <textarea id="description" placeholder="Caption singkat"></textarea>
        <input id="takenAt" type="date" />
        <input id="photo" type="file" accept="image/*" />
        <img id="photoPreview" style="display:none;width:100%;border-radius:12px;margin-bottom:8px;max-height:180px;object-fit:cover;" />
        <button id="addTimeline">Upload ke Timeline</button>
        <div id="timelineList" class="timeline-line"></div>
      </section>

      ${todayCake ? `<section class="card cake-shell">
        <h2 class="font-romance">Tiup Lilin & Rayakan!</h2>
        <p class="small" id="mic-status">Ketuk Lilin untuk Meniup! / Meniup ke Mikrofon untuk Memadamkan!</p>
        <div class="cake" id="cake-container">
          <div class="cake-base"></div>
          <div class="cake-stand"></div>
          <div class="candle c1"></div><div class="candle c2"></div><div class="candle c3"></div>
          <div class="flame ${state.flameOn ? "" : "off"}" id="flame"></div>
        </div>
        <button id="blow">${simMode === "anniv" ? "Selamat Anniversary!" : "Selamat Ulang Tahun!"}</button>
        <button id="micBlow" class="secondary">Aktifkan Mic</button>
        <p id="wish" class="wish">${state.flameOn ? "Tiup dulu ya sayang..." : "WUSSSS! 🎉 Semoga semua doa baik terkabul."}</p>
      </section>` : ""}

      <section class="card low-emphasis">
        <p class="small" id="telegramBadge">${renderTelegramBadge()}</p>
        <label class="small" for="themeSelect">Theme</label>
        <select id="themeSelect">
          <option value="soft">Soft Pink</option>
          <option value="lavender">Lavender</option>
          <option value="gold">Cream Gold</option>
        </select>
        <details>
          <summary class="small">Buka Command Telegram</summary>
          <p class="small">/setanniv /setultah /setname /setuser /setpass /sim /menu /cekconfig</p>
        </details>
        <button class="secondary" id="logout">Logout</button>
      </section>
    </div>
  `;

  if (showOnboarding) {
    document.getElementById("finishOnboarding").onclick = () => {
      localStorage.setItem("onboarding_done", "1");
      renderDashboard();
    };
  }

  document.getElementById("logout").onclick = async () => {
    await api("/api/logout", "POST", {});
    renderLogin();
  };

  if (todayCake) {
    const celebrate = () => {
      state.flameOn = false;
      if (window.confetti) {
        window.confetti({ particleCount: 130, spread: 65, origin: { y: 0.8 }, colors: ["#ff748c", "#ffffff", "#ffd700"] });
      }
      toast("Selamat! 🎉", "ok");
      renderDashboard();
    };
    document.getElementById("blow").onclick = celebrate;
    document.getElementById("cake-container")?.addEventListener("click", celebrate);
    attachMicBlow();
  }

  document.getElementById("addTimeline").onclick = async () => {
    const btn = document.getElementById("addTimeline");
    btn.disabled = true;
    btn.textContent = "Mengunggah...";
    const form = new FormData();
    form.append("title", document.getElementById("title").value);
    form.append("location", document.getElementById("location").value);
    form.append("description", document.getElementById("description").value);
    form.append("takenAt", document.getElementById("takenAt").value);
    const file = document.getElementById("photo").files[0];
    if (file) form.append("photo", file);
    try {
      await api("/api/timeline", "POST", form, true);
      await loadData();
      toast("Momen berhasil ditambahkan 💖", "ok");
      renderDashboard();
    } catch (e) {
      toast(`Gagal upload: ${e.message}`, "error");
      btn.disabled = false;
      btn.textContent = "Upload ke Timeline";
    }
  };

  const list = document.getElementById("timelineList");
  if (!state.data.timeline.length) {
    list.innerHTML = `<div class="empty-state">Belum ada momen. Yuk upload momen pertama kalian 💞</div>`;
  } else {
    list.innerHTML = state.data.timeline.map(item => `
    <div class="timeline-item animate__animated animate__fadeInUp">
      <div class="timeline-box">
        ${item.imageUrl ? `<img src="${item.imageUrl}" loading="lazy"/>` : ""}
        <p><span class="tag">${item.takenAt || "tanpa tanggal"}</span>${item.location ? `<span class="tag">📍 ${item.location}</span>` : ""}</p>
        <p style="font-size:12px; font-weight:700; margin:6px 0 2px">${item.title}</p>
        <p class="small" style="margin-bottom:8px">${item.description || ""}</p>
        <button data-id="${item.id}" class="secondary del">Hapus</button>
      </div>
    </div>
  `).join("");
  }

  document.querySelectorAll(".del").forEach(btn => {
    btn.onclick = async () => {
      btn.disabled = true;
      btn.textContent = "Menghapus...";
      try {
        await api(`/api/timeline/${btn.dataset.id}`, "DELETE");
        await loadData();
        toast("Momen dihapus", "ok");
        renderDashboard();
      } catch (e) {
        toast(`Gagal hapus: ${e.message}`, "error");
        btn.disabled = false;
        btn.textContent = "Hapus";
      }
    };
  });

  const photoInput = document.getElementById("photo");
  photoInput.onchange = () => {
    const file = photoInput.files?.[0];
    const preview = document.getElementById("photoPreview");
    if (!file) return (preview.style.display = "none");
    preview.src = URL.createObjectURL(file);
    preview.style.display = "block";
  };

  const themeSelect = document.getElementById("themeSelect");
  themeSelect.value = localStorage.getItem("theme") || "soft";
  themeSelect.onchange = () => applyTheme(themeSelect.value);
}

async function loadData() {
  state.data = await api("/api/data");
  state.telegramStatus = await api("/api/telegram-status");
}

async function bootstrap() {
  try {
    applyTheme(localStorage.getItem("theme") || "soft");
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
