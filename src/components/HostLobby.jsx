import { useState, useEffect } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { socket } from '../socket'
import LetterGlitch from './ui/LetterGlitch'

export default function HostLobby({ onGameStart }) {
  const [step, setStep] = useState('enter_name') // enter_name | waiting
  const [hostName, setHostName] = useState('')
  const [roomCode, setRoomCode] = useState('')
  const [players, setPlayers] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
  socket.connect()

  socket.on('room_created', ({ code }) => {
    setRoomCode(code)
    setStep('waiting')
  })

  socket.on('lobby_update', (updatedPlayers) => {
    setPlayers(updatedPlayers)
  })

  socket.on('game_started', ({ assignedPlayers }) => {
    console.log('assignedPlayers received:', assignedPlayers)
    onGameStart(assignedPlayers, roomCode)
  })

  socket.on('error', (msg) => setError(msg))

  return () => {
    socket.off('room_created')
    socket.off('lobby_update')
    socket.off('game_started')
    socket.off('error')
  }
}, [])

  function createRoom() {
    if (!hostName.trim()) { setError('ENTER YOUR NAME'); return }
    socket.emit('create_room', { hostName: hostName.trim() })
  }

  function startGame() {
    if (players.length < 4) { setError('NEED AT LEAST 4 PLAYERS'); return }
    socket.emit('start_game', { code: roomCode })
  // don't call onGameStart here — wait for server response
}

  const joinUrl = `${window.location.origin}?join=${roomCode}`

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
          <div className="mono" style={{ color: '#4ade80', fontSize: '0.7rem', letterSpacing: '0.4em', marginBottom: '0.5rem' }}>
            [ HOST GAME ]
          </div>
          <h1 className="mono" style={{
            fontSize: '2rem', fontWeight: '800', color: '#dcfce7',
            letterSpacing: '0.15em', textShadow: '0 0 30px rgba(74,222,128,0.5)'
          }}>
            {step === 'enter_name' ? 'CREATE ROOM' : `ROOM: ${roomCode}`}
          </h1>
        </div>

        {step === 'enter_name' && (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{
              background: '#0a1a10', border: '1px solid #1a3a22',
              borderRadius: '1rem', padding: '1.5rem',
              display: 'flex', flexDirection: 'column', gap: '1rem'
            }}>
              <label className="mono" style={{ color: '#4ade80', fontSize: '0.7rem', letterSpacing: '0.3em' }}>
                YOUR NAME
              </label>
              <input
                value={hostName}
                onChange={e => { setHostName(e.target.value); setError('') }}
                onKeyDown={e => e.key === 'Enter' && createRoom()}
                placeholder="ENTER NAME..."
                maxLength={16}
                className="mono"
                style={{
                  background: '#050f0a', border: '1px solid #1a3a22',
                  borderRadius: '0.5rem', padding: '0.75rem 1rem',
                  color: '#86efac', fontSize: '1rem', outline: 'none',
                  width: '100%'
                }}
                onFocus={e => e.target.style.borderColor = '#22c55e'}
                onBlur={e => e.target.style.borderColor = '#1a3a22'}
                autoFocus
              />
            </div>

            {error && (
              <p className="mono" style={{
                color: '#dc2626', fontSize: '0.75rem',
                letterSpacing: '0.2em', textAlign: 'center'
              }}>⚠ {error}</p>
            )}

            <button onClick={createRoom} className="mono" style={{
              width: '100%', padding: '1.1rem',
              fontWeight: '700', fontSize: '0.85rem',
              letterSpacing: '0.3em', borderRadius: '9999px',
              background: 'linear-gradient(135deg, #bbf7d0 0%, #22c55e 40%, #15803d 100%)',
              border: 'none', color: '#052e16', cursor: 'pointer',
              boxShadow: '0 0 30px rgba(34,197,94,0.4), inset 0 1px 0 rgba(255,255,255,0.25)',
              transition: 'all 0.3s'
            }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = '0 0 60px rgba(34,197,94,0.6), inset 0 1px 0 rgba(255,255,255,0.3)'}
              onMouseLeave={e => e.currentTarget.style.boxShadow = '0 0 30px rgba(34,197,94,0.4), inset 0 1px 0 rgba(255,255,255,0.25)'}
            >
              CREATE ROOM →
            </button>
          </div>
        )}

        {step === 'waiting' && (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1.25rem', alignItems: 'center' }}>

            {/* QR Code */}
            <div style={{
              background: '#ffffff', borderRadius: '1rem',
              padding: '1rem', display: 'inline-block',
              boxShadow: '0 0 40px rgba(34,197,94,0.3)'
            }}>
              <QRCodeSVG value={joinUrl} size={180} />
            </div>

            <div style={{ textAlign: 'center' }}>
              <p className="mono" style={{ color: '#86efac', fontSize: '0.7rem', letterSpacing: '0.3em' }}>
                OR JOIN WITH CODE
              </p>
              <p className="mono" style={{
                color: '#4ade80', fontSize: '2rem', fontWeight: '800',
                letterSpacing: '0.5em', textShadow: '0 0 20px rgba(74,222,128,0.6)',
                marginTop: '0.25rem'
              }}>{roomCode}</p>
            </div>

            {/* Player list */}
            <div style={{
              width: '100%', background: '#0a1a10',
              border: '1px solid #1a3a22', borderRadius: '1rem', padding: '1.25rem'
            }}>
              <div className="mono" style={{
                color: '#4ade80', fontSize: '0.7rem',
                letterSpacing: '0.3em', marginBottom: '0.75rem'
              }}>
                PLAYERS [{players.length}]
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
                {players.length === 0 && (
                  <p className="mono" style={{
                    color: '#1a3a22', fontSize: '0.75rem',
                    letterSpacing: '0.2em', textAlign: 'center', padding: '0.5rem'
                  }}>WAITING FOR PLAYERS...</p>
                )}
              </div>
            </div>

            {error && (
              <p className="mono" style={{ color: '#dc2626', fontSize: '0.75rem', letterSpacing: '0.2em' }}>
                ⚠ {error}
              </p>
            )}

            <button
              onClick={startGame}
              disabled={players.length < 1}
              className="mono"
              style={{
                width: '100%', padding: '1.1rem',
                fontWeight: '700', fontSize: '0.85rem',
                letterSpacing: '0.3em', borderRadius: '9999px',
                background: players.length >= 4
                  ? 'linear-gradient(135deg, #bbf7d0 0%, #22c55e 40%, #15803d 100%)'
                  : '#0a1a10',
                border: players.length >= 4 ? 'none' : '1px solid #1a3a22',
                color: players.length >= 4 ? '#052e16' : '#1a3a22',
                cursor: players.length >= 4 ? 'pointer' : 'not-allowed',
                boxShadow: players.length >= 4 ? '0 0 30px rgba(34,197,94,0.4)' : 'none',
                transition: 'all 0.3s'
              }}
            >
              {players.length >= 4 ? 'START GAME →' : `NEED ${4 - players.length} MORE PLAYER${4 - players.length === 1 ? '' : 'S'}`}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}