const RootAssetsPath = "./files/textures/models/";


let objectLoader = new THREE.ObjectLoader(),
	jsonLoader = new THREE.JSONLoader(),
	models = {
		vegetation: {
			trees: {
				Tree1: require( "../../json/models/vegetation/tree-1.json" )
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

	getModel ( model ) {
		return objectLoader.parse( model );
	}
}