import React, { useState } from "react";
import { Modal, ModalActions } from "./Modal";
export default function UserModal({ onClose, onSave }) {
  const [login, setLogin] = useState("");
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [role, setRole] = useState("Разработчик");
  const [password, setPassword] = useState("admin");
  return <Modal title="Новый пользователь" onClose={onClose}>
    <label>Логин<input autoFocus value={login} onChange={e => setLogin(e.target.value)} /></label>
    <label>ФИО<input value={name} onChange={e => setName(e.target.value)} /></label>
    <label>Контакт<input value={contact} onChange={e => setContact(e.target.value)} /></label>
    <label>Роль<select value={role} onChange={e => setRole(e.target.value)}><option>Администратор</option><option>Руководитель</option><option>Разработчик</option></select></label>
    <label>Временный пароль<input value={password} onChange={e => setPassword(e.target.value)} /></label>
    <ModalActions onClose={onClose} onSave={() => login && name && onSave({ login, name, contact, role, password })} />
  </Modal>;
}
