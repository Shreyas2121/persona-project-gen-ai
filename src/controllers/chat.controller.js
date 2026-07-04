import { runPersonaStep } from "../services/chat.service.js";

export async function createChatStep(req, res, next) {
  try {
    const { persona, messages, step = "initial" } = req.body;
    const result = await runPersonaStep({ persona, messages, step });

    res.json(result);
  } catch (error) {
    next(error);
  }
}
