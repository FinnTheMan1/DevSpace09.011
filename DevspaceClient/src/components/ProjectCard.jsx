import { formatDate } from "../utils/formatDate";
export default function ProjectCard({ project, onClick }) {
  const done = (project.tasks || []).filter(t => t.status === "Завершена").length;
  const progress = project.tasks?.length ? Math.round((done / project.tasks.length) * 100) : 0;
  return <button className="project-card" onClick={onClick}>
    <div className="project-top"><span className="project-icon">◈</span><span className="arrow">↗</span></div>
    <h3>{project.title}</h3><p>{project.description}</p>
    <div className="project-meta"><span>{project.tasks?.length || 0} задач</span><span>{project.members?.length || 0} участников</span></div>
    <div className="progress-row"><span>Прогресс</span><b>{progress}%</b></div>
    <div className="progress"><i style={{ width: `${progress}%` }} /></div>
    <div className="date">{formatDate(project.start)} — {formatDate(project.end)}</div>
  </button>;
}
