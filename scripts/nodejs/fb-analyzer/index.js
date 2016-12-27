const
	Express = require( "express" ),
	FbConfig = require( "./config.js" ),
	FbGraph = require( "fbgraph" );


module.exports = class FbAnalyzer {
	constructor () {
		this.expressServer = null;
		this.authUrl = "";

		this.init();
	}

	init () {

	}
};