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
    telegramBotToken: "",
    telegramChatId: "",
    meName: "Aku",
    partnerName: "Dia"
  },
  timeline: [],
  sentReminders: {}
};

function readDb() {
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(defaultDb, null, 2));
    return structuredClone(defaultDb);
  }
  try {
    return JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
  } catch {
    return structuredClone(defaultDb);
  }
}

function writeDb(db) {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

const USERS = [
  { username: process.env.ME_USER || "aku", password: process.env.ME_PASS || "sayang123", role: "me" },
  { username: process.env.PARTNER_USER || "dia", password: process.env.PARTNER_PASS || "bucin123", role: "partner" }
];

const sessions = new Map();
const onlineUsers = new Set();

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
  const user = USERS.find((u) => u.username === username && u.password === password);
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
  res.json(db);
});

app.put("/api/settings", authMiddleware, (req, res) => {
  const db = readDb();
  db.settings = { ...db.settings, ...req.body };
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

  await backupToTelegram(db.settings, item, req.file?.path);
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

async function sendTelegramMessage(settings, text) {
  if (!settings.telegramBotToken || !settings.telegramChatId) return;
  const url = `https://api.telegram.org/bot${settings.telegramBotToken}/sendMessage`;
  await axios.post(url, { chat_id: settings.telegramChatId, text });
}

async function backupToTelegram(settings, item, filePath) {
  if (!settings.telegramBotToken || !settings.telegramChatId || !filePath) return;
  const url = `https://api.telegram.org/bot${settings.telegramBotToken}/sendDocument`;
  const FormData = require("form-data");
  const form = new FormData();
  form.append("chat_id", settings.telegramChatId);
  form.append("caption", `Backup media baru: ${item.title} (${item.takenAt || "tanpa tanggal"})`);
  form.append("document", fs.createReadStream(filePath));
  await axios.post(url, form, { headers: form.getHeaders() });
}

function isMonthDay(dateStr, now) {
  const d = new Date(dateStr);
  return d.getUTCDate() === now.getUTCDate() && d.getUTCMonth() === now.getUTCMonth();
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

  if (msgs.length) {
    for (const msg of msgs) {
      try {
        await sendTelegramMessage(db.settings, msg);
      } catch (e) {
        console.error("Telegram error", e.message);
      }
    }
    db.sentReminders[todayKey] = msgs;
    writeDb(db);
  }
});

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
  onlineUsers.add(socket.user.username);
  io.emit("presence", Array.from(onlineUsers));

  socket.on("disconnect", () => {
    let stillOnline = false;
    for (const [id, s] of io.of("/").sockets) {
      if (id !== socket.id && s.user.username === socket.user.username) {
        stillOnline = true;
        break;
      }
    }
    if (!stillOnline) onlineUsers.delete(socket.user.username);
    io.emit("presence", Array.from(onlineUsers));
  });
});

app.get("*", (_, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

server.listen(PORT, () => {
  console.log(`Running on http://localhost:${PORT}`);
});
