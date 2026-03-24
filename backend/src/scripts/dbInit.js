import { initializeDatabase } from "../services/initDb.js";

initializeDatabase()
  .then(() => {
    console.log("Database and tables are ready.");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Failed to initialize database:", error.message);
    process.exit(1);
  });
