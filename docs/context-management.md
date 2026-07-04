# Context Management Approach

The MVP uses client-held, session-level chat history. There is no database and no saved conversation history. Refreshing the page clears the chat.

## Current Strategy

For each user message, the browser keeps visible messages in memory and calls `/api/chat` through the pipeline steps:

1. `initial`
2. `think`
3. `analyze`
4. `output`

The browser logs intermediate steps with `console.debug`, but only the final `output` step is rendered as the assistant message.

For each backend request, the server:

1. Loads the selected persona prompt based on `PROMPT_MODE`.
2. Adds a step-specific system instruction.
3. Accepts recent user-visible messages from the client.
4. Trims context using `MAX_CONTEXT_MESSAGES`.
5. Rejects user messages above `MAX_USER_MESSAGE_CHARS`.
6. Returns one strict JSON step response.

## Stored State

The app stores only lightweight session state in the browser:

- Selected persona
- User-visible messages
- Final assistant outputs

The server does not store conversation history. Prompt files are cached in memory by `persona:promptMode` after first load.

## Limits

Default public-demo limits:

```env
MAX_USER_MESSAGE_CHARS=1200
MAX_CONTEXT_MESSAGES=8
RATE_LIMIT_WINDOW_MINUTES=60
RATE_LIMIT_MAX_REQUESTS=60
```

Rate limiting applies only to `/api/chat`, not the homepage or static assets. Since each user message currently triggers four pipeline calls, `60` step requests equals about `15` full user questions per hour per IP.

## Persona Switching

When the user switches personas, future responses use the newly selected persona. The visible chat can remain on screen, but the backend receives the currently selected persona on every request.

If persona drift becomes a problem, a later version can clear the chat automatically on persona switch.

## Future Improvements

Later versions can add:

- Conversation summaries for older context
- Optional saved conversations with a database
- Feedback ratings for persona quality
- Evaluation prompts to check style consistency
- A single-call pipeline mode for lower latency and cost
