const API_BASE = "https://digital-scoreboard-backend.onrender.com/api/scoreboard";
function verifyPass() {
    const passInput = document.getElementById("password-input").value;
    const pass = "admn@kmc123";


    if (passInput == pass) {
        document.getElementsByClassName('admin-login')[0].style.display = "none";
        document.getElementsByClassName('container')[0].style.display = "flex"
    }
    else{
        alert("wrong password, try again!")
        }
}
const gameState = {
    team1Score: 0, team2Score: 0,
    team1Fouls: 0, team2Fouls: 0,
    team1Name: "HOME TEAM", team2Name: "AWAY TEAM",
    period: 1, timeRemaining: 720,
    clockRunning: false
};

let clockInterval = null;

const elements = {
    team1Score: document.getElementById("team1-score"),
    team2Score: document.getElementById("team2-score"),
    team1Name: document.getElementById("team1-name"),
    team2Name: document.getElementById("team2-name"),
    periodDisplay: document.getElementById("period-display"),
    timeDisplay: document.getElementById("time-display"),
    team1FoulsDisplay: document.getElementById("team1-fouls-display"),
    team2FoulsDisplay: document.getElementById("team2-fouls-display"),
    clockControl: document.getElementById("clock-control"),
    statusText: document.getElementById("status-text"),
    minutesInput: document.getElementById("minutes-input"),
    secondsInput: document.getElementById("seconds-input"),
    log: document.getElementById("activity-log")
};


function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

function addLogEntry(msg) {
    elements.log.textContent = `[${new Date().toLocaleTimeString()}] ${msg}`;
}

function updateDisplays() {
    elements.team1Score.textContent = gameState.team1Score;
    elements.team2Score.textContent = gameState.team2Score;
    elements.team1Name.value = gameState.team1Name;
    elements.team2Name.value = gameState.team2Name;
    elements.periodDisplay.textContent = gameState.period;
    elements.timeDisplay.textContent = formatTime(gameState.timeRemaining);
    elements.team1FoulsDisplay.textContent = gameState.team1Fouls;
    elements.team2FoulsDisplay.textContent = gameState.team2Fouls;

    elements.minutesInput.value = Math.floor(gameState.timeRemaining / 60);
    elements.secondsInput.value = gameState.timeRemaining % 60;

    elements.timeDisplay.style.color = gameState.timeRemaining <= 10 ? "var(--danger)" : "var(--accent)";
}


async function sendUpdate() {
    const payload = {
        team1_name: gameState.team1Name,
        team2_name: gameState.team2Name,
        team1_score: gameState.team1Score,
        team2_score: gameState.team2Score,
        team1_fouls: gameState.team1Fouls,
        team2_fouls: gameState.team2Fouls,
        period: gameState.period,
        time_remaining: gameState.timeRemaining,
        clock_running: gameState.clockRunning,
    };

    try {
        const response = await fetch(`${API_BASE}/update/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });
        if (response.ok) elements.statusText.textContent = "LIVE CONNECTION";
    } catch (e) {
        elements.statusText.textContent = "OFFLINE";
    }
}

function startStopClock() {
    if (gameState.clockRunning) {

        clearInterval(clockInterval);
        gameState.clockRunning = false;
        elements.clockControl.innerHTML = '<i class="fas fa-play"></i> START CLOCK';
        elements.clockControl.style.background = "var(--success)";
        addLogEntry("Clock Paused");
    } else {

        gameState.clockRunning = true;
        elements.clockControl.innerHTML = '<i class="fas fa-pause"></i> PAUSE CLOCK';
        elements.clockControl.style.background = "var(--danger)";
        addLogEntry("Clock Started");

        clockInterval = setInterval(() => {
            if (gameState.timeRemaining > 0) {
                gameState.timeRemaining--;
                updateDisplays();

                sendUpdate();

            } else {

                clearInterval(clockInterval);
                gameState.clockRunning = false;
                updateDisplays();

                sendUpdate();
            }
        }, 1000);
    }

    sendUpdate();
}


document.querySelectorAll("[data-points]").forEach(btn => {
    btn.onclick = () => {
        const team = btn.dataset.team;
        const pts = parseInt(btn.dataset.points);
        if (team === 'team1') gameState.team1Score = Math.max(0, gameState.team1Score + pts);
        else gameState.team2Score = Math.max(0, gameState.team2Score + pts);
        updateDisplays();
        sendUpdate();
        addLogEntry(`Score Update: ${pts > 0 ? '+' : ''}${pts} points`);
    };
});

document.querySelectorAll("[data-action]").forEach(btn => {
    btn.onclick = () => {
        const action = btn.dataset.action;
        if (action === 'team1-foul') gameState.team1Fouls++;
        if (action === 'team2-foul') gameState.team2Fouls++;
        if (action === 'reset-fouls-team1') gameState.team1Fouls = 0;
        if (action === 'reset-fouls-team2') gameState.team2Fouls = 0;
        updateDisplays();
        sendUpdate();
    };
});

elements.clockControl.onclick = startStopClock;

document.getElementById("period-up").onclick = () => {
    gameState.period = (gameState.period % 4) + 1;
    updateDisplays();
    sendUpdate();
};

document.querySelectorAll(".btn-preset").forEach(btn => {
    btn.onclick = () => {
        gameState.timeRemaining = parseInt(btn.dataset.minutes) * 60;
        updateDisplays();
        sendUpdate();
    };
});

document.getElementById("full-reset").onclick = async () => {
    if (confirm("Full Game Reset?")) {
        gameState.team1Score = 0; gameState.team2Score = 0;
        gameState.team1Fouls = 0; gameState.team2Fouls = 0;
        gameState.timeRemaining = 720; gameState.period = 1;
        updateDisplays();
        await fetch(`${API_BASE}/reset/`, { method: "POST" });
        location.reload();
    }
};


elements.team1Name.onchange = (e) => { gameState.team1Name = e.target.value; sendUpdate(); };
elements.team2Name.onchange = (e) => { gameState.team2Name = e.target.value; sendUpdate(); };

const handleManualTime = () => {
    gameState.timeRemaining = (parseInt(elements.minutesInput.value) * 60) + parseInt(elements.secondsInput.value);
    updateDisplays();
};
elements.minutesInput.onchange = handleManualTime;
elements.secondsInput.onchange = handleManualTime;


updateDisplays();