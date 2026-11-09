import React, { useState } from "react";
import { formatDate } from "../utils/formatDate";
import TaskBoard from "../components/TaskBoard";
import Chat from "../components/Chat";
import Team from "../components/Team";
import TaskModal from "../components/TaskModal";
export default function ProjectPage({ project, users, user, onBack, onCreateTask, onUpdateTask, onMessage, onAddMember, onUpdateMessage, onDeleteMessage }) {
  const [tab, setTab] = useState("tasks");
  const [modal, setModal] = useState(false);
  if (!project) return <div className="content"><button className="back" onClick={onBack}>← Проекты</button><h1>Проект не найден</h1></div>;
  const canManage = ["Администратор", "Руководитель"].includes(user.role);
  return <section className="content">
    <button className="back" onClick={onBack}>← Все проекты</button>
    <header className="project-head"><div><div className="eyebrow">ПРОЕКТ</div><h1>{project.title}</h1><p className="muted">{project.description}</p></div>{canManage && <button className="primary" onClick={() => setModal(true)}>＋ Создать задачу</button>}</header>
    <div className="project-info"><span>◷ {formatDate(project.start)} — {formatDate(project.end)}</span><span>♙ {project.members.length} участников</span><span>✓ {project.tasks.filter(t => t.status === "Завершена").length}/{project.tasks.length} завершено</span></div>
    <div className="tabs"><button className={tab === "tasks" ? "tab active" : "tab"} onClick={() => setTab("tasks")}>Задачи</button><button className={tab === "chat" ? "tab active" : "tab"} onClick={() => setTab("chat")}>Чат</button><button className={tab === "team" ? "tab active" : "tab"} onClick={() => setTab("team")}>Команда</button></div>
    {tab === "tasks" && <TaskBoard project={project} users={users} user={user} onUpdate={onUpdateTask} />}
    {tab === "chat" && <Chat project={project} users={users} user={user} onMessage={onMessage} onUpdateMessage={onUpdateMessage} onDeleteMessage={onDeleteMessage} />}
    {tab === "team" && <Team project={project} users={users} user={user} onAddMember={onAddMember} />}
    {modal && <TaskModal project={project} users={users} onClose={() => setModal(false)} onSave={data => { onCreateTask(project.id, data); setModal(false); }} />}
  </section>;
}
