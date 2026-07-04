# Persona Mentor Chat

AI-powered chat app that simulates coding mentor conversations inspired by the public teaching styles of Hitesh Choudhary and Piyush Garg.

The app is intentionally framed as **inspired by public content**, not as the real people and not as an endorsement.

## Features

- LLM-based chat interface
- Switch between Hitesh-inspired and Piyush-inspired personas
- Express + EJS + vanilla JavaScript frontend
- Server-side OpenAI API integration
- Persona prompt modes: `runtime`, `balanced`, `full`
- Structured JSON response pipeline: `initial -> think -> analyze -> output`
- Only final `output` is shown in the UI; intermediate steps are logged in browser console
- Input length protection and per-IP rate limiting for public demo safety
- Documentation for data preparation, prompt strategy, context management, and sample conversations

## Tech Stack

- Node.js
- Express
- EJS
- Vanilla JavaScript
- OpenAI package
- express-rate-limit
- pnpm

## Project Structure

```txt
src/
  app.js
  index.js
  config/
  constants/
  controllers/
  routes/
  services/
  utils/
  personas/
views/
  index.ejs
public/
  chat.js
  styles.css
docs/
  persona-data.md
  prompt-strategy.md
  context-management.md
  sample-conversations.md
```

## Setup

Install dependencies:

```bash
pnpm install
```

Create `.env` from the example:

```bash
cp .env.example .env
```

Set your OpenAI key:

```env
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4o-mini
PORT=3000
PROMPT_MODE=balanced
MAX_USER_MESSAGE_CHARS=1200
MAX_CONTEXT_MESSAGES=8
RATE_LIMIT_WINDOW_MINUTES=60
RATE_LIMIT_MAX_REQUESTS=60
```

Run locally:

```bash
pnpm dev
```

Open:

```txt
http://localhost:3000
```

## Prompt Modes

```env
PROMPT_MODE=runtime
```

Fastest and cheapest. Uses compact prompts.

```env
PROMPT_MODE=balanced
```

Recommended default. Stronger persona quality without sending full research prompts.

```env
PROMPT_MODE=full
```

Richest but slower and more expensive. Useful for demos and comparison.

## API

`POST /api/chat`

Request:

```json
{
  "persona": "hitesh",
  "step": "initial",
  "messages": [
    { "role": "user", "content": "Can I learn React without JavaScript?" }
  ]
}
```

Response:

```json
{
  "step": "initial",
  "content": "..."
}
```

Valid personas:

- `hitesh`
- `piyush`

Valid steps:

- `initial`
- `think`
- `analyze`
- `output`

## Context Management

The MVP keeps chat state in browser memory only. There is no database, login, or saved chat history.

The server trims recent context with:

```env
MAX_CONTEXT_MESSAGES=8
```

The UI displays only the final `output` step. Intermediate pipeline steps are logged with `console.debug` for development and debugging.

## Usage Limits

The public demo protects API credits with:

```env
MAX_USER_MESSAGE_CHARS=1200
RATE_LIMIT_WINDOW_MINUTES=60
RATE_LIMIT_MAX_REQUESTS=60
```

Since the app currently uses four API calls per user message, `60` step requests equals about `15` full user questions per hour per IP.

No output-token cap is currently used because it can cut off educational responses awkwardly.

## Deployment

### Render

1. Create a new Web Service.
2. Connect your public GitHub repository.
3. Set build command:

```bash
pnpm install
```

4. Set start command:

```bash
pnpm start
```

5. Add environment variables from `.env.example`.
6. Deploy.

### Railway

1. Create a new Railway project from GitHub.
2. Add environment variables from `.env.example`.
3. Railway should detect Node.js automatically.
4. Use start command:

```bash
pnpm start
```

### Vercel Note

This project is currently built as a long-running Express server. Render or Railway is simpler for this structure. Vercel can work, but would require adapting the app to serverless functions.

## Documentation

- [Persona data collection](docs/persona-data.md)
- [Prompt engineering strategy](docs/prompt-strategy.md)
- [Context management](docs/context-management.md)
- [Sample conversations](docs/sample-conversations.md)

## Safety and Ethics

This app does not claim to be Hitesh Choudhary or Piyush Garg. It uses persona prompts inspired by publicly available teaching patterns and includes explicit anti-impersonation boundaries.

## Scripts

```bash
pnpm dev
pnpm start
pnpm test
```

`pnpm test` currently runs syntax checks for the server and client JavaScript files.
