// webpack.config.js
module.exports = {
  // other webpack configurations...

  resolve: {
    fallback: {
      util: require.resolve('util/'),
      assert: require.resolve('assert/')
      // Add any other core modules you encounter issues with
    }
  },
  node: {
    // Prevent webpack from injecting mocks to Node native modules
    util: false,
    assert: false
    // Add any other core modules you encounter issues with
  }
};