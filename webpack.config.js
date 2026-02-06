const path = require('path');
const createExpoWebpackConfigAsync = require('@expo/webpack-config');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);

  // Make the dev server accessible from mobile on the same network (fixes "something went wrong" on phone)
  if (config.devServer) {
    config.devServer.host = '0.0.0.0';
    config.devServer.allowedHosts = 'all';
  }

  // Force react-native-gesture-handler to use web implementation (fixes "flushOperations is not a function" on web/mobile browser)
  const gestureHandlerRoot = path.dirname(require.resolve('react-native-gesture-handler/package.json'));
  const rnghModuleWeb = path.join(gestureHandlerRoot, 'lib', 'module', 'RNGestureHandlerModule.web.js');
  config.resolve = config.resolve || {};
  config.resolve.alias = {
    ...config.resolve.alias,
    // Match both exact .js and extensionless resolution
    [path.join(gestureHandlerRoot, 'lib', 'module', 'RNGestureHandlerModule.js')]: rnghModuleWeb,
    [path.join(gestureHandlerRoot, 'lib', 'module', 'RNGestureHandlerModule')]: rnghModuleWeb,
  };

  return config;
};
