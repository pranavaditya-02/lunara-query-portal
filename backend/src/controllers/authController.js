import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { pool } from "../config/db.js";
import { env } from "../config/env.js";

function validateCredentialField(value, fieldName) {
  if (typeof value !== "string") {
    return `${fieldName} must be a string`;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return `${fieldName} is required`;
  }

  if (trimmed.length > 64) {
    return `${fieldName} is too long`;
  }

  return null;
}

function getCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: env.nodeEnv === "production",
    maxAge: 8 * 60 * 60 * 1000,
    path: "/",
  };
}

export async function login(req, res) {
  const { username, password } = req.body;

  const usernameError = validateCredentialField(username, "Username");
  const passwordError = validateCredentialField(password, "Password");
  if (usernameError || passwordError) {
    return res.status(400).json({
      status: "error",
      message: usernameError || passwordError,
    });
  }

  try {
    const normalizedUsername = username.trim();

    const [rows] = await pool.query("SELECT id, username, password_hash FROM users WHERE username = ? LIMIT 1", [
      normalizedUsername,
    ]);

    if (rows.length === 0) {
      return res.status(401).json({
        status: "error",
        message: "Invalid username or password",
      });
    }

    const user = rows[0];
    const isValid = await bcrypt.compare(password, user.password_hash);

    if (!isValid) {
      return res.status(401).json({
        status: "error",
        message: "Invalid username or password",
      });
    }

    const token = jwt.sign(
      { userId: user.id, username: user.username },
      env.jwtSecret,
      { expiresIn: env.jwtExpiresIn }
    );

    res.cookie(env.authCookieName, token, getCookieOptions());

    return res.json({
      status: "success",
      message: "Login successful",
      user: { id: user.id, username: user.username },
    });
  } catch (_error) {
    return res.status(500).json({
      status: "error",
      message: "Authentication failed",
    });
  }
}

export async function me(req, res) {
  return res.json({
    status: "success",
    data: {
      userId: req.user.userId,
      username: req.user.username,
    },
  });
}

export async function logout(req, res) {
  res.clearCookie(env.authCookieName, {
    httpOnly: true,
    sameSite: "lax",
    secure: env.nodeEnv === "production",
    path: "/",
  });

  return res.json({ status: "success", message: "Logout successful" });
}
