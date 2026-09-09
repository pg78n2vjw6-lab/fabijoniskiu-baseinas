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

    const day =
        LT_DAYS[now.getDay()];

    const time =
        now.toLocaleTimeString(
            "lt-LT",
            {
                hour: "2-digit",
                minute: "2-digit"
            }
        );

    document.getElementById("clock")
        .textContent =
        `${day} ${time}`;
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

    lanes.forEach((lane) => {

        const row =
            document.createElement("div");

        row.className =
            "lane " +
            getCategory(
                lane.value
            );

        row.innerHTML = `
            <span class="lane-number">
                Takelis ${lane.lane}
            </span>

            <span>
                ${lane.value}
            </span>
        `;

        container.appendChild(row);
    });
}

function findCurrentIndex(dayData) {

    const now =
        new Date();

    const currentMinutes =
        now.getHours() * 60 +
        now.getMinutes();

    for (
        let i = 0;
        i < dayData.length;
        i++
    ) {

        const slot =
            dayData[i];

        const parts =
            slot.time.split("-");

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
        LT_DAYS[
            new Date().getDay()
        ];

    const allDays =
        Object.keys(
            scheduleData.schedule
        );

    let dayData =
        scheduleData.schedule[dayName];

    if (!dayData) {

        const fallback =
            allDays.find(
                day =>
                    day.toLowerCase()
                       .trim() ===
                    dayName.toLowerCase()
                           .trim()
            );

        if (fallback) {
            dayData =
                scheduleData.schedule[
                    fallback
                ];
        }
    }

    if (!dayData) {

        document
            .getElementById(
                "updated"
            )
            .textContent =
            "Nerasta diena";

        return;
    }

    const currentIndex =
        findCurrentIndex(
            dayData
        );

    const previous =
        currentIndex > 0
            ? dayData[
                currentIndex - 1
              ]
            : null;

    const current =
        dayData[
            currentIndex
        ];

    const next =
        currentIndex <
        dayData.length - 1
            ? dayData[
                currentIndex + 1
              ]
            : null;

    if (previous) {

        document
            .getElementById(
                "previousTimeSlot"
            )
            .textContent =
            previous.time;

        renderLanes(
            "previousLanes",
            previous.lanes
        );
    }

    if (current) {

        document
            .getElementById(
                "currentTimeSlot"
            )
            .textContent =
            current.time;

        renderLanes(
            "currentLanes",
            current.lanes
        );
    }

    if (next) {

        document
            .getElementById(
                "nextTimeSlot"
            )
            .textContent =
            next.time;

        renderLanes(
            "nextLanes",
            next.lanes
        );
    }

    document
        .getElementById(
            "updated"
        )
        .textContent =
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

        console.error(
            error
        );

        document
            .getElementById(
                "updated"
            )
            .textContent =
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
