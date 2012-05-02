var API = require( '../../api/api.js' );
var Auth = require( '../../auth/' );

var login = {
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
                error: msg,
                data: error
            });
        });

        auth.login( req, res, email, password, function(){
            API.send( req, res, {
                result: true,
                type: 'login'
            });
        });
    }
};

exports.rule = login;