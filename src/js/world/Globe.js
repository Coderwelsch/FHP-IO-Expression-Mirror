// imports
import Utils from "../utils/Utils.js";


export default class Globe {
	constructor ( scene, models ) {
		this.textures = {
			fertile: "./files/textures/ground-texture.jpg",
			desert: "./files/textures/desert-texture.jpg",
			desertBump: "./files/textures/desert-texture-bump.jpg",
			sand: "./files/textures/sand-texture.jpg"
		};

		this.globeGroup = new THREE.Object3D();
		this.globeGroup.name = "Globe Group";

		this.globeRadius = 5;
		this.globePolygons = 64;
		this.globePolygonTransformMultiplier = 0.1;

		this.scene = scene;
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
			metalness: 0.1 //,
			// shading: THREE.FlatShading
		} );

		// final mesh
		this.globeMesh = new THREE.Mesh( this.globeGeometry, this.globeMaterial );
		this.globeMesh.name = "Globe";
		this.globeMesh.castShadow = true;
		this.globeMesh.receiveShadow = true;

		this.globeGroup.add( this.globeMesh );

		// add globe group to scene
		this.scene.add( this.globeGroup );

		// transform globe
		this.transformGlobe();
	}

	createWaterSurface () {
		this.waterSurfaceGeometry = new THREE.SphereGeometry( this.globeRadius - 0.15, this.globePolygons, this.globePolygons );

		this.waterSurfaceMaterial = new THREE.MeshStandardMaterial( {
			color: 0x68c3c0,
			transparent: true,
			roughness: 0.3,
			opacity: 0.8
		} );

		this.waterSurfaceMesh = new THREE.Mesh( this.waterSurfaceGeometry, this.waterSurfaceMaterial );
		this.waterSurfaceMesh.name = "Globe Water Surface";
		this.globeGroup.add( this.waterSurfaceMesh );
	}

	transformGlobe () {
		this.destroySurface();
		this.addHoles();

		this.globeMesh.geometry.verticesNeedUpdate = true;
	}

	createVegetation () {
		for ( let i = 0; i < 1000; i++ ) {
			console.log( this.models.models.birds.Flamingo );

			let simpleTree = this.models.getModel( this.models.models.birds.Flamingo ),
				originGroup = new THREE.Object3D();

			simpleTree.position.y = this.globeRadius + 0.5;
			simpleTree.scale.set( 0.2, 0.2, 0.2 );
			simpleTree.castShadow = true;
			simpleTree.receiveShadow = true;

			originGroup.rotation.x = Math.PI * Math.random();
			originGroup.rotation.y = Math.PI * Math.random();
			originGroup.rotation.z = Math.PI * Math.random();
			originGroup.add( simpleTree );

			this.globeGroup.add( originGroup );
		}
	}

	addHoles () {
		let globeVertices = this.globeMesh.geometry.vertices,
			nearVeticesIndexes,
			verticeIndex = 0,
			numberOfHoles = Math.round( Utils.randomRange( 3, 6 ) );

		for ( let i = 0; i < numberOfHoles; i++ ) {
			let randomVertexPoint = globeVertices[ Number.parseInt( Math.random() * globeVertices.length ) ];

			nearVeticesIndexes = this.findIndexesOfNearVertices( globeVertices, randomVertexPoint );
			for ( let k = 0; k < nearVeticesIndexes.length; k++ ) {
				verticeIndex = nearVeticesIndexes[ k ];
				globeVertices[ verticeIndex ] = this.moveVerticeAlongVector( globeVertices[ verticeIndex ], new THREE.Vector3( 0, 0, 0 ) );
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

	moveVerticeAlongVector ( pointVector, originVector, alpha = 0.075 ) {
		return pointVector.lerp( originVector, alpha );
	}

	findIndexesOfNearVertices ( vertices = [], pointVector, distThreshold = 1 ) {
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
	}
}