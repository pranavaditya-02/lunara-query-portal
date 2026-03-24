import bcrypt from "bcryptjs";
import mysql from "mysql2/promise";
import { pool } from "../config/db.js";
import { env } from "../config/env.js";

export async function initializeDatabase() {
  const bootstrapConnection = await mysql.createConnection({
    host: env.dbHost,
    port: env.dbPort,
    user: env.dbUser,
    password: env.dbPassword,
  });

  await bootstrapConnection.query(`CREATE DATABASE IF NOT EXISTS \`${env.dbName}\``);
  await bootstrapConnection.end();

  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT PRIMARY KEY AUTO_INCREMENT,
      username VARCHAR(64) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS queries (
      id INT PRIMARY KEY AUTO_INCREMENT,
      name VARCHAR(120) NOT NULL,
      query TEXT NOT NULL,
      answer TEXT,
      status ENUM('pending', 'resolved') NOT NULL DEFAULT 'pending',
      timestamp DATETIME NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  const [rows] = await pool.query("SELECT id, password_hash FROM users WHERE username = ? LIMIT 1", [
    env.adminUsername,
  ]);

  if (rows.length === 0) {
    const passwordHash = await bcrypt.hash(env.adminPassword, 10);
    await pool.query("INSERT INTO users (username, password_hash) VALUES (?, ?)", [
      env.adminUsername,
      passwordHash,
    ]);
    console.log("Seeded coordinator user:", env.adminUsername);
    return;
  }

  const user = rows[0];
  const passwordMatches = await bcrypt.compare(env.adminPassword, user.password_hash);

  if (!passwordMatches) {
    const newPasswordHash = await bcrypt.hash(env.adminPassword, 10);
    await pool.query("UPDATE users SET password_hash = ? WHERE id = ?", [newPasswordHash, user.id]);
    console.log("Synced coordinator password from .env for:", env.adminUsername);
  }
}
