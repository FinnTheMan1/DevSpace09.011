export default function Stat({ icon, label, value }) {
  return <div className="stat-card"><div className="stat-icon">{icon}</div><div><div className="stat-value">{value}</div><div className="muted">{label}</div></div></div>;
}
