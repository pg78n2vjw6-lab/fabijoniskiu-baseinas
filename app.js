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

    document.getElementById("clock").textContent =
        LT_DAYS[now.getDay()] + " " +
        now.toLocaleTimeString(
            "lt-LT",
            {
                hour: "2-digit",
                minute: "2-digit"
            }
        );
}

function findCurrentIndex(slots) {

    const now = new Date();

    const currentMinutes =
        now.getHours() * 60 +
        now.getMinutes();

    for (let i = 0; i < slots.length; i++) {

        const [start,end] =
            slots[i].time.split("-");

        const [sh,sm] =
            start.split(":").map(Number);

        const [eh,em] =
            end.split(":").map(Number);

        const startMin =
            sh * 60 + sm;

        const endMin =
            eh * 60 + em;

        if (
            currentMinutes >= startMin &&
            currentMinutes < endMin
        ) {
            return i;
        }
    }

    return 0;
}

function renderLanes(containerId, lanes) {

    const container =
        document.getElementById(containerId);

    container.innerHTML = "";

    lanes.forEach(lane => {

        const row =
            document.createElement("div");

        row.className = "lane";

        row.innerHTML =
            `<span>Takelis ${lane.lane}</span>
             <span>${lane.value}</span>`;

        container.appendChild(row);

    });
}

function render() {

    if (!scheduleData) {
        return;
    }

    const dayName =
        LT_DAYS[new Date().getDay()];

    const dayData =
        scheduleData.schedule[dayName];

    if (!dayData) {

        document.getElementById("updated")
            .textContent =
            "Nerasta diena";

        return;
    }

    const currentIndex =
        findCurrentIndex(dayData);

    const previous =
        currentIndex > 0
            ? dayData[currentIndex - 1]
            : null;

    const current =
        dayData[currentIndex];

    const next =
        currentIndex < dayData.length - 1
            ? dayData[currentIndex + 1]
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

    } catch (e) {

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
