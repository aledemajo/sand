// universe
let universe;
let uWidth = 300;
let uHeight = 300;
let uScale = 1;

// universe clock, flips between true/false to determine if particles have been updated in this game loop
let universeClock = true;

// ENUM for existing species
const SPECIES = {
    sand: 0,
    empty: 1,
    water: 2,
    wall: 3,
}

let drawingTool = {
	species: SPECIES.sand,
	size: 1
}


async function run() {

	universe = await prepareRandomUniverse(uWidth, uHeight);

	while(true) {
		await update(universe)
		universeClock = !universeClock

		// printUniverse(universe)
		await new Promise(r => setTimeout(r, 1));
	}
}


/* 
	Update functions
*/

// game loop function
async function update(universe) {
	let particle;
	let sandCounter = 0;

	for(let i = 0; i < universe.length; i++) {
	    for(var j = 0; j < universe[i].length; j++) {

	        if(universe[i][j].clock === universeClock) {
	        	// console.log('particle already clock')
	        	continue
	        }

	        switch(universe[i][j].species) {
			  case SPECIES.sand:
			    await updateSand(i, j, universe)
			    sandCounter++
			  break;

			  case SPECIES.water:
			  	await updateWater(i, j, universe)
			  break;

			  default:
			  	universe[i][j].clock = !universe[i][j].clock;
			    // particle is empty and does not need to be clock
			}
	    }
	}
}

// rules for sand
async function updateSand(x, y, universe) {

	if (!universe[x+1] || !universe[x+1][y+1] | !universe[x+1][y-1]) { //particle is on the bottom row or on the edges
		universe[x][y].clock = !universe[x][y].clock;
		return
	}

	if(universe[x+1][y].species === SPECIES.empty) { // if cell below me is empty
		// moving particle to cell below
		universe[x+1][y].species = SPECIES.sand; //making particle below me water
		universe[x+1][y].ra = 1; //making particle below me sand
		universe[x+1][y].rb = 1; //making particle below me sand
		universe[x+1][y].clock = !universe[x+1][y].clock;

		// clearing the index for the particle we moved
		universe[x][y].species = SPECIES.empty;
		universe[x][y].ra = 0;
		universe[x][y].rb = 0;
		universe[x][y].clock = !universe[x][y].clock;
	} else if(universe[x+1][y].species === SPECIES.water) {
		// moving particle to cell below
		universe[x+1][y].species = SPECIES.sand; //making particle below me water
		universe[x+1][y].ra = 1; //making particle below me sand
		universe[x+1][y].rb = 1; //making particle below me sand
		universe[x+1][y].clock = !universe[x+1][y].clock;

		// clearing the index for the particle we moved
		universe[x][y].species = SPECIES.water;
		universe[x][y].ra = 0;
		universe[x][y].rb = 0;
		universe[x][y].clock = !universe[x][y].clock;
	} else {

		if (universe[x+1][y+1].species === SPECIES.empty) { // the particle below to the right is empty
			universe[x+1][y+1].species = SPECIES.sand; //making particle below me water
			universe[x+1][y+1].ra = 1; //making particle below me sand
			universe[x+1][y+1].rb = 1; //making particle below me sand
			universe[x+1][y+1].clock = !universe[x+1][y+1].clock;

			// clearing the index for the particle we moved
			universe[x][y].species = SPECIES.empty;
			universe[x][y].ra = 0;
			universe[x][y].rb = 0;
			universe[x][y].clock = !universe[x][y].clock;
		} else if (universe[x+1][y-1].species === SPECIES.empty) { // the particle below to the left is empty
			universe[x][y-1].species = SPECIES.sand; //making particle below me water
			universe[x][y-1].ra = 1; //making particle below me sand
			universe[x][y-1].rb = 1; //making particle below me sand
			universe[x][y-1].clock = !universe[x][y-1].clock;

			// clearing the index for the particle we moved
			universe[x][y].species = SPECIES.empty;
			universe[x][y].ra = 0;
			universe[x][y].rb = 0;
			universe[x][y].clock = !universe[x][y].clock;
		}
	}
}

// rules for water
async function updateWater(x, y, universe) {

	if (!universe[x+1] || !universe[x+1][y+1] | !universe[x+1][y-1]) { //particle is on the bottom row or on the edges
		universe[x][y].clock = !universe[x][y].clock;
		return
	}

	if(universe[x+1][y].species === SPECIES.empty) { // if cell below me is empty
		// moving particle to cell below
		universe[x+1][y].species = SPECIES.water; //making particle below me water
		universe[x+1][y].ra = 1; //making particle below me sand
		universe[x+1][y].rb = 1; //making particle below me sand
		universe[x+1][y].clock = !universe[x+1][y].clock;

		// clearing the index for the particle we moved
		universe[x][y].species = SPECIES.empty;
		universe[x][y].ra = 0;
		universe[x][y].rb = 0;
		universe[x][y].clock = !universe[x][y].clock;
	} else {

		if (universe[x+1][y+1].species === SPECIES.empty) { // the particle below to the right is empty
			universe[x+1][y+1].species = SPECIES.water; //making particle below me water
			universe[x+1][y+1].ra = 1; //making particle below me sand
			universe[x+1][y+1].rb = 1; //making particle below me sand
			universe[x+1][y+1].clock = !universe[x+1][y+1].clock;

			// clearing the index for the particle we moved
			universe[x][y].species = SPECIES.empty;
			universe[x][y].ra = 0;
			universe[x][y].rb = 0;
			universe[x][y].clock = !universe[x][y].clock;
		} else if (universe[x+1][y-1].species === SPECIES.empty) { // the particle below to the left is empty
			universe[x][y-1].species = SPECIES.water; //making particle below me water
			universe[x][y-1].ra = 1; //making particle below me sand
			universe[x][y-1].rb = 1; //making particle below me sand
			universe[x][y-1].clock = !universe[x][y-1].clock;

			// clearing the index for the particle we moved
			universe[x][y].species = SPECIES.empty;
			universe[x][y].ra = 0;
			universe[x][y].rb = 0;
			universe[x][y].clock = !universe[x][y].clock;
		} else if (universe[x][y+1].species === SPECIES.empty) { // the cell to the right is empty
			universe[x][y+1].species = SPECIES.water; //making particle below me water
			universe[x][y+1].ra = 1; //making particle below me sand
			universe[x][y+1].rb = 1; //making particle below me sand
			universe[x][y+1].clock = !universe[x][y+1].clock;

			// clearing the index for the particle we moved
			universe[x][y].species = SPECIES.empty;
			universe[x][y].ra = 0;
			universe[x][y].rb = 0;
			universe[x][y].clock = !universe[x][y].clock;
		} else if (universe[x][y-1].species === SPECIES.empty) {
			universe[x][y-1].species = SPECIES.water; //making particle below me water
			universe[x][y-1].ra = 1; //making particle below me sand
			universe[x][y-1].rb = 1; //making particle below me sand
			universe[x][y-1].clock = !universe[x][y-1].clock;

			// clearing the index for the particle we moved
			universe[x][y].species = SPECIES.empty;
			universe[x][y].ra = 0;
			universe[x][y].rb = 0;
			universe[x][y].clock = !universe[x][y].clock;
		}
	}

}

/* 
	Utility functions
*/

// prints the universe in a human friendly format in the console
function printUniverse(universe) {
	let buffer = ''
	for(let i = 0; i < universe.length; i++) {
		for(let j = 0; j < universe[i].length; j++) {

			if(universe[i][j].species == SPECIES.sand) {
				buffer += 's'
			} else if (universe[i][j].species == SPECIES.water){
				buffer += '.'
			} else {
				buffer += ' '
			}
			// buffer += universe[i][j].species
		}
		buffer += '\n'
	}

	console.log(buffer)
}

// creates a universe filled with randodm particles of a given width and height
async function prepareRandomUniverse(width, height) {
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


/*
	P5js functions
*/

function setup() {
	createCanvas(uWidth * uScale, uHeight * uScale)
	pixelDensity(1)
	// noLoop()
}

function draw() {
	background(100);

	loadPixels()


	for(let i = 0; i < uWidth; i++) {
		for(let j = 0; j < universe[i].length; j++) {

			let index;

			if(universe[i][j].species == SPECIES.sand) {
				index = (i + j * uWidth) * 4;
				pixels[index+0] = 207; // red
				pixels[index+1] = 185; // green
				pixels[index+2] = 151; // blue
				pixels[index+3] = 255; // alpha
			} else if(universe[i][j].species == SPECIES.water) {
				index = (i + j * uWidth) * 4;
				pixels[index+0] = 0; // red
				pixels[index+1] = 0; // green
				pixels[index+2] = 255; // blue
				pixels[index+3] = random(200, 250); // alpha
			} else {
				index = (i + j * uWidth) * 4;
				pixels[index+0] = random(255); // red
				pixels[index+1] = 0; // green
				pixels[index+2] = 0; // blue
				pixels[index+3] = random(0, 20); // alpha
			}
		}
	}

	// for(let i = 0; i < universe.length; i++) {
	// 	for(let j = 0; j < universe[i].length; j++) {
	// 		if(universe[i][j].species == SPECIES.sand) {
	// 		  	fill(207,185,151,random(255));
	// 		} else if(universe[i][j].species == SPECIES.water) {
	// 		  	fill(0,0,255,255);
	// 		} else {
	// 			fill(0,0,0,0)
	// 		}

	// 		noStroke()
	// 		circle(i * uScale, j * uScale, uScale);
	// 	}
	// }

	updatePixels()
}

function mousePressed() {
	console.log(mouseX)
	console.log(mouseY)
}

function mouseDragged() {
	universe[mouseX][mouseY].species = drawingTool.species;
	universe[mouseX][mouseY].ra = 0;
	universe[mouseX][mouseY].rb = 0;
	universe[mouseX][mouseY].clock = !universe[mouseX][mouseY].clock;
}

function setDrawingTool(element) {
	if(element.id === 'drwSand') {
		drawingTool.species = SPECIES.sand;
	} else if(element.id === 'drwWater') {
		drawingTool.species = SPECIES.water;
	} else if (element.id === 'drwWall') {
		console.log('wall not supported yet')
	}
}

run()