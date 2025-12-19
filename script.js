// API Configuration (Untouched as requested)
const API_BASE = "https://digital-scoreboard-backend-git-c3d739-sabal-bajagains-projects.vercel.app/api/scoreboard/get";

// This function syncs the UI with your backend data
async function updateScoreboard() {
    try {
        const response = await fetch(`${API_BASE}/get/`);
        const result = await response.json();
        const data = result.data;

        if (data) {
            // Update Text Content
            document.getElementById('period').textContent = data.period;
            document.getElementById('time').textContent = formatTime(data.time_remaining);

            document.getElementById('t1Name').textContent = data.team1_name;
            document.getElementById('t1Score').textContent = data.team1_score;
            document.getElementById('t1Fouls').textContent = data.team1_fouls;

            document.getElementById('t2Name').textContent = data.team2_name;
            document.getElementById('t2Score').textContent = data.team2_score;
            document.getElementById('t2Fouls').textContent = data.team2_fouls;

            // Update Clock Status Visuals
            const statusEl = document.getElementById('clockStatus');
            if (data.clock_running) {
                statusEl.textContent = "CLOCK LIVE";
                statusEl.classList.add('running');
            } else {
                statusEl.textContent = "CLOCK STOPPED";
                statusEl.classList.remove('running');
            }

            // Bonus Logic (Assuming 5 fouls = bonus)
            document.getElementById('team1Bonus').classList.toggle('active', data.team1_fouls >= 5);
            document.getElementById('team2Bonus').classList.toggle('active', data.team2_fouls >= 5);
        }
    } catch (error) {
        console.error("Connection lost:", error);
    }
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Poll every 1 second for live updates
setInterval(updateScoreboard, 1000);
updateScoreboard();