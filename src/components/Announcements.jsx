import { useAnnouncements } from '../hooks/useAnnouncements'

export default function Announcements() {
  const { announcements } = useAnnouncements()

  if (!announcements.length) return null

  return (
    <section className="card announcements-card">
      <h2 className="section-label">Family Notes</h2>
      <ul className="announcement-list">
        {announcements.map(a => (
          <li key={a.id} className="announcement-item">
            <span className="announcement-dot">›</span>
            <span className="announcement-text">{a.text}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}
