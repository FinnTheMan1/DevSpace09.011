import React from "react";
import Avatar from "./Avatar";
export default function Team({ project, users, user, onAddMember }) {
  const [selectedUser, setSelectedUser] = React.useState("");
  const availableUsers = users.filter(u => !project.members.some(id => Number(id) === Number(u.id)));
  const canManage = ["Администратор", "Руководитель"].includes(user.role);
  return <div>
    {canManage && <div className="toolbar"><select value={selectedUser} onChange={e => setSelectedUser(e.target.value)}><option value="">Выберите сотрудника</option>{availableUsers.map(u => <option key={u.id} value={u.id}>{u.name} — {u.role}</option>)}</select><button className="primary" disabled={!selectedUser} onClick={() => { onAddMember(project.id, Number(selectedUser)); setSelectedUser(""); }}>＋ Добавить участника</button></div>}
    <div className="team-grid">{project.members.map(id => { const u = users.find(x => Number(x.id) === Number(id)); return <div className="member-card" key={id}><Avatar name={u?.name} /><div><b>{u?.name || `Пользователь #${id}`}</b><span>{u?.role || "Участник"}</span><small>{u?.contact || ""}</small></div></div>; })}</div>
    {availableUsers.length === 0 && canManage && <p className="muted">Все зарегистрированные сотрудники уже в команде.</p>}
  </div>;
}
