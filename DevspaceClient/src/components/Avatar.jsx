export default function Avatar({ name = "", large = false }) {
  const initials = name.split(" ").slice(0, 2).map((x) => x[0]).join("").toUpperCase();
  return <div className={large ? "avatar large" : "avatar"}>{initials || "?"}</div>;
}
