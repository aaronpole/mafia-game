# Mafia

A real-time multiplayer Mafia game. A host creates a six-character room code, friends join in their browsers, and the server runs role assignment, discussion, voting, Mafia night actions, eliminations, and win checks.

## Architecture

The frontend is a React/Vite browser app in this repository. The Express and Socket.IO backend lives in the separate `mafia-server` repository. The frontend keeps only its own private role plus the public player roster. The backend owns each room's players, roles, phase, votes, actions, and timers; there is no database.

Socket.IO carries room creation/joining, public roster updates, phase events, votes, night actions, and reconnect requests. Role assignment is sent as a direct `role_assigned` event to each player's socket. Public room events never include roles, socket IDs, or reconnect tokens. A role is revealed publicly only when its player is eliminated.

The host starts the first discussion after role reveal. The server starts the vote when the discussion timer expires, resolves votes when the vote timer expires, reveals any elimination, then opens the Mafia night. It validates night actions and resolves them on submission or when the night timer expires. After night, the server starts the next round automatically, even if the host has been eliminated. Clients display countdowns using server-provided start times and durations; they do not decide phase outcomes.

## Requirements

- Node.js 20.19 or newer (Node 24 was used for local verification)
- npm

The frontend and backend are separate repositories and should be installed and deployed independently.

## Local Setup

Terminal 1, in the backend repository:

```powershell
cd mafia-server
npm ci
npm start
```

Terminal 2, in this frontend repository:

```powershell
npm ci
npm run dev
```

Open the Vite URL, create a room in one browser, and join it from at least three other browser sessions. The backend listens on `PORT` or `3001`; the default local CORS allowlist permits Vite at `localhost:5173` and `127.0.0.1:5173`.

## Environment Variables

Frontend: copy `.env.example` to `.env.local` for local overrides. `VITE_SERVER_URL` is the Socket.IO server origin, for example `http://localhost:3001`. In Vercel, set it to the public Railway origin. Vite embeds `VITE_*` values at build time, so redeploy the frontend after changing it.

Backend: copy `mafia-server/.env.example` to `.env` for local overrides.

- `PORT`: HTTP and Socket.IO listen port; Railway supplies this in production.
- `CLIENT_ORIGINS`: comma-separated exact browser origins. Set the Vercel production domain and any preview domains you intend to support. The default is the two local Vite origins.
- `DISCUSSION_DURATION_MS`: discussion duration; defaults to 300000.
- `VOTE_DURATION_MS`: vote duration; defaults to 15000.
- `NIGHT_DURATION_MS`: Mafia action duration; defaults to 30000.

The three duration settings are optional and useful for local testing; leave them unset for normal game timing.

## Deployment

### Railway backend

Deploy the `mafia-server` repository as its own Railway service. Its `railway.json` selects Nixpacks, starts with `npm start`, and checks `/health`. Railway installs from `package-lock.json`; the server binds to the provided `PORT` and serves Socket.IO on the same HTTP server.

After Railway assigns the service a public HTTPS domain, set `CLIENT_ORIGINS` to the exact Vercel origin(s), with no trailing slash. Check that `https://<railway-domain>/health` returns `{"status":"ok"}`.

### Vercel frontend

Deploy this repository as a Vite project. Use `npm run build` and `dist` as the output directory. Set the Vercel project environment variable `VITE_SERVER_URL` to the Railway HTTPS origin (no trailing slash), then redeploy so the URL is embedded in the client build. Do not use `localhost` for a production value.

## Security Notes

- Only the room host may start a game or discussion; voting and night transitions are driven by backend timers.
- Game actions resolve from the authenticated socket's room membership and assigned player, not a client-supplied player identity.
- The server rejects votes from dead/unassigned players, repeat votes, invalid/dead targets, and self-votes. Mafia actions require a living Mafia player and a living non-Mafia target.
- Role, socket ID, and reconnect token data are omitted from public roster and phase events. Reconnect uses a random bearer token stored in the browser's `sessionStorage`; never share it.
- CORS should be restricted with `CLIENT_ORIGINS` in production. CORS is not authentication; game event handlers still validate membership and phase.

## Known Limitations

- Room and game state live in process memory. A server restart loses active rooms; multiple backend instances are not coordinated and are not supported without shared storage and a Socket.IO adapter.
- Reconnect tokens last only as long as the in-memory room. A disconnected host's room is removed after five minutes if they do not reconnect.
- The game supports Mafia and civilian roles, with a maximum of 16 players per room. There is no persistent account system or database.
- The Vite build reports non-fatal CSS import-order and large JavaScript chunk warnings.

## Verification

The frontend production build and lint completed locally. Six real Socket.IO clients were tested through room creation/joining, private role delivery, host authorization, server-timed discussion and voting, invalid/self-vote rejection, civilian elimination, Mafia night action, server-timer resolution, win conditions, and valid/invalid reconnect. Seven clients also tested elimination of the civilian host and automatic progression into the next round. Four independent browser tabs created/joined a room and reached their own role-reveal screens. Semver-compatible dependency updates cleared the advisories and `npm audit` reported zero vulnerabilities immediately after the updates. The currently deployed production version is working.
