const API_BASE =
  "https://digital-scoreboard-backend.onrender.com/api/scoreboard";

let localTime = 0;
let localClockRunning = false;
let localClockInterval = null;

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs
    .toString()
    .padStart(2, "0")}`;
}

let lastRendered = {
  period: null,
  time: null,
  team1Name: null,
  scoredByT1: null,
  scoredByT2: null,
  team1Score: null,
  team1Fouls: null,
  team2Name: null,
  team2Score: null,
  team2Fouls: null,
  clockStatus: null,
  team1Bonus: null,
  team2Bonus: null,
};

function updateDOM(data) {
  const period = document.getElementById("period");
  const time = document.getElementById("time");
  const t1Name = document.getElementById("t1Name");
  const t1Score = document.getElementById("t1Score");
  const t1Scorer = document.getElementById("scorer-name-t1");
  const t2Scorer = document.getElementById("scorer-name-t2");
  const t1Fouls = document.getElementById("t1Fouls");
  const t2Name = document.getElementById("t2Name");
  const t2Score = document.getElementById("t2Score");
  const t2Fouls = document.getElementById("t2Fouls");
  const statusEl = document.getElementById("clockStatus");
  const team1Bonus = document.getElementById("team1Bonus");
  const team2Bonus = document.getElementById("team2Bonus");

  requestAnimationFrame(() => {

    if (lastRendered.period !== data.period) {
      period.textContent = data.period;
      lastRendered.period = data.period;
    }

    const timeStr = formatTime(localTime);
    if (lastRendered.time !== timeStr) {
      time.textContent = timeStr;
      lastRendered.time = timeStr;
    }


    if (lastRendered.team1Name !== data.team1_name) {
      t1Name.textContent = data.team1_name;
      lastRendered.team1Name = data.team1_name;
    }
    if (lastRendered.team1Score !== data.team1_score) {
      t1Score.textContent = data.team1_score;
      lastRendered.team1Score = data.team1_score;
    }
    if (lastRendered.team1Fouls !== data.team1_fouls) {
      t1Fouls.textContent = data.team1_fouls;
      lastRendered.team1Fouls = data.team1_fouls;
    }

    if (lastRendered.team2Name !== data.team2_name) {
      t2Name.textContent = data.team2_name;
      lastRendered.team2Name = data.team2_name;
    }
    if (lastRendered.team2Score !== data.team2_score) {
      t2Score.textContent = data.team2_score;
      lastRendered.team2Score = data.team2_score;
    }
    if (lastRendered.team2Fouls !== data.team2_fouls) {
      t2Fouls.textContent = data.team2_fouls;
      lastRendered.team2Fouls = data.team2_fouls;
    }

    const t1ScorersJSON = JSON.stringify(data.team1_scorers || []);
    if (lastRendered.scoredByT1 !== t1ScorersJSON) {
      t1Scorer.innerHTML = (data.team1_scorers || [])
        .slice(-3)
        .map((s) => `<div class="scorer-entry">${s}</div>`)
        .join("");
      lastRendered.scoredByT1 = t1ScorersJSON;
    }

    const t2ScorersJSON = JSON.stringify(data.team2_scorers || []);
    if (lastRendered.scoredByT2 !== t2ScorersJSON) {
      t2Scorer.innerHTML = (data.team2_scorers || [])
        .slice(-3)
        .map((s) => `<div class="scorer-entry">${s}</div>`)
        .join("");
      lastRendered.scoredByT2 = t2ScorersJSON;
    }

    const clockStatusText = localClockRunning ? "CLOCK LIVE" : "CLOCK STOPPED";

    if (lastRendered.clockStatus !== clockStatusText) {
      statusEl.textContent = clockStatusText;

      statusEl.classList.toggle("running", localClockRunning);

      lastRendered.clockStatus = clockStatusText;
    }

    const t1BonusActive = data.team2_fouls >= 5;
    const t2BonusActive = data.team1_fouls >= 5;

    if (lastRendered.team1Bonus !== t1BonusActive) {
      team1Bonus.classList.toggle("active", t1BonusActive);
      lastRendered.team1Bonus = t1BonusActive;
    }
    if (lastRendered.team2Bonus !== t2BonusActive) {
      team2Bonus.classList.toggle("active", t2BonusActive);
      lastRendered.team2Bonus = t2BonusActive;
    }
  });
}


function startLocalClock() {
  if (localClockInterval) return;
  localClockInterval = setInterval(() => {
    if (localClockRunning && localTime > 0) {
      localTime--;
      const timeEl = document.getElementById("time");
      if (timeEl) timeEl.textContent = formatTime(localTime);
    }
  }, 1000);
}

function stopLocalClock() {
  if (localClockInterval) {
    clearInterval(localClockInterval);
    localClockInterval = null;
  }
}

async function updateScoreboard() {
  try {
    const response = await fetch(`${API_BASE}/get/`);
    const result = await response.json();
    const data = result.data;

    if (data) {
      const serverTime = data.time_remaining;
      const serverRunning = data.clock_running;
      if (
        localClockRunning !== serverRunning ||
        Math.abs(localTime - serverTime) > 2
      ) {
        localTime = serverTime;
      }

      localClockRunning = serverRunning;
      if (localClockRunning) startLocalClock();
      else stopLocalClock();

      updateDOM(data);
    }
  } catch (error) {
    console.error("Scoreboard sync error:", error);
  }
}

setInterval(updateScoreboard, 1000);
updateScoreboard();
