// universe
let universe;

// universe clock, flips between true/false to determine if particles have been updated in this game loop
let universeClock = true;

// ENUM for existing species
const SPECIES = {
    sand: 0,
    empty: 1,
    water: 2,
}


async function run() {

	universe = await prepareRandomUniverse(130, 60);

	for (let i = 0; i < 100; i++) {
		await update(universe)
		universeClock = !universeClock

		printUniverse(universe)
		await new Promise(r => setTimeout(r, 30));
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
			    // await new Promise(r => setTimeout(r, 50));
			    // printUniverse(universe)
			    // universe[i][j].clock = true;
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

	// console.log('counted ' + sandCounter + ' sand particles')
}

// rules for sand
async function updateSand(x, y, universe) {

	if (!universe[x+1]) { //particle is on the bottom row
		universe[x][y].clock = !universe[x][y].clock;
		return
	}

	switch(universe[x+1][y].species) {

		case SPECIES.empty:
			// moving particle to cell below
			universe[x+1][y].species = SPECIES.sand; //making particle below me sand
			universe[x+1][y].ra = 1; //making particle below me sand
			universe[x+1][y].rb = 1; //making particle below me sand
			universe[x+1][y].clock = !universe[x+1][y].clock;

			// clearing the index for the particle we moved
			universe[x][y].species = SPECIES.empty;
			universe[x][y].ra = 0;
			universe[x][y].rb = 0;
			universe[x][y].clock = !universe[x][y].clock;
		break;

		case SPECIES.sand:
			universe[x][y].clock = !universe[x][y].clock;
		break;

		case SPECIES.water:

			//making particle below me sand
			universe[x+1][y].species = SPECIES.sand;
			universe[x+1][y].ra = 1;
			universe[x+1][y].rb = 1;
			universe[x+1][y].clock = !universe[x+1][y].clock;

			//putting a water particle in my current index
			universe[x][y].species = SPECIES.water;
			universe[x][y].ra = 1;
			universe[x][y].rb = 1;
			universe[x][y].clock = !universe[x][y].clock;
		break;

		default:
			// nothing needed so
	}
}

async function updateWater(x, y, universe) {
	if (!universe[x+1] || !universe[x+1][y-1] || !universe[x+1][y+1]) { //particle is on the bottom row
		universe[x][y].clock = !universe[x][y].clock;
		return
	}

	// cell below me
	switch(universe[x+1][y].species) {

		case SPECIES.empty:
			// moving particle to cell below
			universe[x+1][y].species = SPECIES.water; //making particle below me water
			universe[x+1][y].ra = 1; //making particle below me water
			universe[x+1][y].rb = 1; //making particle below me water
			universe[x+1][y].clock = universe[x+1][y].clock;

			// clearing the index for the particle we moved
			universe[x][y].species = SPECIES.empty;
			universe[x][y].ra = 0;
			universe[x][y].rb = 0;
			universe[x][y].clock = !universe[x][y].clock;
		break;

		default:

			switch(universe[x+1][y-1].species) { // cell to the bottom right

				case SPECIES.empty:
					// moving particle to cell below and to the right
					universe[x+1][y-1].species = SPECIES.water; 
					universe[x+1][y-1].ra = 1; 
					universe[x+1][y-1].rb = 1; 
					universe[x+1][y-1].clock = !universe[x+1][y-1].clock;

					// clearing the index for the particle we moved
					universe[x][y].species = SPECIES.empty;
					universe[x][y].ra = 0;
					universe[x][y].rb = 0;
					universe[x][y].clock = !universe[x][y].clock;
				break;

				default:
					universe[x][y].clock = !universe[x][y].clock;
			}

			// cell to the bottom left
			switch(universe[x+1][y+1].species) {

				case SPECIES.empty:
					// moving particle to cell below
					universe[x+1][y+1].species = SPECIES.water; 
					universe[x+1][y+1].ra = 1; 
					universe[x+1][y+1].rb = 1; 
					universe[x+1][y+1].clock = !universe[x+1][y+1].clock;

					// clearing the index for the particle we moved
					universe[x][y].species = SPECIES.empty;
					universe[x][y].ra = 0;
					universe[x][y].rb = 0;
					universe[x][y].clock = !universe[x][y].clock;
				break;

				default:
					universe[x][y].clock = !universe[x][y].clock;
			}

			// cell next to me
			// switch(universe[x][y+1].species) {
			// 	case SPECIES.empty:
			// 		// moving particle to cell below
			// 		universe[x][y+1].species = SPECIES.water; 
			// 		universe[x][y+1].ra = 1; 
			// 		universe[x][y+1].rb = 1; 
			// 		universe[x][y+1].clock = !universe[x][y+1].clock;

			// 		// clearing the index for the particle we moved
			// 		universe[x][y].species = SPECIES.empty;
			// 		universe[x][y].ra = 0;
			// 		universe[x][y].rb = 0;
			// 		universe[x][y].clock = !universe[x][y].clock;
			// 	break;
			// 	default:
			// 		universe[x][y].clock = !universe[x][y].clock;
			// }

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
				buffer += 'w'
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
  let possibilities = [1, 1, 1, 0, 2];
  let index = Math.floor(Math.random() * possibilities.length);
  return possibilities[index];
}

function randomRegistry () {
	return Math.floor(Math.random() * 8)
}

run()