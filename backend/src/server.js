import app from "./app.js";
import { env } from "./config/env.js";
import { initializeDatabase } from "./services/initDb.js";

async function startServer() {
  try {
    await initializeDatabase();

    app.listen(env.port, () => {
      console.log(`API running on http://localhost:${env.port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
}

startServer();
