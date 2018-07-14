const
    path = require('path'),
    webpack = require('webpack'),
    webpackMerge = require('webpack-merge');
ZipPlugin = require('zip-webpack-plugin');

const
    HtmlWebpackPlugin = require('html-webpack-plugin'),
    OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin'),
    CopyWebpackPlugin = require('copy-webpack-plugin'),
    CompressionWebpackPlugin = require('compression-webpack-plugin'),
    BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin,
    UglifyJSPlugin = require('uglifyjs-webpack-plugin');

const
    baseWebpackConfig = require('./webpack.base.config')(false),
    {nowConfig,commonChunkName} = require('./util');

const config = nowConfig();

const commonsChunk = commonChunkName();

module.exports = function (branch, commitHash) {
    return webpackMerge(baseWebpackConfig,{
        devtool:config.sourceMap || false,

        plugins:[
            // 环境变量
            new webpack.DefinePlugin({
                'process.evn':config.env
            }),

            // banner条
            new webpack.BannerPlugin('版权归王坚所有'),

            // 压缩css
            new OptimizeCSSPlugin({
                cssProcessorOptions:{
                    safe: true
                }
            }),

            // 变量提升

            new webpack.optimize.ModuleConcatenationPlugin(),

            // 压缩代码

            new UglifyJSPlugin({
                compress:{
                    warning:false
                },
                sourceMap:true
            }),

            // 拷贝静态资源

            new CopyWebpackPlugin([
                {
                    from: path.join(config.assetsRoot, config.staticAssets),
                to: path.join(config.buildRoot,config.staticAssets)
                }
            ])

            // bundle 分析
            // newBundleAnalyzerPlugin()


        ].concat(config.template.map(template => {
            let chunkName = template.split(path.sep).slice(-2)[0];

            return new HtmlWebpackPlugin({
                filename:chunkName+'.html',
                template:template,
                chunks:[chunkName].concat(commonChunkName),
                inject:true,
                minify:{
                    removeComments:true,
                    collapseWhitespace:true,
                    removeAttributeQuotes:true
                },
                showErrors:true,
                chunksSortMode:function (chunk1, chunk2) {
                    let
                        entrys = Object.keys(config.entry),
                        vendors = commonsChunk;

                    let
                        orders = ['manifest'].concat(vendors,entrys),
                        order1 = orders.indexOf(chunk1.names[0]),
                        order2 = orders.indexOf(chunk2.names[0]);


                    if(order1 > order2){
                        return 1;
                    }else if(order1 < order2){
                        return -1;
                    }else {
                        return 0;
                    }
                }

            });

        })).concat(new ZipPlugin({
            // OPTIONAL:defaults to the Webpack output path (above)
            // can be relative (to Webpack output path) or absolute
            path:path.resolve(__dirname,'../products'),

            // OPTIONAL:defaults to the Webpack output filename (above) or,
            // if not present,the basename of the path

            filename:`${branch}-${commitHash}-release.zip`,
            fileOptions:{

                mtime:new Date(),
                mode:0o100664,
                compress:true,
                forceZip64Format:false
            }


        }))

    })
}