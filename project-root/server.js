// Basic Express server for the NFL stats app
import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";

// Load API key from .env
dotenv.config();


// Start express app
const app = express();
const PORT = process.env.PORT || 3000;

// Serve the frontend (index.html, CSS, JS)
app.use(express.static("public"));

// Route to fetch NFL season stats from SportsData API
app.get("/api/nfl-stats", async (req, res) => {
  try {
    // API endpoint for 2025 regular season stats
    const url =
      "https://api.sportsdata.io/v3/nfl/stats/json/PlayerSeasonStats/2025REG";

    // Call external API with our key
    const response = await fetch(url, {
      headers: {
        "Ocp-Apim-Subscription-Key": process.env.NFL_API_KEY,
      },
    });

    // If API returns an error
    if (!response.ok) {
      console.error("SportsData API error:", response.status);
      return res.status(response.status).json({ error: "API error" });
    }

    // Send data back to the client
    const data = await response.json();
    res.json(data);
  } catch (err) {
    // Server error handling
    console.error("Server error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
