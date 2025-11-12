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

	// Read GALE API environment variables from .env file
	let galeApiBaseURL = process.env.GALE_API_BASE_URL
	let galeApiKey = process.env.GALE_API_KEY
	let galeSystemName = process.env.GALE_SCAN_SOURCE_SYSTEM_NAME || "QHealth System"
	let galePublisher = process.env.GALE_SCAN_SOURCE_PUBLISHER || "QHealth"
	let galeApiEnabled = process.env.GALE_API_ENABLED !== "false" // Default to true if not set

	// Fallback: read from .env file directly if not in process.env
	if (!galeApiBaseURL || !galeApiKey) {
		try {
			const envPath = path.resolve(__dirname, ".env")
			const envFile = fs.readFileSync(envPath, "utf8")
			if (!galeApiBaseURL) {
				const match = envFile.match(/^GALE_API_BASE_URL=(.+)$/m)
				if (match) {
					galeApiBaseURL = match[1].trim()
				}
			}
			if (!galeApiKey) {
				const match = envFile.match(/^GALE_API_KEY=(.+)$/m)
				if (match) {
					galeApiKey = match[1].trim()
				}
			}
			const systemNameMatch = envFile.match(/^GALE_SCAN_SOURCE_SYSTEM_NAME=(.+)$/m)
			if (systemNameMatch) {
				galeSystemName = systemNameMatch[1].trim()
			}
			const publisherMatch = envFile.match(/^GALE_SCAN_SOURCE_PUBLISHER=(.+)$/m)
			if (publisherMatch) {
				galePublisher = publisherMatch[1].trim()
			}
			const enabledMatch = envFile.match(/^GALE_API_ENABLED=(.+)$/m)
			if (enabledMatch) {
				galeApiEnabled = enabledMatch[1].trim() !== "false"
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
			extensions: [".ts", ".tsx", ".js", ".jsx", ".mjs"],
			modules: [paths.src, paths.node_modules],
			alias: {
				"react/jsx-runtime": path.resolve(paths.node_modules, "react/jsx-runtime.js"),
				"react/jsx-dev-runtime": path.resolve(paths.node_modules, "react/jsx-dev-runtime.js"),
			},
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
					test: /\.mjs$/,
					type: "javascript/auto",
					resolve: {
						fullySpecified: false,
					},
				},
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
				"process.env.GALE_API_BASE_URL": JSON.stringify(galeApiBaseURL || ""),
				"process.env.GALE_API_KEY": JSON.stringify(galeApiKey || ""),
				"process.env.GALE_SCAN_SOURCE_SYSTEM_NAME": JSON.stringify(galeSystemName || "QHealth System"),
				"process.env.GALE_SCAN_SOURCE_PUBLISHER": JSON.stringify(galePublisher || "QHealth"),
				"process.env.GALE_API_ENABLED": JSON.stringify(galeApiEnabled ? "true" : "false"),
			}),
			new HtmlWebpackPlugin({
				template: paths.html,
				favicon: paths.icon,
				inject: true,
				excludeChunks: ["a", "a.worker"],
				// Prevent preloading of SDK worker files that may not be used
				scriptLoading: "defer",
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
