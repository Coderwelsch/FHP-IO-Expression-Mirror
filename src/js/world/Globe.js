// imports
import Utils from "../utils/Utils.js";
import Vegetation from "./FloraAndFauna.js";


export default class Globe {
	constructor ( scene, models, globeRadius = 50, mood = 0 ) {
		this.textures = {
			fertile: "./files/textures/ground-texture.jpg",
			desert: "./files/textures/desert-texture.jpg",
			desertBump: "./files/textures/desert-texture-bump.jpg",
			sand: "./files/textures/sand-texture.jpg"
		};

		this.globeGroup = new THREE.Object3D();
		this.globeGroup.name = "Globe Group";

		this.mood = mood;

		this.floraAndFauna = null;

		this.globeRadius = globeRadius;
		this.globePolygons = 64;
		this.globePolygonTransformMultiplier = 1.5;

		this.clock = new THREE.Clock();
		this.scene = scene;
		this.mixers = [];
		this.models = models;

		this.init();
	}

	init () {
		this.createGlobe();
		this.createWaterSurface();
		this.createVegetation();
	}

	createGlobe () {
		this.globeGeometry = new THREE.SphereGeometry( this.globeRadius, this.globePolygons, this.globePolygons );
		this.globeGeometry.mergeVertices();

		// globe main texture
		this.globeTexture = new THREE.TextureLoader().load( this.textures.desert );
		this.globeTexture.wrapS = THREE.RepeatWrapping;
		this.globeTexture.wrapT = THREE.RepeatWrapping;
		this.globeTexture.repeat.set( 5, 5 );

		// bump map
		this.globeBumpMap = new THREE.TextureLoader().load( this.textures.desertBump );
		this.globeBumpMap.wrapS = THREE.RepeatWrapping;
		this.globeBumpMap.wrapT = THREE.RepeatWrapping;
		this.globeBumpMap.repeat.set( 5, 5 );

		// globe material
		this.globeMaterial = new THREE.MeshStandardMaterial( {
			bumpMap: this.globeBumpMap,
			bumpScale: 0.02,
			map: this.globeTexture,
			color: 0xf5cda2,
			roughness: 0.5,
			metalness: 0.1
		} );

		// final mesh
		this.globeMesh = new THREE.Mesh( this.globeGeometry, this.globeMaterial );
		this.globeMesh.name = "Globe";
		this.globeMesh.receiveShadow = true;

		this.globeGroup.add( this.globeMesh );

		// add globe group to scene
		this.scene.add( this.globeGroup );

		// transform globe
		this.transformGlobe();
	}

	createWaterSurface () {
		this.waterSurfaceGeometry = new THREE.SphereGeometry( this.globeRadius - 2.1, this.globePolygons, this.globePolygons );

		this.waterSurfaceMaterial = new THREE.MeshStandardMaterial( {
			color: 0x68c3c0,
			transparent: true,
			roughness: 0.3,
			opacity: 0.8
		} );

		this.waterSurfaceMesh = new THREE.Mesh( this.waterSurfaceGeometry, this.waterSurfaceMaterial );
		// this.waterSurfaceMesh.castShadow = true;
		// this.waterSurfaceMesh.receiveShadow = true;
		this.waterSurfaceMesh.name = "Globe Water Surface";
		this.globeGroup.add( this.waterSurfaceMesh );
	}

	transformGlobe () {
		this.destroySurface();
		this.addHoles();

		this.globeMesh.geometry.verticesNeedUpdate = true;
	}

	createVegetation () {
		this.floraAndFauna = new Vegetation( this );
	}

	addHoles () {
		let globeVertices = this.globeMesh.geometry.vertices,
			nearVeticesIndexes,
			verticeIndex = 0,
			numberOfHoles = Math.round( Utils.randomRange( 3, 6 ) );

		for ( let i = 0; i < numberOfHoles; i++ ) {
			let randomVertexPoint = globeVertices[ Number.parseInt( Math.random() * globeVertices.length, 10 ) ];

			nearVeticesIndexes = Globe.findIndexesOfNearVertices( globeVertices, randomVertexPoint );
			for ( let k = 0; k < nearVeticesIndexes.length; k++ ) {
				verticeIndex = nearVeticesIndexes[ k ];
				globeVertices[ verticeIndex ] = Globe.moveVerticeAlongVector( globeVertices[ verticeIndex ], new THREE.Vector3( 0, 0, 0 ) );
			}
		}
	}

	destroySurface () {
		let globeVertices = this.globeMesh.geometry.vertices;

		for ( let i = 0; i < globeVertices.length; i++ ) {
			globeVertices[ i ].x += Math.random() * this.globePolygonTransformMultiplier;
			globeVertices[ i ].y += Math.random() * this.globePolygonTransformMultiplier;
			globeVertices[ i ].z += Math.random() * this.globePolygonTransformMultiplier;
		}
	}

	static moveVerticeAlongVector ( pointVector, originVector, alpha = 0.075 ) {
		return pointVector.lerp( originVector, alpha );
	}

	static findIndexesOfNearVertices ( vertices = [], pointVector, distThreshold = 10 ) {
		let foundVertices = [];

		for ( let i = 0; i < vertices.length; i++ ) {
			if ( pointVector.distanceTo( vertices[ i ] ) < distThreshold ) {
				foundVertices.push( i );
			}
		}

		return foundVertices;
	}

	render () {
		this.globeGroup.rotation.x += 0.001;
		this.globeGroup.rotation.y += 0.001;
		this.globeGroup.rotation.z += 0.001;

		let delta = this.clock.getDelta();
		for ( let i = 0; i < this.mixers.length; i ++ ) {
			this.mixers[ i ].update( delta );
		}

		this.floraAndFauna.render();
	}
}