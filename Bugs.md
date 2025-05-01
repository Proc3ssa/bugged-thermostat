# Bug Report: skilled-thermostat-debugger/main.js vs main.js

This report highlights the bugs found in `skilled-thermostat-debugger/main.js` and how they were fixed in `main.js`.

## Summary of Bugs and Fixes

The `skilled-thermostat-debugger/main.js` file contained several bugs related to code structure, variable usage, input validation, and dynamic updates. The `main.js` file addresses these issues by introducing a factory function for room objects, correcting variable assignments, using constants for temperature ranges, improving input validation, implementing dynamic time display, adding event listeners for time inputs, and including a feature to control all AC units.

## Detailed Breakdown of Bugs and Fixes

### 1. Code Structure and Room Object Creation

**Bug in `skilled-thermostat-debugger/main.js`:**
The room objects are defined directly as an array of literals, leading to repetitive code for each room's properties and methods.

```javascript
// Room objects
const rooms = [
  {
    name: "Living Room",
    currTemp: 32,
    coldPreset: 20,
    warmPreset: 32,
    image: "./assets/living-room.jpg",
    airConditionerOn: false,
    startTime: '16:30',
    endTime: '20:00',

    setCurrTemp(temp) {
      this.currTemp = temp;
    },
    // ... other methods
  },
  // ... other rooms
];
```

**Fix in `main.js`:**
A factory function `createRoom` is introduced to encapsulate the logic for creating room objects, promoting code reusability and maintainability.

```javascript
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
  // ... other methods
});

// Room objects
const rooms = [
  createRoom("Living Room", 32, 20, 32, "./assets/living-room.jpg", '16:30', '20:00'),
  // ... other rooms
];
```

### 2. Swapped Overlay Variable Definitions

**Bug in `skilled-thermostat-debugger/main.js`:**
The variable names `warmOverlay` and `coolOverlay` are assigned the incorrect gradient styles.

```javascript
const warmOverlay= `linear-gradient(
    to bottom,
    rgba(141, 158, 247, 0.2),
    rgba(194, 197, 215, 0.1)
  )`; // This is actually the cool gradient

const coolOverlay = `linear-gradient(to bottom, rgba(236, 96, 98, 0.2), rgba(248, 210, 211, 0.13))`; // This is actually the warm gradient
```

**Fix in `main.js`:**
The variable names are corrected to match the intended gradient styles.

```javascript
const coolOverlay= `linear-gradient(
    to bottom,
    rgba(141, 158, 247, 0.2),
    rgba(194, 197, 215, 0.1)
  )`; // Correct cool gradient

const warmOverlay = `linear-gradient(to bottom, rgba(236, 96, 98, 0.2), rgba(248, 210, 211, 0.13))`; // Correct warm gradient
```

### 3. Hardcoded Temperature Values

**Bug in `skilled-thermostat-debugger/main.js`:**
Hardcoded values (10 and 32) are used for the minimum and maximum temperature in `calculatePointPosition` and the `reduce` event listener.

```javascript
const calculatePointPosition = (currTemp) => {
  const normalizedTemp = (currTemp - 10) / (32 - 10); // Hardcoded values
  // ...
};

document.getElementById("reduce").addEventListener("click", () => {
  const room = rooms.find((currRoom) => currRoom.name === selectedRoom);
  const decreaseRoomTemperature = room.decreaseTemp;

  if (room.currTemp > 10) { // Hardcoded value
    decreaseRoomTemperature();
  }
  // ...
});
```

**Fix in `main.js`:**
Constants `MIN_TEMP` and `MAX_TEMP` are introduced for better maintainability.

```javascript
const MIN_TEMP = 10;
const MAX_TEMP = 32;

const calculatePointPosition = (currTemp) => {
  const normalizedTemp = (currTemp - MIN_TEMP) / (MAX_TEMP - MIN_TEMP); // Using constants
  // ...
};

document.getElementById("reduce").addEventListener("click", () => {
  const room = rooms.find((currRoom) => currRoom.name === selectedRoom);
  if (room.currTemp > MIN_TEMP) { // Using constant
    room.decreaseTemp();
  }
  // ...
});
```

### 4. Incorrect Dropdown Option Value

**Bug in `skilled-thermostat-debugger/main.js`:**
The entire room object is assigned as the value of the dropdown option instead of just the room name.

```javascript
rooms.forEach((room) => {
  const option = document.createElement("option");
  option.value = room; // Assigning the entire room object
  option.textContent = room.name;
  roomSelect.appendChild(option);
});
```

**Fix in `main.js`:**
The room name is correctly assigned as the value of the dropdown option.

```javascript
rooms.forEach((room) => {
  const option = document.createElement("option");
  option.value = room.name; // Assigning the room name
  option.textContent = room.name;
  roomSelect.appendChild(option);
});
```

### 5. Insufficient Preset Input Validation

**Bug in `skilled-thermostat-debugger/main.js`:**
The validation for preset inputs is basic and does not prevent invalid temperature ranges or the warm preset being less than the cool preset.

```javascript
document.getElementById("save").addEventListener("click", () => {
  // ...
  if (coolInput.value && warmInput.value) {
    // Validate the data
    if (coolInput.value < 10 || coolInput.value > 25) { // Basic validation
      errorSpan.style.display = "block";
      errorSpan.innerText = "Enter valid temperatures (10° - 32°)";
    }

    if (warmInput.value < 25 || warmInput.value > 32) { // Basic validation
      errorSpan.style.display = "block";
      errorSpan.innerText = "Enter valid temperatures (10° - 32°)";
    }
    // ...
  }
});
```

**Fix in `main.js`:**
More robust validation is added, including checking against input element min/max attributes and ensuring the warm preset is not less than the cool preset.

```javascript
document.getElementById("save").addEventListener("click", () => {
  // ...
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
    // ...
  }
});
```

### 6. Incorrect Room Status Display

**Bug in `skilled-thermostat-debugger/main.js`:**
The room status displays the current temperature instead of the target preset temperature when the AC is on.

```javascript
<span class="room-status" style="display: ${
  room.airConditionerOn ? "" : "none"
}">${room.currTemp > 25 ? "Cooling room to: " : "Warming room to: "}${
  room.currTemp // Displays current temperature
}°</span>
```

**Fix in `main.js`:**
The room status correctly displays the appropriate preset temperature.

```javascript
<span class="room-status" style="display: ${
  room.airConditionerOn ? "" : "none"
}">${room.currTemp > room.warmPreset ? "Cooling room to: " + room.coldPreset : "Warming room to: " + room.warmPreset}°</span> // Displays preset temperature
```

### 7. Static Time Display

**Bug in `skilled-thermostat-debugger/main.js`:**
The time display uses a fixed set of bars and does not dynamically represent the AC schedule or current time.

```javascript
const displayTime = (room) => {
  return `
      <div class="time-display">
        <span class="time">${room.startTime}</span>
        <div class="bars">
          <span class="bar"></span>
          <span class="bar"></span>
          // ... fixed bars
        </div>
        <span class="time">${room.endTime}</span>
      </div>
  `
}
```

**Fix in `main.js`:**
The `displayTime` function is updated to dynamically generate and style time bars based on the room's schedule and the current time, including handling schedules that span across midnight.

```javascript
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
```

### 8. Missing Event Listeners for Time Inputs

**Bug in `skilled-thermostat-debugger/main.js`:**
Event listeners are not attached to the dynamically created time input elements, preventing updates to the room schedules.

**Fix in `main.js`:**
Event listeners are added to the start and end time inputs within the `generateRooms` function to capture changes and update the room objects and display.

```javascript
generateRooms();

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
  }
});
```

### 9. Missing "Turn On All AC" Button

**Bug in `skilled-thermostat-debugger/main.js`:**
There is no button to control the AC for all rooms simultaneously.

**Fix in `main.js`:**
A "Turn On All AC" button is added with functionality to toggle the AC status for all rooms.

```javascript
const allAcsOn = rooms.every(room => room.airConditionerOn);
const buttonText = allAcsOn ? "Turn Off All AC" : "Turn On All AC";

roomsHTML = `
  <div class="turn-on-all">
    <button id="turn-on-all-acs">${buttonText}</button>
  </div>
` + roomsHTML;

// ... event listener for the button
document.querySelector(".rooms-control").addEventListener("click", (e) => {
  // ... other event handling
  else if (e.target.id === "turn-on-all-acs") {
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
  // ...
});
```

### 10. Duplication of Room Object Structure in `submitForm`

**Bug in `skilled-thermostat-debugger/main.js`:**
The structure and methods of the new room object are duplicated within the `submitForm` function instead of using the `createRoom` factory function.

```javascript
function submitForm() {
  // ...
  const newRoom = { // Duplicated structure and methods
    name: name,
    currTemp: currTemp,
    coldPreset: coldPreset,
    warmPreset: warmPreset,
    image: imageUrl,
    airConditionerOn: false,
    startTime: '16:30',
    endTime: '20:00',

    setCurrTemp(temp) {
      this.currTemp = temp;
    },
    // ... other methods
  };
  // ...
}
```

**Fix in `main.js`:**
The `createRoom` factory function is used to create the new room object, adhering to the DRY principle.

```javascript
function submitForm() {
  // ...
  const newRoom = createRoom( // Using the factory function
    name,
    currTemp,
    coldPreset,
    warmPreset,
    imageUrl,
    '16:30', // Default values
    '20:00'    // Default values
  );
  // ...
}