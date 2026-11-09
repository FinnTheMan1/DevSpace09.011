import Avatar from "./Avatar";
import { formatDate } from "../utils/formatDate";
export default function TaskCard({ task, users, user, onUpdate }) {
  const assignee = users.find(u => Number(u.id) === Number(task.assignee));
  const canChange = Number(task.assignee) === Number(user.id) || user.role === "Администратор";
  return <div className="task-card">
    <div className="task-priority"><span className={`priority ${task.priority?.toLowerCase()}`}>{task.priority}</span><span>⋯</span></div>
    <h3>{task.title}</h3><p>{task.description}</p>
    <div className="task-bottom"><span>◷ {task.deadline ? formatDate(task.deadline) : "Без срока"}</span>{assignee && <span className="assignee"><Avatar name={assignee.name} /></span>}</div>
    {canChange && <select value={task.status} onChange={e => onUpdate({ status: e.target.value })}>{["К выполнению", "В работе", "На проверке", "Завершена"].map(status => <option key={status} value={status}>{status}</option>)}</select>}
  </div>;
}
