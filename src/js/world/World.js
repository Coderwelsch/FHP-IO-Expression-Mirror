// imports
import THREE from "../plugins/three.js";
import Globe from "./Globe.js";

export default class World {
	constructor() {
		// properties
		this.ratio = window.devicePixelRatio;
		this.width = window.innerWidth;
		this.height = window.innerHeight;

		this.rendererIsRunning = false;

		this.scene = null;
		this.camera = null;
		this.renderer = null;
		this.ambientLight = null;

		this.globe = null;

		// init
		this.init();
		this.startRenderer();
		this.bindEvents();
	}

	init() {
		// scene
		this.scene = new THREE.Scene();

		// camera
		this.camera = new THREE.PerspectiveCamera(45, this.width / this.height, 0.1, 3000);
		this.camera.position.set(0, 6, 0);
		this.scene.add(this.camera);

		// ambient light
		this.ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.5);
		this.scene.add(this.ambientLight);

		// renderer
		this.renderer = new THREE.WebGLRenderer({ antialias: true });
		this.renderer.setClearColor(0x333F47, 1);
		this.updateRendererSize();

		// add renderer element to dom
		document.body.appendChild(this.renderer.domElement);

		// init world
		this.initWorld();
	}

	initWorld() {
		this.globe = new Globe(this.scene);
	}

	startRenderer() {
		if (!this.rendererIsRunning) {
			this.rendererIsRunning = true;

			window.requestAnimationFrame(() => {
				this.runRenderLoop();
			});
		}
	}

	stopRenderer() {
		this.rendererIsRunning = false;
	}

	runRenderLoop() {
		this.renderer.render(this.scene, this.camera);

		if (this.rendererIsRunning) {
			window.requestAnimationFrame(() => {
				this.runRenderLoop();
			});
		}
	}

	updateRendererSize() {
		this.renderer.setSize(this.width * this.ratio, this.height * this.ratio);
		this.renderer.domElement.style.width = this.width;
		this.renderer.domElement.style.height = this.height;
	}

	updateCameraAspect() {
		this.camera.aspect = this.width / this.height;
		this.camera.updateProjectionMatrix();
	}

	windowResized() {
		this.width = window.innerWidth;
		this.height = window.innerHeight;

		this.updateRendererSize();
		this.updateCameraAspect();
	}

	bindEvents() {
		window.addEventListener("resize", () => {
			this.windowResized();
		});
	}
}