const
	Express = require( "express" ),
	FbConfig = require( "./config.js" ),
	FbGraph = require( "fbgraph" );


class FbAnalyzer {
	constructor () {
		this.expressServer = null;
		this.authUrl = "";

		this.init();
		this.configureRoutes();
		this.authorize();
	}

	init () {
		this.expressServer = Express.createServer();
		this.expressServer.configure(function(){
			this.expressServer.set('views', __dirname + '/views');
			this.expressServer.set('view engine', 'jade');
			this.expressServer.use(Express.bodyParser());
			this.expressServer.use(Express.methodOverride());
			this.expressServer.use(this.expressServer.router);
			this.expressServer.use(Express.static(__dirname + '/public'));
		});

		this.expressServer.configure('development', function(){
			this.expressServer.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
		});

		this.expressServer.configure('production', function(){
			this.expressServer.use(express.errorHandler());
		});

		this.authUrl = FbGraph.getOauthUrl( {
			client_id: FbConfig.client_id,
			redirect_uri: FbConfig.redirect_uri
		} );
	}

	configureRoutes () {
		app.get('/', function(req, res){
			res.render("index", { title: "click link to connect" });
		});

		app.get('/auth/facebook', function(req, res) {

		// we don't have a code yet
		// so we'll redirect to the oauth dialog
		if (!req.query.code) {
		var authUrl = graph.getOauthUrl({
		"client_id":     conf.client_id
		, "redirect_uri":  conf.redirect_uri
		, "scope":         conf.scope
		});

		if (!req.query.error) { //checks whether a user denied the app facebook login/permissions
		res.redirect(authUrl);
		} else {  //req.query.error == 'access_denied'
		res.send('access denied');
		}
		return;
		}

		// code is set
		// we'll send that and get the access token
		graph.authorize({
		"client_id":      conf.client_id
		, "redirect_uri":   conf.redirect_uri
		, "client_secret":  conf.client_secret
		, "code":           req.query.code
		}, function (err, facebookRes) {
		res.redirect('/UserHasLoggedIn');
		});


		});


		// user gets sent here after being authorized
		app.get('/UserHasLoggedIn', function(req, res) {
		res.render("index", { title: "Logged In" });
		});


		var port = process.env.PORT || 3000;
		app.listen(port, function() {
		console.log("Express server listening on port %d", port);
		});
	}

	authorize () {

	}
}

module.exports = FbAnalyzer;

/*

// get authorization url

    // shows dialog
    res.redirect(authUrl);

    // after user click, auth `code` will be set
    // we'll send that and get the access token
    graph.authorize({
        "client_id":      conf.client_id
      , "redirect_uri":   conf.redirect_uri
      , "client_secret":  conf.client_secret
      , "code":           req.query.code
    }, function (err, facebookRes) {
      res.redirect('/loggedIn');
    });

*/