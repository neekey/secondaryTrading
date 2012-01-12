
/*
 * GET home page.
 */

var DB = require( '../database/' );
var API = require( '../api/api.js' );
var Auth = require( '../auth/' );

module.exports = {
    init: function( app ){

        var rName, r, type, rule, handler;

        for( rName in Router ){

            r = Router[ rName ];
            type = r.type;
            rule = r.rule;
            handler = r.fn;

            if( typeof app[ type ] === 'function' ){

                app[ type ]( rule, handler );
            }
        }
    }
};

var Router ={
    index: {
        type: 'get',
        rule: '/',
        fn: function(req, res){

            var auth = new Auth();

            res.send( auth.ifLogin( req, res ) );
        }
    },

    login: {
        type: 'get',
        rule: '/login',
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

    register: {
        type: 'get',
        rule: '/register',
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
                    error: 'register failed',
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