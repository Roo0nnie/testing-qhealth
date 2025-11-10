const path = require("path")
const webpack = require("webpack")
const fs = require("fs")
const HtmlWebpackPlugin = require("html-webpack-plugin")
const CopyPlugin = require("copy-webpack-plugin")
const Dotenv = require("dotenv-webpack")

const paths = {
	src: path.resolve(__dirname, "src"),
	build: path.resolve(__dirname, "dist"),
	html: path.resolve(__dirname, "src/index.html"),
	icon: path.resolve(__dirname, "src/favicon.ico"),
	node_modules: path.resolve(__dirname, "node_modules"),
}

function common() {
	const isProduction = process.env.NODE_ENV === "production"

	// Load environment variables from .env file
	require("dotenv").config()

	// Read LICENSE_KEY from .env file directly as fallback
	let licenseKey = process.env.LICENSE_KEY
	if (!licenseKey) {
		try {
			const envPath = path.resolve(__dirname, ".env")
			const envFile = fs.readFileSync(envPath, "utf8")
			const match = envFile.match(/^LICENSE_KEY=(.+)$/m)
			if (match) {
				licenseKey = match[1].trim()
			}
		} catch (error) {}
	}

	// Debug: Log the license key status (masked for security)
	if (licenseKey) {
		const maskedKey =
			licenseKey.substring(0, 6) + "..." + licenseKey.substring(licenseKey.length - 6)
	} else {
	}

	return {
		mode: isProduction ? "production" : "development",
		devtool: isProduction ? "source-map" : "cheap-module-source-map",
		entry: path.resolve(paths.src, "index.tsx"),
		output: {
			path: paths.build,
			filename: isProduction ? "[name].[contenthash].js" : "[name].js",
			publicPath: "/",
			clean: true,
		},
		...(isProduction
			? {}
			: {
					devServer: {
						hot: true,
						port: 8001,
						https: true,
						host: "0.0.0.0",
						useLocalIp: true,
						historyApiFallback: true,
						contentBase: false,
						headers: {
							"Cross-Origin-Opener-Policy": "same-origin",
							"Cross-Origin-Embedder-Policy": "require-corp",
						},
					},
				}),
		target: "web",
		resolve: {
			extensions: [".ts", ".tsx", ".js", ".jsx"],
			modules: [paths.src, paths.node_modules],
			fallback: {
				"url": require.resolve("url/"),
				"events": require.resolve("events/"),
				"punycode": require.resolve("punycode/"),
				"qs": require.resolve("qs"),
				"ansi-regex": require.resolve("ansi-regex"),
			},
		},
		experiments: { asyncWebAssembly: true },
		module: {
			rules: [
				{
					test: /\.tsx?$/,
					loader: "ts-loader",
					options: {
						transpileOnly: true,
					},
				},
				{
					test: /\.css$/i,
					use: [
						"style-loader",
						"css-loader",
						"postcss-loader",
					],
				},
				{
					test: /\.svg$/,
					use: [
						{
							loader: "@svgr/webpack",
							options: {
								svgo: false,
								ref: true,
							},
						},
						{
							loader: "file-loader",
							options: {
								name: "static/assets/[name].[ext]",
								esModule: false,
							},
						},
					],
					exclude: paths.node_modules,
				},
			],
		},
		plugins: [
			new Dotenv({
				path: path.resolve(__dirname, ".env"),
				safe: false,
				systemvars: true,
			}),
			new webpack.DefinePlugin({
				"process.env.LICENSE_KEY": JSON.stringify(licenseKey || ""),
			}),
			new HtmlWebpackPlugin({
				template: paths.html,
				favicon: paths.icon,
				inject: true,
			}),
			new CopyPlugin({
				patterns: [
					{
						from: path.resolve(paths.node_modules, "@biosensesignal/web-sdk/dist"),
						to: path.resolve(paths.build),
						globOptions: {
							ignore: ["**/main.*"],
						},
					},
				],
			}),
		],
	}
}

module.exports = () => common()
