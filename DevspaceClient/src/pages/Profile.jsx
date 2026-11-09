import React, { useState } from "react";
import Avatar from "../components/Avatar";
export default function Profile({ user, onSave }) {
  const [name, setName] = useState(user.name);
  const [contact, setContact] = useState(user.contact || "");
  return <section className="content narrow"><div className="eyebrow">ЛИЧНЫЕ ДАННЫЕ</div><h1>Профиль</h1><p className="muted">Информация текущего пользователя.</p>
    <div className="profile-card"><Avatar name={user.name} large /><div className="profile-form">
      <label>ФИО<input value={name} onChange={e => setName(e.target.value)} /></label>
      <label>Логин<input value={user.login} disabled /></label>
      <label>Роль<input value={user.role} disabled /></label>
      <label>Контактная информация<input value={contact} onChange={e => setContact(e.target.value)} /></label>
      <button className="primary" onClick={() => onSave({ ...user, name, contact })}>Сохранить изменения</button>
    </div></div>
  </section>;
}
