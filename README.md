**Final Project – CSCI Web Development**

This project is a full-stack web application that allows users to:

- Search NFL players
- Compare two players head-to-head on major stats
- Draft players to a personal fantasy roster
- View projected PPR fantasy points calculated client-side

The app uses live NFL player data from a third-party API and serves it securely through a custom Node/Express backend.

**Features:**

Player Search
- Search any NFL player from the 2025 Regular Season
- Shows player name, team, position
- Includes key offensive stats
- Automatically calculates fantasy PPR projected points

Head-to-Head Comparison
- Select up to two players
- Category-by-category stat comparison
- Green/red highlighting for winners/losers in each stat
- Smooth scrolling to comparison section

Fantasy Roster Builder
- Add/remove players to your roster
- Auto-updates total projected fantasy points
- Prevents adding duplicate players
- Uses LocalStorage caching for fast repeat loading

**Tech Stack**

Frontend:

- HTML / CSS
- JavaScript

Backend:

- Node.js
- Express.js
- node-fetch
- dotenv for secure API keys
- Custom /api/nfl-stats endpoint

External API:
SportsData.io – NFL Player Season Stats (2025REG)
Authentication handled server-side using .env

Running the Project Yourself:

git clone https://github.com/OlinLe/Web-Dev-Final-Project.git

cd Web-Dev-Final-Project/project-root

npm install

npm start 

(Make sure to create a .env file in project-root/ with: "NFL_API_KEY=your_api_key_here")
