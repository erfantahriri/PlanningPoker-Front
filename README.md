# PlanningPoker Front

React front-end for the PlanningPoker application — real-time planning sessions for scrum/agile teams.

## Features

- Create and join rooms (public or password-protected)
- Participant roles: **Dev**, **Designer**, **PM**, **EM** — with role picker on join and in-room switching
- Card sets: Standard, Fibonacci, T-Shirt Sizes — selectable per room
- Real-time voting: submit, flip cards, reset board
- Issue management: create, rename, delete, set active issue
- In-room chat over WebSocket
- Voting timer (start/stop, visible to all participants)
- Emoji reactions
- Rename yourself in-room
- Session summary page with full vote history
- Dark theme UI, mobile-responsive

## Quick Start (Docker)

Run everything together with Docker Compose from the repo root:

```sh
docker compose up --build
```

Front-end is available at `http://localhost:3000`.

## Manual Setup

### Requirements

- Node.js 16+
- The [PlanningPoker API](https://github.com/erfantahriri/PlanningPoker-API) running on port 8000

### Run

```sh
npm install
npm start
```

Open `http://localhost:3000`.

### Build for production

```sh
npm run build
```

## Environment

The API base URL is set in `src/services/api.js`. When running via Docker Compose it is configured automatically via `REACT_APP_API_URL`.

## Related

- [PlanningPoker-API](https://github.com/erfantahriri/PlanningPoker-API)

## License

GPL-3.0
