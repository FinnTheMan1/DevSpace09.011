import { useState } from "react";
import Avatar from "./Avatar";
export default function Chat({ project, users, user, onMessage, onUpdateMessage, onDeleteMessage }) {
  const [text, setText] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const send = () => { if (text.trim()) { onMessage(project.id, text.trim()); setText(""); } };
  const saveEdit = messageId => { if (!editText.trim()) return; onUpdateMessage(project.id, messageId, editText.trim()); setEditingId(null); setEditText(""); };
  const confirmDelete = () => { if (deleteConfirmId === null) return; onDeleteMessage(project.id, deleteConfirmId); setDeleteConfirmId(null); };
  return <div className="chat">
    <div className="messages">{project.messages.map(m => {
      const messageUser = users.find(x => Number(x.id) === Number(m.user));
      const isMine = Number(m.user) === Number(user.id);
      return <div className="message" key={m.id}><Avatar name={messageUser?.name || "User"} /><div>
        <div className="message-head"><b>{messageUser?.name || "Пользователь"}</b><span>{m.time}</span></div>
        {editingId === m.id ? <div><input value={editText} onChange={e => setEditText(e.target.value)} /><div className="message-edit-actions"><button onClick={() => saveEdit(m.id)}>Сохранить</button><button onClick={() => { setEditingId(null); setEditText(""); }}>Отмена</button></div></div> : <div className="bubble">{m.text}</div>}
        {isMine && editingId !== m.id && <div className="message-actions"><button onClick={() => { setEditingId(m.id); setEditText(m.text); }}>✎ Изменить</button><button onClick={() => setDeleteConfirmId(m.id)}>🗑 Удалить</button></div>}
      </div></div>;
    })}</div>
    <div className="composer"><input value={text} onChange={e => setText(e.target.value)} onKeyDown={e => e.key === "Enter" && send()} placeholder="Написать сообщение..." /><button className="primary" onClick={send}>Отправить</button></div>
    {deleteConfirmId !== null && <div className="overlay"><div className="modal"><div className="modal-head"><h2>Удалить сообщение?</h2></div><p className="muted">Это действие нельзя будет отменить.</p><div className="modal-actions"><button className="secondary" onClick={() => setDeleteConfirmId(null)}>Отмена</button><button className="primary" onClick={confirmDelete}>Удалить</button></div></div></div>}
  </div>;
}
