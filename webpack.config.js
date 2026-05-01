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

function parseEnvFile(filePath) {
	try {
		return dotenv.parse(fs.readFileSync(filePath))
	} catch {
		return {}
	}
}

function loadEnvFile() {
	return parseEnvFile(path.resolve(__dirname, ".env"))
}

/** CRA-style WDS_* vars mapped to the same shape as `WEBPACK_DEV_SERVER_PUBLIC_URL`. */
function buildWebSocketUrlFromWdsSocketEnv(readEnv, devServerHttps) {
	const host = readEnv("WDS_SOCKET_HOST")
	if (!host) return null

	const explicitProtocol = readEnv("WDS_SOCKET_PROTOCOL").toLowerCase()
	let protocol
	if (explicitProtocol === "wss" || explicitProtocol === "ws") {
		protocol = explicitProtocol
	} else {
		protocol = devServerHttps ? "wss" : "ws"
	}

	let pathname = readEnv("WDS_SOCKET_PATH", "/ws")
	if (!pathname.startsWith("/")) pathname = `/${pathname}`

	const portStr = readEnv("WDS_SOCKET_PORT")
	if (!portStr) {
		return normalizeWebSocketURL(`${protocol}://${host}${pathname}`)
	}
	const port = Number.parseInt(portStr, 10)
	if (Number.isNaN(port)) {
		return normalizeWebSocketURL(`${protocol}://${host}${pathname}`)
	}
	const defaultPort = protocol === "wss" ? 443 : 80
	if (port === defaultPort) {
		return normalizeWebSocketURL(`${protocol}://${host}${pathname}`)
	}
	return normalizeWebSocketURL(`${protocol}://${host}:${port}${pathname}`)
}

function resolveDevClientWebSocketUrl(readEnv, devServerHttps) {
	const publicUrl = readEnv("WEBPACK_DEV_SERVER_PUBLIC_URL")
	if (publicUrl) return normalizeWebSocketURL(publicUrl)
	const fromWds = buildWebSocketUrlFromWdsSocketEnv(readEnv, devServerHttps)
	if (fromWds) return fromWds
	return "auto://0.0.0.0:0/ws"
}

function resolveAllowedHosts(readEnv, devServerDisableHostCheck) {
	if (devServerDisableHostCheck) return "all"
	const raw = readEnv("WEBPACK_DEV_SERVER_ALLOWED_HOSTS")
	if (!raw) return "auto"
	const list = raw.split(",").map((s) => s.trim()).filter(Boolean)
	return list.length ? list : "auto"
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

function normalizeWebSocketURL(value) {
	if (!value) return null

	// Allow either absolute ws(s):// URL strings or leave the default "auto://..."
	// in place for local/LAN access. When a tunneled domain is provided without an
	// explicit port, webpack-dev-server tends to fall back to the dev-server port
	// (e.g. :8001). For public HTTPS domains we almost always want :443 instead.
	try {
		const url = new URL(value)
		const protocol = url.protocol.replace(":", "") // "ws" | "wss"
		const pathname = url.pathname && url.pathname !== "/" ? url.pathname : "/ws"
		const hasExplicitPort = Boolean(url.port)

		if (hasExplicitPort) return value

		const defaultPort = protocol === "wss" ? "443" : "80"

		return {
			protocol,
			hostname: url.hostname,
			port: defaultPort,
			pathname,
		}
	} catch {
		return value
	}
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
	const devClientWebSocketURL = resolveDevClientWebSocketUrl(readEnv, devServerHttps)
	const devServerDisableHmr = readEnvBool(readEnv, "WEBPACK_DEV_SERVER_DISABLE_HMR", false)
	const devServerAllowedHosts = resolveAllowedHosts(readEnv, devServerDisableHostCheck)

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
							hot: !devServerDisableHmr,
							liveReload: !devServerDisableHmr,
							port: devServerPort,
							host: devServerUseLocalIp ? "local-ipv4" : devServerHost,
							server: devServerHttps ? "https" : "http",
							allowedHosts: devServerAllowedHosts,
							client: devServerDisableHmr
								? false
								: {
										webSocketTransport: "ws",
										webSocketURL: devClientWebSocketURL,
									},
							webSocketServer: "ws",
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
