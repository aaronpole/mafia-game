import { useState } from 'react'
import Lobby from './components/Lobby'
import RoleReveal from './components/RoleReveal'
import RoundScreen from './components/RoundScreen'
import VoteScreen from './components/VoteScreen'
import GameOver from './components/GameOver'
import HostLobby from './components/HostLobby'
import JoinGame from './components/JoinGame'

function assignRoles(players) {
  const mafiaCount = Math.round(players.length / 3)
  const roles = [
    ...Array(mafiaCount).fill('mafia'),
    ...Array(players.length - mafiaCount).fill('civilian')
  ]
  for (let i = roles.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [roles[i], roles[j]] = [roles[j], roles[i]]
  }
  return players.map((name, i) => ({ name, role: roles[i], alive: true, id: i }))
}

export default function App() {
  const [screen, setScreen] = useState('lobby')
  const [players, setPlayers] = useState([])
  const [round, setRound] = useState(1)
  const [mode, setMode] = useState(null) // 'host' or 'join'

  function handleNavigate(destination) {
  setMode(destination)
  setScreen(destination)
}

  function startGame(playerNames) {
    setPlayers(assignRoles(playerNames))
    setScreen('roleReveal')
  }

  function goToRound() { setScreen('round') }
  function goToVote() { setScreen('vote') }

  function eliminatePlayer(id) {
    const updated = players.map(p => p.id === id ? { ...p, alive: false } : p)
    setPlayers(updated)
    const alive = updated.filter(p => p.alive)
    const aliveMafia = alive.filter(p => p.role === 'mafia').length
    const aliveCivilians = alive.filter(p => p.role === 'civilian').length
    if (aliveMafia === 0) setScreen('gameover-civilians')
    else if (aliveMafia >= aliveCivilians) setScreen('gameover-mafia')
    else { setRound(r => r + 1); setScreen('round') }
  }

  function restart() { setScreen('lobby'); setRound(1); setPlayers([]); setMode(null) }

  return (
    <div style={{ minHeight: '100vh', background: '#050f0a' }}>
      {screen === 'lobby' && <Lobby onNavigate={handleNavigate} />}
      {screen === 'host' && (
      <HostLobby onGameStart={(assignedPlayers, code) => {
        console.log('setting players:', assignedPlayers)
        setPlayers(assignedPlayers)
        sessionStorage.setItem('roomCode', code)
        setScreen('roleReveal')
      }} />
      )}
      {screen === 'join' && (
           <JoinGame
                prefillCode={new URLSearchParams(window.location.search).get('join') || ''}
                onJoined={() => setScreen('roleReveal')}
          />
      )}
      {screen === 'roleReveal' && (
          <RoleReveal
          myRole={players[0]}
          mafiaTeam={players.filter(p => p.role === 'mafia').map(p => p.name)}
          onDone={goToRound}
        />
    )}
      {screen === 'round' && <RoundScreen players={players} round={round} onTimeUp={goToVote} />}
      {screen === 'vote' && (
          <VoteScreen
            players={players}
            onEliminate={(id, winner) => {
            if (winner) {
              setScreen(winner === 'mafia' ? 'gameover-mafia' : 'gameover-civilians')
            } else {
              eliminatePlayer(id)
            }
        }}
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