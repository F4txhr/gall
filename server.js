const express = require("express");
const http = require("http");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const multer = require("multer");
const cookieParser = require("cookie-parser");
const cron = require("node-cron");
const axios = require("axios");
const { Server } = require("socket.io");
const FormData = require("form-data");

function loadDotEnvFile() {
  const envFile = path.join(__dirname, ".env");
  if (!fs.existsSync(envFile)) return;

  const raw = fs.readFileSync(envFile, "utf8");
  let loaded = 0;
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const idx = trimmed.indexOf("=");
    if (idx === -1) continue;

    const key = trimmed.slice(0, idx).trim();
    const value = trimmed.slice(idx + 1).trim();
    if (!process.env[key]) {
      process.env[key] = value;
      loaded += 1;
    }
  }

  console.log(`[env] loaded ${loaded} keys from .env`);
}

loadDotEnvFile();

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, "data");
const UPLOAD_DIR = path.join(__dirname, "uploads");
const DB_FILE = path.join(DATA_DIR, "db.json");

for (const dir of [DATA_DIR, UPLOAD_DIR]) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

const defaultDb = {
  settings: {
    relationshipStart: "2025-01-01",
    anniversaryDate: "2025-01-01",
    myBirthday: "1999-01-01",
    partnerBirthday: "1999-01-01",
    meName: "Aku",
    partnerName: "Kamu"
  },
  credentials: {
    me: {
      username: process.env.ME_USER || "aku",
      password: process.env.ME_PASS || "sayang123"
    },
    partner: {
      username: process.env.PARTNER_USER || "kamu",
      password: process.env.PARTNER_PASS || "bucin123"
    }
  },
  timeline: [],
  sentReminders: {},
  telegram: {
    lastUpdateId: 0
  }
};

function readDb() {
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(defaultDb, null, 2));
    return structuredClone(defaultDb);
  }
  try {
    const db = JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
    db.settings = { ...defaultDb.settings, ...(db.settings || {}) };
    db.credentials = {
      me: { ...defaultDb.credentials.me, ...(db.credentials?.me || {}) },
      partner: { ...defaultDb.credentials.partner, ...(db.credentials?.partner || {}) }
    };
    db.timeline = db.timeline || [];
    db.sentReminders = db.sentReminders || {};
    db.telegram = { ...defaultDb.telegram, ...(db.telegram || {}) };
    return db;
  } catch {
    return structuredClone(defaultDb);
  }
}

function writeDb(db) {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

function logTelegram(message, extra = "") {
  const suffix = extra ? ` | ${extra}` : "";
  console.log(`[telegram] ${new Date().toISOString()} | ${message}${suffix}`);
}

function getTelegramBotToken() {
  return process.env.TELEGRAM_BOT_TOKEN || "";
}

function getTelegramChatIds() {
  return (process.env.TELEGRAM_CHAT_IDS || "")
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
}


async function getTelegramStatus() {
  const token = getTelegramBotToken();
  const chatIds = getTelegramChatIds();
  if (!token || !chatIds.length) {
    logTelegram("status check: missing configuration", `token=${Boolean(token)} chatIds=${chatIds.length}`);
    return { configured: false, connected: false, chatIdsCount: chatIds.length };
  }

  try {
    const url = `https://api.telegram.org/bot${token}/getMe`;
    const res = await axios.get(url);
    logTelegram("status check: connected", `bot=@${res.data?.result?.username || "unknown"} chatIds=${chatIds.length}`);
    return {
      configured: true,
      connected: Boolean(res.data?.ok),
      chatIdsCount: chatIds.length,
      botUsername: res.data?.result?.username || null
    };
  } catch (error) {
    logTelegram("status check: failed", error.message);
    return { configured: true, connected: false, chatIdsCount: chatIds.length, error: error.message };
  }
}

function getUsers(db) {
  return [
    { username: db.credentials.me.username, password: db.credentials.me.password, role: "me" },
    { username: db.credentials.partner.username, password: db.credentials.partner.password, role: "partner" }
  ];
}

const sessions = new Map();
const onlineRoles = new Set();

const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, UPLOAD_DIR),
  filename: (_, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  }
});
const upload = multer({ storage });

app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());
app.use("/uploads", express.static(UPLOAD_DIR));
app.use(express.static(path.join(__dirname, "public")));

function authMiddleware(req, res, next) {
  const token = req.cookies.session;
  if (!token || !sessions.has(token)) return res.status(401).json({ error: "Unauthorized" });
  req.user = sessions.get(token);
  next();
}

app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  const db = readDb();
  const user = getUsers(db).find((u) => u.username === username && u.password === password);
  if (!user) return res.status(401).json({ error: "Username/password salah" });

  const token = crypto.randomBytes(24).toString("hex");
  sessions.set(token, { username: user.username, role: user.role });
  res.cookie("session", token, { httpOnly: true, sameSite: "lax" });
  res.json({ username: user.username, role: user.role });
});

app.post("/api/logout", authMiddleware, (req, res) => {
  const token = req.cookies.session;
  sessions.delete(token);
  res.clearCookie("session");
  res.json({ ok: true });
});

app.get("/api/me", authMiddleware, (req, res) => {
  res.json(req.user);
});

app.get("/api/data", authMiddleware, (req, res) => {
  const db = readDb();
  res.json({
    settings: db.settings,
    timeline: db.timeline,
    usernames: {
      me: db.credentials.me.username,
      partner: db.credentials.partner.username
    }
  });
});


app.get("/api/telegram-status", authMiddleware, async (_, res) => {
  const status = await getTelegramStatus();
  res.json(status);
});

app.put("/api/settings", authMiddleware, (req, res) => {
  const db = readDb();
  db.settings = {
    ...db.settings,
    relationshipStart: req.body.relationshipStart || db.settings.relationshipStart,
    anniversaryDate: req.body.anniversaryDate || db.settings.anniversaryDate,
    myBirthday: req.body.myBirthday || db.settings.myBirthday,
    partnerBirthday: req.body.partnerBirthday || db.settings.partnerBirthday,
    meName: req.body.meName || db.settings.meName,
    partnerName: req.body.partnerName || db.settings.partnerName
  };
  writeDb(db);
  res.json(db.settings);
});

app.post("/api/timeline", authMiddleware, upload.single("photo"), async (req, res) => {
  const db = readDb();
  const item = {
    id: crypto.randomUUID(),
    title: req.body.title || "Tanpa Judul",
    description: req.body.description || "",
    takenAt: req.body.takenAt,
    imageUrl: req.file ? `/uploads/${req.file.filename}` : "",
    uploadedBy: req.user.username,
    uploadedAt: new Date().toISOString()
  };
  db.timeline.unshift(item);
  writeDb(db);

  await backupToTelegram(item, req.file?.path);
  res.json(item);
});

app.delete("/api/timeline/:id", authMiddleware, (req, res) => {
  const db = readDb();
  const idx = db.timeline.findIndex((x) => x.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Not found" });
  const [removed] = db.timeline.splice(idx, 1);
  if (removed.imageUrl) {
    const full = path.join(__dirname, removed.imageUrl);
    if (fs.existsSync(full)) fs.unlinkSync(full);
  }
  writeDb(db);
  res.json({ ok: true });
});

function isMonthDay(dateStr, now) {
  const d = new Date(dateStr);
  return d.getUTCDate() === now.getUTCDate() && d.getUTCMonth() === now.getUTCMonth();
}

async function sendTelegramToAll(text) {
  const token = getTelegramBotToken();
  const chatIds = getTelegramChatIds();
  if (!token || !chatIds.length) return;

  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  for (const chatId of chatIds) {
    await axios.post(url, { chat_id: chatId, text });
    logTelegram("sendMessage success", `chat_id=${chatId}`);
  }
}

async function backupToTelegram(item, filePath) {
  const token = getTelegramBotToken();
  const chatIds = getTelegramChatIds();
  if (!token || !chatIds.length || !filePath) return;

  const url = `https://api.telegram.org/bot${token}/sendDocument`;
  for (const chatId of chatIds) {
    const form = new FormData();
    form.append("chat_id", chatId);
    form.append("caption", `Backup media baru: ${item.title} (${item.takenAt || "tanpa tanggal"})`);
    form.append("document", fs.createReadStream(filePath));
    await axios.post(url, form, { headers: form.getHeaders() });
    logTelegram("sendDocument success", `chat_id=${chatId} title=${item.title}`);
  }
}

function isValidDate(str) {
  return /^\d{4}-\d{2}-\d{2}$/.test(str) && !Number.isNaN(new Date(str).getTime());
}

function telegramHelpText() {
  return [
    "Perintah yang tersedia:",
    "/setanniv YYYY-MM-DD",
    "/setultah aku YYYY-MM-DD",
    "/setultah kamu YYYY-MM-DD",
    "/setname aku Nama Baru",
    "/setname kamu Nama Baru",
    "/setuser aku usernameBaru",
    "/setuser kamu usernameBaru",
    "/setpass aku passwordBaru",
    "/setpass kamu passwordBaru",
    "/cekconfig"
  ].join("\n");
}

async function sendTelegramReply(chatId, text) {
  const token = getTelegramBotToken();
  if (!token) return;
  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  await axios.post(url, { chat_id: chatId, text });
}

async function processTelegramCommand(chatId, text) {
  const db = readDb();
  const parts = text.trim().split(/\s+/);
  const command = (parts[0] || "").toLowerCase();
  let changed = false;

  if (command === "/setanniv") {
    if (!isValidDate(parts[1])) return sendTelegramReply(chatId, "Format salah. Contoh: /setanniv 2026-07-15");
    db.settings.anniversaryDate = parts[1];
    changed = true;
  } else if (command === "/setultah") {
    const who = (parts[1] || "").toLowerCase();
    const date = parts[2];
    if (!["aku", "kamu"].includes(who) || !isValidDate(date)) {
      return sendTelegramReply(chatId, "Format salah. Contoh: /setultah aku 2026-10-21");
    }
    if (who === "aku") db.settings.myBirthday = date;
    if (who === "kamu") db.settings.partnerBirthday = date;
    changed = true;
  } else if (command === "/setname") {
    const who = (parts[1] || "").toLowerCase();
    const name = parts.slice(2).join(" ").trim();
    if (!["aku", "kamu"].includes(who) || !name) {
      return sendTelegramReply(chatId, "Format salah. Contoh: /setname aku Sayangku");
    }
    if (who === "aku") db.settings.meName = name;
    if (who === "kamu") db.settings.partnerName = name;
    changed = true;
  } else if (command === "/setuser") {
    const who = (parts[1] || "").toLowerCase();
    const username = (parts[2] || "").trim();
    if (!["aku", "kamu"].includes(who) || !username) {
      return sendTelegramReply(chatId, "Format salah. Contoh: /setuser aku namauserbaru");
    }
    if (who === "aku") db.credentials.me.username = username;
    if (who === "kamu") db.credentials.partner.username = username;
    changed = true;
  } else if (command === "/setpass") {
    const who = (parts[1] || "").toLowerCase();
    const password = parts.slice(2).join(" ").trim();
    if (!["aku", "kamu"].includes(who) || !password) {
      return sendTelegramReply(chatId, "Format salah. Contoh: /setpass aku passwordBaru");
    }
    if (who === "aku") db.credentials.me.password = password;
    if (who === "kamu") db.credentials.partner.password = password;
    changed = true;
  } else if (command === "/cekconfig") {
    return sendTelegramReply(
      chatId,
      [
        `Anniv: ${db.settings.anniversaryDate}`,
        `Ultah aku: ${db.settings.myBirthday}`,
        `Ultah kamu: ${db.settings.partnerBirthday}`,
        `Nama aku: ${db.settings.meName}`,
        `Nama kamu: ${db.settings.partnerName}`,
        `User aku: ${db.credentials.me.username}`,
        `User kamu: ${db.credentials.partner.username}`
      ].join("\n")
    );
  } else {
    return sendTelegramReply(chatId, telegramHelpText());
  }

  if (changed) {
    writeDb(db);
    sessions.clear();
    return sendTelegramReply(chatId, "Berhasil diupdate ✅");
  }
}

async function pollTelegramUpdates() {
  const token = getTelegramBotToken();
  const allowedChatIds = getTelegramChatIds();
  if (!token || !allowedChatIds.length) {
    logTelegram("poll skipped", `token=${Boolean(token)} chatIds=${allowedChatIds.length}`);
    return;
  }

  const db = readDb();
  const url = `https://api.telegram.org/bot${token}/getUpdates`;

  try {
    const res = await axios.get(url, {
      params: {
        timeout: 0,
        offset: db.telegram.lastUpdateId + 1
      }
    });

    const updates = res.data?.result || [];
    for (const update of updates) {
      db.telegram.lastUpdateId = update.update_id;
      const msg = update.message;
      if (!msg?.text || !msg?.chat?.id) continue;

      const chatId = String(msg.chat.id);
      if (!allowedChatIds.includes(chatId)) {
        logTelegram("update ignored", `chat_id=${chatId}`);
        continue;
      }

      logTelegram("update accepted", `chat_id=${chatId} text=${msg.text}`);
      await processTelegramCommand(chatId, msg.text);
    }

    if (updates.length) {
      writeDb(db);
      logTelegram("poll processed", `updates=${updates.length}`);
    }
  } catch (error) {
    logTelegram("poll error", error.message);
  }
}

cron.schedule("0 * * * *", async () => {
  const now = new Date();
  const todayKey = now.toISOString().slice(0, 10);
  const db = readDb();

  if (db.sentReminders[todayKey]) return;

  const msgs = [];
  if (isMonthDay(db.settings.anniversaryDate, now)) msgs.push("Happy Anniversary sayang! 💖");
  if (isMonthDay(db.settings.myBirthday, now)) msgs.push(`Selamat ulang tahun ${db.settings.meName}! 🎂`);
  if (isMonthDay(db.settings.partnerBirthday, now)) msgs.push(`Selamat ulang tahun ${db.settings.partnerName}! 🎂`);

  if (!msgs.length) return;

  for (const msg of msgs) {
    try {
      await sendTelegramToAll(msg);
    } catch (e) {
      console.error("Telegram reminder error", e.message);
    }
  }

  db.sentReminders[todayKey] = msgs;
  writeDb(db);
});

setInterval(pollTelegramUpdates, 15000);
pollTelegramUpdates();
logTelegram("boot", `token=${Boolean(getTelegramBotToken())} chatIds=${getTelegramChatIds().join(",") || "-"}`);

io.use((socket, next) => {
  const cookieHeader = socket.handshake.headers.cookie || "";
  const token = cookieHeader
    .split(";")
    .map((v) => v.trim())
    .find((x) => x.startsWith("session="))
    ?.split("=")[1];

  if (!token || !sessions.has(token)) return next(new Error("unauthorized"));
  socket.user = sessions.get(token);
  next();
});

io.on("connection", (socket) => {
  onlineRoles.add(socket.user.role);
  io.emit("presence", Array.from(onlineRoles));

  socket.on("disconnect", () => {
    let stillOnline = false;
    for (const [id, s] of io.of("/").sockets) {
      if (id !== socket.id && s.user.role === socket.user.role) {
        stillOnline = true;
        break;
      }
    }
    if (!stillOnline) onlineRoles.delete(socket.user.role);
    io.emit("presence", Array.from(onlineRoles));
  });
});

app.get("*", (_, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

server.listen(PORT, () => {
  console.log(`Running on http://localhost:${PORT}`);
});
