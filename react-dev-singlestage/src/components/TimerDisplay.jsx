// Formats a number of seconds as MM:SS.
function format(seconds) {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, '0')
  const s = (seconds % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

export default function TimerDisplay({ secondsLeft, total }) {
  // Progress from 0 to 1, used to fill the ring.
  const progress = total === 0 ? 0 : (total - secondsLeft) / total
  const degrees = Math.round(progress * 360)

  return (
    <div
      className="ring"
      style={{
        background: `conic-gradient(#e2523f ${degrees}deg, #2a2a3a ${degrees}deg)`,
      }}
    >
      <div className="ring-inner">
        <span className="time">{format(secondsLeft)}</span>
      </div>
    </div>
  )
}
