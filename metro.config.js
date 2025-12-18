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
  // Solo watch el directorio actual, no el padre completo
  watchFolders: [__dirname],

  resolver: {
    // Para resolver el SDK desde el directorio padre
    extraNodeModules: {
      '@yuno/yuno-sdk-react-native': sdkPath,
    },
    nodeModulesPaths: [
      path.resolve(__dirname, 'node_modules'),
      path.resolve(root, 'node_modules'),
    ],
    // Excluir archivos y directorios grandes que causan ERR_FS_FILE_TOO_LARGE
    blockList: [
      /.*\/\.git\/.*/,
      /.*\/build\/.*/,
      /.*\/DerivedData\/.*/,
      /.*\/\.gradle\/.*/,
      /.*\/Pods\/.*\.(framework|xcframework)/,
      /.*\.(dSYM|ipa|app|xcarchive|zip|tar|gz|dmg|pkg|iso)$/,
      /.*\/node_modules\/.*\.(tar|gz|zip|dmg|pkg|iso)$/,
      /.*\/Documents\/.*/,  // Excluir Documents que tiene el zip grande
    ],
    // Usar blacklistRE para mayor compatibilidad
    blacklistRE: /(.*\/\.git\/.*|.*\/build\/.*|.*\/DerivedData\/.*|.*\/\.gradle\/.*|.*\/Documents\/.*|.*\.(dSYM|ipa|app|xcarchive|zip|tar|gz|dmg|pkg|iso)$)/i,
  },
  
  watcher: {
    // Ignorar directorios grandes durante el watch
    ignored: [
      /.*\/\.git\/.*/,
      /.*\/build\/.*/,
      /.*\/DerivedData\/.*/,
      /.*\/\.gradle\/.*/,
      /.*\/Pods\/.*/,
      /.*\/node_modules\/.*/,
      /.*\.(dSYM|ipa|app|xcarchive|zip|tar|gz|dmg|pkg|iso)$/,
      /.*\/Documents\/.*/,  // Excluir Documents
    ],
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);

