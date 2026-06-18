# AIPost Frontend

Frontend web client for **AIPost**, built with **Vue 3**, **Vite**, **Pinia**, and **Vue Router**.

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

## Project structure

- `src/api` — API wrappers and HTTP client
- `src/components` — shared UI components
- `src/layouts` — app and auth layouts
- `src/router` — route definitions
- `src/stores` — Pinia stores
- `src/views` — feature pages and screens

## Import aliases

Use path aliases for shared modules instead of deep relative imports like `../../stores/authStore`.

- `@` — `src`
- `@api` — `src/api`
- `@assets` — `src/assets`
- `@components` — `src/components`
- `@layouts` — `src/layouts`
- `@router` — `src/router`
- `@stores` — `src/stores`
- `@views` — `src/views`

Example:

```js
import { useAuthStore } from '@stores/authStore'
import AppLayout from '@layouts/AppLayout.vue'
```

## Notes

- API requests use the `auth_token` value from `localStorage`.
- Routing currently uses Vue Router hash history.
- The editor uses TinyMCE and requires a valid API key for full functionality.
- Keep secrets out of git; only commit non-sensitive configuration examples.
