# AIPost Frontend

Frontend desktop/web client for **AIPost**, built with **Vue 3**, **Vite**, **Pinia**, **Vue Router**, and **Electron**.

## What it does

- Authentication flow: login and registration
- Dashboard and profile pages
- Draft management and rich-text draft editor
- Site management and publishing-related workflows
- Admin views for users, sites, and drafts
- API-backed state with token-based requests

## Tech stack

- Vue 3
- Vite
- Pinia
- Vue Router
- Electron
- Axios
- TinyMCE
- Vuestic UI

## Prerequisites

- Node.js 18+ recommended
- npm

## Setup

```powershell
npm install
```

Create a local `.env` file with the required variables:

```env
VITE_API_BASE_URL=http://localhost:3000
VITE_TINYMCE_API_KEY=your_tinymce_api_key
```

Adjust the values to match your backend and TinyMCE account.

## Available scripts

- `npm run dev` — start the Vite dev server
- `npm run build` — build the frontend for production
- `npm run preview` — preview the production build
- `npm run electron` — launch Electron
- `npm run electron:dev` — run Vite and Electron together for development
- `npm run electron:preview` — build then launch Electron

## Project structure

- `src/api` — API wrappers and HTTP client
- `src/components` — shared UI components
- `src/layouts` — app and auth layouts
- `src/router` — route definitions
- `src/stores` — Pinia stores
- `src/views` — feature pages and screens
- `electron` — Electron main process entry point

## Notes

- API requests use the `auth_token` value from `localStorage`.
- The editor uses TinyMCE and requires a valid API key for full functionality.
- Keep secrets out of git; only commit non-sensitive configuration examples.

