const { merge } = require('webpack-merge')
const common = require('./webpack.common.js')

if (process.env.MODE === 'prod' && process.env.API_URL === undefined) {
  throw new Error('API_URL is not defined')
}

module.exports = merge(common, {
  mode: 'production'
})
