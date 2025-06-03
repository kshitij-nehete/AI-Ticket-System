import express from "express";
import { authenticate } from "../middlewares/auth.js";
import { createTicket, getTicket, getTickets } from "../controllers/ticket.js";

const router = express.router();

router.get("/", authenticate, getTickets);
router.get("/:id", authenticate, getTicket);
router.get("/", authenticate, createTicket);

export default router;
