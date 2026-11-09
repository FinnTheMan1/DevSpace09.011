import React, { useState } from "react";
import { Modal, ModalActions } from "./Modal";
const priorities = ["Высокий", "Средний", "Низкий"];
export default function TaskModal({ project, users, onClose, onSave }) {
  const today = new Date();
  const formatDateInput = date => `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`;
  const nextMonth = new Date(today.getFullYear(), today.getMonth()+1, Math.min(today.getDate(), new Date(today.getFullYear(), today.getMonth()+2, 0).getDate()));
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState(formatDateInput(nextMonth));
  const [priority, setPriority] = useState("Средний");
  const [assignee, setAssignee] = useState(project.members[0]);
  return <Modal title="Новая задача" onClose={onClose}>
    <label>Название<input autoFocus value={title} onChange={e => setTitle(e.target.value)} /></label>
    <label>Описание<textarea value={description} onChange={e => setDescription(e.target.value)} /></label>
    <div className="two"><label>Дедлайн<input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} /></label><label>Приоритет<select value={priority} onChange={e => setPriority(e.target.value)}>{priorities.map(x => <option key={x}>{x}</option>)}</select></label></div>
    <label>Исполнитель<select value={assignee} onChange={e => setAssignee(Number(e.target.value))}>{project.members.map(id => { const u = users.find(x => x.id === id); return <option value={id} key={id}>{u?.name || `Пользователь #${id}`}</option>; })}</select></label>
    <ModalActions onClose={onClose} onSave={() => title && onSave({ title, description, deadline, priority, assignee, status: "К выполнению" })} />
  </Modal>;
}
