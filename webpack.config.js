module.exports = {
	entry: "./src/js/main.js",
	output: {
		filename: "bundle.js",
		path: "./www/files/js/"
	},
	module: {
		loaders: [
			{
				test: /\.json$/,
				loader: "json-loader"
			}
		]
	}
};