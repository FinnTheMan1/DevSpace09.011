import React, { useState } from "react";
import { Modal, ModalActions } from "./Modal";
export default function ProjectModal({ onClose, onSave }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const today = new Date();
  const formatDateInput = date => `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`;
  const nextMonth = new Date(today.getFullYear(), today.getMonth()+1, Math.min(today.getDate(), new Date(today.getFullYear(), today.getMonth()+2, 0).getDate()));
  const [start, setStart] = useState(formatDateInput(today));
  const [end, setEnd] = useState(formatDateInput(nextMonth));
  return <Modal title="Новый проект" onClose={onClose}>
    <label>Название<input autoFocus value={title} onChange={e => setTitle(e.target.value)} /></label>
    <label>Описание<textarea value={description} onChange={e => setDescription(e.target.value)} /></label>
    <div className="two"><label>Дата начала<input type="date" value={start} onChange={e => setStart(e.target.value)} /></label><label>Дата окончания<input type="date" value={end} onChange={e => setEnd(e.target.value)} /></label></div>
    <ModalActions onClose={onClose} onSave={() => title && onSave({ title, description, start, end })} />
  </Modal>;
}
