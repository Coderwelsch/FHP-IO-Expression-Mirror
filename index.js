// modules
const Spawn = require( "child_process" ).spawn,
	Express = require( "express" ),
	Path = require( "path" ),
	ServeStatic = require( "serve-static" );

// const data
const PATH_FACE_EXPRESSION_SCRIPT = "./src/python/face-expression.py";

// variables
let pythonProcess,
	app;


// functions
function init () {
	startStaticserver();
	// spawnFaceExpressionProcess();
}

function startStaticserver () {
	app = Express();
	app.use( ServeStatic( Path.join( __dirname, "www" ), {} ) );
	app.listen( 3000 );
}

function spawnFaceExpressionProcess () {
	pythonProcess = Spawn( "python", [ "-u", PATH_FACE_EXPRESSION_SCRIPT ] );
	pythonProcess.stdout.on( "data", onProcessData );
	pythonProcess.stderr.on( "data", onProcessError );
	pythonProcess.on( "close", onProcessClose );
	console.log( "[PYT]", "Face Expression script started" );
}

function onProcessData ( data ) {
	data = String( data ).replace( "\n", "" );
	console.log( "[PYT]", "Got data:", String( data ) );
}

function onProcessError ( data ) {
	data = String( data ).replace( "\n", "" );
	console.log( "[PYT]", "Failed:", String( data ) );
}

function onProcessClose ( code ) {
	console.log( "[PYT]", "Terminated with exit code:", String( code ) );
	
	console.log( "[PRC]", "Kill process now" );
	process.exit( 0 );
}


// call init
init();