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
        LT_DAYS[now.getDay()] +
        " " +
        now.toLocaleTimeString("lt-LT", {
            hour: "2-digit",
            minute: "2-digit"
        });
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
        value.includes("Vandens") ||
        value.includes("MOKU")
    ) {
        return "group";
    }

    return "coach";
}

function renderLanes(containerId, lanes) {

    const container =
        document.getElementById(containerId);

    if (!container) return;

    container.innerHTML = "";

    lanes.forEach(function (lane) {

        const row =
            document.createElement("div");

        row.className =
            "lane " +
            getCategory(lane.value);

        row.innerHTML =
            '<span class="lane-number">Takelis ' +
            lane.lane +
            '</span><span>' +
            lane.value +
            '</span>';

        container.appendChild(row);
    });
}

function findCurrentIndex(dayData) {

    const now = new Date();

    const currentMinutes =
        now.getHours() * 60 +
        now.getMinutes();

    for (let i = 0; i < dayData.length; i++) {

        const slot = dayData[i];

        const parts =
            slot.time.split("-");

        const start =
            parts[0].split(":");

        const end =
            parts[1].split(":");

        const from =
            Number(start[0]) * 60 +
            Number(start[1]);

        const to =
            Number(end[0]) * 60 +
            Number(end[1]);

        if (
            currentMinutes >= from &&
            currentMinutes < to
        ) {
            return i;
        }
    }

    return 0;
}

function render() {

    if (!scheduleData) return;

    const dayName =
        LT_DAYS[new Date().getDay()];

    const dayData =
        scheduleData.schedule[dayName];

    if (!dayData) {

        document.getElementById("updated")
            .textContent =
            "Nerasta diena: " +
            dayName;

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

    } catch (error) {

        console.error(error);

        document.getElementById(
            "updated"
        ).textContent =
            "JSON klaida";
    }
}

updateClock();
setInterval(updateClock, 1000);

loadData();
setInterval(loadData, 60000);
