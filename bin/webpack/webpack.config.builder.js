const path = require('path');

const rootDir = path.resolve(__dirname, '../../../');
const srcDir = path.resolve(rootDir, 'frontend/src/');
const bundlesRelative = 'themes/qc4a/bundles/';
const bundlesDir = path.resolve(rootDir, 'public/', bundlesRelative);

function buildConfig(mode = 'development') {

    const useMinify = mode === 'production';

    const ext = useMinify ? 'min.js' : 'js';

    return {
        mode: mode,
        context: __dirname,
        entry: {
            'app': path.resolve(srcDir, 'main/index.js')
        },
        output: {
            path: bundlesDir,
            publicPath: bundlesRelative,
            filename: `[name].${ext}`,
            chunkFilename: `[name].chunk.${ext}`,
        },
        module: {
            rules: [
                {
                    test: /\.js$/,
                    use: [
                        {
                            loader: 'babel-loader',
                            options: {
                                presets: [
                                    "@babel/preset-env",
                                    "@babel/preset-react"
                                ],
                                plugins: [
                                    "transform-class-properties"
                                ]
                            }
                        }
                    ]
                },
                {
                    test: /\.css$/,
                    use: ['style-loader', 'css-loader'],
                },
                {
                    test: /\.less$/,
                    use: ['style-loader', 'css-loader?{"url":false}', 'less-loader'],
                },
            ],
        },
        optimization: {
            minimize: useMinify,
            splitChunks: {
                chunks: 'async', // all, async
                minSize: 0,
                maxSize: 0,
                minChunks: 1,
                maxAsyncRequests: 6,
                maxInitialRequests: 4,
                name: false,
                automaticNameDelimiter: '~',
                cacheGroups: {
                    vendor: {
                        test: /[\\/]node_modules[\\/]/,
                        priority: -10,
                        filename: `vendor.${ext}`
                    },
                    default: {
                        priority: -20,
                        reuseExistingChunk: true,
                        filename: `default.${ext}`
                    }
                }
            }
        },
        devtool: 'source-map'
    };

}

module.exports = buildConfig;
