const isDev = process.env.NODE_ENV === 'development'

module.exports = {
	mode: isDev ? 'development' : 'production',
	output: {
		filename: "bundle.js",
	},
	devtool: isDev ? 'source-map' : 'none',
	module: {
		rules: [
			{ test: /\.(js)$/, use: 'babel-loader' }
		]
	}
};