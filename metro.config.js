const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');
const path = require('path');

const root = path.resolve(__dirname, '..');
const sdkPath = path.resolve(__dirname, '../yuno-sdk-react-native');

/**
 * Metro configuration
 * https://facebook.github.io/metro/docs/configuration
 *
 * @type {import('metro-config').MetroConfig}
 */
const config = {
  watchFolders: [root],

  resolver: {
    // Para resolver el SDK desde el directorio padre
    extraNodeModules: {
      '@yuno/yuno-sdk-react-native': sdkPath,
    },
    nodeModulesPaths: [
      path.resolve(__dirname, 'node_modules'),
      path.resolve(root, 'node_modules'),
    ],
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);

