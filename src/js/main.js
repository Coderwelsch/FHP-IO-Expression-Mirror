// imports
import World from "./world/World.js";
import ProgressBar from "./vendor/progressbar.js";


// prevent annoying warnings of THREE.js
window.console.warn = () => { /* shut up man */ };

// and god said, let there be light and there was light
let world = new World(),
	panelDom;

// debug
window.scene = world.scene;

// test
let interval,
	progressBar,
	direction = true;


function init () {
	progressBar = new ProgressBar.Circle( ".progress", {
		color: "#FFFFFF",
		strokeWidth: 3,
		trailColor: "#CCCCCC",
		trailWidth: 0.1,
		text: {
			value: "0%"
		},
		from: {
			color: "#E85913",
			width: 3
		},
		to: {
			color: "#13E81B",
			width: 3
		},
		step: function ( state, circle ) {
			circle.path.setAttribute( "stroke", state.color );
			circle.path.setAttribute( "stroke-width", state.width );
			circle.setText( Math.round( circle.value() * 100 ) + "%" );
		}
	} );

	interval = window.setInterval( () => {
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

		updatePanel();
	}, 10000 );

	panelDom = document.getElementById( "panel" );
	updatePanel();
}

function updatePanel () {
	let moodValue = world.globeMoodController.getMoodValue();

	progressBar.animate( moodValue, {

	} );
	panelDom.querySelector( ".state" ).innerText = world.globeMoodController.getMoodState().name;
}

// wait for dom ready state
document.onreadystatechange = () => {
	if ( document.readyState === "complete" ) {
		init();
	}
};
