var DB = require( '../database/' );
var API = require( '../api/api.js' );
var Auth = require( '../auth/' );
var _ = require( 'underscore' );

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
    }
};

module.exports = Router;