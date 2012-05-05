var DB = require( '../../database/' );
var API = require( '../../api/api.js' );

/**
 * @param userid 用户id
 * @param email 用户的email
 * @param len 最多获取的item数量
 * @param fields 需要返回的字段
 * @return { items: [ 有len指定的item ], ids: [ 所有的结果item的_id值]
 */
var searchItem = {

    type: 'get',
    rule: '/sellinglist',
//        middleware: [ 'shouldLogin' ],

    fn: function ( req, res ){

        // 商品搜索query 直接使用js表达式，比如 'this.price > 200'
        var query = req.query;
        var queryObj = {};
        var queryField = undefined;
        var queryValue = undefined;
        var fields = query.fields ? query.fields.split( ',' ) : [];
        var userId = query.userid;
        var email = query.email;

        // 最多获取的items数量
        var maxLen = isNaN( parseInt( req.query.len ) ) ? 10 : parseInt( req.query.len );
        var itemHandle = new DB.item();
        var userHandle = new DB.user();
        var itemCount = 0;
        var _items = [];
        var _ids = [];

        itemHandle.on( '_error', function ( msg, error ){

            API.send( req, res, {
                result: false,
                type: 'sellinglist',
                error: msg,
                data: error
            });
        });

        userHandle.on( '_error', function ( msg, error ){

            API.send( req, res, {
                result: false,
                type: 'sellinglist',
                error: msg,
                data: error
            });
        });

        if( userId ){

            queryObj = {
                userId: userId
            };

            getItems( queryObj, fields );
        }
        else if( email ){

            // 现根据email获取userid
            userHandle.get( email, function ( user ){

                if( user && user._id ){

                    queryObj = {
                        userId: user._id
                    };

                    getItems( queryObj, fields );
                }
                else {

                    API.send( req, res, {
                        result: false,
                        type: 'sellinglist',
                        error: '无法找到email为：' + email + ' 的用户',
                        data: {
                            email: email
                        }
                    });
                }
            });
        }
        else {

            API.send( req, res, {
                result: false,
                type: 'sellinglist',
                error: '必须制定email或者userid'
            });
        }

        function getItems( queryObj, fields ){

            itemHandle.query( queryObj, fields, function ( items ){

                // items被json化后无法找到imgs成员
                // 先把每个item的数据部分转化出来
                items.forEach(function ( item ){

                    var _item = item.toJSON();

                    if( itemCount < maxLen ){

                        _item.imgs = item.imgs;
                        _item.user = item.user;

                        _items.push( _item );

                        itemCount++;
                    }

                    _ids.push( _item._id );
                });

                API.send( req, res, {
                    result: true,
                    type: 'sellinglist',
                    error: undefined,
                    data: {
                        items: _items,
                        ids: _ids
                    }
                });
            });

        }

    }
};

exports.rule = searchItem;