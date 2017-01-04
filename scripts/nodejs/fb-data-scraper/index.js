const
	AuthData = require( "./config.js" ),
	FacebookAuth = require( "./lib/FacebookAuth.js" ),
	FbGraph = require( "./lib/FacebookGraph.js" );

class FacebookDataScraper {
	constructor ( callback = null ) {
		this.fbAuth = null;
		this.fbGraph = null;
		this.accessToken = "";

		this.initFacebookAuth( callback );
	}

	initFacebookAuth ( callback = null ) {
		this.fbAuth = new FacebookAuth( ( error, accessToken ) => {
			if ( error ) {
				callback( error );
			} else {
				this.accessToken = accessToken;
				this.fbGraph = new FbGraph( this.accessToken );

				callback();
			}
		} );
	}

	getRandomFriend ( callback = null ) {
		this.fbGraph.getRandomFriendFromLatestPostsLikes( ( error, data ) => {
			callback( error, data );
		} );
	}
}

module.exports = FacebookDataScraper;