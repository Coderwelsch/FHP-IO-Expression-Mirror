// imports
const Nightmare = require( "nightmare" );

class SteamFree2PlaySuggestions {
	constructor ( debug = false ) {
		this.url = "http://store.steampowered.com/genre/Free%20to%20Play/?tab=MostPlayed";
		this.gamesSelector = "#GenreItemsRows > a";
		this.gameNameSelector = "div.page_content_ctn .apphub_HomeHeaderContent .apphub_AppName",
		this.screenshotSelector = ".highlight_screenshot .highlight_screenshot_link";
		this.gameSteamUrl = "";
		this.isDebug = debug;
		this.browser = null;
	}

	initBrowser () {
		this.browser = new Nightmare( {
			show: this.isDebug,
			openDevTools: this.isDebug,
			webPreferences: {
				images: false
			}
		} );
	}

	getRandomGame ( callback = null ) {
		if ( typeof callback !== "function" ) {
			throw new Error( "No callback defined!" );
		}

		this.initBrowser();
		this.scrapeOverviewPage( callback );
	}

	scrapeOverviewPage ( callback = null ) {
		this.browser
			.goto( this.url )
			.evaluate( function ( selector ) {
				var gamesNodes = document.querySelectorAll( selector ),
					randomIndex = Number.parseInt( Math.random() * gamesNodes.length, 10 ),
					randomGame = gamesNodes[ randomIndex ];

				return randomGame.href;
			}, this.gamesSelector )
			.then( ( result ) => {
				this.gameSteamUrl = result;
				this.scrapeRandomGameSite( callback );
			} )
			.catch( ( error ) => {
				callback( error );
			} );

	}

	scrapeRandomGameSite ( callback = null ) {
		this.browser
			.goto( this.gameSteamUrl )
			.evaluate( this.getEvaluateFunctionForGameSite(), this.gameNameSelector, this.screenshotSelector )
			.then( ( gameData ) => {
				console.log( "Scraped Random Game Site", gameData );

				if ( gameData.isAgeCheckSite ) {
					this.passingAgeCheckSite( callback );
				} else {
					this.done( null, gameData.gameData, callback );
				}
			} )
			.catch( ( error ) => {
				callback( error );
			} );
	}

	getEvaluateFunctionForGameSite () {
		return function ( gameNameSelector, screenshotSelector, done ) {
			function loadingDone () {
				var href = document.location.href,
					regexAgeCheckSimple = /\/app\/\d*\/agecheck/gi,
					regexAgeCheckWithBirthDate = /agecheck\/app\//gi,
					regexAppId = /app\/([^\/]*)/gi,
					regexGenreLink = /\/genre\/[^\/]*\//g,
					isAgeCheckSiteSimple = regexAgeCheckSimple.test( href ),
					isAgeCheckSiteWithBirthDate = regexAgeCheckWithBirthDate.test( href ),
					gameDetailsLinks = document.querySelectorAll( ".game_details .details_block a" ),
					genres = [];

				if ( !isAgeCheckSiteSimple && !isAgeCheckSiteWithBirthDate ) {
					if ( gameDetailsLinks !== null && gameDetailsLinks.length ) {
						for ( var i = 0; i < gameDetailsLinks.length; i++ ) {
							var anchorElem = gameDetailsLinks[ i ];

							if ( regexGenreLink.test( anchorElem.href ) ) {
								genres.push( anchorElem.innerText );
							}
						}
					}

					done( null, {
						gameData: {
							name: document.querySelector( gameNameSelector ).innerHTML,
							imageUrl: document.querySelector( screenshotSelector ).href,
							genres: genres
						}
					} );
				} else {
					if ( isAgeCheckSiteSimple ) {
						var appId = regexAppId.exec( href );

						if ( appId !== null && appId.length >= 2 ) {
							appId = Number.parseInt( appId[ 1 ], 10 );
							HideAgeGate( appId );

							done( null, { isAgeCheckSite: true } );
						} else {
							done( new Error( "Couldn't find the app id" ) );
						}
					} else {
						var selectElem = document.querySelector("select#ageYear");

						if ( selectElem !== null || typeof DoAgeGateSubmit !== "function" ) {
							selectElem.value = 1950;
							DoAgeGateSubmit();

							done( null, { isAgeCheckSite: true } );
						} else {
							done( new Error( "Couldn't find select element on age verification site" ) );
						}
					}
				}
			}

			if ( document.readyState !== "complete" ) {
				document.onload = loadingDone();
			} else {
				loadingDone();
			}
		}
	}

	passingAgeCheckSite ( callback = null ) {
		this.browser
			.evaluate( this.getEvaluateFunctionForGameSite(), this.gameNameSelector, this.screenshotSelector )
			.then( ( gameData ) => {
				this.done( null, gameData, callback );
			} )
			.catch( ( error ) => {
				this.done( error );
			} );
	}

	stopBrowser () {
		this.browser
			.end()
			.then( () => {} );
	}

	done ( error = null, gameData = {}, callback = null ) {
		this.stopBrowser();

		if ( error !== null ) {
			callback( error );
		} else {
			callback( null, gameData );
		}
	}
}

module.exports = SteamFree2PlaySuggestions;