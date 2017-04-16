var utils = require('./utils')
var config = require('../config')
var path = require('path')
var isProduction = process.env.NODE_ENV === 'production'

module.exports = {
  loaders: utils.cssLoaders({
    sourceMap: isProduction
      ? config.build.productionSourceMap
      : config.dev.cssSourceMap,
    extract: isProduction
  })
  /*stylus: {
    import: [path.resolve(__dirname, '../src/styles/normalize.css')]
  }*/
}
