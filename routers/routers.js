var DB = require( '../database/' );
var API = require( '../api/api.js' );
var Auth = require( '../auth/' );
var _ = require( 'underscore' );
var FS = require( 'fs' );
var MIME = require( '../mime' );

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
     * 用户登陆
     */
    login: {
        type: 'get',
        rule: '/login',
        middleware: [ 'shouldNotLogin' ],
        fn: function( req, res ){

            var auth = new Auth();

            var data = req.query;
            var email = data.email;
            var password = data.password;
            var options = data.options;

            auth.on( '_error', function( msg, error ){
                API.send( req, res, {
                    result: false,
                    type: 'login',
                    error: msg
                });
            });

            auth.login( req, res, email, password, function(){
                API.send( req, res, {
                    result: true,
                    type: 'login'
                });
            });
        }
    },

    /**
     * 注销
     */
    logout: {
        type: 'get',
        rule: '/logout',
        middleware: [ 'shouldLogin' ],
        fn: function( req, res ){
            var auth = new Auth();

            auth.logout( req, res );

            API.send( req, res, {
                result: true,
                type: 'logout'
            });
        }
    },

    /**
     * 检查用户是否已经登陆
     */
    checkAuth: {
        type: 'get',
        rule: '/checkauth',
        fn: function( req, res ){
            var auth = new Auth();

            if( auth.ifLogin( req, res ) ){

                API.send( req, res, {
                    result: true,
                    type: 'checkauth',
                    data: true
                });
            }
            else {

                API.send( req, res, {
                    result: true,
                    type: 'checkauth',
                    data: false
                });
            }
        }
    },

    /**
     * 注册新用户
     */
    register: {
        type: 'get',
        rule: '/register',
        middleware: [ 'shouldNotLogin' ],
        fn: function( req, res ){

            var User = new DB.user();

            var data = req.query;
            var email = data.email;
            var password = data.password;
            var options = data.options;

            // 监听抛出的错误
            User.on( '_error', function( msg, error ){

                API.send( req, res, {
                    result: false,
                    type: 'register',
                    error: msg,
                    data: error
                });
            });

            // 添加用户
            User.add( email, password, options, function( user ){

                API.send( req, res, {
                    result: true,
                    type: 'register',
                    data: user
                });
            });
        }
    },

    newItem: {
        type: 'post',
        rule: '/newItem',
        fn: function ( req, res ){

            var newImage = new DB.image();
            var body = req.body;

            var title = body.title;
            var desc = body.desc;
            var price = body.price;
            var latlng = body.latlng;
            var address = body.address;
            var pic1 = body.pic1;
            var pic2 = body.pic2;
            var pic3 = body.pic3;
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

module.exports = Router;