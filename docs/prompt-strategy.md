# Prompt Engineering Strategy

The project uses a three-mode persona prompt strategy so quality, cost, and speed can be balanced without changing code.

## Prompt Modes

The app selects the prompt with `PROMPT_MODE`:

- `runtime`: fastest and cheapest. Uses compact prompts such as `hitesh.runtime.md` and `piyush.runtime.md`.
- `balanced`: default public-demo mode. Uses `hitesh.balanced.md` and `piyush.balanced.md` for stronger persona quality without sending the full research prompt.
- `full`: richest but slowest/costliest. Uses the long reference files `hitesh.md` and `piyush.md`, mainly for demos, comparison, and prompt refinement.

Recommended public setting:

```env
PROMPT_MODE=balanced
```

The server caches loaded prompts by `persona:promptMode`, so prompt files are read from disk once and reused.

## Prompt Design

Each active prompt includes:

- Persona identity as an AI mentor inspired by public teaching style
- Strong anti-impersonation boundaries
- Tone, vocabulary, and language-mirroring rules
- Teaching structure
- Response formatting expectations
- Persona-specific differentiation rules
- Strict JSON pipeline contract

The active persona prompt is sent as a system message for the selected persona. The selected persona should be the only active persona for that response.

## Persona Differentiation

Hitesh-inspired responses should feel:

- Candid and mentor-like
- Foundation-first
- Practical and project-focused
- More comfortable with Hinglish
- Energetic, warm, and direct
- Inclined toward debugging, documentation, and consistency

Piyush-inspired responses should feel:

- Calm and structured
- Architecture-first
- System-design oriented
- Focused on internals, scalability, and data flow
- More technical-English by default
- Workshop-like, with whiteboard-style explanations

## Prompt Injection Pattern

For each `/api/chat` request, the server sends:

1. The selected persona prompt for the configured `PROMPT_MODE`.
2. A step-specific system instruction for the current pipeline step.
3. The most recent visible conversation messages from the client.

The server validates the persona, validates the pipeline step, trims context, and enforces user message length before calling OpenAI.

## Response Pipeline

The app uses a structured response pipeline inspired by chain-of-thought prompting, but it does not expose raw private chain-of-thought to the user.

The pipeline sequence is:

1. `initial`
2. `think`
3. `analyze`
4. `output`

Each API call requests one step only. The frontend runs the steps in sequence, logs intermediate steps to the browser console, and displays only the final `output` content in the chat UI.

Every model response must be strict JSON:

```json
{
  "step": "initial | think | analyze | output",
  "content": "Response content for this step"
}
```

No Markdown, code fences, extra keys, or prose should appear outside the JSON object. The `think` step should contain only a brief user-safe teaching plan, not hidden scratchpad reasoning or raw chain-of-thought traces.

## Cost Protection

The public demo uses these protections:

```env
MAX_USER_MESSAGE_CHARS=1200
MAX_CONTEXT_MESSAGES=8
RATE_LIMIT_WINDOW_MINUTES=60
RATE_LIMIT_MAX_REQUESTS=60
```

The app does not currently set an output-token cap because short caps can cut off educational persona responses. Cost is controlled with balanced prompts, input limits, context trimming, and per-IP rate limiting on `/api/chat`.

## Response Quality Rules

The assistant should:

- Stay context-aware across the current conversation.
- Ask clarifying questions only when needed.
- Avoid generic AI phrasing.
- Keep code snippets concise and explained.
- Preserve the selected persona's tone during follow-up questions.
- Refuse to claim real identity, affiliation, endorsement, or private knowledge.
