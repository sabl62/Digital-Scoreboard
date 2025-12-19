const API_BASE = document.getElementById("apiUrl").value;

let team1Score = 0;
let team2Score = 0;
let team1Fouls = 0;
let team2Fouls = 0;
let period = 1;
let timeRemaining = 720; // Start with 12:00
let isClockRunning = false;
let clockInterval = null;

// Initialize time display
updateTimeDisplay();

function changeScore(team, value) {
    if (team === "team1") {
        team1Score = Math.max(0, team1Score + value);
        document.getElementById("team1Score").textContent = team1Score;
    } else {
        team2Score = Math.max(0, team2Score + value);
        document.getElementById("team2Score").textContent = team2Score;
    }
}

function changeFouls(team, value) {
    if (team === "team1") {
        team1Fouls = Math.max(0, team1Fouls + value);
        document.getElementById("team1Fouls").textContent = team1Fouls;
    } else {
        team2Fouls = Math.max(0, team2Fouls + value);
        document.getElementById("team2Fouls").textContent = team2Fouls;
    }
}

function resetFouls(team) {
    if (team === "team1") {
        team1Fouls = 0;
        document.getElementById("team1Fouls").textContent = team1Fouls;
    } else {
        team2Fouls = 0;
        document.getElementById("team2Fouls").textContent = team2Fouls;
    }
}

function changePeriod(value) {
    period = Math.max(1, period + value);
    document.getElementById("periodDisplay").textContent = period;
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function updateTimeDisplay() {
    document.getElementById("timeDisplay").textContent = formatTime(timeRemaining);
}

function setTime(seconds) {
    clearInterval(clockInterval);
    isClockRunning = false;
    timeRemaining = seconds;
    updateTimeDisplay();
    document.getElementById("startStopBtn").textContent = "▶ Start";

    // Update input fields
    document.getElementById("minutesInput").value = Math.floor(seconds / 60);
    document.getElementById("secondsInput").value = seconds % 60;
}

function setCustomMinutes(minutes) {
    setTime(minutes * 60);
}

function setCustomTime() {
    const minutes = parseInt(document.getElementById("minutesInput").value) || 0;
    const seconds = parseInt(document.getElementById("secondsInput").value) || 0;
    setTime((minutes * 60) + seconds);
}

function startStopClock() {
    if (isClockRunning) {
        // Pause the clock
        clearInterval(clockInterval);
        isClockRunning = false;
        document.getElementById("startStopBtn").textContent = "▶ Start";
        document.getElementById("timeDisplay").style.color = ""; // Reset color
        document.getElementById("timeDisplay").style.animation = ""; // Reset animation
    } else {
        // Start the clock
        isClockRunning = true;
        document.getElementById("startStopBtn").textContent = "⏸ Pause";

        clockInterval = setInterval(() => {
            if (timeRemaining > 0) {
                timeRemaining--;
                updateTimeDisplay();

                // Flash red when under 10 seconds
                if (timeRemaining <= 10) {
                    document.getElementById("timeDisplay").style.color = "#ff0000";
                    document.getElementById("timeDisplay").style.animation = "pulse 0.5s infinite";
                }

                if (timeRemaining <= 0) {
                    // Time's up
                    clearInterval(clockInterval);
                    isClockRunning = false;
                    document.getElementById("startStopBtn").textContent = "▶ Start";
                    document.getElementById("timeDisplay").textContent = "00:00";
                    showStatus("⏰ Time's up!");
                }
            }
        }, 1000);
    }

    // Immediately send update to sync clock state
    sendUpdate();
}

function resetClock() {
    clearInterval(clockInterval);
    isClockRunning = false;
    timeRemaining = 720; // Reset to 12:00
    updateTimeDisplay();
    document.getElementById("startStopBtn").textContent = "▶ Start";
    document.getElementById("timeDisplay").style.color = "";
    document.getElementById("timeDisplay").style.animation = "";

    // Reset input fields
    document.getElementById("minutesInput").value = 12;
    document.getElementById("secondsInput").value = 0;
}

async function sendUpdate() {
    const payload = {
        team1_name: document.getElementById("team1Name").value,
        team2_name: document.getElementById("team2Name").value,
        team1_score: team1Score,
        team2_score: team2Score,
        team1_fouls: team1Fouls,
        team2_fouls: team2Fouls,
        period: period,
        time_remaining: timeRemaining,
        clock_running: isClockRunning
    };

    console.log("Sending update:", payload); // Debug

    try {
        const response = await fetch(`${API_BASE}/update/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Update response:", data);
        showStatus("✅ Updated successfully");
    } catch (error) {
        console.error("Update error:", error);
        showStatus("❌ Update failed: " + error.message);
    }
}

async function resetScoreboard() {
    try {
        await fetch(`${API_BASE}/reset/`, { method: "POST" });
    } catch (error) {
        console.error("Reset error:", error);
    }

    // Reset all local values
    team1Score = team2Score = 0;
    team1Fouls = team2Fouls = 0;
    period = 1;

    // Update displays
    document.getElementById("team1Score").textContent = team1Score;
    document.getElementById("team2Score").textContent = team2Score;
    document.getElementById("team1Fouls").textContent = team1Fouls;
    document.getElementById("team2Fouls").textContent = team2Fouls;
    document.getElementById("periodDisplay").textContent = period;

    // Reset clock
    resetClock();

    showStatus("🔄 Scoreboard reset complete");
}

function showStatus(msg) {
    const s = document.getElementById("status");
    s.textContent = msg;
    setTimeout(() => s.textContent = "", 3000);
}

// Add CSS for pulse animation
document.head.insertAdjacentHTML('beforeend', `
<style>
@keyframes pulse {
    0% { opacity: 1; }
    50% { opacity: 0.5; }
    100% { opacity: 1; }
}
</style>
`);