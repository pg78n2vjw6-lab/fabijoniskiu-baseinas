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

    document.getElementById("clock").textContent =
        `${day} ${time}`;
}

function getCategory(value) {

    if (!value) {
        return "coach";
    }

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
        value.includes("Vandens") ||
        value.includes("ANTROKAI") ||
        value.includes("TREČIOKAI") ||
        value.includes("MOKU")
    ) {
        return "group";
    }

    return "coach";
}

function minutesNow() {

    const now = new Date();

    return now.getHours() * 60 + now.getMinutes();
}

function findCurrentIndex(slots){

    const now = minutesNow();

    for(let i=0;i<slots.length;i++){

        const [start,end] =
            slots[i].time.split("-");

        const [sh,sm] =
            start.split(":").map(Number);

        const [eh,em] =
            end.split(":").map(Number);

        const startMin = sh * 60 + sm;
        const endMin = eh * 60 + em;

        if(now >= startMin && now < endMin){
            return i;
        }
    }

    if(now < 360){
        return 0;
    }

    return slots.length - 1;
}

function renderLanes(elementId, lanes) {

    const el =
        document.getElementById(elementId);

    if (!el) return;

    el.innerHTML = "";

    lanes.forEach(lane => {

        const row =
            document.createElement("div");

        row.className =
            `lane ${getCategory(lane.value)}`;

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

function render() {

    if (!scheduleData) {
        return;
    }

    const dayName =
        LT_DAYS[new Date().getDay()];

let dayData =
    scheduleData.schedule[dayName];

if(!dayData){

    const key =
        Object.keys(
            scheduleData.schedule
        ).find(
            k => k.includes(
                dayName.substring(0,5)
            )
        );

    if(key){
        dayData =
            scheduleData.schedule[key];
    }
}

    if (!dayData || dayData.length === 0) {
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
        ).textContent = previous.time;

        renderLanes(
            "previousLanes",
            previous.lanes
        );
    }

    if (current) {

        document.getElementById(
            "currentTimeSlot"
        ).textContent = current.time;

        renderLanes(
            "currentLanes",
            current.lanes
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
                "schedule.json?t=" + Date.now()
            );

        scheduleData =
            await response.json();

        render();

    } catch (e) {

        console.error(
            "Nepavyko užkrauti schedule.json",
            e
        );
    }
}

updateClock();
setInterval(updateClock, 1000);

loadData();
setInterval(loadData, 60000);
