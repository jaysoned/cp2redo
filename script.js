var myApiKey = "qHv2BAvglSgbJnF4PtDIdLXUDnCg3fHvYXy8vWCv";

var dateFormat = 'YYYY-MM-DD'

var todayDate = moment().format(dateFormat);

var currentDate = todayDate;

var currentDate2 = todayDate;

const datePickerText = `<input  type="text" placeholder="click to show datepicker"  id="pickTheDate"/>`

var roverData = {};

var currentRover = null;

function initialLoad() {
    let date = todayDate;
    getAPOD(todayDate);
    getWeather();
    document.getElementById('pickTheDate').value = moment(date, dateFormat).format("MM/DD/YYYY");
    document.getElementById('pickTheDate2').value = moment(date, dateFormat).format("MM/DD/YYYY");
}

function changeTheDate() {
    let temp = moment(document.getElementById('pickTheDate').value, "MM/DD/YYYY", true);
    let currentDate;
    if (temp.isValid()) {
        currentDate = temp.format(dateFormat);
        getAPOD(currentDate);
    }
    else {
        alert("Please enter a valid date.")
        return;
    }
}

function getAPOD(date) {
    if (!date) {
        return; //refject null dates
    }
    document.getElementById("apod-content").innerHTML = `<p class='load-msg'>Loading...</p>`;
    document.getElementById('pickTheDateHolder').style.visibility = "hidden";
    const apodURL = "https://api.nasa.gov/planetary/apod?api_key=qHv2BAvglSgbJnF4PtDIdLXUDnCg3fHvYXy8vWCv";
    const dateAdder = "&date=" + date;
    fetch(apodURL + dateAdder).then(ent => ent.json()).then(ent => displayApod(ent));
}

function displayApod(data) {
    document.getElementById('pickTheDateHolder').style.visibility = "visible";
    console.log(data);
    const apodHTMLVid =
        `<div class="apod-vid">
        <iframe src="${data.hdurl ? data.hdurl : data.url}" allowfullscreen="allowfullscreen" frameborder="0"></iframe>
    </div>`;
    const apodHTMLImg =
        `<div class="apod-img">
        <img src="${data.hdurl ? data.hdurl : data.url}" alt="">
    </div>`;
    let apodMedia;
    if (data.media_type === "video") {
        apodMedia = apodHTMLVid;
    }
    else if (data.media_type === "image") {
        apodMedia = apodHTMLImg;
    }
    else {
        apodMedia = "<p>Unknown media type</p>";
    }
    if (!data.explanation) {
        data.explanation = '';
    }
    if (!data.title) {
        data.title = "UNKNOWN";
    }
    const apodHTML =
        `<div class="apod-content">
        <h2 class="apod-title">${data.title}</h2>
        ${apodMedia}
        <p class="apod-description">${data.explanation}</p>
    </div>`
    document.getElementById("apod-content").innerHTML = apodHTML;
}

function selectRover(currentTab, rover) {
    let tabs = document.getElementsByClassName("selector-link");
    currentRover = rover;
    for (tab of tabs) {
        tab.className = tab.className.replace(" active", "");
    }
    currentTab.currentTarget.className += " active";

    if (!roverData[rover]) {
        getRoverData(rover);
    }
    else {
        displayRoverData(rover);
    }
}

function getRoverData(rover) {
    document.getElementById("rover-content").innerHTML = `<p class='load-msg'>Loading...</p>`;
    const url = `https://mars-photos.herokuapp.com/api/v1/rovers/${rover.toLowerCase()}/photos?&earth_date=${currentDate2}&api_key=qHv2BAvglSgbJnF4PtDIdLXUDnCg3fHvYXy8vWCv`
    fetch(url).then(response => {
        return response.json();
    }).then(response => {
        console.log("hey", response, roverData);
        roverData[rover] = response.photos;
        console.log("hey2", response, roverData);
        displayRoverData(rover);
    })
        .catch(error => console.log("Error: " + error));
}

function displayRoverData(rover) {
    let roverHTML = '';
    console.log(roverData[rover].length != 0);
    if (roverData[rover].length) {
        for (image of roverData[rover]) {
            roverHTML +=
                `<div class = "rover-img-holder">
                <div class="rover-img"><img src="${image.img_src}" alt=""></div>
                </div>`
        }
        document.getElementById("rover-content").innerHTML = roverHTML;
    }
    else {
        getNearestDate(rover);
    }

}

function getNearestDate(rover) {
    let url = `https://mars-photos.herokuapp.com/api/v1/rovers/${rover.toLowerCase()}/latest_photos?&api_key=qHv2BAvglSgbJnF4PtDIdLXUDnCg3fHvYXy8vWCv`;
    fetch(url).then(response => response.json()).then(data => {
        let newest = moment(data.latest_photos[0].earth_date, dateFormat).format("MM/DD/YYYY");
        document.getElementById("rover-content").innerHTML = `<p>No data for selected date. Try: ${newest}`;
    })
        .catch(error => alert("Error: " + error));
}

function changeTheDate2() {
    roverData = {};
    let temp = moment(document.getElementById('pickTheDate2').value, "MM/DD/YYYY", true);
    if (temp.isValid()) {
        currentDate2 = temp.format(dateFormat);
        if (currentRover) {
            getRoverData(currentRover);
        }
    }
    else {
        alert("Please enter a valid date.")
        return;
    }
}

function getWeather() {
    let url = `https://api.nasa.gov/insight_weather/?api_key=qHv2BAvglSgbJnF4PtDIdLXUDnCg3fHvYXy8vWCv&feedtype=json&ver=1.0`;
    fetch(url).then(response => response.json())
        .then(response => displayWeather(response))
        .catch(error => console.log("Error: " + error));
}

function displayWeather(data) {
    let innerHTML = '';
    if (data.sol_keys.length == 0) {
        innerHTML = '<p class="error-msg">Sorry, the Insight weather service has been down for seven days or more.</p>';
    }
    else {
        for(sol of data.sol_keys) {
            for(key of Object.keys(data[sol].PRE)) {
                if(!data[sol].PRE[key]) {
                    data[sol].PRE[key] = "unmeasured";
                }
            }
            if(!data[sol].Season) {
                data[sol].Season = "unknown";
            }
            let date = moment(data[sol].Last_UTC, "YYYY-MM-DD[T]hh:mm:ss").format("MMMM Do, YYYY");
            innerHTML += 
            `<div class="weather-sol">
            <h3 class="weather sol">Sol ${sol}</h3>
            <hr/>
            <p class="weather date">${date}</p>
            <p class="weather high">High: ${data[sol].PRE.mx + "K"}</p>
            <p class="weather low">Low: ${data[sol].PRE.mn + "K"}</p>
            <p class="weather season">Season: ${data[sol].Season}</p>
          </div>`;
        }
    }
    document.getElementById("weather-content").innerHTML = innerHTML;
}


$(document).ready(function () {
    $('#pickTheDate').datepicker({
        format: "mm/dd/yyyy"
    });
});

$(document).ready(function () {
    $('#pickTheDate2').datepicker({
        format: "mm/dd/yyyy"
    });
});