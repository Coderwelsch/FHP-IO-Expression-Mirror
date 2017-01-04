// modules
const
	Spawn = require( "child_process" ).spawn,
	Path = require( "path" );


class ExpressionShell {
	constructor ( pythonScriptPath ) {
		this.pythonScriptPath = pythonScriptPath || Path.resolve( __dirname, "../../python/face-expression.py" );
		this.process = null;
	}

	start ( callback ) {
		this.process = Spawn( "/usr/local/bin/python", [ this.pythonScriptPath ] );

		this.process.stdout.on( "data", ( data ) => {
			callback( null, data );
		} );

		this.process.stderr.on( "data", ( data ) => {
			callback( data );
		} );

		this.process.on( "close", (code) => {
			callback( null, null, code );
		} );
	}

	stop () {
		if ( this.process && this.process !== null ) {
			this.process.stdin.pause();
			this.process.kill();
		}
	}
}

module.exports = ExpressionShell;