import express from "express";
import cors from "cors";
import fetch from "node-fetch"; // Ensure you have node-fetch 
import process from "process";

const app = express();
const PORT = process.env.PORT || 3000;

// Replace this with your Google Apps Script Web App URL
const GOOGLE_SHEET_API_URL = "YOUR_APPS_SCRIPT_WEB_APP_URL";

app.use(cors());
app.use(express.json()); // Middleware to parse JSON

// Route to add a query to Google Sheets
app.post("/add-query", async (req, res) => {
  try {
    const { name, question } = req.body;
    if (!name || !question) {
      return res.status(400).json({ success: false, message: "Name and question are required." });
    }

    console.log("Sending request to Google Apps Script:", { name, question });

    const response = await fetch(GOOGLE_SHEET_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "addQuery", name, question })
    });

    if (!response.ok) {
      throw new Error(`Google Apps Script Error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    console.log("Response from Google Apps Script:", result);
    res.json({ success: true, message: result.message });
  } catch (error) {
    console.error("Error adding query:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
