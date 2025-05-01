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

// Constants
const MIN_TEMP = 10;
const MAX_TEMP = 32;
const coolOverlay = `linear-gradient(
    to bottom,
    rgba(141, 158, 247, 0.2),
    rgba(194, 197, 215, 0.1)
  )`;
const warmOverlay = `linear-gradient(to bottom, rgba(236, 96, 98, 0.2), rgba(248, 210, 211, 0.13))`;
const angleOffset = 86;

// Pure function to get initial rooms data
const getInitialRooms = () => [
  createRoom("Bedroom", 31, 20, 32, "./assets/bedroom.jpg", '00:00', '12:00'),
  createRoom("Living Room", 32, 20, 32, "./assets/living-room.jpg", '00:00', '12:00'),
  createRoom("Kitchen", 29, 20, 32, "./assets/kitchen.jpg", '00:00', '12:00'),
  createRoom("Bathroom", 30, 20, 32, "./assets/bathroom.jpg", '00:00', '12:00'),
];

// Pure function to get overlay based on temperature
const getOverlay = (temp) => {
  return temp < 25 ? coolOverlay : warmOverlay;
};

// Pure function to calculate point position
const calculatePointPosition = (currTemp) => {
  const normalizedTemp = (currTemp - MIN_TEMP) / (MAX_TEMP - MIN_TEMP);
  const angle = normalizedTemp * 180 + angleOffset;

  const radians = (angle * Math.PI) / 180;
  const radius = 116;

  const translateX = radius * Math.cos(radians);
  const translateY = radius * Math.sin(radians);

  return { translateX, translateY };
};

// Pure function to get room by name
const getRoomByName = (rooms, roomName) => {
  return rooms.find((room) => room.name === roomName);
};

// Pure function to update room temperature
const updateRoomTemperature = (room, newTemp) => {
  const updatedRoom = { ...room };
  updatedRoom.currTemp = newTemp;
  return updatedRoom;
};

// Pure function to update room presets
const updateRoomPresets = (room, coldPreset, warmPreset) => {
  const updatedRoom = { ...room };
  updatedRoom.coldPreset = coldPreset;
  updatedRoom.warmPreset = warmPreset;
  return updatedRoom;
};

// Pure function to toggle room air conditioner
const toggleRoomAircon = (room) => {
  const updatedRoom = { ...room };
  updatedRoom.airConditionerOn = !updatedRoom.airConditionerOn;
  return updatedRoom;
};

// Pure function to toggle all air conditioners
const toggleAllAircons = (rooms, turnOn) => {
  return rooms.map(room => {
    const updatedRoom = { ...room };
    updatedRoom.airConditionerOn = turnOn;
    return updatedRoom;
  });
};

// Pure function to update room time settings
const updateRoomTime = (room, startTime, endTime) => {
  const updatedRoom = { ...room };
  updatedRoom.startTime = startTime;
  updatedRoom.endTime = endTime;
  return updatedRoom;
};

// Pure function to check if a room should have AC on based on time
const shouldACBeOn = (room, currentTimeInMinutes) => {
  const [startH, startM] = room.startTime.split(':').map(Number);
  const [endH, endM] = room.endTime.split(':').map(Number);

  const startMinutes = startH * 60 + startM;
  let endMinutes = endH * 60 + endM;

  const crossesMidnight = endMinutes < startMinutes;
  return crossesMidnight
    ? currentTimeInMinutes >= startMinutes || currentTimeInMinutes < endMinutes
    : currentTimeInMinutes >= startMinutes && currentTimeInMinutes < endMinutes;
};

// Pure function to generate time display bars HTML
const generateTimeBars = (room, currentTimeInMinutes) => {
  const totalMinutesInDay = 24 * 60;
  const minutesPerBar = totalMinutesInDay / 32;
  
  const startHours = parseInt(room.startTime.split(':')[0]);
  const startMinutes = parseInt(room.startTime.split(':')[1]);
  const startTimeInMinutes = startHours * 60 + startMinutes;

  const endHours = parseInt(room.endTime.split(':')[0]);
  const endMinutes = parseInt(room.endTime.split(':')[1]);
  const originalEndTimeInMinutes = endHours * 60 + endMinutes;
  
  let barsHTML = '';

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

    if (startTimeInMinutes <= originalEndTimeInMinutes) { // Schedule within the same day
      if (Math.max(barStartTime, startTimeInMinutes) < Math.min(barEndTime, originalEndTimeInMinutes)) {
        isScheduled = true;
      }
    } else { // Schedule spans across midnight
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

  return barsHTML;
};

// Pure function to generate time display HTML
const generateTimeDisplay = (room, currentTimeInMinutes) => {
  const barsHTML = generateTimeBars(room, currentTimeInMinutes);
  
  return `
    <div class="time-display" data-room-name="${room.name}">
      <input type="time" class="time-input start-time-input" value="${room.startTime}">
      <div class="bars">
        ${barsHTML}
      </div>
      <input type="time" class="time-input end-time-input" value="${room.endTime}">
    </div>
  `;
};

// Pure function to generate room control HTML
const generateRoomControlHTML = (room, currentTimeInMinutes) => {
  const timeDisplay = generateTimeDisplay(room, currentTimeInMinutes);
  
  return `
    <div class="room-control" id="${room.name}">
      <div class="top">
        <h3 class="room-name">${room.name} : ${room.currTemp}°</h3>
        <button class="switch">
          <ion-icon name="power-outline" class="${room.airConditionerOn ? "powerOn" : ""}"></ion-icon>
        </button>
      </div>

      ${timeDisplay}
     
      <span class="room-status" style="display: ${room.airConditionerOn ? "" : "none"}">
        ${room.currTemp > room.warmPreset ? "Cooling room to: " + room.coldPreset : "Warming room to: " + room.warmPreset}°
      </span>
    </div>
  `;
};

// Pure function to generate all rooms controls HTML
const generateRoomsControlHTML = (rooms, currentTimeInMinutes) => {
  const allAcsOn = rooms.every(room => room.airConditionerOn);
  const buttonText = allAcsOn ? "Turn Off All AC" : "Turn On All AC";
  
  let roomsHTML = rooms.map(room => generateRoomControlHTML(room, currentTimeInMinutes)).join('');
  
  return `
    <div class="turn-on-all">
      <button id="turn-on-all-acs">${buttonText}</button>
    </div>
    ${roomsHTML}
  `;
};

// Pure function to validate preset inputs
const validatePresetInputs = (coolValue, warmValue, minCool, maxCool, minWarm, maxWarm) => {
  const coolTemp = parseInt(coolValue);
  const warmTemp = parseInt(warmValue);
  
  if (isNaN(coolTemp) || isNaN(warmTemp)) {
    return { isValid: false, message: "Please enter values for both Cool and Warm presets" };
  }
  
  if (coolTemp < minCool || coolTemp > maxCool) {
    return { isValid: false, message: `Enter valid temperatures for Cool (${minCool}° - ${maxCool}°)` };
  }
  
  if (warmTemp < minWarm || warmTemp > maxWarm) {
    return { isValid: false, message: `Enter valid temperatures for Warm (${minWarm}° - ${maxWarm}°)` };
  }
  
  if (warmTemp < coolTemp) {
    return { isValid: false, message: "Warm preset must be greater than or equal to Cool preset" };
  }
  
  return { isValid: true, message: "" };
};

// Pure function to validate new room form
const validateNewRoomForm = (name, currTemp, coldPreset, warmPreset, imageFile, startTime, endTime) => {
  if (!name || isNaN(currTemp) || isNaN(coldPreset) || isNaN(warmPreset) || !imageFile || !startTime || !endTime) {
    return { isValid: false, message: "Please fill in all fields and select an image." };
  }
  
  return { isValid: true, message: "" };
};

// Pure function to create a new room object from form data
const createRoomFromForm = (name, currTemp, coldPreset, warmPreset, imageUrl, startTime, endTime) => {
  return createRoom(name, currTemp, coldPreset, warmPreset, imageUrl, startTime, endTime);
};

// Pure function to auto control air conditioners based on time
const autoControlACs = (rooms, currentTimeInMinutes) => {
  return rooms.map(room => {
    const shouldBeOn = shouldACBeOn(room, currentTimeInMinutes);
    if (shouldBeOn !== room.airConditionerOn) {
      return { ...room, airConditionerOn: shouldBeOn };
    }
    return room;
  });
};

// Application state and DOM interactions
let rooms = getInitialRooms();
let selectedRoom = rooms[0].name;

// Initialize the application
const initApp = () => {
  const roomSelect = document.getElementById("rooms");
  const currentTemp = document.getElementById("temp");
  
  // Set default temperature
  currentTemp.textContent = `${rooms[0].currTemp}°`;
  document.querySelector(".currentTemp").innerText = `${rooms[0].currTemp}°`;
  
  // Add options from rooms array
  updateRoomDropdown();
  
  // Set room overlay
  setInitialOverlay();
  
  // Set point position for first room
  setIndicatorPoint(rooms[0].currTemp);
  
  // Generate room controls
  refreshRoomsControl();
  
  // Add event listeners
  setupEventListeners();
  
  // Start auto control
  startAutoControl();
};

// DOM manipulation functions
const setInitialOverlay = () => {
  document.querySelector(".room").style.backgroundImage = `url('${rooms[0].image}')`;
  document.querySelector(".room").style.backgroundImage = `${getOverlay(rooms[0].currTemp)}, url('${rooms[0].image}')`;
};

const setOverlayDOM = (room) => {
  document.querySelector(".room").style.backgroundImage = `${getOverlay(room.currTemp)}, url('${room.image}')`;
};

const setIndicatorPoint = (currTemp) => {
  const position = calculatePointPosition(currTemp);
  document.querySelector(".point").style.transform = `translate(${position.translateX}px, ${position.translateY}px)`;
};

const updateRoomDropdown = () => {
  const roomSelect = document.getElementById("rooms");
  roomSelect.innerHTML = ''; // Clear existing options
  rooms.forEach((room) => {
    const option = document.createElement("option");
    option.value = room.name;
    option.textContent = room.name;
    roomSelect.appendChild(option);
  });
};

const setSelectedRoomDOM = (roomName) => {
  selectedRoom = roomName;
  const room = getRoomByName(rooms, roomName);
  
  setIndicatorPoint(room.currTemp);
  document.getElementById("temp").textContent = `${room.currTemp}°`;
  setOverlayDOM(room);
  document.querySelector(".room-name").innerText = roomName;
  document.querySelector(".currentTemp").innerText = `${room.currTemp}°`;
};

const refreshRoomsControl = () => {
  const now = new Date();
  const currentTimeInMinutes = now.getHours() * 60 + now.getMinutes();
  
  const roomsControlContainer = document.querySelector(".rooms-control");
  roomsControlContainer.innerHTML = generateRoomsControlHTML(rooms, currentTimeInMinutes);
  
  // Add event listeners to time inputs
  rooms.forEach(room => {
    const roomControl = document.getElementById(room.name);
    if (roomControl) {
      const startTimeInput = roomControl.querySelector(".start-time-input");
      const endTimeInput = roomControl.querySelector(".end-time-input");
      
      startTimeInput.addEventListener("change", function() {
        const updatedRoom = updateRoomTime(getRoomByName(rooms, room.name), this.value, room.endTime);
        rooms = rooms.map(r => r.name === updatedRoom.name ? updatedRoom : r);
        refreshRoomsControl();
      });
      
      endTimeInput.addEventListener("change", function() {
        const updatedRoom = updateRoomTime(getRoomByName(rooms, room.name), room.startTime, this.value);
        rooms = rooms.map(r => r.name === updatedRoom.name ? updatedRoom : r);
        refreshRoomsControl();
      });
      
      startTimeInput.addEventListener("click", function() {
        this.showPicker();
      });
      
      endTimeInput.addEventListener("click", function() {
        this.showPicker();
      });
    }
  });
};

const showModal = () => {
  document.getElementById("modalOverlay").style.display = "flex";
};

const closeModal = () => {
  document.getElementById("modalOverlay").style.display = "none";
};

const setupEventListeners = () => {
  // Room selection dropdown
  document.getElementById("rooms").addEventListener("change", function() {
    setSelectedRoomDOM(this.value);
  });
  
  // Increase/decrease temperature buttons
  document.getElementById("increase").addEventListener("click", () => {
    const room = getRoomByName(rooms, selectedRoom);
    if (room.currTemp < MAX_TEMP) {
      const updatedRoom = updateRoomTemperature(room, room.currTemp + 1);
      rooms = rooms.map(r => r.name === updatedRoom.name ? updatedRoom : r);
      
      setIndicatorPoint(updatedRoom.currTemp);
      document.getElementById("temp").textContent = `${updatedRoom.currTemp}°`;
      document.querySelector(".currentTemp").innerText = `${updatedRoom.currTemp}°`;
      setOverlayDOM(updatedRoom);
      
      // Reset button styles
      document.getElementById("warm").style.backgroundColor = "#d9d9d9";
      document.getElementById("cool").style.backgroundColor = "#d9d9d9";
      
      refreshRoomsControl();
    }
  });
  
  document.getElementById("reduce").addEventListener("click", () => {
    const room = getRoomByName(rooms, selectedRoom);
    if (room.currTemp > MIN_TEMP) {
      const updatedRoom = updateRoomTemperature(room, room.currTemp - 1);
      rooms = rooms.map(r => r.name === updatedRoom.name ? updatedRoom : r);
      
      setIndicatorPoint(updatedRoom.currTemp);
      document.getElementById("temp").textContent = `${updatedRoom.currTemp}°`;
      document.querySelector(".currentTemp").innerText = `${updatedRoom.currTemp}°`;
      setOverlayDOM(updatedRoom);
      
      // Reset button styles
      document.getElementById("warm").style.backgroundColor = "#d9d9d9";
      document.getElementById("cool").style.backgroundColor = "#d9d9d9";
      
      refreshRoomsControl();
    }
  });
  
  // Cool/warm preset buttons
  document.querySelector(".default-settings").addEventListener("click", function(e) {
    const room = getRoomByName(rooms, selectedRoom);
    let updatedRoom = room;
    
    if (e.target.id === 'cool') {
      updatedRoom = updateRoomTemperature(room, room.coldPreset);
      document.getElementById("cool").style.backgroundColor = "#FFD7A8";
      document.getElementById("warm").style.backgroundColor = "#d9d9d9";
    } else if (e.target.id === 'warm') {
      updatedRoom = updateRoomTemperature(room, room.warmPreset);
      document.getElementById("warm").style.backgroundColor = "#FFD7A8";
      document.getElementById("cool").style.backgroundColor = "#d9d9d9";
    }
    
    rooms = rooms.map(r => r.name === updatedRoom.name ? updatedRoom : r);
    
    setIndicatorPoint(updatedRoom.currTemp);
    document.getElementById("temp").textContent = `${updatedRoom.currTemp}°`;
    document.querySelector(".currentTemp").innerText = `${updatedRoom.currTemp}°`;
    setOverlayDOM(updatedRoom);
    
    refreshRoomsControl();
  });
  
  // Configure presets button
  document.getElementById("newPreset").addEventListener("click", () => {
    const inputsDiv = document.querySelector(".inputs");
    if (inputsDiv.classList.contains("hidden")) {
      inputsDiv.classList.remove("hidden");
      const currRoom = getRoomByName(rooms, selectedRoom);
      document.getElementById("coolInput").value = currRoom.coldPreset;
      document.getElementById("warmInput").value = currRoom.warmPreset;
    }
  });
  
  // Close preset inputs button
  document.getElementById("close").addEventListener("click", () => {
    document.querySelector(".inputs").classList.add("hidden");
  });
  
  // Save preset button
  document.getElementById("save").addEventListener("click", () => {
    const coolInput = document.getElementById("coolInput");
    const warmInput = document.getElementById("warmInput");
    const errorSpan = document.querySelector(".error");
    
    const validation = validatePresetInputs(
      coolInput.value, 
      warmInput.value, 
      parseInt(coolInput.min), 
      parseInt(coolInput.max), 
      parseInt(warmInput.min), 
      parseInt(warmInput.max)
    );
    
    if (validation.isValid) {
      const currRoom = getRoomByName(rooms, selectedRoom);
      const updatedRoom = updateRoomPresets(currRoom, parseInt(coolInput.value), parseInt(warmInput.value));
      rooms = rooms.map(r => r.name === updatedRoom.name ? updatedRoom : r);
      
      coolInput.value = "";
      warmInput.value = "";
      errorSpan.style.display = "none";
      document.querySelector(".inputs").classList.add("hidden");
    } else {
      errorSpan.style.display = "block";
      errorSpan.innerText = validation.message;
    }
  });
  
  // Room controls event delegation
  document.querySelector(".rooms-control").addEventListener("click", (e) => {
    if (e.target.classList.contains("switch")) {
      const roomName = e.target.parentNode.parentNode.id;
      const room = getRoomByName(rooms, roomName);
      const updatedRoom = toggleRoomAircon(room);
      rooms = rooms.map(r => r.name === updatedRoom.name ? updatedRoom : r);
      refreshRoomsControl();
    } else if (e.target.id === "turn-on-all-acs") {
      const allAcsOn = rooms.every(room => room.airConditionerOn);
      rooms = toggleAllAircons(rooms, !allAcsOn);
      refreshRoomsControl();
    }
    
    if (e.target.classList.contains("room-name")) {
      setSelectedRoomDOM(e.target.parentNode.parentNode.id);
    }
  });
  
  // Add room button
  document.getElementById('add-room-button').addEventListener('click', () => {
    showModal();
  });
  
  // Form submission
  document.getElementById("turn-on-all-acs").addEventListener("click", () => {
    rooms = toggleAllAircons(rooms, true);
    refreshRoomsControl();
  });
};

const submitForm = () => {
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
  
  const validation = validateNewRoomForm(name, currTemp, coldPreset, warmPreset, imageFile, startTime, endTime);
  
  if (!validation.isValid) {
    alert(validation.message);
    return;
  }
  
  const imageUrl = URL.createObjectURL(imageFile);
  const newRoom = createRoomFromForm(name, currTemp, coldPreset, warmPreset, imageUrl, startTime, endTime);
  
  rooms = [...rooms, newRoom];
  refreshRoomsControl();
  updateRoomDropdown();
  closeModal();
  
  // Clear the form
  nameInput.value = "";
  currTempInput.value = "";
  coldPresetInput.value = "";
  warmPresetInput.value = "";
  roomImageInput.value = "";
  startTimeInput.value = "";
  endTimeInput.value = "";
};

const startAutoControl = () => {
  // Auto control air conditioners based on time
  const runAutoControl = () => {
    const now = new Date();
    const currentTimeInMinutes = now.getHours() * 60 + now.getMinutes();
    rooms = autoControlACs(rooms, currentTimeInMinutes);
    refreshRoomsControl();
  };
  
  // Run every minute
  setInterval(runAutoControl, 60000);
  runAutoControl(); // Run immediately
  
  // Update room display with time progression
  setInterval(refreshRoomsControl, 60000);
};

// Initialize the app when DOM is loaded
if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', initApp);
  
  // Add these to global scope for HTML access
  window.showModal = showModal;
  window.closeModal = closeModal;
  window.submitForm = submitForm;
}

// Export functions for testing with Jest
if (typeof module !== 'undefined') {
  module.exports = {
    createRoom,
    getInitialRooms,
    getOverlay,
    calculatePointPosition,
    getRoomByName,
    updateRoomTemperature,
    updateRoomPresets,
    toggleRoomAircon,
    toggleAllAircons,
    updateRoomTime,
    shouldACBeOn,
    generateTimeBars,
    generateTimeDisplay,
    generateRoomControlHTML,
    generateRoomsControlHTML,
    validatePresetInputs,
    validateNewRoomForm,
    createRoomFromForm,
    autoControlACs,
    MIN_TEMP,
    MAX_TEMP
  };
}