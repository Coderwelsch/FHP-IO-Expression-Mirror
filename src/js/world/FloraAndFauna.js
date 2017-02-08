/* global THREE */

// imports
import Animation from "../animation/Animation.js";
import Utils from "../utils/Utils.js";


export default class FloraAndFauna {
	constructor ( globeReference ) {
		this.globe = globeReference;
		this.globeGroup = this.globe.globeGroup;
		this.globeRadius = this.globe.globeRadius;
		this.mixers = this.globe.mixers;
		this.models = this.globe.models;
		this.textures = this.globe.textures;

		this.groupFlamingos = null;
		this.animation = new Animation();
	}

	changeGlobeMaterial ( textureObj, useBumpMap = false, bumpScale = 0.02, repeation = 5 ) {
		let clonedGlobeMesh = this.globe.globeMesh.clone(),
			texturePath = textureObj.texture || textureObj,
			newTexture,
			bumpMap,
			newMaterial;

		// set original globe to the new texture and hide it
		newTexture = new THREE.TextureLoader().load( texturePath );

		if ( repeation > 1 ) {
			newTexture.wrapS = THREE.RepeatWrapping;
			newTexture.wrapT = THREE.RepeatWrapping;
			newTexture.repeat.set( repeation, repeation );
		}

		if ( useBumpMap ) {
			bumpMap = new THREE.TextureLoader().load( this.textures.desertBump );
			bumpMap.wrapS = THREE.RepeatWrapping;
			bumpMap.wrapT = THREE.RepeatWrapping;
			bumpMap.repeat.set( repeation, repeation );
		}

		newMaterial = new THREE.MeshStandardMaterial( {
			bumpMap: bumpMap,
			bumpScale: bumpMap ? bumpScale : undefined,
			map: newTexture,
			opacity: 0,
			transparent: true,
			color: 0xf5cda2,
			roughness: 0.5,
			metalness: 0.1
		} );

		this.globe.globeMesh.material = newMaterial;
		this.globe.globeMesh.geometry.uvsNeedUpdate = true;
		this.globe.globeMesh.needUpdate = true;

		// add cloned globe and fade it out
		this.globeGroup.add( clonedGlobeMesh );
		this.animation.fadeOut( clonedGlobeMesh, () => {
			this.globeGroup.remove( clonedGlobeMesh );
		} );
		this.animation.fadeIn( this.globe.globeMesh );
	}

	changeWaterLevel ( waterLevel ) {
		Velocity( { opacity: 1 }, {
			opacity: 0
		}, {
			duration: 3000,
			progress: function(elements, complete, remaining, start, tweenValue) {
				console.log((complete * 100) + "%");
				console.log(remaining + "ms remaining!");
				console.log("The current tween value is " + tweenValue)
			}
		});
		/*this.animation.scale( waterLevel, this.globe.waterSurfaceMesh, () => {
			console.log("DONE");
		} );*/
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

	renderFlamingos () {
		if ( this.groupFlamingos ) {
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

	render () {
		this.animation.render();
		// this.renderFlamingos();
	}
}