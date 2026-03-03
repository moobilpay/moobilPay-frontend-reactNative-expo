// https://docs.expo.dev/guides/customizing-metro/
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

/**
 * Résout le problème "Component auth has not been registered yet"
 *
 * Cause : Metro utilise le build browser/ESM de firebase/auth qui importe
 * @firebase/auth sans tenir compte du champ "react-native" du package.json.
 *
 * Solution : on force la résolution de firebase/auth ET @firebase/auth
 * vers le build React Native (dist/rn/index.js) qui contient
 * initializeAuth + getReactNativePersistence.
 */
const firebaseAuthRNPath = path.resolve(
  __dirname,
  'node_modules/@firebase/auth/dist/rn/index.js'
);

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === 'firebase/auth' || moduleName === '@firebase/auth') {
    return {
      filePath: firebaseAuthRNPath,
      type: 'sourceFile',
    };
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
