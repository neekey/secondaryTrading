var DB = require( '../../database/' );
var API = require( '../../api/api.js' );

var register = {
    type: 'post',
        rule: '/register',
        middleware: [ 'shouldNotLogin' ],
        fn: function( req, res ){

        var User = new DB.user();

        var data = req.body;
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
};

exports.rule = register;