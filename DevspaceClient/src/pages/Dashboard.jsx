import React from "react";
import Avatar from "../components/Avatar";
import Stat from "../components/Stat";
import ProjectCard from "../components/ProjectCard";
export default function Dashboard({ user, projects, totalTasks, doneTasks, openProject }) {
  return <section className="content">
    <header className="page-head"><div><div className="eyebrow">РАБОЧЕЕ ПРОСТРАНСТВО</div><h1>Добрый день, {user.name.split(" ")[0]}!</h1><p className="muted">Вот что происходит в ваших проектах.</p></div><div className="head-avatar"><Avatar name={user.name} /></div></header>
    <div className="stats"><Stat icon="▦" label="Активных проектов" value={projects.length} /><Stat icon="✓" label="Всего задач" value={totalTasks} /><Stat icon="↗" label="Завершено" value={doneTasks} /><Stat icon="◷" label="В работе" value={projects.reduce((n,p) => n + (p.tasks || []).filter(t => t.status === "В работе").length, 0)} /></div>
    <div className="section-title"><h2>Мои проекты</h2><span>{projects.length} проекта</span></div>
    <div className="project-grid">{projects.map(p => <ProjectCard key={p.id} project={p} onClick={() => openProject(p.id)} />)}</div>
  </section>;
}
