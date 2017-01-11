// imports
import Globe from "./Globe.js";
import Controls from "./Controls.js";
import Models from "../models/Models.js";


export default class World {
	constructor () {
		// properties
		this.ratio = window.devicePixelRatio;
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

		this.globe = null;

		this.objectsToRender = [];

		// init
		this.init();
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
		this.camera.position.set( 0, 0, 15 );
		this.scene.add( this.camera );

		// renderer
		this.renderer = new THREE.WebGLRenderer( { antialias: true, alpha: true, shadowMapEnabled: true } );
		this.renderer.name = "RENDERER";
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
	}

	initLightning () {
		this.hemisphereLight = new THREE.HemisphereLight( 0xFFFFFF, 0x111111, 0.9 );
		this.scene.add( this.hemisphereLight );

		// shadow light
		this.shadowLight = new THREE.DirectionalLight( 0xFFFFFF, 0.5 );

		this.shadowLight.position.set( 0, 0, 650 );
		this.shadowLight.castShadow = true;
		this.shadowLight.shadow.camera.left = -400;
		this.shadowLight.shadow.camera.right = 400;
		this.shadowLight.shadow.camera.top = 400;
		this.shadowLight.shadow.camera.bottom = -400;
		this.shadowLight.shadow.camera.near = 1;
		this.shadowLight.shadow.camera.far = 1000;

		this.shadowLight.shadow.mapSize.width = 2048;
		this.shadowLight.shadow.mapSize.height = 2048;

		this.scene.add( this.shadowLight );
	}

	initWorld () {
		this.globe = new Globe( this.scene, this.models );
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
		for ( let renderItem of this.objectsToRender ) {
			if ( renderItem && typeof renderItem.render === "function" ) {
				renderItem.render();
			}
		}

		this.renderer.render( this.scene, this.camera );

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