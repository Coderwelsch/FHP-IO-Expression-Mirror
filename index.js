const
	Extend = require( "extend" ),
	LeftPad = require( "left-pad" ),
	ExpressionShell = require( "./scripts/nodejs/expression-shell-bridge/index.js" ),
	Weather = require( "./scripts/nodejs/weather/index.js" ),
	FacebookDataScraper = require( "./scripts/nodejs/fb-data-scraper/index.js" ),
	SteamF2P = require( "./scripts/nodejs/steam-f2p-suggests/index.js" );
	ChefkochRecipeOfTheDay = require( "./scripts/nodejs/chefkoch-recipe-of-the-day/index.js" );

/*let
	fbScraper = new FacebookDataScraper(),
	steamF2P = new SteamF2P( true ),
	recipeOfTheDay = new ChefkochRecipeOfTheDay( true );*/


class ExpressionMirror {
	constructor ( settings = {} ) {
		this.settings = {
			weatherSettings: {
				location: "14473 Potsdam, Deutschland",
				updateInterval: 30 * 360 * 1000,
				degreeType: "C",
			}
		};

		this.initializedModules = {
			expression: false,
			weather: false,
			fb: false,
			steam: false,
			chefkoch: false
		};

		Extend( true, this.settings, settings );

		this.initModules();
		// this.start();
	}

	initModules () {
		this.log( "Main", "init modules" );

		this.expressionShell = new ExpressionShell();
		this.initializedModules.expression = true;
		this.log( "Py Shell", "initialized" );

		this.weather = new Weather( this.settings.weatherSettings );
		this.initializedModules.weather = true;
		this.log( "Weather", "initialized" );

		this.steamF2P = new SteamF2P();
		this.initializedModules.steam = true;
		this.log( "Steam", "initialized" );

		this.recipeOfTheDay = new ChefkochRecipeOfTheDay();
		this.initializedModules.chefkoch = true;
		this.log( "Recipe", "initialized" );

		this.fbScraper = new FacebookDataScraper( ( error ) => {
			if ( error ) {
				throw error;
			} else {
				this.log( "FB", "initialized" );
				this.initializedModules.fb = true;

				this.modulesInitialized();
			}
		} );
	}

	modulesInitialized () {
		this.log( "Main", "modules initialized" );
		this.start();
	}

	log ( moduleName = "Main", message = "" ) {
		let module = LeftPad( `[${ moduleName }]`, 10 );
		console.log( module, message );
	}

	start () {
		this.weather.startWeatherIntervalUpdate( ( error, data ) => {
			if ( error ) {
				this.log( "Weather", error );
			} else {
				this.log( "Weather", "got weather data" );
			}
		} );
	}
}

new ExpressionMirror();

// steamF2P.getRandomGame( ( error, gameData ) => {
// 	if ( error ) {
// 		console.log( error );
// 	} else {
// 		console.log( "DONE" );
// 		console.log( gameData );
// 	}
// } );

// recipeOfTheDay.getRecipeOfTheDay( ( error, data ) => {
// 	console.log( error, data );
// } );