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

function getCategory(value){

    if(value === "KLIENTAI"){
        return "clients";
    }

    if(
        value.includes("SSC") ||
        value.includes("LNSF") ||
        value.includes("VVF") ||
        value.includes("NEMUNAS")
    ){
        return "club";
    }

    if(
        value.includes("Vandens") ||
        value.includes("BTT") ||
        value.includes("TREČIOKAI")
    ){
        return "group";
    }

    return "coach";
}

function minutesNow(){

    const now = new Date();

    return now.getHours() * 60 +
           now.getMinutes();
}

function intervalToMinutes(interval){

    const parts = interval.split("-");

    const start = parts[0];

    const [h,m] = start.split(":").map(Number);

    return h*60+m;
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

        const startMin = sh*60+sm;
        const endMin = eh*60+em;

        if(now >= startMin && now < endMin){
            return i;
        }
    }

    return 0;
}

function renderLanes(elementId, lanes){

    const el =
        document.getElementById(elementId);

    el.innerHTML = "";

    lanes.forEach(lane=>{

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

    if(!scheduleData){
        return;
    }

    const dayName =
        LT_DAYS[new Date().getDay()];

    const dayData =
        scheduleData.schedule[dayName];

    const currentIndex =
        findCurrentIndex(dayData);

    const current =
        dayData[currentIndex];

    const next =
        dayData[currentIndex + 1];

    const future =
        dayData[currentIndex + 2];

    if(current){

        document.getElementById(
            "currentTimeSlot"
        ).textContent = current.time;

        renderLanes(
            "currentLanes",
            current.lanes
        );
    }

    if(next){

        document.getElementById(
            "nextTimeSlot"
        ).textContent = next.time;

        renderLanes(
            "nextLanes",
            next.lanes
        );
    }

    if(future){

        document.getElementById(
            "futureTimeSlot"
        ).textContent = future.time;

        renderLanes(
            "futureLanes",
            future.lanes
        );
    }

    document.getElementById(
        "updated"
    ).textContent =
        scheduleData.updated;
}

async function loadData(){

    try{

        const response =
            await fetch(
                "schedule.json?t="+Date.now()
            );

        scheduleData =
            await response.json();

        render();

    }catch(e){

        console.error(e);
    }
}

updateClock();
setInterval(updateClock,1000);

loadData();
setInterval(loadData,60000);
