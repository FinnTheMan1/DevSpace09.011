import jwt from "jsonwebtoken";
const JWT_SECRET = process.env.JWT_SECRET || "devspace-course-secret-change-me";
export function signUser(user) {
  return jwt.sign({ id: user.id, login: user.login, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: "8h" });
}
export function adminOnly(req, res) {
  if (req.user.role !== "Администратор") {
    res.status(403).json({ message: "Недостаточно прав" });
    return false;
  }
  return true;
}
