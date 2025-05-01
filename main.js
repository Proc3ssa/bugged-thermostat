// Factory function for creating room objects
const createRoom = (name, currTemp, coldPreset, warmPreset, image, startTime, endTime, airConditionerOn = false) => ({
  name,
  currTemp,
  coldPreset,
  warmPreset,
  image,
  airConditionerOn,
  startTime,
  endTime,

  setCurrTemp(temp) {
    this.currTemp = temp;
  },

  setColdPreset(newCold) {
    this.coldPreset = newCold;
  },

  setWarmPreset(newWarm) {
    this.warmPreset = newWarm;
  },

  decreaseTemp() {
    this.currTemp--;
  },

  increaseTemp() {
    this.currTemp++;
  },
  toggleAircon() {
    this.airConditionerOn = !this.airConditionerOn;
  },
});


// Room objects
const rooms = [
  createRoom("Bedroom", 31, 20, 32, "./assets/bedroom.jpg", '00:00', '12:00'),
  createRoom("Living Room", 32, 20, 32, "./assets/living-room.jpg", '00:00', '12:00'),
  createRoom("Kitchen", 29, 20, 32, "./assets/kitchen.jpg", '00:00', '12:00'),
  createRoom("Bathroom", 30, 20, 32, "./assets/bathroom.jpg", '00:00', '12:00'),
];

const coolOverlay= `linear-gradient(
    to bottom,
    rgba(141, 158, 247, 0.2),
    rgba(194, 197, 215, 0.1)
  )`;

const warmOverlay = `linear-gradient(to bottom, rgba(236, 96, 98, 0.2), rgba(248, 210, 211, 0.13))`;

const setInitialOverlay = () => {
  document.querySelector(
    ".room"
  ).style.backgroundImage = `url('${rooms[0].image}')`;

  document.querySelector(".room").style.backgroundImage = `${
    rooms[0].currTemp < 25 ? coolOverlay : warmOverlay
  }, url('${rooms[0].image}')`;
};

const setOverlay = (room) => {
  document.querySelector(".room").style.backgroundImage = `${
    room.currTemp < 25 ? coolOverlay : warmOverlay
  }, url('${room.image}')`;
};

// Set svg accordingly
const svgPoint = document.querySelector(".point");
const angleOffset = 86;
const MIN_TEMP = 10;
const MAX_TEMP = 32;

const calculatePointPosition = (currTemp) => {
  const normalizedTemp = (currTemp - MIN_TEMP) / (MAX_TEMP - MIN_TEMP);
  const angle = normalizedTemp * 180 + angleOffset;

  const radians = (angle * Math.PI) / 180;
  const radius = 116;

  const translateX = radius * Math.cos(radians);
  const translateY = radius * Math.sin(radians);

  return { translateX, translateY };
};

const setIndicatorPoint = (currTemp) => {
  const position = calculatePointPosition(currTemp);
  svgPoint.style.transform = `translate(${position.translateX}px, ${position.translateY}px)`;
};

// Handle the dropdown data
const roomSelect = document.getElementById("rooms");

const currentTemp = document.getElementById("temp");

let selectedRoom = rooms[0].name;

// Set default temperature
currentTemp.textContent = `${rooms[0].currTemp}°`;


document.querySelector(".currentTemp").innerText = `${rooms[0].currTemp}°`;
// Add new options from rooms array
rooms.forEach((room) => {
  const option = document.createElement("option");
  option.value = room.name;
  option.textContent = room.name;
  roomSelect.appendChild(option);
});

// Removed add new room option from dropdown

// Set current temperature to currently selected room

const setSelectedRoom = (selectedRoom) => {
  const room = rooms.find((currRoom) => currRoom.name === selectedRoom);
  setIndicatorPoint(room.currTemp);

  //   set the current stats to current room temperature
  currentTemp.textContent = `${room.currTemp}°`;

  // Set the current room image
  setOverlay(room);

  // Set the current room name
  document.querySelector(".room-name").innerText = selectedRoom;

  document.querySelector(".currentTemp").innerText = `${room.currTemp}°`;
};

roomSelect.addEventListener("change", function () {
  selectedRoom = this.value;

  setSelectedRoom(selectedRoom);
});


// Set preset temperatures
const defaultSettings = document.querySelector(".default-settings");
defaultSettings.addEventListener("click", function (e) {
  const room = rooms.find((currRoom) => currRoom.name === selectedRoom);
  if (e.target.id === 'cool') {
    room.setCurrTemp(room.coldPreset);
    coolBtn.style.backgroundColor = "#FFD7A8"; // Highlight cool button
    warmBtn.style.backgroundColor = "#d9d9d9";
  } else if (e.target.id === 'warm') {
    room.setCurrTemp(room.warmPreset);
    warmBtn.style.backgroundColor = "#FFD7A8"; // Highlight warm button
    coolBtn.style.backgroundColor = "#d9d9d9";
  }
  setIndicatorPoint(room.currTemp);
  currentTemp.textContent = `${room.currTemp}°`;
  setOverlay(room);
  document.querySelector(".currentTemp").innerText = `${room.currTemp}°`;
  generateRooms(); // Regenerate to update room control status
});

// Increase and decrease temperature
document.getElementById("increase").addEventListener("click", () => {
  const room = rooms.find((currRoom) => currRoom.name === selectedRoom);
  if (room.currTemp < 32) {
    room.increaseTemp();
  }

  setIndicatorPoint(room.currTemp);
  currentTemp.textContent = `${room.currTemp}°`;

  // Update only the current room control display
  const roomControl = document.getElementById(room.name);
  if (roomControl) {
    roomControl.querySelector(".room-name").innerText = `${room.name} - ${room.currTemp}°`;
    roomControl.querySelector(".room-status").innerText = `${room.currTemp > room.warmPreset ? "Cooling room to: " + room.coldPreset : "Warming room to: " + room.warmPreset}°`;
  }

  setOverlay(room);

  warmBtn.style.backgroundColor = "#d9d9d9";
  coolBtn.style.backgroundColor = "#d9d9d9";

  document.querySelector(".currentTemp").innerText = `${room.currTemp}°`;
});

document.getElementById("reduce").addEventListener("click", () => {
  const room = rooms.find((currRoom) => currRoom.name === selectedRoom);
  if (room.currTemp > MIN_TEMP) { // Use MIN_TEMP constant
    room.decreaseTemp();
  }

  setIndicatorPoint(room.currTemp);
  currentTemp.textContent = `${room.currTemp}°`;

  // Update only the current room control display
  const roomControl = document.getElementById(room.name);
  if (roomControl) {
    roomControl.querySelector(".room-name").innerText = `${room.name} - ${room.currTemp}°`;
    roomControl.querySelector(".room-status").innerText = `${room.currTemp > room.warmPreset ? "Cooling room to: " + room.coldPreset : "Warming room to: " + room.warmPreset}°`;
  }

  setOverlay(room);

  warmBtn.style.backgroundColor = "#d9d9d9";
  coolBtn.style.backgroundColor = "#d9d9d9";

  document.querySelector(".currentTemp").innerText = `${room.currTemp}°`;
});

const coolBtn = document.getElementById("cool");
const warmBtn = document.getElementById("warm");


const inputsDiv = document.querySelector(".inputs");
// Toggle preset inputs
document.getElementById("newPreset").addEventListener("click", () => {
  if (inputsDiv.classList.contains("hidden")) {
    inputsDiv.classList.remove("hidden");
    const currRoom = rooms.find((room) => room.name === selectedRoom);
    document.getElementById("coolInput").value = currRoom.coldPreset;
    document.getElementById("warmInput").value = currRoom.warmPreset;
  }
});

// close inputs
document.getElementById("close").addEventListener("click", () => {
  inputsDiv.classList.add("hidden");
});

// handle preset input data
document.getElementById("save").addEventListener("click", () => {
  const coolInput = document.getElementById("coolInput");
  const warmInput = document.getElementById("warmInput");
  const errorSpan = document.querySelector(".error");

  if (coolInput.value && warmInput.value) {
    // Validate the data
    if (parseInt(coolInput.value) < parseInt(coolInput.min) || parseInt(coolInput.value) > parseInt(coolInput.max)) {
      errorSpan.style.display = "block";
      errorSpan.innerText = `Enter valid temperatures for Cool (${coolInput.min}° - ${coolInput.max}°)`;
      return; // Stop execution if validation fails
    }

    if (parseInt(warmInput.value) < parseInt(warmInput.min) || parseInt(warmInput.value) > parseInt(warmInput.max)) {
      errorSpan.style.display = "block";
      errorSpan.innerText = `Enter valid temperatures for Warm (${warmInput.min}° - ${warmInput.max}°)`;
      return; // Stop execution if validation fails
    }

    // Validate that warm preset is not less than cool preset
    if (parseInt(warmInput.value) < parseInt(coolInput.value)) {
      errorSpan.style.display = "block";
      errorSpan.innerText = "Warm preset must be greater than or equal to Cool preset";
      return; // Stop execution if validation fails
    }

    // Validation passed
    // Set current room's presets
    const currRoom = rooms.find((room) => room.name === selectedRoom);

    currRoom.setColdPreset(parseInt(coolInput.value));
    currRoom.setWarmPreset(parseInt(warmInput.value));

    coolInput.value = "";
    warmInput.value = "";
    errorSpan.style.display = "none"; // Hide error message on success
  } else {
    errorSpan.style.display = "block";
    errorSpan.innerText = "Please enter values for both Cool and Warm presets";
  }
});

// Rooms Control
// Generate rooms
const generateRooms = () => {
  const roomsControlContainer = document.querySelector(".rooms-control");
  let roomsHTML = "";

  rooms.forEach((room) => {
    roomsHTML += `
    <div class="room-control" id="${room.name}">
          <div class="top">
            <h3 class="room-name">${room.name} : ${room.currTemp}°</h3>
            <button class="switch">
              <ion-icon name="power-outline" class="${
                room.airConditionerOn ? "powerOn" : ""
              }"></ion-icon>
            </button>
          </div>

          ${displayTime(room)}
         
          <span class="room-status" style="display: ${
            room.airConditionerOn ? "" : "none"
          }">${room.currTemp > room.warmPreset ? "Cooling room to: " + room.coldPreset : "Warming room to: " + room.warmPreset}°</span>
         </div>
     `;
  });

  const allAcsOn = rooms.every(room => room.airConditionerOn);
  const buttonText = allAcsOn ? "Turn Off All AC" : "Turn On All AC";

  roomsHTML = `
    <div class="turn-on-all">
      <button id="turn-on-all-acs">${buttonText}</button>
    </div>
  ` + roomsHTML;


 roomsControlContainer.innerHTML = roomsHTML;

  // Add event listeners to the time inputs
  rooms.forEach(room => {
    const roomControl = document.getElementById(room.name);
    if (roomControl) {
      const startTimeInput = roomControl.querySelector(".start-time-input");
      const endTimeInput = roomControl.querySelector(".end-time-input");

      startTimeInput.addEventListener("change", function() {
        const updatedRoom = rooms.find(r => r.name === room.name);
        if (updatedRoom) {
          updatedRoom.startTime = this.value;
          generateRooms(); // Re-render to show updated time
        }
      });

      endTimeInput.addEventListener("change", function() {
        const updatedRoom = rooms.find(r => r.name === room.name);
        if (updatedRoom) {
          updatedRoom.endTime = this.value;
          generateRooms(); // Re-render to show updated time
        }
      });

      // Add click listeners to show the time picker
      startTimeInput.addEventListener("click", function() {
        this.showPicker();
      });

      endTimeInput.addEventListener("click", function() {
        this.showPicker();
      });
    }
  });
};


const displayTime = (room) => {
  const now = new Date();
  const currentHours = now.getHours();
  const currentMinutes = now.getMinutes();
  const currentTimeInMinutes = currentHours * 60 + currentMinutes;

  const startHours = parseInt(room.startTime.split(':')[0]);
  const startMinutes = parseInt(room.startTime.split(':')[1]);
  const startTimeInMinutes = startHours * 60 + startMinutes;

  const endHours = parseInt(room.endTime.split(':')[0]);
  const endMinutes = parseInt(room.endTime.split(':')[1]);
  let endTimeInMinutes = endHours * 60 + endMinutes;

  // Handle cases where end time is on the next day
  if (endTimeInMinutes < startTimeInMinutes) {
    endTimeInMinutes += 24 * 60;
  }

  let barsHTML = '';
  const totalMinutesInDay = 24 * 60;
  const minutesPerBar = totalMinutesInDay / 32;

  for (let i = 0; i < 32; i++) {
    const barStartTime = i * minutesPerBar;
    const barEndTime = (i + 1) * minutesPerBar;
    let barClass = 'bar';

    // Check if the current time falls within the bar's time range
    if (currentTimeInMinutes >= barStartTime && currentTimeInMinutes < barEndTime) {
        barClass += ' current';
    }

    // Check if the bar's time range overlaps with the room's AC schedule
    let isScheduled = false;
    const originalEndTimeInMinutes = endHours * 60 + endMinutes; // Store original end time

    if (startTimeInMinutes <= originalEndTimeInMinutes) { // Schedule within the same day [startTimeInMinutes, originalEndTimeInMinutes)
        if (Math.max(barStartTime, startTimeInMinutes) < Math.min(barEndTime, originalEndTimeInMinutes)) {
            isScheduled = true;
        }
    } else { // Schedule spans across midnight [startTimeInMinutes, totalMinutesInDay) and [0, originalEndTimeInMinutes)
        const overlapsBeforeMidnight = Math.max(barStartTime, startTimeInMinutes) < Math.min(barEndTime, totalMinutesInDay);
        const overlapsAfterMidnight = Math.max(barStartTime, 0) < Math.min(barEndTime, originalEndTimeInMinutes);

        if (overlapsBeforeMidnight || overlapsAfterMidnight) {
            isScheduled = true;
        }
    }

    // Check if the bar should be active based on current time progression within the schedule
    if (isScheduled && barEndTime <= currentTimeInMinutes) {
        barClass += ' active';
    }


    barsHTML += `<span class="${barClass}"></span>`;
  }


  return `
      <div class="time-display" data-room-name="${room.name}">
        <input type="time" class="time-input start-time-input" value="${room.startTime}">
        <div class="bars">
          ${barsHTML}
        </div>
        <input type="time" class="time-input end-time-input" value="${room.endTime}">
      </div>
  `
}

generateRooms();

document.querySelector(".rooms-control").addEventListener("click", (e) => {
  if (e.target.classList.contains("switch")) {
    const room = rooms.find(
      (room) => room.name === e.target.parentNode.parentNode.id
    );
    room.toggleAircon();
    generateRooms();
  } else if (e.target.id === "turn-on-all-acs") {
    const allAcsOn = rooms.every(room => room.airConditionerOn);
    rooms.forEach(room => {
      if (allAcsOn) {
        if (room.airConditionerOn) {
          room.toggleAircon();
        }
      } else {
        if (!room.airConditionerOn) {
          room.toggleAircon();
        }
      }
    });
    generateRooms();
  }

  if (e.target.classList.contains("room-name")) {
    setSelectedRoom(e.target.parentNode.parentNode.id);
  }
});

function showModal() {
  document.getElementById("modalOverlay").style.display = "flex";
}

function closeModal() {
  document.getElementById("modalOverlay").style.display = "none";
}

function submitForm() {
  const nameInput = document.getElementById("name");
  const currTempInput = document.getElementById("currTemp");
  const coldPresetInput = document.getElementById("coldPreset");
  const warmPresetInput = document.getElementById("warmPreset");
  const roomImageInput = document.getElementById("room-image");
  const startTimeInput = document.getElementById("startTime");
  const endTimeInput = document.getElementById("endTime");

  const name = nameInput.value;
  const currTemp = parseInt(currTempInput.value);
  const coldPreset = parseInt(coldPresetInput.value);
  const warmPreset = parseInt(warmPresetInput.value);
  const imageFile = roomImageInput.files[0];
  const startTime = startTimeInput.value;
  const endTime = endTimeInput.value;


  if (!name || isNaN(currTemp) || isNaN(coldPreset) || isNaN(warmPreset) || !imageFile || !startTime || !endTime) {
    alert("Please fill in all fields and select an image.");
    return;
  }

  const imageUrl = URL.createObjectURL(imageFile); // Create object URL

  const newRoom = {
    name: name,
    currTemp: currTemp,
    coldPreset: coldPreset,
    warmPreset: warmPreset,
    image: imageUrl, // Use object URL for image
    airConditionerOn: false,
    startTime: startTime,
    endTime: endTime,

    setCurrTemp(temp) {
      this.currTemp = temp;
    },

    setColdPreset(newCold) {
      this.coldPreset = newCold;
    },

    setWarmPreset(newWarm) {
      this.warmPreset = newWarm;
    },

    decreaseTemp() {
      this.currTemp--;
    },

    increaseTemp() {
      this.currTemp++;
    },
    toggleAircon() {
      this.airConditionerOn
        ? (this.airConditionerOn = false)
        : (this.airConditionerOn = true);
    },
  };

  rooms.push(newRoom);
  generateRooms(); // Update room controls display
  updateRoomDropdown(); // Update the dropdown with the new room
  closeModal(); // hide the modal after submission

  // Clear the form
  nameInput.value = "";
  currTempInput.value = "";
  coldPresetInput.value = "";
  warmPresetInput.value = "";
  roomImageInput.value = ""; // Clear the file input
}

// Function to update the room dropdown
function updateRoomDropdown() {
  roomSelect.innerHTML = ''; // Clear existing options
  rooms.forEach((room) => {
    const option = document.createElement("option");
    option.value = room.name;
    option.textContent = room.name;
    roomSelect.appendChild(option);
  });
}

// Call updateRoomDropdown initially to populate the dropdown
updateRoomDropdown();

const addRoomButton = document.getElementById('add-room-button');

addRoomButton.addEventListener('click', () => {
 showModal();
  
});

document.getElementById("turn-on-all-acs").addEventListener("click", () => {
  rooms.forEach(room => {
    if (!room.airConditionerOn) {
      room.toggleAircon();
    }
  });
  generateRooms();
});

// Update the room display every minute to show time progression
setInterval(generateRooms, 60000);

// Automatically control AC based on time
const autoControlAirConditioners = () => {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  rooms.forEach(room => {
    const [startH, startM] = room.startTime.split(':').map(Number);
    const [endH, endM] = room.endTime.split(':').map(Number);

    const startMinutes = startH * 60 + startM;
    let endMinutes = endH * 60 + endM;

    const crossesMidnight = endMinutes < startMinutes;
    const isInRange = crossesMidnight
      ? currentMinutes >= startMinutes || currentMinutes < endMinutes
      : currentMinutes >= startMinutes && currentMinutes < endMinutes;

    if (isInRange && !room.airConditionerOn) {
      room.airConditionerOn = true;
    } else if (!isInRange && room.airConditionerOn) {
      room.airConditionerOn = false;
    }
  });

  generateRooms(); // Update display after changes
};

// Run auto control every minute
setInterval(autoControlAirConditioners, 60000);
autoControlAirConditioners(); // Run immediately at startup

