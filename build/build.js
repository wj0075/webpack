const
    path = requrie('path'),
    ora = require('ora'),
    rm = require('rimraf');

process.env.type = 'prod';

const config = require('../config');

process.env.NODE_ENV = JSON.parse(config.build.env.NODE_ENV);

const webpackConfig = require('./webpack.prod.config');
const simpleGit = require('simple-git')();

let webpackCompile = require('./util').webpackCompile;

let spinner = ora('buildding for production...\n');

spinner.start();

rm(config.build.buildRoot,err => {
   if(err) throw err;
   spinner.text = 'webpacl buuld...';
   simpleGit.branch((err,brachchObj) => {
        let branch = brachchObj.current;
        let commitHash = brachchObj.branches[branch].commit;

        console.log('本次打包的项目名称'+branch);
        console.log('最后提交的git版本号为' + commitHash);

        webpackCompile(webpackConfig(branch,commitHash),() => {
            spinner.stop();
        })
   })
});