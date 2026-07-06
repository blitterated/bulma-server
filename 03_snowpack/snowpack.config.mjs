export default {
  plugins: [
    [
      '@snowpack/plugin-sass',
      {
        native: false,
      },
    ],
  ],
  compilerOptions: {
    loadPath: './node_modules',
  },
};
