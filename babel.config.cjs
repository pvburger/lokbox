module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    // replaces Node crypto and Buffer with react-native-quick-crypto/@craftzdog/react-native-buffer implementations
    plugins: [
      [
        'module-resolver',
        {
          alias: {
            crypto: 'react-native-quick-crypto',
            stream: 'readable-stream',
            buffer: '@craftzdog/react-native-buffer',
          },
        },
      ],
    ],
  };
};
