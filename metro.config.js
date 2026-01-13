const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Add custom resolver for @/* path alias
config.resolver = {
  ...config.resolver,
  sourceExts: [...config.resolver.sourceExts, 'jsx', 'js', 'ts', 'tsx'],
  assetExts: [...config.resolver.assetExts, 'png', 'jpg', 'jpeg', 'gif', 'svg'],
  resolveRequest: (context, moduleName, platform) => {
    // Handle @/* imports
    if (moduleName.startsWith('@/')) {
      const resolvedPath = path.resolve(__dirname, moduleName.replace('@/', ''));
      return context.resolveRequest(context, resolvedPath, platform);
    }
    return context.resolveRequest(context, moduleName, platform);
  },
};

module.exports = withNativeWind(config, { input: './global.css' });