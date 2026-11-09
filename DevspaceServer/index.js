import "dotenv/config";
import express from "express";
import cors from "cors";
import apiRouter from "./router/api.js";
import { initDb, demoMode } from "./database/db.js";

const app = express();
const PORT = Number(process.env.PORT || 3001);
app.use(cors());
app.use(express.json());
app.use("/api", apiRouter);
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: "Внутренняя ошибка сервера" });
});
await initDb();
app.listen(PORT, () => console.log(`DevSpace API: http://127.0.0.1:${PORT} (${demoMode ? "demo" : "postgresql"})`));
