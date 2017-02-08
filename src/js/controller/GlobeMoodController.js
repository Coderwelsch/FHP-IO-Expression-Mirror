// imports
import FloraAndFauna from "../world/FloraAndFauna.js";
import Textures from "../textures/Textures.js";


const MoodStates = [
	{
		name: "Desert",
		test: ( moodValue ) => { return ( moodValue >= 0 && moodValue <= 0.1 ); },
		enter: function ( controller ) {
			controller.floraAndFauna.changeGlobeMaterial( Textures.globe.desert, false );
			controller.floraAndFauna.changeWaterLevel( 0.98 );
		},
		leave: function ( controller ) {

		}
	}, {
		name: "Fertile",
		test: ( moodValue ) => { return ( moodValue > 0.1 && moodValue <= 0.2 ); },
		enter: function ( controller ) {
			controller.floraAndFauna.changeGlobeMaterial( Textures.globe.fertile, false );
			controller.floraAndFauna.changeWaterLevel( 1 );
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