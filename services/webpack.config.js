var path = require('path');
var ExtractTextPlugin = require("extract-text-webpack-plugin");
var CopyWebpackPlugin = require('copy-webpack-plugin');
var extractCSS = new ExtractTextPlugin('[name].css');

module.exports = {
    entry: "./app/app.js",
    output: {
        path: __dirname + "/build/",
        filename: "build.js"
    },
    module: {
        loaders: [{
            test: /\.js$/,
            loader: 'babel-loader',
            query: {
                presets: ['es2015', 'react']
            }
        }, {
            test: /\.scss$/i,
            loader: extractCSS.extract(['css','sass', "autoprefixer"])
        },{
            test: [/\.html$/, /\.temp$/],
            loader: "html-loader"
        }]
    },
    "blacklist": [
        "useStrict"
    ],
    plugins: [
        extractCSS,
        new CopyWebpackPlugin([
            { from: 'app/imgs', to: 'imgs' }
        ])
    ]
};