import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/user.js";
import { inngest } from "../inngest/client.js";

export const signUp = async (req, res) => {
  const { email, password, skills = [] } = req.body;
  console.log("Signup request body:", req.body); // Log incoming data

  try {
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ email, password: hashed, skills });

    //Fire inngest event
    await inngest.send({
      name: "user/signup",
      data: {
        email,
      },
    });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET
    );

    res.json({ user, token });
  } catch (error) {
    res.status(500).json({ error: "Signup failed", details: error.message });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET
    );

    res.json({ user, token });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Login failed", details: error.message });
  }
};


export const logout = async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    if (!token) {
      res.status(401).json({ error: "Unauthorized" });
    }

    jwt.verify(token, process.env.JWT_SECRET, (error, decoded) => {
      if (error) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      res.json({ message: "Logout sucessfully" });
    });
  } catch (error) {
    res.status(500).json({ error: "Logout failed", details: error.message });
  }
};

export const updateUser = async (req, res) => {
  const { skills = [], role, email } = req.body;

  try {
    if (req.user?.role !== "admin") {
      return res.status(403).json({ error: "Forbidden" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "User not fount" });
    }

    await User.updateOne(
      { email },
      { skills: skills.length ? skills : user.skills, role }
    );

    return res.json({ message: "User update successfully" });
  } catch (error) {
    res.status(500).json({ error: "Update failed", details: error.message });
  }
};

export const getUsers = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Forbiddden" });
    }

    const users = await User.find().select("-password");
    return res.json({ users });
  } catch (error) {
    res.status(500).json({ error: "Get User failed", details: error.message });
  }
};
