let scheduleData = null;

const LT_DAYS = [
    "Sekmadienis",
    "Pirmadienis",
    "Antradienis",
    "Trečiadienis",
    "Ketvirtadienis",
    "Penktadienis",
    "Šeštadienis"
];

function updateClock() {

    const now = new Date();

    const day = LT_DAYS[now.getDay()];

    const time = now.toLocaleTimeString(
        "lt-LT",
        {
            hour: "2-digit",
            minute: "2-digit"
        }
    );

    const clock =
        document.getElementById("clock");

    if (clock) {
        clock.textContent =
            `${day} ${time}`;
    }
}

function getCategory(value) {

    value = value || "";

    if (value === "KLIENTAI") {
        return "clients";
    }

    return "club";
}

function minutesNow() {

    const now = new Date();

    return (
        now.getHours() * 60 +
        now.getMinutes()
    );
}

function findCurrentIndex(slots) {

    const now =
        minutesNow();

    for (let i = 0; i < slots.length; i++) {

        const [start, end] =
            slots[i].time.split("-");

        const [sh, sm] =
            start.split(":").map(Number);

        const [eh, em] =
            end.split(":").map(Number);

        const startMin =
            sh * 60 + sm;

        const endMin =
            eh * 60 + em;

        if (
            now >= startMin &&
            now < endMin
        ) {
            return i;
        }
    }

    return 0;
}

function renderLanes(id, lanes) {

    const el =
        document.getElementById(id);

    if (!el || !lanes) {
        return;
    }

    el.innerHTML = "";

    lanes.forEach(lane => {

        const row =
            document.createElement("div");

        row.className =
            "lane " +
            getCategory(lane.value);

        row.innerHTML = `
            <span class="lane-number">
                ${lane.lane}
            </span>

            <span>
                ${lane.value}
            </span>
        `;

        el.appendChild(row);

    });
}

function getTodaySchedule() {

    const keys =
        Object.keys(
            scheduleData.schedule
        );

    const today =
        new Date().getDay();

    const map = {
        1: 0,
        2: 1,
        3: 2,
        4: 3,
        5: 4,
        6: 5,
        0: 6
    };

    return scheduleData.schedule[
        keys[map[today]]
    ];
}

function render() {

    if (!scheduleData) {
        return;
    }

    const dayData =
        getTodaySchedule();

    if (
        !dayData ||
        dayData.length === 0
    ) {

        document.getElementById(
            "updated"
        ).textContent =
            "Nerasta diena";

        return;
    }

    const idx =
        findCurrentIndex(dayData);

    const previous =
        idx > 0
            ? dayData[idx - 1]
            : null;

    const current =
        dayData[idx];

    const next =
        idx < dayData.length - 1
            ? dayData[idx + 1]
            : null;

    if (previous) {

        document.getElementById(
            "previousTimeSlot"
        ).textContent =
            previous.time;

        renderLanes(
            "previousLanes",
            previous.lanes
        );
    }

    if (current) {

        document.getElementById(
            "currentTimeSlot"
        ).textContent =
            current.time;

        renderLanes(
            "currentLanes",
            current.lanes
        );
    }

    if (next) {

        document.getElementById(
            "nextTimeSlot"
        ).textContent =
            next.time;

        renderLanes(
            "nextLanes",
            next.lanes
        );
    }

    document.getElementById(
        "updated"
    ).textContent =
        scheduleData.updated;
}

async function loadData() {

    try {

        const response =
            await fetch(
                "schedule.json?t=" +
                Date.now()
            );

        scheduleData =
            await response.json();

        render();

    }
    catch (err) {

        console.error(err);

        document.getElementById(
            "updated"
        ).textContent =
            err.message;
    }
}

updateClock();

setInterval(
    updateClock,
    1000
);

loadData();

setInterval(
    loadData,
    60000
);
