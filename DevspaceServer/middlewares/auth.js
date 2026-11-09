import jwt from "jsonwebtoken";
const JWT_SECRET = process.env.JWT_SECRET || "devspace-course-secret-change-me";
export function auth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ message: "Требуется авторизация" });
  try { req.user = jwt.verify(token, JWT_SECRET); next(); }
  catch { return res.status(401).json({ message: "Сессия недействительна" }); }
}
