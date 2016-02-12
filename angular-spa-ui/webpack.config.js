var webpack = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var CommonsChunkPlugin = webpack.optimize.CommonsChunkPlugin;
var path = require('path');
//var AngularPlugin = require('angular-webpack-plugin');

var ENV_DEV = process.env.NODE_ENV === 'Development';

module.exports = {
    context: __dirname,
    entry: {
        search: path.resolve(__dirname, './js/search-app/search-app.js'),
        admin: path.resolve(__dirname, './js/admin-app/admin-app.js'),
        vendor: [
            'underscore',
        ]
    },
    output: {
        path: path.resolve(__dirname, './build/scripts'),
        filename: '[name].bundle.js'
    },
    module: {
        loaders: [
            {
                test: /\.woff(\?v=\d+\.\d+\.\d+)?$/,
                loader: "url?limit=10000&mimetype=application/font-woff"
            },
            {
                test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/,
                loader: "url?limit=10000&mimetype=application/font-woff"
            },
            {
                test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
                loader: "url?limit=10000&mimetype=application/octet-stream"
            },
            {
                test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
                loader: "file"
            },
            {
                test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
                loader: "url?limit=10000&mimetype=image/svg+xml"
            },
            {
                test: /\.js$/,
                loader: 'babel?presets[]=es2015'
            }
//            {
//                test: "\.jpg$",
//                loader: "file-loader"
//            },
//            {
//                test: "\.png$",
//                loader: "url-loader?mimetype=image/png"
//            }
        ]
    },
    plugins: [

        new webpack.ProvidePlugin({
            _: 'underscore'
//                angular: 'exports?window.angular!angular'
        }),
        new CommonsChunkPlugin('vendor', 'vendor.js'),
        new ExtractTextPlugin('../styles/styles.css', {
            allChunks: true
        })
    ],
    resolve: {
        root: path.resolve(__dirname, './js'),
        extensions: ['', '.js']
    },
    watch: ENV_DEV,
    watchOptions: {
        aggregateTimeout: 100
    },
    devtool: (ENV_DEV ? 'source-map' : null)
};

if (!ENV_DEV) {
    module.exports.plugins.push(new webpack.optimize.UglifyJsPlugin({
        compress: {
            warnings: false
        },
        mangle: false,
        exclude: /.\.min\.js$/i
    }));
}
