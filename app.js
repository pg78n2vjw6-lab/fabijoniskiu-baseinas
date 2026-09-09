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
        value.includes("Vandens") ||
        value.includes("MOKU")
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

    for(
        let i = 0;
        i < slots.length;
        i++
    ){

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

function renderLanes(
    containerId,
    lanes
){

    const container =
        document.getElementById(
            containerId
        );

    if(!container){
        return;
    }

    container.innerHTML = "";

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

        container.appendChild(row);

    });

}

function findDayData(dayName){

    let dayData =
        scheduleData.schedule[dayName];

    if(dayData){
        return dayData;
    }

    const keys =
        Object.keys(
            scheduleData.schedule
        );

    const match =
        keys.find(
            k =>
                k.startsWith(
                    dayName.substring(0,5)
                )
        );

    if(match){
        return scheduleData.schedule[match];
    }

    return null;
}

function render() {

    document.getElementById("updated").textContent =
        scheduleData.updated;

    document.getElementById(
        "previousTimeSlot"
    ).textContent =
        "OK";

    document.getElementById(
        "currentTimeSlot"
    ).textContent =
        "TESTAS VEIKIA";

    document.getElementById(
        "nextTimeSlot"
    ).textContent =
        "JSON KRAUNASI";
}
async function loadData(){

    try{

        const response =
            await fetch(
                "schedule.json?t=" +
                Date.now()
            );

        scheduleData =
            await response.json();

        render();

    }
    catch(err){

        console.error(err);

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
