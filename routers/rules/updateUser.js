var DB = require( '../../database/' );
var API = require( '../../api/api.js' );

/**
 * @param {String} email 用户email
 * @param {String} id 用户id 若给定了id 则无视email
 * @param {String} sex 用户性别
 * @param {String} location 用户的坐标 x,y
 * @param {String} address 用户地址
 * @param {String} cellphone 手机号
 * @param favorite 用户感兴趣的类别，用逗号隔开
 * @param {String} qq QQ号
 * @param {String} wangwang 旺旺号
 */
var register = {
    type: 'post',
    rule: '/updateuser',
//    middleware: [ 'shoulLogin' ],
    fn: function( req, res ){

        var User = new DB.user();

        var data = req.body;
        var email = data.email;
        var userId = data.id;
        var updateObj = {
            sex: data.sex,
            location: data.location ? data.location.split( ',' ) : undefined,
            address: data.address,
            cellphone: data.cellphone,
            favorite: data.favorite ? data.favorite.split( ',' ) : undefined,
            qq: data.qq,
            wangwang: data.wangwang
        };
        var methodName;
        var methodParam;

        // 监听抛出的错误
        User.on( '_error', function( msg, error ){

            API.send( req, res, {
                result: false,
                type: 'updateuser',
                error: msg,
                data: error
            });
        });

        if( email === undefined && userId === undefined ){

            API.send( req, res, {
                result: false,
                type: 'updateuser',
                error: '必须制定用户id或者email'
            });

            return false;
        }
        else {

            methodName = ( userId === undefined ? 'updateByEmail' : 'updateById' );
            methodParam = ( userId === undefined ? email : userId );

            User[ methodName ]( methodParam, updateObj, function ( user ){

                API.send( req, res, {
                    result: true,
                    type: 'updateuser',
                    data: user.toJSON()
                });
            });
        }
    }
};

exports.rule = register;