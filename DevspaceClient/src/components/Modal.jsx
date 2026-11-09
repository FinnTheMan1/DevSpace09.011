import React from "react";
export function Modal({ title, onClose, children }) {
  return <div className="overlay"><div className="modal"><div className="modal-head"><h2>{title}</h2><button className="icon-btn" onClick={onClose}>×</button></div>{children}</div></div>;
}
export function ModalActions({ onClose, onSave }) {
  return <div className="modal-actions"><button className="secondary" onClick={onClose}>Отмена</button><button className="primary" onClick={onSave}>Сохранить</button></div>;
}
