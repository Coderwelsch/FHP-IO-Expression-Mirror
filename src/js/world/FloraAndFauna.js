/* global THREE, Velocity */

// imports
import Utils from "../utils/Utils.js";
import CwUtils from "../vendor/com.coderwelsch.Utils.js";
import Textures from "../textures/Textures.js";


export default class FloraAndFauna {
	constructor ( globeReference ) {
		this.globe = globeReference;
		this.globeGroup = this.globe.globeGroup;
		this.globeRadius = this.globe.globeRadius;
		this.mixers = this.globe.mixers;
		this.models = this.globe.models;
		this.textures = Textures;

		this.groupFlamingos = null;
		this.groupTrees = null;
		this.groupStones = null;
		this.groupMushrooms = null;
		this.groupGrass = null;
	}

	loadModels ( models = [], callback ) {
		let meshes = new Array( models.length ),
			loadedModels = 0;

		let modelLoaded = ( mesh ) => {
			meshes[ loadedModels ] = mesh;

			if ( loadedModels === models.length - 1 ) {
				callback( meshes );
			} else {
				loadedModels++;
			}
		};

		let load = ( model ) => {
			if ( model.type === "obj" ) {
				this.models.loadObjMtlModel( model, modelLoaded );
			} else if ( model.type === "json" ) {
				modelLoaded( this.models.getModelObject( model ) );
			} else {
				throw new Error( "Couldn't found model type: %s", model.type );
			}
		};

		for ( let model of models ) {
			load( model );
		}
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

		Velocity( document.createElement( "div" ), { tween: [ 1, 0 ] }, { duration: 6000, progress: ( elements, complete ) => {
			clonedGlobeMesh.material.opacity = 1 - complete;
			this.globe.globeMesh.material.opacity = complete;
		} } ).then( () => {
			this.globeGroup.remove( clonedGlobeMesh );
		} );
	}

	changeWaterLevel ( waterLevel ) {
		let currentScale = this.globe.waterSurfaceMesh.scale.x;

		Velocity( document.createElement( "div" ), { tween: [ waterLevel, currentScale ] }, { duration: 3000, progress: ( elements, complete, remaining, start, tweenValue ) => {
			this.globe.waterSurfaceMesh.scale.set( tweenValue, tweenValue, tweenValue );
		} } );
	}

	changeTreeVegetation ( range = [ 0, 0 ], treeModelsType = "deadTrees" ) {
		let modelsType = this.models.models.vegetation.trees[ treeModelsType ],
			models = [];

		for ( let modelKey in modelsType ) {
			models.push( modelsType[ modelKey ] );
		}

		this.loadModels( models, ( loadedModels ) => {
			this.groupTrees = this.manageOccurences( this.groupTrees, range, () => {
				let index = Math.floor( Math.random() * loadedModels.length );

				return this.setupMesh( {
					scale: [ 0.5, 1 ],
					model: loadedModels[ index ],
					material: {
						color: 0xFFFFFF
					},
					customPosition: this.getRandomGlobeVector()
				} );
			}, this.fadeOutObject, ( indexRemovedFrom, indexRemovedTo ) => {
				let itemsToRemove = this.groupTrees.splice( indexRemovedFrom, indexRemovedTo );

				for ( let elem of itemsToRemove ) {
					this.globeGroup.remove( elem );
				}
			} );
		} );
	}

	changeMushroomsVegetation ( range = [ 0, 0 ] ) {
		this.loadModels( [ this.models.models.vegetation.mushrooms.Mushroom1 ], ( models ) => {
			let model = models[ 0 ];

			this.groupMushrooms = this.manageOccurences( this.groupMushrooms, range, () => {
				return this.setupMesh( {
					scale: [ 0.007, 0.02 ],
					model: model,
					customPosition: this.getRandomGlobeVector()
				} );
			}, this.fadeOutObject, ( indexRemovedFrom, indexRemovedTo ) => {
				let itemsToRemove = this.groupTrees.splice( indexRemovedFrom, indexRemovedTo );

				for ( let elem of itemsToRemove ) {
					this.globeGroup.remove( elem );
				}
			} );
		} );
	}

	changeStones ( range = [ 0, 0 ] ) {
		let stones = this.models.models.stones,
			i = 0,
			models = new Array( Object.keys( stones ).length );

		for ( let key in this.models.models.stones ) {
			models[ i ]= stones[ key ];
			i++;
		}

		this.loadModels( models, ( loadedModels ) => {
			this.groupStones = this.manageOccurences( this.groupStones, range, () => {
				let index = Math.floor( Math.random() * loadedModels.length );

				return this.setupMesh( {
					scale: [ 0.01, 0.05 ],
					model: loadedModels[ index ],
					customPosition: this.getRandomGlobeVector()
				} );
			}, this.fadeOutObject, ( indexRemovedFrom, indexRemovedTo ) => {
				let itemsToRemove = this.groupStones.splice( indexRemovedFrom, indexRemovedTo );

				for ( let elem of itemsToRemove ) {
					this.globeGroup.remove( elem );
				}
			} );
		} );
	}

	changeGrassVegetation ( range = [ 0, 0 ], modelType = "deadGrass" ) {
		let models = this.models.models.vegetation.grass[ modelType ],
			mesh,
			modelKeys = Object.keys( models ),
			randomModelKey;

		this.groupGrass = this.manageOccurences( this.groupGrass, range, () => {
			randomModelKey = modelKeys[ Math.floor( Math.random() * modelKeys.length ) ];

			mesh = this.setupMesh( {
				scale: [ 0.05, 0.15 ],
				model: models[ randomModelKey ],
				mergeWithDefaultMaterial: false,
				material: {
					color: 0x519423
				},
				customPosition: this.getRandomGlobeVector()
			} );

			return mesh;
		}, this.fadeOutObject, ( indexRemovedFrom, indexRemovedTo ) => {
			let itemsToRemove = this.groupGrass.splice( indexRemovedFrom, indexRemovedTo );

			for ( let elem of itemsToRemove ) {
				this.globeGroup.remove( elem );
			}
		} );
	}

	changeFlamingoFauna ( range = [ 0, 0 ] ) {
		this.groupFlamingos = this.manageOccurences( this.groupFlamingos, range, () => {
			return this.setupMesh( {
				scale: [ 0.01, 0.05 ],
				model: this.models.models.birds.Flamingo,
				material: {
					color: 0xffffff,
					specular: 0xffffff,
					shininess: 20,
					morphTargets: true,
					vertexColors: THREE.FaceColors
				},
				yOffset: 17,
				isAnimation: true,
				customScaleMultiplier: {
					x: 1,
					y: 1,
					z: -1
				}
			} );
		}, this.fadeOutObject, ( indexRemovedFrom, indexRemovedTo ) => {
			let itemsToRemove = this.groupFlamingos.splice( indexRemovedFrom, indexRemovedTo );

			for ( let i = 0; i < itemsToRemove.length; i++ ) {
				this.fadeOutObject( itemsToRemove[ i ], i === itemsToRemove.length - 1, () => {
					for ( let elem of itemsToRemove ) {
						this.globeGroup.remove( elem );
					}

					this.groupFlamingos.splice( this.groupFlamingos.length - 1, this.groupFlamingos.length );
					this.mixers.splice( this.mixers.length - 1, this.mixers.length );
				} );
			}
		} );
	}

	changeSwimmingDucks () {
		// let model = this.globe.models.loadObjMtlModel( this.globe.models.models.vegetation.trees.deadTrees.DeadTree2, ( mesh ) => {
		// 	mesh.scale.set( 0.01, 0.01, 0.01 );
		// 	mesh.position.y = 55;

		// 	this.globeGroup.add( mesh );
		// } );
	}

	getRandomGlobeVector () {
		let vector,
			vertices = this.globe.globeMesh.geometry.vertices,
			waterHoles = this.globe.waterHoles.holes,
			isHoleVector = true,
			holeVectorFound;

		while ( isHoleVector ) {
			holeVectorFound = false;
			vector = vertices[ Math.floor( Math.random() * vertices.length ) ];

			for ( let hole of waterHoles ) {
				for ( let holeVector of hole ) {
					if ( holeVector === vector ) {
						holeVectorFound = true;
						break;
					}
				}

				if ( holeVectorFound ) {
					isHoleVector = true;
					break;
				}
			}

			isHoleVector = holeVectorFound;
		}

		return vector;
	}

	fadeOutObject ( elem, isLastElem, callback ) {
		let children = Utils.getChildren( elem ),
			scaling = elem.scale.x;

		Velocity( ( document.createElement( "div" ) ), { tween: [ 0, scaling ] }, { duration: 3000, delay: Math.random() * 6000, progress: ( elements, complete, remaining, start, tweenValue ) => {
			elem.scale.set( tweenValue, tweenValue, tweenValue );

			for ( let child of children ) {
				child.needUpdate = true;
				child.material.opacity = 1 - complete;
			}
		} } ).then( () => {
			if ( isLastElem ) {
				callback();
			}
		} );
	}

	manageOccurences ( group, range, addFunction, rmFunction, rmDoneCallback ) {
		let count = Math.round( Utils.randomRange( range[ 0 ], range[ 1 ] ) );

		if ( group === null ) {
			group = [];
		}

		if ( group.length < count ) { // add
			let elementsToAdd = count - group.length;

			for ( let i = 0; i < elementsToAdd; i++ ) {
				group.push( addFunction() );
			}
		} else if ( group.length > count ) { // remove
			let sliceCount = count < 1 ? 0 : count - 1,
				elementsToRemove = group.slice( sliceCount, group.length );


			for ( let i = 0; i < elementsToRemove.length; i++ ) {
				rmFunction( elementsToRemove[ i ], i === elementsToRemove.length - 1, () => {
					rmDoneCallback( sliceCount, group.length );
				} );
			}
		}

		return group;
	}

	setupMesh ( settings ) {
		let model,
			mesh,
			originGroup,
			material,
			scale,
			children,
			defaultMaterial = {},
			meshToReturn;

		// merge settings
		settings = CwUtils.extend( true, {
			scale: [ 0.1, 1 ],
			model: undefined,
			mergeWithDefaultMaterial: true,
			material: {
				transparent: true,
				shading: THREE.FlatShading
			},
			yOffset: -0.07,
			customPosition: undefined,
			isAnimation: false,
			scaleMultiplier: {
				x: 1,
				y: 1,
				z: 1
			}
		}, settings );

		scale = Utils.randomRange( settings.scale[ 0 ], settings.scale[ 1 ] );

		if ( settings.model.uuid ) {
			mesh = settings.model.clone();
			model = settings.model.clone();
		} else {
			model = settings.isAnimation ? this.models.getModelJson( settings.model ) : undefined;
			mesh = settings.isAnimation ? model : this.models.getModelObject( settings.model );
		}

		meshToReturn = mesh;

		if ( mesh && mesh.scale ) {
			scale = ( mesh.scale.x || 1 ) * scale;
		}

		// extend default material
		children = Utils.getChildren( mesh );

		if ( children && children.length ) {
			defaultMaterial = children[ 0 ].material;
		}

		if ( settings.mergeWithDefaultMaterial ) {
			settings.material = CwUtils.extend( true, defaultMaterial, settings.material );
		}

		material = new THREE.MeshPhongMaterial( settings.material );

		// reset mesh to mesh's geometry to animation json data
		if ( settings.isAnimation ) {
			mesh = new THREE.Mesh( mesh.geometry, settings.material );

			originGroup = new THREE.Object3D();

			originGroup.rotation.x = Math.PI * Math.random();
			originGroup.rotation.y = Math.PI * Math.random();
			originGroup.rotation.z = Math.PI * Math.random();

			originGroup.add( mesh );
			originGroup.updateMatrixWorld();

			this.globeGroup.add( originGroup );
		} else {
			this.globeGroup.add( mesh );
		}

		mesh.scale.set( 0, 0, 0 );
		mesh.castShadow = true;

		Utils.setDeepMaterial( mesh, material );

		// reset mesh to the nearest globe vector point
		let globeVertices = this.globe.globeMesh.geometry.vertices,
			randomGlobeVertex = settings.customPosition || globeVertices[ Math.floor( Math.random() * globeVertices.length ) ];

		if ( !settings.isAnimation ) {
			mesh.position.set( randomGlobeVertex.x, randomGlobeVertex.y, randomGlobeVertex.z );

			// look at point
			mesh.lookAt( Utils.moveVerticeAlongVector( new THREE.Vector3( 0, 0, 0 ), randomGlobeVertex, 1.5 ) );

			// rotate x axis to lookat point
			mesh.rotateX( Math.PI / 2 );

			// add some random rotation
			mesh.rotateX( THREE.Math.degToRad( 15 ) * Math.random() );
			mesh.rotateY( THREE.Math.degToRad( 90 ) * Math.random() );
			mesh.rotateZ( THREE.Math.degToRad( 15 ) * Math.random() );
		} else {
			// set height position of mesh in origin group
			mesh.position.y = this.globeRadius + settings.yOffset;

			// add animation to mixer
			let mixer = new THREE.AnimationMixer( mesh );

			mixer.clipAction( model.geometry.animations[ 0 ] ).setDuration( 1 ).play();
			this.mixers.push( mixer );

			// set returned mesh
			meshToReturn = originGroup;
		}


		// fade-in/out animation
		Velocity( ( document.createElement( "div" ) ), { tween: [ scale, 0 ] }, { duration: 3000, delay: Number.parseInt( 2000 + Math.random() * 5000, 10 ), progress: ( elements, complete, remaining, start, tweenValue ) => {
			if ( settings.customScaleMultiplier ) {
				mesh.scale.set( tweenValue * settings.customScaleMultiplier.x, tweenValue * settings.customScaleMultiplier.y, tweenValue * settings.customScaleMultiplier.z );
			} else {
				mesh.scale.set( tweenValue, tweenValue, tweenValue );
			}
		} } );

		return meshToReturn;
	}

	updateFlamingosPosition () {
		if ( this.groupFlamingos ) {
			let bird,
				oldPosition,
				newPosition,
				finalPosition;

			for ( let group of this.groupFlamingos ) {
				// flamingos are wrapped with an 'origin' 3d object
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
		this.updateFlamingosPosition();
	}
}
