let scheduleData = null;

const SCHEDULE_URL =
    "https://pg78n2vjw6-lab.github.io/fabijoniskiu-baseinas/schedule.json";

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

    const clock = document.getElementById("clock");

    if (clock) {
        clock.textContent = day + " " + time;
    }
}

function getCategory(value) {
    const normalizedValue =
        String(value || "").trim().toUpperCase();

    if (normalizedValue === "KLIENTAI") {
        return "clients";
    }

    return "busy";
}

function minutesNow() {
    const now = new Date();

    return now.getHours() * 60 + now.getMinutes();
}

function timeToMinutes(value) {
    const parts =
        String(value).trim().split(":");

    if (parts.length !== 2) {
        return null;
    }

    const hours = Number(parts[0]);
    const minutes = Number(parts[1]);

    if (
        !Number.isFinite(hours) ||
        !Number.isFinite(minutes)
    ) {
        return null;
    }

    return hours * 60 + minutes;
}

function findCurrentIndex(slots) {
    const currentMinutes = minutesNow();

    for (let i = 0; i < slots.length; i++) {
        const interval =
            String(slots[i].time || "")
                .trim()
                .replace("–", "-")
                .replace("—", "-");

        const intervalParts = interval.split("-");

        if (intervalParts.length !== 2) {
            continue;
        }

        const startMinutes =
            timeToMinutes(intervalParts[0]);

        const endMinutes =
            timeToMinutes(intervalParts[1]);

        if (
            startMinutes === null ||
            endMinutes === null
        ) {
            continue;
        }

        if (
            currentMinutes >= startMinutes &&
            currentMinutes < endMinutes
        ) {
            return i;
        }
    }

    if (slots.length === 0) {
        return -1;
    }

    const firstInterval =
        String(slots[0].time || "")
            .replace("–", "-")
            .replace("—", "-")
            .split("-");

    const firstStart =
        firstInterval.length === 2
            ? timeToMinutes(firstInterval[0])
            : null;

    if (
        firstStart !== null &&
        currentMinutes < firstStart
    ) {
        return 0;
    }

    return slots.length - 1;
}

function clearBlock(timeId, lanesId) {
    const timeElement =
        document.getElementById(timeId);

    const lanesElement =
        document.getElementById(lanesId);

    if (timeElement) {
        timeElement.textContent = "-";
    }

    if (lanesElement) {
        lanesElement.innerHTML = "";
    }
}

function renderLanes(elementId, lanes) {
    const element =
        document.getElementById(elementId);

    if (!element) {
        return;
    }

    element.innerHTML = "";

    if (!Array.isArray(lanes)) {
        return;
    }

    lanes.forEach(function (lane) {
        const row =
            document.createElement("div");

        row.className =
            "lane " + getCategory(lane.value);

        const laneNumber =
            document.createElement("span");

        laneNumber.className = "lane-number";
        laneNumber.textContent =
            "Takelis " + lane.lane;

        const laneValue =
            document.createElement("span");

        laneValue.textContent =
            String(lane.value || "");

        row.appendChild(laneNumber);
        row.appendChild(laneValue);
        element.appendChild(row);
    });
}

function getTodaySchedule() {
    if (
        !scheduleData ||
        !scheduleData.schedule
    ) {
        return null;
    }

    const keys =
        Object.keys(scheduleData.schedule);

    if (keys.length < 7) {
        return null;
    }

    const dayIndexMap = {
        1: 0,
        2: 1,
        3: 2,
        4: 3,
        5: 4,
        6: 5,
        0: 6
    };

    const currentDay =
        new Date().getDay();

    const scheduleIndex =
        dayIndexMap[currentDay];

    const scheduleKey =
        keys[scheduleIndex];

    return scheduleData.schedule[scheduleKey];
}

function render() {
    const updatedElement =
        document.getElementById("updated");

    if (
        !scheduleData ||
        !scheduleData.schedule
    ) {
        if (updatedElement) {
            updatedElement.textContent =
                "Nėra tvarkaraščio duomenų";
        }

        return;
    }

    const dayData =
        getTodaySchedule();

    if (
        !Array.isArray(dayData) ||
        dayData.length === 0
    ) {
        if (updatedElement) {
            updatedElement.textContent =
                "Nerasti šios dienos duomenys";
        }

        return;
    }

    const currentIndex =
        findCurrentIndex(dayData);

    if (currentIndex < 0) {
        if (updatedElement) {
            updatedElement.textContent =
                "Nerasti laiko intervalai";
        }

        return;
    }

    const previous =
        currentIndex > 0
            ? dayData[currentIndex - 1]
            : null;

    const current =
        dayData[currentIndex] || null;

    const next =
        currentIndex < dayData.length - 1
            ? dayData[currentIndex + 1]
            : null;

    clearBlock(
        "previousTimeSlot",
        "previousLanes"
    );

    clearBlock(
        "currentTimeSlot",
        "currentLanes"
    );

    clearBlock(
        "nextTimeSlot",
        "nextLanes"
    );

    if (previous) {
        const previousTime =
            document.getElementById(
                "previousTimeSlot"
            );

        if (previousTime) {
            previousTime.textContent =
                previous.time;
        }

        renderLanes(
            "previousLanes",
            previous.lanes
        );
    }

    if (current) {
        const currentTime =
            document.getElementById(
                "currentTimeSlot"
            );

        if (currentTime) {
            currentTime.textContent =
                current.time;
        }

        renderLanes(
            "currentLanes",
            current.lanes
        );
    }

    if (next) {
        const nextTime =
            document.getElementById(
                "nextTimeSlot"
            );

        if (nextTime) {
            nextTime.textContent =
                next.time;
        }

        renderLanes(
            "nextLanes",
            next.lanes
        );
    }

    if (updatedElement) {
        updatedElement.textContent =
            scheduleData.updated || "-";
    }
}

async function loadData() {
    const updatedElement =
        document.getElementById("updated");

    try {
        const response =
            await fetch(
                SCHEDULE_URL,
                {
                    method: "GET",
                    cache: "no-store"
                }
            );

        if (!response.ok) {
            throw new Error(
                "HTTP klaida " + response.status
            );
        }

        const responseText =
            await response.text();

        scheduleData =
            JSON.parse(responseText);

        render();
    }
    catch (error) {
        console.error(error);

        if (updatedElement) {
            updatedElement.textContent =
                "KLAIDA: " +
                (
                    error.message ||
                    String(error)
                );
        }
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
