import { Router } from "express";

import { createChatStep } from "../controllers/chat.controller.js";

const router = Router();

router.post("/", createChatStep);

export default router;
