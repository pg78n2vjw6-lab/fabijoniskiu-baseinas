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

    if (!container) {
        return;
    }

    container.innerHTML = "";

    lanes.forEach(lane => {

        const row =
            document.createElement("div");

        row.className =
            "lane " +
            getCategory(lane.value);

        row.innerHTML =
            `<span class="lane-number">
                Takelis ${lane.lane}
            </span>
            <span>
                ${lane.value}
            </span>`;

        container.appendChild(row);
    });
}

function findCurrentIndex(slots) {

    const now = new Date();

    const currentMinutes =
        now.getHours() * 60 +
        now.getMinutes();

    for (let i = 0; i < slots.length; i++) {

        const parts =
            slots[i].time.split("-");

        const start =
            parts[0];

        const end =
            parts[1];

        const [sh, sm] =
            start.split(":").map(Number);

        const [eh, em] =
            end.split(":").map(Number);

        const from =
            sh * 60 + sm;

        const to =
            eh * 60 + em;

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

    
