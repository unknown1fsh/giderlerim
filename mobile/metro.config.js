const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '..');

const config = getDefaultConfig(projectRoot);

// Expo varsayılan watchFolders (workspace paketleri + kök node_modules) korunur; monorepo kökü de izlenir
const defaultWatchFolders = config.watchFolders ?? [];
config.watchFolders = [...new Set([...defaultWatchFolders, monorepoRoot])];

// Let Metro resolve packages from both the mobile and root node_modules
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
];

// Tek React örneği: packages/shared/node_modules altındaki kopya RN renderer (19.1) ile çakışmasın
const rootReact = path.resolve(monorepoRoot, 'node_modules', 'react');
config.resolver.extraNodeModules = {
  react: rootReact,
};

// Force resolving shared package from source
config.resolver.disableHierarchicalLookup = false;

module.exports = config;
