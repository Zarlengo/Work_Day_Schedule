let settings;

// Function to initialize browser
function init() {
    // Checks local storage for existing settings
    settings = JSON.parse(localStorage.getItem("settings"));

    // Checks for initial run in browser and loads default settings to storage
    if (settings === null) {
        // Default values
        settings = {        
            start: 9,                   // 9:00
            long: 9,                    // 9 hours long = 18:00
            hour_format: 12,            // 12 or 24 hour formatting
            work_week: [1, 2, 3, 4, 5]  // M, Tu, W, Th, Fr [Sunday as 0 and Saturday as 6]
        };
        var json_obj = JSON.stringify(settings);
        localStorage.setItem("settings", json_obj);
    }

    // Gets the current date from the browser
    let current_date = moment().startOf('day');
    let current_hour = moment().hour();
    console.log(current_hour);
    let day_start_time = current_date.clone();
    let day_end_time = current_date.clone();

    document.querySelector("#currentDay").innerText = current_date.format("dddd, MMMM Do");

    // Manipulates the date object to the correct start times
    day_start_time.add(settings.start, "hours");
    day_end_time.add(parseFloat(settings.start) + parseFloat(settings.long), "hours");
    console.log(day_start_time);
    console.log(day_end_time);

    let past_future;
    let container = document.querySelector(".container");
    for (hour_block = settings.start; hour_block < settings.start + settings.long; hour_block++) {
        if (hour_block < current_hour) {
            past_future = "past";
        } else if (hour_block > current_hour) {
            past_future = "future";
        } else {
            past_future = "present";
        }
        let row = document.createElement("div");
        row.setAttribute("id", `t_${hour_block}`);
        row.setAttribute("class", `row`);
        row.innerHTML = `<div class="col-1-xs hour">${time_format(hour_block)}</div>
                        <div class="col ${past_future} appointment">BLANK</div>
                        <div class="col-1-xs saveBtn"><div class="row"><button class="btn"><i class="fas fa-save"></i></button></div></div>`;
    
    

        container.appendChild(row);
    }



}

// Function to output the time in the format for the user
function time_format(row_time) {
    if (settings.hour_format === 24) {
        return `${row_time}:00`;
    } else {
        if (row_time == 0) {
            return "12 AM";
        } else if (row_time < 12) {
            return `${row_time} AM`
        } else if (row_time == 12) {
            return `12 PM`
        } else {
            return `${row_time - 12} PM`
        }
    }

}

init();

