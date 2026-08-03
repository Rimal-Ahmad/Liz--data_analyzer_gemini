# Liz — AI-Powered Patient Data Analyzer

Liz is a Next.js application that lets a user log in, pull their health history and dialysis therapy records from a backend API, and ask natural-language questions about that data. Instead of showing raw tables, Liz sends the data to Google's Gemini model and returns a plain-language (or clinically precise, depending on how the question is asked) analysis in a chat-style interface.

## How it works

Login → Fetch patient data once → Ask questions in a chat → Gemini analyzes → Answer shown


1. **Login** — the app authenticates against the backend using credentials stored server-side (not entered by the user), and receives an access token + refresh token.
2. **Data fetch** — once, right after login, the app fetches the last 30 days of history and therapy records and caches them in the browser session.
3. **Chat-based analysis** — every question the user asks is sent, along with the cached data and recent chat history, to Gemini. Gemini responds with an analysis, not raw numbers.
4. **Token refresh** — the backend access token is short-lived, so each data request first refreshes it using the stored refresh token before fetching.

## Architecture

All backend calls (including credentials and API keys) happen **server-side**, through Next.js Route Handlers. The browser never talks to the backend or to Gemini directly, and never sees the backend's real URL, credentials, or API keys.

Browser
|
v
Next.js Route Handlers (app/api/*) <- credentials & Gemini key live here only
|
v
Backend API + Gemini API


### Routes

| Route | Purpose |
|---|---|
| `app/api/auth` | Logs into the backend using credentials from `.env.local`; returns access + refresh tokens to the client |
| `app/api/data` | Refreshes the access token, then fetches history + therapies for the last 30 days in parallel |
| `app/api/analyze` | Takes a question + cached data + recent chat history, builds a prompt, and calls Gemini for an analysis |

### Pages

| Page | Purpose |
|---|---|
| `app/login` | Single-button login (no form) - credentials are never entered or seen client-side |
| `app/analysis` | Loads patient data once, then provides a chat interface for asking questions about it |

## Data flow in detail

**Login**

User clicks "Log in"
-> POST /api/auth
-> Next.js reads BACKEND_USERNAME / BACKEND_PASSWORD from .env.local
-> Backend authenticates
-> access_token + refresh_token returned to client
-> Tokens stored, user redirected to /analysis


**Data load (runs once per session)**

/analysis page loads
-> POST /api/data with refresh token
-> Backend refresh token exchanged for a fresh access token
-> History + therapies fetched in parallel
-> Both datasets cached in the page's state


**Asking a question**

User types a question
-> POST /api/analyze with { question, chat history, cached history, cached therapies }
-> Prompt built (patient history + therapies + last 4 messages + question + tone/safety instructions)
-> Gemini (gemini-2.5-flash) generates a response
-> Response added to the chat


The model adapts its tone automatically: plain language for everyday questions, more clinical precision if the question itself uses technical/medical terminology. It's instructed to describe patterns rather than diagnose, and to flag anything worth discussing with a healthcare provider.

## Environment variables

Create a `.env.local` file in the project root:

API_URL=http://localhost:8000
BACKEND_USERNAME=your_backend_username
BACKEND_PASSWORD=your_backend_password
GEMINI_API_KEY=your_gemini_api_key


None of these use the `NEXT_PUBLIC_` prefix - they're only read inside server-side route handlers, so they're never exposed to the browser.

## Getting started

**1. Install dependencies**
```bash
npm install
```

**2. Set up `.env.local`** as shown above.

**3. Make sure the backend API is running** and reachable at the URL set in `API_URL`.

**4. Run the dev server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), go to `/login`, and log in to reach `/analysis`.

## Known limitation / possible improvement

Right now, each question sent to `/api/analyze` includes the full cached patient history and therapies data along with the question and chat history. A more efficient design would have the server cache the patient's data against a session/identifier, so subsequent requests only need to send the new question - reducing payload size on every chat message.

## Tech stack

- **Next.js** (App Router) + TypeScript
- **Google Generative AI SDK** (`@google/generative-ai`) - Gemini `gemini-2.5-flash`
- Backend API for authentication and patient data (FastAPI)

## Deployment

Deploy on [Vercel](https://vercel.com/new) as with any Next.js app. Set the same environment variables (`API_URL`, `BACKEND_USERNAME`, `BACKEND_PASSWORD`, `GEMINI_API_KEY`) in the Vercel project settings - none of them need the `NEXT_PUBLIC_` prefix there either.