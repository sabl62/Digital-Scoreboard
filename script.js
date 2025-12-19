const API_BASE = "http://127.0.0.1:8000/api/scoreboard";

let lastTime = 0;
let lastClockState = false;
let localTimeRemaining = 720;
let localClockRunning = false;
let clockInterval = null;

// Format time from seconds to MM:SS
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Start or stop local clock simulation
function syncLocalClock(isRunning, timeRemaining) {
    clearInterval(clockInterval);

    // Update local variables
    localTimeRemaining = timeRemaining;
    localClockRunning = isRunning;

    // Update display immediately
    document.getElementById("time").textContent = formatTime(timeRemaining);

    // Start local countdown if clock is running and time > 0
    if (isRunning && timeRemaining > 0) {
        clockInterval = setInterval(() => {
            if (localTimeRemaining > 0) {
                localTimeRemaining--;
                document.getElementById("time").textContent = formatTime(localTimeRemaining);

                // Flash red when under 10 seconds
                if (localTimeRemaining <= 10) {
                    document.getElementById("time").style.color = "#ff0000";
                    document.getElementById("time").style.animation = "pulse 0.5s infinite";
                }

                if (localTimeRemaining <= 0) {
                    clearInterval(clockInterval);
                    document.getElementById("time").textContent = "00:00";
                    updateClockStatus(false, 0);
                }
            }
        }, 1000);
    } else if (timeRemaining <= 0) {
        document.getElementById("time").textContent = "00:00";
    }

    updateClockStatus(isRunning, timeRemaining);
}

// Update bonus indicators
function updateBonusIndicators(fouls1, fouls2) {
    const team1Bonus = document.getElementById('team1Bonus');
    const team2Bonus = document.getElementById('team2Bonus');
    const team1Box = team1Bonus.parentElement;
    const team2Box = team2Bonus.parentElement;

    if (fouls1 >= 10) {
        team1Bonus.textContent = 'DOUBLE BONUS';
        team1Box.classList.add('active');
    } else if (fouls1 >= 5) {
        team1Bonus.textContent = 'BONUS';
        team1Box.classList.add('active');
    } else {
        team1Bonus.textContent = 'BONUS';
        team1Box.classList.remove('active');
    }

    if (fouls2 >= 10) {
        team2Bonus.textContent = 'DOUBLE BONUS';
        team2Box.classList.add('active');
    } else if (fouls2 >= 5) {
        team2Bonus.textContent = 'BONUS';
        team2Box.classList.add('active');
    } else {
        team2Bonus.textContent = 'BONUS';
        team2Box.classList.remove('active');
    }
}

// Update clock status display
function updateClockStatus(isRunning, timeRemaining) {
    const clockStatus = document.getElementById('clockStatus');
    const timeDisplay = document.getElementById('time');

    if (isRunning && timeRemaining > 0) {
        clockStatus.textContent = 'CLOCK RUNNING';
        clockStatus.style.color = '#00ff00';
        timeDisplay.classList.add('clock-running');
    } else if (timeRemaining <= 0) {
        clockStatus.textContent = 'TIME EXPIRED';
        clockStatus.style.color = '#ff0000';
        timeDisplay.classList.remove('clock-running');
        timeDisplay.style.color = '#ff0000';
    } else {
        clockStatus.textContent = 'CLOCK STOPPED';
        clockStatus.style.color = '#e94560';
        timeDisplay.classList.remove('clock-running');
        timeDisplay.style.color = ''; // Reset to default
        timeDisplay.style.animation = ''; // Reset animation
    }
}

async function loadScore() {
    try {
        const res = await fetch(`${API_BASE}/get/`);
        const data = await res.json();

        // Update team names and scores
        document.getElementById("t1Name").textContent = data.data.team1_name;
        document.getElementById("t2Name").textContent = data.data.team2_name;
        document.getElementById("t1Score").textContent = data.data.team1_score;
        document.getElementById("t2Score").textContent = data.data.team2_score;

        // Update fouls
        if (data.data.team1_fouls !== undefined) {
            document.getElementById("t1Fouls").textContent = data.data.team1_fouls;
        }
        if (data.data.team2_fouls !== undefined) {
            document.getElementById("t2Fouls").textContent = data.data.team2_fouls;
        }

        // Update period
        if (data.data.period !== undefined) {
            document.getElementById("period").textContent = data.data.period;
        }

        // Update time and clock - check if anything changed
        if (data.data.time_remaining !== undefined) {
            const timeChanged = data.data.time_remaining !== lastTime;
            const clockStateChanged = data.data.clock_running !== lastClockState;

            if (timeChanged || clockStateChanged) {
                lastTime = data.data.time_remaining;
                lastClockState = data.data.clock_running;
                syncLocalClock(data.data.clock_running, data.data.time_remaining);
            }
        }

        // Update bonus indicators
        if (data.data.team1_fouls !== undefined && data.data.team2_fouls !== undefined) {
            updateBonusIndicators(data.data.team1_fouls, data.data.team2_fouls);
        }

    } catch (error) {
        console.error("Error loading score:", error);
    }
}

// Load data immediately and then every second
setInterval(loadScore, 1000);
loadScore();