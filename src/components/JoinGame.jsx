import { useState, useEffect } from 'react'
import { socket } from '../socket'
import LetterGlitch from './ui/LetterGlitch'

export default function JoinGame({ onJoined, prefillCode }) {
  const [step, setStep] = useState('enter') // enter | waiting
  const [playerName, setPlayerName] = useState('')
  const [roomCode, setRoomCode] = useState(prefillCode || '')
  const [players, setPlayers] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    socket.connect()

    socket.on('room_joined', ({ code, players }) => {
      setPlayers(players)
      sessionStorage.setItem('playerName', playerName)
      setStep('waiting')
    })

    socket.on('lobby_update', (updatedPlayers) => {
      setPlayers(updatedPlayers)
    })

    socket.on('game_started', ({ assignedPlayers }) => {
      onJoined(assignedPlayers)
    })

    socket.on('error', (msg) => setError(msg))

    return () => {
      socket.off('room_joined')
      socket.off('lobby_update')
      socket.off('game_started')
      socket.off('error')
    }
  }, [])

  function joinRoom() {
    if (!playerName.trim()) { setError('ENTER YOUR NAME'); return }
    if (!roomCode.trim() || roomCode.trim().length < 5) { setError('ENTER VALID ROOM CODE'); return }
    setError('')
    socket.emit('join_room', {
      code: roomCode.trim().toUpperCase(),
      playerName: playerName.trim()
    })
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#050f0a',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      position: 'relative', overflow: 'visible', padding: '1.5rem'
    }}>

      {/* Background */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0 }}>
        <LetterGlitch glitchSpeed={50} centerVignette smooth speed={10}
          colors={["#2b4539", "#61dca3", "#61b3dc"]} />
      </div>
      <div style={{
        position: 'fixed', inset: 0, zIndex: 1, pointerEvents: 'none',
        background: 'radial-gradient(ellipse at center, rgba(5,15,10,0.85) 0%, rgba(5,15,10,0.3) 100%)'
      }} />

      {/* Back button */}
      <button onClick={() => window.location.reload()} className="mono" style={{
        position: 'fixed', top: '1rem', left: '1rem', zIndex: 10,
        background: 'none', border: 'none', color: '#4ade80',
        fontSize: '0.75rem', letterSpacing: '0.2em', cursor: 'pointer'
      }}>← BACK</button>

      <div style={{
        position: 'relative', zIndex: 10, width: '100%', maxWidth: '420px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem'
      }}>

        {/* Header */}
        <div style={{ textAlign: 'center' }}>
          <div className="mono" style={{
            color: '#4ade80', fontSize: '0.7rem',
            letterSpacing: '0.4em', marginBottom: '0.5rem'
          }}>
            [ JOIN GAME ]
          </div>
          <h1 className="mono" style={{
            fontSize: '2rem', fontWeight: '800', color: '#dcfce7',
            letterSpacing: '0.15em', textShadow: '0 0 30px rgba(74,222,128,0.5)'
          }}>
            {step === 'enter' ? 'ENTER ROOM' : 'WAITING...'}
          </h1>
        </div>

        {step === 'enter' && (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{
              background: '#0a1a10', border: '1px solid #1a3a22',
              borderRadius: '1rem', padding: '1.5rem',
              display: 'flex', flexDirection: 'column', gap: '1.25rem'
            }}>
              {/* Name input */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label className="mono" style={{
                  color: '#4ade80', fontSize: '0.7rem', letterSpacing: '0.3em'
                }}>YOUR NAME</label>
                <input
                  value={playerName}
                  onChange={e => { setPlayerName(e.target.value); setError('') }}
                  onKeyDown={e => e.key === 'Enter' && joinRoom()}
                  placeholder="ENTER NAME..."
                  maxLength={16}
                  className="mono"
                  style={{
                    background: '#050f0a', border: '1px solid #1a3a22',
                    borderRadius: '0.5rem', padding: '0.75rem 1rem',
                    color: '#86efac', fontSize: '1rem', outline: 'none', width: '100%'
                  }}
                  onFocus={e => e.target.style.borderColor = '#22c55e'}
                  onBlur={e => e.target.style.borderColor = '#1a3a22'}
                  autoFocus
                />
              </div>

              {/* Room code input */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label className="mono" style={{
                  color: '#4ade80', fontSize: '0.7rem', letterSpacing: '0.3em'
                }}>ROOM CODE</label>
                <input
                  value={roomCode}
                  onChange={e => { setRoomCode(e.target.value.toUpperCase()); setError('') }}
                  onKeyDown={e => e.key === 'Enter' && joinRoom()}
                  placeholder="XXXXX"
                  maxLength={5}
                  className="mono"
                  style={{
                    background: '#050f0a', border: '1px solid #1a3a22',
                    borderRadius: '0.5rem', padding: '0.75rem 1rem',
                    color: '#4ade80', fontSize: '1.5rem', outline: 'none',
                    width: '100%', letterSpacing: '0.5em', textAlign: 'center'
                  }}
                  onFocus={e => e.target.style.borderColor = '#22c55e'}
                  onBlur={e => e.target.style.borderColor = '#1a3a22'}
                />
              </div>
            </div>

            {error && (
              <p className="mono" style={{
                color: '#dc2626', fontSize: '0.75rem',
                letterSpacing: '0.2em', textAlign: 'center'
              }}>⚠ {error}</p>
            )}

            <button onClick={joinRoom} className="mono" style={{
              width: '100%', padding: '1.1rem',
              fontWeight: '700', fontSize: '0.85rem',
              letterSpacing: '0.3em', borderRadius: '9999px',
              background: 'linear-gradient(135deg, #bbf7d0 0%, #22c55e 40%, #15803d 100%)',
              border: 'none', color: '#052e16', cursor: 'pointer',
              boxShadow: '0 0 30px rgba(34,197,94,0.4), inset 0 1px 0 rgba(255,255,255,0.25)',
              transition: 'all 0.3s'
            }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = '0 0 60px rgba(34,197,94,0.6)'}
              onMouseLeave={e => e.currentTarget.style.boxShadow = '0 0 30px rgba(34,197,94,0.4)'}
            >
              JOIN ROOM →
            </button>
          </div>
        )}

        {step === 'waiting' && (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1.25rem', alignItems: 'center' }}>

            {/* Waiting animation */}
            <div style={{
              width: '80px', height: '80px', borderRadius: '50%',
              border: '2px solid #1a3a22',
              borderTop: '2px solid #22c55e',
              animation: 'spin 1s linear infinite'
            }} />

            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>

            <p className="mono" style={{
              color: '#4ade80', fontSize: '0.8rem',
              letterSpacing: '0.3em', textAlign: 'center'
            }}>
              WAITING FOR HOST<br />TO START THE GAME
            </p>

            {/* Player list */}
            <div style={{
              width: '100%', background: '#0a1a10',
              border: '1px solid #1a3a22', borderRadius: '1rem', padding: '1.25rem'
            }}>
              <div className="mono" style={{
                color: '#4ade80', fontSize: '0.7rem',
                letterSpacing: '0.3em', marginBottom: '0.75rem'
              }}>
                IN ROOM [{players.length}]
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {players.map((p, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                    padding: '0.5rem 0.75rem', borderRadius: '0.5rem',
                    background: '#050f0a', border: '1px solid #1a3a22'
                  }}>
                    <span className="mono" style={{ color: '#15803d', fontSize: '0.75rem' }}>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="mono" style={{ color: '#86efac', fontSize: '0.9rem' }}>
                      {p.name}
                    </span>
                    {p.isHost && (
                      <span className="mono" style={{
                        color: '#4ade80', fontSize: '0.6rem',
                        letterSpacing: '0.2em', marginLeft: 'auto'
                      }}>HOST</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}