import { Router } from "express";

import { PERSONAS } from "../constants/personas.js";

const router = Router();

router.get("/", (req, res) => {
  res.render("index", {
    personas: Object.values(PERSONAS),
  });
});

export default router;
