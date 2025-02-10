export const COORDINATES_MAP = {
    // Main Board Path
    0: [6, 13],  1: [6, 12],  2: [6, 11],  3: [6, 10],  4: [6, 9],  5: [5, 8],  
    6: [4, 8],   7: [3, 8],   8: [2, 8],   9: [1, 8],  10: [0, 8],  11: [0, 7],  
    12: [0, 6],  13: [1, 6],  14: [2, 6],  15: [3, 6],  16: [4, 6],  17: [5, 6],  
    18: [6, 5],  19: [6, 4],  20: [6, 3],  21: [6, 2],  22: [6, 1],  23: [6, 0],  
    24: [7, 0],  25: [8, 0],  26: [8, 1],  27: [8, 2],  28: [8, 3],  29: [8, 4],  
    30: [8, 5],  31: [9, 6],  32: [10, 6], 33: [11, 6], 34: [12, 6], 35: [13, 6],  
    36: [14, 6], 37: [14, 7], 38: [14, 8], 39: [13, 8], 40: [12, 8], 41: [11, 8],  
    42: [10, 8], 43: [9, 8],  44: [8, 9],  45: [8, 10], 46: [8, 11], 47: [8, 12],  
    48: [8, 13], 49: [8, 14], 50: [7, 14], 51: [6, 14], // End of Board Loop
    
    // HOME ENTRANCE (aligned for each player)

    // BLUE
    100: [7, 13], 101: [7, 12], 102: [7, 11], 103: [7, 10], 104: [7, 9], 105: [7, 8],

    // YELLOW
    200: [1, 7],  201: [2, 7],  202: [3, 7],  203: [4, 7],  204: [5, 7],  205: [6, 7],

    // GREEN
    300: [7, 1],  301: [7, 2],  302: [7, 3],  303: [7, 4],  304: [7, 5],  305: [7, 6],

    // RED
    400: [13, 7], 401: [12, 7], 402: [11, 7], 403: [10, 7], 404: [9, 7], 405: [8, 7],

    // BASE POSITIONS (where pieces start)

    // BLUE
    500: [1.5, 10.58], 501: [3.57, 10.58], 502: [1.5, 12.43], 503: [3.57, 12.43],

    // YELLOW
    600: [1.5, 1.58],  601: [3.57, 1.58],  602: [1.5, 3.45],  603: [3.57, 3.45],
    
    // GREEN
    700: [10.5, 1.58], 701: [12.54, 1.58], 702: [10.5, 3.45], 703: [12.54, 3.45],

    // RED
    800: [10.5, 12.43], 801: [12.54, 12.43], 802: [10.5, 10.58], 803: [12.54, 10.58],
};

export const STEP_LENGTH = 6.66;

export const PLAYERS = ['BLUE', 'YELLOW', 'GREEN', 'RED'];

export const BASE_POSITIONS = {
    BLUE: [500, 501, 502, 503],
    YELLOW: [600, 601, 602, 603],
    GREEN: [700, 701, 702, 703],
    RED: [800, 801, 802, 803]
};

export const START_POSITIONS = {
    BLUE: 0,
    YELLOW: 13,
    GREEN: 26,  
    RED: 39
};

export const HOME_ENTRANCE = {
    BLUE: [100, 101, 102, 103, 104],
    YELLOW: [200, 201, 202, 203, 204],
    GREEN: [300, 301, 302, 303, 304],
    RED: [400, 401, 402, 403, 404]
};

export const HOME_POSITIONS = {
    BLUE: 105,
    YELLOW: 205,
    GREEN: 305,
    RED: 405
};

// TURNING POINTS - When players enter their home path
export const TURNING_POINTS = {
    BLUE: 50,
    YELLOW: 11,
    GREEN: 24, 
    RED: 37 
};

// SAFE POSITIONS - Locations where players cannot be killed
export const SAFE_POSITIONS = [0, 8, 13, 21, 26, 34, 39, 47];

export const STATE = {
    DICE_NOT_ROLLED: 'DICE_NOT_ROLLED',
    DICE_ROLLED: 'DICE_ROLLED',
};
