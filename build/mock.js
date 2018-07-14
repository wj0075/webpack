/*
* 生成数据
* */

const
    path = require('path'),
    fs = require('fs'),
    chalk = require('chalk'),
    config = require('../config').dev;
const p_aos_name = new Promise(resolve => {
   // 获取aos name的

   fs.readFile(path.resolve(__dirname,'../src/common/config/config.act.js'),(err,data) => {
   let aosName = data.toString().match(/aosName['": ]+([^'"]+)/);
   if(aosName) {
       resolve(aosName[1]);
   }
   })
});

const p_aos_data = new Promise(resolve => {
   // 获取aos link

   fs.readFile(path.resolve(__dirname,'../src/common/config/config.aos.js'),(err,data) => {

       let AOS_URL_GROUP = data.toString().match(/const(AOS_URL_GROUP[^;]+)/);
       if(AOS_URL_GROUP){
           eval(AOS_URL_GROUP);
           resolve(AOS_URL_GROUP)
       }
   })
});

Promise.all([p_aos_name,p_aos_data]).then(values =>{
    const aos_data = values[1];

    Object.keys(aos_data).forEach(key => {
        let _path = '';
        if(typeof aos_data[key] === 'string'){
            if(aos_data[key][0]!== '/') aos_data[key] = '/'+aos_data[key];
            _path = 'ws/oss/'+values[0]+aos_data[key]+'.json';
        }else {
            _path = aos_data[key].test.match(/[^\/][\/]([^\/].*)/);
            if(_path) _path = _path[1]+'.json';
        }

        _path && createFile(_path);
    })
} );


function createFile(_path) {
    let dir = '';

    const pathArray = _path.split('/');
    pathArray.forEach((item,index) => {
        dir += '/'+item;
        if(!fs.existsSync(path.resolve(config.mockRoot,'aos',dir.substring(1)))){
            if(index<pathArray.length-1){
                fs.mkdirSync(path.resolve(config.mockRoot,'aos',dir.substring(1)));
            }else {
                fs.writeFile(path.resolve(config.mockRoot,'aos',dir.substring(1)),`{"code":"1"}`,(err) => {
                    if(!err){
                        console.log(chalk.green('add mock: '+dir))
                    }
                })
            }

        }
    })
}