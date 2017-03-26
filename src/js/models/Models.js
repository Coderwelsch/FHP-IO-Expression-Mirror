/* globals THREE */
// const RootAssetsPath = "./files/textures/models/";

import OBJLoader from "../loader/OBJLoader.js";


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
				model: require( "../../json/models/birds/swimming-duck.json" ),
				texSrc: "files/textures/models/birds/swimming-duck/DUCK.JPG"
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
}
