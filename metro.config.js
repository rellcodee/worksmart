const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Izinkan Metro membaca file .wasm
config.resolver.assetExts.push('wasm');

module.exports = config;