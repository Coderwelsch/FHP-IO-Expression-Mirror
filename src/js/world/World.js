/* global THREE */

// imports
import Globe from "./Globe.js";
import GlobeMoodController from "../controller/GlobeMoodController.js";
import Controls from "./Controls.js";
import Stats from "../utils/stats.js";
import Models from "../models/Models.js";

export default class World {
	constructor ( mood = 0, globeRadius = 50, cameraOffset = 120 ) {
		// properties
		this.mood = mood;
		this.globeRadius = globeRadius;
		this.cameraOffset = cameraOffset;

		this.ratio = window.devicePixelRatio;
		// this.ratio = 1;
		this.width = window.innerWidth;
		this.height = window.innerHeight;

		this.rendererIsRunning = false;

		this.scene = null;
		this.camera = null;
		this.renderer = null;
		this.hemisphereLight = null;
		this.shadowLight = null;
		this.models = null;
		this.controls = null;

		// debug
		this.stats = null;

		this.globe = null;
		this.globeMoodController = null;

		this.objectsToRender = [];

		// init
		this.init();
		this.initStatsViewer();
		this.startRenderer();
		this.bindEvents();
	}

	init () {
		// scene
		this.scene = new THREE.Scene();
		this.scene.name = "Scene";

		// camera
		this.camera = new THREE.PerspectiveCamera( 45, this.width / this.height, 0.1, 3000 );
		this.camera.name = "Camera";
		this.camera.position.set( 0, 0, this.globeRadius + this.cameraOffset );
		this.scene.add( this.camera );

		// renderer
		this.renderer = new THREE.WebGLRenderer( { antialias: true, alpha: true, shadowMapEnabled: true } );
		this.renderer.name = "RENDERER";
		this.renderer.shadowMap.enabled = true;
		this.renderer.shadowMap.renderReverseSided = false;
		this.renderer.setClearColor( 0x333F47, 1 );
		this.updateRendererSize();

		// controls
		this.controls = new Controls( this.camera );

		// assign models
		this.models = new Models();

		// add renderer element to dom
		document.body.appendChild( this.renderer.domElement );

		// init world
		this.initLightning();
		this.initWorld();
		this.initGlobeMoodStateController();
	}

	initStatsViewer () {
		this.stats = new Stats();
		this.stats.showPanel( 0 );
		document.body.appendChild( this.stats.dom );
	}

	initGlobeMoodStateController () {
		this.globeMoodController = new GlobeMoodController( this.globe, this.mood );
		this.objectsToRender.push( this.globeMoodController );
	}

	initLightning () {
		// hemisphere light
		this.hemisphereLight = new THREE.HemisphereLight( 0xFFFFFF, 0x111111, 0.9 );
		this.hemisphereLight.name = "Hemispere Light";
		this.scene.add( this.hemisphereLight );

		// shadow light
		let shadowCameraPos = 40;
		this.shadowLight = new THREE.DirectionalLight( 0xFFFFFF, 0.5 );

		this.shadowLight.position.set( 0, 0, 650 );
		this.shadowLight.castShadow = true;
		this.shadowLight.shadowCameraVisible = true;
		this.shadowLight.shadow.camera.left = -shadowCameraPos;
		this.shadowLight.shadow.camera.right = shadowCameraPos;
		this.shadowLight.shadow.camera.top = shadowCameraPos;
		this.shadowLight.shadow.camera.bottom = -shadowCameraPos;
		this.shadowLight.shadow.camera.near = 1;
		this.shadowLight.shadow.camera.far = 2000;

		this.shadowLight.shadow.mapSize.width = 2048;
		this.shadowLight.shadow.mapSize.height = 2048;

		this.shadowLight.name = "Directional Light";

		this.scene.add( this.shadowLight );
	}

	initWorld () {
		this.globe = new Globe( this.scene, this.models, this.globeRadius );
		this.objectsToRender.push( this.globe );
	}

	startRenderer () {
		if ( !this.rendererIsRunning ) {
			this.rendererIsRunning = true;

			window.requestAnimationFrame( () => {
				this.runRenderLoop();
			} );
		}
	}

	stopRenderer () {
		this.rendererIsRunning = false;
	}

	runRenderLoop () {
		this.stats.begin();

		for ( let renderItem of this.objectsToRender ) {
			if ( renderItem && typeof renderItem.render === "function" ) {
				renderItem.render();
			}
		}

		this.renderer.render( this.scene, this.camera );

		this.stats.end();

		if ( this.rendererIsRunning ) {
			window.requestAnimationFrame( () => {
				this.runRenderLoop();
			} );
		}
	}

	updateRendererSize () {
		this.renderer.setSize( this.width * this.ratio, this.height * this.ratio );
		this.renderer.domElement.style.width = this.width;
		this.renderer.domElement.style.height = this.height;
	}

	updateCameraAspect () {
		this.camera.aspect = this.width / this.height;
		this.camera.updateProjectionMatrix();
	}

	windowResized () {
		this.width = window.innerWidth;
		this.height = window.innerHeight;

		this.updateRendererSize();
		this.updateCameraAspect();
	}

	bindEvents () {
		window.addEventListener( "resize", () => {
			this.windowResized();
		} );
	}
}