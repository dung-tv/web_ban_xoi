# web_ban_xoi
# Next.js Xoi Shop

A minimal Next.js project that proxies requests to a Google Apps Script (Google Sheets) Web App. The Next.js server-side API calls GAS to avoid browser CORS issues.

## Setup

1. `git clone` or copy files into a folder.
2. `npm install`
3. Copy `.env.local.example` to `.env.local` and set `GAS_URL` to your Google Apps Script web app URL.
4. `npm run dev`
5. Open `http://localhost:3000`

## What it does
- `/api/products` — server-side route that fetches product list from GAS and returns JSON.
- `/api/order` — server-side route that forwards POST order requests to GAS using server-to-server POST.

Notes: If your GAS returns JSONP, the server will attempt to strip a callback wrapper and parse JSON.

---

## File: pages/_app.js

```javascript
import '../styles/globals.css'

export default function App({ Component, pageProps }) {
  return <Component {...pageProps} />
}