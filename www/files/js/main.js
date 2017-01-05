let scene,
	camera,
	renderer,
	light,
	geometry,
	material,
	mesh;

function init () {
	let width = window.innerWidth,
		height = window.innerHeight;

	scene = new THREE.Scene();

	renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.setClearColor( 0x333F47 );
	renderer.setSize( width * window.devicePixelRatio, height * window.devicePixelRatio );

	camera = new THREE.PerspectiveCamera( 45, width / height, 0.1, 3000 );
	camera.position.set( 0, 6, 0 );
	scene.add( camera );

	var l = new THREE.AmbientLight( 0xFFFFFF, 0.5 );
	scene.add( l );

	light = new THREE.PointLight( 0xFFFFFF, 0.5 );
	light.position.set( -100, 200, 100 );
	scene.add( light );

	geometry = new THREE.BoxGeometry( 100, 100, 100 );
	material = new THREE.MeshLambertMaterial( { color: 0xF3FF32 } );
	mesh = new THREE.Mesh( geometry, material );
	mesh.position.set( 0, 0, -1000 );
	scene.add( mesh );

	renderer.domElement.style.width = width;
	renderer.domElement.style.height = height;
	document.body.appendChild( renderer.domElement );
	document.addEventListener( "resize", resize );
	window.requestAnimationFrame( render );
}

function render () {
	mesh.rotation.x += 0.01;
	mesh.rotation.y += 0.01;

	renderer.render( scene, camera );
	window.requestAnimationFrame( render );
}

function resize () {
	let width = window.innerWidth,
		height = window.innerHeight;

	renderer.setSize( width / height );
	camera.aspect = width / height;
	camera.updateProjectionMatrix();
}

init();