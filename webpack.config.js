const path = require('path')

module.exports = {
    //mode: 'development',
    entry: './public/index.js',
    //devtool: 'inline-source-map',
    output: {
        path: path.resolve(__dirname, 'public'),
        filename: 'bundle.js'
    }
}