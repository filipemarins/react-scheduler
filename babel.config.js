module.exports = {
  presets: ['@babel/preset-env', '@babel/preset-react'],
  plugins: [
    '@babel/plugin-proposal-class-properties',
    ['transform-react-remove-prop-types', { mode: 'wrap' }],
    [
      'module-resolver',
      {
        alias: {
          components: './src/components',
          utils: './src/utils',
          localizers: './src/localizers',
          sass: './src/sass',
          tests: './tests',
        },
      },
    ],
  ],
};
