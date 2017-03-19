/* global THREE, Velocity */

// imports
import Utils from "../utils/Utils.js";
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
		this.groupGrass = null;
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

		Velocity( document.createElement( "div" ), { tween: [ 1, 0 ] }, { duration: 3000, progress: ( elements, complete, remaining ) => {
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

	changeTreeVegetation ( range = [ 10, 15 ], treeModelsType = "deadTrees" ) {
		let newNumberOfTrees = Math.round( Utils.randomRange( range[ 0 ], range[ 1 ] ) ),
			models = this.models.models.vegetation.trees[ treeModelsType ],
			modelKeys = Object.keys( models );

		let addTree = ( treeMesh ) => {
			let children,
				treeMaterial,
				deadTreeTexture,
				deadTreeBump,
				treeScale = Utils.randomRange( 0.5, 1.3 ),
				originGroup = new THREE.Object3D();

			deadTreeTexture = new THREE.TextureLoader().load( this.textures.tree.bark.texture );
			deadTreeBump = new THREE.TextureLoader().load( this.textures.tree.bark.bump );

			treeMaterial = new THREE.MeshPhongMaterial( {
				specular: 0xFFFFFF,
				bumpMap: deadTreeBump,
				bumpScale: 0.01,
				map: deadTreeTexture,
				shininess: 0,
				metalness: 0,
				opacity: 0,
				transparent: true,
				shading: THREE.FlatShading
			} );

			treeMesh.scale.set( 0, 0, 0 );
			treeMesh.castShadow = true;
			treeMesh.name = `${treeModelsType} [${ this.groupTrees.length }]`;

			originGroup.add( treeMesh );

			Utils.setDeepMaterial( treeMesh, treeMaterial );

			treeMesh.position.y = this.globeRadius - 0.03;

			originGroup.rotation.x = Math.PI * Math.random();
			originGroup.rotation.y = Math.PI * Math.random();
			originGroup.rotation.z = Math.PI * Math.random();
			this.globeGroup.add( originGroup );

			children = Utils.getChildren( treeMesh );
			Velocity( ( document.createElement( "div" ) ), { tween: [ treeScale, 0 ] }, { duration: 3000, delay: Number.parseInt( Math.random() * 2000, 10 ), progress: ( elements, complete, remaining, start, tweenValue ) => {
				treeMesh.scale.set( tweenValue, tweenValue, tweenValue );

				for ( let child of children ) {
					child.needUpdate = true;
					child.material.opacity = complete;
				}
			} } );

			return originGroup;
		};

		if ( this.groupTrees !== null ) {
			if ( this.groupTrees.length < range[ 0 ] ) {
				let randomModelKey,
					parsedModel;

				for ( let i = 0; i < range[ 0 ] - this.groupTrees.length - 1; i++ ) {
					randomModelKey = modelKeys[ Math.floor( Math.random() * modelKeys.length ) ];
					parsedModel = this.models.getModelObject( models[ randomModelKey ] );

					this.groupTrees.push( addTree( parsedModel ) );
				}
			} else if ( this.groupTrees.length > range[ 1 ] ) {
				let removedItems = this.groupTrees.splice( range[ 1 ], this.groupTrees.length );

				for ( let originGroup of removedItems ) {
					let tree = originGroup.children[ 0 ],
						children = Utils.getChildren( tree ),
						scaling = tree.scale.x;

					Velocity( ( document.createElement( "div" ) ), { tween: [ 0, scaling ] }, { duration: 3000, progress: ( elements, complete, remaining, start, tweenValue ) => {
						tree.scale.set( tweenValue, tweenValue, tweenValue );

						for ( let child of children ) {
							child.needUpdate = true;
							child.material.opacity = 1 - complete;
						}
					} } ).then( () => {
						this.globeGroup.remove( tree );
					} );
				}
			}
		} else {
			this.groupTrees = [];

			let randomModelKey,
				parsedModel;

			for ( let i = 0; i < newNumberOfTrees; i++ ) {
				randomModelKey = modelKeys[ Math.floor( Math.random() * modelKeys.length ) ];
				parsedModel = this.models.getModelObject( models[ randomModelKey ] );

				this.groupTrees.push( addTree( parsedModel ) );
			}
		}
	}

	changeGrassVegetation ( range = [ 10, 15 ], modelType = "fertile" ) {
		this.groupGrass = this.manageOccurences( this.groupGrass, range, ( group ) => {
			let treeMesh = this.models.getModelObject( this.models.models.vegetation.grass.fertileGrass.GrassPlant1 ),
				treeMaterial,
				treeScale = Utils.randomRange( 0.1, 0.3 ),
				originGroup = new THREE.Object3D();

			treeMaterial = new THREE.MeshPhongMaterial( {
				color: 0x4BB548,
				bumpScale: 0.01,
				shininess: 0,
				metalness: 0,
				opacity: 0,
				transparent: true,
				shading: THREE.FlatShading
			} );

			treeMesh.scale.set( 0, 0, 0 );
			treeMesh.castShadow = true;
			treeMesh.name = `${modelType} [${ group.length }]`;

			originGroup.add( treeMesh );

			Utils.setDeepMaterial( treeMesh, treeMaterial );

			treeMesh.position.y = this.globeRadius - 0.06;

			originGroup.rotation.x = Math.PI * Math.random();
			originGroup.rotation.y = Math.PI * Math.random();
			originGroup.rotation.z = Math.PI * Math.random();
			this.globeGroup.add( originGroup );

			window.setTimeout( ( mesh, scale ) => {
				let children = Utils.getChildren( mesh );

				Velocity( ( document.createElement( "div" ) ), { tween: [ scale, 0 ] }, { duration: 3000, delay: Number.parseInt( 2000 + Math.random() * 5000, 10 ), progress: ( elements, complete, remaining, start, tweenValue ) => {
					mesh.scale.set( tweenValue, tweenValue, tweenValue );

					for ( let child of children ) {
						child.needUpdate = true;
						child.material.opacity = complete;
					}
				} } );
			}, Math.random() * 6000, treeMesh, treeScale );

			return originGroup;
		}, ( elem ) => {
			this.globeGroup.remove( elem );
		} );
	}

	manageOccurences ( group, range, addFunction, rmFunction ) {
		let count = Math.round( Utils.randomRange( range[ 0 ], range[ 1 ] ) );
		
		if ( group === null ) {
			group = [];
		}

		if ( group.length < count ) { // add
			let elementsToAdd = count - group.length;
			
			for ( let i = 0; i < elementsToAdd; i++ ) {
				group.push( addFunction( group ) );
			}
		} else if ( group.length > count ) { // remove
			let sliceCount = count < 1 ? 0 : count - 1,
				elementsToRemove = group.slice( sliceCount, group.length );


			for ( let elem of elementsToRemove ) {
				rmFunction( elem, sliceCount, group.length );
			}

			group.splice( sliceCount, group.length );
		}

		return group;
	}

	setupMesh ( scaleRange = [ 0.1, 1 ], modelObject, materialOptions, yGlobeOffset = -0.07 ) {
		let mesh = this.models.getModelObject( modelObject ),
			originGroup = new THREE.Object3D(),
			material,
			scale = Utils.randomRange( scaleRange[ 0 ], scaleRange[ 1 ] ),
			children;

		// extend default material
		materialOptions = Utils.extend( true, {
			color: 0xFFFFFF,
			bumpScale: 0.01,
			shininess: 0,
			metalness: 0,
			opacity: 0,
			transparent: true,
			shading: THREE.FlatShading
		}, materialOptions );

		material = new THREE.MeshPhongMaterial( materialOptions );

		mesh.scale.set( 0, 0, 0 );
		mesh.castShadow = true;
		mesh.position.y = this.globeRadius + yGlobeOffset;

		originGroup.add( mesh );

		Utils.setDeepMaterial( mesh, material );

		originGroup.rotation.x = Math.PI * Math.random();
		originGroup.rotation.y = Math.PI * Math.random();
		originGroup.rotation.z = Math.PI * Math.random();
		this.globeGroup.add( originGroup );

		children = Utils.getChildren( mesh );
		Velocity( ( document.createElement( "div" ) ), { tween: [ scale, 0 ] }, { duration: 3000, delay: Number.parseInt( 2000 + Math.random() * 5000, 10 ), progress: ( elements, complete, remaining, start, tweenValue ) => {
			mesh.scale.set( tweenValue, tweenValue, tweenValue );

			for ( let child of children ) {
				child.needUpdate = true;
				child.material.opacity = complete;
			}
		} } );

		return mesh;
	}

	createFlamingos ( countFlamingos ) {
		let removeFlamingos = ( flamingos ) => {
			for ( let flamingo of flamingos ) {
				this.globeGroup.remove( flamingo );
			}
		};

		let addFlamingo = () => {
			let flamingoModelObject = this.models.getModelJson( this.models.models.birds.Flamingo ),
				flamingoMinScaling = 0.01,
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
				opacity: 0,
				transparent: true,
				morphTargets: true,
				vertexColors: THREE.FaceColors,
				shading: THREE.FlatShading
			} );

			flamingoMesh = new THREE.Mesh( flamingoModelObject.geometry, flamingoMaterial );
			flamingoMesh.scale.set( flamingoScale, flamingoScale, -flamingoScale );
			flamingoMesh.position.y = this.globeRadius * ( 1 + Utils.randomRange( flightHeightMinOffset, flightHeightMaxOffset ) );
			flamingoMesh.castShadow = true;
			flamingoMesh.name = `Flamingo [${ this.groupFlamingos.length }]`;

			originGroup.rotation.x = Math.PI * Math.random();
			originGroup.rotation.y = Math.PI * Math.random();
			originGroup.rotation.z = Math.PI * Math.random();
			originGroup.name = `Origin Group Flamingo [${ this.groupFlamingos.length }]`;
			originGroup.add( flamingoMesh );

			this.groupFlamingos.push( originGroup );
			this.globeGroup.add( originGroup );

			mixer = new THREE.AnimationMixer( flamingoMesh );
			mixer.clipAction( flamingoModelObject.geometry.animations[ 0 ] ).setDuration( 1 ).play();
			this.mixers.push( mixer );

			Velocity( ( document.createElement( "div" ) ), { tween: [ 1, 0 ] }, { duration: 3000, delay: Number.parseInt( Math.random() * 2000, 10 ), progress: ( elements, complete ) => {
				flamingoMesh.needUpdate = true;
				flamingoMesh.material.opacity = complete;
			} } );
		};

		if ( this.groupFlamingos ) {
			if ( this.groupFlamingos.length > countFlamingos ) {
				// remove flamingos
				let oldFlamingosLength = this.groupFlamingos.length,
					flamingosToRemove = this.groupFlamingos.slice( countFlamingos, oldFlamingosLength ),
					countRemovedFlamingos = 0;

				for ( let flamingo of flamingosToRemove ) {
					Velocity( ( document.createElement( "div" ) ), { tween: [ 1, 0 ] }, { duration: 3000, progress: ( elements, complete ) => {
						flamingo.children[ 0 ].needUpdate = true;
						flamingo.children[ 0 ].material.opacity = 1 - complete;
					} } ).then( () => {
						countRemovedFlamingos++;

						if ( countRemovedFlamingos === flamingosToRemove.length ) {
							removeFlamingos( flamingosToRemove );
							this.groupFlamingos.splice( countFlamingos, oldFlamingosLength );
							this.mixers.splice( countFlamingos, oldFlamingosLength );
						}
					} );
				}
			} else if ( this.groupFlamingos.length < countFlamingos ) {
				// add flamingos
				for ( let i = this.groupFlamingos.length - 1; i < countFlamingos - 1; i++ ) {
					addFlamingo();
				}
			}
		} else {
			this.groupFlamingos = [];

			for ( let i = 0; i < countFlamingos - 1; i++ ) {
				addFlamingo();
			}
		}
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
		this.renderFlamingos();
	}
}
