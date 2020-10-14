let universe = prepareRandomUniverse(300,300)
let universeClock = true;
let uScale = 10;
let uParticleColor;

const SPECIES = {
    sand: 0,
    empty: 1,
    water: 2,
    wall: 3,
}

let vertices = []
let w = 10;
let h = 10;

let gl = null;
let glCanvas = null;

// Vertex information
let vertexArray;
let vertexBuffer;
let vertexNumComponents;
let vertexCount;

function startup() {
  glCanvas = document.getElementById("glcanvas");
  gl = glCanvas.getContext("webgl");

  const shaderSet = [
    {
      type: gl.VERTEX_SHADER,
      id: "my-vertex-shader"
    },
    {
      type: gl.FRAGMENT_SHADER,
      id: "my-fragment-shader"
    }
  ];

  const waterShaderSet = [
    {
      type: gl.VERTEX_SHADER,
      id: "water-vertex-shader"
    },
    {
      type: gl.FRAGMENT_SHADER,
      id: "water-fragment-shader"
    }
  ];

  shaderProgram = buildShaderProgram(shaderSet);
  waterShaderProgram = buildShaderProgram(waterShaderSet);

  vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

  vertexCount = 300 * 300;

  animateScene();
}


function animateScene() {

  gl.viewport(0, 0, glCanvas.width, glCanvas.height);
  gl.clearColor(0.8, 0.9, 1.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  //update the universe array
  // console.log('updating universe...')
  // universe = prepareRandomUniverse(100, 100);
  update(universe)
  // console.log(universe[50][10])
  universeClock = !universeClock

  //convert it into vertices
  vertices = []

  // set shader program
  gl.useProgram(shaderProgram);

  // uGlobalColor = gl.getUniformLocation(shaderProgram, "uGlobalColor")

  for (let i = 0; i < universe.length; i++) {
    for (let j = 0; j < universe[i].length; j++) {
      if(universe[j][i].species === SPECIES.sand) {
        // gl.useProgram(shaderProgram)
        vertices.push((2.0 * i + 1.0) / 300 - 1.0)
        vertices.push((2.0 * j + 1.0) / 300 - 1.0)
        // gl.uniform4fv(uGlobalColor, [0.1, 0.7, 0.2, 1.0]);
      } else if (universe[j][i].species === SPECIES.water) {
        vertices.push((2.0 * i + 1.0) / 300 - 1.0)
        vertices.push((2.0 * j + 1.0) / 300 - 1.0)
        // gl.uniform4fv(uGlobalColor, [0.118, 0.565, 1.0, 1.0]);
      }
    }
  }

  // binding buffer to GL buffer
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

  // updating gl buffer data
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

  // getting pointer for coordinates attribute inside shader program
  var coord = gl.getAttribLocation(shaderProgram, "coordinates");

  // turning attributes on
  gl.enableVertexAttribArray(coord);

  // telling shader how to read attribute?
  gl.vertexAttribPointer(coord, 2, gl.FLOAT, false, 0, 0);

  // drawing points in the screen
  gl.drawArrays(gl.POINTS, 0, vertexCount);

  window.requestAnimationFrame(function(currentTime) {
    animateScene();
  });
}


/*
  WebGL utility functions
*/

function buildShaderProgram(shaderInfo) {
  let program = gl.createProgram();

  shaderInfo.forEach(function(desc) {
    let shader = compileShader(desc.id, desc.type);

    if (shader) {
      gl.attachShader(program, shader);
    }
  });

  gl.linkProgram(program)

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.log("Error linking shader program:");
    console.log(gl.getProgramInfoLog(program));
  }

  return program;
}

function compileShader(id, type) {
  let code = document.getElementById(id).firstChild.nodeValue;
  let shader = gl.createShader(type);

  gl.shaderSource(shader, code);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.log(`Error compiling ${type === gl.VERTEX_SHADER ? "vertex" : "fragment"} shader:`);
    console.log(gl.getShaderInfoLog(shader));
  }
  return shader;
}

/* 
  Game engine functions
*/

// creates a universe filled with randodm universe of a given width and height
function prepareRandomUniverse(width, height) {
  let universe = [];

  for(let i = 0; i < height; i++) {
    let row = []

    for (let j = 0; j < width; j++) {
      let randomParticle = {
        species: randomSpecies(),
        ra: randomRegistry(),
        rb: randomRegistry(),
        clock: false
      };
      row.push(randomParticle)
    }

    universe.push(row);
  }
  return universe;
}

function randomSpecies() {
  let possibilities = [1, 1, 1, 1, 1, 1, 1, 0, 2];
  let index = Math.floor(Math.random() * possibilities.length);
  return possibilities[index];
}

function randomRegistry () {
  return Math.floor(Math.random() * 8)
}


// game loop function
function update(universe) {
  let particle;
  let sandCounter = 0;

  for(let i = 0; i < universe.length; i++) {
      for(var j = 0; j < universe[i].length; j++) {

          if(universe[j][i].clock === universeClock) {
            continue
          }

          switch(universe[j][i].species) {
        case SPECIES.sand:
          updateSand(i, j, universe)
          sandCounter++
        break;

        case SPECIES.water:
          updateWater(i, j, universe)
        break;

        default:
          universe[j][i].clock = !universe[j][i].clock;
          // particle is empty and does not need to be clock
      }
      }
  }
}

// rules for sand
function updateSand(x, y, universe) {

  // console.log('updating sand!')

  if (!universe[y+1] || !universe[y+1][x+1] || !universe[y+1][x-1]) { //particle is on the bottom row or on the edges
    universe[y][x].clock = !universe[y][x].clock;
    return
  }

  if(universe[y+1][x].species === SPECIES.empty) { // if cell below me is empty
    // moving particle to cell below
    universe[y+1][x].species = SPECIES.sand; //making particle below me water
    universe[y+1][x].ra = 1; //making particle below me sand
    universe[y+1][x].rb = 1; //making particle below me sand
    universe[y+1][x].clock = !universe[y+1][x].clock;

    // clearing the index for the particle we moved
    universe[y][x].species = SPECIES.empty;
    universe[y][x].ra = 0;
    universe[y][x].rb = 0;
    universe[y][x].clock = !universe[y][x].clock;
  } else if(universe[y+1][x].species === SPECIES.water) {
    // moving particle to cell below
    universe[y+1][x].species = SPECIES.sand; //making particle below me water
    universe[y+1][x].ra = 1; //making particle below me sand
    universe[y+1][x].rb = 1; //making particle below me sand
    universe[y+1][x].clock = !universe[y+1][x].clock;

    // clearing the index for the particle we moved
    universe[y][x].species = SPECIES.water;
    universe[y][x].ra = 0;
    universe[y][x].rb = 0;
    universe[y][x].clock = !universe[y][x].clock;
  } else {

    if (universe[y+1][x+1].species === SPECIES.empty) { // the particle below to the right is empty
      universe[y+1][x+1].species = SPECIES.sand; //making particle below me water
      universe[y+1][x+1].ra = 1; //making particle below me sand
      universe[y+1][x+1].rb = 1; //making particle below me sand
      universe[y+1][x+1].clock = !universe[y+1][x+1].clock;

      // clearing the index for the particle we moved
      universe[y][x].species = SPECIES.empty;
      universe[y][x].ra = 0;
      universe[y][x].rb = 0;
      universe[y][x].clock = !universe[y][x].clock;
    } else if (universe[y+1][x-1].species === SPECIES.empty) { // the particle below to the left is empty
      universe[y+1][x-1].species = SPECIES.sand; //making particle below me water
      universe[y+1][x-1].ra = 1; //making particle below me sand
      universe[y+1][x-1].rb = 1; //making particle below me sand
      universe[y+1][x-1].clock = !universe[y+1][x-1].clock;

      // clearing the index for the particle we moved
      universe[y][x].species = SPECIES.empty;
      universe[y][x].ra = 0;
      universe[y][x].rb = 0;
      universe[y][x].clock = !universe[y][x].clock;
    } else if (universe[y+1][x+1].species === SPECIES.water) { // the particle below to the right is water
      universe[y+1][x+1].species = SPECIES.sand; //making particle below me water
      universe[y+1][x+1].ra = 1; //making particle below me sand
      universe[y+1][x+1].rb = 1; //making particle below me sand
      universe[y+1][x+1].clock = !universe[y+1][x+1].clock;

      // clearing the index for the particle we moved
      universe[y][x].species = SPECIES.water;
      universe[y][x].ra = 0;
      universe[y][x].rb = 0;
      universe[y][x].clock = !universe[y][x].clock;
    } else if (universe[y+1][x-1].species === SPECIES.water) { // the particle below to the left is water
      universe[y+1][x-1].species = SPECIES.sand; //making particle below me water
      universe[y+1][x-1].ra = 1; //making particle below me sand
      universe[y+1][x-1].rb = 1; //making particle below me sand
      universe[y+1][x-1].clock = !universe[y+1][x-1].clock;

      // clearing the index for the particle we moved
      universe[y][x].species = SPECIES.water;
      universe[y][x].ra = 0;
      universe[y][x].rb = 0;
      universe[y][x].clock = !universe[y][x].clock;
    }
  }
}


function updateWater(x, y, universe) {

  if (!universe[y+1] || !universe[y+1][x+1] | !universe[y+1][x-1]) { //particle is on the bottom row or on the edges
    universe[y][x].clock = !universe[y][x].clock;
    return
  }

  if(universe[y+1][x].species === SPECIES.empty) { // if cell below me is empty
    // moving particle to cell below
    universe[y+1][x].species = SPECIES.water; //making particle below me water
    universe[y+1][x].ra = 1; //making particle below me sand
    universe[y+1][x].rb = 1; //making particle below me sand
    universe[y+1][x].clock = !universe[y+1][x].clock;

    // clearing the index for the particle we moved
    universe[y][x].species = SPECIES.empty;
    universe[y][x].ra = 0;
    universe[y][x].rb = 0;
    universe[y][x].clock = !universe[y][x].clock;
  } else {

    if (universe[y+1][x+1].species === SPECIES.empty) { // the particle below to the right is empty
      universe[y+1][x+1].species = SPECIES.water; //making particle below me water
      universe[y+1][x+1].ra = 1; //making particle below me sand
      universe[y+1][x+1].rb = 1; //making particle below me sand
      universe[y+1][x+1].clock = !universe[y+1][x+1].clock;

      // clearing the index for the particle we moved
      universe[y][x].species = SPECIES.empty;
      universe[y][x].ra = 0;
      universe[y][x].rb = 0;
      universe[y][x].clock = !universe[y][x].clock;
    } else if (universe[y+1][x-1].species === SPECIES.empty) { // the particle below to the left is empty
      universe[y][x-1].species = SPECIES.water; //making particle below me water
      universe[y][x-1].ra = 1; //making particle below me sand
      universe[y][x-1].rb = 1; //making particle below me sand
      universe[y][x-1].clock = !universe[y][x-1].clock;

      // clearing the index for the particle we moved
      universe[y][x].species = SPECIES.empty;
      universe[y][x].ra = 0;
      universe[y][x].rb = 0;
      universe[y][x].clock = !universe[y][x].clock;
    } else if (universe[y][x+1].species === SPECIES.empty) { // the cell to the right is empty
      universe[y][x+1].species = SPECIES.water; //making particle below me water
      universe[y][x+1].ra = 1; //making particle below me sand
      universe[y][x+1].rb = 1; //making particle below me sand
      universe[y][x+1].clock = !universe[y][x+1].clock;

      // clearing the index for the particle we moved
      universe[y][x].species = SPECIES.empty;
      universe[y][x].ra = 0;
      universe[y][x].rb = 0;
      universe[y][x].clock = !universe[y][x].clock;
    } else if (universe[y][x-1].species === SPECIES.empty) {
      universe[y][x-1].species = SPECIES.water; //making particle below me water
      universe[y][x-1].ra = 1; //making particle below me sand
      universe[y][x-1].rb = 1; //making particle below me sand
      universe[y][x-1].clock = !universe[y][x-1].clock;

      // clearing the index for the particle we moved
      universe[y][x].species = SPECIES.empty;
      universe[y][x].ra = 0;
      universe[y][x].rb = 0;
      universe[y][x].clock = !universe[y][x].clock;
    }
  }
}

/*
  Event listeners
*/

window.addEventListener("load", startup, false);