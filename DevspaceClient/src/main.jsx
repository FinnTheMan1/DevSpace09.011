import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";
import { api } from "./services/api";
import Sidebar from "./components/Sidebar";
import Profile from "./pages/Profile";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import ProjectPage from "./pages/ProjectPage";
import UsersPage from "./pages/UsersPage";
import Login from "./components/Login";

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [page, setPage] = useState("dashboard");
  const [selectedProject, setSelectedProject] = useState(null);
  const [toast, setToast] = useState("");
  const [loading, setLoading] = useState(true);

  const notify = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2400);
  };

  async function refreshData(user = currentUser) {
    if (!user) return;
    const p = await api("/api/projects");
    setProjects(p);
    if (user.role === "Администратор") setUsers(await api("/api/users"));
  }

  useEffect(() => {
    const token = localStorage.getItem("ds_token");
    if (!token) {
      setLoading(false);
      return;
    }
    api("/api/me")
      .then(async (u) => {
        setCurrentUser(u);
        await refreshData(u);
      })
      .catch(() => localStorage.removeItem("ds_token"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="login-page"><div className="login-brand"><div className="logo-mark">D</div><span>DevSpace</span></div><div className="login-card"><h2>Загрузка рабочего пространства…</h2></div></div>;
  if (!currentUser) return <Login onLogin={async (u, token) => { localStorage.setItem("ds_token", token); setCurrentUser(u); await refreshData(u); }} />;

  const visibleProjects = projects;
  const totalTasks = visibleProjects.reduce((n, p) => n + (p.tasks?.length || 0), 0);
  const doneTasks = visibleProjects.reduce((n, p) => n + (p.tasks || []).filter(t => t.status === "Завершена").length, 0);
  const openProject = (id) => { setSelectedProject(id); setPage("project"); };

  async function createProject(data) {
    try { const p = await api("/api/projects", { method: "POST", body: JSON.stringify(data) }); setProjects(x => [ ...x, p ]); notify("Проект создан"); }
    catch (e) { notify(e.message); }
  }
  async function createTask(projectId, data) {
    try { const t = await api(`/api/projects/${projectId}/tasks`, { method: "POST", body: JSON.stringify(data) }); setProjects(ps => ps.map(p => p.id === projectId ? { ...p, tasks: [...p.tasks, t] } : p)); notify("Задача создана"); }
    catch (e) { notify(e.message); }
  }
  async function updateTask(projectId, taskId, patch) {
    try { const t = await api(`/api/tasks/${taskId}`, { method: "PATCH", body: JSON.stringify(patch) }); setProjects(ps => ps.map(p => p.id === projectId ? { ...p, tasks: p.tasks.map(x => x.id === taskId ? { ...x, ...t } : x) } : p)); }
    catch (e) { notify(e.message); }
  }
  async function addMessage(projectId, text) {
    try { const m = await api(`/api/projects/${projectId}/messages`, { method: "POST", body: JSON.stringify({ text }) }); setProjects(ps => ps.map(p => p.id === projectId ? { ...p, messages: [...p.messages, m] } : p)); }
    catch (e) { notify(e.message); }
  }
  async function updateMessage(projectId, messageId, text) {
    try {
      const updated = await api(`/api/messages/${messageId}`, { method: "PATCH", body: JSON.stringify({ text }) });
      setProjects(ps => ps.map(p => p.id === projectId ? { ...p, messages: p.messages.map(m => m.id === messageId ? updated : m) } : p));
      notify("Сообщение изменено");
    } catch (e) { notify(e.message); }
  }
  async function deleteMessage(projectId, messageId) {
    try {
      await api(`/api/messages/${messageId}`, { method: "DELETE" });
      setProjects(ps => ps.map(p => p.id === projectId ? { ...p, messages: p.messages.filter(m => m.id !== messageId) } : p));
      notify("Сообщение удалено");
    } catch (e) { notify(e.message); }
  }
  async function saveProfile(u) {
    try { const updated = await api("/api/profile", { method: "PATCH", body: JSON.stringify({ name: u.name, contact: u.contact }) }); setCurrentUser(updated); notify("Профиль обновлён"); }
    catch (e) { notify(e.message); }
  }
  async function createUser(u) {
    try { const created = await api("/api/users", { method: "POST", body: JSON.stringify(u) }); setUsers(x => [...x, created]); notify("Пользователь создан"); }
    catch (e) { notify(e.message); }
  }
  async function addMember(projectId, userId) {
    try { await api(`/api/projects/${projectId}/members`, { method: "POST", body: JSON.stringify({ userId }) }); await refreshData(); notify("Участник добавлен"); }
    catch (e) { notify(e.message); }
  }
  async function deleteUser(id) {
    try { await api(`/api/users/${id}`, { method: "DELETE" }); setUsers(x => x.filter(u => u.id !== id)); notify("Пользователь удалён"); }
    catch (e) { notify(e.message); }
  }
  function logout() { localStorage.removeItem("ds_token"); setCurrentUser(null); setProjects([]); setUsers([]); setPage("dashboard"); }

  return <div className="app">
    <Sidebar page={page} setPage={setPage} user={currentUser} logout={logout} />
    <main className="main">
      {toast && <div className="toast">{toast}</div>}
      {page === "dashboard" && <Dashboard user={currentUser} projects={visibleProjects} totalTasks={totalTasks} doneTasks={doneTasks} openProject={openProject} />}
      {page === "projects" && <Projects projects={visibleProjects} user={currentUser} openProject={openProject} onCreate={createProject} />}
      {page === "project" && <ProjectPage project={projects.find(p => p.id === selectedProject)} users={users} user={currentUser} onBack={() => setPage("projects")} onCreateTask={createTask} onUpdateTask={updateTask} onMessage={addMessage} onAddMember={addMember} onUpdateMessage={updateMessage} onDeleteMessage={deleteMessage} />}
      {page === "users" && <UsersPage users={users} onCreate={createUser} onDelete={deleteUser} />}
      {page === "profile" && <Profile user={currentUser} onSave={saveProfile} />}
    </main>
  </div>;
}

createRoot(document.getElementById("root")).render(<App />);
