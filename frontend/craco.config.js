module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Ignorer les warnings des source maps de dompurify
      webpackConfig.ignoreWarnings = [
        {
          module: /node_modules\/dompurify/,
        },
        {
          message: /Failed to parse source map/,
        },
      ];
      return webpackConfig;
    },
  },
};