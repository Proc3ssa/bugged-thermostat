# Bug Report

This report highlights the bugs identified and how they were addressed, including relevant code snippets.

## Identified Bugs and Fixes

1.  **Hardcoded Temperature Limits:**
    *   **Bug:** The logic for increasing and decreasing temperature used hardcoded values for the maximum and minimum temperature limits.
    *   **Code (Bugged):**
    ```javascript
    if (room.currTemp < 32) {
      increaseRoomTemperature();
    }
    // ...
    if (room.currTemp > 10) {
      decreaseRoomTemperature();
    }
    ```
    *   **Fix:** Introduced constants for the maximum and minimum temperatures and used these constants in the temperature control logic. This makes the limits easily configurable.
    *   **Code (Fixed):**
    ```javascript
    const MIN_TEMP = 10;
    const MAX_TEMP = 32;
    // ...
    if (room.currTemp < MAX_TEMP) {
      const updatedRoom = updateRoomTemperature(room, room.currTemp + 1);
      rooms = rooms.map(r => r.name === updatedRoom.name ? updatedRoom : r);
    }
    // ...
    if (room.currTemp > MIN_TEMP) {
      const updatedRoom = updateRoomTemperature(room, room.currTemp - 1);
      rooms = rooms.map(r => r.name === updatedRoom.name ? updatedRoom : r);
    }
    ```

2.  **Incorrect Preset Input Validation:**
    *   **Bug:** The validation for the warm preset input incorrectly checked against the range 10-32. There was also no check to ensure the warm preset was not less than the cool preset.
    *   **Code (Bugged):**
    ```javascript
    if (coolInput.value < 10 || coolInput.value > 25) {
      errorSpan.style.display = "block";
      errorSpan.innerText = "Enter valid temperatures (10° - 32°)";
    }

    if (warmInput.value < 25 || warmInput.value > 32) {
      errorSpan.style.display = "block";
      errorSpan.innerText = "Enter valid temperatures (10° - 32°)";
    }
    ```
    *   **Fix:** Implemented a dedicated validation function with correct range checks for both cool (10-25) and warm (25-32) presets, and added a check to ensure the warm preset is not less than the cool preset.
    *   **Code (Fixed):**
    ```javascript
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
    // ... used in event listener:
    const validation = validatePresetInputs(
      coolInput.value,
      warmInput.value,
      parseInt(coolInput.min),
      parseInt(coolInput.max),
      parseInt(warmInput.min),
      parseInt(warmInput.max)
    );
    ```

3.  **Direct Modification of Room Objects:**
    *   **Bug:** Event listeners directly modified the properties of room objects found in the `rooms` array. This can lead to less predictable state changes.
    *   **Code (Bugged - Example):**
    ```javascript
    room.increaseTemp();
    // ...
    room.decreaseTemp();
    // ...
    room.toggleAircon();
    ```
    *   **Fix:** Adopted a more functional approach where event listeners create updated copies of room objects using the spread syntax (`...room`) and replace the old objects in the `rooms` array using `map`. This promotes immutability.
    *   **Code (Fixed - Example):**
    ```javascript
    const updatedRoom = updateRoomTemperature(room, room.currTemp + 1);
    rooms = rooms.map(r => r.name === updatedRoom.name ? updatedRoom : r);
    // ...
    const updatedRoom = updateRoomTemperature(room, room.currTemp - 1);
    rooms = rooms.map(r => r.name === updatedRoom.name ? updatedRoom : r);
    // ...
    const updatedRoom = toggleRoomAircon(room);
    rooms = rooms.map(r => r.name === updatedRoom.name ? updatedRoom : r);
    ```

4.  **Repetitive Room Object Definition:**
    *   **Bug:** Each room object was defined individually as an object literal with repetitive properties and methods.
    *   **Code (Bugged - Snippet):**
    ```javascript
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
      // ... other room objects
    ];
    ```
    *   **Fix:** Introduced a `createRoom` factory function to generate room objects. This reduces code repetition and makes it easier to add or modify room properties.
    *   **Code (Fixed - Snippet):**
    ```javascript
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

    const getInitialRooms = () => [
      createRoom("Bedroom", 31, 20, 32, "./assets/bedroom.jpg", '00:00', '12:00'),
      // ... other rooms using createRoom
    ];
    let rooms = getInitialRooms();
    ```

5.  **Incorrect Room Status Display:**
    *   **Bug:** The room status message displayed the current temperature as the target temperature when the AC was on, regardless of whether it was cooling or warming.
    *   **Code (Bugged):**
    ```html
    <span class="room-status" style="display: ${
      room.airConditionerOn ? "" : "none"
    }">${room.currTemp > 25 ? "Cooling room to: " : "Warming room to: "}${
      room.currTemp
    }°</span>
    ```
    *   **Fix:** Corrected the room status display to show the appropriate preset temperature (cold or warm) that the AC is aiming for based on the current temperature relative to the warm preset.
    *   **Code (Fixed):**
    ```html
    <span class="room-status" style="display: ${room.airConditionerOn ? "" : "none"}">
      ${room.currTemp > room.warmPreset ? "Cooling room to: " + room.coldPreset : "Warming room to: " + room.warmPreset}°
    </span>
    ```

6.  **Dropdown Value Issue:**
    *   **Bug:** The value of the dropdown options was incorrectly set to the entire room object instead of a simple identifier like the room's name.
    *   **Code (Bugged):**
    ```javascript
    option.value = room;
    ```
    *   **Fix:** Correctly sets the dropdown option value to the room's name.
    *   **Code (Fixed):**
    ```javascript
    option.value = room.name;
    ```

7.  **Preset Input Fields Not Pre-filled:**
    *   **Bug:** When the "Configure Presets" button was clicked, the input fields for cool and warm presets were empty, requiring the user to manually enter the current presets before making changes.
    *   **Code (Bugged - Snippet):**
    ```javascript
    document.getElementById("newPreset").addEventListener("click", () => {
      if (inputsDiv.classList.contains("hidden")) {
        inputsDiv.classList.remove("hidden");
      }
    });
    ```
    *   **Fix:** Now pre-fills the cool and warm preset input fields with the currently selected room's preset values when the configuration section is shown.
    *   **Code (Fixed - Snippet):**
    ```javascript
    document.getElementById("newPreset").addEventListener("click", () => {
      const inputsDiv = document.querySelector(".inputs");
      if (inputsDiv.classList.contains("hidden")) {
        inputsDiv.classList.remove("hidden");
        const currRoom = getRoomByName(rooms, selectedRoom);
        document.getElementById("coolInput").value = currRoom.coldPreset;
        document.getElementById("warmInput").value = currRoom.warmPreset;
      }
    });
    ```

These fixes improve the code's correctness, maintainability, and user experience.