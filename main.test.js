import main from './main';
import { JSDOM } from 'jsdom';

// Set up a basic DOM environment using jsdom
const dom = new JSDOM('<!doctype html><html><body></body></html>');
global.document = dom.window.document;
global.window = dom.window;
global.URL = { createObjectURL: jest.fn() }; // Mock URL.createObjectURL

// Mock necessary DOM elements and methods
const mockElement = {
  style: {},
  classList: {
    contains: jest.fn(),
    remove: jest.fn(),
    add: jest.fn(),
  },
  innerText: '',
  value: '',
  files: [],
  appendChild: jest.fn(),
  addEventListener: jest.fn(),
  querySelector: jest.fn(() => mockElement),
  querySelectorAll: jest.fn(() => [mockElement]),
  parentNode: {
    parentNode: {
      id: 'Test Room' // Mock parentNode for event delegation tests
    }
  },
  id: '',
};

jest.spyOn(document, 'querySelector').mockImplementation((selector) => {
  if (selector === ".point") {
    return mockElement; // Return mockElement for the point
  }
  if (selector === ".room") {
    return mockElement; // Return mockElement for the room
  }
  if (selector === ".rooms-control") {
    return mockElement; // Return mockElement for the rooms-control container
  }
  if (selector === ".inputs") {
    return mockElement; // Return mockElement for the inputs div
  }
  if (selector === ".error") {
    return mockElement; // Return mockElement for the error span
  }
  if (selector === ".room-name") {
    return mockElement; // Return mockElement for room-name
  }
  if (selector === ".room-status") {
    return mockElement; // Return mockElement for room-status
  }
  if (selector === ".start-time-input") {
    return mockElement; // Mock time inputs
  }
  if (selector === ".end-time-input") {
    return mockElement; // Mock time inputs
  }
  return mockElement; // Default return
});

jest.spyOn(document, 'getElementById').mockImplementation((id) => {
  if (id === "rooms") {
    return mockElement; // Mock the rooms select element
  }
  if (id === "temp") {
    return mockElement; // Mock the temperature display element
  }
  if (id === "increase") {
    return mockElement; // Mock increase button
  }
  if (id === "reduce") {
    return mockElement; // Mock reduce button
  }
  if (id === "cool") {
    return mockElement; // Mock cool button
  }
  if (id === "warm") {
    return mockElement; // Mock warm button
  }
  if (id === "newPreset") {
    return mockElement; // Mock newPreset button
  }
  if (id === "close") {
    return mockElement; // Mock close button
  }
  if (id === "save") {
    return mockElement; // Mock save button
  }
  if (id === "coolInput") {
    return { ...mockElement, value: '20', min: '10', max: '30' }; // Mock cool input with value and min/max
  }
  if (id === "warmInput") {
    return { ...mockElement, value: '30', min: '25', max: '35' }; // Mock warm input with value and min/max
  }
  if (id === "modalOverlay") {
    return mockElement; // Mock modal overlay
  }
  if (id === "name") {
    return { ...mockElement, value: 'New Room' }; // Mock name input
  }
  if (id === "currTemp") {
    return { ...mockElement, value: '22' }; // Mock currTemp input
  }
  if (id === "coldPreset") {
    return { ...mockElement, value: '19' }; // Mock coldPreset input
  }
  if (id === "warmPreset") {
    return { ...mockElement, value: '29' }; // Mock warmPreset input
  }
  if (id === "room-image") {
    return { ...mockElement, files: [{ name: 'test.jpg' }] }; // Mock file input
  }
  if (id === "turn-on-all-acs") {
    return mockElement; // Mock turn-on-all-acs button
  }
  return mockElement; // Default return
});

jest.spyOn(document, 'createElement').mockImplementation((tagName) => {
  if (tagName === 'option') {
    return { value: '', textContent: '' }; // Mock option element
  }
  if (tagName === 'span') {
    return { className: '' }; // Mock span element for bars
  }
  return {}; // Default return
});


describe('createRoom', () => {
  test('should create a room object with correct properties', () => {
    const room = main.createRoom("Test Room", 25, 18, 28, "./assets/test.jpg", '08:00', '17:00');
    expect(room.name).toBe("Test Room");
    expect(room.currTemp).toBe(25);
    expect(room.coldPreset).toBe(18);
    expect(room.warmPreset).toBe(28);
    expect(room.image).toBe("./assets/test.jpg");
    expect(room.startTime).toBe('08:00');
    expect(room.endTime).toBe('17:00');
    expect(room.airConditionerOn).toBe(false);
  });

  test('should set current temperature', () => {
    const room = main.createRoom("Test Room", 25, 18, 28, "./assets/test.jpg", '08:00', '17:00');
    room.setCurrTemp(30);
    expect(room.currTemp).toBe(30);
  });

  test('should set cold preset', () => {
    const room = main.createRoom("Test Room", 25, 18, 28, "./assets/test.jpg", '08:00', '17:00');
    room.setColdPreset(15);
    expect(room.coldPreset).toBe(15);
  });

  test('should set warm preset', () => {
    const room = main.createRoom("Test Room", 25, 18, 28, "./assets/test.jpg", '08:00', '17:00');
    room.setWarmPreset(30);
    expect(room.warmPreset).toBe(30);
  });

  test('should decrease temperature', () => {
    const room = main.createRoom("Test Room", 25, 18, 28, "./assets/test.jpg", '08:00', '17:00');
    room.decreaseTemp();
    expect(room.currTemp).toBe(24);
  });

  test('should increase temperature', () => {
    const room = main.createRoom("Test Room", 25, 18, 28, "./assets/test.jpg", '08:00', '17:00');
    room.increaseTemp();
    expect(room.currTemp).toBe(26);
  });

  test('should toggle air conditioner status', () => {
    const room = main.createRoom("Test Room", 25, 18, 28, "./assets/test.jpg", '08:00', '17:00');
    room.toggleAircon();
    expect(room.airConditionerOn).toBe(true);
    room.toggleAircon();
    expect(room.airConditionerOn).toBe(false);
  });
});

describe('calculatePointPosition', () => {
  test('should calculate correct point position for a given temperature', () => {
    const position = main.calculatePointPosition(21); // Assuming MIN_TEMP=10, MAX_TEMP=32
    // These values are approximate based on the formula, may need adjustment
    expect(position.translateX).toBeCloseTo(-115.9);
    expect(position.translateY).toBeCloseTo(5.9);
  });
});

// Add tests for other functions here, mocking DOM interactions as needed
describe('setInitialOverlay', () => {
  test('should set the initial background image and overlay', () => {
    main.setInitialOverlay();
    expect(document.querySelector).toHaveBeenCalledWith(".room");
    expect(mockElement.style.backgroundImage).toContain("url('./assets/living-room.jpg')");
  });
});

describe('setOverlay', () => {
  test('should set the background image and overlay based on room temperature', () => {
    const room = main.createRoom("Test Room", 20, 18, 28, "./assets/test.jpg", '08:00', '17:00');
    main.setOverlay(room);
    expect(document.querySelector).toHaveBeenCalledWith(".room");
    expect(mockElement.style.backgroundImage).toContain("url('./assets/test.jpg')");
    expect(mockElement.style.backgroundImage).toContain("rgba(141, 158, 247, 0.2)"); // Cool overlay
  });

  test('should set the warm overlay for temperatures >= 25', () => {
    const room = main.createRoom("Test Room", 30, 18, 28, "./assets/test.jpg", '08:00', '17:00');
    main.setOverlay(room);
    expect(document.querySelector).toHaveBeenCalledWith(".room");
    expect(mockElement.style.backgroundImage).toContain("url('./assets/test.jpg')");
    expect(mockElement.style.backgroundImage).toContain("rgba(236, 96, 98, 0.2)"); // Warm overlay
  });
});

describe('setIndicatorPoint', () => {
  test('should set the transform style of the indicator point', () => {
    main.setIndicatorPoint(25);
    expect(document.querySelector).toHaveBeenCalledWith(".point");
    expect(mockElement.style.transform).toContain("translate(");
  });
});

describe('setSelectedRoom', () => {
  test('should update the display based on the selected room', () => {
    // Mock the rooms array globally or pass it to the function if possible
    // For now, assuming rooms is accessible
    const rooms = [
      main.createRoom("Living Room", 32, 20, 32, "./assets/living-room.jpg", '16:30', '20:00'),
      main.createRoom("Kitchen", 29, 20, 32, "./assets/kitchen.jpg", '16:30', '20:00'),
    ];
    // Need to mock the global rooms array or refactor main.js to pass it
    // For now, let's assume rooms is globally available for testing purposes
    global.rooms = rooms;

    main.setSelectedRoom("Kitchen");
    expect(document.querySelector).toHaveBeenCalledWith(".point");
    expect(document.querySelector).toHaveBeenCalledWith(".room");
    expect(document.querySelector).toHaveBeenCalledWith(".room-name");
    expect(document.querySelector).toHaveBeenCalledWith(".currentTemp");
    expect(mockElement.textContent).toBe("29°");
    expect(mockElement.innerText).toBe("Kitchen");
    expect(mockElement.innerText).toBe("29°");
  });
});

describe('generateRooms', () => {
  test('should generate HTML for room controls', () => {
    // Mock the rooms array globally or pass it to the function if possible
    const rooms = [
      main.createRoom("Living Room", 32, 20, 32, "./assets/living-room.jpg", '16:30', '20:00'),
    ];
    global.rooms = rooms;

    main.generateRooms();
    expect(document.querySelector).toHaveBeenCalledWith(".rooms-control");
    expect(mockElement.innerHTML).toContain("Living Room");
    expect(mockElement.innerHTML).toContain("32°");
  });
});

describe('displayTime', () => {
  test('should generate HTML for time display with bars', () => {
    const room = main.createRoom("Test Room", 25, 18, 28, "./assets/test.jpg", '08:00', '17:00');
    const timeHTML = main.displayTime(room);
    expect(timeHTML).toContain('<input type="time" class="time-input start-time-input" value="08:00">');
    expect(timeHTML).toContain('<input type="time" class="time-input end-time-input" value="17:00">');
    expect(timeHTML).toContain('<div class="bars">');
    expect(timeHTML).toContain('<span class="bar"></span>'); // Should contain multiple bars
  });
});

describe('showModal', () => {
  test('should set modal display to flex', () => {
    main.showModal();
    expect(document.getElementById).toHaveBeenCalledWith("modalOverlay");
    expect(mockElement.style.display).toBe("flex");
  });
});

describe('closeModal', () => {
  test('should set modal display to none', () => {
    main.closeModal();
    expect(document.getElementById).toHaveBeenCalledWith("modalOverlay");
    expect(mockElement.style.display).toBe("none");
  });
});

describe('submitForm', () => {
  test('should create a new room and add it to the rooms array', () => {
    // Mock the rooms array globally or pass it to the function if possible
    global.rooms = []; // Start with an empty rooms array

    main.submitForm();

    // Check if a new room was added (assuming submitForm adds to the global rooms array)
    expect(global.rooms.length).toBe(1);
    expect(global.rooms[0].name).toBe('New Room');
    expect(global.rooms[0].currTemp).toBe(22);
    expect(global.rooms[0].coldPreset).toBe(19);
    expect(global.rooms[0].warmPreset).toBe(29);
    expect(global.rooms[0].image).toBeUndefined(); // URL.createObjectURL is mocked, so image will be undefined
    expect(global.URL.createObjectURL).toHaveBeenCalled();
  });

  test('should show alert if form fields are empty', () => {
    const originalAlert = global.alert;
    global.alert = jest.fn(); // Mock alert

    // Mock inputs to be empty
    jest.spyOn(document, 'getElementById').mockImplementation((id) => {
      if (id === "name") {
        return { ...mockElement, value: '' }; // Empty name input
      }
      if (id === "currTemp") {
        return { ...mockElement, value: '' }; // Empty currTemp input
      }
      if (id === "coldPreset") {
        return { ...mockElement, value: '' }; // Empty coldPreset input
      }
      if (id === "warmPreset") {
        return { ...mockElement, value: '' }; // Empty warmPreset input
      }
      if (id === "room-image") {
        return { ...mockElement, files: [] }; // No file selected
      }
      return mockElement; // Default return
    });

    main.submitForm();
    expect(global.alert).toHaveBeenCalledWith("Please fill in all fields and select an image.");

    global.alert = originalAlert; // Restore original alert
  });
});

describe('updateRoomDropdown', () => {
  test('should clear existing options and add new options from rooms array', () => {
    // Mock the rooms array globally or pass it to the function if possible
    const rooms = [
      main.createRoom("Living Room", 32, 20, 32, "./assets/living-room.jpg", '16:30', '20:00'),
      main.createRoom("Kitchen", 29, 20, 32, "./assets/kitchen.jpg", '16:30', '20:00'),
    ];
    global.rooms = rooms;

    // Mock the roomSelect element and its child nodes
    const mockRoomSelect = {
      innerHTML: '<option value="old">Old Room</option>', // Simulate existing options
      appendChild: jest.fn(),
    };
    jest.spyOn(document, 'getElementById').mockImplementation((id) => {
      if (id === "rooms") {
        return mockRoomSelect;
      }
      return mockElement; // Default return
    });
    jest.spyOn(document, 'createElement').mockImplementation((tagName) => {
      if (tagName === 'option') {
        return { value: '', textContent: '' }; // Mock option element
      }
      return {}; // Default return
    });


    main.updateRoomDropdown();

    expect(mockRoomSelect.innerHTML).toBe(''); // Should clear existing options
    expect(document.createElement).toHaveBeenCalledWith("option"); // Should create new options
    expect(mockRoomSelect.appendChild).toHaveBeenCalledTimes(rooms.length); // Should append options for each room
  });
});