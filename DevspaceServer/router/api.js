import { Router } from "express";
import bcrypt from "bcryptjs";
import { pool, demo, demoMode } from "../database/db.js";
import { auth } from "../middlewares/auth.js";
import { signUser } from "../controllers/helpers.js";

const router = Router();
router.get("/health", (req,res) => res.json({ status: "ok", service: "DevSpace API", database: demoMode ? "demo" : "postgresql" }));

router.post("/auth/login", async (req,res,next) => {
  try {
    const { login, password } = req.body || {};
    if (!login || !password) return res.status(400).json({ message: "Введите логин и пароль" });
    if (demoMode) {
      const user = demo.users.find(u => u.login === login && u.password === password);
      if (!user) return res.status(401).json({ message: "Неверный логин или пароль" });
      const { password: _, ...safe } = user;
      return res.json({ token: signUser(user), user: safe });
    }
    const { rows } = await pool.query("SELECT id_user AS id, login, password_hash, full_name AS name, role, is_temp_password FROM users WHERE login=$1", [login]);
    const user = rows[0];
    if (!user || !(await bcrypt.compare(password, user.password_hash))) return res.status(401).json({ message: "Неверный логин или пароль" });
    res.json({ token: signUser(user), user: { id:user.id, login:user.login, name:user.name, role:user.role, is_temp_password:user.is_temp_password } });
  } catch (e) { next(e); }
});

router.get("/me", auth, async (req,res,next) => {
  try {
    if (demoMode) {
      const u = demo.users.find(u => u.id === req.user.id);
      if (!u) return res.status(404).json({ message: "Пользователь не найден" });
      const { password, ...safe } = u;
      return res.json(safe);
    }
    const { rows } = await pool.query("SELECT id_user AS id, login, full_name AS name, contact, role, is_temp_password FROM users WHERE id_user=$1", [req.user.id]);
    if (!rows[0]) return res.status(404).json({ message: "Пользователь не найден" });
    res.json(rows[0]);
  } catch (e) { next(e); }
});

router.get("/users", auth, async (req,res,next) => {
  try {
    if (req.user.role !== "Администратор") return res.status(403).json({message:"Недостаточно прав"});
    if (demoMode) return res.json(demo.users.map(({password,...u})=>u));
    const { rows } = await pool.query("SELECT id_user AS id, login, full_name AS name, role, contact FROM users ORDER BY id_user");
    res.json(rows);
  } catch (e) { next(e); }
});
router.post("/users", auth, async (req,res,next) => {
  try {
    if (req.user.role !== "Администратор") return res.status(403).json({message:"Недостаточно прав"});
    const {login,name,contact,role,password="admin"} = req.body;
    if (!login || !name || !role) return res.status(400).json({message:"Логин, ФИО и роль обязательны"});
    if (demoMode) {
      const id = Math.max(...demo.users.map(u=>u.id),0)+1;
      const user = {id,login,password,name,role,contact:contact||""};
      demo.users.push(user);
      const { password: ignored, ...safe } = user;
      return res.status(201).json(safe);
    }
    const hash = await bcrypt.hash(password, 10);
    const { rows } = await pool.query("INSERT INTO users(login,password_hash,full_name,contact,role,is_temp_password) VALUES($1,$2,$3,$4,$5,TRUE) RETURNING id_user AS id,login,full_name AS name,contact,role,is_temp_password", [login,hash,name,contact||"",role]);
    res.status(201).json(rows[0]);
  } catch (e) { next(e); }
});
router.delete("/users/:id", auth, async (req,res,next) => {
  try {
    if (req.user.role !== "Администратор") return res.status(403).json({message:"Недостаточно прав"});
    const id = Number(req.params.id);
    if (id === req.user.id) return res.status(400).json({message:"Нельзя удалить текущего администратора"});
    if (demoMode) { demo.users = demo.users.filter(u=>u.id!==id); return res.json({ok:true}); }
    await pool.query("DELETE FROM users WHERE id_user=$1", [id]);
    res.json({ok:true});
  } catch (e) { next(e); }
});

router.patch("/profile", auth, async (req,res,next) => {
  try {
    const { name, contact } = req.body;
    if (demoMode) {
      const u = demo.users.find(x => x.id === req.user.id);
      if (!u) return res.status(404).json({ message: "Пользователь не найден" });
      if (name !== undefined) u.name = name;
      if (contact !== undefined) u.contact = contact;
      const { password, ...safe } = u;
      return res.json(safe);
    }
    const { rows } = await pool.query("UPDATE users SET full_name=$1, contact=$2 WHERE id_user=$3 RETURNING id_user AS id,login,full_name AS name,contact,role,is_temp_password", [name, contact, req.user.id]);
    if (!rows.length) return res.status(404).json({ message: "Пользователь не найден" });
    res.json(rows[0]);
  } catch (e) { next(e); }
});

router.get("/projects", auth, async (req,res,next) => {
  try {
    if (demoMode) return res.json(demo.projects.filter(p => req.user.role === "Администратор" || p.members.includes(req.user.id)).map(p => ({...p, members:[...p.members], tasks:p.tasks.map(t=>({...t})), messages:p.messages.map(m=>({...m}))})));
    const { rows } = await pool.query(`
      SELECT p.id_project AS id,p.title,p.description,p.start_date AS start,p.end_date AS end,p.id_manager AS manager,
      COALESCE((SELECT json_agg(pm.id_user) FROM project_members pm WHERE pm.id_project=p.id_project),'[]') AS members,
      COALESCE((SELECT json_agg(json_build_object('id',t.id_task,'title',t.title,'description',t.description,'status',t.status,'priority',t.priority,'deadline',t.deadline,'assignee',t.id_assignee) ORDER BY t.id_task) FROM tasks t WHERE t.id_project=p.id_project),'[]') AS tasks,
      COALESCE((SELECT json_agg(json_build_object('id',m.id_message,'user',m.id_user,'text',m.text,'time',to_char(m.sent_at,'HH24:MI')) ORDER BY m.sent_at) FROM chat_messages m WHERE m.id_project=p.id_project),'[]') AS messages
      FROM projects p WHERE $1='Администратор' OR p.id_project IN (SELECT id_project FROM project_members WHERE id_user=$2) ORDER BY p.id_project`, [req.user.role,req.user.id]);
    res.json(rows);
  } catch (e) { next(e); }
});
router.post("/projects/:id/members", auth, async (req,res,next) => {
  try {
    const projectId = Number(req.params.id), userId = Number(req.body.userId);
    if (!["Администратор", "Руководитель"].includes(req.user.role)) return res.status(403).json({ message: "Недостаточно прав" });
    if (!projectId || !userId) return res.status(400).json({ message: "Некорректные данные" });
    if (demoMode) {
      const project = demo.projects.find(p => p.id === projectId);
      if (!project) return res.status(404).json({ message: "Проект не найден" });
      if (!project.members.includes(userId)) project.members.push(userId);
      return res.json({ message: "Участник добавлен", members: project.members });
    }
    const project = await pool.query("SELECT id_manager FROM projects WHERE id_project=$1", [projectId]);
    if (!project.rows[0]) return res.status(404).json({ message: "Проект не найден" });
    if (req.user.role !== "Администратор" && Number(project.rows[0].id_manager) !== Number(req.user.id)) return res.status(403).json({ message: "Недостаточно прав" });
    const employee = await pool.query("SELECT id_user FROM users WHERE id_user=$1", [userId]);
    if (!employee.rows[0]) return res.status(404).json({ message: "Пользователь не найден" });
    const existing = await pool.query("SELECT 1 FROM project_members WHERE id_project=$1 AND id_user=$2", [projectId,userId]);
    if (existing.rows.length) return res.status(400).json({ message: "Пользователь уже в проекте" });
    await pool.query("INSERT INTO project_members(id_project,id_user) VALUES($1,$2)", [projectId,userId]);
    res.json({ message: "Участник добавлен" });
  } catch (e) { next(e); }
});
router.post("/projects", auth, async (req,res,next) => {
  try {
    if (!["Администратор","Руководитель"].includes(req.user.role)) return res.status(403).json({message:"Недостаточно прав"});
    const {title,description,start,end} = req.body;
    if (!title || !start || !end) return res.status(400).json({message:"Название и даты обязательны"});
    if (demoMode) {
      const id = Math.max(...demo.projects.map(p=>p.id),0)+1;
      const p = {id,title,description:description||"",start,end,manager:req.user.id,members:[req.user.id],tasks:[],messages:[]};
      demo.projects.push(p);
      return res.status(201).json({...p,members:[...p.members],tasks:[],messages:[]});
    }
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const {rows} = await client.query("INSERT INTO projects(title,description,start_date,end_date,id_manager) VALUES($1,$2,$3,$4,$5) RETURNING id_project AS id,title,description,start_date AS start,end_date AS end,id_manager AS manager", [title,description||"",start,end,req.user.id]);
      const p = rows[0];
      await client.query("INSERT INTO project_members(id_project,id_user) VALUES($1,$2)", [p.id,req.user.id]);
      await client.query("COMMIT");
      res.status(201).json({...p,members:[req.user.id],tasks:[],messages:[]});
    } catch (e) { await client.query("ROLLBACK"); throw e; }
    finally { client.release(); }
  } catch (e) { next(e); }
});
router.post("/projects/:id/tasks", auth, async (req,res,next) => {
  try {
    const projectId = Number(req.params.id);
    const {title,description,deadline,priority,assignee,status="К выполнению"} = req.body;
    if (!title || !assignee) return res.status(400).json({message:"Название и исполнитель обязательны"});
    if (demoMode) {
      const p = demo.projects.find(x=>x.id===projectId);
      if (!p) return res.status(404).json({message:"Проект не найден"});
      const t = {id:Date.now(),title,description:description||"",deadline,priority,assignee:Number(assignee),status};
      p.tasks.push(t); return res.status(201).json(t);
    }
    const {rows} = await pool.query("INSERT INTO tasks(id_project,id_assignee,title,description,status,priority,deadline) VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING id_task AS id,title,description,status,priority,deadline,id_assignee AS assignee", [projectId,assignee,title,description||"",status,priority,deadline||null]);
    res.status(201).json(rows[0]);
  } catch (e) { next(e); }
});
router.patch("/tasks/:id", auth, async (req,res,next) => {
  try {
    const id = Number(req.params.id), {status} = req.body;
    if (!["К выполнению","В работе","На проверке","Завершена"].includes(status)) return res.status(400).json({message:"Недопустимый статус"});
    if (demoMode) {
      for (const p of demo.projects) { const t = p.tasks.find(x=>x.id===id); if (t) { t.status=status; return res.json(t); } }
      return res.status(404).json({message:"Задача не найдена"});
    }
    const {rows} = await pool.query("UPDATE tasks SET status=$1 WHERE id_task=$2 RETURNING id_task AS id,title,description,status,priority,deadline,id_assignee AS assignee", [status,id]);
    if (!rows[0]) return res.status(404).json({message:"Задача не найдена"});
    res.json(rows[0]);
  } catch (e) { next(e); }
});
router.post("/projects/:id/messages", auth, async (req,res,next) => {
  try {
    const projectId = Number(req.params.id), {text} = req.body;
    if (!text?.trim()) return res.status(400).json({message:"Введите сообщение"});
    if (demoMode) {
      const p = demo.projects.find(x=>x.id===projectId);
      if (!p) return res.status(404).json({message:"Проект не найден"});
      const m = {id:Date.now(),user:req.user.id,text:text.trim(),time:new Date().toLocaleTimeString("ru-RU",{hour:"2-digit",minute:"2-digit"})};
      p.messages.push(m); return res.status(201).json(m);
    }
    const {rows} = await pool.query("INSERT INTO chat_messages(id_project,id_user,text) VALUES($1,$2,$3) RETURNING id_message AS id,id_user AS user,text,to_char(sent_at,'HH24:MI') AS time", [projectId,req.user.id,text.trim()]);
    res.status(201).json(rows[0]);
  } catch (e) { next(e); }
});
router.patch("/messages/:id", auth, async (req,res,next) => {
  try {
    const messageId = Number(req.params.id), {text} = req.body;
    if (!text?.trim()) return res.status(400).json({message:"Введите текст сообщения"});
    if (demoMode) {
      for (const p of demo.projects) {
        const m = p.messages.find(x=>x.id===messageId);
        if (m) {
          if (m.user !== req.user.id) return res.status(403).json({message:"Можно редактировать только свои сообщения"});
          m.text = text.trim(); return res.json(m);
        }
      }
      return res.status(404).json({message:"Сообщение не найдено"});
    }
    const {rows} = await pool.query("UPDATE chat_messages SET text=$1 WHERE id_message=$2 AND id_user=$3 RETURNING id_message AS id,id_user AS \"user\",text,to_char(sent_at,'HH24:MI') AS time", [text.trim(),messageId,req.user.id]);
    if (!rows[0]) return res.status(403).json({message:"Нельзя редактировать это сообщение"});
    res.json(rows[0]);
  } catch (e) { next(e); }
});
router.delete("/messages/:id", auth, async (req,res,next) => {
  try {
    const messageId = Number(req.params.id);
    if (demoMode) {
      for (const p of demo.projects) {
        const index = p.messages.findIndex(x=>x.id===messageId);
        if (index !== -1) {
          if (p.messages[index].user !== req.user.id) return res.status(403).json({message:"Можно удалять только свои сообщения"});
          p.messages.splice(index,1); return res.json({message:"Сообщение удалено"});
        }
      }
      return res.status(404).json({message:"Сообщение не найдено"});
    }
    const {rowCount} = await pool.query("DELETE FROM chat_messages WHERE id_message=$1 AND id_user=$2", [messageId,req.user.id]);
    if (!rowCount) return res.status(403).json({message:"Нельзя удалить это сообщение"});
    res.json({message:"Сообщение удалено"});
  } catch (e) { next(e); }
});
export default router;
