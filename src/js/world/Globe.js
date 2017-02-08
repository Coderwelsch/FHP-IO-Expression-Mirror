/* global THREE */

// imports
import Utils from "../utils/Utils.js";


export default class Globe {
	constructor ( scene, models, globeRadius = 50 ) {
		this.globeGroup = new THREE.Object3D();
		this.globeGroup.name = "Globe Group";

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
	}

	createGlobe () {
		this.globeGeometry = new THREE.SphereGeometry( this.globeRadius, this.globePolygons, this.globePolygons );
		this.globeGeometry.mergeVertices();

		// initial globe material
		this.globeMaterial = new THREE.MeshStandardMaterial( {
			color: 0xf5cda2,
			transparent: true,
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
		this.waterSurfaceMesh.name = "Globe Water Surface";
		this.globeGroup.add( this.waterSurfaceMesh );
	}

	transformGlobe () {
		this.destroySurface();
		this.addHoles();

		this.globeMesh.geometry.verticesNeedUpdate = true;
	}

	addHoles () {
		let globeVertices = this.globeMesh.geometry.vertices,
			nearVeticesIndexes,
			verticeIndex = 0,
			numberOfHoles = Math.round( Utils.randomRange( 3, 6 ) );

		for ( let i = 0; i < numberOfHoles; i++ ) {
			let randomVertexPoint = globeVertices[ Number.parseInt( Math.random() * globeVertices.length, 10 ) ];

			nearVeticesIndexes = Utils.findIndexesOfNearVertices( globeVertices, randomVertexPoint );
			for ( let k = 0; k < nearVeticesIndexes.length; k++ ) {
				verticeIndex = nearVeticesIndexes[ k ];
				globeVertices[ verticeIndex ] = Utils.moveVerticeAlongVector( globeVertices[ verticeIndex ], new THREE.Vector3( 0, 0, 0 ) );
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

	render () {
		this.globeGroup.rotation.x += 0.001;
		this.globeGroup.rotation.y += 0.001;
		this.globeGroup.rotation.z += 0.001;

		let delta = this.clock.getDelta();
		for ( let i = 0; i < this.mixers.length; i ++ ) {
			this.mixers[ i ].update( delta );
		}
	}
}