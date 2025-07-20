export default function ProgressBar({ value, max }) {
  const percent = Math.min(100, Math.round((value / max) * 100))
  return (
    <div style={{ background: '#eee', borderRadius: 8, height: 16, width: 200, margin: '0 auto' }}>
      <div style={{
        width: `${percent}%`,
        background: percent === 100 ? 'limegreen' : '#646cff',
        height: '100%',
        borderRadius: 8,
        transition: 'width 0.3s'
      }} />
    </div>
  )
}