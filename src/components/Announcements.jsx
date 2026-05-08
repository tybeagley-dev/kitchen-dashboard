import { CONFIG } from '../config/config'

export default function Announcements() {
  if (!CONFIG.announcements?.length) return null

  return (
    <section className="card announcements-card">
      <h2 className="section-label">Family Notes</h2>
      <ul className="announcement-list">
        {CONFIG.announcements.map((note, i) => (
          <li key={i} className="announcement-item">
            <span className="announcement-dot">›</span>
            {note}
          </li>
        ))}
      </ul>
    </section>
  )
}
