/* globals THREE */
// const RootAssetsPath = "./files/textures/models/";


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
			Flamingo: require( "../../json/models/birds/flamingo.json" )
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
		return objectLoader.parse( model );
	}
}
