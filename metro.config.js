const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');
const path = require('path');

// Path to the local SDK
const sdkPath = path.resolve(__dirname, '../yuno-sdk-react-native');

/**
 * Metro configuration for local SDK development
 * https://facebook.github.io/metro/docs/configuration
 *
 * @type {import('metro-config').MetroConfig}
 */
const config = {
  watchFolders: [sdkPath],
  resolver: {
    // Block the SDK's node_modules to avoid duplicate dependencies
    blockList: [
      new RegExp(`${sdkPath.replace(/[/\\]/g, '[/\\\\]')}/node_modules/react-native/.*`),
      new RegExp(`${sdkPath.replace(/[/\\]/g, '[/\\\\]')}/node_modules/react/.*`),
    ],
    // Use example's node_modules for all dependencies
    nodeModulesPaths: [
      path.resolve(__dirname, 'node_modules'),
    ],
    // Force these modules to resolve from example's node_modules
    extraNodeModules: {
      'react': path.resolve(__dirname, 'node_modules/react'),
      'react-native': path.resolve(__dirname, 'node_modules/react-native'),
    },
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
