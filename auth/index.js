/**
 * 用户权限验证相关
 */

var Util = require( 'util' );
var _ = require( 'underscore' );
var EventEmitter = require('events').EventEmitter;
var DB = require( '../database/' );

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

    /**
     * 设置session
     * @param req
     * @param res
     * @param email
     */
    setSession: function( req, res, email ){

        var instance = req.STSession;

        var session = {
            email: email,
            serial: this.serial()
        };

        instance.set( session );

        // 设置返回给客户端的session
        res.RESSession = _.extend( res.RESSession, session );
        
        this.updateSession( req, res );
    },

    /**
     * 更新session（更新token）
     * @param req
     * @param res
     */
    updateSession: function( req, res ){

        var instance = req.STSession;

        instance.set( 'token', this.token() );
        res.RESSession[ 'token' ] = instance.get( 'token' );
    },

    /**
     * 检查是否已经登陆
     * @param req
     */
    ifLogin: function( req ){

        var resSession = req.RESSession;
        var email = resSession.email;
        var serial = resSession.serial;
        var token = resSession.token;
        var sessionInstance = req.STSession;

        if( email === undefined || serial === undefined || token === undefined ||
            email !== sessionInstance.get( 'email' ) ||
            serial !== sessionInstance.get( 'serial' ) ||
            token !== sessionInstance.get( 'token' ) ){

            return false;
        }
        else {
            return true;
        }
    },

    /**
     * 用户注销登陆
     * @param req
     * @param res
     */
    logout: function( req, res ){

        req.STSession.destroy();
        delete res.RESSession[ 'email' ];
        delete res.RESSession[ 'serial' ];
        delete res.RESSession[ 'token' ];
    },

    token: function(){
        return 'token_' + Date.now();
    },

    serial: function(){
        return 'serial_' + Date.now();
    },

    getAuthInfo: function( req ){

        var instance = req.STSession;

        return {
            email: instance.get( 'email' ),
            serial: instance.get( 'serial' ),
            token: instance.get( 'token' )
        };
    }
});

module.exports = Auth;