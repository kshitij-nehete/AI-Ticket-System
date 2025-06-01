import express from "express";
import {
  getUsers,
  login,
  logout,
  signUp,
  updateUser,
} from "../controllers/user.js";
import { authenticate } from "../middlewares/auth.js";

const router = express.Router();

router.post("/update-user", authenticate, updateUser);
router.post("/users", authenticate, getUsers);

router.post("/signup", signUp);
router.post("/login", login);

router.post("/logout", logout);

export default router;
