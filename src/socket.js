import { io } from 'socket.io-client'

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'https://mafia-server-production-e0a2.up.railway.app'

export const socket = io(SERVER_URL, { autoConnect: false })