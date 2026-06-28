import LetterGlitch from './ui/LetterGlitch'

export default function GameOver({ winner, onRestart }) {
  const isMafia = winner === 'mafia'

  return (
    <div style={{
      minHeight: '100vh', background: '#050f0a',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      position: 'relative', overflow: 'hidden', padding: '2rem'
    }}>
      <div style={{ position: 'fixed', inset: 0, zIndex: 0 }}>
        <LetterGlitch glitchSpeed={30} centerVignette smooth speed={8}
          colors={isMafia
            ? ["#3a0a0a", "#dc2626", "#7f1d1d"]
            : ["#2b4539", "#61dca3", "#61b3dc"]}
        />
      </div>
      <div style={{
        position: 'fixed', inset: 0, zIndex: 1, pointerEvents: 'none',
        background: 'radial-gradient(ellipse at center, rgba(5,10,5,0.92) 0%, rgba(5,10,5,0.5) 100%)'
      }} />

      <div style={{
        position: 'relative', zIndex: 10,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', gap: '1.5rem', textAlign: 'center'
      }}>
        <div style={{ fontSize: '5rem' }}>
          {isMafia ? '🔪' : '🏆'}
        </div>

        <div>
          <div className="mono" style={{
            fontSize: '0.7rem', letterSpacing: '0.4em',
            color: isMafia ? '#ef4444' : '#4ade80',
            marginBottom: '0.75rem'
          }}>
            GAME OVER
          </div>
          <h1 className="mono" style={{
            fontSize: 'clamp(2rem, 8vw, 3.5rem)',
            fontWeight: '900', letterSpacing: '0.15em',
            color: isMafia ? '#ef4444' : '#4ade80',
            textShadow: isMafia
              ? '0 0 40px rgba(239,68,68,0.9), 0 0 80px rgba(239,68,68,0.4)'
              : '0 0 40px rgba(74,222,128,0.9), 0 0 80px rgba(74,222,128,0.4)'
          }}>
            {isMafia ? 'MAFIA WINS' : 'CIVILIANS WIN'}
          </h1>
        </div>

        <button onClick={onRestart} className="mono" style={{
          marginTop: '1rem', padding: '1.1rem 3rem',
          fontWeight: '700', fontSize: '0.85rem',
          letterSpacing: '0.3em', borderRadius: '9999px',
          background: isMafia
            ? 'linear-gradient(135deg, #7f1d1d, #dc2626)'
            : 'linear-gradient(135deg, #bbf7d0, #22c55e 40%, #15803d)',
          border: 'none',
          color: isMafia ? '#fca5a5' : '#052e16',
          cursor: 'pointer',
          boxShadow: isMafia
            ? '0 0 30px rgba(220,38,38,0.4)'
            : '0 0 30px rgba(34,197,94,0.4)',
          transition: 'all 0.3s'
        }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          PLAY AGAIN
        </button>
      </div>
    </div>
  )
}