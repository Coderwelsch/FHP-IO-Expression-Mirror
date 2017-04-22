// imports
import FloraAndFauna from "../world/FloraAndFauna.js";
import Textures from "../textures/Textures.js";


const MoodStates = [
	{
		name: "The Desert",
		test: ( moodValue ) => { return ( moodValue >= 0 && moodValue <= 0.1 ); },
		enter: function ( controller ) {
			controller.floraAndFauna.changeGlobeMaterial( Textures.globe.desert, false );
			controller.floraAndFauna.changeStones( [ 10, 20 ] );
			controller.floraAndFauna.changeSkeletons( [ 2, 5 ] );
			controller.floraAndFauna.changeWaterLevel( 0.975 );
			controller.floraAndFauna.changeGrassVegetation();
			controller.floraAndFauna.changeFlamingoFauna();
			controller.floraAndFauna.changeTreeVegetation( undefined, "fertileTrees" );
			controller.floraAndFauna.changeTreeVegetation( [ 5, 10 ], "deadTrees" );
			controller.floraAndFauna.changeMushroomsVegetation();
		},
		leave: function ( controller, doneCallback ) {

		}
	}, {
		name: "Fertile World",
		test: ( moodValue ) => { return ( moodValue > 0.1 && moodValue <= 0.2 ); },
		enter: function ( controller ) {
			controller.floraAndFauna.changeGlobeMaterial( Textures.globe.fertile, false );
			controller.floraAndFauna.changeWaterLevel( 1 );
			controller.floraAndFauna.changeSkeletons();
			controller.floraAndFauna.changeFlowers();
			controller.floraAndFauna.changeGrassVegetation( [ 10, 20 ] );
			controller.floraAndFauna.changeTreeVegetation( [ 0, 0 ], "deadTrees" );
			controller.floraAndFauna.changeTreeVegetation( [ 1, 5 ], "fertileTrees" );
			controller.floraAndFauna.changeMushroomsVegetation( [ 1, 10 ] );
		},
		leave: function ( controller, doneCallback ) {

		}
	}, {
		name: "Growing",
		test: ( moodValue ) => { return ( moodValue > 0.2 && moodValue <= 0.3 ); },
		enter: function ( controller ) {
			// controller.floraAndFauna.changeFlamingoFauna( [ 10, 15 ] );
			// controller.floraAndFauna.changeGlobeMaterial( Textures.globe.grassDryMud, false );
			controller.floraAndFauna.changeFlamingoFauna();
			controller.floraAndFauna.changeGrassVegetation( [ 50, 500 ], "deadGrass" );
			controller.floraAndFauna.changeTreeVegetation( [ 6, 10 ], "fertileTrees" );
			controller.floraAndFauna.changeMushroomsVegetation( [ 10, 50 ] );
			controller.floraAndFauna.changeFlowers( [ 5, 20 ] );
			controller.floraAndFauna.changeTeepees();
		},
		leave: function ( controller, doneCallback ) {

		}
	}, {
		name: "Settlers",
		test: ( moodValue ) => { return ( moodValue > 0.3 && moodValue <= 0.4 ); },
		enter: function ( controller ) {
			controller.floraAndFauna.changeFlamingoFauna( [ 3, 6 ] );
			controller.floraAndFauna.changeTeepees( [ 1, 3 ] );
			controller.floraAndFauna.changeFlowers( [ 20, 30 ] );
		},
		leave: function ( controller, doneCallback ) {

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
