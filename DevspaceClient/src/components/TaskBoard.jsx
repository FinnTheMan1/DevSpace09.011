import TaskCard from "./TaskCard";
const statuses = ["К выполнению", "В работе", "На проверке", "Завершена"];
export default function TaskBoard({ project, users, user, onUpdate }) {
  return <div className="board">{statuses.map(status => <div className="column" key={status}>
    <div className="column-head"><span>{status}</span><b>{project.tasks.filter(task => task.status === status).length}</b></div>
    {project.tasks.filter(task => task.status === status).map(task => <TaskCard key={task.id} task={task} users={users} user={user} onUpdate={patch => onUpdate(project.id, task.id, patch)} />)}
  </div>)}</div>;
}
