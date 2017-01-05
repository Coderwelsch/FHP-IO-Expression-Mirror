export default class Globe {
	constructor(scene) {
		this.scene = scene;

		this.init();
	}

	init() {
		this.globeGeometry = new THREE.SphereGeometry(5, 32, 32);
		this.globeMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFF00 });
		this.globeMesh = new THREE.Mesh(this.globeGeometry, this.globeMaterial);
		this.scene.add(this.globeMesh);
	}
}