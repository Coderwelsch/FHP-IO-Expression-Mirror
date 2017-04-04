// imports
import FloraAndFauna from "../world/FloraAndFauna.js";
import Textures from "../textures/Textures.js";


const MoodStates = [ 
	{
		name: "Desert",
		test: ( moodValue ) => { return ( moodValue >= 0 && moodValue <= 0.1 ); },
		enter: function ( controller ) {
			controller.floraAndFauna.changeGlobeMaterial( Textures.globe.desert, false );
			controller.floraAndFauna.changeSwimmingDucks();
			controller.floraAndFauna.changeWaterLevel( 0.975 );
			controller.floraAndFauna.changeGrassVegetation();
			controller.floraAndFauna.changeFlamingoFauna();
			controller.floraAndFauna.changeTreeVegetation( [ 5, 10 ], "deadTrees" );
		},
		leave: function ( controller ) {

		}
	}, {
		name: "Fertile",
		test: ( moodValue ) => { return ( moodValue > 0.1 && moodValue <= 0.2 ); },
		enter: function ( controller ) {
			controller.floraAndFauna.changeGlobeMaterial( Textures.globe.fertile, false );
			controller.floraAndFauna.changeWaterLevel( 1 );
			controller.floraAndFauna.changeTreeVegetation();
			controller.floraAndFauna.changeGrassVegetation( [ 10, 20 ] );
		},
		leave: function ( controller ) {

		}
	}, {
		name: "First-Seed",
		test: ( moodValue ) => { return ( moodValue > 0.2 && moodValue <= 0.3 ); },
		enter: function ( controller ) {
			// controller.floraAndFauna.changeGlobeMaterial( Textures.globe.grassDryMud, false );
			controller.floraAndFauna.changeGrassVegetation( [ 50, 500 ], "deadGrass" );
		},
		leave: function ( controller ) {

		}
	}, {
		name: "Its-Growing",
		test: ( moodValue ) => { return ( moodValue > 0.3 && moodValue <= 0.4 ); },
		enter: function ( controller ) {
			// controller.floraAndFauna.changeFlamingoFauna( [ 10, 15 ] );
			// controller.floraAndFauna.changeGlobeMaterial( Textures.globe.grassFertile, false );
			// controller.floraAndFauna.changeGrassVegetation( [ 200, 400 ], "deadGrass" );
		},
		leave: function ( controller ) {

		}
	}
];

export default class GlobeMoodController {
	constructor ( globeReference, initalMoodValue ) {
		this.globe = globeReference;
		this.mood = initalMoodValue;
		this.currentState = null;

		this.floraAndFauna = new FloraAndFauna( this.globe );

		this.setMoodValue();
	}

	setMoodValue ( moodValue = this.mood ) {
		moodValue = Number( moodValue.toFixed( 1 ) );

		if ( Number.isNaN( moodValue ) ) {
			return;
		}

		if ( moodValue < 0 ) {
			moodValue = 0;
		}

		this.mood = moodValue;
		this.updateGlobeStateToMood();
	}

	getMoodValue () {
		return this.mood;
	}

	getMoodState () {
		return ( this.currentState !== null ? this.currentState : undefined );
	}

	getAllMoodStates () {
		return MoodStates;
	}

	updateGlobeStateToMood () {
		let oldMoodValue = this.currentState;

		for ( let state of MoodStates ) {
			if ( state.test( this.mood ) && state !== oldMoodValue ) {
				if ( this.currentState !== null && typeof this.currentState.leave === "function" ) {
					this.currentState.leave( this.globe, this.mood );
				}

				state.enter( this );
				this.currentState = state;

				break;
			}
		}

		if ( this.currentState === null ) {
			window.console.log( "No globe state found for mood value %s", this.mood );
		} else if ( oldMoodValue !== null && this.currentState !== oldMoodValue ) {
			window.console.log( "Changed globe mood state from '%s' to '%s'", oldMoodValue.name, this.currentState.name );
		} else if ( this.currentState === oldMoodValue ) {
			window.console.log( "Globe mood state already set to '%s'", this.currentState.name );
		} else {
			window.console.log( "Set initial globe mood state to '%s'", this.currentState.name );
		}
	}

	render () {
		this.floraAndFauna.render();
	}
}
