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

Use the Export and Import buttons in the sidebar to back up or restore data as a JSON file.

## Tech Stack

- React 19
- Vite 8
- React Router
- Tailwind CSS with shadcn/ui components
- json-server (local database)
- Recharts (charts)
- Lucide React (icons)
