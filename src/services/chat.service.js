import { env } from "../config/env.js";
import { openai } from "../config/openai.js";
import { PIPELINE_STEPS } from "../constants/pipeline.js";
import { ApiError } from "../utils/api-error.js";
import { parseJsonResponse } from "../utils/json-parser.js";
import { getPersonaPrompt } from "./persona.service.js";

const ALLOWED_MESSAGE_ROLES = new Set(["user", "assistant"]);

function assertValidStep(step) {
  if (!PIPELINE_STEPS.includes(step)) {
    throw new ApiError(
      400,
      `Invalid step. Use one of: ${PIPELINE_STEPS.join(", ")}.`,
    );
  }
}

function assertUserMessageLength(message) {
  if (
    message.role === "user" &&
    message.content.length > env.maxUserMessageChars
  ) {
    throw new ApiError(
      400,
      `Message is too long. Please keep it under ${env.maxUserMessageChars} characters.`,
    );
  }
}

function normalizeMessages(messages) {
  if (!Array.isArray(messages) || messages.length === 0) {
    throw new ApiError(400, "messages must be a non-empty array.");
  }

  return messages
    .filter((message) => message && ALLOWED_MESSAGE_ROLES.has(message.role))
    .map((message) => ({
      role: message.role,
      content: String(message.content || "").trim(),
    }))
    .filter((message) => message.content.length > 0)
    .map((message) => {
      assertUserMessageLength(message);
      return message;
    })
    .slice(-env.maxContextMessages);
}

function buildStepInstruction(step) {
  return {
    role: "system",
    content: [
      `Current pipeline step: ${step}.`,
      `Return exactly this step value: ${step}.`,
      "Return one strict JSON object with only 'step' and 'content'.",
      "Do not continue to the next pipeline step in this response.",
    ].join(" "),
  };
}

function validateModelResult(result, expectedStep) {
  if (!result || typeof result !== "object") {
    throw new ApiError(502, "Model returned invalid JSON.");
  }

  if (typeof result.content !== "string") {
    throw new ApiError(502, "Model JSON must include a string content field.");
  }

  return {
    step: expectedStep,
    content: result.content,
  };
}

export async function runPersonaStep({ persona, messages, step }) {
  assertValidStep(step);

  const personaPrompt = await getPersonaPrompt(persona);
  const normalizedMessages = normalizeMessages(messages);

  const response = await openai.chat.completions.create({
    model: env.openaiModel,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: personaPrompt },
      buildStepInstruction(step),
      ...normalizedMessages,
    ],
  });

  const rawResult = response.choices[0]?.message?.content;
  const parsedResult = parseJsonResponse(rawResult);

  return validateModelResult(parsedResult, step);
}
