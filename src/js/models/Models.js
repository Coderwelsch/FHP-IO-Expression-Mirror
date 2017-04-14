import Textures from "../textures/Textures.js";
import Utils from "../utils/Utils.js";
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
						scale: 1,
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
			},
			mushrooms: {
				Mushroom1: {
					type: "obj",
					dir: "files/models/vegetation/mushrooms/boletus/",
					objSrc: "boletus.obj",
					mtlSrc: "boletus.mtl",
					scale: 1
				}
			},
			flowers: {
				sepal: {
					Sepal1: {
						type: "obj",
						dir: "files/models/vegetation/flowers/sepal/sepal-1/",
						objSrc: "sepal-1.obj",
						mtlSrc: "sepal-1.mtl",
						scale: 0.6
					},
					Sepal2: {
						type: "obj",
						dir: "files/models/vegetation/flowers/sepal/sepal-2/",
						objSrc: "sepal-2.obj",
						mtlSrc: "sepal-2.mtl",
						scale: 0.06
					},
					Sepal3: {
						type: "obj",
						dir: "files/models/vegetation/flowers/sepal/sepal-3/",
						objSrc: "sepal-3.obj",
						mtlSrc: "sepal-3.mtl",
						scale: 0.06
					}
				}
			}
		},
		stones: {
			Stone1: {
				type: "obj",
				dir: "files/models/stones/",
				objSrc: "stone_1.obj",
				texSrc: "files/textures/stones/Craggy_Rock_With_Moss_UV_CM_1.jpg",
				scale: 1
			},
			Stone2: {
				type: "obj",
				dir: "files/models/stones/",
				objSrc: "stone_2.obj",
				texSrc: "files/textures/stones/Craggy_Stone_With_Green_Moss_Litchen_UV_CM_1.jpg",
				scale: 1
			},
			Stone3: {
				type: "obj",
				dir: "files/models/stones/",
				objSrc: "stone_3.obj",
				texSrc: "files/textures/stones/Rock_02_UV_H_CM_1.jpg",
				scale: 1
			},
			Stone4: {
				type: "obj",
				dir: "files/models/stones/",
				objSrc: "stone_4.obj",
				texSrc: "files/textures/stones/Stone_06_UV_H_CM_1.jpg",
				scale: 1
			},
			Stone5: {
				type: "obj",
				dir: "files/models/stones/",
				objSrc: "stone_5.obj",
				texSrc: "files/textures/stones/Very_Craggy_Grey_Rock_Moss_UV_CM_1.jpg",
				scale: 1
			}
		},
		birds: {
			Flamingo: {
				type: "json",
				data: require( "../../json/models/birds/flamingo.json" ) 
			}
		},
		skeletons: {
			SkeletonHuman: {
				type: "obj",
				dir: "files/models/skeletons/",
				objSrc: "skeleton-1.obj",
				mtlSrc: "skeleton-1.mtl",
				scale: 0.2
			}
		}
	};

export default class Models {
	constructor () {
		this.models = models;
	}

	getModelJson ( model ) {
		if ( model.type === "json" ) {
			return jsonLoader.parse( model.data );
		}

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

		if ( model.mtlSrc && model.mtlSrc ) {
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
		} else {
			objLoader.setPath( model.dir );
			objLoader.load( model.objSrc, ( mesh ) => {
				if ( model.scale ) {
					mesh.scale.set( model.scale, model.scale, model.scale );
				}

				if ( model.texSrc ) {
					for ( let child of Utils.getChildren( mesh ) ) {
						child.material.map = new THREE.TextureLoader().load( model.texSrc );
						child.material.needsUpdate = true;
					}
				}

				callback( mesh );
			} );
		}
	}
}
