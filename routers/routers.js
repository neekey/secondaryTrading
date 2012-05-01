var DB = require( '../database/' );
var API = require( '../api/api.js' );
var Auth = require( '../auth/' );
var _ = require( 'underscore' );
var FS = require( 'fs' );
var Path = require( 'path' );
var IMG = require( '../image_handle' );

// 所有规则的目录路径
var ruleModulesPath = __dirname + '/rules/';

var Router ={
    index: {
        type: 'get',
        rule: '/',
        fn: function(req, res){

            var auth = new Auth();

            res.send( auth.ifLogin( req, res ) );
        }
    },

    /**
     * 文件上传
     */
    imageUpload: {
        type: 'post',
        rule: '/imageupload',
        // middleware: [ 'shouldLogin' ]
        fn: function( req, res ){
            
            var image = req.files.image;

//            image.length;
//            image.filename;
//            image.mime;
//            image.path;

            FS.rename( image.path, 'uploads/' + image.filename + '.jpg', function( err ){

                if( err ){
                    console.log( '重命名出错' );
                    console.log( err );
                }
                else {
                    console.log( '重命名成功' );
                }
            });
        }
    }
};

// 读取所有的route规则
var rulesFiles = FS.readdirSync( ruleModulesPath );

rulesFiles.forEach( function ( filePath ){

    // 只读取后缀为js的文件
    if( Path.extname( filePath ) === '.js' ){

        var ruleName = Path.basename( filePath, '.js' );
        Router[ ruleName ] = require( ruleModulesPath + ruleName).rule;
    }
});

module.exports = Router;