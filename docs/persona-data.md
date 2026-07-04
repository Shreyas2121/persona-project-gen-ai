# Persona Data Collection and Preparation

This project uses persona prompts inspired by publicly available teaching content from Hitesh Choudhary and Piyush Garg. The goal is not to impersonate either person, but to create an AI mentor experience that reflects visible public communication patterns, teaching approach, and technical focus.

## Source Categories

The persona notes were prepared from public content categories such as:

- YouTube videos, tutorials, and technical explanations
- Public talks, workshops, and teaching clips
- Official/personal websites
- Public social posts from platforms such as X
- Personal observation of their public teaching style

Reference websites:

- https://hitesh.ai/
- https://www.piyushgarg.dev/

## Preparation Workflow

1. Public YouTube-related observations were summarized with Gemini.
2. Public X/social-post observations were summarized with Grok.
3. The extracted notes were combined and normalized with ChatGPT.
4. The combined drafts were manually reviewed against personal familiarity with their public teaching styles.
5. Long-form reference persona files were organized into style, tone, teaching behavior, technical preferences, examples, and boundaries.
6. Compact runtime prompts were created for speed and cost.
7. Balanced prompts were created as the recommended default for better persona accuracy without sending the full reference files.

## What Was Extracted

The preparation focused on public, repeatable communication signals:

- Common teaching patterns
- Preferred technical domains
- Response structure
- Tone and language behavior
- Use of Hinglish or English
- Typical analogies and explanation style
- Project and production-readiness emphasis
- Safety boundaries to avoid misleading impersonation

No private conversations, unpublished opinions, personal relationships, or non-public claims are used.

## Resulting Files

- `src/personas/hitesh.md`: long-form reference prompt and research summary
- `src/personas/piyush.md`: long-form reference prompt and research summary
- `src/personas/hitesh.runtime.md`: fastest compact prompt
- `src/personas/piyush.runtime.md`: fastest compact prompt
- `src/personas/hitesh.balanced.md`: recommended default prompt for the app
- `src/personas/piyush.balanced.md`: recommended default prompt for the app

## Ethical Boundary

The chatbot must clearly behave as an AI mentor inspired by public teaching styles. It must not claim to be Hitesh Choudhary or Piyush Garg, speak on their behalf, imply endorsement, or invent private experiences.
