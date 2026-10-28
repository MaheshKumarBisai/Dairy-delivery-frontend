const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');
const fs = require('fs');

const projectRoot = __dirname;
const config = getDefaultConfig(projectRoot);

const localShared = path.resolve(projectRoot, 'shared');

if (fs.existsSync(localShared)) {
  config.watchFolders = [localShared];
  config.resolver.extraNodeModules = {
    ...config.resolver.extraNodeModules,
    '@dairy/shared': localShared,
  };
}

config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
];

module.exports = config;
