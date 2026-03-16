# ResCue - Research Management

A frontend application for managing clinical research studies, built with React and Vite.

## Getting Started

Install dependencies:

```
npm install
```

Run the frontend and database server together:

```
npm start
```

- Frontend: http://localhost:5173
- Database API: http://localhost:3001

Or run them separately:

```
npm run dev       # frontend only
npm run server    # json-server only
```

## Data Storage

Data is persisted in `db.json` via json-server, a local REST API that reads and writes a JSON file on disk. This replaces browser localStorage, so data survives cache clears and is accessible across browsers.

## Backing Up the Database

**Option 1 — Copy the file directly (recommended)**

Stop the server first, then copy `db.json` to a safe location:

```bash
cp db.json db.backup.json
```

Restore it by copying back:

```bash
cp db.backup.json db.json
```

> Copying while json-server is running is safe for a quick snapshot, but stopping the server first avoids any mid-write inconsistency.

**Option 2 — Export via the app UI**

Use the Export button in the sidebar to download the current data as a JSON file. Use Import to restore from a previously exported file.

**Option 3 — Fetch via the API**

While json-server is running, you can dump the raw data with curl:

```bash
curl http://localhost:3001/db > db.backup.json
```

## Tech Stack

- React 19
- Vite 8
- React Router
- Tailwind CSS with shadcn/ui components
- json-server (local database)
- Recharts (charts)
- Lucide React (icons)
