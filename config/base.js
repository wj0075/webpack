/*
webpack 通用配置
 */
const path = require('path');

module.exports = {
  // 多页配置
  isMultiplePage:true,
  // 是否启用异步加载功能
  isOpenSyncImport:true,
  // 最小chunk的大小
  minChunkSize:10000,
  // dev模式下是否自动打开页面
  autoOpenBrowser:true,
  // mock数据目录
    mockRoot:path.resolve(__dirname,'../mock'),
    // 文件目录
    assetsRoot:path.resolve(__dirname,'../src'),
    // 生成目录
    buildRoot:path.resolve(__dirname,'../dist'),
    // 静态资源根目录
    staticAssets:'static',
    // 生成路径
    publicPath:process.env.type == 'dev'?'/':'./',
    // 公用别名
    commonAlias:{
      '@':'pages',
        'assets':'assets',
        'vue$':'../node_modules/vue/dist/vue.esm.js'
    },
    // 外部扩展
    externals:{

    },
    // 公众模块（默认情况下common/js文件下的文件作为'commons chunk'打包）
    commons:{

    },
    // 要打包的外部资源库
    library:[
        'axios',
        'vue',
        'vue-router'
    ],
    // 要引进外部资源库的页面（为恐慌则全部引入）
    libraryEntry:[],
    // 本地开发端口
    port:8010,
    // 本地开发代理
    proxy:{

    }
};