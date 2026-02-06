module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      'babel-preset-expo',  // Expo's main preset (must be installed)
    ],
    plugins: [
      'inline-dotenv',      // now correctly loaded for .env support
      // If you use reanimated, add this last:
      'react-native-reanimated/plugin',
    ],
  };
};