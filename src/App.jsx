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
import NightScreen from './components/NightScreen'

export default function App() {
  const [screen, setScreen] = useState('lobby')
  const [players, setPlayers] = useState([])
  const [myRole, setMyRole] = useState(null)
  const [nightInfo, setNightInfo] = useState(null)
  const [round, setRound] = useState(1)
  const [connectionStatus, setConnectionStatus] = useState('connecting')
  const [sacrificedWinner, setSacrificedWinner] = useState(null)
  const [isSacrificed, setIsSacrificed] = useState(false)

  // Listen for game over while spectating (sacrificed)
  useEffect(() => {
    function reconnect() {
      setConnectionStatus('online')
      const code = sessionStorage.getItem('roomCode')
      const reconnectToken = sessionStorage.getItem('reconnectToken')
      if (code && reconnectToken) socket.emit('reconnect_player', { code, reconnectToken })
    }
    function connectionFailed() { setConnectionStatus('offline') }
    function connectionLost() { setConnectionStatus('reconnecting') }

    socket.on('role_assigned', setMyRole)
    socket.on('connect', reconnect)
    socket.on('connect_error', connectionFailed)
    socket.on('disconnect', connectionLost)
    socket.on('reconnected', ({ state, assignedPlayers, round, lastResult }) => {
      setPlayers(assignedPlayers || [])
      setRound(round || 1)
      const myPlayer = assignedPlayers?.find(player => player.name === sessionStorage.getItem('playerName'))
      if (state === 'gameOver' && lastResult?.data?.winner) {
        if (myPlayer && !myPlayer.alive) {
          setIsSacrificed(true)
          setSacrificedWinner(lastResult.data.winner)
          setScreen('sacrificed')
        } else {
          setScreen(`gameover-${lastResult.data.winner}`)
        }
      } else if (myPlayer && !myPlayer.alive) {
        setIsSacrificed(true)
        setScreen('sacrificed')
      } else if (state === 'night') {
        setScreen('night')
      } else if (state === 'voting') {
        setScreen('vote')
      } else if (state === 'round') {
        setScreen('round')
      } else if (state === 'roleReveal') {
        setScreen('roleReveal')
      } else if (state === 'resolving') {
        setScreen('vote')
      } else {
        setScreen(sessionStorage.getItem('isHost') === 'true' ? 'host' : 'join')
      }
    })
    socket.on('night_started', info => {
      setNightInfo(info)
      setPlayers(current => current.map(player => ({
        ...player,
        alive: info.alivePlayers.some(alivePlayer => alivePlayer.id === player.id)
      })))
      if (!info.alivePlayers.some(player => player.name === sessionStorage.getItem('playerName'))) {
        setIsSacrificed(true)
        setScreen('sacrificed')
      } else {
        setScreen('night')
      }
    })
    socket.on('night_resolved', ({ eliminated, round: newRound }) => {
      if (eliminated) {
        if (eliminated.name === sessionStorage.getItem('playerName')) {
          setIsSacrificed(true)
          setScreen('sacrificed')
        }
        setPlayers(current => current.map(player =>
          player.id === eliminated.id ? { ...player, alive: false } : player
        ))
      }
      setNightInfo(null)
      setRound(newRound)
      if (!isSacrificed) setScreen('round')
    })
    socket.connect()

    socket.on('game_over', ({ winner }) => {
      if (isSacrificed) setSacrificedWinner(winner)
      else setScreen(`gameover-${winner}`)
    })
    socket.on('player_eliminated', ({ eliminated, round: newRound }) => {
      const myName = sessionStorage.getItem('playerName')
      if (eliminated?.name === myName) setIsSacrificed(true)
      if (eliminated) {
        setPlayers(current => current.map(player =>
          player.id === eliminated.id ? { ...player, alive: false } : player
        ))
      }
      setRound(newRound)
    })
    return () => {
      socket.off('role_assigned', setMyRole)
      socket.off('connect', reconnect)
      socket.off('connect_error', connectionFailed)
      socket.off('disconnect', connectionLost)
      socket.off('reconnected')
      socket.off('night_started')
      socket.off('night_resolved')
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
    setMyRole(null)
    setNightInfo(null)
    setIsSacrificed(false)
    setSacrificedWinner(null)
    sessionStorage.clear()
    socket.disconnect()
  }

  return (
    <div style={{ minHeight: '100vh', background: '#050f0a' }}>
      {screen === 'lobby' && <Lobby onNavigate={handleNavigate} connectionStatus={connectionStatus} />}

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
          myRole={myRole}
          mafiaTeam={myRole?.mafiaTeam || []}
          onDone={goToRound}
        />
      )}

      {screen === 'round' && <RoundScreen round={round} onTimeUp={goToVote} />}

      {screen === 'night' && <NightScreen key={nightInfo?.startTime || 'night'} myRole={myRole} night={nightInfo} />}

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