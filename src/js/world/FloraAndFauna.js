import Utils from "../utils/Utils.js";


export default class FloraAndFauna {
	constructor ( globe ) {
		this.globe = globe;
		this.globeGroup = this.globe.globeGroup;
		this.globeRadius = this.globe.globeRadius;
		this.mixers = this.globe.mixers;
		this.models = this.globe.models;
		this.textures = this.globe.textures;

		this.groupFlamingos = null;

		this.createFauna();
		this.createFlora();
	}

	createFauna () {
		this.createBirds();
	}

	createFlora () {
		this.createTrees();
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
			flamingoMesh.scale.set( flamingoScale, flamingoScale, -flamingoScale );
			flamingoMesh.position.y = this.globeRadius * ( 1 + Utils.randomRange( flightHeightMinOffset, flightHeightMaxOffset ) );
			flamingoMesh.castShadow = true;
			flamingoMesh.name = `Flamingo [${ i }]`;

			originGroup.rotation.x = Math.PI * Math.random();
			originGroup.rotation.y = Math.PI * Math.random();
			originGroup.rotation.z = Math.PI * Math.random();
			originGroup.name = `Origin Group Flamingo [${ i }]`;
			originGroup.add( flamingoMesh );

			this.groupFlamingos[ i ] = originGroup;
			this.globeGroup.add( originGroup );

			mixer = new THREE.AnimationMixer( flamingoMesh );
			mixer.clipAction( flamingoModelObject.geometry.animations[ 0 ] ).setDuration( 1  ).play();
			this.mixers.push( mixer );
		}
	}

	createTrees () {
		let treeMesh = this.models.getModelObject( this.models.models.vegetation.trees.TreeDead ),
			treeMaterial,
			deadTreeTexture,
			deadTreeBump;

		deadTreeTexture = new THREE.TextureLoader().load( this.textures.bark );
		deadTreeBump = new THREE.TextureLoader().load( this.textures.barkBump );

		treeMaterial = new THREE.MeshPhongMaterial( {
			specular: 0xFFFFFF,
			bumpMap: deadTreeBump,
			bumpScale: 0.01,
			map: deadTreeTexture,
			shininess: 0,
			metalness: 0,
			shading: THREE.FlatShading
		} );

		Utils.setDeepMaterial( treeMesh, treeMaterial );
		treeMesh.position.y = this.globeRadius;
		this.globeGroup.add( treeMesh );
	}

	render () {
		let bird,
			oldPosition,
			newPosition,
			finalPosition;

		for ( let group of this.groupFlamingos ) {
			bird = group.children[ 0 ];

			oldPosition = group.localToWorld( new THREE.Vector3( bird.position.x, bird.position.y, bird.position.z ) );

			group.rotation.x += 0.005;
			group.rotation.y += 0.005;
			group.rotation.z += 0.005;
			group.updateMatrixWorld();

			newPosition = oldPosition.applyAxisAngle( group.localToWorld( new THREE.Vector3( bird.position.x, bird.position.y, bird.position.z ) ), 0 );
			finalPosition = group.worldToLocal( newPosition );

			bird.lookAt( finalPosition );
		}
	}
}