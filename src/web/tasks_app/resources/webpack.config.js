var path = require('path');
var dbxBazelUtils = require('dbx-bazel-utils');
var env = dbxBazelUtils.initBazelEnv(__dirname);

module.exports = {
  entry: ['index_body.jsx'],
  output: {
    filename: 'bundle.jsx',
    path: env.outputRoot,
  },
}