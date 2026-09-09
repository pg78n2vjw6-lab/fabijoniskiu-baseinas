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

    const clock =
        document.getElementById("clock");

    if(clock){
        clock.textContent =
            `${day} ${time}`;
    }
}

function getCategory(value){

    value = value || "";

    if(value === "KLIENTAI"){
        return "clients";
    }

    if(
        value.includes("SSC") ||
        value.includes("LNSF") ||
        value.includes("VVF") ||
        value.includes("NEMUNAS") ||
        value.includes("DELFINAS")
    ){
        return "club";
    }

    if(
        value.includes("BTT") ||
        value.includes("ANTROKAI") ||
        value.includes("TRE") ||
        value.includes("MOKU") ||
        value.includes("Vandens")
    ){
        return "group";
    }

    return "coach";
}

function minutesNow(){

    const now = new Date();

    return (
        now.getHours() * 60 +
        now.getMinutes()
    );
}

function findCurrentIndex(slots){

    const now =
        minutesNow();

    for(let i = 0; i < slots.length; i++){

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

        if(
            now >= startMin &&
            now < endMin
        ){
            return i;
        }
    }

    return 0;
}

function renderLanes(id, lanes){

    const el =
        document.getElementById(id);

    if(
        !el ||
        !lanes
    ){
        return;
    }

    el.innerHTML = "";

    lanes.forEach(lane => {

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

        el.appendChild(row);
    });
}

function getTodaySchedule(){

    const keys =
        Object.keys(
            scheduleData.schedule
        );

    const today =
        new Date().getDay();

    if(today === 1){
        return scheduleData.schedule[key
