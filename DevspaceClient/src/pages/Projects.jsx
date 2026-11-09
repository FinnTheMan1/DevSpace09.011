import React, { useState } from "react";
import ProjectCard from "../components/ProjectCard";
import ProjectModal from "../components/ProjectModal";
export default function Projects({ projects, user, openProject, onCreate }) {
  const [modal, setModal] = useState(false);
  const [q, setQ] = useState("");
  const filtered = projects.filter(p => p.title.toLowerCase().includes(q.toLowerCase()));
  return <section className="content">
    <header className="page-head"><div><div className="eyebrow">РАБОЧЕЕ ПРОСТРАНСТВО</div><h1>Проекты</h1><p className="muted">Все проекты, доступные вашему аккаунту.</p></div><div className="actions">{["Администратор", "Руководитель"].includes(user.role) && <button className="primary" onClick={() => setModal(true)}>+ Новый проект</button>}</div></header>
    <div className="toolbar"><input className="search" placeholder="Поиск проектов..." value={q} onChange={e => setQ(e.target.value)} /><span className="muted">{filtered.length} результатов</span></div>
    <div className="project-grid">{filtered.map(p => <ProjectCard key={p.id} project={p} onClick={() => openProject(p.id)} />)}</div>
    {modal && <ProjectModal onClose={() => setModal(false)} onSave={data => { onCreate(data); setModal(false); }} />}
  </section>;
}
