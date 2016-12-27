const Nightmare = require( "nightmare" );

class ChefkochRecipeOfTheDay {
	constructor ( debug = false ) {
		this.isDebug = debug;
		this.urlRecipeOfTheDayOverview = "http://www.chefkoch.de/rezept-des-tages.php";
		this.selectorRecipeOfTheDayAnchor = "div.card.card-recipe.recipe--today > div.card__picture > a";
	}

	initBrowser () {
		this.browser = new Nightmare( {
			show: this.isDebug,
			openDevTools: false,
			webPreferences: {
				images: true
			}
		} );
	}

	getRecipeOfTheDay ( callback = null ) {
		if ( typeof callback !== "function" ) {
			throw new Error( "No callback defined!" );
		}

		this.initBrowser();
		this.scrapeRecipeOfTheDayUrl( callback );
	}

	scrapeRecipeOfTheDayUrl ( callback = null ) {
		this.browser
			.goto( this.urlRecipeOfTheDayOverview )
			.evaluate( function ( selectorRecipeOfTheDayAnchor ) {
				return document.querySelector( selectorRecipeOfTheDayAnchor ).href;
			}, this.selectorRecipeOfTheDayAnchor )
			.then( ( recipeUrl ) => {
				if ( recipeUrl ) {
					this.scrapeRecipeSite( callback, recipeUrl );
				} else {
					this.done( new Error( "Recipe-Of-The-Day url is empty" ), null, callback );
				}
			} )
			.catch( ( error ) => {
				this.done( error, null, callback );
			} );
	}

	scrapeRecipeSite ( callback = null, recipeUrl = "" ) {
		this.browser
			.goto( recipeUrl )
			.evaluate( ( done ) => {
				let slideshowElem = document.querySelector( ".slideshow-imagelink.cboxElement" ),
					data = null,
					slideshowInterval = null;

				// set main recipe data
				data = {
					name: document.querySelector( ".page-title" ).innerText,
					description: document.querySelector( "#page .content-wrapper .content .summary" ).innerHTML.replace,
					rating: Number.parseFloat( document.querySelector( "#recipe__rating .rating__average-rating" ).innerText.replace( "Ø", "" ).replace( ",", "." ) ),
					ingredients: document.querySelector( "#recipe-incredients div.ingredients__container > table" ).outerHTML,
					preparationInfo: document.querySelector( "#preparation-info" ).innerHTML
				};

				// open slideshow gallery to scrape a good image
				if ( slideshowElem === null ) {
					slideshowInterval = setInterval( () => {
						slideshowElem = document.querySelector( ".slideshow-imagelink.cboxElement" );

						if ( slideshowElem !== null ) {
							clearInterval( slideshowInterval );
							slideshowElem.click();
							getImageUrl();
						}
					}, 50 );
				} else {
					slideshowElem.click();
					getImageUrl();
				}

				function getImageUrl () {
					setInterval( () => {
						let img = document.querySelector("#cboxLoadedContent > img");

						if ( img !== null ) {
							data.imageUrl = img.src;
							done( null, data );
						}
					}, 50 );
				}
			} )
			.then( ( data ) => {
				this.done( null, data, callback )
			} )
			.catch( ( error ) => {
				this.done( error, null, callback );
			} );
	}

	stopBrowser () {
		this.browser
			.end()
			.then( () => {} );
	}

	done ( error = null, recipeData = {}, callback = null ) {
		this.stopBrowser();

		if ( error !== null ) {
			callback( error );
		} else {
			callback( null, recipeData );
		}
	}
}

module.exports = ChefkochRecipeOfTheDay;