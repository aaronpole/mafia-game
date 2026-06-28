import LetterGlitch from './ui/LetterGlitch'

export default function Sacrificed({ playerName, onGameOver, winner }) {
  if (winner) {
    return (
      <div style={{
        minHeight: '100vh', background: '#050f0a',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        position: 'relative', overflow: 'hidden', padding: '2rem'
      }}>
        <div style={{ position: 'fixed', inset: 0, zIndex: 0 }}>
          <LetterGlitch glitchSpeed={30} centerVignette smooth speed={8}
            colors={winner === 'mafia'
              ? ["#3a0a0a", "#dc2626", "#7f1d1d"]
              : ["#2b4539", "#61dca3", "#61b3dc"]}
          />
        </div>
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1, pointerEvents: 'none',
          background: 'radial-gradient(ellipse at center, rgba(5,10,5,0.92) 0%, rgba(5,10,5,0.5) 100%)'
        }} />
        <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ fontSize: '5rem' }}>{winner === 'mafia' ? '🔪' : '🏆'}</div>
          <div className="mono" style={{ fontSize: '0.7rem', letterSpacing: '0.4em', color: winner === 'mafia' ? '#ef4444' : '#4ade80' }}>
            GAME OVER
          </div>
          <h1 className="mono" style={{
            fontSize: 'clamp(2rem, 8vw, 3.5rem)', fontWeight: '900',
            letterSpacing: '0.15em',
            color: winner === 'mafia' ? '#ef4444' : '#4ade80',
            textShadow: winner === 'mafia'
              ? '0 0 40px rgba(239,68,68,0.9)'
              : '0 0 40px rgba(74,222,128,0.9)'
          }}>
            {winner === 'mafia' ? 'MAFIA WINS' : 'CIVILIANS WIN'}
          </h1>
          <p className="mono" style={{ color: '#4ade80', fontSize: '0.8rem', letterSpacing: '0.2em' }}>
            you were sacrificed, {playerName}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#050f0a',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      position: 'relative', overflow: 'hidden', padding: '2rem'
    }}>
      <div style={{ position: 'fixed', inset: 0, zIndex: 0 }}>
        <LetterGlitch glitchSpeed={50} centerVignette smooth speed={10}
          colors={["#3a0a0a", "#dc2626", "#7f1d1d"]} />
      </div>
      <div style={{
        position: 'fixed', inset: 0, zIndex: 1, pointerEvents: 'none',
        background: 'radial-gradient(ellipse at center, rgba(5,10,5,0.95) 0%, rgba(5,10,5,0.6) 100%)'
      }} />
      <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
        <div style={{ fontSize: '5rem' }}>⚰️</div>
        <div className="mono" style={{ fontSize: '0.7rem', letterSpacing: '0.4em', color: '#ef4444', marginBottom: '0.25rem' }}>
          [ ELIMINATED ]
        </div>
        <h1 className="mono" style={{
          fontSize: 'clamp(1.8rem, 7vw, 3rem)', fontWeight: '900',
          color: '#ef4444', letterSpacing: '0.15em',
          textShadow: '0 0 40px rgba(239,68,68,0.9), 0 0 80px rgba(239,68,68,0.4)'
        }}>
          YOU HAVE BEEN<br />SACRIFICED
        </h1>
        <p className="mono" style={{ color: '#7f1d1d', fontSize: '0.8rem', letterSpacing: '0.3em' }}>
          {playerName}
        </p>
        <div style={{
          marginTop: '1rem', padding: '1rem 1.5rem',
          background: '#0a0a0a', border: '1px solid #3a0a0a',
          borderRadius: '0.75rem'
        }}>
          <p className="mono" style={{ color: '#4ade80', fontSize: '0.7rem', letterSpacing: '0.2em', textAlign: 'center' }}>
            SPECTATING — WAITING FOR GAME TO END...
          </p>
        </div>
      </div>
    </div>
  )
}