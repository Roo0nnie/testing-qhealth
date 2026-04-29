const path = require("path")
const webpack = require("webpack")
const fs = require("fs")
const HtmlWebpackPlugin = require("html-webpack-plugin")
const dotenv = require("dotenv")

const paths = {
	src: path.resolve(__dirname, "src"),
	build: path.resolve(__dirname, "dist"),
	html: path.resolve(__dirname, "src/index.html"),
	icon: path.resolve(__dirname, "src/assets/gaia.svg"),
	node_modules: path.resolve(__dirname, "node_modules"),
}

function loadEnvFile() {
	const envPath = path.resolve(__dirname, ".env")

	try {
		return dotenv.parse(fs.readFileSync(envPath))
	} catch (error) {
		return {}
	}
}

function createEnvReader(envFile) {
	return function readEnv(key, fallback = "") {
		const value = process.env[key] ?? envFile[key] ?? fallback
		return typeof value === "string" ? value.trim() : value
	}
}

function readEnvBool(readEnv, key, fallback) {
	const value = readEnv(key, fallback ? "true" : "false")
	return String(value).toLowerCase() !== "false"
}

function readEnvPort(readEnv, key, fallback) {
	const value = Number.parseInt(readEnv(key, String(fallback)), 10)
	return Number.isNaN(value) ? fallback : value
}

function common(argv = {}) {
	const mode = argv.mode === "production" ? "production" : "development"
	const isProduction = mode === "production"
	const envFile = loadEnvFile()
	const readEnv = createEnvReader(envFile)

	// Read only the client-safe variables that app code references.
	const insightGenieBaseURL = readEnv("INSIGHT_GENIE_BASE_URL")
	const insightGenieApiKey = readEnv("INSIGHT_GENIE_API_KEY")
	const insightGenieApiSecret = readEnv("INSIGHT_GENIE_API_SECRET")
	const galeApiBaseURL = readEnv("GALE_API_BASE_URL")
	const galeApiKey = readEnv("GALE_API_KEY")
	const galeSystemName = readEnv("GALE_SCAN_SOURCE_SYSTEM_NAME", "QHealth System")
	const galePublisher = readEnv("GALE_SCAN_SOURCE_PUBLISHER", "QHealth")
	const galeApiEnabled = readEnvBool(readEnv, "GALE_API_ENABLED", true)

	// Dev server bind/listen options (development only); override via .env
	const devServerPort = readEnvPort(readEnv, "WEBPACK_DEV_SERVER_PORT", 8001)
	const devServerHost = readEnv("WEBPACK_DEV_SERVER_HOST", "10.10.0.5")
	const devServerHttps = readEnvBool(readEnv, "WEBPACK_DEV_SERVER_HTTPS", true)
	const devServerUseLocalIp = readEnv("WEBPACK_DEV_SERVER_USE_LOCAL_IP") === "true"
	const devServerDisableHostCheck = readEnvBool(
		readEnv,
		"WEBPACK_DEV_SERVER_DISABLE_HOST_CHECK",
		true
	)

	return {
		mode,
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
							port: devServerPort,
							host: devServerUseLocalIp ? "local-ipv4" : devServerHost,
							server: devServerHttps ? "https" : "http",
							allowedHosts: devServerDisableHostCheck ? "all" : "auto",
							devMiddleware: {
								index: "index.html",
								publicPath: "/",
							},
							historyApiFallback: {
								index: "/index.html",
								disableDotRule: true,
								rewrites: [
									{ from: /^\/$/, to: "/index.html" },
									{ from: /./, to: "/index.html" },
								],
							},
							static: {
								directory: paths.build,
								watch: false,
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
		performance: isProduction
			? {
					hints: "warning",
					maxAssetSize: 600 * 1024,
					maxEntrypointSize: 600 * 1024,
				}
			: false,
		plugins: [
			new webpack.DefinePlugin({
				"process.env.INSIGHT_GENIE_BASE_URL": JSON.stringify(insightGenieBaseURL || ""),
				"process.env.INSIGHT_GENIE_API_KEY": JSON.stringify(insightGenieApiKey || ""),
				"process.env.INSIGHT_GENIE_API_SECRET": JSON.stringify(insightGenieApiSecret || ""),
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
		],
	}
}

module.exports = (_, argv) => common(argv)
