/**
 * 路由中间件
 */
var DB = require( '../database/' );
var API = require( '../api/api.js' );
var Auth = require( '../auth/' );
var _ = require( 'underscore' );

var MiddleWare = {

    shouldNotLogin: function( req, res, next ){

        var auth = new Auth();
        var authInfo;

        if( auth.ifLogin( req ) ){

            var authInfo = auth.getAuthInfo( req );

            API.send( req, res, {
                result: false,
                type: 'register|login',
                error: '您已经登陆为用户：' + authInfo.email
            });
        }
        else {
            next();
        }
    },

    shouldLogin: function( req, res, next ){

        var auth = new Auth();

        if( !auth.ifLogin( req ) ){

            API.send( req, res, {
                result: false,
                type: 'register|login',
                error: '您尚未登陆'
            });
        }
        else {
            next();
        }
    }
};

module.exports = MiddleWare;