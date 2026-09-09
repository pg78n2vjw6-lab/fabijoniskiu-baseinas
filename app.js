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
        now.toLocaleTimeString(
            "lt-LT",
            {
                hour: "2-digit",
                minute: "2-digit"
            }
        );
}

function renderLanes(id, lanes) {

    const el =
        document.getElementById(id);

    el.innerHTML = "";

    lanes.forEach(lane => {

        const row =
            document.createElement("div");

        row.className = "lane";

        row.innerHTML =
            "<span>Takelis " +
            lane.lane +
            "</span><span>" +
            lane.value +
            "</span>";

        el.appendChild(row);
    });
}

function findCurrentIndex(slots) {

    const now = new Date();
    const nowMin =
        now.getHours() * 60 +
        now.getMinutes();

    for (let i = 0; i < slots.length; i++) {

        const parts =
            slots[i].time.split("-");

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

        if (nowMin >= from && nowMin < to) {
            return i;
        }
    }

    return 0;
}

function render() {

    const day =
        LT_DAYS[new Date().getDay()];

    const dayData =
        scheduleData.schedule[day];

    if (!dayData) {
        console.error(
            "Nerasta diena:",
            day
        );
        return;
    }

    console.log("Diena:", dayName);
console.log("dayData:", dayData);

    const idx =
        findCurrentIndex(dayData);

    const prev =
        idx > 0
            ? dayData[idx - 1]
            : null;

    const curr =
        dayData[idx];

    const next =
        idx < dayData.length - 1
            ? dayData[idx + 1]
            : null;

    if (prev) {

        document.getElementById(
            "previousTimeSlot"
        ).textContent = prev.time;

        renderLanes(
            "previousLanes",
            prev.lanes
        );
    }

    if (curr) {

        document.getElementById(
            "currentTimeSlot"
        ).textContent = curr.time;

        renderLanes(
            "currentLanes",
            curr.lanes
        );
    }

    if (next) {

        document.getElementById(
            "nextTimeSlot"
        ).textContent = next.time;

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

document.getElementById("updated").textContent =
    "JSON OK";
        
console.log(scheduleData);
        
render();

    } catch (e) {

        console.error(e);
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
