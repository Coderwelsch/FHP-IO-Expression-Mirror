import "../loader/DDSLoader.js";
import "../loader/OBJLoader.js";
import "../loader/MTLLoader.js";


let objectLoader = new THREE.ObjectLoader(),
	jsonLoader = new THREE.JSONLoader(),
	models = {
		vegetation: {
			trees: {
				// Tree1: require( "../../json/models/vegetation/tree-1.json" ),
				deadTrees: {
					DeadTree1: require( "../../json/models/vegetation/trees/tree-dead.json" )
				}
			},
			grass: {
				deadGrass: {
					DeadGrass1: require( "../../json/models/vegetation/grass/grass-dead-1.json" )
				},
				fertileGrass: {
					GrassPlant1: require( "../../json/models/vegetation/grass/grass-plant-1.json" ),
					GrassPlant2: require( "../../json/models/vegetation/grass/grass-plant-2.json" )
				}
			}
		},
		birds: {
			Flamingo: require( "../../json/models/birds/flamingo.json" ),
			SwimmingDuck: {
				dir: "files/textures/models/birds/swimming-duck/",
				objSrc: "DUCK.OBJ",
				mtlSrc: "DUCK.MTL"
			},
			Test: {
				dir: "files/textures/models/birds/test/",
				objSrc: "test.obj",
				mtlSrc: "test.mtl"
			}
		},
		insects: {
			Bee: require( "../../json/models/insects/bee.json" )
			// Bee: {
			// 	dir: "files/textures/models/insects/bee/",
			// 	objSrc: "bee.obj",
			// 	mtlSrc: "bee.mtl"
			// }
		},
		horses: {
			Horse: {
				dir: "files/textures/models/horses/Horse/",
				objSrc: "Horse.obj",
				mtlSrc: "Horse.mtl"
			}
		},
		test: {
			dir: "files/textures/models/test/",
			objSrc: "test.obj",
			mtlSrc: "test.mtl"
		},
		Fen: {
			dir: "files/textures/models/test/",
			objSrc: "fen.obj",
			mtlSrc: "fen.mtl"
		},
		Wood: {
			dir: "files/textures/models/test/",
			objSrc: "wood.obj",
			mtlSrc: "wood.mtl"
		}
	};

export default class Models {
	constructor () {
		this.models = models;
	}

	getModelJson ( model ) {
		return jsonLoader.parse( model );
	}

	getModelObject ( model ) {
		let mesh;

		if ( "texSrc" in model ) {
			let texture = THREE.ImageUtils.loadTexture( model.texSrc );

			mesh = objectLoader.parse( model.model );

			mesh.traverse( function ( child ) {
				if ( child instanceof THREE.Mesh ) {
					child.material.map = texture;
					child.material.needsUpdate = true;
				}
			} );
		} else {
			mesh = objectLoader.parse( model );
		}

		return mesh;
	}

	loadObjMtlModel ( model, callback ) {
		let mtlLoader = new THREE.MTLLoader(),
			objLoader = new THREE.OBJLoader();

		// load material (.mtl) file at first
		mtlLoader.setBaseUrl( model.dir );
		mtlLoader.setPath( model.dir );
		mtlLoader.load( model.mtlSrc, ( material ) => {
			material.preload();

			// obj preparation
			objLoader.setMaterials( material );
			objLoader.setPath( model.dir );
			objLoader.load( model.objSrc, callback );
		} );
	}
}
