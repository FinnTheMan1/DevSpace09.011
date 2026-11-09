import React, { useState } from "react";
import Avatar from "../components/Avatar";
import UserModal from "../components/UserModal";
export default function UsersPage({ users, onCreate, onDelete }) {
  const [q, setQ] = useState("");
  const [modal, setModal] = useState(false);
  const filtered = users.filter(u => (u.name + " " + u.login + " " + u.role).toLowerCase().includes(q.toLowerCase()));
  return <section className="content">
    <header className="page-head"><div><div className="eyebrow">АДМИНИСТРИРОВАНИЕ</div><h1>Пользователи</h1><p className="muted">Управление сотрудниками и ролями доступа.</p></div><button className="primary" onClick={() => setModal(true)}>＋ Добавить пользователя</button></header>
    <div className="toolbar"><input className="search" placeholder="Поиск по имени, логину или роли…" value={q} onChange={e => setQ(e.target.value)} /></div>
    <div className="table-card"><table><thead><tr><th>Сотрудник</th><th>Логин</th><th>Роль</th><th>Контакты</th><th></th></tr></thead><tbody>{filtered.map(u => <tr key={u.id}><td><div className="person"><Avatar name={u.name} /><b>{u.name}</b></div></td><td>{u.login}</td><td><span className="role">{u.role}</span></td><td>{u.contact || "—"}</td><td><button className="icon-btn" onClick={() => onDelete(u.id)}>×</button></td></tr>)}</tbody></table></div>
    {modal && <UserModal onClose={() => setModal(false)} onSave={u => { onCreate(u); setModal(false); }} />}
  </section>;
}
