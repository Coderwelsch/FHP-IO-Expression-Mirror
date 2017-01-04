const
	AuthData = require( "./config.js" ),
	FacebookAuth = require( "./lib/FacebookAuth.js" ),
	FbGraph = require( "./lib/FacebookGraph.js" );

class FacebookDataScraper {
	constructor ( callback = null ) {
		this.callback = callback;
		this.fbAuth = null;
		this.fbGraph = null;
		this.accessToken = "";

		this.initFacebookAuth();
	}

	initFacebookAuth () {
		this.fbAuth = new FacebookAuth( ( error, accessToken ) => {
			if ( error ) {
				throw new Error( error );
			}

			this.accessToken = accessToken;
			this.fbGraph = new FbGraph( this.accessToken );
			this.getRandomFriend();
		} );
	}

	getRandomFriend () {
		this.fbGraph.getRandomFriendFromLatestPostsLikes( ( error, data ) => {
			this.callback( error, data );
			this.callback = null;
		} );
	}
}

module.exports = FacebookDataScraper;