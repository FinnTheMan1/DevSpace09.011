import pg from "pg";
const { Pool } = pg;
export let pool = null;
export let demoMode = !process.env.DATABASE_URL;
export const demo = {
  users: [
    { id: 1, login: "admin", password: "admin", name: "Алексей Морозов", role: "Администратор", contact: "admin@digitalcore.local" },
    { id: 2, login: "anna", password: "admin", name: "Анна Смирнова", role: "Руководитель", contact: "anna@digitalcore.local" },
    { id: 3, login: "ivan", password: "admin", name: "Иван Петров", role: "Разработчик", contact: "ivan@digitalcore.local" },
    { id: 4, login: "maria", password: "admin", name: "Мария Волкова", role: "Разработчик", contact: "maria@digitalcore.local" }
  ],
  projects: [
    { id: 1, title: "DevSpace", description: "Внутренний портал компании для управления проектами, задачами и коммуникацией.", start: "2026-09-01", end: "2026-12-20", manager: 2, members: [2,3,4], tasks: [
      {id:101,title:"Спроектировать API",description:"Подготовить REST API для проектов и задач.",status:"В работе",priority:"Высокий",deadline:"2026-11-12",assignee:3},
      {id:102,title:"Собрать экран проектов",description:"Карточки проектов и детальная страница.",status:"На проверке",priority:"Средний",deadline:"2026-11-15",assignee:4},
      {id:103,title:"Настроить авторизацию",description:"Вход, роли и временный пароль.",status:"К выполнению",priority:"Высокий",deadline:"2026-11-18",assignee:3},
      {id:104,title:"Подготовить тест-кейсы",description:"Проверить основные сценарии использования.",status:"Завершена",priority:"Низкий",deadline:"2026-11-05",assignee:4}
    ], messages: [
      {id:1,user:2,text:"Коллеги, сегодня проверяем API и экран проектов.",time:"10:14"},
      {id:2,user:3,text:"API готов на тестовом стенде.",time:"10:27"},
      {id:3,user:4,text:"Экран проектов отправила на проверку.",time:"10:41"}
    ]},
    { id: 2, title: "CRM Portal", description: "Корпоративный кабинет для работы с клиентами и заявками.", start: "2026-10-10", end: "2027-01-30", manager: 2, members: [2,3], tasks: [
      {id:201,title:"Модель клиентов",description:"Спроектировать сущности CRM.",status:"В работе",priority:"Средний",deadline:"2026-11-25",assignee:3}
    ], messages: [{id:4,user:2,text:"На этой неделе закрываем модель данных.",time:"09:20"}]},
    { id: 3, title: "Analytics", description: "Дашборд с ключевыми показателями внутренних процессов.", start: "2026-11-01", end: "2027-02-15", manager: 2, members: [2,4], tasks: [], messages: [] }
  ]
};
export async function initDb() {
  if (!process.env.DATABASE_URL) return;
  pool = new Pool({ connectionString: process.env.DATABASE_URL });
  try {
    await pool.query("SELECT 1");
    demoMode = false;
    console.log("DevSpace API: PostgreSQL connected");
  } catch (err) {
    console.warn("PostgreSQL is unavailable; starting in demo mode.");
    console.warn(err.message);
    demoMode = true;
  }
}
export function projectForUser(p) {
  return { ...p, members: [...p.members], tasks: p.tasks.map(t => ({...t})), messages: p.messages.map(m => ({...m})) };
}
