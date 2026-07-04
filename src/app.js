import express from "express";
import rateLimit from "express-rate-limit";
import path from "path";

import { env } from "./config/env.js";
import chatRoutes from "./routes/chat.routes.js";
import pageRoutes from "./routes/page.routes.js";

const app = express();

const chatRateLimiter = rateLimit({
  windowMs: env.rateLimitWindowMinutes * 60 * 1000,
  limit: env.rateLimitMaxRequests,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error:
      "This public demo has reached its usage limit for now. Please wait a bit and try again.",
  },
});

app.set("view engine", "ejs");
app.set("views", path.join(process.cwd(), "views"));

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(process.cwd(), "public")));

app.use(pageRoutes);
app.use("/api/chat", chatRateLimiter, chatRoutes);

app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.use((error, req, res, next) => {
  const statusCode = error.statusCode || error.status || 500;

  if (statusCode === 500) {
    console.error(error);
  }

  let message = error.message || "Something went wrong.";

  if (statusCode === 401) {
    message = "OpenAI API key is missing or invalid. Please check the server environment variables.";
  } else if (statusCode === 429) {
    message = "The AI service is rate-limited or out of quota right now. Please try again later.";
  } else if (statusCode >= 500) {
    message = "The AI service had trouble responding. Please try again in a moment.";
  }

  res.status(statusCode).json({ error: message });
});

export default app;
