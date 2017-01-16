import Utils from "../utils/Utils.js";


export default class FloraAndFauna {
	constructor ( globe ) {
		this.globe = globe;
		this.globeGroup = this.globe.globeGroup;
		this.globeRadius = this.globe.globeRadius;
		this.mixers = this.globe.mixers;
		this.models = this.globe.models;

		this.groupFlamingos = null;

		this.createFauna();
	}

	createFauna () {
		this.createBirds();
	}

	createBirds () {
		this.createFlamingos();
	}

	createFlamingos () {
		let countFlamingos = 20;

		this.groupFlamingos = new Array( countFlamingos );
		for ( let i = 0; i < countFlamingos; i++ ) {
			let flamingoModelObject = this.models.getModelJson( this.models.models.birds.Flamingo ),
				flamingoMinScaling = 0.03,
				flamingoMaxScaling = 0.05,
				flamingoScale = Utils.randomRange( flamingoMinScaling, flamingoMaxScaling ),
				flightHeightMinOffset = 0.15,
				flightHeightMaxOffset = 0.25,
				flamingoMaterial,
				flamingoMesh,
				mixer,
				randomPlayDelay = 1,
				originGroup = new THREE.Object3D();

			flamingoMaterial = new THREE.MeshPhongMaterial( {
				color: 0xffffff,
				specular: 0xffffff,
				shininess: 20,
				morphTargets: true,
				vertexColors: THREE.FaceColors,
				shading: THREE.FlatShading
			} );

			flamingoMesh = new THREE.Mesh( flamingoModelObject.geometry, flamingoMaterial );
			flamingoMesh.scale.set( flamingoScale, flamingoScale, flamingoScale );
			flamingoMesh.position.y = this.globeRadius * ( 1 + Utils.randomRange( flightHeightMinOffset, flightHeightMaxOffset ) );
			flamingoMesh.rotation.y = -1;
			flamingoMesh.castShadow = true;
			// flamingoMesh.receiveShadow = true;
			flamingoMesh.name = `Flamingo [${ i }]`;

			originGroup.rotation.x = Math.PI * Math.random();
			originGroup.rotation.y = Math.PI * Math.random();
			originGroup.rotation.z = Math.PI * Math.random();
			originGroup.name = `Origin Group Flamingo [${ i }]`;
			originGroup.add( flamingoMesh );
			this.groupFlamingos[ i ] = originGroup;
			this.globeGroup.add( originGroup );

			mixer = new THREE.AnimationMixer( flamingoMesh );
			mixer.clipAction( flamingoModelObject.geometry.animations[ 0 ] ).setDuration( randomPlayDelay ).play();
			this.mixers.push( mixer );
		}
	}

	render () {
		let bird,
			oldPosition,
			newPosition;

		for ( let group of this.groupFlamingos ) {
			bird = group.children[ 0 ];

			oldPosition = group.localToWorld( new THREE.Vector3( bird.position.x, bird.position.y, bird.position.z ) );

			group.rotation.x += 0.005;
			group.rotation.y += 0.005;
			group.rotation.z += 0.005;

			// bird.rotation.y = group.rotation.y;

			// newPosition = group.localToWorld( new THREE.Vector3( bird.position.x, bird.position.y, bird.position.z ) );
			// bird.lookAt( group.worldToLocal( newPosition ) );
			// group.updateMatrixWorld();

			// console.log( bird.name, newPosition.x - oldPosition.x, newPosition.y - oldPosition.y, newPosition.z - oldPosition.z );
			// console.log( oldPosition );

			// break;
		}
	}
}