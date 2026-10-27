const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Tambahkan ekstensi 'wasm' agar Metro Bundler dapat memuat binary SQLite WebAssembly di Web
config.resolver.assetExts.push('wasm');

module.exports = config;
