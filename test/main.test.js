// Import functions to test
const {
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
  } = require('../main');
  
  // Mock global objects
  global.document = {
    createElement: jest.fn(() => ({
      appendChild: jest.fn(),
      value: '',
      textContent: ''
    }))
  };
  
  describe('Room Factory and Operations', () => {
    test('createRoom creates a room with correct properties', () => {
      const room = createRoom('Test Room', 25, 20, 30, 'test.jpg', '08:00', '20:00');
      
      expect(room).toEqual(expect.objectContaining({
        name: 'Test Room',
        currTemp: 25,
        coldPreset: 20,
        warmPreset: 30,
        image: 'test.jpg',
        startTime: '08:00',
        endTime: '20:00',
        airConditionerOn: false
      }));
      
      expect(typeof room.setCurrTemp).toBe('function');
      expect(typeof room.setColdPreset).toBe('function');
      expect(typeof room.setWarmPreset).toBe('function');
      expect(typeof room.decreaseTemp).toBe('function');
      expect(typeof room.increaseTemp).toBe('function');
      expect(typeof room.toggleAircon).toBe('function');
    });
    
    test('room methods work correctly', () => {
      const room = createRoom('Test Room', 25, 20, 30, 'test.jpg', '08:00', '20:00');
      
      room.setCurrTemp(26);
      expect(room.currTemp).toBe(26);
      
      room.setColdPreset(19);
      expect(room.coldPreset).toBe(19);
      
      room.setWarmPreset(31);
      expect(room.warmPreset).toBe(31);
      
      room.decreaseTemp();
      expect(room.currTemp).toBe(25);
      
      room.increaseTemp();
      expect(room.currTemp).toBe(26);
      
      room.toggleAircon();
      expect(room.airConditionerOn).toBe(true);
      
      room.toggleAircon();
      expect(room.airConditionerOn).toBe(false);
    });
    
    test('getInitialRooms returns array with correct rooms', () => {
      const rooms = getInitialRooms();
      
      expect(Array.isArray(rooms)).toBe(true);
      expect(rooms.length).toBe(4);
      
      // Check if all rooms have the required properties
      rooms.forEach(room => {
        expect(room).toHaveProperty('name');
        expect(room).toHaveProperty('currTemp');
        expect(room).toHaveProperty('coldPreset');
        expect(room).toHaveProperty('warmPreset');
        expect(room).toHaveProperty('image');
        expect(room).toHaveProperty('startTime');
        expect(room).toHaveProperty('endTime');
        expect(room).toHaveProperty('airConditionerOn');
      });
      
      // Check specific room names
      const roomNames = rooms.map(room => room.name);
      expect(roomNames).toContain('Bedroom');
      expect(roomNames).toContain('Living Room');
      expect(roomNames).toContain('Kitchen');
      expect(roomNames).toContain('Bathroom');
    });
  });
  
  describe('UI and Style Functions', () => {
    test('getOverlay returns cool overlay for temperatures below 25', () => {
      const overlay = getOverlay(20);
      expect(overlay).toContain('rgba(141, 158, 247, 0.2)');
    });
    
    test('getOverlay returns warm overlay for temperatures 25 and above', () => {
      const overlay = getOverlay(25);
      expect(overlay).toContain('rgba(236, 96, 98, 0.2)');
    });
    
    test('calculatePointPosition returns correct position based on temperature', () => {
      const position1 = calculatePointPosition(MIN_TEMP);
      const position2 = calculatePointPosition(MAX_TEMP);
      const position3 = calculatePointPosition((MIN_TEMP + MAX_TEMP) / 2);
      
      // Test minimum temperature position
      expect(position1.translateX).toBeCloseTo(0, 0);
      expect(position1.translateY).toBeCloseTo(116, 0);
      
      // Test maximum temperature position
      expect(position2.translateX).toBeCloseTo(-116, 0);
      expect(position2.translateY).toBeCloseTo(0, 0);
      
      // Test middle temperature position (approximately)
      expect(Math.abs(position3.translateX)).toBeLessThan(116);
      expect(Math.abs(position3.translateY)).toBeLessThan(116);
    });
  });
  
  describe('Room Management Functions', () => {
    const testRooms = [
      createRoom('Bedroom', 25, 20, 30, 'bedroom.jpg', '08:00', '20:00'),
      createRoom('Living Room', 27, 19, 29, 'living.jpg', '09:00', '21:00')
    ];
    
    test('getRoomByName finds the correct room', () => {
      const room = getRoomByName(testRooms, 'Living Room');
      expect(room.name).toBe('Living Room');
      expect(room.currTemp).toBe(27);
    });
    
    test('getRoomByName returns undefined for non-existent room', () => {
      const room = getRoomByName(testRooms, 'Non-existent Room');
      expect(room).toBeUndefined();
    });
    
    test('updateRoomTemperature updates temperature without modifying original', () => {
      const originalRoom = testRooms[0];
      const updatedRoom = updateRoomTemperature(originalRoom, 23);
      
      expect(updatedRoom.currTemp).toBe(23);
      expect(originalRoom.currTemp).toBe(25); // Original shouldn't change
      expect(updatedRoom).not.toBe(originalRoom); // Should be a new object
    });
    
    test('updateRoomPresets updates presets without modifying original', () => {
      const originalRoom = testRooms[0];
      const updatedRoom = updateRoomPresets(originalRoom, 18, 32);
      
      expect(updatedRoom.coldPreset).toBe(18);
      expect(updatedRoom.warmPreset).toBe(32);
      expect(originalRoom.coldPreset).toBe(20); // Original shouldn't change
      expect(originalRoom.warmPreset).toBe(30); // Original shouldn't change
    });
    
    test('toggleRoomAircon toggles AC state without modifying original', () => {
      const originalRoom = testRooms[0];
      const updatedRoom = toggleRoomAircon(originalRoom);
      
      expect(updatedRoom.airConditionerOn).toBe(true);
      expect(originalRoom.airConditionerOn).toBe(false); // Original shouldn't change
    });
    
    test('toggleAllAircons turns all ACs on', () => {
      const updatedRooms = toggleAllAircons(testRooms, true);
      
      expect(updatedRooms[0].airConditionerOn).toBe(true);
      expect(updatedRooms[1].airConditionerOn).toBe(true);
      expect(testRooms[0].airConditionerOn).toBe(false); // Original shouldn't change
      expect(testRooms[1].airConditionerOn).toBe(false); // Original shouldn't change
    });
    
    test('toggleAllAircons turns all ACs off', () => {
      // First make a copy with ACs on
      const roomsWithAcOn = testRooms.map(room => ({...room, airConditionerOn: true}));
      const updatedRooms = toggleAllAircons(roomsWithAcOn, false);
      
      expect(updatedRooms[0].airConditionerOn).toBe(false);
      expect(updatedRooms[1].airConditionerOn).toBe(false);
      expect(roomsWithAcOn[0].airConditionerOn).toBe(true); // Original shouldn't change
      expect(roomsWithAcOn[1].airConditionerOn).toBe(true); // Original shouldn't change
    });
    
    test('updateRoomTime updates time settings without modifying original', () => {
      const originalRoom = testRooms[0];
      const updatedRoom = updateRoomTime(originalRoom, '07:00', '19:00');
      
      expect(updatedRoom.startTime).toBe('07:00');
      expect(updatedRoom.endTime).toBe('19:00');
      expect(originalRoom.startTime).toBe('08:00'); // Original shouldn't change
      expect(originalRoom.endTime).toBe('20:00'); // Original shouldn't change
    });
  });
  
  describe('Time and Schedule Functions', () => {
    const room = createRoom('Test Room', 25, 20, 30, 'test.jpg', '08:00', '20:00');
    const midnightRoom = createRoom('Night Room', 25, 20, 30, 'test.jpg', '22:00', '06:00');
    
    test('shouldACBeOn returns true when current time is within schedule', () => {
      const currentTimeInMinutes = 12 * 60; // 12:00
      expect(shouldACBeOn(room, currentTimeInMinutes)).toBe(true);
    });
    
    test('shouldACBeOn returns false when current time is outside schedule', () => {
      const currentTimeInMinutes = 7 * 60; // 07:00
      expect(shouldACBeOn(room, currentTimeInMinutes)).toBe(false);
    });
    
    test('shouldACBeOn handles schedules that cross midnight', () => {
      const eveningTime = 23 * 60; // 23:00
      const earlyMorningTime = 5 * 60; // 05:00
      const outsideTime = 10 * 60; // 10:00
      
      expect(shouldACBeOn(midnightRoom, eveningTime)).toBe(true);
      expect(shouldACBeOn(midnightRoom, earlyMorningTime)).toBe(true);
      expect(shouldACBeOn(midnightRoom, outsideTime)).toBe(false);
    });
    
    test('generateTimeBars produces 32 bar spans', () => {
      const currentTimeInMinutes = 12 * 60; // 12:00
      const barsHTML = generateTimeBars(room, currentTimeInMinutes);
      
      // Count the number of spans
      const spanMatches = barsHTML.match(/<span class="bar/g);
      expect(spanMatches).toHaveLength(32);
    });
    
    test('generateTimeBars marks active bars correctly', () => {
      const currentTimeInMinutes = 12 * 60; // 12:00
      const barsHTML = generateTimeBars(room, currentTimeInMinutes);
      
      // Check for active bars (those that fall within schedule and before current time)
      expect(barsHTML).toContain('bar active');
      
      // The current bar should have 'current' class
      expect(barsHTML).toContain('bar current');
    });
    
    test('generateTimeDisplay produces HTML with time inputs and bars', () => {
      const currentTimeInMinutes = 12 * 60; // 12:00
      const timeDisplayHTML = generateTimeDisplay(room, currentTimeInMinutes);
      
      expect(timeDisplayHTML).toContain('<div class="time-display"');
      expect(timeDisplayHTML).toContain(`value="${room.startTime}"`);
      expect(timeDisplayHTML).toContain(`value="${room.endTime}"`);
      expect(timeDisplayHTML).toContain('<div class="bars">');
    });
  });
  
  describe('Room Control HTML Generation', () => {
    const room = createRoom('Test Room', 25, 20, 30, 'test.jpg', '08:00', '20:00', true);
    const rooms = [
      room,
      createRoom('Another Room', 28, 21, 29, 'another.jpg', '09:00', '21:00')
    ];
    const currentTimeInMinutes = 12 * 60; // 12:00
    
    test('generateRoomControlHTML includes room name and temperature', () => {
      const html = generateRoomControlHTML(room, currentTimeInMinutes);
      
      expect(html).toContain(`<h3 class="room-name">${room.name} : ${room.currTemp}°</h3>`);
    });
    
    test('generateRoomControlHTML shows power status correctly', () => {
      const html = generateRoomControlHTML(room, currentTimeInMinutes);
      
      expect(html).toContain(`<ion-icon name="power-outline" class="powerOn"></ion-icon>`);
    });
    
    test('generateRoomControlHTML displays room status when AC is on', () => {
      const html = generateRoomControlHTML(room, currentTimeInMinutes);
      
      expect(html).toContain(`<span class="room-status" style="display: ">`);
      expect(html).toContain(`Cooling room to: ${room.coldPreset}°`);
    });
    
    test('generateRoomControlHTML hides room status when AC is off', () => {
      const offRoom = {...room, airConditionerOn: false};
      const html = generateRoomControlHTML(offRoom, currentTimeInMinutes);
      
      expect(html).toContain(`<span class="room-status" style="display: none">`);
    });
    
    test('generateRoomsControlHTML includes toggle all button', () => {
      const html = generateRoomsControlHTML(rooms, currentTimeInMinutes);
      
      expect(html).toContain(`<div class="turn-on-all">`);
      expect(html).toContain(`<button id="turn-on-all-acs">`);
    });
    
    test('generateRoomsControlHTML has correct button text based on AC states', () => {
      const allOn = rooms.map(r => ({...r, airConditionerOn: true}));
      const allOff = rooms.map(r => ({...r, airConditionerOn: false}));
      
      const htmlAllOn = generateRoomsControlHTML(allOn, currentTimeInMinutes);
      const htmlAllOff = generateRoomsControlHTML(allOff, currentTimeInMinutes);
      
      expect(htmlAllOn).toContain(`>Turn Off All AC<`);
      expect(htmlAllOff).toContain(`>Turn On All AC<`);
    });
    
    test('generateRoomsControlHTML includes all room controls', () => {
      const html = generateRoomsControlHTML(rooms, currentTimeInMinutes);
      
      rooms.forEach(room => {
        expect(html).toContain(`id="${room.name}"`);
      });
    });
  });
  
  describe('Form Validation Functions', () => {
    test('validatePresetInputs accepts valid temperatures', () => {
      const result = validatePresetInputs('20', '28', 15, 24, 25, 35);
      
      expect(result.isValid).toBe(true);
      expect(result.message).toBe('');
    });
    
    test('validatePresetInputs rejects missing values', () => {
      const result = validatePresetInputs('', '28', 15, 24, 25, 35);
      
      expect(result.isValid).toBe(false);
      expect(result.message).toContain('enter values for both');
    });
    
    test('validatePresetInputs enforces cool temperature range', () => {
      const result = validatePresetInputs('14', '28', 15, 24, 25, 35);
      
      expect(result.isValid).toBe(false);
      expect(result.message).toContain('Enter valid temperatures for Cool');
    });
    
    test('validatePresetInputs enforces warm temperature range', () => {
      const result = validatePresetInputs('20', '36', 15, 24, 25, 35);
      
      expect(result.isValid).toBe(false);
      expect(result.message).toContain('Enter valid temperatures for Warm');
    });
    
    test('validatePresetInputs requires warm >= cool', () => {
      const result = validatePresetInputs('26', '25', 15, 30, 25, 35);
      
      expect(result.isValid).toBe(false);
      expect(result.message).toContain('Warm preset must be greater than or equal to Cool preset');
    });
    
    test('validateNewRoomForm accepts complete form data', () => {
      const result = validateNewRoomForm('Room', 25, 20, 30, {name: 'image.jpg'}, '08:00', '20:00');
      
      expect(result.isValid).toBe(true);
      expect(result.message).toBe('');
    });
    
    test('validateNewRoomForm rejects incomplete form data', () => {
      const result = validateNewRoomForm('Room', 25, 20, null, {name: 'image.jpg'}, '08:00', '20:00');
      
      expect(result.isValid).toBe(false);
      expect(result.message).toContain('Please fill in all fields');
    });
  });
  
  describe('Room Creation and Auto Control', () => {
    test('createRoomFromForm creates a room with correct properties', () => {
      const room = createRoomFromForm('Test Room', 25, 20, 30, 'test.jpg', '08:00', '20:00');
      
      expect(room.name).toBe('Test Room');
      expect(room.currTemp).toBe(25);
      expect(room.coldPreset).toBe(20);
      expect(room.warmPreset).toBe(30);
      expect(room.image).toBe('test.jpg');
      expect(room.startTime).toBe('08:00');
      expect(room.endTime).toBe('20:00');
      expect(room.airConditionerOn).toBe(false);
    });
    
    test('autoControlACs turns on ACs based on schedule', () => {
      const rooms = [
        createRoom('Room 1', 25, 20, 30, 'test.jpg', '08:00', '20:00', false),
        createRoom('Room 2', 27, 21, 29, 'test.jpg', '14:00', '22:00', false)
      ];
      
      // Time that's within Room 1's schedule but outside Room 2's
      const currentTimeInMinutes = 10 * 60; // 10:00
      
      const updatedRooms = autoControlACs(rooms, currentTimeInMinutes);
      
      expect(updatedRooms[0].airConditionerOn).toBe(true); // Should be turned on
      expect(updatedRooms[1].airConditionerOn).toBe(false); // Should remain off
    });
    
    test('autoControlACs turns off ACs based on schedule', () => {
      const rooms = [
        createRoom('Room 1', 25, 20, 30, 'test.jpg', '08:00', '20:00', true),
        createRoom('Room 2', 27, 21, 29, 'test.jpg', '14:00', '22:00', true)
      ];
      
      // Time that's outside both rooms' schedules
      const currentTimeInMinutes = 6 * 60; // 06:00
      
      const updatedRooms = autoControlACs(rooms, currentTimeInMinutes);
      
      expect(updatedRooms[0].airConditionerOn).toBe(false); // Should be turned off
      expect(updatedRooms[1].airConditionerOn).toBe(false); // Should be turned off
    });
    
    test('autoControlACs handles schedules that cross midnight', () => {
      const rooms = [
        createRoom('Night Room', 25, 20, 30, 'test.jpg', '22:00', '06:00', false)
      ];
      
      // Time within the overnight schedule
      const nightTimeInMinutes = 23 * 60; // 23:00
      const updatedRoomsNight = autoControlACs(rooms, nightTimeInMinutes);
      expect(updatedRoomsNight[0].airConditionerOn).toBe(true);
      
      // Time within the early morning schedule
      const morningTimeInMinutes = 5 * 60; // 05:00
      const updatedRoomsMorning = autoControlACs(rooms, morningTimeInMinutes);
      expect(updatedRoomsMorning[0].airConditionerOn).toBe(true);
      
      // Time outside the schedule
      const middayTimeInMinutes = 12 * 60; // 12:00
      const updatedRoomsMidday = autoControlACs(rooms, middayTimeInMinutes);
      expect(updatedRoomsMidday[0].airConditionerOn).toBe(false);
    });
  });
  
  // Additional tests for edge cases and constants
  describe('Edge Cases and Constants', () => {
    test('MIN_TEMP and MAX_TEMP have appropriate values', () => {
      expect(MIN_TEMP).toBeLessThan(MAX_TEMP);
      expect(MIN_TEMP).toBe(10);
      expect(MAX_TEMP).toBe(32);
    });
    
    test('calculatePointPosition handles min and max temperatures', () => {
      const minPosition = calculatePointPosition(MIN_TEMP);
      const maxPosition = calculatePointPosition(MAX_TEMP);
      
      expect(minPosition.translateX).toBeDefined();
      expect(minPosition.translateY).toBeDefined();
      expect(maxPosition.translateX).toBeDefined();
      expect(maxPosition.translateY).toBeDefined();
    });
  });