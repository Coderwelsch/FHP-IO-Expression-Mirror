// imports
import World from "./world/World.js";


// prevent annoying warnings of THREE.js
window.console.warn = () => { /* shut up man */ };

// and god said, let there be light and there was light
let world = new World();

// debug
window.scene = world.scene;

// test
window.setInterval( () => {
	let value = world.globeMoodController.getMoodValue() + 0.1;
	world.globeMoodController.setMoodValue( value );
}, 8000 );