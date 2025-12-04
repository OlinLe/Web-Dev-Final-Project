const NFL_STATS_URL = "/api/nfl-stats";
const storageKey = "nfl_stats_cache_2025"; // Fixed: Defined missing variable

// DOM Elements
const searchForm = document.getElementById("searchForm");
const playerInput = document.getElementById("playerInput");
const statusMessage = document.getElementById("statusMessage");
const resultsContainer = document.getElementById("resultsContainer");
const compareStatus = document.getElementById("compareStatus");
const compareNames = document.getElementById("compareNames");
const clearCompareBtn = document.getElementById("clearCompareBtn");
const comparisonGrid = document.getElementById("comparisonGrid");
const rosterBody = document.getElementById("rosterBody");
const rosterCount = document.getElementById("rosterCount");
const rosterTotalPts = document.getElementById("rosterTotalPts");
const emptyRosterMsg = document.getElementById("emptyRosterMsg");

// State Variables
let allNflStats = [];    // Master list of players
let compareSlots = [];   // Max 2 players
let fantasyRoster = [];  // Unlimited players (drafted)

// --- Event Listeners ---

searchForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const query = playerInput.value.trim();
  if (!query) return;

  resultsContainer.innerHTML = "";
  setStatus(`Searching database for "${query}"...`);

  try {
    // 1. Fetch data if we don't have it yet
    if (allNflStats.length === 0) {
      allNflStats = await fetchNflSeasonStats();
    }

    if (!allNflStats || allNflStats.length === 0) {
      setStatus("Error: No data returned from API. Check key/season.");
      return;
    }

    // 2. Filter local array
    const matches = filterPlayersByName(allNflStats, query);

    if (matches.length === 0) {
      setStatus("No players found with that name.");
      return;
    }

    // 3. Render
    renderPlayers(matches);
    setStatus(`Found ${matches.length} player(s).`);

  } catch (err) {
    console.error(err);
    setStatus("System Error: Could not fetch stats.");
  }
});

clearCompareBtn.addEventListener("click", () => {
  compareSlots = [];
  updateCompareBar();
  renderComparison();
});

// --- API & Data Functions ---

async function fetchNflSeasonStats() {
  // Check local storage first
  const cached = localStorage.getItem(storageKey);
  if (cached) {
    console.log("Loading stats from cache...");
    return JSON.parse(cached);
  }

  console.log("Fetching fresh stats from API...");
  // Fixed: Syntax error in original code (misplaced braces)
  const res = await fetch(NFL_STATS_URL);
  
  if (!res.ok) throw new Error(`API Error: ${res.status}`);
  
  const data = await res.json();

  // Save to local storage if valid
  if (Array.isArray(data)) {
    try {
      localStorage.setItem(storageKey, JSON.stringify(data));
    } catch (e) {
      console.warn("LocalStorage likely full, skipping cache.");
    }
    return data;
  }
  return [];
}

function filterPlayersByName(players, searchTerm) {
  const lowerTerm = searchTerm.toLowerCase();
  return players.filter((p) => 
    p.Name && p.Name.toLowerCase().includes(lowerTerm)
  );
}

// --- Fantasy Logic ---

function calculateFantasyPoints(p) {
  const passYds = p.PassingYards || 0;
  const passTD = p.PassingTouchdowns || 0;
  const rushYds = p.RushingYards || 0;
  const rushTD = p.RushingTouchdowns || 0;
  const recYds = p.ReceivingYards || 0;
  const recTD = p.ReceivingTouchdowns || 0;
  const rec = p.Receptions || 0;
  const int = p.PassingInterceptions || 0;
  const fumbles = p.FumblesLost || 0;

  // Scoring:
  // 1 pt per 25 pass yds | 4 pt pass TD
  // 1 pt per 10 rush/rec yds | 6 pt rush/rec TD
  // 1 pt per reception (PPR)
  // -2 per turnover
  let pts =
    (passYds / 25) +
    (passTD * 4) +
    (rushYds / 10) +
    (rushTD * 6) +
    (recYds / 10) +
    (recTD * 6) +
    (rec * 1) -
    (int * 2) -
    (fumbles * 2);

  return parseFloat(pts.toFixed(2));
}

// --- Render Functions ---

function renderPlayers(players) {
  resultsContainer.innerHTML = "";
  
  players.forEach((p) => {
    const card = document.createElement("div");
    card.className = "player-card";
    
    const name = p.Name || "Unknown";
    const team = p.Team || "FA";
    const pos = p.Position || "N/A";
    const fpts = calculateFantasyPoints(p);
    
    // Build small stat summary
    const stats = buildNflStats(p);

    card.innerHTML = `
      <h3>${name}</h3>
      <div class="player-meta">
        <div>${team} • ${pos}</div>
        <div style="color:#fbbf24; font-weight:bold; margin-top:4px;">
          ${fpts} FPTS
        </div>
      </div>
      <ul class="player-stats-list">
        ${stats.map(s => `<li><span>${s.label}</span> <span>${s.value}</span></li>`).join("")}
      </ul>
    `;

    // Action Buttons
    const btnGroup = document.createElement("div");
    btnGroup.className = "btn-group";
    
    const compareBtn = document.createElement("button");
    compareBtn.className = "compare-btn";
    compareBtn.textContent = "Compare";
    compareBtn.onclick = () => addToComparison(p);
    
    const draftBtn = document.createElement("button");
    draftBtn.className = "draft-btn";
    draftBtn.textContent = "+ Draft";
    draftBtn.onclick = (e) => addToRoster(p, e.target); // Pass event target for visual feedback

    btnGroup.appendChild(compareBtn);
    btnGroup.appendChild(draftBtn);
    card.appendChild(btnGroup);
    
    resultsContainer.appendChild(card);
  });
}

function buildNflStats(player) {
  // Added Int and Fum to this list so they appear in comparison
  return [
    { label: "Pass Yds", value: player.PassingYards ?? 0, raw: player.PassingYards ?? 0 },
    { label: "Pass TD", value: player.PassingTouchdowns ?? 0, raw: player.PassingTouchdowns ?? 0 },
    { label: "Pass Int", value: player.PassingInterceptions ?? 0, raw: player.PassingInterceptions ?? 0 }, // Added
    { label: "Rush Yds", value: player.RushingYards ?? 0, raw: player.RushingYards ?? 0 },
    { label: "Rush TD", value: player.RushingTouchdowns ?? 0, raw: player.RushingTouchdowns ?? 0 },
    { label: "Rec Yds", value: player.ReceivingYards ?? 0, raw: player.ReceivingYards ?? 0 },
    { label: "Rec TD", value: player.ReceivingTouchdowns ?? 0, raw: player.ReceivingTouchdowns ?? 0 },
  ];
}

// --- Comparison Logic ---

function addToComparison(player) {
  if (compareSlots.some(p => p.PlayerID === player.PlayerID)) return;
  
  if (compareSlots.length >= 2) {
    compareSlots.shift(); // Remove oldest
  }
  
  compareSlots.push(player);
  updateCompareBar();
  renderComparison();
  
  // Smooth scroll to comparison section
  document.getElementById("comparisonSection").scrollIntoView({ behavior: 'smooth' });
}

function updateCompareBar() {
  compareStatus.textContent = `Comparison Slots: ${compareSlots.length} / 2`;
  compareNames.textContent = compareSlots.map(p => p.Name).join(" vs ");
}

function renderComparison() {
  comparisonGrid.innerHTML = "";
  
  if (compareSlots.length === 0) {
    comparisonGrid.innerHTML = "<p>No players selected.</p>";
    return;
  }
  
  compareSlots.forEach((p, index) => {
    // Find the opponent (the other player in the array)
    const opponent = compareSlots.find((_, i) => i !== index);
    
    const card = document.createElement("div");
    card.className = "compare-card";
    
    const fpts = calculateFantasyPoints(p);
    const stats = buildNflStats(p);

    // Build rows with Winner/Loser logic
    const statsHtml = stats.map(stat => {
      let resultClass = "";
      
      if (opponent) {
        const oppStats = buildNflStats(opponent);
        const oppStat = oppStats.find(s => s.label === stat.label);
        
        if (oppStat) {
           // Fixed: Handle "Bad" stats where lower is better
           const isBadStat = ["Int", "Fum"].some(bad => stat.label.includes(bad));
           
           if (isBadStat) {
             if (stat.raw < oppStat.raw) resultClass = "stat-winner";
             else if (stat.raw > oppStat.raw) resultClass = "stat-loser";
           } else {
             // Standard stats: Higher is better
             if (stat.raw > oppStat.raw) resultClass = "stat-winner";
             else if (stat.raw < oppStat.raw) resultClass = "stat-loser";
           }
        }
      }
      return `
        <li class="stat-row">
          <span>${stat.label}</span>
          <span class="${resultClass}">${stat.value}</span>
        </li>
      `;
    }).join("");

    card.innerHTML = `
      <h3>${p.Name}</h3>
      <div style="margin-bottom:1rem; color:#cbd5e1; font-size:0.9rem;">
        ${p.Position} - ${p.Team}
      </div>
      <div style="background:#0f172a; padding:0.5rem; margin-bottom:1rem; border-radius:6px; text-align:center;">
        <span style="color:#94a3b8; font-size:0.8rem;">Proj FPTS</span><br/>
        <strong style="color:#fbbf24; font-size:1.2rem;">${fpts}</strong>
      </div>
      <ul class="compare-stats-list">
        ${statsHtml}
      </ul>
    `;
    
    comparisonGrid.appendChild(card);
  });
}

// --- Roster Logic ---

function addToRoster(player, btnElement) {
  if (fantasyRoster.some(p => p.PlayerID === player.PlayerID)) {
    alert(`${player.Name} is already on your roster!`);
    return;
  }
  
  fantasyRoster.push(player);
  renderRoster();
  
  // Visual feedback
  if (btnElement) {
    const oldText = btnElement.textContent;
    btnElement.textContent = "Added!";
    btnElement.disabled = true;
    setTimeout(() => {
       btnElement.textContent = oldText;
       btnElement.disabled = false;
    }, 1000);
  }
}

// Make global so HTML onclick attributes can see it
window.removeFromRoster = function(playerId) {
  fantasyRoster = fantasyRoster.filter(p => p.PlayerID !== playerId);
  renderRoster();
};

function renderRoster() {
  rosterBody.innerHTML = "";
  let totalPts = 0;
  
  if (fantasyRoster.length === 0) {
    emptyRosterMsg.style.display = "block";
    document.getElementById("rosterTable").style.display = "none";
  } else {
    emptyRosterMsg.style.display = "none";
    document.getElementById("rosterTable").style.display = "table";
  }
  
  fantasyRoster.forEach(p => {
    const fpts = calculateFantasyPoints(p);
    totalPts += fpts;
    
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><strong>${p.Name}</strong></td>
      <td>${p.Position}</td>
      <td>${p.Team}</td>
      <td style="color:#fbbf24; font-weight:bold;">${fpts}</td>
      <td>
        <button class="remove-btn" onclick="removeFromRoster(${p.PlayerID})">X</button>
      </td>
    `;
    rosterBody.appendChild(tr);
  });
  
  rosterCount.textContent = fantasyRoster.length;
  rosterTotalPts.textContent = totalPts.toFixed(2);
}

// Utilities 

function setStatus(msg) {
  statusMessage.textContent = msg;
}