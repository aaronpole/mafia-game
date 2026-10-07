import { useEffect, useState } from 'react'
import { socket } from '../socket'

export default function NightScreen({ myRole, night }) {
  const [timeLeft, setTimeLeft] = useState(30)
  const [selectedId, setSelectedId] = useState(null)
  const [submitted, setSubmitted] = useState(() => Boolean(night?.alreadyActed))
  const [actions, setActions] = useState(0)
  const isMafia = myRole?.role === 'mafia'
  const mafiaTeam = myRole?.mafiaTeam || []
  const targets = (night?.alivePlayers || []).filter(player =>
    player.alive && player.name !== myRole?.name && !mafiaTeam.includes(player.name)
  )

  useEffect(() => {
    if (!night) return
    const updateTime = () => {
      setTimeLeft(Math.ceil(Math.max(0, night.duration - (Date.now() - night.startTime)) / 1000))
    }
    updateTime()
    const timer = setInterval(updateTime, 250)
    return () => clearInterval(timer)
  }, [night])

  useEffect(() => {
    function updateActions({ actionCount }) {
      setActions(actionCount)
    }
    socket.on('night_update', updateActions)
    return () => socket.off('night_update', updateActions)
  }, [])

  function submitAction() {
    if (submitted || selectedId === null) return
    setSubmitted(true)
    socket.emit('cast_night_action', {
      code: sessionStorage.getItem('roomCode'),
      targetId: selectedId
    })
  }

  return (
    <main style={{
      minHeight: '100vh', background: '#08090b', color: '#e9edf0',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', padding: '2rem 1.25rem', fontFamily: 'monospace'
    }}>
      <div style={{ width: '100%', maxWidth: 440 }}>
        <p style={{ color: '#dc6d62', letterSpacing: '0.28em', fontSize: 12 }}>NIGHT {night?.round || ''}</p>
        <h1 style={{ fontSize: 34, margin: '0.4rem 0 0.75rem' }}>The town is asleep</h1>
        <p style={{ color: '#a5adb4', marginBottom: '2rem' }}>
          {isMafia ? 'Choose one living civilian.' : 'Wait for morning.'}
        </p>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: '1.5rem' }}>
          <strong style={{ fontSize: 42, color: timeLeft <= 5 ? '#e27b6e' : '#c8d2d9' }}>{timeLeft}</strong>
          <span style={{ color: '#8d969e', fontSize: 12, letterSpacing: '0.18em' }}>SECONDS REMAINING</span>
        </div>

        {isMafia && !submitted && timeLeft > 0 && (
          <div style={{ display: 'grid', gap: 8 }}>
            {targets.map(player => (
              <button
                key={player.id}
                onClick={() => setSelectedId(player.id)}
                aria-pressed={selectedId === player.id}
                style={{
                  display: 'flex', justifyContent: 'space-between', padding: '14px 16px',
                  color: '#e9edf0', textAlign: 'left', font: 'inherit', cursor: 'pointer',
                  border: `1px solid ${selectedId === player.id ? '#d66a5f' : '#333a40'}`,
                  background: selectedId === player.id ? '#241816' : '#111417', borderRadius: 4
                }}
              >
                <span>{player.name}</span>
                <span style={{ color: '#8d969e' }}>SELECT</span>
              </button>
            ))}
            <button
              onClick={submitAction}
              disabled={selectedId === null}
              style={{
                marginTop: 8, padding: '14px 16px', border: 0, borderRadius: 4,
                color: '#111417', background: selectedId === null ? '#60666b' : '#d66a5f',
                font: 'inherit', fontWeight: 700, cursor: selectedId === null ? 'default' : 'pointer'
              }}
            >CONFIRM TARGET</button>
          </div>
        )}

        {isMafia && submitted && (
          <p style={{ color: '#d9a29b' }}>Action submitted. Waiting for the other Mafia players.</p>
        )}
        {!isMafia && <p style={{ color: '#8d969e' }}>Your role remains private while the Mafia chooses.</p>}
        {isMafia && <p style={{ color: '#8d969e', fontSize: 12 }}>ACTIONS SUBMITTED: {actions}/{night?.mafiaCount || 0}</p>}
      </div>
    </main>
  )
}