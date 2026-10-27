import type { SourceFile } from "./audit-engine.ts";

export const demoFiles: SourceFile[] = [
  {
    name: "src/routes/session.ts",
    content: `import { Router } from "express";
const router = Router();

router.post("/session", async (req, res) => {
  const account = await findAccount(req.body.email);
  if (!account) return res.status(401).json({ error: "Invalid credentials" });
  const valid = await verifyPassword(req.body.password, account.passwordHash);
  if (!valid) return res.status(401).json({ error: "Invalid credentials" });
  const token = await issueSession(account.id);
  res.cookie("session", token, { httpOnly: true, secure: true, sameSite: "lax" });
  return res.json({ ok: true });
});

export default router;`,
  },
  {
    name: "src/middleware/require-user.ts",
    content: `import type { Request, Response, NextFunction } from "express";

export async function requireUser(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.session;
  if (!token) return res.status(401).end();
  const session = await readSession(token);
  if (!session) return res.status(401).end();
  req.userId = session.userId;
  return next();
}`,
  },
  {
    name: "src/routes/profile.py",
    content: `from flask import Blueprint, request, jsonify
from app.auth import current_user

profile = Blueprint("profile", __name__)

@profile.get("/profile")
def get_profile():
    user = current_user(request)
    if user is None:
        return jsonify({"error": "unauthorized"}), 401
    return jsonify({"name": user.display_name})`,
  },
  {
    name: "fixtures/synthetic-recovery-example.ts",
    content: `// Synthetic teaching fixture. This is not a real credential or application.
export async function requestPasswordReset(email: string) {
  const resetToken = Math.random().toString(36).slice(2);
  console.log("synthetic reset token", resetToken);
  await saveResetToken(email, resetToken);
}

export function setDemoSession(res: Response, token: string) {
  res.cookie("session", token, { httpOnly: false, secure: false, sameSite: "none" });
  localStorage.setItem("authToken", token);
}

export function readDemoClaims(token: string) {
  return jwt.decode(token);
}`,
  },
];

export const safeValidationFiles: SourceFile[] = [
  {
    name: "src/auth/safe-session.ts",
    content: `export function issueSession(res: Response, token: string) {
  res.cookie("session", token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
  });
}

export function verifySession(token: string) {
  return jwt.verify(token, signingKey, {
    algorithms: ["RS256"],
    issuer: "https://issuer.example",
    audience: "example-app",
  });
}

export async function createResetToken() {
  return crypto.randomBytes(32).toString("hex");
}`,
  },
];
