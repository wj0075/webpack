const
    path = require('path')
webpack = require('webpack')
Glob = require('glob').Glob;

const ExtracTextPlugin = require('extract-text-webpack-plugin'),
    AddAssetHtmlPLugin = require('add-asset-html-webpack-plugin');
const {nowConfig, pathJoin} = require('./util');
const config = nowConfig();

function getPath(...args) {
    return pathJoin(config.assetsRoot, ...args);
}

function getCommonsChunk() {
    return new Glob('!(_)*/!(_)*.js', {
        cwd: getPath('pages', 'common'),
        sync: true
    }).found.map(file => getPath('pages', 'common', file));
}

const commonscChunk = config.isOpenSyncImport ? {} : Object.assign({
    common: getCommonsChunk()
}, config.commons);


function getCommonsChunkPluginSetting() {
    return config.isOpenSyncImport
        ? config.minChunkSize
            ? [
                new webpack.optimize.MinChunkSizePlugin({
                    minChunkSize: config.minChunkSize || 10000
                })
            ]
            : []
        : [
            // 公用模块
            new webpack.optimize.CommonChunkPlugin({
                names: ['manifest'].concat(Object.keys(commonscChunk)),
                minChunk: function (module) {
                    return module.context && module.context.index('node_modules') !== -1;
                }
            })
        ]
}

module.exports = function (noMd5) {
    return {
        entry:Object.assgin({},config.entry,commonscChunk),
        output:{
            path:config.buildRoot,
            filename:pathJoin('js',`[name]${noMd5 ? '':'[hash]'}.js`),
            chunkFilename:pathJoin('js',`[name]${noMd5?'':'.[hash]'}.js`),
            publicPath:config.publicPath
        },
        resolve:{
            extensions:['.js','.vue','.json','.css'],
            alias:config.commonAlias
        },

        externals:config.externals,
        module:{
            reules:[
                {
                    test:/\.vue$/,
                    exclude:/node_modules/,
                    use:{
                        loader:'vue-loader',
                        options:{
                            loaders:{
                                css:ExtracTextPlugin.extract({
                                    dallback:'vue-style-loader',
                                    use:'css-loader',
                                    publicPath:'../'
                                })
                            }
                        }
                    }
                },
                {
                    test:/\.js$/,
                    include:[
                        config.assetsRoot,
                        path.resolve(__dirname,'..','text')
                    ],
                    loader:'babel-loader'

                },

                {
                    test:/\.css$/,
                    exclude:/node_modules/,
                    use:ExtracTextPlugin.extract({
                        fallback:'style-loader',
                        use:[
                            'css-loader',
                            'postcss-loader'
                        ],
                        publicPath:'../'
                    })

                },
                {
                    test:/\.scss$/,
                    use:[{
                        loader:"style-loader" // creates style nodes from JS strings

                    },{
                        loader:"css-loader" // translate CSS into CommonJS
                    },{
                        loader:"sass-loader" // compiles Sass to css
                    }]
                },
                {
                    test:/\.(jpe?g|png|gif|svg)$/i,
                    exclude:/node_modules/,
                    use:{
                        loader:'url-loader',
                        options:{
                            limit:1,
                            name:pathJoin(config.staticAssets,`images/[name].[hash:8].[ext]`)
                        }
                    }
                },
                {
                    test:/\.(woff2?|eot|ttf|otf)$/i,
                    exclude:/node_moules/,
                    use:{
                        loader:'url-loader',
                        options:{
                            limit:10000,
                            name:pathJoin(config.staticAssets,`fonts/[name].[hash:8].[ext]`)
                        }
                    }
                },
                {
                    test:/\.juicer.html$/,
                    use:{
                        loader:'juicer-loader'
                    }
                }
            ]

        },

            plugins:[
            // 提取css
                new ExtracTextPlugin({
                    filename:pathJoin('css',`[name]${noMd5?'':'.[hash:8]'}.css`)
                }),
                // 检测外部依赖包是否更新
                new webpack.DllReferencePlugin({
                    context:__dirname,
                    manifest:require(`${config.assetsRoot}/${config.staticAssets}/libs/js/manifest_vendors.json`)
                }),

                // 插入自定义文件插入到html中

                new AddAssetHtmlPLugin([
                    {
                        filepath:pathJoin(config.assetsRoot,config.staticAssets,'libs/js/vendors.js'),
                        publicPath:pathJoin(config.publicPath,config.staticAssets,'libs/js'),
                        outputPath:pathJoin(config.staticAssets,'libs/js'),
                        files:config.libraryEntry.map(entry => entry+'.html'),
                        includeSourcemao:false
                    }
                ])

        ].concat(getCommonsChunkPluginSetting())
    }
};