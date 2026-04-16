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
  const s = new Date(start);
  const now = new Date();
  return Math.floor((now - s) / (1000 * 60 * 60 * 24));
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
  if (!st.configured) return "⚠️ Bot belum aktif (cek TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_IDS)";
  if (!st.connected) return `⚠️ Bot terkonfigurasi tapi belum terhubung (${st.chatIdsCount} chat id)${st.error ? ` | ${st.error}` : ""}`;
  return `✅ Bot siap digunakan (@${st.botUsername || "telegram_bot"}) untuk ${st.chatIdsCount} chat id`;
}

function renderLogin(err = "") {
  app.innerHTML = `
    <div class="auth-wrap">
      <div class="card auth-card">
        <h2>Masuk ke Web Bucin 💘</h2>
        <p class="small">Beda akses untuk kamu dan pasanganmu.</p>
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

  const todayCake = isSpecialDay(s.myBirthday) || isSpecialDay(s.partnerBirthday) || isSpecialDay(s.anniversaryDate);
  const other = partnerName;
  const otherRole = state.me.role === "me" ? "partner" : "me";
  const otherOnline = state.online.includes(otherRole);

  app.innerHTML = `
    <div class="container">
      <div class="card">
        <h1>Hai, ${state.me.username} 💖</h1>
        <p class="small" id="telegramBadge">${renderTelegramBadge()}</p>
        <button class="secondary" id="logout">Logout</button>
      </div>
      <div class="card grid">
        <div class="counter"><strong>Udah pacaran:</strong><br/>${relationDays} hari</div>
        <div class="counter"><strong>Countdown Anniversary:</strong><br/>${anniv}</div>
        <div class="counter"><strong>Countdown Ulang Tahun ${ownName}:</strong><br/>${ownBirthdayCountdown}</div>
        <div class="counter"><strong>Countdown Ulang Tahun ${partnerName}:</strong><br/>${partnerBirthdayCountdown}</div>
      </div>

      ${todayCake ? `
      <div class="card">
        <h2>Momen Spesial Hari Ini 🎉</h2>
        <div class="cake"><div class="layer"></div><div class="candle"></div><div class="flame ${state.flameOn ? "" : "off"}" id="flame"></div></div>
        <button id="blow">Tiup Lilin 🕯️</button>
        <p id="wish">${state.flameOn ? "Ayo tiup lilinnya dulu, sayang~" : "Selamat! Semoga cinta kalian makin manis selamanya 💞"}</p>
        <div class="silhouette">${otherOnline ? `🧍‍♀️ ${other} lagi lihat kamu!` : `...${other} belum online`}</div>
      </div>` : ""}

      <div class="card"><h2>Pengaturan Cinta via Telegram ⚙️</h2><p class="small">Semua pengaturan sekarang hanya lewat Telegram command: /setanniv, /setultah, /setname, /setuser, /setpass, /cekconfig.</p></div>

      <div class="card">
        <h2>Timeline Library 📸</h2>
        <input id="title" placeholder="Judul foto" />
        <textarea id="description" placeholder="Deskripsi (opsional)"></textarea>
        <input id="takenAt" type="date" />
        <input id="photo" type="file" accept="image/*" />
        <button id="addTimeline">Upload ke Timeline</button>
        <div id="timelineList"></div>
      </div>
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
  }


  document.getElementById("addTimeline").onclick = async () => {
    const form = new FormData();
    form.append("title", document.getElementById("title").value);
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
