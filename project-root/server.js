// server.js
import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config(); // Loads NFL_API_KEY from .env

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from /public (index.html, app.js, style.css)
app.use(express.static("public"));

app.get("/api/nfl-stats", async (req, res) => {
  try {
    const url =
      "https://api.sportsdata.io/v3/nfl/stats/json/PlayerSeasonStats/2025REG";

    const response = await fetch(url, {
      headers: {
        "Ocp-Apim-Subscription-Key": process.env.NFL_API_KEY,
      },
    });

    if (!response.ok) {
      console.error("SportsData API error:", response.status);
      return res.status(response.status).json({ error: "API error" });
    }

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
