const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

let config = {
    entry: path.resolve(__dirname, './src/index.js'),
    output: {
        filename: 'fingertree.js',
        libraryTarget: 'commonjs2',
        path: path.resolve(__dirname, 'build')
    },
    module: {
        rules: [{
            test: /\.js$/,
            exclude: /(node_modules)/,
            use: {
                loader: 'babel-loader',
                options: {
                    presets: [
                        '@babel/preset-env',
                        {
                            plugins: [
                                '@babel/plugin-proposal-class-properties'
                            ]
                        }
                    ]
                }
            }
        }]
    },
    resolve: {
        extensions: ['.js'],
    },
    plugins: [
        new CleanWebpackPlugin()
    ]
};

module.exports = (env, argv) => {
    if (argv.mode === 'development') {
        config.devtool = 'source-map';
    }
    return config;
};
