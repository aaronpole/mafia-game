import { useState } from 'react'
import Lobby from './components/Lobby'
import RoleReveal from './components/RoleReveal'
import RoundScreen from './components/RoundScreen'
import VoteScreen from './components/VoteScreen'
import GameOver from './components/GameOver'
import HostLobby from './components/HostLobby'
import JoinGame from './components/JoinGame'

export default function App() {
  const [screen, setScreen] = useState('lobby')
  const [players, setPlayers] = useState([])
  const [round, setRound] = useState(1)

  function handleNavigate(destination) {
    setScreen(destination)
  }

  function goToRound() { setScreen('round') }
  function goToVote() { setScreen('vote') }

  function handleEliminate(id, winner) {
    if (winner) {
      setScreen(winner === 'mafia' ? 'gameover-mafia' : 'gameover-civilians')
      return
    }
    // Update alive status locally too
    const updated = players.map(p => p.id === id ? { ...p, alive: false } : p)
    setPlayers(updated)
    setRound(r => r + 1)
    setScreen('round')
  }

  function restart() {
    setScreen('lobby')
    setRound(1)
    setPlayers([])
    sessionStorage.clear()
  }

  // Find this device's role from the players array using socketId
  function getMyRole() {
    const mySocketId = sessionStorage.getItem('mySocketId')
    const myName = sessionStorage.getItem('playerName')
    return (
      players.find(p => p.socketId === mySocketId) ||
      players.find(p => p.name === myName) ||
      players[0]
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#050f0a' }}>
      {screen === 'lobby' && <Lobby onNavigate={handleNavigate} />}

      {screen === 'host' && (
        <HostLobby onGameStart={(assignedPlayers, code) => {
          setPlayers(assignedPlayers)
          sessionStorage.setItem('roomCode', code)
          setScreen('roleReveal')
        }} />
      )}

      {screen === 'join' && (
        <JoinGame
          prefillCode={new URLSearchParams(window.location.search).get('join') || ''}
          onJoined={(assignedPlayers, code) => {
            if (assignedPlayers) setPlayers(assignedPlayers)
            if (code) sessionStorage.setItem('roomCode', code)
            setScreen('roleReveal')
          }}
        />
      )}

      {screen === 'roleReveal' && (
        <RoleReveal
          myRole={getMyRole()}
          mafiaTeam={players.filter(p => p.role === 'mafia').map(p => p.name)}
          onDone={goToRound}
        />
      )}

      {screen === 'round' && (
        <RoundScreen
          round={round}
          onTimeUp={goToVote}
        />
      )}

      {screen === 'vote' && (
        <VoteScreen
          players={players}
          onEliminate={handleEliminate}
        />
      )}

      {(screen === 'gameover-civilians' || screen === 'gameover-mafia') && (
        <GameOver
          winner={screen === 'gameover-mafia' ? 'mafia' : 'civilians'}
          onRestart={restart}
        />
      )}
    </div>
  )
}