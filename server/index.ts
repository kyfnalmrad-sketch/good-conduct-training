import express, { type Request, type Response, type NextFunction } from "express";
import { createServer } from "http";
import crypto from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SESSION_COOKIE = "good_conduct_access";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

function getSessionSecret() {
  return process.env.SITE_SESSION_SECRET || "local-development-session-secret";
}

function sign(value: string) {
  return crypto
    .createHmac("sha256", getSessionSecret())
    .update(value)
    .digest("base64url");
}

function createSessionToken() {
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
  const payload = String(expiresAt);
  return `${payload}.${sign(payload)}`;
}

function hasValidSession(req: Request) {
  const raw = req.headers.cookie
    ?.split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${SESSION_COOKIE}=`))
    ?.slice(SESSION_COOKIE.length + 1);

  if (!raw) return false;

  const [expiresAt, signature] = raw.split(".");
  if (!expiresAt || !signature || Number(expiresAt) < Math.floor(Date.now() / 1000)) {
    return false;
  }

  const expected = sign(expiresAt);
  const left = Buffer.from(signature);
  const right = Buffer.from(expected);
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}

function passwordsMatch(input: string) {
  const configuredPassword = process.env.SITE_PASSWORD;
  if (!configuredPassword || !input) return false;

  const left = Buffer.from(input);
  const right = Buffer.from(configuredPassword);
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}

function setSessionCookie(res: Response) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  res.setHeader(
    "Set-Cookie",
    `${SESSION_COOKIE}=${createSessionToken()}; Max-Age=${SESSION_TTL_SECONDS}; Path=/; HttpOnly; SameSite=Lax${secure}`,
  );
}

function clearSessionCookie(res: Response) {
  res.setHeader(
    "Set-Cookie",
    `${SESSION_COOKIE}=; Max-Age=0; Path=/; HttpOnly; SameSite=Lax`,
  );
}

function redirectToLogin(req: Request, res: Response, next: NextFunction) {
  if (hasValidSession(req)) {
    next();
    return;
  }

  if (req.path.startsWith("/api/")) {
    res.status(401).json({ authenticated: false, message: "يلزم تسجيل الدخول" });
    return;
  }

  res.redirect(`/login?next=${encodeURIComponent(req.path)}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  const staticPath = path.resolve(__dirname, "public");

  app.disable("x-powered-by");
  app.use(express.json({ limit: "16kb" }));

  app.get("/api/session", (req, res) => {
    res.json({ authenticated: hasValidSession(req) });
  });

  app.post("/api/login", (req, res) => {
    if (!process.env.SITE_PASSWORD) {
      res.status(503).json({ message: "لم يتم إعداد كلمة المرور على الخادم بعد" });
      return;
    }

    const password = typeof req.body?.password === "string" ? req.body.password : "";
    if (!passwordsMatch(password)) {
      res.status(401).json({ message: "كلمة المرور غير صحيحة" });
      return;
    }

    setSessionCookie(res);
    res.json({ authenticated: true });
  });

  app.post("/api/logout", (_req, res) => {
    clearSessionCookie(res);
    res.json({ authenticated: false });
  });

  app.use(express.static(staticPath));

  app.get(["/editor", "/preview", "/records"], redirectToLogin, (_req, res) => {
    res.sendFile(path.join(staticPath, "index.html"));
  });

  app.get(["/", "/login"], (_req, res) => {
    res.sendFile(path.join(staticPath, "index.html"));
  });

  app.use(redirectToLogin);
  app.use((_req, res) => {
    res.sendFile(path.join(staticPath, "index.html"));
  });

  const port = process.env.PORT || 3000;
  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch((error) => {
  console.error(error);
  process.exit(1);
});
