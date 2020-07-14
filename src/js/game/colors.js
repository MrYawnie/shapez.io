/** @enum {string} */
export const enumColors = {
    red: "red",
    green: "green",
    blue: "blue",

    yellow: "yellow",
    purple: "purple",
    cyan: "cyan",

    white: "white",
    uncolored: "uncolored",

    black: "black",
};

/** @enum {string} */
export const enumColorToShortcode = {
    [enumColors.red]: "r",
    [enumColors.green]: "g",
    [enumColors.blue]: "b",

    [enumColors.yellow]: "y",
    [enumColors.purple]: "p",
    [enumColors.cyan]: "c",

    [enumColors.white]: "w",
    [enumColors.uncolored]: "u",

    [enumColors.black]: "0",
};

/** @enum {enumColors} */
export const enumShortcodeToColor = {};
for (const key in enumColorToShortcode) {
    enumShortcodeToColor[enumColorToShortcode[key]] = key;
}

/** @enum {string} */
const enumColorsToHexCodeNormal = {
    [enumColors.red]: "#ff666a",
    [enumColors.green]: "#78ff66",
    [enumColors.blue]: "#66a7ff",

    // red + green
    [enumColors.yellow]: "#fcf52a",

    // red + blue
    [enumColors.purple]: "#dd66ff",

    // blue + green
    [enumColors.cyan]: "#00fcff",

    // blue + green + red
    [enumColors.white]: "#ffffff",

    [enumColors.black]: "#31383a",

    [enumColors.uncolored]: "#aaaaaa",
};

/* L (red) cone deficiency */
const enumColorsToHexCodeProtanopia = {
    [enumColors.red]: "#ff0000",
    [enumColors.green]: "#009e73",
    [enumColors.blue]: "#0072b2",

    // red + green
    [enumColors.yellow]: "#f0e442",

    // red + blue
    [enumColors.purple]: "#ff79dd",

    // blue + green
    [enumColors.cyan]: "#56b4e9",

    // blue + green + red
    [enumColors.white]: "#ffffff",

    [enumColors.black]: "#31383a",

    [enumColors.uncolored]: "#aaaaaa",
};

/* M (green) cone deficiency */
const enumColorsToHexCodeDeuteranopia = {
    [enumColors.red]: "#d55e00",
    [enumColors.green]: "#00de73",
    [enumColors.blue]: "#0072b2",

    // red + green
    [enumColors.yellow]: "#f0e442",

    // red + blue
    [enumColors.purple]: "#cc79a7",

    // blue + green
    [enumColors.cyan]: "#56dbe9",

    // blue + green + red
    [enumColors.white]: "#ffffff",

    [enumColors.black]: "#31383a",

    [enumColors.uncolored]: "#aaaaaa",
};

/* S (blue) cone deficiency */
const enumColorsToHexCodeTritanopia = {
    [enumColors.red]: "#d55e00",
    [enumColors.green]: "#00be46",
    [enumColors.blue]: "#0072b2",

    // red + green
    [enumColors.yellow]: "#f0e442",

    // red + blue
    [enumColors.purple]: "#cc79ba",

    // blue + green
    [enumColors.cyan]: "#56b4e9",

    // blue + green + red
    [enumColors.white]: "#ffffff",

    [enumColors.black]: "#31383a",

    [enumColors.uncolored]: "#aaaaaa",
};

/** @enum {enumColors} */
export const enumInvertedColors = {
    [enumColors.red]: enumColors.cyan,
    [enumColors.green]: enumColors.purple,
    [enumColors.blue]: enumColors.yellow,

    [enumColors.yellow]: enumColors.blue,
    [enumColors.purple]: enumColors.green,
    [enumColors.cyan]: enumColors.red,

    [enumColors.white]: enumColors.black,
    [enumColors.black]: enumColors.white,

    [enumColors.uncolored]: enumColors.uncolored,
};

const c = enumColors;
/** @enum {Object.<string, string>} */
export const enumColorMixingResults = {
    // 255, 0, 0
    [c.red]: {
        [c.green]: c.yellow,
        [c.blue]: c.purple,

        [c.yellow]: c.yellow,
        [c.purple]: c.purple,
        [c.cyan]: c.white,

        [c.white]: c.white,
        [c.black]: c.red,
    },

    // 0, 255, 0
    [c.green]: {
        [c.blue]: c.cyan,

        [c.yellow]: c.yellow,
        [c.purple]: c.white,
        [c.cyan]: c.cyan,

        [c.white]: c.white,
        [c.black]: c.green,
    },

    // 0, 255, 0
    [c.blue]: {
        [c.yellow]: c.white,
        [c.purple]: c.purple,
        [c.cyan]: c.cyan,

        [c.white]: c.white,
        [c.black]: c.blue,
    },

    // 255, 255, 0
    [c.yellow]: {
        [c.purple]: c.white,
        [c.cyan]: c.white,
        [c.black]: c.yellow,
    },

    // 255, 0, 255
    [c.purple]: {
        [c.cyan]: c.white,
        [c.black]: c.purple,
    },

    // 0, 255, 255
    [c.cyan]: {},

    //// SPECIAL COLORS

    // 255, 255, 255
    [c.white]: {
        // auto
    },

    // X, X, X
    [c.uncolored]: {
        // auto
    },

    [c.black]: {
        // auto
        [c.white]: c.uncolored,
        [c.cyan]: c.cyan,
        [c.uncolored]: c.uncolored,
    },
};

// Create same color lookups
for (const color in enumColors) {
    enumColorMixingResults[color][color] = color;

    // Anything with white is white again, except for black which creates gray
    if (color !== enumColors.black) {
        enumColorMixingResults[color][c.white] = c.white;
    }

    // Anything with uncolored is the same color
    enumColorMixingResults[color][c.uncolored] = color;
}

// Create reverse lookup and check color mixing lookups
for (const colorA in enumColorMixingResults) {
    for (const colorB in enumColorMixingResults[colorA]) {
        const resultColor = enumColorMixingResults[colorA][colorB];
        if (!enumColorMixingResults[colorB]) {
            enumColorMixingResults[colorB] = {
                [colorA]: resultColor,
            };
        } else {
            const existingResult = enumColorMixingResults[colorB][colorA];
            if (existingResult && existingResult !== resultColor) {
                assertAlways(
                    false,
                    "invalid color mixing configuration, " +
                        colorA +
                        " + " +
                        colorB +
                        " is " +
                        resultColor +
                        " but " +
                        colorB +
                        " + " +
                        colorA +
                        " is " +
                        existingResult
                );
            }
            enumColorMixingResults[colorB][colorA] = resultColor;
        }
    }
}

for (const colorA in enumColorMixingResults) {
    for (const colorB in enumColorMixingResults) {
        if (!enumColorMixingResults[colorA][colorB]) {
            assertAlways(false, "Color mixing of", colorA, "with", colorB, "is not defined");
        }
    }
}

export class Colors {
    constructor(root){
        this.root = root;
    }

    getColorEnumInUse(){
        // TODO:
        // Read setting and choose which enum to return
        if (this.root.app.settings.getAllSettings().enableColorBlindHelper === true) {
            return enumColorsToHexCodeProtanopia;
        } else {
            return enumColorsToHexCodeNormal;
        }
    }

    setColorEnumInUse(){
        // TODO:
        // Cycle setting allowing to choose color pallettes
    }
}