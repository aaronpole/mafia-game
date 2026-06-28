import { useState, useEffect } from 'react'
import { socket } from '../socket'
import LetterGlitch from './ui/LetterGlitch'

export default function VoteScreen({ players, onEliminate }) {
  const [voted, setVoted] = useState(false)
  const [selectedId, setSelectedId] = useState(null)
  const [voteCount, setVoteCount] = useState(0)
  const [totalNeeded, setTotalNeeded] = useState(0)
  const [eliminated, setEliminated] = useState(null)
  const [phase, setPhase] = useState('voting') // voting | revealing | done

  const alivePlayers = players.filter(p => p.alive)

  useEffect(() => {
    socket.on('vote_update', ({ totalVotes, needed }) => {
      setVoteCount(totalVotes)
      setTotalNeeded(needed)
    })

    socket.on('player_eliminated', ({ eliminated, round }) => {
      setEliminated(eliminated)
      setPhase('revealing')
    })

    socket.on('game_over', ({ winner, eliminated }) => {
      setEliminated(eliminated)
      setPhase('done')
      setTimeout(() => onEliminate(eliminated?.id, winner), 4000)
    })

    return () => {
      socket.off('vote_update')
      socket.off('player_eliminated')
      socket.off('game_over')
    }
  }, [])

  // For testing with fake players — auto resolve after all votes
  useEffect(() => {
    if (!voted) return
    const timeout = setTimeout(() => {
      const alivePlayers = players.filter(p => p.alive)
      console.log('players in vote screen:', players, 'alive:', alivePlayers)
      const randomEliminated = alive[Math.floor(Math.random() * alive.length)]
      setEliminated(randomEliminated)
      setPhase('revealing')
      setTimeout(() => onEliminate(randomEliminated.id), 3000)
    }, 1500)
    return () => clearTimeout(timeout)
  }, [voted])

  function castVote(player) {
    if (voted) return
    setSelectedId(player.id)
    setVoted(true)
    socket.emit('cast_vote', {
      code: sessionStorage.getItem('roomCode'),
      votedId: player.id
    })
  }

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
          colors={["#3a0a0a", "#dc2626", "#7f1d1d"]} />
      </div>
      <div style={{
        position: 'fixed', inset: 0, zIndex: 1, pointerEvents: 'none',
        background: 'radial-gradient(ellipse at center, rgba(5,10,5,0.92) 0%, rgba(5,10,5,0.5) 100%)'
      }} />

      {/* Elimination reveal overlay */}
      {(phase === 'revealing' || phase === 'done') && eliminated && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 100,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          background: 'rgba(5,5,5,0.95)',
          animation: 'fadeIn 0.6s ease'
        }}>
          <style>{`
            @keyframes fadeIn { from { opacity:0 } to { opacity:1 } }
            @keyframes scaleIn { from { opacity:0; transform:scale(0.8) } to { opacity:1; transform:scale(1) } }
          `}</style>

          <div style={{
            textAlign: 'center',
            animation: 'scaleIn 0.5s cubic-bezier(0.34,1.56,0.64,1)'
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>
              {eliminated.role === 'mafia' ? '🔪' : '👤'}
            </div>

            <div className="mono" style={{
              fontSize: '0.7rem', letterSpacing: '0.4em',
              color: '#4ade80', marginBottom: '0.5rem'
            }}>
              THE CULT HAS SPOKEN
            </div>

            <div className="mono" style={{
              fontSize: 'clamp(1.8rem, 7vw, 3rem)',
              fontWeight: '900', color: '#dcfce7',
              letterSpacing: '0.15em',
              textShadow: '0 0 30px rgba(220,220,220,0.4)',
              marginBottom: '0.75rem'
            }}>
              {eliminated.name}
            </div>

            <div className="mono" style={{
              fontSize: '1rem', letterSpacing: '0.3em',
              fontWeight: '700',
              color: eliminated.role === 'mafia' ? '#ef4444' : '#4ade80',
              textShadow: eliminated.role === 'mafia'
                ? '0 0 30px rgba(239,68,68,0.9)'
                : '0 0 30px rgba(74,222,128,0.9)'
            }}>
              WAS {eliminated.role === 'mafia' ? 'MAFIA 🔪' : 'CIVILIAN 👤'}
            </div>

            {phase === 'done' && (
              <div className="mono" style={{
                marginTop: '1.5rem', fontSize: '0.7rem',
                letterSpacing: '0.3em', color: '#1a3a22'
              }}>
                CALCULATING RESULT...
              </div>
            )}
          </div>
        </div>
      )}

      <div style={{
        position: 'relative', zIndex: 10,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', width: '100%', maxWidth: '420px', gap: '1.5rem'
      }}>

        {/* Header */}
        <div style={{ textAlign: 'center' }}>
          <div className="mono" style={{
            color: '#ef4444', fontSize: '0.7rem',
            letterSpacing: '0.4em', marginBottom: '0.4rem'
          }}>[ VOTE PHASE ]</div>
          <h1 className="mono" style={{
            fontSize: '2rem', fontWeight: '800',
            color: '#dcfce7', letterSpacing: '0.2em',
            textShadow: '0 0 20px rgba(239,68,68,0.4)'
          }}>WHO IS MAFIA?</h1>
        </div>

        {/* Vote progress */}
        {totalNeeded > 0 && (
          <div style={{
            width: '100%', background: '#0a0a0a',
            border: '1px solid #3a0a0a', borderRadius: '0.75rem',
            padding: '0.75rem 1rem',
            display: 'flex', alignItems: 'center', gap: '0.75rem'
          }}>
            <div style={{
              flex: 1, height: '4px', background: '#1a0a0a',
              borderRadius: '9999px', overflow: 'hidden'
            }}>
              <div style={{
                height: '100%', borderRadius: '9999px',
                background: '#dc2626',
                width: `${(voteCount / totalNeeded) * 100}%`,
                transition: 'width 0.3s ease',
                boxShadow: '0 0 10px rgba(220,38,38,0.6)'
              }} />
            </div>
            <span className="mono" style={{
              color: '#ef4444', fontSize: '0.75rem',
              letterSpacing: '0.2em', whiteSpace: 'nowrap'
            }}>
              {voteCount}/{totalNeeded} VOTED
            </span>
          </div>
        )}

        {/* Player cards to vote on */}
        <div style={{
          width: '100%', display: 'flex',
          flexDirection: 'column', gap: '0.6rem'
        }}>
          {alivePlayers.map((player) => {
            const isSelected = selectedId === player.id
            return (
              <button
                key={player.id}
                onClick={() => castVote(player)}
                disabled={voted}
                className="mono"
                style={{
                  width: '100%', padding: '1rem 1.25rem',
                  display: 'flex', alignItems: 'center', gap: '1rem',
                  borderRadius: '0.875rem', cursor: voted ? 'default' : 'pointer',
                  transition: 'all 0.2s',
                  background: isSelected
                    ? 'rgba(220,38,38,0.15)'
                    : voted ? '#0a0a0a' : '#0a1a10',
                  border: isSelected
                    ? '1px solid rgba(220,38,38,0.6)'
                    : voted ? '1px solid #0f0f0f' : '1px solid #1a3a22',
                  boxShadow: isSelected
                    ? '0 0 20px rgba(220,38,38,0.3)'
                    : 'none',
                  opacity: voted && !isSelected ? 0.4 : 1,
                  transform: isSelected ? 'scale(1.02)' : 'scale(1)'
                }}
                onMouseEnter={e => {
                  if (!voted) {
                    e.currentTarget.style.borderColor = 'rgba(220,38,38,0.4)'
                    e.currentTarget.style.background = 'rgba(220,38,38,0.08)'
                  }
                }}
                onMouseLeave={e => {
                  if (!voted && !isSelected) {
                    e.currentTarget.style.borderColor = '#1a3a22'
                    e.currentTarget.style.background = '#0a1a10'
                  }
                }}
              >
                <div style={{
                  width: '36px', height: '36px', borderRadius: '50%',
                  background: isSelected ? 'rgba(220,38,38,0.2)' : '#050f0a',
                  border: isSelected ? '1px solid #dc2626' : '1px solid #1a3a22',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1rem', flexShrink: 0
                }}>
                  {isSelected ? '🔪' : '👤'}
                </div>
                <span style={{
                  color: isSelected ? '#fca5a5' : '#86efac',
                  fontSize: '1rem', fontWeight: '600',
                  letterSpacing: '0.1em'
                }}>
                  {player.name}
                </span>
                {isSelected && (
                  <span style={{
                    marginLeft: 'auto', color: '#ef4444',
                    fontSize: '0.65rem', letterSpacing: '0.2em'
                  }}>
                    VOTED
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {voted && phase === 'voting' && (
          <p className="mono" style={{
            color: '#15803d', fontSize: '0.7rem',
            letterSpacing: '0.3em', textAlign: 'center'
          }}>
            WAITING FOR OTHER VOTES...
          </p>
        )}

        {!voted && (
          <p className="mono" style={{
            color: '#dc2626', fontSize: '0.7rem',
            letterSpacing: '0.3em', textAlign: 'center',
            textShadow: '0 0 10px rgba(220,38,38,0.5)'
          }}>
            TAP TO CAST YOUR VOTE
          </p>
        )}
      </div>
    </div>
  )
}