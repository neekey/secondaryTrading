var DB = require( '../../database/' );
var API = require( '../../api/api.js' );
var Auth = require( '../../auth/' );

/**
 * 用户购买行为的埋点记录
 * @param id item的id
 */
var img = {
    type: 'get',
    rule: '/userbuyrecord',
    middleware: [ 'shouldLogin' ],
    fn: function( req, res ){

        var data = req.query;
        var itemId = data.id;
        var itemHandle = new DB.item();
        var userHandle = new DB.user();
        var auth = new Auth();
        var userInfo = auth.getAuthInfo( req );

        itemHandle.on( '_error', function ( msg, error ){

            API.send( req, res, {
                result: false,
                type: 'userbuyrecord',
                error: msg,
                data: error
            });
        });

        userHandle.on( '_error', function ( msg, error ){

            API.send( req, res, {
                result: false,
                type: 'userbuyrecord',
                error: msg,
                data: error
            });
        });

        if( itemId ){

            itemHandle.getById( itemId, function( item ){

                userHandle.addBuyRecord( userInfo.email, item.category, function( user ){

                    API.send( req, res, {
                        result: true,
                        type: 'userbuyrecord'
                    });
                });
            });
        }
        else {

            API.send( req, res, {
                result: false,
                type: 'userbuyrecord',
                error: '必须制定itemid'
            });
        }
    }
};

exports.rule = img;