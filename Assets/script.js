// Initialize global variables
let settings;
let date_code;
let target_date;
let target_element;
let target_data;
let touch_start = false;

// Function to initialize browser
function init() {
    // Checks local storage for existing settings
    settings = JSON.parse(localStorage.getItem("settings"));

    // Checks for initial run in browser and loads default settings to storage
    if (settings === null) {
        // Default values
        settings = {
            start: 9,                   // 9:00
            end: 18,                    // 18:00
            hour_format: 12,            // 12 or 24 hour formatting
            work_week: [1, 2, 3, 4, 5]  // M, Tu, W, Th, Fr [Sunday as 0 and Saturday as 6]
        };
        let json_obj = JSON.stringify(settings);
        localStorage.setItem("settings", json_obj);
    }
}
init();

// Function to load the settings modal with the options and current preferences
function load_settings() {
    // Empty strings for storing options for the settings modal
    let start_option_string = "";
    let end_option_string = "";
    let start_string = "";
    let end_string = "";

    // Cycle through an entire day
    for (let i = 0; i <= 24; i++) {

        // Check for what hour is selected as an option
        if (i == settings.start) {
            start_string = " selected";
        } else {
            start_string = "";
        }

        if (i == settings.end) {
            end_string = " selected";
        } else {
            end_string = "";
        }

        // Checks which hour format is the preference and formats the output accordingly
        if (settings.hour_format == 12) {
            if (i == 0) {
                time_string = "12 AM";
            } else if (i < 12) {
                time_string = `${i} AM`;
            } else if (i == 12) {
                time_string = "12 PM";
            } else {
                time_string = `${i - 12} PM`;
            }
        } else {
            time_string = `${i}:00`;
        }

        // Adds each hour to the string
        if (i != 24) {
            start_option_string = start_option_string.concat(`<option value="${i}"${start_string}>${time_string}</option>`);
        }
        if (i != 0) {
            end_option_string = end_option_string.concat(`<option value="${i}"${end_string}>${time_string}</option>`);
        }
    }

    // Updates the settings modal with the new information
    document.querySelector("#start").innerHTML = start_option_string;
    document.querySelector("#end").innerHTML = end_option_string;

    // Creates options for the hour format
    let hour_format_string;
    if (settings.hour_format == 12) {
        hour_format_string = `<option value="12" selected>12 Hours (AM/PM)</option><option value="24">24 Hours (00:00)</option>`;
    } else {
        hour_format_string = `<option value="12">12 Hours (AM/PM)</option><option value="24" selected>24 Hours (00:00)</option>`;
    }
    document.querySelector("#hour_format").innerHTML = hour_format_string;

    // Adds some listeners to the settings modal to trigger when a change is requested
    document.querySelector("#start").addEventListener("change", update_settings, false);
    document.querySelector("#end").addEventListener("change", update_settings, false);
    document.querySelector("#hour_format").addEventListener("change", update_settings, false);

    // Adds some listeners to the setting button and close button
    document.querySelector(".settings").addEventListener("click", function () {document.querySelector("#settings_modal").style.display = "block";}, false);
    document.querySelector(".settings-head").addEventListener("click", function () {document.querySelector("#settings_modal").style.display = "block";}, false);
    document.querySelector(".close").addEventListener("click", function () {document.querySelector("#settings_modal").style.display = "none";}, false);

    // In case the user tries to click outside the modal to close
    window.addEventListener("click", function(event) {
        if (event.target == document.querySelector("#settings_modal")) {
            document.querySelector("#settings_modal").style.display = "none";
        }
    }, false)
}
load_settings();

// Function to update the preferences in local storage upon change
function update_settings() {

    // Gets the preferences from local storage
    settings = JSON.parse(localStorage.getItem("settings"));

    // Determines which option was changed
    let option_id = this.getAttribute("id");
    let option_index = document.querySelector(`#${option_id}`).selectedIndex;
    let option_value = parseInt(document.querySelector(`#${option_id}`).options[option_index].value);

    // If the option is the end of day and it is past midnight (swing / graveyard shifts)
    if (option_id == "end" && settings.start > option_value) {
        option_value += 24;
    }

    // Stores the new preference into local storage
    settings[option_id] = option_value;
    let json_obj = JSON.stringify(settings);
    localStorage.setItem("settings", json_obj);

    // Calls the function to reload the webpage with the new settings
    load_day();
}

// Function to show / hide the navbar based on location of the user on the page
window.addEventListener("scroll", function() {
    let navbar = document.querySelector(".navbar");
    if (window.pageYOffset > 330) {
        navbar.style.display = "flex";
    } else {
        navbar.style.display = "none";
    }
});

// Handler to reload the hour blocks from local storage
document.querySelector(".refresh").addEventListener("click", load_day, false);
document.querySelector(".refresh-head").addEventListener("click", load_day, false);

// Function to load the work day
function load_day() {
    // Initialize variables
    let past_future;
    let day_text;
    let container = document.querySelector(".container");

    // Empties the page of existing data (if refreshing information)
    container.innerHTML = "";

    // Gets the current hour from the browser
    let current_hour = moment().hour();
    // Updates the html with the target date
    document.querySelector("#currentDay").innerText = target_date.format("dddd, MMMM Do");
    document.querySelector("#navbar-date").innerText = target_date.format("dddd, MMMM Do");

    // Checks local storage for data for the given day
    day_data = JSON.parse(localStorage.getItem(date_code));

    // If there is no data for the day, creates an empty object
    if (day_data === null) {
        day_data = {};
    }

    // Cycles through each hour in the schedule
    for (hour_block = settings.start; hour_block < settings.end; hour_block++) {

        // Checks if the cell should be colored past / present / future
        if (hour_block < current_hour) {
            past_future = "past";
        } else if (hour_block > current_hour) {
            past_future = "future";
        } else {
            past_future = "present";
        }

        // If there is existing day's schedule in local storage
        if (typeof(day_data[hour_block]) != "undefined") {
            day_text = day_data[hour_block];
        } else {
            day_text = "";
        }

        // Creates a new element for the hour and sets class and id
        let row = document.createElement("div");
        row.setAttribute("id", `time_${hour_block}`);
        row.setAttribute("data-id", hour_block);
        row.setAttribute("class", `row hour_block`);

        // Adds the internal components to the div (date, meeting text, buttons)
        row.innerHTML = `<div class="col-1-xs hour">${time_format(hour_block)}</div>
                        <div class="col ${past_future}"><textarea class="appointment" value=${day_text}>${day_text}</textarea></div>
                        <div class="col-1-xs dragBtn" data-id="${hour_block}"><div class="row icons"><i class="fas fa-bars"></i></div></div>
                        <div class="col-1-xs saveBtn" data-id="${hour_block}"><div class="row icons"><i class="fas fa-save"></i></div></div>`;

        // Adds the new hour to the main page
        container.appendChild(row);

        // Attaches handler to all save buttons
        document.querySelectorAll(".saveBtn").forEach(function(save) {
            save.addEventListener("click", save_row, false);
        });

        // Add draggable to each row upon click of the drag icon
        document.querySelectorAll(".dragBtn").forEach(function (btn) {
            btn.addEventListener("mousedown", function (event) {
                document.querySelector(`#time_${this.getAttribute("data-id")}`).setAttribute("draggable", "true");
            });

            // Desktop versions
            btn.addEventListener("mouseout", function (event) {
                document.querySelector(`#time_${this.getAttribute("data-id")}`).removeAttribute("draggable");
            });

            btn.addEventListener("touchstart", function (event) {
                event.preventDefault();
                target_element = document.querySelector(`#time_${this.getAttribute("data-id")}`);

                touch_start = true;
                target_element.style.opacity = 0.33;
                target_data = target_element.querySelector(".appointment").value;
            });

            // Touchscreen versions
            btn.addEventListener("touchend", function (event) {
                touch_start = false;
                let last_outlined = document.querySelectorAll(".new_spot");
                if (last_outlined.length == 1) {
                    if (target_element != last_outlined[0]) {
                        target_element.querySelector(".appointment").value = last_outlined[0].querySelector(".appointment").value;
                        last_outlined[0].querySelector(".appointment").value = target_data;
                        last_outlined[0].querySelector(".appointment").classList.add("changed");
                        target_element.querySelector(".appointment").classList.add("changed");
                    }
                }
                let all_hours = document.querySelectorAll(".hour_block");
                all_hours.forEach(function(row) {
                    row.classList.remove("new_spot");
                    row.style.opacity = 1;
                });
            });
        });

        // Add drag listeners to each row (Drag entire row instead of just the drag button)
        let all_hours = document.querySelectorAll(".hour_block");
        all_hours.forEach(function(row) {
            // Computer versions
            row.addEventListener("dragstart",   handleDragStart,    false);
            row.addEventListener("dragover",    handleDragOver,     false);
            row.addEventListener("dragleave",   handleDragLeave,    false);
            row.addEventListener("drop",        handleDrop,         false);
        });

        // Add input change listeners to each meeting to designate unsaved changes
        let all_appointments = document.querySelectorAll(".appointment");
        all_appointments.forEach(function(appointment) {
            appointment.addEventListener("input", function() {
                this.classList.add("changed");
            }, false);
        });
    }
}



// Gets the current date from the browser
let current_date = moment().startOf("day");

// Date Code to use in local storage to reference the specific day
date_code = current_date.format("YMMDD");

// Sets the default date to today
target_date = current_date;

// Calls function to load html data
load_day();


// Function to output the time in the format preference of the user
function time_format(row_time) {
    // Checks if the user prefers 12 or 24 hours
    if (settings.hour_format === 24) {
        return `${row_time}:00`;
    } else {
        // Edits the time if it's a swing/graveyard shift
        if (row_time >= 24) {
            row_time -= 24;
        }

        // Output determined by what time of day it is
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

// Function to save data into local storage when the save button is pressed
function save_row(event) {
    // Set initial variable
    let text_save = null;

    let parent_element = document.querySelector(`#time_${this.getAttribute("data-id")}`);
    text_save = parent_element.querySelector(".appointment").value;
    parent_element.querySelector(".appointment").classList.remove("changed");
    hour_save = parent_element.getAttribute("data-id");

    if (text_save == "") {
        // If there is no data in the textarea, delete from local storage
        delete_item(hour_save);
    } else {
        // If there data in the textarea add/update local storage
        add_update_item(hour_save, text_save);
    }
}

// Function to add or update local storage with the meeting information
function add_update_item(hour, text) {

    // Gets the current day information from local storage
    let current_day = JSON.parse(localStorage.getItem(date_code));

    // Checks if there is any existing data for the day and creates an empty object
    if (current_day === null) {
        current_day = {};
    }
    // Updates / Adds the entry
    current_day[hour] = text;

    // Updates the data in the local storage
    localStorage.setItem(date_code, JSON.stringify(current_day));
}

// Function to delete the hour information from local storage
function delete_item(hour) {
    // Gets the current day information from local storage
    let current_day = JSON.parse(localStorage.getItem(date_code));

    // Blank entry on a day or hour without existing data, nothing to do (hit save without entering data)
    if (current_day === null || current_day.hour === null) {
        return;
    }

    // Removes the targeted hour from the object
    delete current_day[hour];

    // Updates the data in the local storage
    localStorage.setItem(date_code, JSON.stringify(current_day));
}


/****** Functions to handle the drag and drop of the events ******/
/****** Desktop versions ******/
// Start of the drag event
function handleDragStart(event) {
    this.style.opacity = 0.33;
    target_element = this;
    target_data = this.querySelector(".appointment").value;
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/html", this.innerHTML);
}

// When the target element is held over another element
function handleDragOver(event) {
    event.preventDefault();
    this.classList.add("new_spot");
}

// When the target leaves an existing row
function handleDragLeave(event) {
    this.classList.remove("new_spot");
}

// When the drag event ends
function handleDrop(event) {
    event.stopPropagation();

    // Checks if this is a new element
    if (target_element != this) {
        // Replaces the "moved from" meeting data with the "move to" data
        target_element.querySelector(".appointment").value = this.querySelector(".appointment").value;

        // Updates the "move to" element
        this.querySelector(".appointment").value = target_data;

        // Highlights the changed elements indicating there is unsaved content
        this.querySelector(".appointment").classList.add("changed");
        target_element.querySelector(".appointment").classList.add("changed");
    }

    // Cycles through all rows to reset the opacity and outlines
    let all_hours = document.querySelectorAll(".hour_block");
    all_hours.forEach(function(row) {
        row.classList.remove("new_spot");
        row.style.opacity = 1;
    });
}


/****** Touchscreen versions ******/
// Adds a listener to the touch move event
document.addEventListener("touchmove", function (event) {
    // Checks if the drag originated from the drag icon
    if (!touch_start) return;

    // Stores the elements that the finger is touching
    var element = document.elementFromPoint(event.touches[0].clientX, event.touches[0].clientY);
    if (!element) return;

    // Checks the element tree for a match to a row
    if (element.matches(".hour_block")) {

        // Removes outlines from all rows
        let all_hours = document.querySelectorAll(".hour_block");
        all_hours.forEach(function(row) {
            row.classList.remove("new_spot");
        });

        // Outlines the overlapping row
        element.classList.add("new_spot");
    }
});