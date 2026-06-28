import { useState, useEffect } from 'react'
import { socket } from '../socket'
import LetterGlitch from './ui/LetterGlitch'

const ROUND_DURATION = 5 * 60 // 5 minutes in seconds

export default function RoundScreen({ players, round, onTimeUp }) {
  const [timeLeft, setTimeLeft] = useState(ROUND_DURATION)
  const [voting, setVoting] = useState(false)

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60
  const progress = timeLeft / ROUND_DURATION

  const [alivePlayers, setAlivePlayers] = useState(
    players.filter(p => p.alive)
  )

  useEffect(() => {
    socket.on('round_started', ({ round, alivePlayers }) => {
      if (alivePlayers) setAlivePlayers(alivePlayers)
    })
    return () => socket.off('round_started')
  }, [])
  useEffect(() => {
    if (voting) return
    const interval = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(interval)
          setVoting(true)
          setTimeout(() => onTimeUp(), 3000)
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [voting])

  const circumference = 2 * Math.PI * 120
  const strokeDash = progress * circumference
  const isLow = timeLeft <= 60

  return (
    <div style={{
      minHeight: '100vh', background: '#050f0a',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      position: 'relative', padding: '1.5rem', overflow: 'visible'
    }}>

      {/* Background */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0 }}>
        <LetterGlitch glitchSpeed={50} centerVignette smooth speed={10}
          colors={isLow
            ? ["#3a0a0a", "#dc2626", "#7f1d1d"]
            : ["#2b4539", "#61dca3", "#61b3dc"]}
        />
      </div>
      <div style={{
        position: 'fixed', inset: 0, zIndex: 1, pointerEvents: 'none',
        background: 'radial-gradient(ellipse at center, rgba(5,15,10,0.9) 0%, rgba(5,15,10,0.4) 100%)'
      }} />

      {/* Vote time animation overlay */}
      {voting && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 100,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(5,10,5,0.92)',
          animation: 'fadeIn 0.5s ease'
        }}>
          <style>{`
            @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
            @keyframes pulse { 0%,100% { transform: scale(1); opacity:1 } 50% { transform: scale(1.05); opacity:0.8 } }
          `}</style>
          <div style={{ textAlign: 'center' }}>
            <div className="mono" style={{
              fontSize: 'clamp(2rem, 8vw, 4rem)', fontWeight: '900',
              color: '#ef4444', letterSpacing: '0.2em',
              textShadow: '0 0 40px rgba(239,68,68,0.9), 0 0 80px rgba(239,68,68,0.5)',
              animation: 'pulse 0.8s ease infinite'
            }}>
              TIME TO VOTE
            </div>
            <div className="mono" style={{
              fontSize: '0.8rem', color: '#dc2626',
              letterSpacing: '0.4em', marginTop: '1rem', opacity: 0.7
            }}>
              WHO IS THE MAFIA?
            </div>
          </div>
        </div>
      )}

      <div style={{
        position: 'relative', zIndex: 10,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', width: '100%', maxWidth: '420px', gap: '2rem'
      }}>

        {/* Round header */}
        <div style={{ textAlign: 'center' }}>
          <div className="mono" style={{
            color: '#4ade80', fontSize: '0.7rem',
            letterSpacing: '0.4em', marginBottom: '0.4rem'
          }}>
            [ DISCUSSION PHASE ]
          </div>
          <h1 className="mono" style={{
            fontSize: '2rem', fontWeight: '800',
            color: '#dcfce7', letterSpacing: '0.2em',
            textShadow: '0 0 20px rgba(74,222,128,0.3)'
          }}>
            ROUND {round}
          </h1>
        </div>

        {/* Big circular timer */}
        <div style={{ position: 'relative', width: '280px', height: '280px' }}>
          <svg width="280" height="280" style={{
            transform: 'rotate(-90deg)', position: 'absolute'
          }}>
            {/* Track */}
            <circle cx="140" cy="140" r="120"
              fill="none" stroke="#0a1a10" strokeWidth="8" />
            {/* Progress */}
            <circle cx="140" cy="140" r="120"
              fill="none"
              stroke={isLow ? '#dc2626' : '#22c55e'}
              strokeWidth="8"
              strokeDasharray={`${circumference}`}
              strokeDashoffset={circumference - strokeDash}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.5s ease' }}
            />
          </svg>

          {/* Timer text in center */}
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: '0.25rem'
          }}>
            <span className="mono" style={{
              fontSize: 'clamp(2.5rem, 10vw, 3.5rem)',
              fontWeight: '900', letterSpacing: '0.05em',
              color: isLow ? '#ef4444' : '#4ade80',
              textShadow: isLow
                ? '0 0 30px rgba(239,68,68,0.9)'
                : '0 0 30px rgba(74,222,128,0.8)',
              transition: 'color 0.5s, text-shadow 0.5s'
            }}>
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </span>
            <span className="mono" style={{
              fontSize: '0.65rem', letterSpacing: '0.3em',
              color: isLow ? '#dc2626' : '#15803d'
            }}>
              {isLow ? 'VOTE SOON' : 'DISCUSS'}
            </span>
          </div>
        </div>

        {/* Alive players */}
        <div style={{
          width: '100%', background: '#0a1a10',
          border: '1px solid #1a3a22', borderRadius: '1rem', padding: '1.25rem'
        }}>
          <div className="mono" style={{
            color: '#4ade80', fontSize: '0.7rem',
            letterSpacing: '0.3em', marginBottom: '0.75rem'
          }}>
            ALIVE [{alivePlayers.length}]
          </div>
          <div style={{
            display: 'flex', flexWrap: 'wrap', gap: '0.5rem'
          }}>
            {alivePlayers.map((p, i) => (
              <div key={i} style={{
                padding: '0.4rem 0.9rem',
                borderRadius: '9999px',
                background: '#050f0a',
                border: '1px solid #1a3a22',
              }}>
                <span className="mono" style={{
                  color: '#86efac', fontSize: '0.8rem'
                }}>{p.name}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}