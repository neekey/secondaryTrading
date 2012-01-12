/**
 * 用户权限验证相关
 */

var Util = require( 'util' );
var _ = require( 'underscore' );
var EventEmitter = require('events').EventEmitter;
var DB = require( '../database/' );

var CookiePath = { path: CookiePath };

var Auth = function(){

    EventEmitter.call( this );
};

Util.inherits( Auth, EventEmitter );

_.extend( Auth.prototype, {

    /**
     * 用户登陆
     * @param email
     * @param password
     * @param next
     */
    login: function( req, res, email, password, next ){

        var User = new DB.user();
        var that = this;

        User.on( '_error', function( msg, error ){

            that.emit( '_error', '用户查找出错' );
        });
        
        User.get( email, function( user ){

            if( !user || ( password !== user.password ) ){

                that.emit( '_error', '用户名和密码不匹配' );
            }
            else {

                that.setSession( req, res, email );
                next();
            }
        });
    },

    setSession: function( req, res, email ){

        req.session.email = email;
        req.session.serial = this.serial();

        res.cookie( 'email', email, { path: CookiePath } );
        res.cookie( 'serial', req.session.serial );
        this.updateSession( req, res );
    },

    updateSession: function( req, res ){

        req.session.token = this.token();
        res.cookie( 'token', req.session.token );
    },

    ifLogin: function( req ){
        var Cookies = req.cookies;
        var email = Cookies.email;
        var serial = Cookies.serial;
        var token = Cookies.token;
        var sessions = req.session;

        if( email === undefined || serial === undefined || token === undefined ||
            email !== sessions.email || serial !== sessions.serial || token !== sessions.token ){

            return false;
        }
        else {
            return true;
        }
    },

    logout: function( req, res ){
        req.session.destroy();
        res.clearCookie( 'email', { path: CookiePath } );
        res.clearCookie( 'serial', { path: CookiePath } );
        res.clearCookie( 'token', { path: CookiePath } );
    },

    token: function(){
        return 'token_' + Date.now();
    },

    serial: function(){
        return 'serial_' + Date.now();
    }
});

module.exports = Auth;