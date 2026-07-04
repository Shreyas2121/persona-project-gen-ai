import fs from "fs/promises";
import path from "path";

import { env } from "../config/env.js";
import { PERSONAS } from "../constants/personas.js";
import { ApiError } from "../utils/api-error.js";

const promptCache = new Map();

export function assertValidPersona(persona) {
  if (!persona || !PERSONAS[persona]) {
    throw new ApiError(400, "Invalid persona. Use 'hitesh' or 'piyush'.");
  }
}

function getPromptFile(persona) {
  if (env.promptMode === "full") {
    return `${persona}.md`;
  }

  return `${persona}.${env.promptMode}.md`;
}

export async function getPersonaPrompt(persona) {
  assertValidPersona(persona);

  const cacheKey = `${persona}:${env.promptMode}`;

  if (promptCache.has(cacheKey)) {
    return promptCache.get(cacheKey);
  }

  const promptPath = path.join(
    process.cwd(),
    "src",
    "personas",
    getPromptFile(persona),
  );

  const prompt = await fs.readFile(promptPath, "utf8");
  const finalPrompt = `${prompt}\n\nYou must respond with a valid JSON object only. Do not use Markdown code fences.`;

  promptCache.set(cacheKey, finalPrompt);
  return finalPrompt;
}
