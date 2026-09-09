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

    if (
        value.includes("SSC") ||
        value.includes("LNSF") ||
        value.includes("VVF") ||
        value.includes("NEMUNAS") ||
        value.includes("DELFINAS")
    ) {
        return "club";
    }

    if (
        value.includes("BTT") ||
        value.includes("ANTROKAI") ||
        value.includes("TREČIOKAI") ||
        value.includes("MOKU") ||
        value.includes("Vandens")
    ) {
        return "group";
    }

    return "coach";
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
                Takelis ${lane.lane}
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

    let key;

    switch (today) {

        case 1:
            key = keys[0];
            break;

        case 2:
            key = keys[1];
            break;

        case 3:
            key = keys[2];
            break;

        case 4:
            key = keys[3];
            break;

        case 5:
            key = keys[4];
            break;

        case 6:
            key = keys[5];
            break;

        default:
            key = keys[6];
    }

    return scheduleData.schedule[key];
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
            "JSON klaida";
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
