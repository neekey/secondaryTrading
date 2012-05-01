var API = require( '../../api/api.js' );
var Auth = require( '../../auth/' );

var checkAuth = {
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
};

exports.rule = checkAuth;