import dotenv from "dotenv";

dotenv.config({ quiet: true });

const DEFAULT_PROMPT_MODE = "balanced";
const PROMPT_MODES = new Set(["runtime", "balanced", "full"]);

function readNumber(name, fallback) {
  const rawValue = Number(process.env[name]);
  return Number.isFinite(rawValue) && rawValue > 0 ? rawValue : fallback;
}

function readPromptMode() {
  const promptMode = process.env.PROMPT_MODE || DEFAULT_PROMPT_MODE;
  return PROMPT_MODES.has(promptMode) ? promptMode : DEFAULT_PROMPT_MODE;
}

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 3000),
  openaiApiKey: process.env.OPENAI_API_KEY,
  openaiModel: process.env.OPENAI_MODEL || "gpt-4o-mini",
  promptMode: readPromptMode(),
  maxUserMessageChars: readNumber("MAX_USER_MESSAGE_CHARS", 1200),
  maxContextMessages: readNumber("MAX_CONTEXT_MESSAGES", 8),
  rateLimitWindowMinutes: readNumber("RATE_LIMIT_WINDOW_MINUTES", 60),
  rateLimitMaxRequests: readNumber("RATE_LIMIT_MAX_REQUESTS", 60),
};
