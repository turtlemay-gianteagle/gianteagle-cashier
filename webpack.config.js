const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const OfflinePlugin = require('@lcdp/offline-plugin')

module.exports = {
	mode: 'development',
	entry: {
		'index': './src/index.tsx',
	},
	output: {
		path: `${__dirname}/dist`,
		filename: '[name].[contenthash].js',
	},
	resolve: {
		extensions: ['.tsx', '.ts', '.js'],
	},
	devtool: 'inline-source-map',
	devServer: {
		static: './dist',
		hot: true,
	},
	module: {
		rules: [
			{
				test: /\.(j|t)sx?$/i,
				exclude: /node_modules/,
				loader: 'ts-loader',
			},
			{
				test: /\.css$/i,
				use: 'css-loader',
			},
			{
				test: /\.webmanifest$/i,
				type: 'asset/resource',
				generator: { filename: 'manifest.webmanifest' }
			},
			{
				test: /\.(png|jpe?g|gif)$/i,
				type: 'asset/resource',
			},
		],
	},
	plugins: [
		new webpack.DefinePlugin({
			__BUILD_DATE__: JSON.stringify(getBuildDate()),
			'process.env': {
				'DEFAULT_DB_URL': JSON.stringify(process.env.CASHIER_APP_DEFAULT_DB_URL),
			},
		}),
		new CleanWebpackPlugin(),
		new HtmlWebpackPlugin({
			template: './resources/index.html',
			favicon: './resources/icon.png',
			inject: 'head',
			scriptLoading: 'defer',
			hash: true,
		}),
		new OfflinePlugin({ ServiceWorker: { events: true } }),
	],
}

function getBuildDate() {
	const today = new Date()
	return today.toUTCString()
}
