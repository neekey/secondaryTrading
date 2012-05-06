var DB = require( '../../database/' );
var API = require( '../../api/api.js' );

/**
 * @param {String} email 用户email
 * @param {String} id 用户id 若给定了id 则无视email
 * @type {Object}
 */
var register = {
    type: 'get',
    rule: '/userinfo',
//    middleware: [ 'shoulLogin' ],
    fn: function( req, res ){

        var User = new DB.user();

        var data = req.query;
        var email = data.email;
        var userId = data.id;
        var methodName;
        var methodParam;

        // 监听抛出的错误
        User.on( '_error', function( msg, error ){

            API.send( req, res, {
                result: false,
                type: 'userinfo',
                error: msg,
                data: error
            });
        });

        if( email === undefined && userId === undefined ){

            API.send( req, res, {
                result: false,
                type: 'userinfo',
                error: '必须制定用户id或者email'
            });

            return false;
        }
        else {

            methodName = ( userId === undefined ? 'get' : 'getById' );
            methodParam = ( userId === undefined ? email : userId );

            User[ methodName ]( methodParam, function ( user ){

                if( user ){

                    API.send( req, res, {
                        result: true,
                        type: 'userinfo',
                        data: user.toJSON()
                    });
                }
                else {

                    var errorMsg = userId === undefined ? 'email' : 'id';
                    errorMsg += '为: ' + methodParam + ' 的用户不存在';

                    API.send( req, res, {
                        result: false,
                        type: 'userinfo',
                        error: errorMsg
                    });
                }

            });
        }
    }
};

exports.rule = register;