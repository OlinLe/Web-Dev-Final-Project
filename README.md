Final Project - CSCI Web Development

This project is a full-stack web application that allows users to search NFL players, compare two players head-to-head on key statistics, and draft players into a personal fantasy roster with projected PPR fantasy points.
The application integrates a real NFL statistics API, served securely through a custom Express backend.

Features:

Player Search
- Search any NFL player from the 2025 Regular Season.
- Displays team, position, key stats, and projected fantasy points.

Head-to-Head Comparison
- Select two players to compare.
- Stats show green/red indicators for which player performed better.
- Smooth scroll into comparison view.

Fantasy Roster Builder
- Add any player to your roster.
- Shows roster count and total projected fantasy points.
- Remove players individually.
- Automatically caches player data to improve performance.

Tech Stack

Frontend: 
HTML / CSS / JavaScript
LocalStorage caching

Backend:
Node.js
Express.js
node-fetch
dotenv

External API:
SportsData.io (NFL Stats 2025 Regular Season)
