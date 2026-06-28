import { useState, useEffect } from 'react'
import { socket } from './socket'
import Lobby from './components/Lobby'
import RoleReveal from './components/RoleReveal'
import RoundScreen from './components/RoundScreen'
import VoteScreen from './components/VoteScreen'
import GameOver from './components/GameOver'
import HostLobby from './components/HostLobby'
import JoinGame from './components/JoinGame'
import Sacrificed from './components/Sacrificed'

export default function App() {
  const [screen, setScreen] = useState('lobby')
  const [players, setPlayers] = useState([])
  const [round, setRound] = useState(1)
  const [sacrificedWinner, setSacrificedWinner] = useState(null)
  const [isSacrificed, setIsSacrificed] = useState(false)

  // Listen for game over while spectating (sacrificed)
  useEffect(() => {
    socket.on('game_over', ({ winner }) => {
      if (isSacrificed) setSacrificedWinner(winner)
    })
    socket.on('player_eliminated', ({ eliminated, round: newRound }) => {
      const myName = sessionStorage.getItem('playerName')
      if (eliminated?.name === myName) {
        setIsSacrificed(true)
        setScreen('sacrificed')
      } else {
        const updated = players.map(p =>
          p.name === eliminated?.name ? { ...p, alive: false } : p
        )
        setPlayers(updated)
        setRound(newRound)
        setScreen('round')
      }
    })
    return () => {
      socket.off('game_over')
      socket.off('player_eliminated')
    }
  }, [isSacrificed, players])

  function handleNavigate(destination) { setScreen(destination) }
  function goToRound() { setScreen('round') }
  function goToVote() { setScreen('vote') }

  function handleEliminate(id, winner) {
    if (winner) {
      if (isSacrificed) {
        setSacrificedWinner(winner)
      } else {
        setScreen(winner === 'mafia' ? 'gameover-mafia' : 'gameover-civilians')
      }
      return
    }
    const updated = players.map(p => p.id === id ? { ...p, alive: false } : p)
    setPlayers(updated)
  }

  function restart() {
    setScreen('lobby')
    setRound(1)
    setPlayers([])
    setIsSacrificed(false)
    setSacrificedWinner(null)
    sessionStorage.clear()
  }

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

      {screen === 'round' && <RoundScreen round={round} onTimeUp={goToVote} />}

      {screen === 'vote' && (
        <VoteScreen
          players={players}
          myName={sessionStorage.getItem('playerName')}
          onEliminate={handleEliminate}
        />
      )}

      {screen === 'sacrificed' && (
        <Sacrificed
          playerName={sessionStorage.getItem('playerName')}
          winner={sacrificedWinner}
          onGameOver={restart}
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