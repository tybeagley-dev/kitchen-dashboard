export default function BuckBadge({ amount, size = 'md' }) {
  return (
    <span className={`buck-badge buck-badge-${size}`}>
      {amount}
    </span>
  )
}
