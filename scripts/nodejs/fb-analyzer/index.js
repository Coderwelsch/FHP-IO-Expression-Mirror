const
	AuthData = require( "./config.js" ),
	FacebookAuth = require( "./lib/FacebookAuth.js" ),
	FbGraph = require( "fbgraph" );

class FacebookAnalyzer {
	constructor () {
		this.fbAuth = null;

		this.initFacebookAuth();
	}

	initFacebookAuth () {
		this.fbAuth = new FacebookAuth( ( accessToken ) => {
			console.log( accessToken );
		} );
	}
}

module.exports = FacebookAnalyzer;