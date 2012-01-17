/**
 * 路由中间件
 */
var DB = require( '../database/' );
var API = require( '../api/api.js' );
var Auth = require( '../auth/' );
var _ = require( 'underscore' );
var Session = require( '../session' );

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
    },

    /**
     * 从请求中查看是否含有sessionId，如果没有则新建session数据，并实例化
     * @param req
     * @param res
     * @param next
     */
    sessionHandle: function( req, res, next ){

        var sessionId, resSession = {};

        // 从get请求或者post中获取session信息
        if( !( req.method === 'GET' ) ){

            if( req.body[ Session.fieldId ] ){

                sessionId = req.body[ Session.fieldId ];
            }

            if( req.body[ Session.resFieldId ] ){

               resSession = JSON.parse( req.body[ Session.resFieldId ] );
            }
        }
        else if( req.query ){

            if( req.query[ Session.fieldId ] ){

                sessionId = req.query[ Session.fieldId ];
            }

            if( req.query[ Session.resFieldId ] ){

                resSession = JSON.parse( req.query[ Session.resFieldId ] );
            }
        }

        // 回去session实例对象，若不存在，则新建立一个
        req.STSession = Session.getInstance( sessionId );

        if( !req.STSession ){

            sessionId = Session.newSession();
            req.STSession = Session.getInstance( sessionId );
        }
        
        // 更新过期时间
        Session.updateTimer( sessionId );

        // 设置session数据
        resSession = resSession || {};

        req.RESSession = _.clone( resSession );
        res.RESSession = _.clone( resSession );
        
        next();
    }
};

module.exports = MiddleWare;