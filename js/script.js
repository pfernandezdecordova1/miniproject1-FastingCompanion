const FAST_DURATIONS_MS = {
    1: 24 * 60 * 60 * 1000,
    2: 2 * 24 * 60 * 60 * 1000,
    3: 3 * 24 * 60 * 60 * 1000,
    5: 5 * 24 * 60 * 60 * 1000
};

const WATER_GOALS = {
    1: 3000,
    2: 3500,
    3: 4000,
    5: 4500
};

let fastSession = null;
let countdownTimer = null;

function getSelectedDurationDays() {
    const selected = document.querySelector('input[name="duration"]:checked');
    if (!selected) {
        return 1;
    }
    return Number(selected.id.replace('dur-', '')) || 1;
}

function getSelectedWaterMl() {
    const selected = document.querySelector('input[name="water"]:checked');
    if (!selected) {
        return 0;
    }
    return Number(selected.id.replace('w', '')) || 0;
}

function formatDurationLabel(days) {
    return `${days} Day${days > 1 ? 's' : ''}`;
}

function formatClock(milliseconds) {
    const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function updateHomeSummary() {
    const durationDays = getSelectedDurationDays();
    const waterGoal = WATER_GOALS[durationDays];
    const currentWater = getSelectedWaterMl();
    const waterRemaining = Math.max(0, waterGoal - currentWater);
    const waterPercent = Math.min(100, (currentWater / waterGoal) * 100);

    const durationEl = document.getElementById('home-duration');
    const goalEl = document.getElementById('home-goal');
    const waterGoalEl = document.getElementById('water-goal');
    const currentWaterEl = document.getElementById('current-water');
    const waterRemainingEl = document.getElementById('water-remaining-ml');
    const waterFillEl = document.getElementById('water-progress-fill');

    if (durationEl) {
        durationEl.textContent = formatDurationLabel(durationDays);
    }
    if (goalEl) {
        goalEl.textContent = `${waterGoal} ml`;
    }
    if (waterGoalEl) {
        waterGoalEl.textContent = waterGoal;
    }
    if (currentWaterEl) {
        currentWaterEl.textContent = currentWater;
    }
    if (waterRemainingEl) {
        waterRemainingEl.textContent = waterRemaining;
    }
    if (waterFillEl) {
        waterFillEl.style.width = `${waterPercent}%`;
    }
}

function renderCountdown() {
    if (!fastSession) {
        return;
    }

    const now = Date.now();
    const remaining = Math.max(0, fastSession.endTime - now);
    const elapsed = Math.max(0, now - fastSession.startTime);
    const progressPercent = Math.min(100, (elapsed / fastSession.durationMs) * 100);

    const remainingEl = document.getElementById('home-remaining');
    const progressFillEl = document.getElementById('home-progress-fill');
    const progressLabelEl = document.getElementById('progress-label');

    if (remainingEl) {
        remainingEl.textContent = formatClock(remaining);
    }
    if (progressFillEl) {
        progressFillEl.style.width = `${progressPercent}%`;
    }
    if (progressLabelEl) {
        progressLabelEl.textContent = `${Math.round(progressPercent)}% Complete`;
    }

    if (remaining <= 0) {
        clearInterval(countdownTimer);
        countdownTimer = null;
        fastSession = null;
    }
}

function startFastCountdown() {
    const durationDays = getSelectedDurationDays();
    const durationMs = FAST_DURATIONS_MS[durationDays] || FAST_DURATIONS_MS[1];
    const now = Date.now();

    fastSession = {
        startTime: now,
        endTime: now + durationMs,
        durationMs
    };

    if (countdownTimer) {
        clearInterval(countdownTimer);
    }

    updateHomeSummary();
    renderCountdown();
    countdownTimer = setInterval(renderCountdown, 1000);
}

function stopFastCountdown() {
    fastSession = null;
    if (countdownTimer) {
        clearInterval(countdownTimer);
        countdownTimer = null;
    }

    const remainingEl = document.getElementById('home-remaining');
    const progressFillEl = document.getElementById('home-progress-fill');
    const progressLabelEl = document.getElementById('progress-label');

    if (remainingEl) {
        remainingEl.textContent = '00:00:00';
    }
    if (progressFillEl) {
        progressFillEl.style.width = '0%';
    }
    if (progressLabelEl) {
        progressLabelEl.textContent = '0% Complete';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const startedCheckbox = document.getElementById('started');
    const durationRadios = document.querySelectorAll('input[name="duration"]');
    const waterRadios = document.querySelectorAll('input[name="water"]');

    updateHomeSummary();

    durationRadios.forEach((radio) => {
        radio.addEventListener('change', () => {
            if (!fastSession) {
                updateHomeSummary();
            }
        });
    });

    waterRadios.forEach((radio) => {
        radio.addEventListener('change', updateHomeSummary);
    });

    if (startedCheckbox) {
        startedCheckbox.addEventListener('change', (event) => {
            if (event.target.checked) {
                startFastCountdown();
            } else {
                stopFastCountdown();
            }
        });
    }
});
