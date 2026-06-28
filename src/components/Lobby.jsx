import ASCIIText from './ui/ASCIIText'
import LetterGlitch from './ui/LetterGlitch'

export default function Lobby({ onNavigate }) {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#050f0a',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'visible',
      padding: '0 1.5rem'
    }}>

      {/* LetterGlitch background */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, width: '100%', height: '100%' }}>
        <LetterGlitch
          glitchSpeed={50}
          centerVignette={true}
          outerVignette={false}
          smooth
          speed={10}
          colors={["#2b4539", "#61dca3", "#61b3dc"]}
        />
      </div>

      {/* Dark vignette overlay so center content is readable */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 1, pointerEvents: 'none',
        background: 'radial-gradient(ellipse at center, rgba(5,15,10,0.75) 0%, rgba(5,15,10,0.2) 70%, transparent 100%)'
      }} />

      {/* Corner labels */}
      <div className="mono flicker" style={{
        position: 'fixed', top: '1rem', left: '1rem',
        fontSize: '0.7rem', letterSpacing: '0.2em', color: '#4ade80', zIndex: 10
      }}>SYS://MAFIA_v1.0</div>
      <div className="mono flicker" style={{
        position: 'absolute', top: '1rem', right: '1rem',
        fontSize: '0.7rem', letterSpacing: '0.2em', color: '#4ade80', zIndex: 10
      }}>● ONLINE</div>

      {/* Content */}
      <div style={{
        position: 'relative', zIndex: 10,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', width: '100%', maxWidth: '460px',
        overflow: 'visible'
      }}>

        {/* ASCII Title — bigger */}
      <div style={{
        position: 'relative',
        width: '120%',
        height: 'clamp(200px, 35vw, 380px)',
        overflow: 'visible',textAlign: 'center', marginBottom: '1rem'
      }}>
        <ASCIIText
          text="MAFIA"
          enableWaves={false}
          asciiFontSize={7}
          textFontSize={200}
          planeBaseHeight={9}
        />
      </div>

        {/* Tagline */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.75rem',
          marginTop: '-0.5rem', marginBottom: '2.75rem'
        }}>
          <div style={{ height: '1px', width: '40px', background: 'rgba(74,222,128,0.3)' }} />
          <span className="mono" style={{
            fontSize: '0.7rem', letterSpacing: '0.4em', color: '#4ade80',
            textShadow: '0 0 20px rgba(74,222,128,0.8)'
          }}>TRUST NO ONE.</span>
          <div style={{ height: '1px', width: '40px', background: 'rgba(74,222,128,0.3)' }} />
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>

          {/* HOST GAME — shiny green gradient */}
          <button
            onClick={() => onNavigate('host')}
            className="mono"
            style={{
              width: '100%', padding: '1.15rem',
              fontWeight: '700', fontSize: '0.9rem',
              letterSpacing: '0.3em', borderRadius: '9999px',
              background: 'linear-gradient(135deg, #bbf7d0 0%, #22c55e 40%, #15803d 100%)',
              border: 'none', color: '#052e16',
              boxShadow: '0 0 30px rgba(34,197,94,0.4), 0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.25)',
              cursor: 'pointer', transition: 'all 0.3s',
              textShadow: 'none',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'scale(1.03)'
              e.currentTarget.style.boxShadow = '0 0 60px rgba(34,197,94,0.6), 0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.3)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'scale(1)'
              e.currentTarget.style.boxShadow = '0 0 30px rgba(34,197,94,0.4), 0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.25)'
            }}
          >
            ⌖ HOST GAME
          </button>

          {/* JOIN GAME — shiny dark gradient with green tint */}
          <button
            onClick={() => onNavigate('join')}
            className="mono"
            style={{
              width: '100%', padding: '1.15rem',
              fontWeight: '700', fontSize: '0.9rem',
              letterSpacing: '0.3em', borderRadius: '9999px',
              background: 'linear-gradient(135deg, #1a3a22 0%, #0f2a18 50%, #0a1a10 100%)',
              border: '1px solid rgba(74,222,128,0.35)', color: '#86efac',
              boxShadow: '0 0 20px rgba(34,197,94,0.1), 0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(74,222,128,0.15)',
              cursor: 'pointer', transition: 'all 0.3s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'scale(1.03)'
              e.currentTarget.style.borderColor = 'rgba(74,222,128,0.6)'
              e.currentTarget.style.boxShadow = '0 0 40px rgba(34,197,94,0.25), 0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(74,222,128,0.2)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'scale(1)'
              e.currentTarget.style.borderColor = 'rgba(74,222,128,0.35)'
              e.currentTarget.style.boxShadow = '0 0 20px rgba(34,197,94,0.1), 0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(74,222,128,0.15)'
            }}
          >
            ⊕ JOIN GAME
          </button>
        </div>

        <p className="mono" style={{
          fontSize: '0.65rem', marginTop: '2rem',
          letterSpacing: '0.25em', color: 'rgba(74,222,128,0.4)', textAlign: 'center'
        }}>
          SCAN QR CODE TO JOIN ON ANY DEVICE
        </p>
      </div>
    </div>
  )
}