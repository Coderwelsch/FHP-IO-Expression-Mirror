// imports
import World from "./world/World.js";


// prevent annoying warnings of THREE.js
window.console.warn = () => { /* shut up man */ };

// and god said, let there be light and there was light
let world = new World();

// debug
window.scene = world.scene;

// test
let direction = true;
window.setInterval( () => {
	let value = world.globeMoodController.getMoodValue();

	if ( value > 0.5 ) {
		direction = false;
	}

	if ( direction ) {
		world.globeMoodController.setMoodValue( value + 0.1 );
	} else {
		world.globeMoodController.setMoodValue( value - 0.1 );

		if ( value < 0.1 ) {
			direction = true;
		}
	}

	console.log( world.globeMoodController.getMoodValue() );
}, 10000 );