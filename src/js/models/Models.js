import Textures from "../textures/Textures.js";
import "../loader/DDSLoader.js";
import "../loader/OBJLoader.js";
import "../loader/MTLLoader.js";


let objectLoader = new THREE.ObjectLoader(),
	jsonLoader = new THREE.JSONLoader(),
	models = {
		vegetation: {
			trees: {
				deadTrees: {
					DeadTree1: {
						type: "json",
						data: require( "../../json/models/vegetation/trees/tree-dead.json" ),
						texSrc: Textures.tree.bark.texture,
						bumpSrc: Textures.tree.bark.bump
					},
					DeadTree2: {
						type: "obj",
						dir: "files/models/vegetation/trees/dead/",
						objSrc: "dead-tree-1.obj",
						mtlSrc: "dead-tree-1.mtl",
						scale: 0.035
					},
					DeadTree3: {
						type: "obj",
						dir: "files/models/vegetation/trees/dead/",
						objSrc: "dead-tree-2.obj",
						mtlSrc: "dead-tree-2.mtl",
						scale: 1
					}
				}
			},
			grass: {
				deadGrass: {
					DeadGrass1: {
						type: "json",
						data: require( "../../json/models/vegetation/grass/grass-dead-1.json" )
					}
				},
				fertileGrass: {
					GrassPlant1: {
						type: "json",
						data: require( "../../json/models/vegetation/grass/grass-plant-1.json" ) 
					},
					GrassPlant2: {
						type: "json",
						data: require( "../../json/models/vegetation/grass/grass-plant-2.json" )
					}
				}
			}
		},
		birds: {
			Flamingo: {
				type: "json",
				data: require( "../../json/models/birds/flamingo.json" ) 
			}
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

		if ( model.texSrc ) {
			let texture = new THREE.TextureLoader().load( model.texSrc );

			mesh = objectLoader.parse( model.data );
			mesh.traverse( ( child ) => {
				if ( child instanceof THREE.Mesh ) {
					child.material.map = texture;
					child.material.needsUpdate = true;
				}
			} );
		} else {
			mesh = objectLoader.parse( model.data );
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
			objLoader.load( model.objSrc, ( mesh ) => {
				if ( model.scale ) {
					mesh.scale.set( model.scale, model.scale, model.scale );
				}

				callback( mesh );
			} );
		} );
	}
}
