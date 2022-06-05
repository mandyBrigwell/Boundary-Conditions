"use strict";

// Boundary Conditions
// 2022 Mandy Brigwell
// Fonts from Google Fonts, released under open source licenses and usable in any non-commercial or commercial project.

var nameOfPiece = "Boundary Conditions";
var shortNameOfPiece = "BoundaryConditions";

var randomSeedValue = ~~(fxrand() * 12345);
var noiseSeedValue = ~~(fxrand() * 56789);

// Graphics buffers, resolution, frames and rendering
var theCanvas, renderBuffer, saveBuffer, gridBuffer;
var graphicsBuffers = [];
var renderFlags = [];
var instructionText, poem;
var fullRes = 2048;
var requiredFrames, instanceDensity;
var firstRenderComplete = false;
var screenSize;

// These are the graphics layers, in the order they will be rendered
const buffer = {
  background: 0,
  dunes: 1,
  grains: 2,
  sand: 3,
  bokeh: 4,
  shapes: 5,
  shading: 6,
};

// Overlay shapes
var overlayCircles = [];
var overlayRectangles = [];
var overlayRectanglesGreyValue;

// Instance values: these affect the whole piece, regardless of what's going on with each layer
// They are generated in the initiate() function before being passed to window.$fxhashfeatures
var instanceBackground,
  instanceBackgroundImageFading,
  instanceBackgroundIsColoured,
  instanceBackgroundTint,
  instanceBackgroundTintSaturation,
  instanceIsDiagonal,
  instanceSaturation,
  instanceScale,
  instanceSmallRotation,
  instanceMainRotation,
  instanceIsTilted;

// Sand: These variables control the number of striations, and stretch the noise used to generate it in the x- and y-directions
var xNoiseModifier, yNoiseModifier;
var sandLevels;

// Background: These control the background layer, a blurred, faded, fuzzy layer of colour
// The same value is also used to influence the bokeh layer hue values
var backgroundHue, backgroundHueRange, backgroundIntensity;

// Bokeh Layer
var bokehIsVariant;

// Block values: These affect individual blocks within the instance
var allowRectanglesToBeSplit,
  allowRectanglesToBeBlank,
  allowBlocksToBeReflected,
  allowBlocksToBeRotated,
  blockShiftingXAllowed,
  blockShiftingYAllowed,
  rectangleSplitNoiseType,
  blockReflectionNoiseType,
  blockRotationNoiseType,
  blockRotationRange;

// STRIATIONS
var striationHue, striationHueRange, striationHueVariant;

var overlayCirclesAreFilled;
var rendering;
var xFade, yFade;
var sectorsH, sectorsV;
var noiseShiftX, noiseShiftY, blankRectangleNoiseType;

// Testing modes. Controlled with shift-T, shift-S, shift-C, provided TESTINGENABLED is true
var TESTINGENABLED = true;
var TESTMODE = false;
var SAVECANVAS = false;
var SAVESAVEBUFFER = false;
var RENDERCOUNT = 0;
var RENDERSREQUIRED = 64;

// Sizes for the rendering canvases
const strokeSize = {
  zero: 0,
  half: fullRes / 4096,
  one: fullRes / 2048,
  two: fullRes / 1024,
  three: fullRes / 768,
  four: fullRes / 256,
  five: fullRes / 32,
};

// Prepare fonts for preloading
var titleFont, poemFont;

// HUD Variables
var infoTargetAlpha = 0;
var infoAlpha = 0;
var poem;
var poemTargetAlpha = 0;
var poemAlpha = 0;
var titleTargetAlpha = 0;
var titleAlpha = 360;
var messageAlpha = 360;
var messageString =
  "A generative artwork by Mandy Brigwell\nPress 'I' for information";
var startFrame, endFrame, requiredFrames;
var infoText;

// Flags
var firstRenderComplete = false;
var currentlyRendering = false;

// Define hash-value-dependent parameters
initiate();

window.$fxhashFeatures = {
  "Grid Subdivision":
    sectorsH * sectorsV === 1
      ? "None"
      : sectorsH * sectorsV < 9
      ? "Low"
      : sectorsH * sectorsV > 64
      ? "High"
      : "Medium",
  "Sand levels": sandLevels,
  "Instance rotation": instanceIsDiagonal
    ? "Diagonal"
    : instanceIsTilted
    ? "Slight"
    : "None",
  "Instance scale":
    instanceScale === 1
      ? "Normal"
      : instanceScale <= 0.75
      ? "Small"
      : instanceScale < 1
      ? "Smaller"
      : "Larger",
  "Instance density":
    instanceDensity === 1 ? "Normal" : instanceDensity < 1 ? "Low" : "High",
  "Bokeh Variation": bokehIsVariant ? "Variant 1" : "Variant 2",
  "Sector Splitting": allowRectanglesToBeSplit
    ? "Variant " + rectangleSplitNoiseType
    : "None",
  "Sector Reflection": allowBlocksToBeReflected
    ? "Variant " + blockReflectionNoiseType
    : "None",
  "Sector Rotation": allowBlocksToBeRotated
    ? "Variant " + blockRotationNoiseType
    : "None",
  "Sector Shifting": blockShiftingXAllowed
    ? blockShiftingYAllowed
      ? "Both axes"
      : "X-axis"
    : blockShiftingYAllowed
    ? "Y-axis"
    : "None",
  "Circle overlays":
    overlayCircles.length === 0 ? "None" : overlayCircles.length,
  "Rectangle overlays":
    overlayRectangles.length === 0 ? "None" : overlayRectangles.length,
  "Instance saturation":
    instanceSaturation === 0
      ? "Greyscale"
      : instanceSaturation === 2
      ? "High"
      : "Normal",
};

// The initiate function sets variables for the render,
function initiate() {
  // Instance options affect the whole piece
  instanceBackgroundIsColoured = fxrand() < 0.125;
  instanceIsDiagonal = fxrand() < 0.025;
  instanceIsTilted = fxrand() < 0.1;
  instanceBackground =
    fxrand() < 0.1 ? fxRandBetween(0, 30) : fxRandBetween(330, 360);
  instanceBackgroundTint = fxrand() * 360;
  instanceBackgroundTintSaturation = fxrand() * fxrand() * 90;
  instanceSmallRotation = fxrand() * fxrand() * fxrand() * fxrand();
  if (fxrand() < 0.075) {
    instanceScale = 0.5 + fxrand() * fxrand() * fxrand();
  } else if (instanceIsDiagonal) {
    fxrand() < 0.1 ? (instanceScale = 0.5) : (instanceScale = 1.415);
  } else {
    instanceScale = 1;
  }
  if (fxrand() < 0.95) {
    instanceSaturation = 1 - fxrand() * fxrand() * fxrand() * fxrand();
  } else {
    instanceSaturation = fxrand() < 0.5 ? 0 : 2;
  }

  // BACKGROUND / BOKEH
  // Colours
  bokehIsVariant = fxrand() < 0.25;
  backgroundHue = fxrand() * 360; // was 50
  backgroundHueRange = fxrand() * 16;
  backgroundIntensity = fxrand() * fxrand();

  striationHue = (backgroundHue + backgroundHueRange * 2) % 360; // was 60
  striationHueRange = fxrand() * 16;
  striationHueVariant = (striationHue + striationHueRange * 2) % 360;

  sandLevels = [4, 16, 32, 64][fxIntBetween(0, 3)];
  xNoiseModifier = 0.1 + fxrand() * fxrand() * fxrand();
  yNoiseModifier = xNoiseModifier * fxrand() + fxrand() * fxrand();

  requiredFrames = 360;
  if (fxrand() < 0.8) {
    instanceDensity = 1;
  } else if (fxrand() < 0.5) {
    instanceDensity = Math.max(0.5, fxrand() * fxrand() * fxrand());
  } else {
    instanceDensity = 2 - fxrand() * fxrand() * fxrand();
  }

  instanceMainRotation = fxIntBetween(0, 3);

  allowRectanglesToBeSplit = fxrand() < 0.75;
  rectangleSplitNoiseType = fxIntBetween(0, 5);

  allowBlocksToBeReflected = fxrand() < 0.5;
  blockReflectionNoiseType = fxIntBetween(0, 5);

  allowBlocksToBeRotated = fxrand() < 0.25;
  blockRotationNoiseType = fxIntBetween(0, 5);
  if (fxrand() < 0.2) {
    blockRotationRange = fxrand() * fxrand();
  } else {
    blockRotationRange = fxrand() * fxrand() * fxrand();
  }

  allowRectanglesToBeBlank = fxrand() < 0.75;
  blankRectangleNoiseType = fxIntBetween(0, 5);

  blockShiftingXAllowed = fxrand() < 0.5;
  blockShiftingYAllowed = fxrand() < 0.5;
  overlayCirclesAreFilled = fxrand() < 0.5;
  noiseShiftX = fxRandBetween(1, 32);
  noiseShiftY = fxRandBetween(1, 32);

  if (fxrand() < 0.9) {
    instanceBackgroundImageFading =
      0.5 + fxRandBetween(-0.25, 0.25) * fxrand() * fxrand() * fxrand();
  } else {
    instanceBackgroundImageFading = 0.95;
    allowRectanglesToBeBlank = false;
    instanceDensity = Math.min(1, instanceDensity);
  }

  if (fxrand() < 0.1) {
    sectorsH = 1;
    sectorsV = 1;
    allowRectanglesToBeBlank = fxrand() < 0.95;
  } else if (fxrand() < 0.025) {
    sectorsH = ~~(fullRes / fxIntBetween(32, 48));
    sectorsV = fxIntBetween(2, 5);
  } else {
    switch (fxIntBetween(0, 9)) {
      case 0:
        sectorsH = fxIntBetween(1, 3);
        sectorsV = fxIntBetween(2, 6);
        break;
      case 1:
        sectorsH = fxIntBetween(1, 6);
        sectorsV = fxIntBetween(1, 6);
        break;
      case 2:
        sectorsH = fxIntBetween(6, 12);
        sectorsV = fxIntBetween(6, 12);
        break;
      case 3:
        sectorsH = fxIntBetween(1, 6);
        sectorsV = fxIntBetween(6, 12);
        break;
      case 4:
        sectorsH = fxIntBetween(1, 2);
        sectorsV = fxIntBetween(4, 16);
        break;
      case 5:
        sectorsH = fxIntBetween(1, 3);
        sectorsV = fxIntBetween(12, 16);
        break;
      case 6:
        sectorsH = fxIntBetween(1, 5);
        sectorsV = sectorsH * 2;
        break;
      case 7:
        sectorsH = fxIntBetween(14, 18);
        sectorsV = fxIntBetween(14, 18);
        allowRectanglesToBeSplit = false;
        break;
      case 8:
        sectorsH = fxIntBetween(1, 2);
        sectorsV = fxIntBetween(31, 32);
        allowRectanglesToBeSplit = false;
        break;
      case 9:
        sectorsH = fxIntBetween(1, 8);
        sectorsV = sectorsH;
        break;
    }
  }

  if (sectorsH * sectorsV < 4) {
    allowRectanglesToBeBlank = false;
  }

  // Shape overlays
  // Overlay circles have xPos, yPos, radius and alpha
  overlayCircles = [];
  var overlayCirclesCount;
  if (fxrand() < 0.1 && sectorsH * sectorsV < 12) {
    overlayCirclesCount = fxIntBetween(2, 16);
  } else {
    overlayCirclesCount = fxIntBetween(1, 4);
  }
  if (fxrand() < 0.25) {
    for (var i = 0; i < overlayCirclesCount; i++) {
      overlayCircles.push([
        fxIntBetween(-fullRes, fullRes),
        fxIntBetween(-fullRes, fullRes),
        fxIntBetween(fullRes * 0.75, fullRes * 1.25),
        fxIntBetween(0, 360),
      ]);
    }
  }
  // Overlay rectangles have xPos, yPos, width, height, rotation and alpha
  overlayRectangles = [];
  var overlayRectanglesCount;
  if (fxrand() < 0.05 && sectorsH * sectorsV < 12) {
    overlayRectanglesCount = fxIntBetween(2, 16);
  } else {
    overlayRectanglesCount = fxIntBetween(1, 4);
  }
  if (fxrand() < 0.2) {
    for (var i = 0; i < overlayRectanglesCount; i++) {
      overlayRectangles.push([
        fxIntBetween(-fullRes, fullRes), // xPos
        fxIntBetween(-fullRes, fullRes), // yPos
        fxIntBetween(fullRes, fullRes * 1.25), // xSize
        fxIntBetween(fullRes, fullRes * 1.25), // ySize
        fxrand(), // Rotation
        fxIntBetween(0, 180), // Alpha
        fxIntBetween(0, 1), // Slight size variance
      ]);
    }
  }
  if (fxrand() < 0.9) {
    overlayRectanglesGreyValue = backgroundHue;
  } else if (fxrand() < 0.5) {
    overlayRectanglesGreyValue = 10;
  } else {
    overlayRectanglesGreyValue = 350;
  }

  // Random number generation weightings
  // This will fade the render in the x/y or both directions
  if (fxrand() < 0.5) {
    xFade = 0;
  } else if (fxrand() < 0.5) {
    xFade = -1;
  } else {
    xFade = 1;
  }

  if (fxrand() < 0.5) {
    yFade = 0;
  } else if (fxrand() < 0.5) {
    yFade = -1;
  } else {
    yFade = 1;
  }
}

function preload() {
  titleFont = loadFont("fonts/RubikGlitch-Regular.ttf");
  poemFont = loadFont("fonts/Neuton-Light.ttf");
}

function setup() {
  pixelDensity(1);
  randomSeed(randomSeedValue);
  noiseSeed(noiseSeedValue);

  // Create hashtag unique poem
  pushPoem();

  screenSize = min(windowWidth, windowHeight);
  theCanvas = createCanvas(screenSize, screenSize);
  colorMode(HSB, 360);
  rectMode(CENTER);
  imageMode(CENTER);

  // Set up
  createGraphicsBuffers();
  createInfo();
  startRender();
}

function createGraphicsBuffers() {
  // Reset arrays
  graphicsBuffers = [];
  renderFlags = [];

  // Render buffer
  renderBuffer = createGraphics(fullRes, fullRes);
  renderBuffer.colorMode(HSB, 360);

  // Save buffer
  saveBuffer = createGraphics(fullRes, fullRes);
  saveBuffer.colorMode(HSB, 360);
  saveBuffer.rectMode(CENTER);
  saveBuffer.imageMode(CENTER);

  // Grid buffer
  // Note that gridBuffer doesn't have rectMode or imageMode CENTER so that it's easier to draw a grid
  gridBuffer = createGraphics(fullRes, fullRes);
  gridBuffer.colorMode(HSB, 360);

  for (var i = 0; i < Object.keys(buffer).length; i++) {
    graphicsBuffers[i] = createGraphics(fullRes, fullRes);
    graphicsBuffers[i].colorMode(HSB, 360);
    graphicsBuffers[i].rectMode(CENTER);
    renderFlags[i] = true;
  }
}

function startRender() {
  // Reset seed
  randomSeed(randomSeedValue);
  noiseSeed(noiseSeedValue);

  // Clear main canvas and render buffer
  theCanvas.clear();
  renderBuffer.clear();

  // Clear all graphics buffers
  for (var eachBuffer of graphicsBuffers) {
    eachBuffer.clear();
  }

  startFrame = frameCount;
  endFrame = startFrame + requiredFrames;
  instructionText = "";
  pushInstructionTexts();

  currentlyRendering = true;
}

function renderLayers(toCanvas, layers) {
  var toCanvasSize = min(toCanvas.width, toCanvas.height);
  for (var eachLayer in layers) {
    var thisLayer = layers[eachLayer];
    toCanvas.image(thisLayer, 0, 0, toCanvasSize, toCanvasSize);
  }
}

function setAllRenderFlags(state) {
  for (var i = 0; i < renderFlags.length; i++) {
    renderFlags[i] = state;
  }
}

function fxRandBetween(from, to) {
  return from + (to - from) * fxrand();
}

function fxIntBetween(from, to) {
  return ~~fxRandBetween(from, to + 1);
}

function displayMessage(message) {
  messageString = message;
  messageAlpha = 360;
}

function drawSpatter(thisCanvas, xPos, yPos, radius, spots) {
  for (var i = 0; i < TAU; i += TAU / spots) {
    var xSplat = xPos + cos(i) * random() * 2 * radius;
    var ySplat = yPos + sin(i) * random() * 2 * radius;
    var size = map(dist(xSplat, ySplat, xPos, yPos), 0, radius / 2, 0, 2);
    thisCanvas.strokeWeight(size);
    thisCanvas.point(xSplat, ySplat);
  }
}

function draw() {
  // Reset all graphics buffers
  for (var eachBuffer of graphicsBuffers) {
    eachBuffer.resetMatrix();
    eachBuffer.translate(eachBuffer.width * 0.5, eachBuffer.height * 0.5);
    eachBuffer.noFill();
    eachBuffer.noStroke();
    eachBuffer.strokeWeight(8);
  }

  // Manage framecount and rendering process
  var elapsedFrame = frameCount - startFrame;
  var renderProgress = min(1, elapsedFrame / requiredFrames);
  var renderProgressRemaining = 1 - renderProgress;

  // First frame; set background
  if (elapsedFrame === 1) {
  }

  // If we're within the required frames, this loop renders multiple points
  if (elapsedFrame <= requiredFrames) {
    for (
      var i = 0;
      i <
      map(
        frameCount,
        startFrame,
        endFrame,
        instanceDensity * 512,
        instanceDensity * 1024
      );
      i++
    ) {
      var iPos = random();
      var jPos = random();
      if (xFade === -1) {
        iPos = random() * random();
      }
      if (xFade === 1) {
        iPos = 1 - random() * random();
      }
      if (yFade === -1) {
        jPos = random() * random();
      }
      if (yFade === 1) {
        jPos = 1 - random() * random();
      }
      var xPos = map(iPos, 0, 1, -fullRes * 0.5, fullRes * 0.5);
      var yPos = map(jPos, 0, 1, -fullRes * 0.5, fullRes * 0.5);

      var noiseValue = noise(iPos * xNoiseModifier, jPos * yNoiseModifier);
      var mappedNoise = map(noiseValue, 0, 1, 0, sandLevels);
      var difference = mappedNoise - floor(mappedNoise);

      // Main colour background
      var hueValue =
        (backgroundHue +
          map(
            noise(iPos * xNoiseModifier, jPos * yNoiseModifier),
            0,
            1,
            -backgroundHueRange,
            backgroundHueRange
          )) %
        360;
      graphicsBuffers[buffer.background].fill(
        hueValue,
        180,
        map(instanceBackground, 0, 360, 360, 0),
        renderProgressRemaining * map(noiseValue, 0, 1, 8, 0)
      );
      graphicsBuffers[buffer.background].noStroke();
      graphicsBuffers[buffer.background].ellipse(
        xPos,
        yPos,
        (random() * fullRes) / 128,
        (random() * fullRes) / 128
      );

      // Dunes
      if (difference < 0.2) {
        graphicsBuffers[buffer.dunes].stroke(
          (striationHue +
            random(-striationHueRange, striationHueRange) * random()) %
            360,
          map(frameCount, startFrame, endFrame, 360, 0) * instanceSaturation,
          map(instanceBackground, 0, 360, 330, 270),
          map(frameCount, startFrame, endFrame, 0.5, 0) *
            map(instanceBackground, 0, 360, 8, 2)
        );
        graphicsBuffers[buffer.dunes].strokeWeight(
          map(difference, 0, 0.2, 0, fullRes / 8) * random() * random()
        );
        graphicsBuffers[buffer.dunes].point(
          xPos + (random(-1, 1) * random() * fullRes) / 32,
          yPos + (random(-1, 1) * random() * fullRes) / 32
        );
      }

      // Grains
      if (difference > 0.9) {
        graphicsBuffers[buffer.grains].stroke(
          striationHueVariant,
          map(instanceBackground, 0, 360, 180, 360) * instanceSaturation,
          map(instanceBackground, 0, 360, 180, 360),
          map(instanceBackground, 0, 360, 64, 32)
        );
        graphicsBuffers[buffer.grains].strokeWeight(
          map(difference, 1.0, 0.9, fullRes / 4096, 1)
        );
        drawSpatter(
          graphicsBuffers[buffer.grains],
          xPos,
          yPos,
          32,
          ~~map(difference, 0.9, fullRes / 2048, 0, 2)
        );
      }

      // Bokeh
      if (difference < 0.001 && difference > 0.00009) {
        for (var j = 0; j < 16; j++) {
          var radius =
            (random() * random() * random() * random() * fullRes) / 12;
          var theta = random(TAU);
          var xSplat = xPos + cos(theta) * radius;
          var ySplat = yPos + sin(theta) * radius;
          var size =
            pow(random(), 32) *
            map(
              dist(xSplat, ySplat, xPos, yPos),
              0,
              fullRes / 12,
              fullRes / 16,
              0
            );
          if (bokehIsVariant) {
            graphicsBuffers[buffer.bokeh].stroke(
              map(radius, 0, fullRes / 16, striationHue, backgroundHue),
              360,
              map(instanceBackground, 0, 360, 270, 90) * instanceSaturation,
              8
            );
            size = (size * j) / 2;
          } else {
            graphicsBuffers[buffer.bokeh].stroke(
              map(radius, 0, fullRes / 16, backgroundHue, striationHue),
              300 * instanceSaturation,
              map(instanceBackground, 0, 360, 300, 60),
              20
            );
          }
          graphicsBuffers[buffer.bokeh].strokeWeight(size);
          graphicsBuffers[buffer.bokeh].point(xSplat, ySplat);
        }
      }

      // Sand
      if (difference < 0.5) {
        for (
          var k = 0;
          k < map(difference, 0, 0.5, fullRes / 512, fullRes / 256);
          k++
        ) {
          var newX =
            xPos +
            random((-fullRes * 3) / 128, (fullRes * 3) / 128) *
              random() *
              random();
          var newY =
            yPos +
            random((-fullRes * 3) / 128, (fullRes * 3) / 128) *
              random() *
              random();
          graphicsBuffers[buffer.sand].stroke(
            map(difference, 0, 0.5, 0, 1) *
              map(instanceBackground, 0, 360, 270, 60),
            300
          );
          graphicsBuffers[buffer.sand].strokeWeight(
            map(noiseValue, 0, 1, fullRes / 256, 0) *
              (dist(xPos, yPos, newX, newY) / (fullRes / 128)) *
              random() *
              random()
          );
          graphicsBuffers[buffer.sand].point(newX, newY);
        }
      } else {
        for (var k = 0; k < map(noiseValue, 0, 1, 1, 8); k++) {
          var newX =
            xPos + random(-fullRes / 32, fullRes / 32) * random() * random();
          var newY =
            yPos + random(-fullRes / 32, fullRes / 32) * random() * random();
          graphicsBuffers[buffer.sand].strokeWeight(
            map(difference, 0, 0.5, 0, fullRes / 1024) *
              (dist(xPos, yPos, newX, newY) / (fullRes / 128)) *
              random()
          );
          graphicsBuffers[buffer.sand].stroke(
            striationHue,
            360 * instanceSaturation,
            map(instanceBackground, 0, 360, 330, 30),
            map(difference, 0, 0.5, 240, 180)
          );
          graphicsBuffers[buffer.sand].point(newX, newY);
        }
      }

      // Overlay shapes
      if (overlayCircles.length > 0) {
        for (var k = 0; k < overlayCircles.length; k++) {
          var cRadius =
            overlayCircles[k][2] -
            random(0.5) * random() * overlayCircles[k][2];
          var cTheta = random(TAU);
          var cPos = p5.Vector.fromAngle(cTheta).mult(cRadius);
          graphicsBuffers[buffer.shapes].stroke(
            instanceBackground,
            map(
              dist(cPos.x, cPos.y, 0, 0),
              0,
              fullRes / 2,
              overlayCircles[k][3],
              0
            ) * instanceSaturation,
            map(instanceBackground, 0, 360, 360, 0),
            60
          );
          graphicsBuffers[buffer.shapes].strokeWeight(
            fullRes / 480 - dist(cPos.x, cPos.y, 0, 0) / fullRes
          );

          graphicsBuffers[buffer.shapes].point(
            cPos.x + overlayCircles[k][0],
            cPos.y + overlayCircles[k][1]
          );
        }
      }

      if (overlayRectangles.length > 0) {
        for (var k = 0; k < overlayRectangles.length; k++) {
          var rectX = overlayRectangles[k][0];
          var rectY = overlayRectangles[k][1];
          var rectW = overlayRectangles[k][2];
          var rectH = overlayRectangles[k][3];
          var rectR = overlayRectangles[k][4];
          var rectA = overlayRectangles[k][5];
          var rectT = overlayRectangles[k][6];
          if (rectT === 0) {
            rectX += rectW * random() * random() * random() * random();
            rectY += rectH * random() * random() * random() * random();
          } else {
            rectX += rectW * (1 - random() * random() * random());
            rectY += rectH * (1 - random() * random() * random());
          }
          graphicsBuffers[buffer.shapes].strokeWeight(
            map(dist(rectX, rectY, 0, 0), 0, fullRes / 2, 1, 4)
          );
          graphicsBuffers[buffer.shapes].stroke(
            overlayRectanglesGreyValue,
            rectA
          );
          graphicsBuffers[buffer.shapes].rotate(rectR);
          graphicsBuffers[buffer.shapes].point(rectX, rectY);
          graphicsBuffers[buffer.shapes].rotate(-rectR);
        }
      }
    } // End of multiple point render loop

    // Shading
    for (var i = 0; i < map(frameCount, startFrame, endFrame, 16, 64); i++) {
      var xEdge, yEdge;
      if (random() < 0.5) {
        // Horizontal edge
        xEdge = random(-fullRes / 2, fullRes / 2);
        yEdge = random() < 0.5 ? -fullRes / 2 : fullRes / 2;
      } else {
        // Vertical edge
        xEdge = random() < 0.5 ? -fullRes / 2 : fullRes / 2;
        yEdge = random(-fullRes / 2, fullRes / 2);
      }
      if (overlayCirclesAreFilled) {
        graphicsBuffers[buffer.shading].fill(
          backgroundHue + random(-1, 1) * backgroundHueRange,
          map(backgroundIntensity, 0, 1, 1, 16),
          instanceBackground,
          map(renderProgress, 0, 1, 2, 0)
        );
        graphicsBuffers[buffer.shading].noStroke();
      } else {
        graphicsBuffers[buffer.shading].strokeWeight(fullRes / 512);
        graphicsBuffers[buffer.shading].stroke(
          backgroundHue + random(-1, 1) * backgroundHueRange,
          map(backgroundIntensity, 0, 1, 1, 16) * instanceSaturation,
          instanceBackground,
          map(renderProgress, 0, 1, 12, 2)
        );
        graphicsBuffers[buffer.shading].noFill();
      }
      var size =
        (fullRes / map(frameCount, startFrame, endFrame, 1, 8)) * random();
      graphicsBuffers[buffer.shading].ellipse(
        xEdge + random(-size / 2, size / 2),
        yEdge + random(-size / 2, size / 2),
        size,
        size
      );
    }
  } // End elapsedFrame less than required frames loop

  // Create list of layers to render, according to interactive preferences
  var bufferList = [];
  for (var i = 0; i < graphicsBuffers.length; i++) {
    if (renderFlags[i]) {
      bufferList.push(graphicsBuffers[i]);
    }
  }
  renderBuffer.clear();
  renderLayers(renderBuffer, bufferList);

  // Create tiles
  var rectSizeH = fullRes / sectorsH;
  var rectSizeV = fullRes / sectorsV;
  var spacing = max(fullRes * 0.005, min(rectSizeH * 0.02, rectSizeV * 0.02));
  gridBuffer.clear();
  gridBuffer.resetMatrix();
  gridBuffer.translate(spacing, spacing);

  for (var i = 0; i < sectorsH; i++) {
    for (var j = 0; j < sectorsV; j++) {
      // Set up noise values for this square
      var noiseValues = [
        noise(i / 100 + noiseShiftX, j / 100 + noiseShiftY),
        noise(i / 10 + noiseShiftX, j / 10 + noiseShiftY),
        noise(i + noiseShiftX, j + noiseShiftY),
        noise(j + noiseShiftY, i + noiseShiftX),
        noise(i * 10 + noiseShiftX, j * 10 + noiseShiftY),
        noise(i * 100 + noiseShiftX, j * 100 + noiseShiftY),
      ];

      // Find the width and height of this tile
      var dWidth = (fullRes - spacing) / sectorsH - spacing;
      var dHeight = (fullRes - spacing) / sectorsV - spacing;
      var iMapped = blockShiftingXAllowed
        ? ~~map(noise(i, j), 0, 1, 0, sectorsH)
        : i;
      var jMapped = blockShiftingYAllowed
        ? ~~map(noise(j, i), 0, 1, 0, sectorsV)
        : j;
      var sX = (iMapped * fullRes) / sectorsH;
      var sY = (jMapped * fullRes) / sectorsV;

      // Move to correct position
      gridBuffer.push();
      gridBuffer.translate(i * (dWidth + spacing), j * (dHeight + spacing));

      // Rotate
      if (allowBlocksToBeReflected) {
        gridBuffer.translate(dWidth / 2, dHeight / 2);
        if (allowBlocksToBeRotated) {
          gridBuffer.scale(0.975);
          gridBuffer.rotate(
            map(
              noiseValues[blockRotationNoiseType],
              0,
              1,
              -blockRotationRange,
              blockRotationRange
            )
          );
        }
        if (sectorsH === sectorsV) {
          gridBuffer.rotate(
            (~~map(noiseValues[blockReflectionNoiseType], 0, 1, 0, 4) * PI) / 2
          );
        } else {
          gridBuffer.rotate(
            noiseValues[blockReflectionNoiseType] < 0.5 ? PI : 0
          );
        }
        gridBuffer.translate(-dWidth / 2, -dHeight / 2);
      }

      // Draw frame and image section
      gridBuffer.noFill();
      gridBuffer.noStroke();

      if (
        allowRectanglesToBeBlank &&
        noiseValues[blankRectangleNoiseType] < 0.5
      ) {
        gridBuffer.fill(instanceBackground, 8);
        gridBuffer.rect(0, 0, dWidth, dHeight);
      } else {
        gridBuffer.noFill();
        gridBuffer.noStroke();
        if (
          allowRectanglesToBeSplit &&
          noiseValues[rectangleSplitNoiseType] < 0.35
        ) {
          var split = ~~map(noiseValues[rectangleSplitNoiseType], 0, 1, 2, 8);
          var newWidth = (dWidth + spacing) / split - spacing;
          for (var k = 0; k < split; k++) {
            gridBuffer.rect(0, 0, newWidth, dHeight);
            gridBuffer.image(
              renderBuffer,
              0,
              0,
              newWidth,
              dHeight,
              sX + (fullRes / sectorsH / split) * k,
              sY,
              fullRes / sectorsH / split,
              fullRes / sectorsV
            );
            gridBuffer.translate(newWidth + spacing, 0);
          }
        } else if (
          allowRectanglesToBeSplit &&
          noiseValues[rectangleSplitNoiseType] > 0.65
        ) {
          var split = ~~map(noiseValues[rectangleSplitNoiseType], 0, 1, 2, 8);
          var newHeight = (dHeight + spacing) / split - spacing;
          for (var k = 0; k < split; k++) {
            gridBuffer.rect(0, 0, dWidth, newHeight);
            gridBuffer.image(
              renderBuffer,
              0,
              0,
              dWidth,
              newHeight,
              sX,
              sY + (fullRes / sectorsV / split) * k,
              fullRes / sectorsH,
              fullRes / sectorsV / split
            );
            gridBuffer.translate(0, newHeight + spacing);
          }
        } else {
          gridBuffer.rect(0, 0, dWidth, dHeight);
          gridBuffer.image(
            renderBuffer,
            0,
            0,
            dWidth,
            dHeight,
            sX,
            sY,
            fullRes / sectorsH,
            fullRes / sectorsV
          );
        }
      }

      // Return the grid to its original state
      gridBuffer.pop();
    }
  }

  // Build final image in the saveBuffer
  // Clear and reset everything, then move so (0, 0) is in the centre
  saveBuffer.resetMatrix();
  saveBuffer.clear();
  saveBuffer.translate(fullRes * 0.5, fullRes * 0.5);

  // Create the background, coloured or greyscale background
  if (instanceBackgroundIsColoured) {
    saveBuffer.background(
      instanceBackgroundTint,
      instanceBackgroundTintSaturation,
      instanceBackground < 180 ? 30 : 330
    );
  } else {
    saveBuffer.background(instanceBackground);
  }

  // Add main image to the background and fade the whole background using instanceBackgroundImageFading
  saveBuffer.image(renderBuffer, 0, 0, fullRes, fullRes);
  saveBuffer.fill(instanceBackground, 360 * instanceBackgroundImageFading);
  saveBuffer.noStroke();
  saveBuffer.rect(0, 0, fullRes, fullRes);

  // Now the background's complete, scale to the instance
  saveBuffer.scale(instanceScale);
  saveBuffer.rotate(instanceMainRotation * HALF_PI);

  if (instanceIsDiagonal) {
    saveBuffer.rotate(PI / 4);
  } else if (instanceIsTilted) {
    saveBuffer.rotate(instanceSmallRotation);
  }

  // Apply the gridBuffer to the saveBuffer image
  saveBuffer.image(gridBuffer, 0, 0, fullRes, fullRes);

  // If necessary, add a border to the saveBuffer to frame rotated versions
  if (instanceIsDiagonal || instanceIsTilted || allowBlocksToBeRotated) {
    saveBuffer.resetMatrix();
    saveBuffer.translate(fullRes * 0.5, fullRes * 0.5);
    saveBuffer.noFill();
    saveBuffer.strokeWeight(spacing * 2);
    if (instanceBackgroundIsColoured) {
      saveBuffer.stroke(
        instanceBackgroundTint,
        instanceBackgroundTintSaturation * instanceSaturation,
        instanceBackground < 180 ? 30 : 330
      );
    } else {
      saveBuffer.stroke(instanceBackground);
    }
    saveBuffer.rect(0, 0, fullRes, fullRes);
  }

  // Display finished image on canvas
  translate(screenSize * 0.5, screenSize * 0.5);
  image(saveBuffer, 0, 0, screenSize, screenSize);

  // Handle information text visibility
  if (infoAlpha < infoTargetAlpha) {
    infoAlpha += 30;
  } else if (infoAlpha > infoTargetAlpha) {
    infoAlpha -= 30;
  }

  // Handle poem text visibility
  if (poemAlpha < poemTargetAlpha) {
    poemAlpha += 30;
  } else if (poemAlpha > poemTargetAlpha) {
    poemAlpha -= 30;
  }

  // Render title text
  if (titleAlpha > 0) {
    titleAlpha -= map(elapsedFrame, 0, requiredFrames, 2, 4);
    textSize(screenSize * 0.045);
    textAlign(RIGHT, BOTTOM);
    textFont(titleFont);
    fill(0, titleAlpha);
    stroke(360, titleAlpha);
    strokeWeight(screenSize * 0.005);
    strokeJoin(ROUND);
    text(nameOfPiece, screenSize * 0.475, screenSize * 0.475);
  }

  // Render poem
  if (poemAlpha > 0) {
    textSize(screenSize * 0.025);
    textFont(poemFont);
    fill(instanceBackground < 180 ? 360 : 0, poemAlpha);
    stroke(instanceBackground < 180 ? 0 : 360, poemAlpha);
    strokeWeight(screenSize * 0.005);
    strokeJoin(ROUND);
    textAlign(CENTER, CENTER);
    text(poem, 0, 0);
  }

  // Render information text
  if (infoAlpha > 0) {
    textFont("sans-serif");
    textSize(screenSize * 0.015);
    fill(0, infoAlpha);
    stroke(360, infoAlpha);
    strokeWeight(screenSize * 0.005);
    strokeJoin(ROUND);
    textAlign(RIGHT, TOP);
    text(instructionText, screenSize * 0.45, screenSize * -0.45);
    textAlign(LEFT, TOP);
    text(
      infoText +
        "\n\n" +
        (renderProgress < 1
          ? "Rendering progress: " + ~~(renderProgress * 100) + "%"
          : "Render complete") +
        "\n",
      screenSize * -0.45,
      screenSize * -0.45
    );
    textSize(screenSize * 0.025);
  }

  // Render message text
  if (messageAlpha > 0) {
    textFont("sans-serif");
    rectMode(CORNER);
    messageAlpha -=
      map(messageAlpha, 0, 360, 1, 8) *
      (elapsedFrame < requiredFrames ? 1 : 0.5);
    textAlign(LEFT, BOTTOM);
    textSize(screenSize * 0.02);
    strokeWeight(screenSize * 0.005);
    fill(0, messageAlpha);
    stroke(360, messageAlpha);
    text(
      messageString,
      screenSize * -0.45,
      screenSize * 0.45,
      screenSize * 0.9
    );
    rectMode(CENTER);
  }

  // Check if render is complete for fxpreview(), and set related flags;
  if (elapsedFrame === requiredFrames) {
    if (!firstRenderComplete) {
      fxpreview();
      currentlyRendering = false;
      firstRenderComplete = true;
    }
    if (TESTMODE && RENDERCOUNT < RENDERSREQUIRED) {
      displayMessage(RENDERCOUNT + " / " + RENDERSREQUIRED);
      RENDERCOUNT += 1;
      if (RENDERCOUNT === RENDERSREQUIRED) {
        TESTMODE = false;
      }
      if (SAVECANVAS) {
        saveCanvas(
          shortNameOfPiece +
            "Canvas" +
            nf(hour(), 2, 0) +
            nf(minute(), 2, 0) +
            nf(second(), 2),
          "png"
        );
      }
      if (SAVESAVEBUFFER) {
        save(
          saveBuffer,
          shortNameOfPiece +
            "FullRes" +
            nf(hour(), 2, 0) +
            nf(minute(), 2, 0) +
            nf(second(), 2),
          "png"
        );
      }
      initiate();
      createGraphicsBuffers();
      createInfo();
      startRender();
    }
  }
}

// ********************************************************************
// Various interaction functions - key presses, clicking, window-sizing
// ********************************************************************

function keyPressed() {
  // Save piece at canvas resolution, with overlays if visible
  if (key === "c") {
    saveCanvas(
      shortNameOfPiece +
        "Canvas" +
        nf(hour(), 2, 0) +
        nf(minute(), 2, 0) +
        nf(second(), 2),
      "png"
    );
    displayMessage("Canvas saved ");
  }

  // Save piece at full resolution without overlays
  if (key === "s") {
    save(
      saveBuffer,
      shortNameOfPiece +
        "FullRes" +
        nf(hour(), 2, 0) +
        nf(minute(), 2, 0) +
        nf(second(), 2) +
        ".png"
    );
    displayMessage("Render saved at " + fullRes + "x" + fullRes);
  }

  // Save piece at full resolution with poem overlay
  if (key === "D") {
    saveBuffer.resetMatrix();
    saveBuffer.translate(fullRes * 0.5, fullRes * 0.5);
    saveBuffer.textFont(poemFont);
    saveBuffer.textSize(fullRes * 0.025);
    saveBuffer.fill(instanceBackground < 180 ? 360 : 0);
    saveBuffer.stroke(instanceBackground < 180 ? 0 : 360);
    saveBuffer.strokeWeight(fullRes * 0.005);
    saveBuffer.strokeJoin(ROUND);
    saveBuffer.textAlign(CENTER, CENTER);
    saveBuffer.text(poem, 0, 0);
    save(
      saveBuffer,
      shortNameOfPiece +
        "Poem" +
        nf(hour(), 2, 0) +
        nf(minute(), 2, 0) +
        nf(second(), 2) +
        ".png"
    );
    displayMessage("Poem render saved at " + fullRes + "x" + fullRes);
  }

  if (key === "z") {
    instanceMainRotation += 1;
  }

  if (key === "T" && TESTINGENABLED) {
    TESTMODE = !TESTMODE;
    RENDERCOUNT = 0;
    startRender();
    if (TESTMODE) {
      displayMessage(
        "Test mode activated for " +
          RENDERSREQUIRED +
          " renders." +
          (SAVECANVAS ? " Canvas will be exported." : "") +
          (SAVESAVEBUFFER ? " Save buffer will be exported." : "")
      );
    } else {
      displayMessage("Test mode deactivated");
    }
  }

  if (key === "S" && TESTINGENABLED) {
    SAVESAVEBUFFER = !SAVESAVEBUFFER;
    displayMessage(
      SAVESAVEBUFFER
        ? "Test mode will export save buffer."
        : "Test mode will not export save buffer."
    );
  }

  if (key === "C" && TESTINGENABLED) {
    SAVECANVAS = !SAVECANVAS;
    displayMessage(
      SAVECANVAS
        ? "Test mode will export canvas."
        : "Test mode will not export canvas."
    );
  }

  if (key === "r") {
    createInfo();
    createGraphicsBuffers();
    startRender();
    displayMessage("Re-rendering with same parameters.");
  }

  if (key === "p") {
    displayMessage("Re-rendering with new parameters.");
    initiate();
    createGraphicsBuffers();
    createInfo();
    startRender();
  }

  if (key === "i") {
    if (infoTargetAlpha === 0) {
      infoTargetAlpha = 360;
    	poemTargetAlpha = 0;
    } else {
      infoTargetAlpha = 0;
    }
  }

  // Display secret poem mode
  if (key === "d") {
    if (poemTargetAlpha === 0) {
      poemTargetAlpha = 360;
			infoTargetAlpha = 0;
    } else {
      poemTargetAlpha = 0;
    }
  }

  if (!isNaN(key)) {
    var keyNumber = int(key);
    if (keyNumber > 0 && keyNumber <= graphicsBuffers.length) {
      renderFlags[keyNumber - 1] = !renderFlags[keyNumber - 1];
      displayMessage(
        "Layer " +
          keyNumber +
          " rendering is " +
          (renderFlags[keyNumber - 1] ? "active." : "not active.")
      );
    }
  }
} // End of keyPressed()

function doubleClicked() {
  fullscreen(!fullscreen());
}

function windowResized() {
  if (navigator.userAgent.indexOf("HeadlessChrome") === -1) {
    screenSize = min(windowWidth, windowHeight);
    resizeCanvas(screenSize, screenSize);
  }
}

// ***********************************************************
// The following functions contain data and text-related items
// ***********************************************************

function pushInstructionText(textString, newLines) {
  instructionText += textString;
  instructionText += "\n";
}

function createInfo() {
  infoText = nameOfPiece;
  infoText += "\n";
  infoText += "\nSand levels: " + sandLevels;
  infoText += "\nGrid size: " + sectorsH + " x " + sectorsV;
  infoText += "\nScale: " + round(instanceScale, 2);
  infoText +=
    "\nDensity: " +
    (instanceDensity === 1 ? "Normal" : instanceDensity < 1 ? "Low" : "High");
  infoText += "\n";
  infoText +=
    "\nInstance background is tinted: " +
    (instanceBackgroundIsColoured ? hueDescriptor(instanceBackground) : "No");
  infoText += "\nInstance is tilted: " + (instanceIsTilted ? "Yes" : "No");
  infoText += "\nInstance is diagonal: " + (instanceIsDiagonal ? "Yes" : "No");
  infoText += "\ninstance saturation level: " + round(instanceSaturation, 2);
  infoText +=
    "\nBackground image fading: " + round(instanceBackgroundImageFading, 2);
  infoText += "\n";
  infoText +=
    "\nBackground texture circles are filled: " +
    (overlayCirclesAreFilled ? "Yes" : "No");
  infoText += "\nBokeh variant: " + (bokehIsVariant ? "One" : "Two");
  infoText += "\n";
  infoText +=
    "\nRectangles can be split: " +
    (allowRectanglesToBeSplit
      ? "Yes, with noise type " + rectangleSplitNoiseType
      : "No");
  infoText +=
    "\nRectangles can be blank: " +
    (allowRectanglesToBeBlank
      ? "Yes, with noise type " + blankRectangleNoiseType
      : "No");
  infoText +=
    "\nRectangles can be reflected: " +
    (allowBlocksToBeReflected
      ? "Yes, with noise type " + blockReflectionNoiseType
      : "No");
  infoText +=
    "\nRectangles can be rotated: " +
    (allowBlocksToBeRotated
      ? "Yes, with noise type " + blockRotationNoiseType
      : "No");
  infoText += "\nBlock rotation range: " + round(blockRotationRange, 2);
  infoText += "\n";
  infoText +=
    "\nBlocks can be shifted: " +
    (blockShiftingXAllowed
      ? blockShiftingYAllowed
        ? "Both x- and y-axis"
        : "X-axis only"
      : blockShiftingYAllowed
      ? "Y-axis only"
      : "No");
  infoText += "\n";
  infoText +=
    "\nOverlay Circles: " +
    (overlayCircles.length === 0 ? "None" : overlayCircles.length);
  infoText +=
    "\nOverlay Rectangles: " +
    (overlayRectangles.length === 0 ? "None" : overlayRectangles.length);
}

function hueDescriptor(hueValue) {
  hueValue = ~~(hueValue / 30) * 30;
  switch (hueValue) {
    case 0:
      return "Red";
      break;
    case 30:
      return "Orange";
      break;
    case 60:
      return "Yellow";
      break;
    case 90:
    case 120:
    case 150:
      return "Green";
      break;
    case 180:
    case 210:
    case 240:
      return "Blue";
      break;
    case 270:
      return "Violet";
      break;
    case 300:
      return "Magenta";
      break;
    case 330:
      return "Red";
      break;
    case 360:
      return "Red";
      break;
  }
  return hueValue;
}

function pushPoem() {
  poem = "";
  var opposites = [
    "is and isn't",
    "was and wasn't",
    "did and didn't",
    "could and couldn't",
    "should and shouldn't",
    "had and hadn't",
  ].sort(() => fxrand() - 0.5);
  var places = [
    "atmosphere and earth",
    "shoreline and depths",
    "vacuum and expanse",
    "ground and expanse",
    "landfall and cloudfront",
    "desert and sky",
    "treeline and roots",
    "tideline and hinterland",
    "horizon and skyline",
    "seascape and port",
    "pathway and creek",
  ].sort(() => fxrand() - 0.5);
  var timePeriod = ["moment", "time", "fragment"].sort(() => fxrand() - 0.5);
  var pronouns1 = ["he'd", "she'd", "they'd"].sort(() => fxrand() - 0.5);
  var pronouns2 = [pronouns1[0], "you'd", "you'd", "they'd"].sort(
    () => fxrand() - 0.5
  );
  var limitation = ["not ", ""].sort(() => fxrand() - 0.5);
  poem +=
    "Life is a " +
    random([
      "fingernail's " + random(["width", "breadth", "depth"]),
      "fingernail " + random(["width", "breadth", "depth"]),
      "scratched moment",
      "hairline gap",
      "liminal space",
    ]) +
    " between " +
    opposites[0] +
    ".";
  poem +=
    "\n" +
    random([
      "Time",
      "A lifetime",
      "Moments",
      "A season",
      "An existence",
      "An eon",
    ]) +
    random([" ", " spent "]) +
    random(["raking", "scraping", "mapping", "tracing"]) +
    " the " +
    random([
      "edge",
      "extent",
      "fringe",
      "limit",
      "limits",
      "contours",
      "boundaries",
    ]);

  poem += "\n";
  poem += "\nof " + places[0] + ",";
  poem += "\nof " + places[1] + ".";

  poem += "\n";
  poem += "\nLife is the " + timePeriod[0] + " between " + opposites[1] + ".";
  poem +=
    "\nA " +
    timePeriod[1] +
    random([" spent", " wasted", " lost", " consumed"]) +
    random([",", ""]) +
    " wishing";

  poem += "\n";
  poem += "\nthat you'd done what";
  poem +=
    "\nyour heart " +
    random(["felt", "screamed", "knew", "thought", "said"]) +
    " was right;";

  poem += "\n";
  poem +=
    "\nthat you'd " +
    random(["taken", "given", "thrown", "held", "sent", "pulled", "handed"]) +
    " it back,";
  poem +=
    "\nor " +
    random([
      "not left it whole",
      random(["pulled", "ripped", "torn"]) + " it apart",
      "left it in pieces",
    ]) +
    ";";

  poem += "\n";
  poem +=
    "\nthat you'd " + random(["taken", limitation[0] + "made"]) + " a stand,";
  poem +=
    "\nor " +
    random(["just ", limitation[1], ""]) +
    random(["jumped when ", "done what "]) +
    pronouns1[0] +
    " said;";

  poem += "\n";
  poem += "\nthat you'd said what";
  poem += "\nyou only thought of once " + pronouns2[0] + " left.";

  poem += "\n";
  poem += "\nFor this";
  poem += "\nis all";
  poem += "\n";
  poem +=
    "\n" +
    random(["we have", "there is", "you have", "you are", "it is", "we are"]) +
    ".";
}

function pushInstructionTexts() {
  pushInstructionText("Show/hide information: [I]");
  pushInstructionText("\nSave " + fullRes + "x" + fullRes + " png: [S]");
  pushInstructionText("Save canvas: [C]");
  pushInstructionText("\nRe-render image: [R]");
  pushInstructionText("Generate new image: [P]");
  pushInstructionText("\nToggle render layers:");
  for (var i = 0; i < Object.keys(buffer).length; i++) {
    var keyName = Object.keys(buffer)[i];
    keyName = keyName.charAt(0).toUpperCase() + keyName.slice(1);
    pushInstructionText(keyName + ": [" + (i + 1) + "]");
  }
}

function capitalise(string) {
  return string[0].toUpperCase() + string.substring(1);
}
