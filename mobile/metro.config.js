// Learn more: https://docs.expo.dev/guides/customizing-metro
const { getDefaultConfig } = require("expo/metro-config");
const path = require("node:path");

const projectRoot = __dirname;
const repoRoot = path.resolve(projectRoot, "..");

const config = getDefaultConfig(projectRoot);

// Folder shared/ berada di luar mobile/, jadi Metro perlu diberi tahu agar
// ikut mengawasi dan membundel isinya. Tanpa ini, import dari @shared/* gagal
// dengan pesan "Unable to resolve module".
config.watchFolders = [path.resolve(repoRoot, "shared")];

// Paket tetap dicari di mobile/node_modules saja, supaya backend/node_modules
// tidak ikut terbawa ke dalam bundel aplikasi.
config.resolver.nodeModulesPaths = [path.resolve(projectRoot, "node_modules")];

module.exports = config;
