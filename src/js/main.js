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
	world.globeMoodController.setMoodValue( world.globeMoodController.getMoodValue() + 0.1 );
}, 4000 );