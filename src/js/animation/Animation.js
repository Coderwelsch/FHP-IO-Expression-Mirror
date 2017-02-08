export default class Animation {
	constructor () {
		this.animations = [];
	}

	fadeOut ( mesh, callback ) {
		this.generateAnimation( mesh, callback, function () {
			if ( this.mesh.material.opacity > 0 ) {
				this.mesh.material.opacity -= 0.01;
			}

			if ( this.mesh.material.opacity <= 0 ) {
				this.isFinished = true;

				if ( typeof this.callback === "function" ) {
					this.callback();
				}
			}
		} );
	}

	scale ( value, mesh, callback ) {
		let increment = 0.001;

		this.generateAnimation( mesh, callback, function () {
			let scale = this.mesh.scale;

			scale.x = scale.x.toFixed( 2 );
			scale.y = scale.y.toFixed( 2 );
			scale.z = scale.z.toFixed( 2 );

			if ( !this.steep ) {
				if ( value > scale.x ) {
					this.steep = -increment;
				} else {
					this.steep = increment;
				}
			}

			if ( scale.x < value ) {
				this.mesh.scale.set( scale.x + this.steep, scale.y + this.steep, scale.z + this.steep );

			} else if ( scale.x > value ) {
				this.mesh.scale.set( scale.x - this.steep, scale.y - this.steep, scale.z - this.steep );
			} else {
				this.isFinished = true;
			}
		} );
	}

	fadeIn ( mesh, callback ) {
		this.generateAnimation( mesh, callback, function () {
			if ( this.mesh.material.opacity < 1 ) {
				this.mesh.material.opacity += 0.01;
			}

			if ( this.mesh.material.opacity >= 1 ) {
				this.mesh.material.opacity = 1;
				this.isFinished = true;

				if ( typeof this.callback === "function" ) {
					this.callback();
				}
			}
		} );
	}

	generateAnimation ( mesh, callback, render ) {
		this.animations.push( {
			mesh,
			callback,
			render
		} );
	}

	render () {
		for ( let animation of this.animations ) {
			if ( animation.isFinished ) {
				this.animations.splice( this.animations.indexOf( animation ), 1 );
			} else {
				animation.render();
			}
		}
	}
}