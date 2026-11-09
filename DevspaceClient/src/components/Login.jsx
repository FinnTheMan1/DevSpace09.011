import React, { useState } from "react";
import { api } from "../services/api";
export default function Login({ onLogin }) {
  const [login, setLogin] = useState("admin");
  const [password, setPassword] = useState("admin");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async e => {
    e.preventDefault(); setBusy(true); setError("");
    try { const data = await api("/api/auth/login", { method: "POST", body: JSON.stringify({ login, password }) }); await onLogin(data.user, data.token); }
    catch (e) { setError(e.message); }
    finally { setBusy(false); }
  };
  return <div className="login-page">
    <div className="login-brand"><div className="logo-mark">D</div><span>DevSpace</span></div>
    <div className="login-card"><div className="eyebrow">DIGITAL CORE</div><h1>Рабочее пространство<br />команды</h1><p className="muted">Проекты, задачи и коммуникация — в одном месте.</p>
      <form onSubmit={submit}><label>Логин<input value={login} onChange={e => setLogin(e.target.value)} /></label><label>Пароль<input type="password" value={password} onChange={e => setPassword(e.target.value)} /></label>{error && <div className="form-error">{error}</div>}<button className="primary wide" disabled={busy}>{busy ? "Входим…" : "Войти"}</button></form>
      <div className="demo-hint">Демо: <b>admin</b> / <b>admin</b></div>
    </div><div className="login-footer">АИС «DevSpace» · ООО «Digital Core»</div>
  </div>;
}
