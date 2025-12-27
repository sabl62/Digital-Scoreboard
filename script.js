const API_BASE = "https://digital-scoreboard-backend.onrender.com/api/scoreboard";


let localTime = 0;
let localClockRunning = false;
let localClockInterval = null;

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
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
    team2Bonus: null
};

function updateDOM(data) {
    const period = document.getElementById('period');
    const time = document.getElementById('time');
    const t1Name = document.getElementById('t1Name');
    const t1Score = document.getElementById('t1Score');
    const t1Scorer = document.getElementById('scorer-name-t1')
    const t2Scorer = document.getElementById('scorer-name-t2')
    const t1Fouls = document.getElementById('t1Fouls');
    const t2Name = document.getElementById('t2Name');
    const t2Score = document.getElementById('t2Score');
    const t2Fouls = document.getElementById('t2Fouls');
    const statusEl = document.getElementById('clockStatus');
    const team1Bonus = document.getElementById('team1Bonus');
    const team2Bonus = document.getElementById('team2Bonus');

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

        if (lastRendered.scoredByT1 !== data.scored_by_t1){
            t1Scorer.textContent = data.scored_by_t1;
            lastRendered.scoredByT1 = data.scored_by_t1;
        }

        if (lastRendered.scoredByT1 !== data.scored_by_t1){
            t2Scorer.textContent = data.scored_by_t2;
            lastRendered.scoredByT1 = data.scored_by_t2;
        }

        const clockStatus = localClockRunning ? "CLOCK LIVE" : "CLOCK STOPPED";
        if (lastRendered.clockStatus !== clockStatus) {
            statusEl.textContent = clockStatus;
            if (localClockRunning) {
                statusEl.classList.add('running');
            } else {
                statusEl.classList.remove('running');
            }
            lastRendered.clockStatus = clockStatus;
        }

        const team1BonusActive = data.team2_fouls >= 5;
        const team2BonusActive = data.team1_fouls >= 5;

        if (lastRendered.team1Bonus !== team1BonusActive) {
            team1Bonus.classList.toggle('active', team1BonusActive);
            lastRendered.team1Bonus = team1BonusActive;
        }

        if (lastRendered.team2Bonus !== team2BonusActive) {
            team2Bonus.classList.toggle('active', team2BonusActive);
            lastRendered.team2Bonus = team2BonusActive;
        }
    });
}


function startLocalClock() {
    if (localClockInterval) return;

    localClockInterval = setInterval(() => {
        if (localClockRunning && localTime > 0) {
            localTime--;
            const time = document.getElementById('time');
            if (time) {
                requestAnimationFrame(() => {
                    time.textContent = formatTime(localTime);
                });
            }
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
     
            const clockStateChanged = localClockRunning !== data.clock_running;

            localClockRunning = data.clock_running;

            if (clockStateChanged || !localClockRunning || Math.abs(localTime - data.time_remaining) > 2) {
                localTime = data.time_remaining;
            }

            if (localClockRunning) {
                startLocalClock();
            } else {
                stopLocalClock();
            }

            
            updateDOM(data);
        }
    } catch (error) {
        console.error("Connection error:", error);
    }
}


let pollInterval = setInterval(updateScoreboard, 1000);


document.addEventListener('visibilitychange', () => {
    clearInterval(pollInterval);
    if (document.hidden) {
        pollInterval = setInterval(updateScoreboard, 3000);
    } else {
        pollInterval = setInterval(updateScoreboard, 1000);
        updateScoreboard();
    }
});

updateScoreboard();
startLocalClock();