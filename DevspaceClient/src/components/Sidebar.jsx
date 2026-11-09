import Avatar from "./Avatar";
export default function Sidebar({ page, setPage, user, logout }) {
  const items = [
    ["dashboard", "⌂", "Обзор"],
    ["projects", "▦", "Проекты"],
    ...(user.role === "Администратор" ? [["users", "♙", "Пользователи"]] : []),
    ["profile", "○", "Профиль"],
  ];
  return <aside className="sidebar">
    <div className="brand"><div className="logo-mark small">D</div><span>DevSpace</span></div>
    <div className="workspace">Digital Core <span>⌄</span></div>
    <nav>{items.map(([id, icon, label]) => <button key={id} className={page === id ? "nav active" : "nav"} onClick={() => setPage(id)}><span>{icon}</span>{label}</button>)}</nav>
    <div className="sidebar-bottom">
      <div className="mini-user"><Avatar name={user.name} /><div><b>{user.name}</b><small>{user.role}</small></div></div>
      <button className="logout" onClick={logout}>Выйти</button>
    </div>
  </aside>;
}
