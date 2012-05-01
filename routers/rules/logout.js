var API = require( '../../api/api.js' );
var Auth = require( '../../auth/' );

var logout = {
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
};

exports.rule = logout;