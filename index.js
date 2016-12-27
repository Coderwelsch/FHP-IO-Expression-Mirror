const
	FbAnalyzer = require( "./scripts/nodejs/fb-analyzer/index.js" ),
	SteamF2P = require( "./scripts/nodejs/steam-f2p-suggests/index.js" );
	ChefkochRecipeOfTheDay = require( "./scripts/nodejs/chefkoch-recipe-of-the-day/index.js" );

let
	fbAnalyzer = new FbAnalyzer(),
	steamF2P = new SteamF2P( true ),
	recipeOfTheDay = new ChefkochRecipeOfTheDay( true );

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