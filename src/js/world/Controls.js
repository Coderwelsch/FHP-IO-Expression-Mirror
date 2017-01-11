export default class Controls {
	constructor ( camera ) {
		this.camera = camera;
		this.controls = new THREE.OrbitControls( this.camera );
	}
}
