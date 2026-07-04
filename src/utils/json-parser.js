export function parseJsonResponse(rawResult) {
  if (!rawResult || typeof rawResult !== "string") {
    throw new Error("Model returned an empty response");
  }

  let cleaned = rawResult.trim();

  // Be forgiving of Markdown fences even though the system prompt asks for raw JSON;
  // this keeps one formatting slip from breaking the whole chat flow.
  if (cleaned.startsWith("```")) {
    cleaned = cleaned
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();
  }

  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");

  if (firstBrace !== -1 && lastBrace !== -1) {
    cleaned = cleaned.slice(firstBrace, lastBrace + 1);
  }

  return JSON.parse(cleaned);
}
