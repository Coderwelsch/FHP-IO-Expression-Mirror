const
	AuthData = require( "../config" ),
	Express = require( "express" ),
	OpenUrl = require( "openurl" ),
	Request = require( "request" ),
	FileSystem = require( "fs" );


class FacebookAuth {
	constructor ( callback = null ) {
		if ( callback === null ) {
			throw new Error( "Callback is not defined" );
		}

		this.server = null;
		this.accessToken = null;
		this.callback = callback;

		this.checkForAccessToken();
	}

	checkForAccessToken () {
		if ( FileSystem.existsSync( __dirname + "/../.access-token" ) ) {
			let accessToken = FileSystem.readFileSync( __dirname + "/../.access-token", { encoding: "utf8" } );

			this.accessToken = accessToken;
			this.callback( accessToken );
		} else {
			this.initExpressServer( () => {
				this.initFbAuth();
			} );
		}
	}

	initExpressServer ( callback = null ) {
		// init
		this.server = Express();

		// set routes
		this.server.get( "/facebook-login", ( request, resource ) => {
			if ( request.query.code ) {
				this.getAcessTokenByCode( request.query.code );
			}

			resource.send( "ACCESS GRANTED" );
		} );

		// start server
		this.server.listen( 3000, callback );
	}

	getAcessTokenByCode ( code = "" ) {
		Request( `https://graph.facebook.com/v2.8/oauth/access_token?client_id=${ AuthData.appId }&redirect_uri=${ AuthData.authRedirectUrl }&client_secret=${ AuthData.appSecret }&code=${ code }`, ( error, response, body ) => {
			let parsedBody = JSON.parse( body );
			this.getLongLivedAccessToken( parsedBody.access_token );
		} );
	}

	getLongLivedAccessToken( shortLivedAccessToken = "" ) {
		Request( `https://graph.facebook.com/v2.8/oauth/access_token?grant_type=fb_exchange_token&client_id=${ AuthData.appId }&client_secret=${ AuthData.appSecret }&fb_exchange_token=${ shortLivedAccessToken }`, ( error, response, body ) => {
			let parsedBody = JSON.parse( body );

			this.accessToken = parsedBody.access_token;
			this.saveLongLivedAccessToken();
			this.done();
		} );
	}

	saveLongLivedAccessToken () {
		FileSystem.writeFileSync( __dirname + "/../.access-token", this.accessToken, { flag: "w+" } );
	}

	closeServer () {
		try {
			this.server.close();
		} catch ( error ) {
			// i give a damn ****
		}
	}

	initFbAuth () {
		OpenUrl.open( `https://www.facebook.com/v2.8/dialog/oauth?client_id=${ AuthData.appId }&redirect_uri=${ AuthData.authRedirectUrl }&response_type=code&scope=user_friends` );
	}

	done () {
		this.closeServer();
		this.callback( this.accessToken );
	}
}

module.exports = FacebookAuth;