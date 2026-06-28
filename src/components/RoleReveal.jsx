import { useState, useEffect } from 'react'
import BorderGlow from './ui/BorderGlow'
import LetterGlitch from './ui/LetterGlitch'

export default function RoleReveal({ myRole, mafiaTeam, onDone }) {
  const [timeLeft, setTimeLeft] = useState(5)
  const [flipped, setFlipped] = useState(false)

  const isMafia = myRole?.role === 'mafia'
  const circumference = 2 * Math.PI * 28
  const strokeDash = (timeLeft / 5) * circumference

  useEffect(() => {
    const flipTimer = setTimeout(() => setFlipped(true), 500)
    return () => clearTimeout(flipTimer)
  }, [])

  useEffect(() => {
    if (!flipped) return
    const interval = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(interval)
          setTimeout(() => onDone(), 0)
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [flipped])

  if (!myRole) return (
    <div style={{
      minHeight: '100vh', background: '#050f0a',
      display: 'flex', alignItems: 'center',
      justifyContent: 'center', flexDirection: 'column', gap: '1rem'
    }}>
      <div style={{ position: 'fixed', inset: 0, zIndex: 0 }}>
        <LetterGlitch glitchSpeed={50} centerVignette smooth speed={10}
          colors={["#2b4539", "#61dca3", "#61b3dc"]} />
      </div>
      <div style={{
        position: 'fixed', inset: 0, zIndex: 1, pointerEvents: 'none',
        background: 'radial-gradient(ellipse at center, rgba(5,15,10,0.9) 0%, rgba(5,15,10,0.4) 100%)'
      }} />
      <p className="mono" style={{
        color: '#4ade80', fontSize: '0.75rem',
        letterSpacing: '0.3em', position: 'relative', zIndex: 10
      }}>LOADING...</p>
    </div>
  )

  return (
    <div style={{
      minHeight: '100vh', background: '#050f0a',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      position: 'relative', overflow: 'hidden', padding: '1.5rem'
    }}>
      <div style={{ position: 'fixed', inset: 0, zIndex: 0 }}>
        <LetterGlitch glitchSpeed={50} centerVignette smooth speed={10}
          colors={isMafia
            ? ["#3a0a0a", "#dc2626", "#7f1d1d"]
            : ["#2b4539", "#61dca3", "#61b3dc"]} />
      </div>
      <div style={{
        position: 'fixed', inset: 0, zIndex: 1, pointerEvents: 'none',
        background: 'radial-gradient(ellipse at center, rgba(5,15,10,0.9) 0%, rgba(5,15,10,0.4) 100%)'
      }} />

      <div style={{
        position: 'relative', zIndex: 10,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', gap: '2rem', width: '100%', maxWidth: '380px'
      }}>

        {/* Player name */}
        <div style={{ textAlign: 'center' }}>
          <div className="mono" style={{
            color: '#4ade80', fontSize: '0.7rem',
            letterSpacing: '0.4em', marginBottom: '0.4rem'
          }}>YOUR ROLE</div>
          <h2 className="mono" style={{
            fontSize: '1.4rem', fontWeight: '700',
            color: '#dcfce7', letterSpacing: '0.2em'
          }}>{myRole.name}</h2>
        </div>

        {/* Flip card */}
        <div style={{ perspective: '1000px', width: '100%', height: '280px' }}>
          <div style={{
            width: '100%', height: '100%', position: 'relative',
            transformStyle: 'preserve-3d',
            transition: 'transform 0.7s cubic-bezier(0.4, 0, 0.2, 1)',
            transform: flipped ? 'rotateY(0deg)' : 'rotateY(180deg)'
          }}>

            {/* Front */}
            <div style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden' }}>
              <BorderGlow
                edgeSensitivity={30}
                glowColor={isMafia ? "0 80 50" : "140 80 60"}
                backgroundColor={isMafia ? "#1a0505" : "#050f0a"}
                borderRadius={20}
                glowRadius={50}
                glowIntensity={1.2}
                coneSpread={25}
                animated={true}
                colors={isMafia
                  ? ['#dc2626', '#ef4444', '#7f1d1d']
                  : ['#22c55e', '#4ade80', '#86efac']}
                className="w-full h-full"
              >
                <div style={{
                  padding: '2rem', display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                  height: '100%', gap: '1rem', textAlign: 'center'
                }}>
                  <div style={{ fontSize: '3.5rem', lineHeight: 1 }}>
                    {isMafia ? '🔪' : '👤'}
                  </div>
                  <div>
                    <div className="mono" style={{
                      fontSize: '2rem', fontWeight: '900', letterSpacing: '0.2em',
                      color: isMafia ? '#ef4444' : '#4ade80',
                      textShadow: isMafia
                        ? '0 0 30px rgba(239,68,68,0.8)'
                        : '0 0 30px rgba(74,222,128,0.8)'
                    }}>
                      {isMafia ? 'MAFIA' : 'CIVILIAN'}
                    </div>
                    <div className="mono" style={{
                      fontSize: '0.65rem', letterSpacing: '0.3em',
                      color: isMafia ? '#7f1d1d' : '#15803d', marginTop: '0.3rem'
                    }}>
                      {isMafia ? 'ELIMINATE THE CIVILIANS' : 'FIND THE MAFIA'}
                    </div>
                  </div>

                  {isMafia && mafiaTeam.length > 1 && (
                    <div style={{
                      background: 'rgba(220,38,38,0.1)',
                      border: '1px solid rgba(220,38,38,0.3)',
                      borderRadius: '0.75rem', padding: '0.75rem 1rem', width: '100%'
                    }}>
                      <div className="mono" style={{
                        fontSize: '0.6rem', letterSpacing: '0.3em',
                        color: '#ef4444', marginBottom: '0.4rem'
                      }}>YOUR TEAM</div>
                      {mafiaTeam.map((name, i) => (
                        <div key={i} className="mono" style={{
                          fontSize: '0.85rem', color: '#fca5a5', letterSpacing: '0.1em'
                        }}>
                          {name} {name === myRole.name ? '(YOU)' : ''}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </BorderGlow>
            </div>

            {/* Back */}
            <div style={{
              position: 'absolute', inset: 0,
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)'
            }}>
              <BorderGlow
                backgroundColor="#0a1a10" borderRadius={20} glowRadius={40}
                colors={['#22c55e', '#4ade80', '#166534']}
                className="w-full h-full"
              >
                <div style={{
                  height: '100%', display: 'flex',
                  alignItems: 'center', justifyContent: 'center'
                }}>
                  <div className="mono" style={{
                    fontSize: '4rem', color: '#1a3a22'
                  }}>?</div>
                </div>
              </BorderGlow>
            </div>
          </div>
        </div>

        {/* Countdown */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ position: 'relative', width: '72px', height: '72px' }}>
            <svg width="72" height="72" style={{ transform: 'rotate(-90deg)', position: 'absolute' }}>
              <circle cx="36" cy="36" r="28" fill="none" stroke="#1a3a22" strokeWidth="3" />
              <circle cx="36" cy="36" r="28" fill="none"
                stroke={timeLeft <= 3 ? '#dc2626' : '#22c55e'}
                strokeWidth="3"
                strokeDasharray={`${circumference}`}
                strokeDashoffset={circumference - strokeDash}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.3s' }}
              />
            </svg>
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <span className="mono" style={{
                fontSize: '1.3rem', fontWeight: '700',
                color: timeLeft <= 3 ? '#dc2626' : '#4ade80',
              }}>{timeLeft}</span>
            </div>
          </div>
          <p className="mono" style={{
            fontSize: '0.65rem', letterSpacing: '0.3em',
            color: '#1a3a22', textAlign: 'center'
          }}>MEMORIZE YOUR ROLE</p>
        </div>
      </div>
    </div>
  )
}